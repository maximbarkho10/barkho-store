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
 * printfulVariantId values below are PLACEHOLDERS. After you connect your
 * Printful store and sync these designs, replace each one with the real
 * variant id from your Printful dashboard (Store > Products > a variant's
 * "..." menu > shows the Variant ID), or via GET /store/products in the
 * Printful API.
 */

const PRODUCTS = [
  {
    id: "wordmark-tee-blue",
    name: "BARKHO Wordmark Tee — Blue",
    description: "Heavyweight cotton tee with the core emblem across the chest.",
    priceNok: 349,
    color: "#2440E0",
    sizes: {
      S: { printfulVariantId: 0 },
      M: { printfulVariantId: 0 },
      L: { printfulVariantId: 0 },
      XL: { printfulVariantId: 0 },
    },
  },
  {
    id: "wordmark-tee-white",
    name: "BARKHO Wordmark Tee — White",
    description: "Same cut, inverted colorway. Heavyweight cotton.",
    priceNok: 349,
    color: "#EFEAE0",
    sizes: {
      S: { printfulVariantId: 0 },
      M: { printfulVariantId: 0 },
      L: { printfulVariantId: 0 },
      XL: { printfulVariantId: 0 },
    },
  },
  {
    id: "classic-hoodie",
    name: "BARKHO Classic Hoodie",
    description: "Mid-weight fleece hoodie, embroidered front logo.",
    priceNok: 549,
    color: "#2440E0",
    sizes: {
      S: { printfulVariantId: 0 },
      M: { printfulVariantId: 0 },
      L: { printfulVariantId: 0 },
      XL: { printfulVariantId: 0 },
    },
  },
  {
    id: "cap-embroidered",
    name: "BARKHO Cap",
    description: "Structured 6-panel cap, embroidered wordmark.",
    priceNok: 249,
    color: "#57534A",
    sizes: {
      "One size": { printfulVariantId: 0 },
    },
  },
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = PRODUCTS;
} else {
  window.PRODUCTS = PRODUCTS;
}
