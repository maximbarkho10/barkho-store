(function () {
  "use strict";

  const PRODUCTS = window.PRODUCTS || [];
  const CART_KEY = "barkho_cart_v1";

  // ---------- helpers ----------
  function findProduct(id) {
    return PRODUCTS.find((p) => p.id === id);
  }

  // Real Printful mockup if the product has one, otherwise the emblem on a color swatch
  function swatchInner(product) {
    if (product.image) {
      return `<img src="${product.image}" alt="${product.name}" loading="lazy"
        style="width:100%;height:100%;object-fit:cover;display:block;">`;
    }
    return `<img src="emblem-mark.svg" alt="${product.name} emblem" class="swatch-emblem">`;
  }

  function swatchBackground(product) {
    return product.image ? "#F4F1EA" : product.color;
  }

  // ---------- cart state ----------
  function loadCart() {
    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY)) || [];
      // drop old items whose product no longer exists (e.g. renamed products)
      return saved.filter((line) => {
        const p = findProduct(line.id);
        return p && p.sizes[line.size];
      });
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {
      /* storage unavailable — cart still works for this visit */
    }
  }

  let cart = loadCart();
  saveCart(cart);

  function cartLineTotal(line) {
    const product = findProduct(line.id);
    return product ? product.priceNok * line.qty : 0;
  }

  function cartSubtotal() {
    return cart.reduce((sum, line) => sum + cartLineTotal(line), 0);
  }

  function addToCart(id, size) {
    const existing = cart.find((l) => l.id === id && l.size === size);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id, size, qty: 1 });
    }
    saveCart(cart);
    renderCart();
    openCart();
  }

  function updateQty(id, size, delta) {
    const line = cart.find((l) => l.id === id && l.size === size);
    if (!line) return;
    line.qty += delta;
    if (line.qty <= 0) {
      cart = cart.filter((l) => l !== line);
    }
    saveCart(cart);
    renderCart();
  }

  function removeLine(id, size) {
    cart = cart.filter((l) => !(l.id === id && l.size === size));
    saveCart(cart);
    renderCart();
  }

  // ---------- rendering: collections ----------
  const COLLECTIONS = [
    {
      id: "core",
      title: "Core Collection",
      tagline: "The essentials. Made to order, all year round.",
    },
    {
      id: "winter",
      title: "Winter Collection",
      tagline: "Heavyweight layers for the cold months. Dropping soon.",
    },
  ];

  const collectionsEl = document.getElementById("collections");

  // All colour entries of the same design (same "group"). Products without a
  // group are their own single-colour group.
  function groupOf(product) {
    if (!product.group) return [product];
    return PRODUCTS.filter((p) => p.group === product.group);
  }

  // One tile per design. Shows the first colour's mockup + small colour dots.
  function productTile(product) {
    const variants = groupOf(product);
    const tile = document.createElement("div");
    tile.className = "product-tile" + (product.comingSoon ? " is-soon" : "");
    const dots = variants.length > 1
      ? `<div class="color-dots">${variants
          .map((v) => `<span class="color-dot" title="${v.colorName || ""}" style="background:${v.color}"></span>`)
          .join("")}</div>`
      : "";
    const model = product.models && product.models.length ? product.models[0] : null;
    tile.innerHTML = `
      <div class="product-swatch" style="background:${swatchBackground(product)};">
        ${swatchInner(product)}
        ${model ? `<img class="tile-model" src="${model}" alt="${product.title || product.name} worn by a model" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;">` : ""}
        ${model ? '<span class="model-tag">On model</span>' : ""}
        ${product.comingSoon ? '<span class="soon-badge">Coming soon</span>' : ""}
      </div>
      <p class="product-name">${product.title || product.name}</p>
      ${dots}
      <p class="product-price">${product.comingSoon ? "Coming soon" : product.priceNok + " NOK"}</p>
    `;
    if (!product.comingSoon) {
      tile.addEventListener("click", () => { selectedSize = null; openSizeModal(product.id); });
    }
    return tile;
  }

  // First entry of every group, in catalog order
  function groupLeaders(items) {
    const seen = new Set();
    return items.filter((p) => {
      const key = p.group || p.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function renderProducts() {
    collectionsEl.innerHTML = "";
    COLLECTIONS.forEach((collection) => {
      const items = groupLeaders(PRODUCTS.filter((p) => (p.collection || "core") === collection.id));
      if (items.length === 0) return;

      const section = document.createElement("div");
      section.className = "collection";
      section.id = collection.id;
      section.innerHTML = `
        <div class="collection-head">
          <h2 class="section-title">${collection.title}</h2>
          <p class="collection-tagline">${collection.tagline}</p>
        </div>
      `;

      // Sub-sections by product type (Hoodies, T-shirts, ...) when types are set
      const types = [];
      items.forEach((p) => { if (!types.includes(p.type || "")) types.push(p.type || ""); });
      types.forEach((type) => {
        if (type) {
          const h = document.createElement("h3");
          h.className = "type-title";
          h.id = "type-" + type.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
          h.textContent = type;
          section.appendChild(h);
        }
        const grid = document.createElement("div");
        grid.className = "product-grid";
        items.filter((p) => (p.type || "") === type).forEach((product) => grid.appendChild(productTile(product)));
        section.appendChild(grid);
      });
      collectionsEl.appendChild(section);
    });
  }

  // crude luminance check so the wordmark stays legible on any swatch color
  function textColorFor(hex) {
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? "#17140F" : "#FFFFFF";
  }

  // ---------- rendering: cart drawer ----------
  const cartItemsEl = document.getElementById("cartItems");
  const cartSubtotalEl = document.getElementById("cartSubtotal");
  const cartCountEl = document.getElementById("cartCount");

  function renderCart() {
    cartItemsEl.innerHTML = "";

    if (cart.length === 0) {
      cartItemsEl.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    } else {
      cart.forEach((line) => {
        const product = findProduct(line.id);
        if (!product) return;
        const row = document.createElement("div");
        row.className = "cart-item";
        const thumb = product.image
          ? `<div class="cart-item-swatch" style="background:#F4F1EA;overflow:hidden;">
               <img src="${product.image}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;">
             </div>`
          : `<div class="cart-item-swatch" style="background:${product.color}"></div>`;
        row.innerHTML = `
          ${thumb}
          <div class="cart-item-info">
            <p class="cart-item-name">${product.name}</p>
            <p class="cart-item-meta">Size ${line.size} · ${product.priceNok} NOK</p>
            <div class="qty-stepper">
              <button data-action="dec">−</button>
              <span>${line.qty}</span>
              <button data-action="inc">+</button>
            </div>
            <button class="cart-item-remove">Remove</button>
          </div>
        `;
        row.querySelector('[data-action="inc"]').addEventListener("click", () => updateQty(line.id, line.size, 1));
        row.querySelector('[data-action="dec"]').addEventListener("click", () => updateQty(line.id, line.size, -1));
        row.querySelector(".cart-item-remove").addEventListener("click", () => removeLine(line.id, line.size));
        cartItemsEl.appendChild(row);
      });
    }

    cartSubtotalEl.textContent = cartSubtotal() + " NOK";
    cartCountEl.textContent = cart.reduce((n, l) => n + l.qty, 0);
    if (typeof updateShipNote === "function") updateShipNote();
  }

  // ---------- cart drawer open/close ----------
  const cartDrawer = document.getElementById("cartDrawer");
  const drawerBackdrop = document.getElementById("drawerBackdrop");

  function openCart() {
    cartDrawer.classList.add("open");
    drawerBackdrop.classList.add("visible");
  }

  function closeCart() {
    cartDrawer.classList.remove("open");
    drawerBackdrop.classList.remove("visible");
  }

  document.getElementById("cartToggle").addEventListener("click", openCart);
  document.getElementById("cartClose").addEventListener("click", closeCart);
  drawerBackdrop.addEventListener("click", closeCart);

  // ---------- size-select modal ----------
  const modal = document.getElementById("sizeModal");
  const modalBackdrop = document.getElementById("modalBackdrop");
  const modalSwatch = document.getElementById("modalSwatch");
  const modalName = document.getElementById("modalName");
  const modalDesc = document.getElementById("modalDesc");
  const modalPrice = document.getElementById("modalPrice");
  const sizeOptionsEl = document.getElementById("sizeOptions");
  const addToCartBtn = document.getElementById("addToCartBtn");

  let activeProductId = null;
  let selectedSize = null;

  const colorOptionsEl = document.getElementById("colorOptions");
  const galleryThumbsEl = document.getElementById("galleryThumbs");

  // ---------- product gallery (front, back, sides) ----------
  let galleryImages = [];
  let galleryIndex = 0;

  function showGalleryImage(i) {
    if (!galleryImages.length) return;
    galleryIndex = (i + galleryImages.length) % galleryImages.length;
    const main = modalSwatch.querySelector(".gallery-main");
    if (main) main.src = galleryImages[galleryIndex];
    galleryThumbsEl.querySelectorAll("img").forEach((t, n) => t.classList.toggle("active", n === galleryIndex));
  }

  function renderGallery(product) {
    galleryImages = (product.images && product.images.length ? product.images : [product.image]).filter(Boolean);
    galleryIndex = 0;
    galleryThumbsEl.innerHTML = "";
    if (!galleryImages.length) {
      modalSwatch.innerHTML = swatchInner(product);
      galleryThumbsEl.style.display = "none";
      return;
    }
    const multi = galleryImages.length > 1;
    modalSwatch.innerHTML = `
      <img class="gallery-main" src="${galleryImages[0]}" alt="${product.name}">
      ${multi ? '<button class="gallery-nav gallery-prev" aria-label="Previous image">‹</button><button class="gallery-nav gallery-next" aria-label="Next image">›</button>' : ""}
    `;
    galleryThumbsEl.style.display = multi ? "" : "none";
    if (!multi) return;
    modalSwatch.querySelector(".gallery-prev").addEventListener("click", () => showGalleryImage(galleryIndex - 1));
    modalSwatch.querySelector(".gallery-next").addEventListener("click", () => showGalleryImage(galleryIndex + 1));
    galleryImages.forEach((src, n) => {
      const t = document.createElement("img");
      t.src = src;
      t.alt = "";
      t.loading = "lazy";
      if (n === 0) t.className = "active";
      t.addEventListener("click", () => showGalleryImage(n));
      galleryThumbsEl.appendChild(t);
    });
    // swipe on phones
    let startX = null;
    modalSwatch.ontouchstart = (e) => { startX = e.touches[0].clientX; };
    modalSwatch.ontouchend = (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) showGalleryImage(galleryIndex + (dx < 0 ? 1 : -1));
      startX = null;
    };
  }

  function openSizeModal(productId) {
    const product = findProduct(productId);
    if (!product || product.comingSoon) return;
    activeProductId = productId;
    sizeOptionsEl.style.outline = "";

    modalSwatch.style.background = swatchBackground(product);
    modalSwatch.style.overflow = "hidden";
    renderGallery(product);
    modalName.textContent = product.title ? `${product.title} — ${product.colorName}` : product.name;
    modalDesc.textContent = product.description;
    modalPrice.textContent = product.priceNok + " NOK";

    // colour picker (only when the design comes in more than one colour)
    const variants = groupOf(product);
    colorOptionsEl.innerHTML = "";
    colorOptionsEl.style.display = variants.length > 1 ? "" : "none";
    variants.forEach((v) => {
      const btn = document.createElement("button");
      btn.className = "color-option" + (v.id === product.id ? " selected" : "");
      btn.title = v.colorName || v.name;
      btn.setAttribute("aria-label", v.colorName || v.name);
      btn.style.background = v.color;
      btn.addEventListener("click", () => openSizeModal(v.id));
      colorOptionsEl.appendChild(btn);
    });

    // keep the chosen size when switching colour, if that colour has it
    if (selectedSize && !product.sizes[selectedSize]) selectedSize = null;

    sizeOptionsEl.innerHTML = "";
    const sizes = Object.keys(product.sizes);
    sizes.forEach((size) => {
      const btn = document.createElement("button");
      btn.className = "size-option" + (size === selectedSize ? " selected" : "");
      btn.textContent = size;
      btn.addEventListener("click", () => {
        selectedSize = size;
        sizeOptionsEl.style.outline = "";
        sizeOptionsEl.querySelectorAll(".size-option").forEach((el) => el.classList.remove("selected"));
        btn.classList.add("selected");
      });
      sizeOptionsEl.appendChild(btn);
    });

    // one-size products (caps): pre-select automatically
    if (sizes.length === 1) {
      selectedSize = sizes[0];
      sizeOptionsEl.querySelector(".size-option").classList.add("selected");
    }

    modal.classList.add("open");
    modalBackdrop.classList.add("visible");
  }

  function closeSizeModal() {
    modal.classList.remove("open");
    modalBackdrop.classList.remove("visible");
  }

  document.getElementById("modalClose").addEventListener("click", closeSizeModal);
  modalBackdrop.addEventListener("click", closeSizeModal);

  addToCartBtn.addEventListener("click", () => {
    if (!activeProductId) return;
    if (!selectedSize) {
      sizeOptionsEl.style.outline = "1px solid red"; // simple nudge, no alert()
      return;
    }
    addToCart(activeProductId, selectedSize);
    closeSizeModal();
  });

  // ---------- checkout ----------
  // ---------- shipping region ----------
  const SHIP_NOTES = {
    europe: "Shipping: 99 NOK, added at checkout. Made to order — ships in 2–5 business days.",
    middleeast: "Shipping: 179 NOK, added at checkout. Made to order — delivery usually 2–4 weeks. Local import duties/taxes, if any, are paid on delivery.",
  };
  const shipRegionEl = document.getElementById("shipRegion");
  const cartNoteEl = document.getElementById("cartNote");
  try {
    const saved = localStorage.getItem("barkho_ship_region");
    if (saved && SHIP_NOTES[saved]) shipRegionEl.value = saved;
  } catch (e) { /* ignore */ }
  // Free shipping in Europe from this subtotal (must match create-checkout-session.js)
  const FREE_SHIPPING_FROM = 1200;
  const freeShipEl = document.getElementById("freeShip");
  function updateShipNote() {
    const europe = shipRegionEl.value === "europe";
    const sub = cartSubtotal();
    const free = europe && sub >= FREE_SHIPPING_FROM;
    cartNoteEl.textContent = free
      ? "Free shipping. Made to order — ships in 2–5 business days."
      : SHIP_NOTES[shipRegionEl.value] || SHIP_NOTES.europe;
    if (freeShipEl) {
      if (!europe || cart.length === 0) {
        freeShipEl.innerHTML = "";
      } else {
        const pct = Math.min(100, Math.round((sub / FREE_SHIPPING_FROM) * 100));
        freeShipEl.innerHTML = (free
          ? "<b>You get free shipping.</b>"
          : `Add <b>${FREE_SHIPPING_FROM - sub} NOK</b> more for free shipping.`) +
          `<div class="free-ship-bar"><span style="width:${pct}%"></span></div>`;
      }
    }
    try { localStorage.setItem("barkho_ship_region", shipRegionEl.value); } catch (e) { /* ignore */ }
  }
  shipRegionEl.addEventListener("change", updateShipNote);
  updateShipNote();

  document.getElementById("checkoutBtn").addEventListener("click", async () => {
    if (cart.length === 0) return;

    const btn = document.getElementById("checkoutBtn");
    btn.disabled = true;
    btn.textContent = "Redirecting…";

    try {
      const res = await fetch("/.netlify/functions/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, region: shipRegionEl.value }),
      });

      if (!res.ok) throw new Error("checkout session failed");

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("no checkout url returned");
      }
    } catch (err) {
      console.error(err);
      btn.disabled = false;
      btn.textContent = "Checkout";
      alert("Something went wrong starting checkout. Please try again.");
    }
  });

  // ---------- init ----------
  document.getElementById("year").textContent = new Date().getFullYear();
  renderProducts();
  renderCart();
})();
