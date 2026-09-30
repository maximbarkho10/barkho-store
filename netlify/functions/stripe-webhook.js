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
      if (!sizeInfo || !sizeInfo.syncVariantId) {
        console.error(
          `Missing Printful variant id for ${line.id} / ${line.size} — ` +
          `replace the placeholder in products.js with the real variant id.`
        );
        continue;
      }
      printfulItems.push({ sync_variant_id: sizeInfo.syncVariantId, quantity: line.qty });
    }

    let printfulOrderId = null;

    if (printfulItems.length > 0) {
      const printfulRes = await fetch("https://api.printful.com/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
        },
        body: JSON.stringify({
          external_id: session.id,
          recipient: {
            name: shipping.name || customer.name || "",
            address1: address.line1 || "",
            address2:
