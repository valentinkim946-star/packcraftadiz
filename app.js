/* ============================================
   PACKCRAFT — app.js  (full working version)
   ============================================ */

// ─────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────
const cart = [];
let bonusPoints = 12450;
let bonusDiscount = 0;
let map = null;
let mapMarker = null;
let selectedLocation = { lat: 0, lng: 0, text: '' };

// Telegram Bot credentials
const TELEGRAM_BOT_TOKEN = '8493151607:AAE9DbdgbrqQYEGg01MWGbY6dAp_Dx6LovQ';
const TELEGRAM_CHAT_ID = '912568809';

// ─────────────────────────────────────────────
// PAGE ROUTER
// ─────────────────────────────────────────────
const pages = {
  home:      document.getElementById('page-home'),
  process:   document.getElementById('page-process'),
  backpacks: document.getElementById('page-backpacks'),
  wallets:   document.getElementById('page-wallets'),
  tshirts:   document.getElementById('page-tshirts'),
  hoodies:   document.getElementById('page-hoodies'),
  checkout:  document.getElementById('page-checkout'),
  success:   document.getElementById('page-success'),
  bonus:     document.getElementById('page-bonus'),
};

function showPage(name) {
  if (!pages[name]) return;
  Object.values(pages).forEach(p => p.classList.remove('active'));
  pages[name].classList.add('active');
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.page === name);
  });
  window.scrollTo(0, 0);
}

// ─────────────────────────────────────────────
// PREVENT href="#" scroll jumps
// ─────────────────────────────────────────────
document.querySelectorAll('a[href="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const txt = a.textContent.trim();
    const pageMap = { 'Backpacks': 'backpacks', 'Wallets': 'wallets', 'T-Shirts': 'tshirts', 'Hoodies': 'hoodies' };
    if (pageMap[txt]) { showPage(pageMap[txt]); return; }
    showToast(`${txt} — coming soon!`);
  });
});

// ─────────────────────────────────────────────
// GLOBAL CLICK DELEGATION  (data-page routing)
// ─────────────────────────────────────────────
document.addEventListener('click', e => {
  if (e.target.closest('.upload-file-input') || e.target.closest('.upload-remove')) return;
  const el = e.target.closest('[data-page]');
  if (!el) return;
  const page = el.dataset.page;
  if (page === 'checkout') { renderCheckout(); showPage('checkout'); }
  else { showPage(page); }
});

// ─────────────────────────────────────────────
// OPTION CARDS
// ─────────────────────────────────────────────
document.querySelectorAll('.option-card').forEach(card => {
  card.addEventListener('click', () => {
    card.closest('.option-cards').querySelectorAll('.option-card')
      .forEach(s => s.classList.remove('selected'));
    card.classList.add('selected');
  });
});

// ─────────────────────────────────────────────
// COLOR SWATCHES
// ─────────────────────────────────────────────
document.querySelectorAll('.color-selector').forEach(sel => {
  sel.querySelectorAll('.color-swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      sel.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
      sw.classList.add('selected');
      sw.animate([{ transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: 220 });
    });
  });
});

// ─────────────────────────────────────────────
// TAG SELECTORS
// ─────────────────────────────────────────────
document.querySelectorAll('.tag-selector').forEach(group => {
  group.querySelectorAll('.tag').forEach(tag => {
    tag.addEventListener('click', () => {
      group.querySelectorAll('.tag').forEach(t => t.classList.remove('selected'));
      tag.classList.add('selected');
    });
  });
});

// ─────────────────────────────────────────────
// SIZE BUTTONS
// ─────────────────────────────────────────────
document.querySelectorAll('.size-selector').forEach(group => {
  group.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      group.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });
});

// ─────────────────────────────────────────────
// PREVIEW CONTROLS  (zoom / rotate / flip)
// ─────────────────────────────────────────────
const previewStates = {};

document.querySelectorAll('.config-preview').forEach((preview, previewIdx) => {
  previewStates[previewIdx] = { zoom: 1, rotate: 0, flipX: false };
  const btns = preview.querySelectorAll('.ctrl-btn');
  const img  = preview.querySelector('.product-img');
  if (!img || !btns.length) return;

  btns.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      const st = previewStates[previewIdx];
      if (i === 0) { st.zoom = st.zoom === 1 ? 1.22 : 1; }
      else if (i === 1) { st.rotate = (st.rotate + 90) % 360; }
      else { st.flipX = !st.flipX; }
      const sx = st.flipX ? -st.zoom : st.zoom;
      img.style.transition = 'transform .35s ease';
      img.style.transform  = `scale(${sx}, ${st.zoom}) rotate(${st.rotate}deg)`;
    });
  });
});

// ─────────────────────────────────────────────
// LIVE PRICE UPDATES
// ─────────────────────────────────────────────
document.querySelectorAll('#page-backpacks .option-card').forEach((c, i) => {
  c.addEventListener('click', () => {
    const el = document.getElementById('bp-price');
    if (el) el.textContent = ['$495.00','$395.00'][i] ?? '$495.00';
  });
});
document.querySelectorAll('#page-wallets .option-card').forEach((c, i) => {
  c.addEventListener('click', () => {
    const el = document.getElementById('wl-price');
    if (el) el.textContent = ['$145.00','$195.00'][i] ?? '$145.00';
  });
});
document.querySelectorAll('#page-hoodies .option-card').forEach((c, i) => {
  c.addEventListener('click', () => {
    const v = ['$24.00','$34.00'][i] ?? '$24.00';
    const p = document.getElementById('hd-price'), s = document.getElementById('hd-sub');
    if (p) p.textContent = v;
    if (s) s.textContent = v;
  });
});
document.querySelectorAll('#page-tshirts .size-btn').forEach((b, i) => {
  b.addEventListener('click', () => {
    const el = document.getElementById('ts-price');
    if (el) el.textContent = ['$12.00','$14.00','$14.00','$16.00'][i] ?? '$14.00';
  });
});

// ─────────────────────────────────────────────
// ADD TO CART
// ─────────────────────────────────────────────
function addToCart(item) {
  cart.push(item);
  updateCartBadge();
  showToast(`${item.name} added to cart!`);
}

document.getElementById('bp-add').addEventListener('click', () => {
  const mat   = document.querySelector('#page-backpacks .option-card.selected strong')?.textContent || 'DYNEEMA';
  const price = parseFloat(document.getElementById('bp-price')?.textContent.replace('$','')) || 495;
  const img   = document.getElementById('preview-backpack')?.src || '';
  addToCart({ name: 'NOCTURNE_01 Backpack', detail: mat, price, emoji: '🎒', image: img });
});
document.getElementById('wl-add').addEventListener('click', () => {
  const mat   = document.querySelector('#page-wallets .option-card.selected strong')?.textContent || 'CARBON FIBER';
  const price = parseFloat(document.getElementById('wl-price')?.textContent.replace('$','')) || 145;
  const img   = document.getElementById('preview-wallet')?.src || '';
  addToCart({ name: 'CIPHER_W1 Wallet', detail: mat, price, emoji: '👜', image: img });
});
document.getElementById('ts-add').addEventListener('click', () => {
  const size  = document.querySelector('#page-tshirts .size-btn.selected')?.textContent || 'M';
  const price = parseFloat(document.getElementById('ts-price')?.textContent.replace('$','')) || 14;
  const img   = document.getElementById('preview-tshirt')?.src || '';
  addToCart({ name: 'NT-01 CHASSIS Tshirt', detail: `SIZE: ${size}`, price, emoji: '👕', image: img });
});
document.getElementById('hd-add').addEventListener('click', () => {
  const fab   = document.querySelector('#page-hoodies .option-card.selected strong')?.textContent || 'Premium Fleece';
  const price = parseFloat(document.getElementById('hd-price')?.textContent.replace('$','')) || 24;
  const img   = document.getElementById('preview-hoodie')?.src || '';
  addToCart({ name: 'NOCTURNE_H1 Hoodie', detail: fab, price, emoji: '🧥', image: img });
});

// RESET DESIGN
document.querySelectorAll('.btn-reset').forEach(btn => {
  btn.addEventListener('click', () => {
    const panel = btn.closest('.config-panel');
    panel.querySelectorAll('.option-card').forEach((c, i) => c.classList.toggle('selected', i === 0));
    panel.querySelectorAll('.color-swatch').forEach((c, i) => c.classList.toggle('selected', i === 0));
    panel.querySelectorAll('.size-btn').forEach((b, i) => b.classList.toggle('selected', i === 1));
    panel.querySelectorAll('.tag').forEach((t, i) => t.classList.toggle('selected', i === 0));
    panel.querySelectorAll('.config-input').forEach(inp => inp.value = '');
    const p = document.getElementById('hd-price'), s = document.getElementById('hd-sub');
    if (p) p.textContent = '$24.00';
    if (s) s.textContent = '$24.00';
    const img = btn.closest('.config-layout')?.querySelector('.product-img');
    if (img) { img.style.transform = ''; }
    showToast('Design reset to defaults.');
  });
});

// ─────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────
const toast    = document.getElementById('cart-toast');
const toastMsg = document.getElementById('toast-msg');
let toastTimer = null;

function showToast(msg) {
  toastMsg.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}

document.getElementById('toast-checkout').addEventListener('click', () => {
  toast.classList.remove('show');
  renderCheckout();
  showPage('checkout');
});

// ─────────────────────────────────────────────
// CART BADGE
// ─────────────────────────────────────────────
const cartBadge = document.getElementById('cart-badge');
const cartCount = document.getElementById('cart-count');

function updateCartBadge() {
  cartCount.textContent = cart.length;
  cartBadge.style.display = cart.length > 0 ? 'block' : 'none';
}

// ─────────────────────────────────────────────
// CHECKOUT RENDER
// ─────────────────────────────────────────────
function renderCheckout() {
  const itemsEl    = document.getElementById('checkout-items');
  const subtotalEl = document.getElementById('co-subtotal');
  const taxEl      = document.getElementById('co-tax');
  const totalEl    = document.getElementById('co-total');

  if (cart.length === 0) {
    itemsEl.innerHTML = `
      <div style="text-align:center;padding:2rem 0">
        <div style="font-size:2rem;margin-bottom:.5rem">🛒</div>
        <p style="color:var(--muted);font-size:.8rem;font-family:var(--font-mono);margin-bottom:1rem">Cart is empty.</p>
        <button class="btn-primary" style="font-size:.65rem" data-page="backpacks">SHOP NOW</button>
      </div>`;
    subtotalEl.textContent = '$0.00';
    taxEl.textContent      = '$0.00';
    totalEl.textContent    = '$0.00';
    return;
  }

  itemsEl.innerHTML = cart.map((item, idx) => `
    <div class="checkout-item">
      <div class="checkout-item-thumb">${item.image ? `<img src="${item.image}" style="width:100%;height:100%;object-fit:cover;">` : item.emoji}</div>
      <div class="checkout-item-info">
        <div class="checkout-item-name">${item.name}</div>
        <div class="checkout-item-qty">${item.detail} · QTY: 1</div>
      </div>
      <div style="display:flex;align-items:center;gap:.4rem">
        <div class="checkout-item-price">$${item.price.toFixed(2)}</div>
        <button class="remove-item-btn" data-idx="${idx}" title="Remove">✕</button>
      </div>
    </div>
  `).join('');

  itemsEl.querySelectorAll('.remove-item-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      cart.splice(parseInt(btn.dataset.idx), 1);
      updateCartBadge();
      renderCheckout();
    });
  });

  const subtotal = cart.reduce((s, i) => s + i.price, 0);
  const tax      = subtotal * 0.08;
  const total    = Math.max(0, subtotal + tax - bonusDiscount);

  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  taxEl.textContent      = `$${tax.toFixed(2)}`;
  totalEl.textContent    = `$${total.toFixed(2)}`;

  let discRow = document.getElementById('co-discount-row');
  if (bonusDiscount > 0) {
    if (!discRow) {
      discRow = document.createElement('div');
      discRow.id = 'co-discount-row';
      discRow.className = 'subtotal-row';
      discRow.innerHTML = `<span style="color:var(--green)">Bonus Discount</span><span style="color:var(--green)" id="co-disc-val"></span>`;
      document.querySelector('.checkout-subtotals').appendChild(discRow);
    }
    document.getElementById('co-disc-val').textContent = `-$${bonusDiscount.toFixed(2)}`;
  } else if (discRow) {
    discRow.remove();
  }

  // Initialize map after form is rendered
  setTimeout(() => { initializeMap(); }, 100);
}

// ─────────────────────────────────────────────
// PAYMENT ICONS
// ─────────────────────────────────────────────
document.querySelectorAll('.pay-icon').forEach((btn, i) => {
  btn.addEventListener('click', () => {
    showToast(['Bitcoin', 'Ethereum', 'NFC / Contactless'][i] + ' payment — coming soon!');
  });
});

// ─────────────────────────────────────────────
// PAY NOW
// ─────────────────────────────────────────────
document.getElementById('pay-btn').addEventListener('click', async () => {
  if (cart.length === 0) { showToast('Your cart is empty!'); return; }
  
  const nameInput = document.getElementById('co-name');
  const phoneInput = document.getElementById('co-phone');
  
  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  
  let ok = true;
  if (!name) { nameInput.style.borderColor = 'rgba(255,80,80,.6)'; ok = false; } else { nameInput.style.borderColor = ''; }
  if (!phone) { phoneInput.style.borderColor = 'rgba(255,80,80,.6)'; ok = false; } else { phoneInput.style.borderColor = ''; }
  if (!selectedLocation.lat || !selectedLocation.lng) { 
    showToast('Please select a location on the map.'); 
    ok = false; 
  }
  
  if (!ok) { showToast('Please fill in all fields.'); return; }

  // Send order to Telegram
  showToast('Sending order...');
  const message = formatOrderMessage(name, phone);
  const success = await sendToTelegram(message);
  
  if (success) {
    // Send images as separate messages
    for (let item of cart) {
      if (item.image && item.image.startsWith('data:')) {
        await sendImageToTelegram(item.name, item.image);
      }
    }
    
    const snapshot = [...cart];
    cart.length = 0;
    bonusDiscount = 0;
    bonusPoints += 1250;
    updateCartBadge();
    renderSuccess(snapshot);
    showPage('success');
    showToast('Order sent successfully! ✓');
  } else {
    showToast('Error sending order. Please try again.');
  }
});

// ─────────────────────────────────────────────
// FORMAT ORDER MESSAGE FOR TELEGRAM
// ─────────────────────────────────────────────
function formatOrderMessage(name, phone) {
  const orderNum = `CYO-${Math.floor(100000 + Math.random() * 900000)}`;
  let message = `📦 *NEW ORDER* #${orderNum}\n\n`;
  message += `👤 *Name:* ${name}\n`;
  message += `📱 *Phone:* ${phone}\n`;
  message += `📍 *Location:* ${selectedLocation.text}\n`;
  message += `🌐 *Coordinates:* ${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}\n\n`;
  
  message += `*Items:*\n`;
  cart.forEach((item, idx) => {
    message += `${idx + 1}. ${item.name} (${item.detail}) - $${item.price.toFixed(2)}\n`;
    if (item.image) {
      message += `   🖼️ Custom image uploaded\n`;
    }
  });
  
  const subtotal = cart.reduce((s, i) => s + i.price, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax - bonusDiscount;
  
  message += `\n💰 *Total:* $${total.toFixed(2)}\n`;
  message += `📊 Subtotal: $${subtotal.toFixed(2)}\n`;
  message += `📊 Tax: $${tax.toFixed(2)}\n`;
  
  if (bonusDiscount > 0) {
    message += `🎁 Bonus Discount: -$${bonusDiscount.toFixed(2)}\n`;
  }
  
  return message;
}

// ─────────────────────────────────────────────
// SEND TO TELEGRAM BOT
// ─────────────────────────────────────────────
async function sendToTelegram(message) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });
    return response.ok;
  } catch (e) {
    console.error('Telegram error:', e);
    return false;
  }
}

// ─────────────────────────────────────────────
// SEND IMAGE TO TELEGRAM BOT
// ─────────────────────────────────────────────
async function sendImageToTelegram(productName, imageData) {
  try {
    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHAT_ID);
    formData.append('caption', `Custom image for: ${productName}`);
    
    // Convert base64 to blob
    const response = await fetch(imageData);
    const blob = await response.blob();
    formData.append('photo', blob, `${productName}.jpg`);
    
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      body: formData
    });
  } catch (e) {
    console.error('Image send error:', e);
  }
}

// ─────────────────────────────────────────────
// INITIALIZE MAP
// ─────────────────────────────────────────────
function initializeMap() {
  const mapContainer = document.getElementById('map-container');
  if (!mapContainer || map) return;
  
  map = L.map('map-container').setView([40, 0], 2);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 19
  }).addTo(map);
  
  map.on('click', (e) => {
    const { lat, lng } = e.latlng;
    selectedLocation.lat = lat;
    selectedLocation.lng = lng;
    
    // Reverse geocoding using OpenStreetMap
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      .then(r => r.json())
      .then(data => {
        selectedLocation.text = data.address?.city || data.address?.town || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        document.getElementById('location-display').textContent = `📍 ${selectedLocation.text}`;
      })
      .catch(() => {
        selectedLocation.text = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        document.getElementById('location-display').textContent = `📍 ${selectedLocation.text}`;
      });
    
    if (mapMarker) map.removeLayer(mapMarker);
    mapMarker = L.marker([lat, lng]).addTo(map);
  });
}

// ─────────────────────────────────────────────
// SUCCESS PAGE
// ─────────────────────────────────────────────
function renderSuccess(snapshot) {
  const items      = document.getElementById('success-items');
  const subtotalEl = document.getElementById('su-subtotal');
  const totalEl    = document.getElementById('su-total');
  const orderEl    = document.querySelector('.success-order');

  const displayCart = (snapshot && snapshot.length > 0) ? snapshot : [
    { name: 'Custom Leather Backpack', detail: 'QTY: 1', price: 145, emoji: '🎒' },
    { name: 'Minimalist Wallet',       detail: 'QTY: 1', price: 20,  emoji: '👜' }
  ];

  if (orderEl) orderEl.textContent = `ORDER #CYO-${Math.floor(100000 + Math.random() * 900000)}`;

  items.innerHTML = displayCart.map(item => `
    <div class="checkout-item">
      <div class="checkout-item-thumb">${item.image ? `<img src="${item.image}" style="width:100%;height:100%;object-fit:cover;">` : item.emoji}</div>
      <div class="checkout-item-info">
        <div class="checkout-item-name">${item.name}</div>
        <div class="checkout-item-qty">${item.detail}</div>
      </div>
      <div class="checkout-item-price">$${item.price.toFixed(2)}</div>
    </div>
  `).join('');

  const total = displayCart.reduce((s, i) => s + i.price, 0);
  subtotalEl.textContent = `$${total.toFixed(2)}`;
  totalEl.textContent    = `$${total.toFixed(2)}`;
}

// ─────────────────────────────────────────────
// BONUS PAGE
// ─────────────────────────────────────────────
function renderBonusBalance() {
  const el = document.querySelector('.balance-num');
  if (el) el.innerHTML = `${bonusPoints.toLocaleString()} <span class="balance-unit">NP</span>`;
}

document.querySelectorAll('.exchange-btn').forEach((btn, i) => {
  const costs = [100, 200], discounts = [5, 12];
  btn.addEventListener('click', () => {
    if (bonusPoints < costs[i]) { showToast(`Need ${costs[i]} NP for this exchange.`); return; }
    bonusPoints  -= costs[i];
    bonusDiscount = discounts[i];
    renderBonusBalance();
    btn.textContent = '✓'; btn.style.color = 'var(--green)';
    setTimeout(() => { btn.textContent = '⇄'; btn.style.color = ''; }, 2000);
    showToast(`$${discounts[i]} discount applied to your next order! ✓`);
  });
});

document.querySelectorAll('.tactical-card .btn-primary').forEach(btn => {
  btn.addEventListener('click', () => {
    const dots   = document.querySelectorAll('.tdot');
    const filled = document.querySelectorAll('.tdot-filled').length;
    if (filled >= dots.length) {
      dots.forEach(d => d.classList.remove('tdot-filled'));
      bonusPoints += 250; renderBonusBalance();
      showToast('Cycle complete! +250 NP awarded 🎉');
    } else {
      dots[filled]?.classList.add('tdot-filled');
      showToast('Progress synced!');
    }
  });
});

// ─────────────────────────────────────────────
// IMAGE UPLOAD
// ─────────────────────────────────────────────
[
  { area: 'upload-area-backpack', file: 'file-backpack', preview: 'preview-backpack', remove: 'remove-backpack' },
  { area: 'upload-area-wallet',   file: 'file-wallet',   preview: 'preview-wallet',   remove: 'remove-wallet'   },
  { area: 'upload-area-tshirt',   file: 'file-tshirt',   preview: 'preview-tshirt',   remove: 'remove-tshirt'   },
  { area: 'upload-area-hoodie',   file: 'file-hoodie',   preview: 'preview-hoodie',   remove: 'remove-hoodie'   },
].forEach(({ area, file, preview, remove }) => {
  const areaEl = document.getElementById(area), fileEl = document.getElementById(file),
        prevEl = document.getElementById(preview), rmEl  = document.getElementById(remove);
  if (!areaEl || !fileEl || !prevEl || !rmEl) return;

  fileEl.addEventListener('change', () => { if (fileEl.files[0]) loadImage(fileEl.files[0], areaEl, prevEl); });
  areaEl.addEventListener('dragover',  e => { e.preventDefault(); areaEl.classList.add('drag-over'); });
  areaEl.addEventListener('dragleave', () => areaEl.classList.remove('drag-over'));
  areaEl.addEventListener('drop', e => {
    e.preventDefault(); areaEl.classList.remove('drag-over');
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith('image/')) loadImage(f, areaEl, prevEl);
  });
  rmEl.addEventListener('click', e => {
    e.stopPropagation(); e.preventDefault();
    areaEl.classList.remove('has-image'); prevEl.src = ''; fileEl.value = '';
  });
});

function loadImage(file, area, preview) {
  const r = new FileReader();
  r.onload = e => { preview.src = e.target.result; area.classList.add('has-image'); };
  r.readAsDataURL(file);
}

// ─────────────────────────────────────────────
// HAMBURGER MENU
// ─────────────────────────────────────────────
const menuBtn     = document.querySelector('.nav-menu-btn');
const mobileMenu  = document.getElementById('mobile-menu');
const menuOverlay = document.getElementById('menu-overlay');

function openMenu()  { mobileMenu.classList.add('open'); menuOverlay.classList.add('open'); menuBtn.classList.add('active'); }
function closeMenu() { mobileMenu.classList.remove('open'); menuOverlay.classList.remove('open'); menuBtn.classList.remove('active'); }

menuBtn.addEventListener('click', () => mobileMenu.classList.contains('open') ? closeMenu() : openMenu());
menuOverlay.addEventListener('click', closeMenu);

document.querySelectorAll('.mobile-nav-link').forEach(link => {
  link.addEventListener('click', () => {
    const page = link.dataset.page;
    closeMenu();
    setTimeout(() => { if (page === 'checkout') renderCheckout(); showPage(page); }, 300);
  });
});

// ─────────────────────────────────────────────
// INJECT REMOVE ITEM STYLE
// ─────────────────────────────────────────────
const st = document.createElement('style');
st.textContent = `.remove-item-btn{background:none;border:1px solid rgba(255,80,80,.3);border-radius:50%;width:22px;height:22px;color:rgba(255,80,80,.6);font-size:.65rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0}.remove-item-btn:hover{background:rgba(255,80,80,.15);border-color:rgba(255,80,80,.8);color:#ff5555}`;
document.head.appendChild(st);

// ─────────────────────────────────────────────
// STAGGER ANIMATIONS
// ─────────────────────────────────────────────
['module-card','process-card'].forEach(cls =>
  document.querySelectorAll(`.${cls}`).forEach((el, i) =>
    el.style.animation = `slideUp .5s ${i * 0.08}s ease both`));

// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────
showPage('home');
renderBonusBalance();
