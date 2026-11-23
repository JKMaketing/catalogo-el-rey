/* Preview eCommerce El Rey · app principal (sin dependencias) */
(() => {
'use strict';
const R = window.REY, P = R.products;
const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
const money = n => '$' + Math.round(n).toLocaleString('es-CO');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ROOT = document.documentElement.dataset.root || './';
const BASE = new URL(ROOT, location.href).pathname;            // ruta absoluta de la raíz del sitio
const A = ROOT === '/' ? '/' : BASE;
const asset = p => A + 'assets/' + p;
const img = (id, s) => asset('img/' + id + (s ? '-' + s : '') + '.webp');
const url = r => A + r;
// Los enlaces fijos del menú y el pie vienen relativos ({{ROOT}}); se vuelven absolutos para que sigan funcionando al navegar dentro de la SPA.
if (ROOT !== '/') document.querySelectorAll('a[href], img[src]').forEach(a => { const k = a.tagName === 'IMG' ? 'src' : 'href', h = a.getAttribute(k); if (h && h.startsWith(ROOT)) a.setAttribute(k, BASE + h.slice(ROOT.length)) });
const byId = id => P.find(p => p.id === id);
const brandName = b => b === 'colchones' ? 'Colchones El Rey' : 'Muebles El Rey';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = { get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} } };
const COMBO_OFF = 0.05;

/* ───── Íconos SVG uniformes (reemplazan cualquier emoji del sitio, del bot y del CRM) ───── */
const ICN = {
  crown: '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5L3 8z"/><path d="M5 19h14"/>',
  truck: '<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7.5" cy="17.5" r="1.6"/><circle cx="17.5" cy="17.5" r="1.6"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  card: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z"/>',
  bed: '<path d="M3 19V7M21 19v-5a3 3 0 0 0-3-3h-8v5M3 14h18M3 17h18"/><circle cx="6.5" cy="11" r="1.5"/>',
  sofa: '<path d="M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/><path d="M3 12a2 2 0 0 1 4 0v2h10v-2a2 2 0 1 1 4 0v5H3v-5zM6 17v2M18 17v2"/>',
  dining: '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 2-2 6 0 8v10"/>',
  home: '<path d="M3 11 12 4l9 7M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.8"/><path d="M16 14.2A5.5 5.5 0 0 1 21.5 20"/>',
  family: '<circle cx="7" cy="7" r="3"/><circle cx="17" cy="7" r="3"/><circle cx="12" cy="13" r="2.2"/><path d="M2 20a5 5 0 0 1 9-3M22 20a5 5 0 0 0-9-3M9 21a3 3 0 0 1 6 0"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z"/>',
  heart: '<path d="M12 20s-7-4.4-9-9a4.8 4.8 0 0 1 9-3 4.8 4.8 0 0 1 9 3c-2 4.6-9 9-9 9z"/>',
  wallet: '<path d="M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7zM3 7l12-3v3"/><circle cx="16.5" cy="13.5" r="1.2"/>',
  play: '<path d="M7 4.5v15l12-7.5-12-7.5z"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  factory: '<path d="M3 20V10l5 3v-3l5 3V7l5 3v10H3zM7 17h2M12 17h2M17 17h1"/>',
  shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6l8-3z"/><path d="m9 12 2 2 4-4"/>',
  flame: '<path d="M12 2.5c.8 3.2 5 5.3 5 10a5 5 0 0 1-10 0c0-2.3 1.1-3.8 2.4-5 .1 1.6.8 2.7 2 3.2-.6-2.9-.2-5.8.6-8.2Z"/>',
  gift: '<path d="M4 11h16v9H4zM3 7h18v4H3zM12 7v13M12 7c-1.5-3-5-3.2-5-1s3.5 1 5 1zm0 0c1.5-3 5-3.2 5-1s-3.5 1-5 1z"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
  store: '<path d="M4 9h16l-1.5-4h-13L4 9zM5 9v11h14V9M9.5 20v-5h5v5"/>',
  paw: '<circle cx="6" cy="10" r="1.8"/><circle cx="10" cy="6.5" r="1.8"/><circle cx="14" cy="6.5" r="1.8"/><circle cx="18" cy="10" r="1.8"/><path d="M12 12c-3 0-5.5 3.2-5.5 5.5 0 1.6 1.3 2.5 2.8 2.5 1.2 0 1.8-.6 2.7-.6s1.5.6 2.7.6c1.5 0 2.8-.9 2.8-2.5 0-2.3-2.5-5.5-5.5-5.5z"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  bag: '<path d="M5 7h14l-1.2 12.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9L5 7z"/><path d="M9 7a3 3 0 0 1 6 0"/>',
  pin: '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  bank: '<path d="M3 10 12 4l9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/>',
  box: '<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/>',
  alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5h.01"/>',
  chart: '<path d="M4 20V4M4 20h16"/><path d="m7 15 4-4 3 3 5-6"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z"/><path d="M9 8h6M9 12h6"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.6-1 1.1-2-.6-1.2.2-2.5 1.6-2.5H17a4 4 0 0 0 4-4C21 7.4 17 3 12 3z"/><path d="M7.5 11h.01M10 7.5h.01M14.5 7.5h.01"/>',
  ruler: '<path d="M3 17 17 3l4 4L7 21l-4-4z"/><path d="m7 13 2 2M10 10l2 2M13 7l2 2"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  x: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',
  send: '<path d="M4 12 20 4l-4 16-4-7-8-1z"/>',
  wa: '<path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.4L3.5 20l1.1-4.2A8.5 8.5 0 1 1 20.5 11.6z"/><path d="M9.2 8.3c.2 2.9 2.6 5.4 5.6 5.9l1.2-1.4 1.6.8-.4 1.7c-4.1.1-7.9-3.7-8-7.6l1.6-.6.9 1.6-.9 1"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
  hotel: '<path d="M4 21V4h11v17M15 9h5v12M2 21h20M8 8h3M8 12h3M8 16h3"/>'
};
const icon = (n, c) => '<svg class="ei' + (c ? ' ' + c : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICN[n] || ICN.sparkle) + '</svg>';
const EMO = { '👑': 'crown', '🚚': 'truck', '🔒': 'lock', '💳': 'card', '⭐': 'star', '🛏️': 'bed', '🛏': 'bed', '🛋️': 'sofa', '🛋': 'sofa', '🍽️': 'dining', '🍽': 'dining', '🏠': 'home', '🏡': 'home', '🙋': 'user', '👫': 'users', '💑': 'users', '👨‍👩‍👧': 'family', '👧': 'family', '🎉': 'sparkle', '✨': 'sparkle', '💚': 'wallet', '💛': 'wallet', '🧡': 'wallet', '❤️': 'heart', '▶': 'play', '❚❚': 'pause', '🏭': 'factory', '🛡️': 'shield', '🛡': 'shield', '🔥': 'flame', '🎁': 'gift', '🔁': 'refresh', '↩️': 'undo', '↺': 'refresh', '🏬': 'store', '🐶': 'paw', '🐾': 'paw', '✅': 'check', '🛒': 'bag', '📍': 'pin', '🏦': 'bank', '📱': 'phone', '📦': 'box', '😕': 'alert', '📈': 'chart', '💬': 'chat', '🧾': 'receipt', '🎨': 'palette', '📏': 'ruler', '⏳': 'clock', '❌': 'x', '➤': 'send', '🏢': 'briefcase', '🏨': 'hotel' };
const EMO_RE = /(\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic}️?)*|❚❚|[▶➤↺]️?)/gu;
const KEEP = '©®™★☆✓✔✦';
const fx = s => s.replace(EMO_RE, m => { if (KEEP.includes(m)) return m; const k = EMO[m] || EMO[m.replace(/️/g, '')]; return k ? icon(k) : '' }).replace(/ {2,}/g, ' ');
// Cualquier HTML que se pinte pasa por fx: así ningún emoji llega a la pantalla y todos los íconos son iguales.
['innerHTML'].forEach(prop => { const d = Object.getOwnPropertyDescriptor(Element.prototype, prop); Object.defineProperty(Element.prototype, prop, { configurable: true, get() { return d.get.call(this) }, set(v) { d.set.call(this, typeof v === 'string' && EMO_RE.test(v) ? (EMO_RE.lastIndex = 0, fx(v)) : v); EMO_RE.lastIndex = 0 } }) });
const _iah = Element.prototype.insertAdjacentHTML; Element.prototype.insertAdjacentHTML = function (pos, html) { EMO_RE.lastIndex = 0; const ok = typeof html === 'string' && EMO_RE.test(html); EMO_RE.lastIndex = 0; return _iah.call(this, pos, ok ? fx(html) : html) };
window.REY_ICON = icon; window.REY_FX = fx;

/* ───── Medición (simulada): Meta Pixel + GA4 + recorrido para el CRM ───── */
window.dataLayer = window.dataLayer || [];
const utm = Object.fromEntries([...new URLSearchParams(location.search)].filter(([k]) => /^(utm_|fbclid|gclid|ctwa)/.test(k)));
if (Object.keys(utm).length) store.set('rey.utm', utm);
function track(ev, data = {}) {
  const e = { ev, ...data, t: new Date().toLocaleTimeString('es-CO') };
  window.dataLayer.push(e);
  const j = store.get('rey.journey', []); j.push(e); store.set('rey.journey', j.slice(-40));
  const log = $('#pixelLog'); if (log) { const d = document.createElement('div'); d.textContent = '▸ ' + ev + (data.name ? ' · ' + data.name : '') + (data.value ? ' · ' + money(data.value) : ''); log.append(d); log.scrollTop = 1e6; }
}

/* ───── Carrito ───── */
let cart = store.get('rey.cart', []).filter(l => byId(l.id));
const lineKey = l => [l.id, l.size, l.color || ''].join('|');
const linePrice = l => { const p = byId(l.id); const s = p.sizes[l.size] || p.sizes[0]; return s.p * (1 - (l.disc || 0)); };
const cartTotals = () => {
  const g = { colchones: 0, muebles: 0 }; cart.forEach(l => g[byId(l.id).brand] += linePrice(l) * l.qty);
  return { ...g, total: g.colchones + g.muebles, items: cart.reduce((n, l) => n + l.qty, 0) };
};
function saveCart() { store.set('rey.cart', cart); const c = $('#cartCount'), n = cartTotals().items; c.textContent = n; c.classList.toggle('on', n > 0); c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); }
function addToCart(id, size, color, qty = 1, disc = 0, silent) {
  const p = byId(id); if (!p) return;
  size = size ?? p.defSize ?? 0; color = color ?? (p.colors ? p.colors[0].name : '');
  const l = { id, size, color, qty, disc }; const ex = cart.find(x => lineKey(x) === lineKey(l));
  if (ex) { ex.qty = Math.min(9, ex.qty + qty); ex.disc = Math.max(ex.disc || 0, disc) } else cart.push(l);
  saveCart(); track('AddToCart', { name: p.name, value: linePrice(l) * qty, content_ids: [id] });
  if (!silent) toast('<img src="' + lineImg(l, 400) + '" alt="">' + '<div><b>' + esc(p.name) + '</b> agregado<br><a href="#" data-open-cart>Ver carrito →</a></div>');
}
let toastT; function toast(html, ms = 3600) { const t = $('#toast'); t.innerHTML = html; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), ms); }

function openCart() {
  const d = $('#cart'), T = cartTotals();
  const groups = ['colchones', 'muebles'].filter(b => cart.some(l => byId(l.id).brand === b));
  const ups = P.find(p => p.id === 'almohada-viscoelastica' && !cart.some(l => l.id === p.id)) || P.find(p => p.id === 'set-puff-mesa' && !cart.some(l => l.id === p.id));
  d.innerHTML = '<div class="dhead"><h3>Tu carrito (' + T.items + ')</h3><button class="x" data-close aria-label="Cerrar">×</button></div>' +
    (cart.length ? '<div class="dbody"><div class="ship-meter">🚚 <b>Envío GRATIS</b> en Pereira, Dosquebradas, Santa Rosa, Manizales, Armenia y Cartago. Lo confirmas con tu municipio en el siguiente paso.</div>' +
      groups.map(b => '<div class="cgroup"><h4><span>' + brandName(b) + '</span><span>' + money(T[b]) + '</span></h4>' + cart.map((l, i) => ({ l, i })).filter(x => byId(x.l.id).brand === b).map(({ l, i }) => { const p = byId(l.id); return '<div class="cline"><img src="' + lineImg(l, 400) + '" alt=""><div><b>' + esc(p.name) + '</b><span class="meta">' + esc(p.sizes[l.size].l) + (l.color ? ' · ' + esc(l.color) : '') + (l.disc ? ' · Combo -' + l.disc * 100 + '%' : '') + '</span><div class="mini-qty"><button data-q="' + i + '" data-d="-1" aria-label="Menos">−</button><span>' + l.qty + '</span><button data-q="' + i + '" data-d="1" aria-label="Más">+</button> <button class="rm" data-rm="' + i + '">Quitar</button></div></div><b>' + money(linePrice(l) * l.qty) + '</b></div>' }).join('') + '</div>').join('') +
      (ups ? '<div class="upsell"><img src="' + img(ups.imgs[0], 400) + '" alt=""><div style="flex:1"><b style="font-size:13.5px">Complétalo con ' + esc(ups.name) + '</b><br><span class="small muted">' + money(ups.price) + '</span></div><button class="btn sm" data-add="' + ups.id + '">Agregar</button></div>' : '') +
      (groups.length > 1 ? '<p class="small muted">🔒 Tu compra incluye productos de dos marcas: verás dos cobros separados, uno para cada una, en el mismo pago.</p>' : '') +
      '</div><div class="dfoot"><div class="totals"><div><span>Subtotal</span><span>' + money(T.total) + '</span></div><div><span>Envío</span><span>Se calcula con tu municipio</span></div><div class="grand"><span>Total</span><span>' + money(T.total) + '</span></div></div><a class="btn block shine" style="margin-top:14px" href="' + url('checkout/') + '" data-link data-close>Finalizar compra →</a><a class="btn block ghost" style="margin-top:8px" target="_blank" rel="noopener" href="' + waLink(cartText()) + '">Prefiero comprar por WhatsApp</a><p class="small muted" style="text-align:center;margin:10px 0 0">Paga con tarjeta, PSE, Nequi, Addi o Sistecrédito</p></div>'
      : '<div class="dbody" style="text-align:center;padding-top:60px"><div style="font-size:56px">👑</div><h3>Tu carrito está esperando a su rey</h3><p>Empieza por lo que más te cambia la vida: dormir bien.</p><a class="btn" href="' + url('colchones/') + '" data-link data-close>Ver colchones</a> <a class="btn ghost" style="margin-top:8px" href="' + url('muebles/') + '" data-link data-close>Ver muebles</a></div>');
  d.classList.add('on'); d.setAttribute('aria-hidden', 'false'); $('#scrim').classList.add('on');
}
function closeAll() { $('#cart').classList.remove('on'); $('#cart').setAttribute('aria-hidden', 'true'); $('#scrim').classList.remove('on'); $('#nav').classList.remove('on'); }
const waNum = () => R.stores[0].wa;
const waLink = t => 'https://wa.me/' + waNum() + '?text=' + encodeURIComponent(t);
const cartText = () => 'Hola El Rey 👑 quiero comprar:\n' + cart.map(l => { const p = byId(l.id); return '• ' + l.qty + ' × ' + p.name + ' (' + p.sizes[l.size].l + (l.color ? ', ' + l.color : '') + ') ' + money(linePrice(l) * l.qty) }).join('\n') + '\nTotal: ' + money(cartTotals().total);

/* ───── Tarjeta de producto ───── */
function card(p, i = 0) {
  const minP = Math.min(...p.sizes.map(s => s.p));
  return '<article class="card rv d' + (i % 4) + '"><a class="ph" href="' + url('producto/' + p.id + '/') + '" data-link aria-label="' + esc(p.name) + '"><img src="' + img(p.imgs[0], 400) + '" srcset="' + img(p.imgs[0], 400) + ' 400w, ' + img(p.imgs[0]) + ' 800w" sizes="(max-width:900px) 50vw, 25vw" width="400" height="400" loading="lazy" alt="' + esc(p.name) + '">' +
    (p.imgs[1] ? '<img class="alt" src="' + img(p.imgs[1], 400) + '" width="400" height="400" loading="lazy" alt="">' : '') +
    '<span class="tags">' + (p.badge ? '<span class="tag red">' + esc(p.badge) + '</span>' : '') + (p.nuevo ? '<span class="tag gold">Nuevo</span>' : '') + (p.bestseller && !p.nuevo ? '<span class="tag">Más vendido</span>' : '') + (p.recolor ? '<span class="tag dark">Cambia el color</span>' : '') + '</span>' +
    '</a><div class="quick"><button class="btn sm block" data-add="' + p.id + '">Agregar al carrito</button></div>' +
    '<span class="brandname">' + brandName(p.brand) + '</span><h3><a href="' + url('producto/' + p.id + '/') + '" data-link>' + esc(p.name) + '</a></h3><p class="tl">' + esc(p.tagline) + '</p>' +
    '<div class="price">' + (p.sizes.length > 1 ? '<span class="from">Desde </span>' : '') + money(minP) + '</div>' +
    (p.colors ? '<div class="swatch-row">' + p.colors.slice(0, 6).map(c => '<i title="' + esc(c.name) + '" style="background:' + c.hex + '"></i>').join('') + '</div>' : '') + '</article>';
}

/* ───── Vistas ───── */
const V = {};
V.home = () => {
  const best = P.filter(p => p.bestseller);
  return '<section class="hero"><span class="blob b1"></span><span class="blob b2"></span><div class="wrap">' +
  '<div><span class="kicker">El Rey · Pereira y Cartago</span><h1 class="split-text">Duerme como un rey. <em>Vive tu casa</em> como un reino.</h1>' +
  '<p class="lead">Colchones de fábrica y muebles que se sienten hogar. Elige tu medida, cambia el color de tu sala en la foto y recíbelo en casa.</p>' +
  '<div class="ctas"><a class="btn shine" href="' + url('producto/colchon-gran-duque/') + '" data-link>Quiero el Gran Duque · ' + money(1100000) + '</a><a class="btn ghost" href="' + url('muebles/') + '" data-link>Ver salas y comedores</a></div>' +
  '<div class="trustline"><span>🚚 Envío <b>GRATIS</b> en 6 ciudades</span><span>💳 Cuotas con Addi y Sistecrédito</span><span>⭐ Opiniones reales en Google</span></div></div>' +
  '<div class="hero-art" id="heroArt"><div class="tile t1" data-par="-0.04"><img src="' + img('gd-1') + '" alt="Colchón Gran Duque" fetchpriority="high" width="800" height="800"></div>' +
  '<div class="tile t2" data-par="0.06"><video muted playsinline loop preload="none" poster="' + img('gd-video-poster') + '" data-src="' + asset('video/gran-duque.mp4') + '" aria-label="Video Gran Duque"></video></div>' +
  '<div class="tile t3" data-par="0.1"><img src="' + img('venecia', 400) + '" alt="Sala Venecia" width="400" height="400"></div>' +
  '<a class="chip-float c1" href="' + url('producto/colchon-gran-duque/') + '" data-link><b>Base cama GRATIS</b>con tu Gran Duque doble</a><a class="chip-float c2" href="' + url('producto/colchon-gran-duque/') + '" data-link><b>40 cm</b>doble pillow top</a></div></div></section>' +
  bfBanner() +
  '<section class="section"><div class="wrap"><span class="kicker rv">Dos marcas, un mismo hogar</span><h2 class="rv">¿Qué quieres renovar hoy?</h2><div class="worlds">' +
  '<a class="world rv" href="' + url('colchones/') + '" data-link><img src="' + img('h-gd') + '" alt="" loading="lazy"><div class="in"><span class="kicker">Colchones El Rey</span><h3>Tu descanso, a tu medida.</h3><p>Colchones, camas y almohadas de fábrica. Levántate sin dolor de espalda y con energía de rey.</p><div class="pills"><span>Gran Duque</span><span>Camas de lujo</span><span>Almohadas</span></div></div></a>' +
  '<a class="world rv d1" href="' + url('muebles/') + '" data-link><img src="' + img('h-venecia') + '" alt="" loading="lazy"><div class="in"><span class="kicker">Muebles El Rey</span><h3>Una sala que dice “quédate”.</h3><p>Salas, esquineras y comedores. Elige la tela y mira el color en la foto antes de comprar.</p><div class="pills"><span>Salas</span><span>Comedores</span><span>Complementos</span></div></div></a></div></div></section>' +
  quiz() +
  '<section class="section" style="padding-top:20px"><div class="wrap"><div style="display:flex;justify-content:space-between;align-items:end;gap:20px;flex-wrap:wrap"><div><span class="kicker rv">Los favoritos del Eje Cafetero</span><h2 class="rv">Lo que más se llevan.</h2></div><a class="link" href="' + url('tienda/') + '" data-link>Ver toda la tienda →</a></div><div class="grid">' + best.map(card).join('') + '</div></div></section>' +
  homeBand(R.homes[0], true) +
  '<section class="section"><div class="wrap"><span class="kicker rv">Compra por espacio</span><h2 class="rv">Cada rincón, resuelto.</h2><div class="rooms">' +
  [['habitacion', 'Habitación', 'Colchones y camas', 'h-gd'], ['sala', 'Sala', 'Salas y esquineras', 'h-capriani'], ['comedor', 'Comedor', '4 y 6 puestos', 'h-orion']].map(([r, n, s, im], i) => '<a class="room rv d' + i + '" href="' + url(r + '/') + '" data-link><img src="' + img(im, 800) + '" alt="" loading="lazy"><span>' + n + '<small>' + s + ' →</small></span></a>').join('') + '</div></div></section>' +
  feature() + novedades() + reviews() + why() + proyectosTeaser() + stores() + faq();
};
function novedades() {
  const ns = P.filter(p => p.nuevo);
  return '<section class="section"><div class="wrap"><div class="sec-top"><div><span class="kicker rv">Novedades</span><h2 class="rv">Lo último que llegó al almacén.</h2></div><a class="link" href="' + url('novedades/') + '" data-link>Ver todas las novedades →</a></div><div class="grid">' + ns.map(card).join('') + '</div></div></section>';
}
function proyectosTeaser() {
  return '<section class="section"><div class="wrap"><a class="proj-teaser rv" href="' + url('proyectos/') + '" data-link><div><span class="kicker">Proyectos a la medida</span><h2>¿Amoblas un hotel, un negocio o tu casa completa?</h2><p>Colchones, camas, salas y comedores por volumen, con asesoría y cotización por escrito.</p><span class="btn">Cotizar mi proyecto →</span></div><div class="proj-icons"><span>🏢</span><span>🏨</span><span>🏠</span></div></a></div></section>';
}
function bfBanner() {
  const items = ['colchon-gran-duque', 'sala-venecia', 'cama-gran-duque-lujo'].map(byId);
  return '<section class="section" style="padding-bottom:0"><div class="wrap"><div class="bf-banner rv"><div><span class="kicker">Temporada Black Friday</span><h2>Lo que tu casa pedía, al precio que estabas esperando.</h2><p>Selección especial El Rey mientras duren las unidades. Base cama gratis, precios especiales y envío gratis en 6 ciudades.</p><a class="bf-tag" href="' + url('promos/') + '" data-link>Hasta agotar unidades</a><div class="bf-strip">' +
    items.map(p => '<a href="' + url('producto/' + p.id + '/') + '" data-link><img src="' + img(p.imgs[0], 400) + '" alt=""><span>' + esc(p.name) + '<b>' + money(p.price) + '</b></span></a>').join('') + '</div></div>' +
    '<div><p class="small" style="color:#bdb3a4;margin:0 0 8px">Termina en</p><div class="countdown" id="countdown"><div><b>00</b><small>días</small></div><div><b>00</b><small>horas</small></div><div><b>00</b><small>min</small></div><div><b>00</b><small>seg</small></div></div><a class="btn gold shine" style="margin-top:22px" href="' + url('promos/') + '" data-link>Ver todas las promos →</a></div></div></div></section>';
}
function quiz() {
  return '<section class="section"><div class="wrap"><div class="quiz rv"><div><span class="kicker">Asesoría en 30 segundos</span><h2>¿No sabes cuál elegir? Te guiamos.</h2><p>Tres preguntas y te mostramos la opción que mejor encaja con tu espacio, tu forma de dormir y tu presupuesto.</p><p class="small muted">También puedes hablar con nuestra guía 👑 abajo a la derecha.</p></div><div class="quiz-q" id="quiz"></div></div></div></section>';
}
const QZ = [
  { q: '¿Qué quieres renovar?', k: 'what', o: [['🛏️', 'Mi descanso', 'sleep'], ['🛋️', 'Mi sala', 'sala'], ['🍽️', 'Mi comedor', 'comedor'], ['🏠', 'Todo: estreno casa', 'all']] },
  { q: '¿Para cuántas personas?', k: 'who', o: [['🙋', 'Solo yo', '1'], ['👫', 'En pareja', '2'], ['👨‍👩‍👧', 'Familia', '4'], ['🎉', 'Recibo visitas', '6']] },
  { q: '¿Qué presupuesto quieres cuidar?', k: 'bud', o: [['💚', 'Hasta $1.000.000', '1000000'], ['💛', '$1 – 2 millones', '2000000'], ['🧡', '$2 – 3,5 millones', '3500000'], ['❤️', 'Lo mejor, a cuotas', '9e9']] }
];
let qa = {};
function renderQuiz(step = 0) {
  const el = $('#quiz'); if (!el) return;
  if (step < QZ.length) {
    const s = QZ[step];
    el.innerHTML = '<div class="quiz-steps">' + QZ.map((_, i) => '<i class="' + (i <= step ? 'on' : '') + '"></i>').join('') + '</div><span class="small muted">Paso ' + (step + 1) + ' de 3</span><h3>' + s.q + '</h3><div class="opts">' + s.o.map(o => '<button class="opt" data-qz="' + step + '" data-k="' + s.k + '" data-v="' + o[2] + '"><span class="e">' + o[0] + '</span>' + o[1] + '</button>').join('') + '</div>';
    return;
  }
  const bud = +qa.bud, room = { sleep: 'habitacion', sala: 'sala', comedor: 'comedor' }[qa.what];
  let pool = P.filter(p => p.cat !== 'almohadas' && p.cat !== 'complementos' && (!room || p.room === room));
  if (qa.what === 'comedor' && +qa.who >= 6) pool.sort((a, b) => b.sizes.length - a.sizes.length);
  let fit = pool.filter(p => Math.min(...p.sizes.map(s => s.p)) <= bud).sort((a, b) => (b.bestseller - a.bestseller) || b.price - a.price);
  if (!fit.length) fit = pool.sort((a, b) => a.price - b.price);
  const r = fit[0], alt = fit[1];
  const why = qa.what === 'sleep' ? (qa.who === '1' ? 'Para dormir solo te sobra espacio en una semidoble o doble.' : 'En pareja, la medida doble o queen evita que se despierten el uno al otro.') : qa.what === 'sala' ? (qa.who === '6' ? 'Si recibes visitas, una esquinera o sala con poltronas da puestos para todos.' : 'Elige el color en la foto para verla en tu espacio.') : qa.what === 'comedor' ? 'Te confirmamos puestos y medidas según tu espacio.' : 'Empieza por lo que más usas: el colchón. Luego completa la sala con combo.';
  track('Lead', { name: 'Quiz · ' + r.name });
  el.innerHTML = '<div class="quiz-steps">' + QZ.map(() => '<i class="on"></i>').join('') + '</div><span class="kicker">Tu opción ideal</span><div class="quiz-result" style="margin-top:12px"><img src="' + img(r.imgs[0], 400) + '" alt=""><div><h3 style="margin:0">' + esc(r.name) + '</h3><div class="price">' + money(Math.min(...r.sizes.map(s => s.p))) + '</div><p class="small" style="margin:4px 0">' + why + '</p></div></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><a class="btn sm" href="' + url('producto/' + r.id + '/') + '" data-link>Ver y personalizar</a>' + (alt ? '<a class="btn sm ghost" href="' + url('producto/' + alt.id + '/') + '" data-link>Otra opción: ' + esc(alt.name) + '</a>' : '') + '<button class="btn sm ghost" data-qz-reset>Repetir</button></div>';
}
function homeBand(h, big) {
  return '<section class="home-band" data-band><img class="bg" src="' + img(h.img) + '" srcset="' + img(h.img, 800) + ' 800w,' + img(h.img) + ' 1600w" sizes="100vw" alt="Sala en un hogar del Eje Cafetero" loading="lazy">' +
    h.spots.map(s => '<button class="spot" style="left:' + s.x + '%;top:' + s.y + '%" data-spot="' + s.id + '" aria-label="Ver ' + esc(byId(s.id).name) + '">+</button>').join('') +
    '<div class="wrap"><span class="kicker">Hogares del Eje Cafetero · ' + esc(h.place) + '</span><h2>' + (big ? 'Así se ve El Rey en casa.' : esc(h.title)) + '</h2><p>Toca el <b>+</b> para ver el producto de la foto y llevártelo.</p>' + (big ? '<a class="btn gold" href="' + url('hogares/') + '" data-link>Inspírate en más hogares →</a>' : '') + '</div></section>';
}
function feature() {
  return '<section class="section"><div class="wrap feature"><div class="vid rv"><video muted playsinline loop preload="none" poster="' + img('gd-video-poster') + '" data-src="' + asset('video/gran-duque.mp4') + '"></video><span class="sound">▶ Gran Duque en video</span></div>' +
    '<div class="rv d1"><span class="kicker">El más pedido · Gran Duque</span><h2>Sí, leíste bien: base cama GRATIS.</h2><p>Doble pillow top, 40 cm de altura y sensación de firmeza. Media Pereira ya está durmiendo así de sabroso. ¿Y tú?</p>' +
    '<div class="stats"><div><b data-count="40">0</b><span>cm de altura</span></div><div><b data-count="5">0</b><span>años de garantía</span></div><div><b data-count="140">0</b><span>kg recomendados por persona</span></div></div>' +
    '<div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn shine" href="' + url('producto/colchon-gran-duque/') + '" data-link>Elegir mi medida</a><button class="btn ghost" data-add="colchon-gran-duque">Agregar doble · ' + money(1100000) + '</button></div></div></div></section>';
}
function reviews() {
  return '<section class="section reviews-wrap"><div class="wrap"><div class="rev-head"><div><span class="kicker rv">Lo que dicen en Google</span><h2 class="rv">Clientes que ya duermen como reyes.</h2><span class="g-logo"><span style="color:#4285F4">G</span>oogle · Reseñas textuales de la sede Cerritos</span></div><div class="rev-nav"><button class="icon-btn" data-rev="-1" aria-label="Anterior">←</button><button class="icon-btn" data-rev="1" aria-label="Siguiente">→</button></div></div>' +
    '<div class="rev-track" id="revs">' + R.reviews.map(r => '<a class="rev" href="' + R.reviewsUrl + '" target="_blank" rel="noopener" aria-label="Ver reseña de ' + esc(r.n) + ' en Google"><div class="stars" aria-label="5 de 5 estrellas">★★★★★</div><q>' + esc(r.t) + '</q><div class="who"><span class="av">' + esc(r.n[0]) + '</span><div><b>' + esc(r.n) + '</b><br><span class="muted small">' + esc(r.w) + (r.g ? ' · ' + r.g : '') + '</span></div></div></a>').join('') + '</div>' +
    '<a class="link" href="' + R.reviewsUrl + '" target="_blank" rel="noopener">Ver todas las reseñas en Google →</a></div></section>';
}
function why() {
  return '<section class="section"><div class="wrap"><div class="why">' + [['🏭', 'De fábrica', 'Colchones de la casa El Rey, sin intermediarios.', 'colchones/'], ['🚚', 'Envío gratis', 'En Pereira, Dosquebradas, Santa Rosa, Manizales, Armenia y Cartago.', '#faq'], ['💳', 'Paga a tu ritmo', 'Tarjeta, PSE, Nequi o a cuotas con Addi y Sistecrédito.', '#faq'], ['🛡️', 'Garantía real', '5 años en el Gran Duque y atención por WhatsApp.', 'producto/colchon-gran-duque/']].map((w, i) => '<a class="rv d' + i + '" href="' + url(w[3]) + '" data-link><span class="ic">' + w[0] + '</span><b>' + w[1] + '</b><p>' + w[2] + '</p><span class="go">Ver más →</span></a>').join('') + '</div></div></section>';
}
function stores() {
  return '<section class="section" style="padding-top:0"><div class="wrap"><span class="kicker rv">Ven a probarlos</span><h2 class="rv">Acuéstate antes de decidir.</h2><div class="stores">' + R.stores.map(s => '<div class="store rv"><span class="kicker">' + esc(s.city) + '</span><h3>' + esc(s.addr) + '</h3><p class="muted small">Prueba camas, colchones y muebles en el almacén.</p><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:auto"><a class="btn sm wa" target="_blank" rel="noopener" href="https://wa.me/' + s.wa + '?text=' + encodeURIComponent('Hola El Rey 👑 vi la tienda en línea y quiero asesoría') + '" data-wa>WhatsApp ' + s.waLabel + '</a><a class="btn sm ghost" target="_blank" rel="noopener" href="' + s.map + '">Cómo llegar</a></div></div>').join('') + '</div></div></section>';
}
function faq() {
  const f = [['¿El envío es gratis?', 'Sí en Pereira, Dosquebradas, Santa Rosa de Cabal, Manizales, Armenia y Cartago. En 55 municipios más del Eje Cafetero y el norte del Valle cuesta $40.000. Entregamos en zona urbana; en zona rural, en el casco urbano.'], ['¿Puedo pagar a cuotas?', 'Sí: con tarjeta de crédito o con Addi y Sistecrédito. También aceptamos PSE y Nequi.'], ['Compré colchón y sala, ¿por qué veo dos cobros?', 'Colchones El Rey y Muebles El Rey son dos empresas. Pagas una sola vez y cada marca recibe lo suyo con su propia factura.'], ['¿Qué garantía tiene el Gran Duque?', '5 años. No cubre el forro por humedad. Rótalo cada 30 días y evita que los niños salten sobre él.'], ['¿Puedo ver la tela antes?', 'Sí. En la foto cambias el color como referencia, y en el almacén o por WhatsApp te mostramos la muestra física.'], ['¿Y si me arrepiento?', 'Por ser una compra en línea tienes derecho de retracto: 5 días hábiles desde la entrega para devolver el producto sin usar (Ley 1480 de 2011). Si pagaste con tarjeta o PSE también puedes solicitar la reversión del pago en los casos que la ley contempla.']];
  return '<section class="section" id="faq" style="padding-top:0"><div class="wrap" style="max-width:860px"><span class="kicker rv">Preguntas frecuentes</span><h2 class="rv">Compra tranquilo.</h2><div class="faq">' + f.map(x => '<details><summary>' + x[0] + '</summary><p>' + x[1] + '</p></details>').join('') + '</div></div></section>';
}

/* Tienda con filtros */
const SHOP = {
  'tienda': { t: 'Toda la tienda', k: 'Tienda El Rey', pre: {} },
  'colchones': { t: 'Colchones El Rey', k: 'Duerme como un rey', pre: { brand: ['colchones'] } },
  'muebles': { t: 'Muebles El Rey', k: 'Salas y comedores', pre: { brand: ['muebles'] } },
  'muebles/salas': { t: 'Salas', k: 'Muebles El Rey', pre: { brand: ['muebles'], cat: ['salas'] } },
  'muebles/comedores': { t: 'Comedores', k: 'Muebles El Rey', pre: { brand: ['muebles'], cat: ['comedores'] } },
  'promos': { t: 'Black Friday El Rey', k: 'Promociones', pre: { promo: true } },
  'novedades': { t: 'Novedades', k: 'Recién llegados al almacén', pre: { nuevo: true } }
};
const CATS = { colchones: 'Colchones', camas: 'Camas', almohadas: 'Almohadas', salas: 'Salas', comedores: 'Comedores', complementos: 'Complementos' };
const ROOMS = { habitacion: 'Habitación', sala: 'Sala', comedor: 'Comedor' };
const SIZES = ['Sencillo', 'Semidoble', 'Doble', 'Queen', 'King'];
let F = {};
V.shop = key => {
  const cfg = SHOP[key]; F = { brand: [], cat: [], room: [], size: [], color: [], max: 4000000, q: '', sort: 'rel', ...JSON.parse(JSON.stringify(cfg.pre)) };
  const tabs = [['tienda', 'Todo'], ['colchones', 'Colchones El Rey'], ['muebles', 'Muebles El Rey'], ['muebles/salas', 'Salas'], ['muebles/comedores', 'Comedores'], ['novedades', '✨ Novedades'], ['promos', '🔥 Black Friday']];
  return '<section class="shop-head"><div class="wrap"><div class="crumbs"><a href="' + url('') + '" data-link>Inicio</a> / ' + cfg.t + '</div><span class="kicker">' + cfg.k + '</span><h1 style="font-size:clamp(34px,5vw,60px);margin-bottom:6px">' + cfg.t + '</h1>' + (key === 'promos' ? '<p>Selección Black Friday: precios especiales, base cama gratis y combos. Hasta agotar unidades.</p>' : '<p>Filtra por medida, color, espacio y precio. Envío gratis en 6 ciudades del Eje Cafetero.</p>') + '<div class="tabs">' + tabs.map(t => '<a href="' + url(t[0] + '/') + '" data-link class="' + (t[0] === key ? 'on' : '') + '">' + t[1] + '</a>').join('') + '</div></div></section>' +
    (key === 'promos' ? '<div style="margin-top:-10px">' + bfBanner() + '</div>' : '') +
    '<div class="wrap shop"><aside class="filters" id="filters">' + filtersHTML() + '</aside><div><div class="toolbar"><button class="btn sm dark filter-toggle" id="ftog">Filtros</button><input class="search-in" id="q" placeholder="Busca: Gran Duque, sala gris, comedor…" aria-label="Buscar"><select id="sort" aria-label="Ordenar"><option value="rel">Recomendados</option><option value="asc">Menor precio</option><option value="desc">Mayor precio</option><option value="new">Más vendidos</option></select></div><div class="active-chips" id="chips"></div><p class="count small" id="count"></p><div class="grid" id="results"></div></div></div>';
};
function filtersHTML() {
  const count = (k, v) => P.filter(p => k === 'size' ? p.sizes.some(s => s.l.startsWith(v)) : k === 'color' ? (p.colors || []).some(c => c.id === v) : p[k] === v).length;
  const chk = (k, v, l) => '<label class="fchk"><input type="checkbox" data-f="' + k + '" value="' + v + '"' + (F[k].includes(v) ? ' checked' : '') + '>' + l + '<span class="n">' + count(k, v) + '</span></label>';
  return '<div class="fgroup"><h4>Marca</h4>' + chk('brand', 'colchones', 'Colchones El Rey') + chk('brand', 'muebles', 'Muebles El Rey') + '</div>' +
    '<div class="fgroup"><h4>Categoría</h4>' + Object.entries(CATS).map(([k, v]) => chk('cat', k, v)).join('') + '</div>' +
    '<div class="fgroup"><h4>Espacio del hogar</h4>' + Object.entries(ROOMS).map(([k, v]) => chk('room', k, v)).join('') + '</div>' +
    '<div class="fgroup"><h4>Medida (colchones y camas)</h4>' + SIZES.map(s => chk('size', s, s)).join('') + '</div>' +
    '<div class="fgroup"><h4>Color de tela</h4><div class="fswatches">' + Object.entries(R.FABRICS).map(([k, c]) => '<button class="fsw' + (F.color.includes(k) ? ' on' : '') + '" data-fc="' + k + '" title="' + c.name + '" aria-label="' + c.name + '" style="background:' + c.hex + '"></button>').join('') + '</div></div>' +
    '<div class="fgroup"><h4>Precio máximo: <span id="maxv">' + money(F.max) + '</span></h4><input class="range" type="range" id="max" min="100000" max="4000000" step="100000" value="' + F.max + '" aria-label="Precio máximo"></div>' +
    '<label class="fchk" style="margin-top:10px"><input type="checkbox" data-f="promo"' + (F.promo ? ' checked' : '') + '>Solo promociones</label><button type="button" class="btn block filter-done" id="fdone">Ver resultados</button>';
}
function applyFilters() {
  const q = F.q.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  let r = P.filter(p => (!F.brand.length || F.brand.includes(p.brand)) && (!F.cat.length || F.cat.includes(p.cat)) && (!F.room.length || F.room.includes(p.room)) &&
    (!F.size.length || p.sizes.some(s => F.size.some(z => s.l.startsWith(z)))) && (!F.color.length || (p.colors || []).some(c => F.color.includes(c.id))) &&
    Math.min(...p.sizes.map(s => s.p)) <= F.max && (!F.promo || p.promo) && (!F.nuevo || p.nuevo) &&
    (!q || (p.name + ' ' + p.tagline + ' ' + p.cat + ' ' + (p.colors || []).map(c => c.name).join(' ')).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q)));
  const mp = p => Math.min(...p.sizes.map(s => s.p));
  if (F.sort === 'asc') r.sort((a, b) => mp(a) - mp(b)); else if (F.sort === 'desc') r.sort((a, b) => mp(b) - mp(a)); else if (F.sort === 'new') r.sort((a, b) => (b.bestseller || 0) - (a.bestseller || 0));
  $('#results').innerHTML = r.length ? r.map(card).join('') : '<div class="empty"><h3>No encontramos esa combinación</h3><p>Prueba quitando un filtro o pregúntale a nuestra guía 👑.</p><button class="btn sm" data-chat="No encuentro lo que busco">Ayúdame a encontrarlo</button></div>';
  $('#count').textContent = r.length + ' producto' + (r.length === 1 ? '' : 's'); const fd = $('#fdone'); if (fd) fd.textContent = 'Ver ' + r.length + ' resultado' + (r.length === 1 ? '' : 's');
  const chips = [...F.brand.map(v => ['brand', v, brandName(v)]), ...F.cat.map(v => ['cat', v, CATS[v]]), ...F.room.map(v => ['room', v, ROOMS[v]]), ...F.size.map(v => ['size', v, v]), ...F.color.map(v => ['color', v, R.FABRICS[v].name])];
  $('#chips').innerHTML = chips.map(c => '<button data-chip="' + c[0] + '" data-v="' + c[1] + '">' + esc(c[2]) + ' ×</button>').join('') + (chips.length ? '<button data-clear style="background:var(--red)">Limpiar todo</button>' : '');
  if (F.q.length > 2) track('Search', { name: F.q });
  observe();
}
function bindShop() {
  const fl = $('#filters');
  fl.addEventListener('change', e => { const t = e.target; if (t.dataset.f === 'promo') F.promo = t.checked; else if (t.dataset.f) { const a = F[t.dataset.f]; t.checked ? a.push(t.value) : a.splice(a.indexOf(t.value), 1) } applyFilters() });
  fl.addEventListener('input', e => { if (e.target.id === 'max') { F.max = +e.target.value; $('#maxv').textContent = money(F.max); applyFilters() } });
  fl.addEventListener('click', e => { if (e.target.id === 'fdone') { fl.classList.remove('on'); document.body.style.overflow = ''; return } const b = e.target.closest('[data-fc]'); if (!b) return; const k = b.dataset.fc, i = F.color.indexOf(k); i < 0 ? F.color.push(k) : F.color.splice(i, 1); b.classList.toggle('on'); applyFilters() });
  let st; $('#q').addEventListener('input', e => { clearTimeout(st); st = setTimeout(() => { F.q = e.target.value; applyFilters() }, 160) });
  $('#sort').addEventListener('change', e => { F.sort = e.target.value; applyFilters() });
  $('#ftog').addEventListener('click', () => { fl.classList.add('on'); document.body.style.overflow = 'hidden' });
  $('#chips').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.clear) { F = { ...F, brand: [], cat: [], room: [], size: [], color: [], promo: false } } else { const a = F[b.dataset.chip]; a.splice(a.indexOf(b.dataset.v), 1) } fl.innerHTML = filtersHTML(); applyFilters() });
  applyFilters();
}

/* Ficha de producto */
let PD = {};
V.product = id => {
  const p = byId(id); if (!p) return V.notFound();
  PD = { p, size: p.defSize || 0, color: p.colors ? 0 : -1, qty: 1, imgI: 0, combo: new Set() };
  track('ViewContent', { name: p.name, value: p.price, content_ids: [p.id] });
  const cmb = (p.combo || []).map(byId).filter(Boolean).slice(0, 2);
  const isBed = p.cat === 'colchones' || p.cat === 'camas';
  return '<div class="wrap"><div class="crumbs" style="margin-top:20px"><a href="' + url('') + '" data-link>Inicio</a> / <a href="' + url(p.brand + '/') + '" data-link>' + brandName(p.brand) + '</a> / ' + esc(p.name) + '</div>' +
    '<div class="pdp"><div class="gallery"><div class="gmain" id="gmain"><img id="mainImg" src="' + img(p.imgs[0]) + '" width="800" height="800" alt="' + esc(p.name) + '"><span class="tags">' + (p.badge ? '<span class="tag red">' + esc(p.badge) + '</span>' : '') + (p.recolor ? '<span class="tag dark">Toca un color: cambia la foto</span>' : '') + '</span><div class="recolor-note" id="rcNote"></div></div>' +
    (p.imgs.length > 1 ? '<div class="thumbs">' + p.imgs.map((m, i) => '<button data-thumb="' + i + '" class="' + (i ? '' : 'on') + '" aria-label="Foto ' + (i + 1) + '"><img src="' + img(m, 400) + '" alt="" loading="lazy"></button>').join('') + '</div>' : '') + '</div>' +
    '<div class="pinfo"><span class="kicker">' + brandName(p.brand) + '</span><h1>' + esc(p.name) + '</h1><p style="font-size:17px">' + esc(p.tagline) + '</p>' +
    '<div class="pprice"><span class="price" id="pPrice">' + money(p.sizes[PD.size].p) + '</span><span class="alt" id="pCuota"></span></div>' +
    '<div class="cuotas">💳 Págalo a cuotas con <b>Addi</b> o <b>Sistecrédito</b>, o en hasta 36 cuotas con tu tarjeta de crédito.</div>' +
    (p.badge === 'Base cama GRATIS' ? '<div class="cuotas" style="background:#fff3c4">🎁 <b>¡Y espera, que hay más!</b> En medida doble te llevas la base cama 140 × 190 GRATIS.</div>' : '') +
    '<p>' + esc(p.desc) + '</p>' +
    (p.sizes.length > 1 || isBed ? '<div class="optlabel">' + (isBed ? 'Elige tu medida' : 'Configuración') + '<span id="sizeName">' + esc(p.sizes[PD.size].l) + '</span></div><div class="sizes">' + p.sizes.map((s, i) => '<button class="size' + (i === PD.size ? ' on' : '') + '" data-size="' + i + '">' + esc(s.l.split(' ')[0]) + '<small>' + esc(s.l.split(' ').slice(1).join(' ') || s.l) + ' · ' + money(s.p) + '</small></button>').join('') + '</div>' + (isBed ? '<div class="size-visual" aria-hidden="true"><div class="bed" id="bedVis"></div><span class="person" id="bedTxt"></span></div>' : '') : '') +
    (p.colors ? '<div class="optlabel">Color de tela<span id="colorName">' + esc(p.colors[0].name) + '</span></div><div class="colors">' + p.colors.map((c, i) => '<button class="color' + (i ? '' : ' on') + '" data-color="' + i + '" title="' + esc(c.name) + '" aria-label="' + esc(c.name) + '" style="background:' + c.hex + '"></button>').join('') + '</div>' + (!p.recolor ? '<p class="small muted" style="margin-top:8px">Te enviamos foto real de la tela elegida por WhatsApp antes de despachar.</p>' : '') : '') +
    '<div class="optlabel">Cantidad</div><div class="qtybox"><button data-qty="-1" aria-label="Menos">−</button><span id="qty">1</span><button data-qty="1" aria-label="Más">+</button></div>' +
    '<div class="buy-row"><button class="btn shine" data-buy>Comprar ahora</button><button class="btn dark" data-addpd>Agregar al carrito</button></div>' +
    '<a class="btn wa block" style="margin-top:10px" target="_blank" rel="noopener" data-wa href="' + waLink('Hola El Rey 👑 me interesa ' + p.name + '. ¿Me asesoran?') + '">Tengo dudas: hablar por WhatsApp</a>' +
    '<div class="ship-calc"><b>¿Te llega gratis?</b><select id="shipSel" aria-label="Tu municipio"><option value="">Elige tu municipio</option>' + Object.entries(R.ship.depts).map(([d, cs]) => '<optgroup label="' + d + '">' + cs.map(c => '<option>' + c + '</option>').join('') + '</optgroup>').join('') + '<option value="otro">Mi municipio no aparece</option></select><div class="ship-out" id="shipOut"></div></div>' +
    '<div class="perks"><div>🛡️<span><b>Garantía</b>' + (p.id.includes('gran-duque') ? '5 años en el colchón' : 'De fábrica El Rey') + '</span></div><div>🔁<span><b>Te acompañamos</b>Antes, durante y después</span></div><div>🏬<span><b>Pruébalo</b>En Pereira (Cerritos) y Cartago</span></div><div>🔒<span><b>Pago seguro</b>Pasarela certificada</span></div></div>' +
    '<h3 style="margin-top:26px">Ficha técnica</h3><table class="specs">' + p.specs.map(s => '<tr><td>' + esc(s[0]) + '</td><td>' + esc(s[1]) + '</td></tr>').join('') + '</table></div></div>' +
    (cmb.length ? '<div class="combo rv"><span class="kicker">Combo El Rey</span><h2 style="font-size:clamp(24px,3vw,34px)">Tu hogar funciona mejor en conjunto.</h2><p>Arma tu combo y ahorra ' + COMBO_OFF * 100 + '% en los complementos.</p><div class="combo-items"><div class="combo-item on" style="cursor:default"><img src="' + img(p.imgs[0], 400) + '" alt=""><div><b>' + esc(p.name) + '</b><br><span class="small muted">Este producto</span></div></div>' + cmb.map(c => '<span class="combo-plus">+</span><label class="combo-item" data-cmb="' + c.id + '"><img src="' + img(c.imgs[0], 400) + '" alt=""><div><b>' + esc(c.name) + '</b><br><span class="small"><s class="muted">' + money(c.price) + '</s> <b>' + money(c.price * (1 - COMBO_OFF)) + '</b></span></div><input type="checkbox" value="' + c.id + '" aria-label="Agregar ' + esc(c.name) + ' al combo"></label>').join('') + '</div><div class="combo-total"><div><span class="small muted">Total del combo</span><div class="price" id="cmbTotal"></div><span class="save" id="cmbSave"></span></div><button class="btn" data-addcombo>Agregar combo al carrito</button></div></div>' : '') +
    '<section class="section"><span class="kicker">También te puede gustar</span><h2 style="font-size:32px">Completa tu espacio</h2><div class="grid">' + P.filter(x => x.id !== p.id && (x.room === p.room || x.brand !== p.brand)).slice(0, 4).map(card).join('') + '</div></section></div>' +
    reviews() +
    '<div class="sticky-buy" id="stickyBuy"><img src="' + img(p.imgs[0], 400) + '" width="46" height="46" style="border-radius:10px" alt=""><div class="p" style="flex:1">' + esc(p.name) + '<small id="stickyP">' + money(p.sizes[PD.size].p) + '</small></div><button class="btn sm" data-buy>Comprar</button></div>';
};
function pdUpdate() {
  const { p } = PD, s = p.sizes[PD.size];
  $('#pPrice').textContent = money(s.p * PD.qty); $('#stickyP').textContent = money(s.p * PD.qty);
  $('#pCuota').textContent = 'o 12 cuotas de ~' + money(s.p * PD.qty / 12) + ' con tarjeta';
  const sn = $('#sizeName'); if (sn) sn.textContent = s.l;
  $$('[data-size]').forEach(b => b.classList.toggle('on', +b.dataset.size === PD.size));
  $('#qty').textContent = PD.qty;
  const bv = $('#bedVis'); if (bv) { const m = s.l.match(/(\d{3}) × (\d{3})/); const w = m ? +m[1] : 140, h = m ? +m[2] : 190; bv.style.width = (w / 200 * 150) + 'px'; bv.style.height = (h / 200 * 70) + 'px'; $('#bedTxt').innerHTML = '<b>' + w + ' × ' + h + ' cm</b><br>' + (w <= 100 ? 'Ideal para 1 persona o habitación juvenil' : w <= 120 ? '1 persona con espacio de sobra' : w <= 140 ? 'Pareja · la medida más vendida' : w <= 160 ? 'Pareja que quiere más espacio' : 'Pareja + niños o mascotas 🐶'); }
  if (p.colors) { $('#colorName').textContent = p.colors[PD.color].name; $$('[data-color]').forEach(b => b.classList.toggle('on', +b.dataset.color === PD.color)); }
  comboUpdate();
}
function comboUpdate() {
  const t = $('#cmbTotal'); if (!t) return; const base = PD.p.sizes[PD.size].p; let add = 0, save = 0;
  PD.combo.forEach(id => { const c = byId(id); add += c.price * (1 - COMBO_OFF); save += c.price * COMBO_OFF });
  t.textContent = money(base + add); $('#cmbSave').textContent = save ? 'Ahorras ' + money(save) : 'Selecciona complementos';
  $$('[data-cmb]').forEach(el => el.classList.toggle('on', PD.combo.has(el.dataset.cmb)));
}
function bindProduct() {
  const { p } = PD; pdUpdate(); preloadVariants(p);
  const sb = $('#stickyBuy'), br = $('.buy-row');
  if (sb && br && 'IntersectionObserver' in window) new IntersectionObserver(([e]) => { const on = !e.isIntersecting && e.boundingClientRect.top < 0; sb.classList.toggle('on', on); document.body.classList.toggle('has-sticky', on && innerWidth <= 900) }).observe(br);
  $('#shipSel').addEventListener('change', e => { const v = e.target.value, o = $('#shipOut'); if (!v) return o.textContent = ''; if (v === 'otro') { o.className = 'ship-out'; o.innerHTML = 'Escríbenos y te cotizamos el envío → <a class="link" target="_blank" rel="noopener" href="' + waLink('Hola, quiero cotizar envío de ' + p.name + ' a mi municipio') + '">WhatsApp</a>'; return } const free = R.ship.free.includes(v); o.className = 'ship-out' + (free ? ' free' : ''); o.textContent = free ? '✓ Envío GRATIS a ' + v : 'Envío a ' + v + ': ' + money(R.ship.fee) + ' (zona urbana)'; store.set('rey.city', v) });
  const sc = store.get('rey.city'); if (sc) { $('#shipSel').value = sc; $('#shipSel').dispatchEvent(new Event('change')) }
  $('#gmain').addEventListener('click', e => { if (window.innerWidth > 900 && $('#mainImg').tagName === 'IMG') { const g = $('#gmain'); g.classList.toggle('zoom'); const r = g.getBoundingClientRect(); $('#mainImg').style.transformOrigin = ((e.clientX - r.left) / r.width * 100) + '% ' + ((e.clientY - r.top) / r.height * 100) + '%' } });
  $$('[data-cmb] input').forEach(i => i.addEventListener('change', () => { i.checked ? PD.combo.add(i.value) : PD.combo.delete(i.value); comboUpdate() }));
}
/* ───── Color de tela: fotos precalculadas por color (scripts/recolor.cjs), precargadas al abrir la ficha ───── */
const variantImg = (p, ci, size) => img(p.imgs[0] + (p.recolor && ci > 0 ? '-' + p.colors[ci].id : ''), size);
const colorIdx = (p, name) => p.colors ? Math.max(0, p.colors.findIndex(c => c.name === name)) : 0;
const lineImg = (l, size) => { const p = byId(l.id); return variantImg(p, colorIdx(p, l.color), size) };
const preloaded = new Set();
function preloadVariants(p) {
  if (!p.recolor) return;
  p.colors.forEach((c, i) => { if (!i) return; [variantImg(p, i), variantImg(p, i, 400)].forEach(src => { if (preloaded.has(src)) return; preloaded.add(src); const im = new Image(); im.decoding = 'async'; im.src = src }) });
}
function colorNote() {
  const p = PD.p, note = $('#rcNote'); if (!note) return;
  if (!p.recolor || PD.color <= 0 || PD.imgI !== 0) { note.classList.remove('on'); return }
  note.textContent = 'Tela ' + p.colors[PD.color].name + ' · foto real con el color de la tela ajustado. Te confirmamos la muestra física por WhatsApp.';
  note.classList.add('on');
}
function showImg(i) {
  PD.imgI = i; const p = PD.p, m = $('#mainImg');
  m.src = i === 0 ? variantImg(p, Math.max(PD.color, 0)) : img(p.imgs[i]);
  $$('[data-thumb]').forEach(b => b.classList.toggle('on', +b.dataset.thumb === i));
  colorNote();
}
function applyColor() {
  const p = PD.p; if (!p.recolor) return;
  const m = $('#mainImg'), src = variantImg(p, PD.color);
  PD.imgI = 0; $$('[data-thumb]').forEach(b => b.classList.toggle('on', +b.dataset.thumb === 0));
  if (!m.src.endsWith(src)) { m.classList.add('swap'); m.onload = () => m.classList.remove('swap'); m.src = src; if (m.complete) m.classList.remove('swap') }
  const t0 = $('[data-thumb="0"] img'); if (t0) t0.src = variantImg(p, PD.color, 400);
  colorNote();
}

/* Landing para pauta */
V.landing = key => {
  const l = R.landings[key], items = P.filter(l.filter);
  track('ViewContent', { name: 'Landing ' + key });
  return '<section class="lp-hero"><img src="' + img(l.img) + '" srcset="' + img(l.img, 800) + ' 800w,' + img(l.img) + ' 1600w" sizes="100vw" alt="" fetchpriority="high"><div class="wrap"><span class="kicker">' + l.kicker + '</span><h1 class="split-text">' + esc(l.h) + '</h1><p>' + esc(l.p) + '</p><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:22px"><a class="btn shine" href="#lp-grid">Ver opciones</a><a class="btn wa" target="_blank" rel="noopener" data-wa href="' + waLink('Hola El Rey 👑 vengo del anuncio ' + l.kicker.toLowerCase() + ' y quiero asesoría') + '">Asesoría por WhatsApp</a></div></div></section>' +
    '<div class="wrap"><div class="why" style="margin-top:-40px;position:relative;z-index:3">' + [['🚚', 'Envío gratis', l.city ? 'En ' + l.city + ' y 5 ciudades más' : 'En 6 ciudades del Eje'], ['💳', 'Cuotas', 'Addi y Sistecrédito'], ['🏬', 'Pruébalo', 'Pereira (Cerritos) y Cartago'], ['⭐', 'Google', 'Opiniones reales de clientes']].map(w => '<div style="background:#fff;box-shadow:var(--sh)"><span class="ic">' + w[0] + '</span><b>' + w[1] + '</b><p>' + w[2] + '</p></div>').join('') + '</div></div>' +
    '<section class="section" id="lp-grid"><div class="wrap"><span class="kicker">Seleccionados para ti</span><h2>Elige el tuyo.</h2><div class="grid">' + items.map(card).join('') + '</div></div></section>' + reviews() + stores();
};

/* Hogares */
V.hogares = () => '<section class="shop-head"><div class="wrap"><div class="crumbs"><a href="' + url('') + '" data-link>Inicio</a> / Hogares</div><span class="kicker">Hogares del Eje Cafetero</span><h1 style="font-size:clamp(34px,5vw,60px)">Inspírate. Toca. Llévatelo.</h1><p>Salas, comedores y habitaciones con productos El Rey. Toca el <b>+</b> sobre la foto para ver el producto.</p></div></section>' +
  '<section class="section"><div class="wrap homes-grid">' + R.homes.map((h, i) => '<div class="home-card rv d' + (i % 2) + '"><img src="' + img(h.img, 800) + '" srcset="' + img(h.img, 800) + ' 800w,' + img(h.img) + ' 1600w" sizes="(max-width:900px) 100vw, 50vw" loading="lazy" alt="' + esc(h.title) + '">' + h.spots.map(s => '<button class="spot" style="left:' + s.x + '%;top:' + s.y + '%" data-spot="' + s.id + '" aria-label="Ver ' + esc(byId(s.id).name) + '">+</button>').join('') + '<div class="cap"><small>' + esc(h.place) + '</small><b>' + esc(h.title) + '</b></div></div>').join('') + '</div></section>' + homeBand(R.homes[4]) + reviews();

/* Proyectos personalizados: negocios, hotelería y hogar */
const PROJ = [
  ['negocio', 'briefcase', 'Negocios', 'Oficinas, consultorios, salas de espera y locales.', ['Salas y sofás para recepción', 'Comedores para zonas de descanso', 'Entrega coordinada en horario de tu negocio']],
  ['hoteleria', 'hotel', 'Hotelería', 'Hoteles, hostales, fincas turísticas y alojamientos.', ['Colchones y camas por volumen', 'Salas para lobby y áreas comunes', 'Cotización por habitación o por proyecto']],
  ['hogar', 'home', 'Hogar', 'Apartamento nuevo, casa de campo o remodelación.', ['Todo el espacio en una sola propuesta', 'Telas y colores para que combine', 'Pago a cuotas con Addi o Sistecrédito']]
];
V.proyectos = () => {
  const P4 = ['colchon-gran-duque', 'cama-gran-duque-lujo', 'sala-imperial', 'comedor-orion'].map(byId);
  const depts = Object.entries(R.ship.depts);
  return '<section class="lp-hero"><img src="' + img('h-almacen') + '" srcset="' + img('h-almacen', 800) + ' 800w,' + img('h-almacen') + ' 1600w" sizes="100vw" alt="Almacén El Rey" fetchpriority="high"><div class="wrap"><span class="kicker">Proyectos a la medida</span><h1>Amoblamos tu proyecto: negocio, hotel u hogar.</h1><p>Colchones, camas, salas y comedores por volumen o pensados para tu espacio. Te asesoramos, te cotizamos por escrito y coordinamos la entrega en el Eje Cafetero.</p><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:22px"><a class="btn" href="#proj-form">Cotizar mi proyecto</a><a class="btn wa" target="_blank" rel="noopener" data-wa href="' + waLink('Hola El Rey 👑 tengo un proyecto (negocio, hotel u hogar) y quiero una cotización') + '">💬 Hablar con un asesor</a></div></div></section>' +
    '<section class="section"><div class="wrap"><span class="kicker">¿Para quién?</span><h2>Un mismo Rey, tres tipos de proyecto.</h2><div class="proj-grid">' +
    PROJ.map(([k, ic, t, d, items]) => '<article class="proj-card rv"><span class="proj-ic">' + icon(ic) + '</span><h3>' + t + '</h3><p>' + d + '</p><ul>' + items.map(i => '<li>' + i + '</li>').join('') + '</ul><button class="btn sm" data-proj="' + k + '">Cotizar ' + t.toLowerCase() + ' →</button></article>').join('') + '</div></div></section>' +
    '<section class="section" style="padding-top:0"><div class="wrap"><span class="kicker">Cómo trabajamos</span><h2>De la idea a la entrega, en cuatro pasos.</h2><div class="steps4">' +
    [['💬', 'Cuéntanos tu proyecto', 'Tipo de espacio, cantidades, ciudad y fecha.'], ['🏬', 'Te asesoramos', 'En el almacén de Cerritos o Cartago, o por videollamada.'], ['🧾', 'Cotización por escrito', 'Productos, telas, precios por volumen y tiempos.'], ['🚚', 'Entrega coordinada', 'Agendamos contigo cada despacho.']].map((x, i) => '<div class="rv d' + i + '"><span class="n">0' + (i + 1) + '</span>' + x[0] + '<b>' + x[1] + '</b><p>' + x[2] + '</p></div>').join('') +
    '</div><p class="small muted" style="margin-top:14px">Medidas especiales, descuentos por volumen y tiempos de fabricación o entrega se confirman en la cotización.</p></div></section>' +
    '<section class="section" style="padding-top:0"><div class="wrap"><span class="kicker">Para empezar a imaginarlo</span><h2>Productos que más se piden en proyectos.</h2><div class="grid">' + P4.map(card).join('') + '</div></div></section>' +
    '<section class="section" id="proj-form" style="padding-top:0"><div class="wrap"><div class="proj-form-wrap"><div><span class="kicker">Cotización sin compromiso</span><h2>Cuéntanos tu proyecto.</h2><p>Te respondemos por WhatsApp desde la línea principal de El Rey con una propuesta a tu medida.</p><div class="lock">🔒 Tus datos solo se usan para responder esta cotización (Ley 1581 de 2012).</div></div>' +
    '<form id="projForm" novalidate><div class="fields">' +
    '<div class="field full" data-fld="tipo"><label>Tipo de proyecto</label><div class="radio-cards">' + PROJ.map(([k, ic, t]) => '<label class="rc"><input type="radio" name="tipo" value="' + k + '"><b>' + icon(ic) + ' ' + t + '</b></label>').join('') + '</div><div class="err">Elige el tipo de proyecto</div></div>' +
    '<div class="field" data-fld="nombre"><label for="p_nombre">Tu nombre</label><input id="p_nombre" name="nombre" autocomplete="name" maxlength="80"><div class="err">Escribe tu nombre</div></div>' +
    '<div class="field"><label for="p_empresa">Empresa o negocio (opcional)</label><input id="p_empresa" name="empresa" maxlength="80"></div>' +
    '<div class="field" data-fld="cel"><label for="p_cel">Celular (WhatsApp)</label><input id="p_cel" name="cel" inputmode="tel" maxlength="10" placeholder="3001234567"><div class="err">Celular de 10 dígitos que empiece por 3</div></div>' +
    '<div class="field" data-fld="mun"><label for="p_mun">Ciudad del proyecto</label><select id="p_mun" name="mun"><option value="">Selecciona</option>' + depts.map(([d, cs]) => '<optgroup label="' + d + '">' + cs.map(c => '<option>' + c + '</option>').join('') + '</optgroup>').join('') + '<option value="otra">Otra ciudad</option></select><div class="err">Elige la ciudad</div></div>' +
    '<div class="field full" data-fld="que"><label>¿Qué necesitas?</label><div class="chk-row">' + ['Colchones', 'Camas', 'Salas', 'Comedores', 'Complementos'].map(x => '<label class="check"><input type="checkbox" name="que" value="' + x + '"><span>' + x + '</span></label>').join('') + '</div><div class="err">Marca al menos una opción</div></div>' +
    '<div class="field"><label for="p_cant">Cantidad aproximada</label><input id="p_cant" name="cant" inputmode="numeric" maxlength="4" placeholder="Ej: 12 colchones"></div>' +
    '<div class="field"><label for="p_fecha">¿Para cuándo?</label><select id="p_fecha" name="fecha"><option>Lo antes posible</option><option>En 1 mes</option><option>En 2 a 3 meses</option><option>Solo estoy cotizando</option></select></div>' +
    '<div class="field full"><label for="p_msg">Cuéntanos más (opcional)</label><textarea id="p_msg" name="msg" rows="3" maxlength="500" placeholder="Ej: hotel de 10 habitaciones en Salento, camas dobles y una sala para el lobby"></textarea></div>' +
    '<label class="check full" data-fld="ok"><input type="checkbox" name="ok"><span>Autorizo a El Rey a contactarme por WhatsApp para esta cotización.</span></label>' +
    '</div><p class="err-line" id="projErr" role="alert"></p><button class="btn block" style="margin-top:10px">Enviar mi proyecto →</button></form></div></div></section>';
};
function bindProyectos() {
  const f = $('#projForm'); if (!f) return;
  f.addEventListener('change', e => { if (e.target.name === 'tipo') $$('input[name="tipo"]', f).forEach(r => r.closest('.rc').classList.toggle('on', r.checked)) });
  f.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(f), d = { tipo: fd.get('tipo'), nombre: (fd.get('nombre') || '').trim(), empresa: (fd.get('empresa') || '').trim(), cel: (fd.get('cel') || '').trim(), mun: fd.get('mun'), que: fd.getAll('que'), cant: fd.get('cant'), fecha: fd.get('fecha'), msg: (fd.get('msg') || '').trim(), ok: !!fd.get('ok') };
    const bad = { tipo: !d.tipo, nombre: !d.nombre, cel: !/^3\d{9}$/.test(d.cel), mun: !d.mun, que: !d.que.length, ok: !d.ok };
    $$('[data-fld]', f).forEach(x => x.classList.toggle('bad', !!bad[x.dataset.fld]));
    if (Object.values(bad).some(Boolean)) { $('#projErr').textContent = bad.ok && !Object.entries(bad).some(([k, v]) => v && k !== 'ok') ? 'Necesitamos tu autorización para responderte por WhatsApp.' : 'Revisa los campos marcados.'; const first = $('.bad', f); first && first.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); return }
    const tipo = PROJ.find(p => p[0] === d.tipo)[2];
    store.set('rey.proyecto', d); store.set('rey.co', { ...store.get('rey.co', {}), nombre: d.nombre, cel: d.cel, optin: true, mun: d.mun });
    track('Lead', { name: 'Proyecto ' + tipo });
    const txt = 'Hola El Rey, soy ' + d.nombre + (d.empresa ? ' (' + d.empresa + ')' : '') + '. Quiero cotizar un proyecto de ' + tipo.toLowerCase() + ' en ' + (d.mun === 'otra' ? 'otra ciudad' : d.mun) + ': ' + d.que.join(', ') + (d.cant ? ' · cantidad aprox.: ' + d.cant : '') + ' · ' + d.fecha + (d.msg ? '. ' + d.msg : '');
    f.innerHTML = '<div class="success"><div class="okmark">✓</div><h3>¡Recibido, ' + esc(d.nombre) + '!</h3><p>Tu proyecto de <b>' + tipo.toLowerCase() + '</b> quedó registrado. En la versión real, un asesor te escribe por WhatsApp desde la línea principal con la propuesta.</p><div style="display:grid;gap:8px"><a class="btn wa" target="_blank" rel="noopener" data-wa href="' + waLink(txt) + '">💬 Adelantar la conversación por WhatsApp</a><a class="btn ghost" href="' + url('crm/') + '" data-link>Ver cómo sigue en el CRM →</a></div></div>';
  });
}

/* Checkout */
let CO = { step: 1, d: store.get('rey.co', {}) };
V.checkout = () => {
  if (!cart.length) return '<section class="section"><div class="wrap" style="text-align:center"><div style="font-size:60px">🛒</div><h1 style="font-size:40px">Tu carrito está vacío</h1><p>Agrega un producto para continuar.</p><a class="btn" href="' + url('tienda/') + '" data-link>Ir a la tienda</a></div></section>';
  track('InitiateCheckout', { value: cartTotals().total });
  return '<div class="wrap"><div class="co"><div><div class="crumbs" style="margin-top:20px"><a href="' + url('') + '" data-link>Inicio</a> / Finalizar compra</div><h1 style="font-size:clamp(30px,4vw,44px);margin-bottom:0">Ya casi es tuyo 👑</h1><div class="stepper" id="stepper"></div><form id="coForm" novalidate></form></div><aside class="summary" id="coSum"></aside></div></div>';
};
const F1 = [['nombre', 'Nombres', 'text', 'given-name'], ['apellido', 'Apellidos', 'text', 'family-name']];
function fld(id, label, type = 'text', ac = '', extra = '', full) {
  const v = CO.d[id] ?? '';
  return '<div class="field' + (full ? ' full' : '') + '" data-fld="' + id + '"><label for="f_' + id + '">' + label + '</label><input id="f_' + id + '" name="' + id + '" type="' + type + '" autocomplete="' + ac + '" value="' + esc(v) + '" ' + extra + '><div class="err"></div></div>';
}
function sel(id, label, opts, full, ph = 'Selecciona') {
  const v = CO.d[id] ?? '';
  return '<div class="field' + (full ? ' full' : '') + '" data-fld="' + id + '"><label for="f_' + id + '">' + label + '</label><select id="f_' + id + '" name="' + id + '"><option value="">' + ph + '</option>' + opts.map(o => { const [val, lab] = Array.isArray(o) ? o : [o, o]; return '<option value="' + esc(val) + '"' + (v === val ? ' selected' : '') + '>' + esc(lab) + '</option>' }).join('') + '</select><div class="err"></div></div>';
}
function renderCO() {
  const s = CO.step;
  $('#stepper').innerHTML = ['1 · Tus datos', '2 · Entrega', '3 · Pago'].map((t, i) => '<div class="' + (i + 1 === s ? 'on' : i + 1 < s ? 'ok' : '') + '">' + (i + 1 < s ? '✓ ' : '') + t + '</div>').join('');
  const f = $('#coForm'), d = CO.d;
  if (s === 1) f.innerHTML = '<div class="fields">' + F1.map(x => fld(...x)).join('') + sel('tdoc', 'Tipo de documento', [['CC', 'Cédula de ciudadanía'], ['CE', 'Cédula de extranjería'], ['NIT', 'NIT (empresa)'], ['PP', 'Pasaporte']]) + fld('doc', 'Número de documento', 'text', 'off', 'inputmode="numeric" maxlength="12"') +
    fld('cel', 'Celular (WhatsApp)', 'tel', 'tel-national', 'inputmode="tel" maxlength="10" placeholder="3001234567"') + fld('email', 'Correo electrónico', 'email', 'email', 'placeholder="tucorreo@ejemplo.com"') + '</div><p class="hint">Necesitamos tu documento para la factura electrónica de cada marca. Tu celular es para coordinar la entrega por WhatsApp.</p><button class="btn block" style="margin-top:18px">Continuar a la entrega →</button>';
  if (s === 2) {
    const depts = Object.keys(R.ship.depts), cities = d.dep ? R.ship.depts[d.dep] : [];
    const apt = ['Apartamento', 'Apartamento en conjunto'].includes(d.viv);
    f.innerHTML = '<div class="fields">' + sel('dep', 'Departamento', depts) +
      '<div class="field" data-fld="mun"><label for="f_mun">Municipio</label><select id="f_mun" name="mun"' + (d.dep ? '' : ' disabled') + '><option value="">' + (d.dep ? 'Selecciona tu municipio' : 'Primero elige el departamento') + '</option>' + cities.map(c => '<option' + (d.mun === c ? ' selected' : '') + ' value="' + esc(c) + '">' + esc(c) + (R.ship.free.includes(c) ? ' · envío gratis' : ' · +' + money(R.ship.fee)) + '</option>').join('') + (d.dep ? '<option value="otro"' + (d.mun === 'otro' ? ' selected' : '') + '>Mi municipio no aparece</option>' : '') + '</select><div class="err"></div><div class="hint" id="munHint"></div></div>' +
      '<div class="field full"><label>Zona</label><div class="radio-cards">' + [['urbana', 'Urbana', 'Casco urbano'], ['rural', 'Rural', 'Vereda o finca: entregamos en el casco urbano']].map(o => '<label class="rc' + ((d.zona || 'urbana') === o[0] ? ' on' : '') + '"><input type="radio" name="zona" value="' + o[0] + '"' + ((d.zona || 'urbana') === o[0] ? ' checked' : '') + '><b>' + o[1] + '</b>' + o[2] + '</label>').join('') + '</div></div>' +
      '<div class="field full" data-fld="dir"><label>Dirección</label><div style="display:grid;grid-template-columns:1.1fr .7fr auto .7fr auto .6fr;gap:6px;align-items:center"><select name="via" aria-label="Tipo de vía">' + ['Calle', 'Carrera', 'Avenida', 'Diagonal', 'Transversal', 'Manzana', 'Vía', 'Km'].map(v => '<option' + (d.via === v ? ' selected' : '') + '>' + v + '</option>').join('') + '</select><input name="n1" aria-label="Número de vía" value="' + esc(d.n1 || '') + '" placeholder="15"><span>#</span><input name="n2" aria-label="Número" value="' + esc(d.n2 || '') + '" placeholder="20"><span>-</span><input name="n3" aria-label="Placa" value="' + esc(d.n3 || '') + '" placeholder="35"></div><div class="err"></div><div class="hint" id="dirPrev"></div></div>' +
      fld('barrio', 'Barrio o conjunto', 'text', 'off', 'placeholder="Ej: Cerritos, Pinares, Álamos"') + sel('viv', 'Tipo de vivienda', ['Casa', 'Apartamento', 'Apartamento en conjunto', 'Local u oficina', 'Finca']) +
      fld('comp', 'Torre / apto / interior', 'text', 'off', 'placeholder="Torre 2 apto 503"') +
      (apt ? sel('piso', 'Piso', ['1', '2', '3', '4', '5', '6 a 10', 'Más de 10']) + sel('asc', '¿Hay ascensor?', ['Sí, cabe un colchón', 'Sí, pequeño', 'No, solo escaleras']) : '') +
      fld('ref', 'Punto de referencia', 'text', 'off', 'placeholder="Frente al parque, portería verde…"', true) +
      fld('recibe', '¿Quién recibe?', 'text', 'off', 'placeholder="Nombre de quien recibe"') + fld('celRecibe', 'Celular de quien recibe', 'tel', 'off', 'inputmode="tel" maxlength="10" placeholder="Si es otra persona"') +
      sel('franja', 'Franja de entrega preferida', ['Mañana (8 am – 12 m)', 'Tarde (12 m – 5 pm)', 'Me es indiferente']) +
      '<div class="field"><label>Ubicación exacta (opcional)</label><button type="button" class="btn sm ghost block" id="geo">📍 Usar mi ubicación actual</button><div class="hint" id="geoOut">' + (d.geo ? '✓ Ubicación guardada para el transportador' : 'Ayuda al conductor a llegar sin perderse.') + '</div></div>' +
      '</div><div id="shipBox" class="cuotas" style="margin-top:16px"></div><div style="display:flex;gap:10px;margin-top:16px"><button type="button" class="btn ghost" data-back>← Atrás</button><button class="btn" style="flex:1">Continuar al pago →</button></div>';
    updShip();
  }
  if (s === 3) {
    const T = cartTotals(), sh = shipCost();
    f.innerHTML = '<h3>¿Cómo quieres pagar?</h3><div class="radio-cards" style="margin-bottom:16px">' + [['tarjeta', '💳 Tarjeta', 'Débito o crédito, hasta 36 cuotas'], ['pse', '🏦 PSE', 'Desde tu banco'], ['nequi', '📱 Nequi', 'Notificación en tu app'], ['addi', 'Addi', 'Cuotas sin tarjeta'], ['siste', 'Sistecrédito', 'Crédito al instante']].map(o => '<label class="rc' + ((d.pay || 'tarjeta') === o[0] ? ' on' : '') + '"><input type="radio" name="pay" value="' + o[0] + '"' + ((d.pay || 'tarjeta') === o[0] ? ' checked' : '') + '><b>' + o[1] + '</b>' + o[2] + '</label>').join('') + '</div>' +
      '<div class="split"><b style="font-family:Montserrat">Tu pago se divide automáticamente</b><p class="small muted" style="margin:4px 0 6px">Pagas una sola vez. Cada marca recibe su dinero en su propia cuenta y te envía su factura.</p>' + ['colchones', 'muebles'].filter(b => T[b]).map(b => '<div class="split-row"><span>' + (b === 'colchones' ? '🛏️' : '🛋️') + ' ' + brandName(b) + '<br><span class="small muted">Recaudo a la cuenta de ' + brandName(b) + '</span></span><b>' + money(T[b] + (b === shBrand() ? sh : 0)) + '</b></div>').join('') + '</div>' +
      '<label class="check"><input type="checkbox" name="terms" ' + (d.terms ? 'checked' : '') + '><span>Acepto los términos de compra, la política de cambios y garantías y el tratamiento de mis datos personales (Ley 1581 de 2012).</span></label>' +
      '<label class="check"><input type="checkbox" name="optin" ' + (d.optin !== false ? 'checked' : '') + '><span>Quiero recibir por WhatsApp el estado de mi pedido y beneficios de El Rey. Puedo darme de baja cuando quiera.</span></label><div class="field" data-fld="terms"><div class="err"></div></div>' +
      '<div style="display:flex;gap:10px;margin-top:10px"><button type="button" class="btn ghost" data-back>← Atrás</button><button class="btn shine" style="flex:1">Pagar ' + money(T.total + sh) + ' 🔒</button></div><div class="lock">🔒 Pago procesado por pasarela certificada PCI DSS. El Rey no almacena datos de tu tarjeta.</div>';
  }
  renderSum();
}
const shipCost = () => { const m = CO.d.mun; return !m || m === 'otro' || R.ship.free.includes(m) ? 0 : R.ship.fee };
const shBrand = () => cartTotals().colchones ? 'colchones' : 'muebles';
function updShip() {
  const b = $('#shipBox'); if (!b) return; const m = CO.d.mun;
  b.innerHTML = !m ? '🚚 Elige tu municipio para calcular el envío.' : m === 'otro' ? '📦 Te cotizamos el envío por WhatsApp en minutos. Puedes continuar y lo confirmamos antes de despachar.' : R.ship.free.includes(m) ? '✅ <b>Envío GRATIS a ' + esc(m) + '.</b> Te escribimos por WhatsApp para agendar el día.' : '🚚 Envío a <b>' + esc(m) + '</b>: ' + money(R.ship.fee) + '. Entrega en zona urbana.';
  const dp = $('#dirPrev'); if (dp) dp.textContent = CO.d.n1 ? 'Así la verá el transportador: ' + (CO.d.via || 'Calle') + ' ' + CO.d.n1 + ' # ' + (CO.d.n2 || '_') + ' - ' + (CO.d.n3 || '_') + (CO.d.comp ? ', ' + CO.d.comp : '') + (CO.d.barrio ? ', ' + CO.d.barrio : '') + (m && m !== 'otro' ? ', ' + m : '') : '';
}
function renderSum() {
  const T = cartTotals(), sh = shipCost();
  $('#coSum').innerHTML = '<h3 style="margin-top:0">Resumen</h3>' + cart.map(l => { const p = byId(l.id); return '<div class="cline" style="grid-template-columns:56px 1fr auto"><img src="' + lineImg(l, 400) + '" style="width:56px;height:56px" alt=""><div><b style="font-size:13.5px">' + esc(p.name) + ' × ' + l.qty + '</b><span class="meta">' + esc(p.sizes[l.size].l) + (l.color ? ' · ' + esc(l.color) : '') + '</span></div><b style="font-size:14px">' + money(linePrice(l) * l.qty) + '</b></div>' }).join('') +
    '<div class="totals" style="margin-top:12px">' + ['colchones', 'muebles'].filter(b => T[b]).map(b => '<div><span>' + brandName(b) + '</span><span>' + money(T[b]) + '</span></div>').join('') + '<div><span>Envío</span><span>' + (CO.d.mun && CO.d.mun !== 'otro' ? (sh ? money(sh) : 'GRATIS') : 'Por calcular') + '</span></div><div class="grand"><span>Total</span><span>' + money(T.total + sh) + '</span></div></div>' +
    '<p class="small muted" style="margin-top:12px">o 12 cuotas de ~' + money((T.total + sh) / 12) + ' con tarjeta</p><div class="lock">🛡️ Garantía de fábrica · ↩️ 5 días de retracto · 🔁 Te acompañamos por WhatsApp</div>' +
    '<a class="btn wa block sm" style="margin-top:12px" target="_blank" rel="noopener" data-wa href="' + waLink(cartText() + '\n(Tengo una duda antes de pagar)') + '">¿Dudas? Te ayudamos por WhatsApp</a>';
}
function validate(step) {
  const d = CO.d, err = {};
  const req = (k, m) => { if (!String(d[k] ?? '').trim()) err[k] = m };
  if (step === 1) {
    req('nombre', 'Escribe tus nombres'); req('apellido', 'Escribe tus apellidos'); req('tdoc', 'Elige el tipo');
    if (!/^\d{5,11}$/.test(d.doc || '') && d.tdoc !== 'PP') err.doc = 'Documento de 5 a 11 dígitos, sin puntos';
    if (!/^3\d{9}$/.test(d.cel || '')) err.cel = 'Celular colombiano de 10 dígitos que empiece por 3';
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(d.email || '')) err.email = 'Revisa tu correo';
  }
  if (step === 2) {
    req('dep', 'Elige el departamento'); req('mun', 'Elige el municipio');
    if (!d.n1 || !d.n2 || !d.n3) err.dir = 'Completa la dirección: vía, número y placa';
    req('barrio', 'Escribe el barrio o conjunto'); req('viv', 'Elige el tipo de vivienda'); req('franja', 'Elige una franja');
    if (['Apartamento', 'Apartamento en conjunto'].includes(d.viv)) { req('comp', 'Indica torre y apartamento'); req('piso', 'Elige el piso'); req('asc', 'Cuéntanos del ascensor') }
    if (d.celRecibe && !/^3\d{9}$/.test(d.celRecibe)) err.celRecibe = 'Celular de 10 dígitos';
  }
  if (step === 3 && !d.terms) err.terms = 'Debes aceptar los términos para continuar';
  $$('#coForm .field').forEach(f => { const k = f.dataset.fld; if (!k) return; f.classList.toggle('bad', !!err[k]); f.classList.toggle('ok', !err[k] && !!String(d[k] ?? '').trim()); const e = $('.err', f); if (e) e.textContent = err[k] || '' });
  const first = Object.keys(err)[0]; if (first) { const el = $('[data-fld="' + first + '"]'); el && el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); }
  return !first;
}
function bindCO() {
  const f = $('#coForm'); renderCO();
  const sync = e => { const t = e.target; if (!t.name) return; CO.d[t.name] = t.type === 'checkbox' ? t.checked : t.value; store.set('rey.co', { ...CO.d, terms: false });
    if (t.name === 'dep') { CO.d.mun = ''; renderCO() } else if (t.name === 'viv' || t.name === 'mun') { if (t.name === 'mun') { const h = $('#munHint'); renderCO() } else renderCO() }
    else if (t.type === 'radio') { $$('input[name="' + t.name + '"]').forEach(r => r.closest('.rc').classList.toggle('on', r.checked)) }
    updShip(); if (t.closest('.field.bad')) validate(CO.step) };
  f.addEventListener('change', sync); f.addEventListener('input', e => { if (e.target.tagName === 'INPUT' && e.target.type !== 'checkbox' && e.target.type !== 'radio') { CO.d[e.target.name] = e.target.value; store.set('rey.co', { ...CO.d, terms: false }); updShip() } });
  f.addEventListener('submit', e => { e.preventDefault(); if (!validate(CO.step)) return; if (CO.step < 3) { CO.step++; track(CO.step === 2 ? 'AddContactInfo' : 'AddShippingInfo', {}); renderCO(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }) } else pay() });
  f.addEventListener('click', e => { if (e.target.closest('[data-back]')) { CO.step--; renderCO() } if (e.target.id === 'geo') geo() });
}
function geo() {
  const o = $('#geoOut'); if (!navigator.geolocation) return o.textContent = 'Tu navegador no permite ubicación';
  o.textContent = 'Buscando tu ubicación…';
  navigator.geolocation.getCurrentPosition(p => { CO.d.geo = [p.coords.latitude.toFixed(5), p.coords.longitude.toFixed(5)]; store.set('rey.co', CO.d);
    const near = [['Pereira', 4.813, -75.696], ['Dosquebradas', 4.839, -75.667], ['Santa Rosa de Cabal', 4.868, -75.621], ['Cartago', 4.746, -75.912], ['Armenia', 4.534, -75.681], ['Manizales', 5.07, -75.517]].map(c => [c[0], Math.hypot(c[1] - p.coords.latitude, c[2] - p.coords.longitude) * 111]).sort((a, b) => a[1] - b[1])[0];
    o.innerHTML = '✓ Ubicación guardada (' + CO.d.geo.join(', ') + ')' + (near[1] < 12 ? '<br>Parece que estás en <b>' + near[0] + '</b>. <button type="button" class="link" style="background:none;border:0;cursor:pointer" data-setmun="' + near[0] + '">Usar este municipio</button>' : '') },
  () => o.textContent = 'No pudimos obtener tu ubicación. Escribe un punto de referencia.', { timeout: 8000 });
}

/* Simulación de pasarela con pago dividido */
function pay() {
  const T = cartTotals(), sh = shipCost(), m = $('#pay'), d = CO.d;
  const legs = ['colchones', 'muebles'].filter(b => T[b]).map(b => ({ b, v: T[b] + (b === shBrand() ? sh : 0), ref: (b === 'colchones' ? 'CER-' : 'MER-') + Math.random().toString(36).slice(2, 7).toUpperCase() }));
  const method = { tarjeta: 'Tarjeta', pse: 'PSE', nequi: 'Nequi', addi: 'Addi', siste: 'Sistecrédito' }[d.pay || 'tarjeta'];
  m.innerHTML = '<div class="pay-box"><div class="pay-top"><div><b>Pasarela segura</b><br><small>Simulación · ' + method + '</small></div><b>' + money(T.total + sh) + '</b></div><div class="pay-in" id="payIn">' +
    (d.pay === 'tarjeta' || !d.pay ? '<div class="fields"><div class="field full"><label>Número de tarjeta (simulado)</label><input value="4242 4242 4242 4242" readonly></div><div class="field"><label>Vence</label><input value="12/29" readonly></div><div class="field"><label>Cuotas</label><select><option>1</option><option>3</option><option>6</option><option selected>12</option><option>24</option><option>36</option></select></div></div>' : '<p>Te redirigiríamos a <b>' + method + '</b> para aprobar el pago. En este preview simulamos la respuesta.</p>') +
    '<div class="split" style="margin-top:12px">' + legs.map((l, i) => '<div class="split-row"><span>Cobro ' + (i + 1) + ' · ' + brandName(l.b) + '<br><span class="small muted">Ref. ' + l.ref + '</span></span><b>' + money(l.v) + '</b></div>').join('') + '</div>' +
    '<p class="small muted">Simular respuesta del banco:</p><div style="display:flex;gap:8px"><button class="btn block" data-payok>Aprobar pago</button><button class="btn ghost block" data-payko>Rechazar</button></div></div></div>';
  m.classList.add('on'); $('#scrim').classList.add('on');
  m.onclick = async e => {
    if (e.target.closest('[data-payko]')) { track('PaymentDeclined', {}); $('#payIn').innerHTML = '<div style="text-align:center"><div style="font-size:50px">😕</div><h3>El banco rechazó el pago</h3><p>No te preocupes, tu carrito sigue guardado. Puedes intentar con otro medio o terminar la compra con un asesor.</p><div style="display:grid;gap:8px"><button class="btn" data-retry>Intentar de nuevo</button><button class="btn ghost" data-addi>Pagar a cuotas con Addi</button><a class="btn wa" target="_blank" rel="noopener" data-wa href="' + waLink(cartText() + '\nMi pago fue rechazado, ¿me ayudan?') + '">Terminar por WhatsApp</a></div></div>' }
    if (e.target.closest('[data-retry]')) pay();
    if (e.target.closest('[data-addi]')) { CO.d.pay = 'addi'; pay() }
    if (e.target.closest('[data-payok]')) {
      const box = $('#payIn');
      for (let i = 0; i < legs.length; i++) { box.innerHTML = '<div style="text-align:center"><div class="spinner"></div><b>Procesando cobro ' + (i + 1) + ' de ' + legs.length + '</b><p class="small muted">' + brandName(legs[i].b) + ' · ' + money(legs[i].v) + '</p></div>'; await new Promise(r => setTimeout(r, reduce ? 200 : 1300)) }
      track('Purchase', { value: T.total + sh, name: legs.length + ' orden(es)' });
      store.set('rey.lastOrder', { legs, name: d.nombre, mun: d.mun, items: cart.map(l => byId(l.id).name) });
      const items = cart.slice(); cart = []; saveCart();
      box.innerHTML = '<div style="text-align:center"><div class="okmark">✓</div><h3>¡Listo, ' + esc(d.nombre || '') + '! Ya eres de la realeza 👑</h3><p>Recibimos tu pago. Te escribimos por WhatsApp al ' + esc(d.cel || '') + ' para agendar la entrega en ' + esc(d.mun === 'otro' ? 'tu municipio' : d.mun) + '.</p></div>' + legs.map(l => '<div class="order-card"><b>' + brandName(l.b) + '</b> · Orden ' + l.ref + '<br><span class="small muted">' + items.filter(x => byId(x.id).brand === l.b).map(x => x.qty + ' × ' + byId(x.id).name).join(', ') + '</span><div class="price" style="font-size:17px;margin-top:4px">' + money(l.v) + '</div><span class="small">Factura electrónica de ' + brandName(l.b) + ' a ' + esc(d.email || '') + '</span></div>').join('') + '<a class="btn block" href="' + url('crm/') + '" data-link data-close-pay>Ver cómo sigue en el CRM →</a><button class="btn ghost block" style="margin-top:8px" data-close-pay>Seguir comprando</button>';
      confetti();
    }
    if (e.target.closest('[data-close-pay]')) { m.classList.remove('on'); $('#scrim').classList.remove('on'); if (!e.target.closest('a')) go(url('')) }
  };
}
function confetti() {
  if (reduce) return; const c = document.createElement('canvas'); c.className = 'confetti'; document.body.append(c); c.width = innerWidth; c.height = innerHeight; const x = c.getContext('2d');
  const ps = Array.from({ length: 140 }, () => ({ x: innerWidth / 2, y: innerHeight / 3, vx: (Math.random() - .5) * 14, vy: Math.random() * -12 - 3, c: ['#C61E24', '#C99A2E', '#111', '#E9C977'][Math.random() * 4 | 0], s: Math.random() * 6 + 4, r: Math.random() * 6 }));
  let f = 0; (function tick() { x.clearRect(0, 0, c.width, c.height); ps.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += .35; p.r += .1; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); x.restore() }); if (++f < 140) requestAnimationFrame(tick); else c.remove() })();
}

/* Propuesta técnica: pagos dos marcas */
V.propuesta = () => '<section class="shop-head"><div class="wrap"><div class="crumbs"><a href="' + url('') + '" data-link>Inicio</a> / Propuesta técnica</div><span class="kicker">Para los socios de El Rey</span><h1 style="font-size:clamp(32px,4.6vw,56px)">Dos marcas, un dominio, dos cuentas bancarias.</h1><p style="max-width:760px">Colchones El Rey y Muebles El Rey venden en la misma tienda, pero cada una recibe su dinero en su propia cuenta y emite su propia factura. Así funciona.</p></div></section>' +
  '<section class="section"><div class="wrap"><h2 style="font-size:30px">El recorrido del dinero</h2><div class="flow"><span>🛒 Carrito mixto</span><i>→</i><span>Se separa por marca (cada producto tiene su “vendedor”)</span><i>→</i><span>1 pago del cliente</span><i>→</i><span>Pasarela con <b>pagos divididos</b> (split)</span><i>→</i><span>🏦 Cuenta Colchones El Rey</span><span>🏦 Cuenta Muebles El Rey</span><i>→</i><span>2 facturas electrónicas</span></div>' +
  '<div class="arch" style="margin-top:20px"><div class="panel"><span class="kicker">Opción A · Recomendada</span><h3>WooCommerce (WordPress) + marketplace + pasarela con split</h3><p class="small">Un plugin multivendedor (p. ej. Dokan o WCFM) crea dos “tiendas” internas: Colchones y Muebles. La pasarela divide el pago en la transacción y liquida a cada cuenta.</p><p class="small"><b>Pro:</b> un solo checkout, conciliación automática, un dominio.<br><b>Validar:</b> que la pasarela elegida (p. ej. ePayco, Mercado Pago u otra con split/marketplace en Colombia) apruebe a ambos NIT como comercios vinculados y sus comisiones.</p></div>' +
  '<div class="panel"><span class="kicker">Opción B · Más simple</span><h3>Un dominio, dos checkouts encadenados</h3><p class="small">El carrito se separa en dos órdenes y el cliente paga dos veces seguidas, cada una con las llaves de la pasarela de cada empresa (Wompi, PayU, ePayco, etc.).</p><p class="small"><b>Pro:</b> no requiere split; cada marca usa su propia cuenta de pasarela.<br><b>Contra:</b> dos pagos = más fricción; si el 2.º falla, queda una compra a medias que el CRM debe recuperar.</p></div>' +
  '<div class="panel"><span class="kicker">Opción C · Shopify</span><h3>Dos tiendas Shopify bajo el mismo dominio</h3><p class="small">Shopify liquida una sola cuenta por tienda. Se crea colchones.elrey… y muebles.elrey… (subdominios) con carrito compartido por enlace, o una sola tienda y traslado contable mensual.</p><p class="small"><b>Pro:</b> plataforma muy estable.<br><b>Contra:</b> sin carrito unificado real; el traslado entre empresas tiene implicaciones tributarias.</p></div></div>' +
  '<h2 style="font-size:30px;margin-top:50px">Comparativo rápido</h2><div style="overflow-x:auto;border-radius:16px"><table class="cmp" style="min-width:560px"><tr><th>Criterio</th><th>A · Woo + split</th><th>B · Dos checkouts</th><th>C · Shopify ×2</th></tr><tr><td>Pagos del cliente</td><td>1</td><td>2</td><td>1 o 2</td></tr><tr><td>Cuentas separadas</td><td>Sí, automático</td><td>Sí</td><td>Sí (2 tiendas)</td></tr><tr><td>Facturas por marca</td><td>Sí</td><td>Sí</td><td>Sí</td></tr><tr><td>Costo mensual</td><td>Hosting + plugin</td><td>Hosting</td><td>2 planes Shopify</td></tr><tr><td>Complejidad</td><td>Media</td><td>Baja</td><td>Media</td></tr></table></div>' +
  '<h2 style="font-size:30px;margin-top:50px">Lo que se conecta</h2><div class="arch"><div class="panel"><b>📈 Medición</b><p class="small">Meta Pixel + API de Conversiones, Google Analytics 4 y Google Ads: ViewContent, AddToCart, InitiateCheckout, Purchase y Lead con valor y producto, para que la pauta optimice por ventas.</p></div><div class="panel"><b>💬 WhatsApp Business API</b><p class="small">Línea principal conectada a CRM: respuesta en segundos, asignación a asesor, plantillas aprobadas por Meta y seguimiento con consentimiento. <a class="link" href="' + url('crm/') + '" data-link>Ver el recorrido</a></p></div><div class="panel"><b>🧾 Operación</b><p class="small">Inventario por SKU y variante, factura electrónica DIAN por marca, guía de despacho y estados del pedido por WhatsApp.</p></div></div>' +
  '<p class="small muted" style="margin-top:30px">Nota: la viabilidad final depende de la aprobación de la pasarela, de los contratos de cada empresa y de su asesoría contable. Este preview no mueve dinero.</p></div></section>';

V.crm = () => '<div id="crmRoot" class="wrap crm"><div class="spinner"></div></div>';
V.notFound = () => '<section class="section"><div class="wrap" style="text-align:center"><h1 style="font-size:44px">No encontramos esta página</h1><a class="btn" href="' + url('') + '" data-link>Volver al inicio</a></div></section>';

/* ───── Router ───── */
function route() {
  let r = decodeURIComponent(location.pathname);
  r = r.startsWith(BASE) ? r.slice(BASE.length) : r.replace(/^\//, '');
  return r.replace(/index\.html$/, '').replace(/\/$/, '');
}
function render() {
  const r = route(), app = $('#app'); let html, after;
  closeAll(); clearTimeout(nudgeT); document.body.classList.remove('has-sticky'); document.body.style.overflow = ''; $('.chat-nudge')?.classList.remove('on');
  if (r === '') { html = V.home(); after = () => { renderQuiz(0); countdown() } }
  else if (SHOP[r]) { html = V.shop(r); after = () => { bindShop(); if (r === 'promos') countdown() } }
  else if (r.startsWith('producto/')) { html = V.product(r.split('/')[1]); after = () => byId(r.split('/')[1]) && bindProduct() }
  else if (R.landings[r]) html = V.landing(r);
  else if (r === 'hogares') html = V.hogares();
  else if (r === 'proyectos') { html = V.proyectos(); after = bindProyectos }
  else if (r === 'checkout') { CO.step = 1; html = V.checkout(); after = () => cart.length && bindCO() }
  else if (r === 'propuesta') html = V.propuesta();
  else if (r === 'crm') { html = V.crm(); after = () => loadScript('crm.js').then(() => window.ReyCRM.mount($('#crmRoot'), { R, img, money, esc, url, store, track })) }
  else html = V.notFound();
  app.innerHTML = html; after && after();
  const pr = r.startsWith('producto/') && byId(r.split('/')[1]);
  document.title = pr ? pr.name + ' · ' + money(pr.price) + ' · ' + brandName(pr.brand) : r === '' ? 'El Rey · Colchones y Muebles en el Eje Cafetero' : SHOP[r] ? SHOP[r].t + ' · El Rey' : R.landings[r] ? R.landings[r].h + ' · El Rey' : ({ hogares: 'Hogares del Eje Cafetero · El Rey', proyectos: 'Proyectos para negocios, hotelería y hogar · El Rey', checkout: 'Finalizar compra · El Rey', crm: 'Preview CRM · El Rey', propuesta: 'Propuesta técnica · El Rey' })[r] || 'El Rey';
  $$('.nav a').forEach(a => a.classList.toggle('on', a.pathname !== BASE && location.pathname.startsWith(a.pathname)));
  splitText(); observe(); lazyVideos();
  if (location.hash) { const tg = document.getElementById(location.hash.slice(1)); if (tg) setTimeout(() => tg.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }), 80) }
  if (r.startsWith('producto/')) nudge('¿Dudas con la medida o el color? Te ayudo a elegir 👑', 9000);
  else if (r === 'checkout') nudge('Si tienes una duda antes de pagar, aquí estoy 👋', 20000);
}
function go(href) { history.pushState({}, '', href); window.scrollTo({ top: 0, behavior: 'auto' }); render() }
const scripts = {};
function loadScript(n) { return scripts[n] || (scripts[n] = new Promise((ok, ko) => { const s = document.createElement('script'); s.src = asset(n); s.onload = ok; s.onerror = ko; document.body.append(s) })) }

/* ───── Interacción global ───── */
document.addEventListener('click', e => {
  const a = e.target.closest('a[data-link]');
  if (a && a.classList.contains('logo') && !e.ctrlKey && !e.metaKey) { e.preventDefault(); closeAll(); window.ReyBot?.close(); if (route() === '' && !location.hash) window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); else go(url('')); return }
  if (a && !e.ctrlKey && !e.metaKey && a.origin === location.origin) { e.preventDefault(); if (a.hasAttribute('data-close')) closeAll(); go(a.pathname + a.hash) ; return }
  const t = e.target.closest('button,a,[data-cmb]'); if (!t) return;
  if (t.matches('[data-open-cart]')) { e.preventDefault(); openCart() }
  if (t.id === 'cartBtn') openCart();
  if (t.matches('[data-close]') && !a) closeAll();
  if (t.dataset.add) { addToCart(t.dataset.add) }
  if (t.dataset.rm !== undefined) { cart.splice(+t.dataset.rm, 1); saveCart(); openCart() }
  if (t.dataset.q !== undefined) { const l = cart[+t.dataset.q]; l.qty = Math.max(1, Math.min(9, l.qty + +t.dataset.d)); saveCart(); openCart() }
  if (t.id === 'burger') { $('#nav').classList.toggle('on'); $('#scrim').classList.toggle('on') }
  if (t.dataset.qz !== undefined) { qa[t.dataset.k] = t.dataset.v; renderQuiz(+t.dataset.qz + 1) }
  if (t.hasAttribute('data-qz-reset')) { qa = {}; renderQuiz(0) }
  if (t.dataset.rev) { const tr = $('#revs'); tr.scrollBy({ left: +t.dataset.rev * 360, behavior: 'smooth' }) }
  if (t.dataset.size !== undefined) { PD.size = +t.dataset.size; pdUpdate() }
  if (t.dataset.color !== undefined) { PD.color = +t.dataset.color; pdUpdate(); applyColor(); track('CustomizeProduct', { name: PD.p.name + ' · ' + PD.p.colors[PD.color].name }) }
  if (t.dataset.thumb !== undefined) showImg(+t.dataset.thumb);
  if (t.dataset.qty) { PD.qty = Math.max(1, Math.min(9, PD.qty + +t.dataset.qty)); pdUpdate() }
  if (t.hasAttribute('data-addpd')) addToCart(PD.p.id, PD.size, PD.p.colors ? PD.p.colors[PD.color].name : '', PD.qty);
  if (t.hasAttribute('data-buy')) { addToCart(PD.p.id, PD.size, PD.p.colors ? PD.p.colors[PD.color].name : '', PD.qty, 0, true); go(url('checkout/')) }
  if (t.hasAttribute('data-addcombo')) { addToCart(PD.p.id, PD.size, PD.p.colors ? PD.p.colors[PD.color].name : '', PD.qty, 0, true); PD.combo.forEach(id => addToCart(id, null, null, 1, COMBO_OFF, true)); openCart() }
  if (t.dataset.spot) spotCard(t);
  if (t.dataset.proj) { const r = $('#projForm input[name="tipo"][value="' + t.dataset.proj + '"]'); if (r) { r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })) } $('#proj-form')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }) }
  if (t.hasAttribute('data-wa')) track('Contact', { name: 'Clic a WhatsApp' });
  if (t.dataset.chat !== undefined || t.id === 'chatBtn' || t.id === 'nudge') openChat(t.dataset.chat);
  if (t.dataset.setmun) { CO.d.mun = t.dataset.setmun; renderCO() }
  if (t.id === 'pixelToggle') $('#pixelLog').classList.toggle('on');
});
$('#nudge').addEventListener('click', () => openChat());
$('#scrim').addEventListener('click', () => { closeAll(); const m = $('#pay'); if (m.classList.contains('on') && !$('.spinner', m)) m.classList.remove('on') });
addEventListener('keydown', e => { if (e.key === 'Escape') { closeAll(); window.ReyBot?.close() } });
addEventListener('popstate', render);

function spotCard(btn) {
  $$('.spot-card').forEach(x => x.remove()); const p = byId(btn.dataset.spot), host = btn.parentElement;
  const c = document.createElement('a'); c.className = 'spot-card'; c.href = url('producto/' + p.id + '/'); c.setAttribute('data-link', '');
  c.style.left = btn.style.left; c.style.top = btn.style.top;
  c.innerHTML = '<img src="' + img(p.imgs[0], 400) + '" alt=""><span><b>' + esc(p.name) + '</b><span class="price" style="font-size:15px">' + money(p.price) + '</span><br><span class="small" style="color:var(--red);font-weight:700">Ver producto →</span></span>';
  host.append(c); track('ViewContent', { name: 'Hotspot ' + p.name });
}
function openChat(q) { loadScript('bot.js').then(() => window.ReyBot.open(q, { R, byId, img, money, esc, url, addToCart, openCart, waLink, track, go, store, cart: () => cart, cartText })) }
let nudgeT; function nudge(t, ms) { clearTimeout(nudgeT); nudgeT = setTimeout(() => { if (window.ReyBot?.isOpen()) return; const n = $('#nudge'); n.innerHTML = esc(t); n.classList.add('on'); setTimeout(() => n.classList.remove('on'), 9000) }, ms) }

/* Animaciones de scroll, parallax, contadores, videos */
let io;
function observe() {
  if (!('IntersectionObserver' in window) || reduce) { $$('.rv').forEach(x => x.classList.add('in')); $$('[data-count]').forEach(x => x.textContent = x.dataset.count); return }
  io = io || new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; const t = e.target; t.classList.add('in'); if (t.dataset.count) countUp(t); io.unobserve(t) }), { rootMargin: '0px 0px -8% 0px' });
  $$('.rv:not(.in),[data-count]').forEach(x => io.observe(x));
}
function countUp(el) { const end = +el.dataset.count, t0 = performance.now(); (function f(t) { const k = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f) })(t0) }
function splitText() { if (reduce) return; $$('.split-text').forEach(h => { if (h.dataset.done) return; h.dataset.done = 1; let i = 0; const walk = n => [...n.childNodes].forEach(c => { if (c.nodeType === 3) { const frag = document.createDocumentFragment(); c.textContent.split(/(\s+)/).forEach(w => { if (!w.trim()) return frag.append(w); const s = document.createElement('span'); s.className = 'w'; s.style.animationDelay = (i++ * 55) + 'ms'; s.textContent = w; frag.append(s) }); c.replaceWith(frag) } else walk(c) }); walk(h) }) }
function lazyVideos() {
  const vids = $$('video[data-src]'); if (!vids.length) return;
  const start = () => { const vo = new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (e.isIntersecting) { if (!v.src) v.src = v.dataset.src; if (!reduce) v.play().catch(() => {}) } else v.pause() }), { threshold: .25 }); vids.forEach(v => vo.observe(v)) };
  const slow = navigator.connection && (navigator.connection.saveData || /2g/.test(navigator.connection.effectiveType || ''));
  if (slow) return; if (document.readyState === 'complete') setTimeout(start, 1200); else addEventListener('load', () => setTimeout(start, 1800), { once: true });
}
let ticking = false;
addEventListener('scroll', () => { if (ticking) return; ticking = true; requestAnimationFrame(() => {
  const y = scrollY, h = document.documentElement.scrollHeight - innerHeight; $('#progress').style.width = (h > 0 ? y / h * 100 : 0) + '%'; $('#hdr').classList.toggle('scrolled', y > 10);
  if (!reduce) { $$('[data-par]').forEach(el => el.style.transform = 'translate3d(0,' + (y * +el.dataset.par) + 'px,0)'); $$('[data-band]').forEach(b => { const r = b.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight) $('img.bg', b).style.transform = 'translate3d(0,' + ((r.top - innerHeight / 2) * -0.12) + 'px,0)' }) }
  ticking = false }) }, { passive: true });
let cdT;
function countdown() {
  const end = new Date('2026-11-30T23:59:59-05:00').getTime(); clearInterval(cdT);
  const f = () => { const el = $('#countdown'); if (!el) return clearInterval(cdT); let s = Math.max(0, (end - Date.now()) / 1000 | 0); const v = [s / 86400 | 0, (s % 86400) / 3600 | 0, (s % 3600) / 60 | 0, s % 60]; $$('b', el).forEach((b, i) => b.textContent = String(v[i]).padStart(2, '0')) };
  f(); cdT = setInterval(f, 1000);
}

/* Recaptación: si el cliente se va con el carrito lleno, ofrecer guardarlo por WhatsApp (una vez por sesión, con consentimiento) */
function exitOffer() {
  if (sessionStorage.getItem('rey.exit') || !cart.length || route() === 'checkout' || $('.chat.on') || $('#pay').classList.contains('on')) return;
  sessionStorage.setItem('rey.exit', 1); track('ExitIntent', {});
  const m = $('#pay'), T = cartTotals();
  m.innerHTML = '<div class="pay-box"><div class="pay-top"><div><b>¿Te vas tan pronto? 👑</b><br><small>Te guardamos tu selección</small></div><button class="x" data-exit-close aria-label="Cerrar" style="background:rgba(255,255,255,.15);border:0;color:#fff">×</button></div><div class="pay-in"><p>Tienes ' + T.items + ' producto(s) por ' + money(T.total) + '. Déjanos tu WhatsApp y te enviamos el resumen para que lo revises con calma (y te avisamos si se acaba la promo).</p><form id="exitF" class="fields"><div class="field full"><label for="exN">Tu nombre</label><input id="exN" required maxlength="60" autocomplete="given-name"></div><div class="field full"><label for="exC">Celular (WhatsApp)</label><input id="exC" required inputmode="tel" maxlength="10" pattern="3[0-9]{9}" placeholder="3001234567"></div><label class="check full"><input type="checkbox" id="exOk" required><span>Autorizo a El Rey a escribirme por WhatsApp sobre esta compra. Puedo darme de baja cuando quiera.</span></label><button class="btn block full">Guardar mi carrito</button><button type="button" class="btn ghost block full" data-exit-close>No, gracias</button></form></div></div>';
  m.classList.add('on'); $('#scrim').classList.add('on');
  m.onclick = e => { if (e.target.closest('[data-exit-close]')) { m.classList.remove('on'); $('#scrim').classList.remove('on') } };
  $('#exitF').onsubmit = e => { e.preventDefault(); const c = $('#exC').value; if (!/^3\d{9}$/.test(c)) { $('#exC').closest('.field').classList.add('bad'); return } store.set('rey.co', { ...store.get('rey.co', {}), nombre: $('#exN').value, cel: c, optin: true }); track('Lead', { name: 'Carrito guardado por WhatsApp' }); $('.pay-in', m).innerHTML = '<div style="text-align:center"><div class="okmark">✓</div><h3>¡Listo, ' + esc($('#exN').value || '') + '!</h3><p>En la versión real te llegaría ahora el resumen por WhatsApp desde la línea principal. Mira cómo sigue el recorrido:</p><a class="btn block" href="' + url('crm/') + '" data-link data-exit-close>Ver mi recorrido en el CRM →</a></div>' };
}
document.addEventListener('mouseout', e => { if (!e.relatedTarget && e.clientY < 8 && innerWidth > 900) exitOffer() });
let hidT; document.addEventListener('visibilitychange', () => { if (document.hidden) hidT = Date.now(); else if (hidT && Date.now() - hidT > 15000 && innerWidth <= 900) exitOffer() });

saveCart(); $('#cartCount').classList.remove('pop');
render();
if ('requestIdleCallback' in window) requestIdleCallback(() => loadScript('bot.js')); else setTimeout(() => loadScript('bot.js'), 2500);
})();
