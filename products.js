/**
 * BARKHO — product catalog (single source of truth)
 *
 * This file is loaded two ways:
 *  1. In the browser via <script src="products.js"></script>  -> sets window.PRODUCTS
 *  2. In Netlify Functions via require('../../products.js')   -> module.exports
 *
 * IMPORTANT: priceNok is the ONLY price the server trusts. Never trust a
 * price sent from the browser — always look it up here by product id.
 *
 * syncVariantId values below are PLACEHOLDERS. These must be SYNC variant
 * IDs — the ID of a variant inside a product you've created in your own
 * Printful store (My products), with your design already attached. Get
 * them from GET /store/products/{id} in the Printful API, or from your
 * dashboard product's URL/details after you create and publish it. A
 * generic catalog variant ID (from the Catalog API) will NOT work here —
 * it has no design attached and would ship a blank item.
 */

const PRODUCTS = [
  {
    id: "wordmark-tee-blue",
    name: "BARKHO Wordmark Tee — Blue",
    description: "Heavyweight cotton tee with the core emblem across the chest.",
    priceNok: 349,
    color: "#2440E0",
    sizes: {
      S: { syncVariantId: 0 },
      M: { syncVariantId: 0 },
      L: { syncVariantId: 0 },
      XL: { syncVariantId: 0 },
    },
  },
  {
    id: "wordmark-tee-white",
    name: "BARKHO Wordmark Tee — White",
    description: "Same cut, inverted colorway. Heavyweight cotton.",
    priceNok: 349,
    color: "#EFEAE0",
    sizes: {
      S: { syncVariantId: 0 },
      M: { syncVariantId: 0 },
      L: { syncVariantId: 0 },
      XL: { syncVariantId: 0 },
    },
  },
  {
    id: "classic-hoodie",
    name: "BARKHO Classic Hoodie",
    description: "Mid-weight fleece hoodie, embroidered front logo.",
    priceNok: 549,
    color: "#2440E0",
    sizes: {
      S: { syncVariantId: 0 },
      M: { syncVariantId: 0 },
      L: { syncVariantId: 0 },
      XL: { syncVariantId: 0 },
    },
  },
  {
    id: "cap-embroidered",
    name: "BARKHO Cap",
    description: "Structured 6-panel cap, embroidered wordmark.",
    priceNok: 249,
    color: "#57534A",
    sizes: {
      "One size": { syncVariantId: 0 },
    },
  },
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = PRODUCTS;
} else {
  window.PRODUCTS = PRODUCTS;
}
