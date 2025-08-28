// app.js — shared logic (storage, API, cart, wishlist, checkout)

// --- Storage helpers ---
function getCart(){ try { return JSON.parse(localStorage.getItem('ps_cart')||'[]'); } catch(e){ return []; } }
function saveCart(cart){ localStorage.setItem('ps_cart', JSON.stringify(cart)); }
function getWishlist(){ try { return JSON.parse(localStorage.getItem('ps_wish')||'[]'); } catch(e){ return []; } }
function saveWishlist(w){ localStorage.setItem('ps_wish', JSON.stringify(w)); }

function updateCartUI(){
  const c = getCart().reduce((s,i)=>s + (i.qty||0), 0);
  document.querySelectorAll('#cartCount, #cartCount2').forEach(el=>{ if(el) el.textContent = c; });
}
function updateWishUI(){
  const w = getWishlist().length;
  document.querySelectorAll('#wishCount, #wishCount2').forEach(el=>{ if(el) el.textContent = w; });
}

// --- Cookie helpers ---
function setCookie(name, value, days){
  var d = new Date(); d.setTime(d.getTime()+(days*24*60*60*1000));
  document.cookie = name + "=" + encodeURIComponent(value) + ";path=/;expires=" + d.toUTCString();
}
function getCookie(name){
  const parts = document.cookie.split(';').map(s=>s.trim());
  for(const p of parts){ if(p.startsWith(name+'=')) return decodeURIComponent(p.split('=')[1]); }
  return null;
}

// --- Session helper ---
function ensureSession(){
  if(!sessionStorage.getItem('sessionId')){
    sessionStorage.setItem('sessionId', 'SID-' + Math.random().toString(36).slice(2,10));
  }
}

// --- Product / API helpers ---
// Using a free demo API: DummyJSON smartphones
const API_ENDPOINT = 'https://dummyjson.com/c/c8bc-d9b6-4f6a-9500';
let PRODUCTS_CACHE = [];

function fetchProducts(limit=12, targetSelector){
  $.getJSON(API_ENDPOINT)
    .done(function(data){
      const list = data.products || data;
      PRODUCTS_CACHE = list.slice(0, limit);
      renderProducts(PRODUCTS_CACHE, targetSelector);
    })
    .fail(function(){
      // Offline fallback
      PRODUCTS_CACHE = [
        {id: 1001, title:'Sample Phone A', price: 999, thumbnail:'assets/images/placeholder.png', description:'Demo phone (offline)'},
        {id: 1002, title:'Sample Phone B', price: 699, thumbnail:'assets/images/placeholder.png', description:'Demo phone (offline)'}
      ];
      renderProducts(PRODUCTS_CACHE, targetSelector);
    });
}

function currency(n){ try { return 'RM ' + Number(n).toFixed(2); } catch(e){ return 'RM ' + n; } }

function renderProducts(products, targetSelector){
  const $target = $(targetSelector);
  if(!$target.length) return;
  $target.empty();
  products.forEach(p => {
    const img = p.thumbnail || (p.images && p.images[0]) || 'assets/images/placeholder.png';
    const col = $('<div class="col-12 col-sm-6 col-md-4 col-lg-3"></div>');
    const card = $(`
      <div class="card h-100 position-relative">
        <img src="${img}" class="card-img-top" alt="${p.title}">
        <span class="badge text-bg-primary product-badge">New</span>
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${p.title}</h5>
          <p class="card-text small flex-grow-1">${(p.description||'').slice(0, 90)}</p>
          <div class="d-flex justify-content-between align-items-center">
            <strong class="price">${currency(p.price)}</strong>
            <div class="btn-group">
              <button class="btn btn-sm btn-outline-danger" title="Add to wishlist" onclick="toggleWish(${p.id})">❤</button>
              <button class="btn btn-sm btn-primary" onclick="addToCart(${p.id})">Add</button>
            </div>
          </div>
        </div>
      </div>`);
    col.append(card); $target.append(col);
  });
}

// Simple client-side filter and sort
function filterProducts(q){
  const query = (q||'').toLowerCase();
  const filtered = PRODUCTS_CACHE.filter(p =>
    (p.title||'').toLowerCase().includes(query) ||
    (p.description||'').toLowerCase().includes(query)
  );
  renderProducts(filtered, '#productsGrid');
}
function sortProducts(mode){
  const arr = PRODUCTS_CACHE.slice();
  if(mode === 'price-asc') arr.sort((a,b)=>a.price-b.price);
  if(mode === 'price-desc') arr.sort((a,b)=>b.price-a.price);
  renderProducts(arr, '#productsGrid');
}

// --- Wishlist ---
function toggleWish(productId){
  const w = getWishlist();
  const idx = w.findIndex(it => it.id == productId);
  if(idx > -1){ w.splice(idx,1); }
  else{
    const p = (PRODUCTS_CACHE.find(pp=>pp.id==productId)) || {};
    w.push({ id: productId, title: p.title || 'Phone', price: p.price || 0, thumbnail: (p.thumbnail || (p.images && p.images[0]) || 'assets/images/placeholder.png') });
  }
  saveWishlist(w); updateWishUI(); if(typeof renderWishlist === 'function') renderWishlist('#wishListArea');
}

function renderWishlist(target){
  const w = getWishlist();
  const $t = $(target).empty();
  if(w.length === 0){ $t.html('<div class="alert alert-secondary">Your wishlist is empty.</div>'); return; }
  w.forEach(item => {
    $t.append(`
      <div class="col-12 col-sm-6 col-lg-4">
        <div class="card h-100">
          <img src="${item.thumbnail}" class="card-img-top" alt="${item.title}">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${item.title}</h5>
            <div class="mt-auto d-flex justify-content-between align-items-center">
              <strong>${currency(item.price)}</strong>
              <div class="btn-group">
                <button class="btn btn-sm btn-outline-primary" onclick="addToCart(${item.id})">Add to Cart</button>
                <button class="btn btn-sm btn-outline-danger" onclick="toggleWish(${item.id})">Remove</button>
              </div>
            </div>
          </div>
        </div>
      </div>`);
  });
}

// --- Cart ---
function addToCart(productId, qty=1){
  const cart = getCart();
  const idx = cart.findIndex(it => it.id == productId);
  
 
  let product = PRODUCTS_CACHE.find(pp => pp.id == productId);
  
 
  if (!product) {
    const wishlist = getWishlist();
    product = wishlist.find(item => item.id == productId);
  }
  

  if (!product) {
    product = { id: productId, title: 'Phone', price: 0 };
  }
  
  if(idx > -1){ 
    cart[idx].qty += qty; 
  } else { 
    cart.push({ 
      id: productId, 
      title: product.title || 'Phone', 
      price: product.price || 0, 
      qty: qty, 
      thumbnail: (product.thumbnail || (product.images && product.images[0]) || 'assets/images/placeholder.png') 
    }); 
  }
  saveCart(cart); 
  updateCartUI();
}

function removeFromCart(productId){
  const cart = getCart().filter(it => it.id != productId);
  saveCart(cart);
  renderCart('#cartArea'); updateCartUI();
}

function changeQty(productId, delta){
  const cart = getCart();
  const idx = cart.findIndex(it => it.id == productId);
  if(idx > -1){
    cart[idx].qty = Math.max(1, cart[idx].qty + delta);
    saveCart(cart);
    renderCart('#cartArea'); updateCartUI();
  }
}

function renderCart(target){
  const cart = getCart();
  const $t = $(target).empty();
  if(cart.length === 0){ $t.html('<div class="alert alert-secondary">Your cart is empty.</div>'); return; }
  let subtotal = 0;
  cart.forEach(it => { subtotal += (it.price || 0) * (it.qty || 0); });
  const shipping = subtotal > 200 ? 0 : 9.9;
  const total = subtotal + shipping;

  // Items list
  const itemsHtml = cart.map(it => `
    <div class="d-flex align-items-center border rounded p-2 mb-2 bg-white">
      <img src="${it.thumbnail}" alt="${it.title}" style="width:64px;height:64px;object-fit:cover" class="me-2 rounded">
      <div class="flex-grow-1">
        <div class="fw-semibold">${it.title}</div>
        <div class="small text-muted">${currency(it.price)}</div>
        <div class="mt-1 btn-group btn-group-sm" role="group">
          <button class="btn btn-outline-secondary" onclick="changeQty(${it.id}, -1)">-</button>
          <button class="btn btn-outline-secondary disabled">${it.qty}</button>
          <button class="btn btn-outline-secondary" onclick="changeQty(${it.id}, 1)">+</button>
          <button class="btn btn-outline-danger ms-2" onclick="removeFromCart(${it.id})">Remove</button>
        </div>
      </div>
      <div class="text-end ms-3 fw-semibold">${currency((it.price||0) * (it.qty||0))}</div>
    </div>
  `).join('');

  $t.append(`
    <div class="row">
      <div class="col-lg-8">
        ${itemsHtml}
      </div>
      <div class="col-lg-4">
        <div class="border rounded p-3 bg-body-tertiary">
          <h5 class="mb-3">Summary</h5>
          <div class="d-flex justify-content-between"><span>Subtotal</span><span>${currency(subtotal)}</span></div>
          <div class="d-flex justify-content-between"><span>Shipping</span><span>${shipping === 0 ? 'Free' : currency(shipping)}</span></div>
          <hr>
          <div class="d-flex justify-content-between fw-bold"><span>Total</span><span>${currency(total)}</span></div>
        </div>
      </div>
    </div>
  `);
}

// --- Checkout ---
function renderOrderSummary(target){
  const cart = getCart();
  const $t = $(target).empty();
  if(cart.length === 0){ $t.html('<div class="alert alert-warning">Your cart is empty. Please add items first.</div>'); return; }
  let subtotal = 0;
  cart.forEach(it => { subtotal += (it.price || 0) * (it.qty || 0); });
  const shipping = subtotal > 200 ? 0 : 9.9;
  const total = subtotal + shipping;

  const lines = cart.map(it => `<div class="d-flex justify-content-between"><span>${it.title} × ${it.qty}</span><span>${currency((it.price||0)*it.qty)}</span></div>`).join('');
  $t.html(`
    ${lines}
    <hr>
    <div class="d-flex justify-content-between"><span>Subtotal</span><span>${currency(subtotal)}</span></div>
    <div class="d-flex justify-content-between"><span>Shipping</span><span>${shipping === 0 ? 'Free' : currency(shipping)}</span></div>
    <div class="d-flex justify-content-between fw-bold"><span>Total</span><span>${currency(total)}</span></div>
  `);
}

function placeOrder(){
  const name = $('#shipName').val().trim();
  const address = $('#shipAddress').val().trim();
  const phone = $('#shipPhone').val().trim();
  const pay = $('#payMethod').val();

  if(!name || !address || !phone || !pay){
    alert('Please complete shipping and payment details.'); return;
  }
  const order = {
    when: new Date().toISOString(),
    sessionId: sessionStorage.getItem('sessionId') || '',
    items: getCart(),
    shipping: { name, address, phone, pay }
  };
  // Store order to localStorage (demo)
  localStorage.setItem('ps_last_order', JSON.stringify(order));
  // Clear cart
  saveCart([]); updateCartUI();
  // Navigate to thank you page style dialog
  alert('Order placed! (Demo) — Your order has been saved to localStorage.');
  window.location.href = 'index.html';
}

// --- Profile ---
function saveProfileFromForm(){
  const profile = {
    name: document.getElementById('fullName')?.value || '',
    email: document.getElementById('email')?.value || '',
    phone: document.getElementById('phone')?.value || ''
  };
  localStorage.setItem('userProfile', JSON.stringify(profile));
}
function loadProfileToForm(){
  const p = JSON.parse(localStorage.getItem('userProfile') || '{}');
  if(document.getElementById('fullName')) document.getElementById('fullName').value = p.name || '';
  if(document.getElementById('email')) document.getElementById('email').value = p.email || '';
  if(document.getElementById('phone')) document.getElementById('phone').value = p.phone || '';
}

