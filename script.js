(function () {
  "use strict";

  const PRODUCTS = window.PRODUCTS || [];
  const CART_KEY = "barkho_cart_v1";

  // ---------- cart state ----------
  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  let cart = loadCart();

  function findProduct(id) {
    return PRODUCTS.find((p) => p.id === id);
  }

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

  // ---------- rendering: product grid ----------
  const productGrid = document.getElementById("productGrid");

  function renderProducts() {
    productGrid.innerHTML = "";
    PRODUCTS.forEach((product) => {
      const tile = document.createElement("div");
      tile.className = "product-tile";
      tile.innerHTML = `
        <div class="product-swatch" style="background:${product.color}">
          <img src="emblem-mark.svg" alt="${product.name} emblem" class="swatch-emblem">
        </div>
        <p class="product-name">${product.name}</p>
        <p class="product-price">${product.priceNok} NOK</p>
      `;
      tile.addEventListener("click", () => openSizeModal(product.id));
      productGrid.appendChild(tile);
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
        row.innerHTML = `
          <div class="cart-item-swatch" style="background:${product.color}"></div>
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

  function openSizeModal(productId) {
    const product = findProduct(productId);
    if (!product) return;
    activeProductId = productId;
    selectedSize = null;

    modalSwatch.style.background = product.color;
    modalSwatch.innerHTML = `<img src="emblem-mark.svg" alt="${product.name} emblem" class="swatch-emblem">`;
    modalName.textContent = product.name;
    modalDesc.textContent = product.description;
    modalPrice.textContent = product.priceNok + " NOK";

    sizeOptionsEl.innerHTML = "";
    Object.keys(product.sizes).forEach((size) => {
      const btn = document.createElement("button");
      btn.className = "size-option";
      btn.textContent = size;
      btn.addEventListener("click", () => {
        selectedSize = size;
        sizeOptionsEl.querySelectorAll(".size-option").forEach((el) => el.classList.remove("selected"));
        btn.classList.add("selected");
      });
      sizeOptionsEl.appendChild(btn);
    });

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
  document.getElementById("checkoutBtn").addEventListener("click", async () => {
    if (cart.length === 0) return;

    const btn = document.getElementById("checkoutBtn");
    btn.disabled = true;
    btn.textContent = "Redirecting…";

    try {
      const res = await fetch("/.netlify/functions/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart }),
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
