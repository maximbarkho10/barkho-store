const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");
const PRODUCTS = require("../../products.js");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

exports.handler = async (event) => {
  const sig = event.headers["stripe-signature"];
  const rawBody = event.isBase64Encoded ? Buffer.from(event.body, "base64") : event.body;

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature check failed:", err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  if (stripeEvent.type !== "checkout.session.completed") {
    return { statusCode: 200, body: "ok" };
  }

  const session = stripeEvent.data.object;

  try {
    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ["customer_details"],
    });

    const cart = JSON.parse(fullSession.metadata.cart || "[]");
    const shipping = fullSession.shipping_details || fullSession.shipping || {};
    const address = shipping.address || {};
    const customer = fullSession.customer_details || {};

    const printfulItems = [];
    for (const line of cart) {
      const product = PRODUCTS.find((p) => p.id === line.id);
      const sizeInfo = product && product.sizes[line.size];
      if (!sizeInfo || !sizeInfo.printfulVariantId) {
        console.error(
          `Missing Printful variant id for ${line.id} / ${line.size} — ` +
          `replace the placeholder in products.js with the real variant id.`
        );
        continue;
      }
      printfulItems.push({ variant_id: sizeInfo.printfulVariantId, quantity: line.qty });
    }

    let printfulOrderId = null;

    if (printfulItems.length > 0) {
      const printfulRes = await fetch("https://api.printful.com/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
          "X-PF-Store-Id": process.env.PRINTFUL_STORE_ID,
        },
        body: JSON.stringify({
          external_id: session.id,
          recipient: {
            name: shipping.name || customer.name || "",
            address1: address.line1 || "",
            address2: address.line2 || "",
            city: address.city || "",
            state_code: address.state || "",
            country_code: address.country || "",
            zip: address.postal_code || "",
            email: customer.email || "",
          },
          items: printfulItems,
        }),
      });

      if (!printfulRes.ok) {
        const errText = await printfulRes.text();
        throw new Error(`Printful order creation failed: ${errText}`);
      }

      const printfulData = await printfulRes.json();
      printfulOrderId = printfulData.result && printfulData.result.id;
    } else {
      console.error(`No fulfillable items for session ${session.id} — order NOT sent to Printful.`);
    }

    const { error: dbError } = await supabase.from("orders").insert({
      stripe_session_id: session.id,
      customer_email: customer.email,
      customer_name: shipping.name || customer.name,
      shipping_address: address,
      items: cart,
      amount_total: fullSession.amount_total ? fullSession.amount_total / 100 : null,
      currency: fullSession.currency,
      printful_order_id: printfulOrderId,
      status: printfulOrderId ? "sent_to_printful" : "needs_attention",
    });

    if (dbError) {
      console.error("Supabase insert error:", dbError);
    }

    return { statusCode: 200, body: "ok" };
  } catch (err) {
    console.error("Error handling checkout.session.completed:", err);
    return { statusCode: 500, body: "Internal error" };
  }
};
