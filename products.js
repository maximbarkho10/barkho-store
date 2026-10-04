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
  // ---------- T-SHIRTS (Gildan 64000) — Printful product 476574454 ----------
  {
    id: "wordmark-tee-blue",
    collection: "core",
    name: "BARKHO Wordmark Tee — Blue",
    description: "Heavyweight cotton tee with the core emblem across the chest.",
    priceNok: 349,
    color: "#2440E0",
    image: "https://files.cdn.printful.com/files/101/1012fe5a2ffe643c16b7f601bee1dcdb_preview.png",
    sizes: {
      S: { syncVariantId: 5526814895 },
      M: { syncVariantId: 5526814896 },
      L: { syncVariantId: 5526814897 },
      XL: { syncVariantId: 5526814898 },
    },
  },
  {
    id: "wordmark-tee-white",
    collection: "core",
    name: "BARKHO Wordmark Tee — White",
    description: "Same cut, inverted colorway. Heavyweight cotton.",
    priceNok: 349,
    color: "#EFEAE0",
    image: "https://files.cdn.printful.com/files/71a/71afcd6ea95dbb34a820e7c44cac6353_preview.png",
    sizes: {
      S: { syncVariantId: 5526814904 },
      M: { syncVariantId: 5526814905 },
      L: { syncVariantId: 5526814906 },
      XL: { syncVariantId: 5526814908 },
    },
  },

  // ---------- ZIP HOODIE (Gildan 18600) — Printful product 476932132 ----------
  {
    id: "zip-hoodie-black",
    collection: "core",
    name: "BARKHO Zip Hoodie — Black",
    description: "Heavy blend zip hoodie with BARKHO emblem label and embroidered wrist detail.",
    priceNok: 749,
    color: "#17140F",
    image: "https://files.cdn.printful.com/files/38c/38c3a7464ba24ce9f717168bdc4c1a01_preview.png",
    sizes: {
      S: { syncVariantId: 5528344207 },
      M: { syncVariantId: 5528344208 },
      L: { syncVariantId: 5528344209 },
      XL: { syncVariantId: 5528344210 },
    },
  },
  {
    id: "zip-hoodie-blue",
    collection: "core",
    name: "BARKHO Zip Hoodie — Royal Blue",
    description: "Heavy blend zip hoodie with BARKHO emblem label and embroidered wrist detail.",
    priceNok: 749,
    color: "#2440E0",
    image: "https://files.cdn.printful.com/files/286/28675cc3e1676dd94ee65f01fda056d4_preview.png",
    sizes: {
      S: { syncVariantId: 5528344217 },
      M: { syncVariantId: 5528344218 },
      L: { syncVariantId: 5528344219 },
      XL: { syncVariantId: 5528344220 },
    },
  },
  {
    id: "zip-hoodie-white",
    collection: "core",
    name: "BARKHO Zip Hoodie — White",
    description: "Heavy blend zip hoodie with BARKHO emblem label and embroidered wrist detail.",
    priceNok: 749,
    color: "#EFEAE0",
    image: "https://files.cdn.printful.com/files/38f/38fdd421566eabeaa26e725d1ac19a02_preview.png",
    sizes: {
      S: { syncVariantId: 5528344225 },
      M: { syncVariantId: 5528344226 },
      L: { syncVariantId: 5528344227 },
      XL: { syncVariantId: 5528344228 },
    },
  },

  // ---------- FLAT BILL CAP (Yupoong 6007) — Printful product 477154308 ----------
  {
    id: "cap-black",
    collection: "core",
    name: "BARKHO Cap — Black",
    description: "Flat bill snapback with the gold BARKHO emblem embroidered on the front.",
    priceNok: 399,
    color: "#17140F",
    image: "https://files.cdn.printful.com/files/25d/25de85998273c049a3999a6b20c4dcde_preview.png",
    sizes: {
      "One size": { syncVariantId: 5529312012 },
    },
  },
  {
    id: "cap-blue",
    collection: "core",
    name: "BARKHO Cap — Royal Blue",
    description: "Flat bill snapback with the gold BARKHO emblem embroidered on the front.",
    priceNok: 399,
    color: "#2440E0",
    image: "https://files.cdn.printful.com/files/0c2/0c2aadcb75e302a2862716cf1a0b57c7_preview.png",
    sizes: {
      "One size": { syncVariantId: 5529312013 },
    },
  },
  {
    id: "cap-white",
    collection: "core",
    name: "BARKHO Cap — White",
    description: "Flat bill snapback with the gold BARKHO emblem embroidered on the front.",
    priceNok: 399,
    color: "#EFEAE0",
    image: "https://files.cdn.printful.com/files/987/98790c8a990577a56dd260f6d6013fbf_preview.png",
    sizes: {
      "One size": { syncVariantId: 5529312014 },
    },
  },

  // ---------- WINTER COLLECTION (coming soon) ----------
  {
    id: "crewneck-onyx",
    collection: "winter",
    comingSoon: true,
    name: "BARKHO Crewneck — Onyx",
    description: "Heavyweight crewneck sweatshirt with the gold emblem on the chest.",
    priceNok: 649,
    color: "#17140F",
    sizes: {},
  },
  {
    id: "zip-hoodie-01-premium",
    collection: "winter",
    comingSoon: true,
    name: "Zip Hoodie 01 — Premium",
    description: "Oversized boxy zip hoodie with the gold emblem and BARKHO neck label.",
    priceNok: 899,
    color: "#17140F",
    sizes: {},
  },
  {
    id: "winter-jacket",
    collection: "winter",
    comingSoon: true,
    name: "BARKHO Jacket",
    description: "Winter jacket with embroidered BARKHO detail.",
    priceNok: 1099,
    color: "#2440E0",
    sizes: {},
  },
  {
    id: "winter-scarf",
    collection: "winter",
    comingSoon: true,
    name: "BARKHO Scarf",
    description: "Soft winter scarf with a small gold emblem.",
    priceNok: 399,
    color: "#EFEAE0",
    sizes: {},
  },
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = PRODUCTS;
} else {
  window.PRODUCTS = PRODUCTS;
}
