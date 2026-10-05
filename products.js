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
 * syncVariantId values are SYNC variant IDs from products in the BARKHO
 * Printful store (GET /store/products/{id}). Catalog variant IDs will NOT work.
 *
 * image = real Printful mockup preview for that product/color.
 *
 * collection  = "core" (all year) or "winter" (seasonal). Missing = "core".
 * comingSoon  = true -> shown on the site, but cannot be bought yet.
 *               To launch it: add real sizes/syncVariantIds + image, then
 *               delete the comingSoon line.
 */

const PRODUCTS = [
  // ---------- EMBROIDERED HOODIE (Cotton Heritage M2580) — Printful product 478098405 ----------
  {
    id: "rosette-hoodie-black",
    collection: "core",
    name: "BARKHO Rosette Hoodie — Black",
    description: "Premium pullover hoodie with the gold BARKHO Rosette embroidered on the chest.",
    priceNok: 749,
    color: "#17140F",
    image: "https://files.cdn.printful.com/files/58d/58dcb925c7dcdacda7926e735f17f69e_preview.png",
    sizes: {
      XS: { syncVariantId: 5548357363 },
      S: { syncVariantId: 5548357364 },
      M: { syncVariantId: 5548357365 },
      L: { syncVariantId: 5548357366 },
      XL: { syncVariantId: 5548357367 },
      "2XL": { syncVariantId: 5548357368 },
      "3XL": { syncVariantId: 5548357369 },
      "4XL": { syncVariantId: 5548357370 },
    },
  },
  {
    id: "rosette-hoodie-royal",
    collection: "core",
    name: "BARKHO Rosette Hoodie — Royal Blue",
    description: "Premium pullover hoodie with the gold BARKHO Rosette embroidered on the chest.",
    priceNok: 749,
    color: "#2440E0",
    image: "https://files.cdn.printful.com/files/6ad/6ad57f08335637fb759ce37ef93d29fc_preview.png",
    sizes: {
      S: { syncVariantId: 5548357371 },
      M: { syncVariantId: 5548357372 },
      L: { syncVariantId: 5548357373 },
      XL: { syncVariantId: 5548357374 },
      "2XL": { syncVariantId: 5548357375 },
      "3XL": { syncVariantId: 5548357376 },
    },
  },
  {
    id: "rosette-hoodie-grey",
    collection: "core",
    name: "BARKHO Rosette Hoodie — Carbon Grey",
    description: "Premium pullover hoodie with the gold BARKHO Rosette embroidered on the chest.",
    priceNok: 749,
    color: "#5B5D60",
    image: "https://files.cdn.printful.com/files/c83/c83c10fa4506fa0062e0d62c5f761899_preview.png",
    sizes: {
      XS: { syncVariantId: 5548357377 },
      S: { syncVariantId: 5548357378 },
      M: { syncVariantId: 5548357379 },
      L: { syncVariantId: 5548357380 },
      XL: { syncVariantId: 5548357381 },
      "2XL": { syncVariantId: 5548357382 },
      "3XL": { syncVariantId: 5548357383 },
      "4XL": { syncVariantId: 5548357384 },
    },
  },

  // ---------- OVERSIZED TEE (Bella+Canvas 4810) — Printful product 478255414 ----------
  // Only one variant exists in Printful right now (no colour/size), so it is
  // shown as "coming soon" until all colours and sizes are added there.
  {
    id: "rosette-tee-oversized",
    collection: "core",
    comingSoon: true,
    name: "BARKHO Rosette Tee — Oversized",
    description: "Heavyweight garment-dyed oversized tee with the BARKHO Rosette lockup on the chest.",
    priceNok: 449,
    color: "#17140F",
    image: "https://files.cdn.printful.com/files/0fc/0fc2d028425d1a2e82fbfa8ee298d368_preview.png",
    sizes: {},
  },

  // ---------- FLAT BILL CAP — Printful product 478256535 ----------
  {
    id: "rosette-cap-black",
    collection: "core",
    name: "BARKHO Cap — Black",
    description: "Flat bill snapback with the gold BARKHO Rosette embroidered on the front.",
    priceNok: 399,
    color: "#17140F",
    image: "https://files.cdn.printful.com/files/a17/a1775da1aa85d4a2427692c67f2f9994_preview.png",
    sizes: {
      "One size": { syncVariantId: 5552180381 },
    },
  },
  {
    id: "rosette-cap-blue",
    collection: "core",
    name: "BARKHO Cap — Royal Blue",
    description: "Flat bill snapback with the gold BARKHO Rosette embroidered on the front.",
    priceNok: 399,
    color: "#2440E0",
    image: "https://files.cdn.printful.com/files/ed2/ed21f2a2aba4bb50719acb7058912331_preview.png",
    sizes: {
      "One size": { syncVariantId: 5552180382 },
    },
  },
  {
    id: "rosette-cap-white",
    collection: "core",
    name: "BARKHO Cap — White",
    description: "Flat bill snapback with the gold BARKHO Rosette embroidered on the front.",
    priceNok: 399,
    color: "#EFEAE0",
    image: "https://files.cdn.printful.com/files/8da/8da92fe288acd1bc698b616b5c669332_preview.png",
    sizes: {
      "One size": { syncVariantId: 5552180383 },
    },
  },

  // ---------- WINTER '26 — THE ROSETTE DROP (coming soon) ----------
  {
    id: "zip-hoodie-01-premium",
    collection: "winter",
    comingSoon: true,
    name: "Zip Hoodie 01 — Premium",
    description: "Oversized boxy zip hoodie with the gold Rosette and BARKHO neck label.",
    priceNok: 899,
    color: "#17140F",
    sizes: {},
  },
  {
    id: "winter-rosette-scarf",
    collection: "winter",
    comingSoon: true,
    name: "Rosette Scarf",
    description: "Jacquard-knit scarf with Assyrian rosette bands in gold on onyx.",
    priceNok: 549,
    color: "#17140F",
    sizes: {},
  },
  {
    id: "winter-emblem-beanie",
    collection: "winter",
    comingSoon: true,
    name: "Emblem Beanie",
    description: "Rib-knit beanie with the gold Rosette embroidered on the cuff.",
    priceNok: 349,
    color: "#2440E0",
    sizes: {},
  },
  {
    id: "winter-box",
    collection: "winter",
    comingSoon: true,
    name: "The Winter Box",
    description: "Zip Hoodie 01, Rosette Scarf and Emblem Beanie in a numbered gift box.",
    priceNok: 1490,
    color: "#EFEAE0",
    sizes: {},
  },
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = PRODUCTS;
} else {
  window.PRODUCTS = PRODUCTS;
}
