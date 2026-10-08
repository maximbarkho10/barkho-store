const Stripe = require("stripe");
const PRODUCTS = require("../../products.js");

const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;

// Shipping regions. The customer picks one in the cart; Stripe then only
// accepts addresses in that region's countries and charges its flat fee (NOK).
const SHIPPING_REGIONS = {
  europe: {
    countries: ["NO", "SE", "DK", "FI", "DE", "NL", "GB", "US"],
    feeNok: 99,
    label: "Standard shipping",
    days: [5, 12],
  },
  middleeast: {
    countries: ["AE", "SA", "JO", "QA", "KW", "TR"],
    feeNok: 179,
    label: "International shipping (Middle East)",
    days: [10, 25],
  },
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  if (!stripe) {
    console.error("STRIPE_SECRET_KEY is not set in Netlify environment variables");
    return { statusCode: 500, body: "Server config error: STRIPE_SECRET_KEY is missing" };
  }

  // Netlify sets URL automatically; SITE_URL (if set) wins. Fall back to the request origin.
  const siteUrl = (
    process.env.SITE_URL ||
    process.env.URL ||
    (event.headers && (event.headers.origin || `https://${event.headers.host}`)) ||
    ""
  ).replace(/\/+$/, "");

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

  const region = SHIPPING_REGIONS[payload.region] ? payload.region : "europe";
  const ship = SHIPPING_REGIONS[region];

  const cartForMetadata = cart.map((l) => ({ id: l.id, size: l.size, qty: l.qty }));

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${siteUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/cancel.html`,
      shipping_address_collection: { allowed_countries: ship.countries },
      shipping_options: [
        {
          shipping_rate_data: {
            display_name: ship.label,
            type: "fixed_amount",
            fixed_amount: { amount: ship.feeNok * 100, currency: "nok" },
            delivery_estimate: {
              minimum: { unit: "business_day", value: ship.days[0] },
              maximum: { unit: "business_day", value: ship.days[1] },
            },
          },
        },
      ],
      custom_text: {
        submit: {
          message: `By paying you accept our Terms of Sale: ${siteUrl}/terms.html`,
        },
      },
      metadata: {
        cart: JSON.stringify(cartForMetadata),
        region,
      },
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error("Stripe session error:", err);
    // Show the real reason (safe in test mode; Stripe messages never contain keys)
    return { statusCode: 500, body: `Could not create checkout session: ${err.message}` };
  }
};
