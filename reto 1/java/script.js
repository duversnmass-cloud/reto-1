/* TecnoSmart - app.js
   Funcionalidad principal: manejo de productos, carrito, navegación simple.
   Guarda el carrito en localStorage para persistencia.
*/

// --- Datos de ejemplo: productos ---
const PRODUCTS = [
  {
    id: "ram-8-ddr4-2666",
    title: "Memoria RAM DDR4 8GB 2666MHz",
    price: 52.0,
    category: "RAM",
    brand: "Generic",
    stock: 12,
    img: "https://media.falabella.com/falabellaCO/135522577_01/w=800,h=800,fit=pad", // placeholder
    specs: {
      tipo: "DDR4",
      capacidad: "8GB",
      frecuencia: "2666MHz",
    },
    compatible: ["HP Model A", "Dell Inspiron 15", "Lenovo V14"],
  },
  {
    id: "ssd-500gb",
    title: "SSD 500GB NVMe M.2",
    price: 89.0,
    category: "SSD",
    brand: "FastStorage",
    stock: 8,
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMEjikRdh0Epm5Hbu_BKf9n4u4hY24gtOAZA&s",
    specs: { tipo: "NVMe M.2", capacidad: "500GB" },
    compatible: ["HP Model A", "Custom Desktop"],
  },
  {
    id: "screen-laptop-14",
    title: "Pantalla 14' para laptop (Original)",
    price: 115.0,
    category: "Pantallas",
    brand: "DisplayPlus",
    stock: 3,
    img: "https://http2.mlstatic.com/D_NQ_NP_717199-MCO88893487215_072025-O.webp",
    specs: { tamaño: "14 pulgadas", tipo: "LCD" },
    compatible: ["Lenovo V14", "Acer 14"],
  },
  {
    id: "charger-laptop",
    title: "Cargador universal 65W",
    price: 28.0,
    category: "Cargadores",
    brand: "PowerGo",
    stock: 25,
    img: "https://http2.mlstatic.com/D_NQ_NP_962708-MCO86803723519_062025-O.webp",
    specs: { potencia: "65W" },
    compatible: ["Universal"],
  },
];

// --- Estado básico ---
let state = {
  products: PRODUCTS,
  filtered: PRODUCTS,
  cart: loadCart(),
};

// --- DOM references ---
const pages = {
  home: document.getElementById("home"),
  product: document.getElementById("product"),
  cart: document.getElementById("cart"),
  checkout: document.getElementById("checkout"),
};
const productsGrid = document.getElementById("productsGrid");
const categoryList = document.getElementById("categoryList");
const searchInput = document.getElementById("searchInput");
const cartCount = document.getElementById("cartCount");
const btnCart = document.getElementById("btnCart");
const btnCheckout = document.getElementById("btnCheckout");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const yearSpan = document.getElementById("year");
const ctaShop = document.getElementById("ctaShop");
const toast = document.getElementById("toast");

yearSpan.textContent = new Date().getFullYear();

// --- Inicialización ---
renderCategories();
renderProducts(state.filtered);
updateCartUI();
setupEvents();
renderCheckoutSummary();

// --- Funciones ---
// Renderiza lista de categorías únicas
function renderCategories() {
  const cats = Array.from(new Set(state.products.map((p) => p.category)));
  categoryList.innerHTML = "";
  const allChip = createChip("Todas", () => {
    state.filtered = state.products;
    renderProducts(state.filtered);
  });
  categoryList.appendChild(allChip);
  cats.forEach((cat) => {
    const chip = createChip(cat, () => {
      state.filtered = state.products.filter((p) => p.category === cat);
      renderProducts(state.filtered);
    });
    categoryList.appendChild(chip);
  });
}
function createChip(text, onClick) {
  const el = document.createElement("button");
  el.className = "chip";
  el.textContent = text;
  el.addEventListener("click", onClick);
  return el;
}

// Renderiza grid de productos
function renderProducts(list) {
  productsGrid.innerHTML = "";
  if (!list.length) {
    productsGrid.innerHTML = "<p>No hay productos que coincidan.</p>";
    return;
  }
  list.forEach((p) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img loading="lazy" src="${p.img}" alt="${p.title}" />
      <h4>${p.title}</h4>
      <div class="price">$${p.price.toFixed(2)}</div>
      <div style="display:flex;gap:8px;align-items:center;margin-top:6px;">
        <small style="color:var(--muted)">${p.brand}</small>
        <small style="margin-left:auto;color:${
          p.stock ? "#0a9d3a" : "#d13a3a"
        }">${p.stock ? "En stock" : "Agotado"}</small>
      </div>
      <button data-id="${p.id}">Ver producto</button>
    `;
    const btn = card.querySelector("button");
    btn.addEventListener("click", () => openProduct(p.id));
    productsGrid.appendChild(card);
  });
}

// Abrir vista producto
function openProduct(id) {
  const p = state.products.find((x) => x.id === id);
  if (!p) return;
  navigate("product");
  const detail = document.getElementById("productDetail");
  detail.innerHTML = `
    <div class="product-card">
      <img src="${p.img}" alt="${p.title}" style="width:100%;height:220px;object-fit:contain;border-radius:10px;background:#fafafa"/>
      <h2>${p.title}</h2>
      <div style="color:var(--primary);font-weight:700">$${p.price.toFixed(
        2
      )}</div>
      <p style="color:var(--muted)"><strong>Marca:</strong> ${
        p.brand
      } • <strong>Stock:</strong> ${p.stock}</p>
      <h4>Especificaciones</h4>
      <ul>
        ${Object.entries(p.specs)
          .map(([k, v]) => `<li><strong>${k}:</strong> ${v}</li>`)
          .join("")}
      </ul>
      <h4>Compatibilidad</h4>
      <p style="color:var(--muted)">${p.compatible.join(", ")}</p>
      <div style="display:flex;gap:8px;margin-top:10px;">
        <input id="qty_${p.id}" type="number" min="1" value="1" style="width:80px;padding:8px;border-radius:8px;border:1px solid #eef4fb"/>
        <button id="add_${p.id}" style="background:var(--primary);color:#fff;padding:8px 10px;border-radius:10px;border:none;cursor:pointer">Agregar al carrito</button>
      </div>
    </div>
  `;
  document.getElementById(`add_${p.id}`).addEventListener("click", () => {
    const qty = Number(document.getElementById(`qty_${p.id}`).value) || 1;
    addToCart(p.id, qty);
    showToast("Añadido al carrito");
  });
}

// Carrito: añadir
function addToCart(id, qty = 1) {
  const item = state.cart.find((i) => i.id === id);
  if (item) {
    item.qty += qty;
  } else {
    state.cart.push({ id, qty });
  }
  saveCart();
  updateCartUI();
}

// Guardar/recuperar carrito
function saveCart() {
  localStorage.setItem("tecno_cart_v1", JSON.stringify(state.cart));
}
function loadCart() {
  try {
    const raw = localStorage.getItem("tecno_cart_v1");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

// Interfaz del carrito
function updateCartUI() {
  const count = state.cart.reduce((s, i) => s + i.qty, 0);
  cartCount.textContent = count;
  // If cart page visible, render items
  if (document.getElementById("cart").classList.contains("active")) {
    renderCartItems();
  }
  // update total
  const total = state.cart.reduce((s, i) => {
    const p = state.products.find((x) => x.id === i.id);
    return s + (p ? p.price * i.qty : 0);
  }, 0);
  cartTotal.textContent = `$${total.toFixed(2)}`;
}

// Renderiza items del carrito
function renderCartItems() {
  cartItems.innerHTML = "";
  if (state.cart.length === 0) {
    cartItems.innerHTML = "<p>Tu carrito está vacío.</p>";
    return;
  }
  state.cart.forEach((ci) => {
    const p = state.products.find((x) => x.id === ci.id);
    if (!p) return;
    const el = document.createElement("div");
    el.className = "cart-item";
    el.innerHTML = `
      <img src="${p.img}" alt="${p.title}" />
      <div style="flex:1">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong>${p.title}</strong>
          <div class="price">$${(p.price * ci.qty).toFixed(2)}</div>
        </div>
        <small style="color:var(--muted)">${p.brand}</small>
        <div style="margin-top:8px;display:flex;align-items:center;gap:8px">
          <div class="qty-controls">
            <button class="dec" data-id="${ci.id}">-</button>
            <span style="padding:6px 10px;border-radius:6px;border:1px solid #eef4fb">${ci.qty}</span>
            <button class="inc" data-id="${ci.id}">+</button>
          </div>
          <button class="remove" data-id="${ci.id}" style="margin-left:auto;background:#fff;border:1px solid #f1c0c0;padding:6px;border-radius:8px">Quitar</button>
        </div>
      </div>
    `;
    cartItems.appendChild(el);
  });

  // eventos
  cartItems.querySelectorAll(".inc").forEach((b) => {
    b.addEventListener("click", () => changeQty(b.dataset.id, +1));
  });
  cartItems.querySelectorAll(".dec").forEach((b) => {
    b.addEventListener("click", () => changeQty(b.dataset.id, -1));
  });
  cartItems.querySelectorAll(".remove").forEach((b) => {
    b.addEventListener("click", () => {
      removeFromCart(b.dataset.id);
    });
  });
}

// Cambiar cantidad
function changeQty(id, delta) {
  const item = state.cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  saveCart();
  updateCartUI();
  renderCartItems();
}

// Remover
function removeFromCart(id) {
  state.cart = state.cart.filter((i) => i.id !== id);
  saveCart();
  updateCartUI();
  renderCartItems();
}

// Navegación simple entre secciones
function navigate(page) {
  Object.values(pages).forEach((el) => el.classList.remove("active"));
  pages[page].classList.add("active");
  // when entering cart, render
  if (page === "cart") renderCartItems();
  if (page === "checkout") renderCheckoutSummary();
}

// Setup eventos globales
function setupEvents() {
  // back buttons
  document.querySelectorAll(".back-btn").forEach((b) => {
    b.addEventListener("click", (ev) => {
      const target = ev.currentTarget.dataset.target || "home";
      navigate(target);
    });
  });

  // abrir carrito
  btnCart.addEventListener("click", () => navigate("cart"));
  ctaShop.addEventListener("click", () => navigate("home"));
  btnCheckout.addEventListener("click", () => navigate("checkout"));

  // búsqueda en tiempo real
  searchInput.addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) state.filtered = state.products;
    else
      state.filtered = state.products.filter((p) =>
        (p.title + p.brand + p.category).toLowerCase().includes(q)
      );
    renderProducts(state.filtered);
  });

  // checkout
  const checkoutForm = document.getElementById("checkoutForm");
  checkoutForm.addEventListener("submit", (ev) => {
    ev.preventDefault();
    if (state.cart.length === 0) {
      showToast("El carrito está vacío");
      return;
    }
    const form = new FormData(checkoutForm);
    // Simular procesamiento
    const order = {
      id: "TS-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      date: new Date().toISOString(),
      customer: {
        name: form.get("name"),
        email: form.get("email"),
        address: form.get("address"),
        city: form.get("city"),
      },
      payment: form.get("payment"),
      items: state.cart.map((i) => {
        const p = state.products.find((x) => x.id === i.id);
        return { id: p.id, title: p.title, price: p.price, qty: i.qty };
      }),
    };
    // limpiar carrito
    state.cart = [];
    saveCart();
    updateCartUI();
    navigate("home");
    showToast("Compra realizada. ID: " + order.id);
    // aquí podrías enviar "order" a tu servidor vía fetch()
    checkoutForm.reset();
  });
}

// Mostrar resumen en checkout
function renderCheckoutSummary() {
  const container = document.getElementById("checkoutSummary");
  if (!container) return;
  if (state.cart.length === 0) {
    container.innerHTML = "<p>Carrito vacío</p>";
    return;
  }
  const lines = state.cart
    .map((i) => {
      const p = state.products.find((x) => x.id === i.id);
      return `
        <div style="display:flex;justify-content:space-between">
          <span>${p.title} x ${i.qty}</span>
          <strong>$${(p.price * i.qty).toFixed(2)}</strong>
        </div>
      `;
    })
    .join("");
  const total = state.cart.reduce(
    (s, i) => s + state.products.find((x) => x.id === i.id).price * i.qty,
    0
  );
  container.innerHTML = `
    ${lines}
    <hr/>
    <div style="display:flex;justify-content:space-between">
      <strong>Total</strong>
      <strong>$${total.toFixed(2)}</strong>
    </div>
  `;
}

// Toast simple
function showToast(msg, timeout = 2200) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), timeout);
}

// simple UI update helpers
function openHome() {
  navigate("home");
}

// helper to ensure cart loaded at start
updateCartUI();
