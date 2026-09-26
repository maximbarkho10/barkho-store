const Stripe = require("stripe");
const PRODUCTS = require("../../products.js");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Countries Stripe will collect a shipping address for at checkout.
// Add/remove ISO country codes to match where you're willing to ship.
const SHIPPING_COUNTRIES = ["NO", "SE", "DK", "FI", "DE", "NL", "GB", "US"];

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  const cart = Array.isArray(payload.cart) ? payload.cart : [];
  if (cart.length === 0) {
    return { statusCode: 400, body: "Cart is empty" };
  }

  const line_items = [];
  for (const line of cart) {
    const product = PRODUCTS.find((p) => p.id === line.id);
    if (!product) {
      return { statusCode: 400, body: `Unknown product: ${line.id}` };
    }
    const sizeInfo = product.sizes[line.size];
    if (!sizeInfo) {
      return { statusCode: 400, body: `Unknown size "${line.size}" for ${line.id}` };
    }
    const qty = Number.isInteger(line.qty) && line.qty > 0 ? line.qty : 1;

    line_items.push({
      quantity: qty,
      price_data: {
        currency: "nok",
        unit_amount: Math.round(product.priceNok * 100),
        product_data: {
          name: `${product.name} — ${line.size}`,
        },
      },
    });
  }

  const cartForMetadata = cart.map((l) => ({ id: l.id, size: l.size, qty: l.qty }));

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${process.env.SITE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL}/cancel.html`,
      shipping_address_collection: { allowed_countries: SHIPPING_COUNTRIES },
      metadata: {
        cart: JSON.stringify(cartForMetadata),
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error("Stripe session error:", err);
    return { statusCode: 500, body: "Could not create checkout session" };
  }
};
