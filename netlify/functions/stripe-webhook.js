const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");
const PRODUCTS = require("../../products.js");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

exports.handler = async (event) => {
  const sig = event.headers["stripe-signature"];
  const rawBody = event.isBase64Encoded ? Buffer.from(event.body, "base64") : event.body;

  // 1) Verify the request really comes from Stripe
  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature check failed:", err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  if (stripeEvent.type !== "checkout.session.completed") {
    return { statusCode: 200, body: "ignored" };
  }

  const session = stripeEvent.data.object;

  try {
    // 2) Stripe may send the same event more than once — skip if already saved
    const { data: existing, error: lookupError } = await supabase
      .from("orders")
      .select("id")
      .eq("stripe_session_id", session.id)
      .maybeSingle();
    if (lookupError) throw new Error(`Supabase lookup failed: ${lookupError.message}`);
    if (existing) {
      console.log(`Order ${session.id} already saved — skipping`);
      return { statusCode: 200, body: "already processed" };
    }

    // 3) Read full session details
    const fullSession = await stripe.checkout.sessions.retrieve(session.id);
    const cart = JSON.parse((fullSession.metadata && fullSession.metadata.cart) || "[]");
    const shipping =
      fullSession.shipping_details ||
      (fullSession.collected_information && fullSession.collected_information.shipping_details) ||
      {};
    const address = shipping.address || {};
    const customer = fullSession.customer_details || {};

    // 4) Save the order in Supabase first (so it's never lost)
    const { data: inserted, error: insertError } = await supabase
      .from("orders")
      .insert({
        stripe_session_id: session.id,
        customer_email: customer.email || null,
        customer_name: shipping.name || customer.name || null,
        shipping_address: address,
        items: cart,
        amount_total: (fullSession.amount_total || 0) / 100,
        currency: fullSession.currency,
        status: "paid",
      })
      .select("id")
      .single();
    if (insertError) throw new Error(`Supabase insert failed: ${insertError.message}`);

    // 5) Build Printful items from the trusted catalog
    const printfulItems = [];
    for (const line of cart) {
      const product = PRODUCTS.find((p) => p.id === line.id);
      const sizeInfo = product && product.sizes[line.size];
      if (!sizeInfo || !sizeInfo.syncVariantId) {
        console.error(`Missing Printful sync variant id for ${line.id} / ${line.size}`);
        continue;
      }
      printfulItems.push({ sync_variant_id: sizeInfo.syncVariantId, quantity: line.qty || 1 });
    }

    // 6) Create the Printful order as a DRAFT (no confirm=true → nothing is charged or printed)
    let printfulOrderId = null;
    let status = "paid";

    if (printfulItems.length === 0) {
      status = "printful_no_items";
    } else {
      const printfulRes = await fetch("https://api.printful.com/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
        },
        body: JSON.stringify({
          // Printful allows max 32 characters here
          external_id: session.id.slice(-32),
          recipient: {
            name: shipping.name || customer.name || "",
            address1: address.line1 || "",
            address2: address.line2 || "",
            city: address.city || "",
            state_code: address.state || "",
            country_code: address.country || "",
            zip: address.postal_code || "",
            email: customer.email || "",
            phone: customer.phone || "",
          },
          items: printfulItems,
        }),
      });

      const printfulData = await printfulRes.json().catch(() => ({}));
      if (printfulRes.ok && printfulData.result) {
        printfulOrderId = String(printfulData.result.id);
        status = "sent_to_printful";
      } else {
        console.error("Printful order failed:", printfulRes.status, JSON.stringify(printfulData));
        status = "printful_failed";
      }
    }

    // 7) Update the saved order with the Printful result
    const { error: updateError } = await supabase
      .from("orders")
      .update({ printful_order_id: printfulOrderId, status })
      .eq("id", inserted.id);
    if (updateError) console.error("Supabase update failed:", updateError.message);

    console.log(`Order ${session.id} saved — status: ${status}, printful: ${printfulOrderId}`);
    return { statusCode: 200, body: "ok" };
  } catch (err) {
    console.error("Webhook processing error:", err);
    // 500 tells Stripe to retry later
    return { statusCode: 500, body: `Webhook processing error: ${err.message}` };
  }
};
