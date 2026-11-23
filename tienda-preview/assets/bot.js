/* Reina · asistente de ventas El Rey
   Motor de intenciones con base de conocimiento (data.js). Reglas de oro:
   1) Cada producto se describe solo con SUS datos (no se mezclan fichas).
   2) Lo que no está verificado se dice tal cual y se pasa al asesor.
   3) Empatía primero, luego dato, luego un escenario y una propuesta concreta.
   En producción puede conectarse a un LLM usando esta misma base y estas reglas. */
(() => {
'use strict';
let H, el, open = false;
const ctx = { last: null, options: [], need: null, size: null, budget: null, city: null, name: null, who: null, dims: null, objections: 0, turns: 0 };
const norm = s => ' ' + String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/(?<!\d)[.,]|[.,](?!\d)/g, ' ').replace(/[¿?¡!;:()"“”]/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
const has = (q, re) => re.test(q);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const vary = arr => arr[ctx.turns % arr.length];

/* ───── Interfaz ───── */
function mount() {
  if (el) return;
  el = document.createElement('div'); el.className = 'chat'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Asistente El Rey');
  el.innerHTML = '<div class="chat-top"><span class="av">👑</span><div><b>Reina · Guía El Rey</b><small>Asistente automático · responde al instante</small></div><button class="x" aria-label="Cerrar asistente">×</button></div><div class="msgs" id="msgs" aria-live="polite"></div><div class="chips" id="chips"></div><form id="chatF"><label class="sr" for="chatIn">Escribe tu pregunta</label><input id="chatIn" autocomplete="off" maxlength="300" placeholder="Escribe tu duda…"><button aria-label="Enviar">➤</button></form>';
  document.body.append(el);
  el.querySelector('.x').onclick = close;
  el.querySelector('#chatF').onsubmit = e => { e.preventDefault(); const i = el.querySelector('#chatIn'), v = i.value.trim(); if (!v) return; i.value = ''; user(v) };
  el.addEventListener('click', e => {
    const c = e.target.closest('[data-c]'); if (c) return user(c.dataset.c);
    const a = e.target.closest('[data-badd]');
    if (a) { const [id, s] = a.dataset.badd.split('|'); const p = H.byId(id); H.addToCart(id, s === '' ? null : +s); ctx.last = p; return bot([['t', '¡Listo! <b>' + H.esc(p.name) + '</b> ya está en tu carrito 🛒 ' + (p.combo && p.combo.length ? '¿Le sumamos algo para armar combo y ahorrar 5% en el complemento, o lo pagamos de una?' : '¿Lo pagamos de una?')]], ['Pagar ahora', 'Armar combo', 'Ver carrito']) }
    const g = e.target.closest('[data-bgo]'); if (g) { e.preventDefault(); H.go(g.getAttribute('href')); if (innerWidth < 600) close() }
  });
}
function add(html, me) { const m = document.createElement('div'); m.className = 'msg' + (me ? ' me' : ''); m.innerHTML = html; el.querySelector('#msgs').append(m); scroll(); return m }
function scroll() { const b = el.querySelector('#msgs'); b.scrollTop = b.scrollHeight }
function chips(list) { el.querySelector('#chips').innerHTML = (list || []).map(c => '<button data-c="' + H.esc(c) + '">' + H.esc(c) + '</button>').join('') }
function pcard(p, si) {
  const s = si ?? p.defSize ?? 0;
  return '<div class="pcard"><img src="' + H.img(p.imgs[0], 400) + '" alt=""><div><b>' + H.esc(p.name) + '</b><span class="small muted">' + H.esc(p.sizes[s].l) + '</span><div class="price">' + H.money(p.sizes[s].p) + '</div><div class="acts"><button data-badd="' + p.id + '|' + s + '">Agregar</button><a href="' + H.url('producto/' + p.id + '/') + '" data-bgo>Ver ficha</a></div></div></div>';
}
async function bot(parts, ch) {
  const typing = add('<span class="typing"><i></i><i></i><i></i></span>');
  await sleep(Math.min(1300, 420 + String(parts[0]?.[1] || '').length * 6));
  typing.remove();
  const shown = [];
  for (const [k, v, s] of parts) {
    if (k === 't') add(v);
    else if (k === 'p') { shown.push(v); const w = document.createElement('div'); w.innerHTML = pcard(v, s); el.querySelector('#msgs').append(w.firstChild) }
    else if (k === 'h') { const w = document.createElement('div'); w.innerHTML = v; el.querySelector('#msgs').append(w.firstChild) }
    scroll(); await sleep(240);
  }
  if (shown.length === 1) { ctx.last = shown[0]; ctx.options = [] } else if (shown.length > 1) { ctx.options = shown.map(p => p.id); ctx.last = null }
  chips(ch);
}
function user(t) { add(H.esc(t), true); chips([]); H.track('ChatMessage', { name: t.slice(0, 40) }); ctx.turns++; reply(t) }

/* ───── Conocimiento ───── */
const P = () => H.R.products, byId = id => H.byId(id);
const minP = p => Math.min(...p.sizes.map(s => s.p));
const isBed = p => p && (p.cat === 'colchones' || p.cat === 'camas');
const group = p => !p ? null : isBed(p) || p.cat === 'almohadas' ? 'sleep' : p.cat === 'comedores' ? 'comedor' : 'sala';
const spec = (p, re) => { const f = p.specs.find(([k]) => re.test(norm(k))); return f ? f[1] : null };
const sizeIdx = (p, sz) => { if (!sz) return p.defSize ?? 0; const i = p.sizes.findIndex(s => s.l.startsWith(sz)); return i < 0 ? (p.defSize ?? 0) : i };
const priceOf = (p, si) => { const s = p.sizes[si ?? p.defSize ?? 0]; return '<b>' + H.money(s.p) + '</b>' + (s.ref ? ' <span class="small muted">(valor de referencia: te lo confirma el asesor)</span>' : '') };
const cm = l => { const m = String(l).match(/(\d{3}) × (\d{3})/); return m ? [+m[1], +m[2]] : null };
const free = c => H.R.ship.free.includes(c);
const munis = () => Object.values(H.R.ship.depts).flat();
const cuota = (v, n) => H.money(Math.round(v / n / 1000) * 1000);

/* ───── Reconocimiento de lo que pide el cliente ───── */
const PMAP = [
  ['sofa-cama', /sofa ?cama|sofacama/], ['cama-gran-duque-lujo', /cama (del? )?(gran )?duque|cama de lujo|duque de lujo|espaldar|cabecero|cama completa|cama con espaldar/],
  ['colchon-gran-duque', /gran duque|\bduque\b|super pillow/], ['colchon-semiortopedico-base', /semi ?ortoped/], ['colchon-pillow-confort', /pillow confort|cazata|\bconfort\b(?! \+)/],
  ['colchon-resortado-confort', /combo colchon|colchon \+ base|colchon resortado \+|combo resortado/], ['almohada-viscoelastica', /almohad/],
  ['sala-venecia', /venecia/], ['sala-boston', /boston/], ['sala-roma', /\broma\b/], ['sala-capriani', /caprian/], ['sala-vancouver', /vancouver/], ['sala-imperial', /imperial/], ['sala-nube', /\bnube\b|cloud|boucle/],
  ['comedor-orion', /orion/], ['comedor-nordico', /nordico/], ['set-puff-mesa', /\bpuff\b|mesa auxiliar/]
];
function productOf(q) { for (const [id, re] of PMAP) if (re.test(q)) return byId(id); return null }
function catOf(q) {
  if (has(q, /sofa ?cama/)) return 'sala';
  if (has(q, /colchon|dormir|descans|\bcama\b|almohad|habitacion|alcoba/)) return 'sleep';
  if (has(q, /comedor|sillas|\bmesa\b(?! auxiliar)|puestos/)) return 'comedor';
  if (has(q, /\bsala\b|\bsalas\b|sofa|esquinera|poltrona|mueble|living/)) return 'sala';
  return null;
}
function sizeOf(q) {
  if (has(q, /\bking\b|200 ?x ?200|\b2 ?x ?2\b|dos metros/)) return 'King';
  if (has(q, /\bqueen\b|\b160\b|1[.,]60/)) return 'Queen';
  if (has(q, /semi ?doble|\b120\b|1[.,]20/)) return 'Semidoble';
  if (has(q, /\bdoble\b|\b140\b|1[.,]40|matrimonial/)) return 'Doble';
  if (has(q, /sencill|individual|\b100\b|1[.,]00 x/)) return 'Sencillo';
  return null;
}
function whoOf(q) {
  if (has(q, /ninos|nino|nina|hij[oa]s?|bebe|familia/)) return 'familia';
  if (has(q, /pareja|esposa|esposo|novi[oa]|mi senora|mi marido|dos personas|los dos|ambos|nosotros dos/)) return 'pareja';
  if (has(q, /duermo sol[oa]|para mi solo|para mi sola|solo para mi|una persona|\bsolo yo\b|\bsola yo\b|soltero|soltera/)) return 'solo';
  if (has(q, /visitas|huespedes|invitados/)) return 'visitas';
  return null;
}
function budgetOf(q) {
  let m = q.match(/(\d+(?:[.,]\d+)?)\s*(millon|millones|palo|palos|melones)/); if (m) return parseFloat(m[1].replace(',', '.')) * 1e6;
  m = q.match(/(\d{2,4})\s*(mil|k\b|lucas)/); if (m) return +m[1] * 1000;
  m = q.match(/\$?\s?(\d{1,3}(?:[.\s]\d{3}){1,2})(?!\s*(cm|x|por))/); if (m) { const v = +m[1].replace(/[.\s]/g, ''); if (v >= 100000) return v }
  if (has(q, /un millon|1 millon/)) return 1e6;
  return null;
}
function dimsOf(q) {
  const m = q.match(/(\d+(?:[.,]\d+)?)\s*(m|mts|metros|cm)?\s*(?:x|por)\s*(\d+(?:[.,]\d+)?)\s*(m|mts|metros|cm)?/);
  if (!m) return null;
  let a = parseFloat(m[1].replace(',', '.')), b = parseFloat(m[3].replace(',', '.'));
  if (a > 20 || b > 20 || m[2] === 'cm' || m[4] === 'cm') { if ([100, 120, 140, 160, 200].includes(Math.min(a, b)) && [190, 200].includes(Math.max(a, b))) return null; a /= 100; b /= 100 }
  if (a < 1.5 || b < 1.5 || a > 12 || b > 12) return null;
  return [Math.min(a, b), Math.max(a, b)];
}
function cityOf(q) { for (const c of munis()) if (q.includes(' ' + norm(c).trim() + ' ')) return c; return null }
function ordinal(q) {
  if (!ctx.options.length) return null;
  if (has(q, /\bprimer|\b1ro\b|el de arriba|la de arriba/)) return byId(ctx.options[0]);
  if (has(q, /segund|el otro|la otra|el de abajo|la de abajo/)) return byId(ctx.options[1] || ctx.options[0]);
  if (has(q, /tercer/)) return byId(ctx.options[2] || ctx.options[0]);
  return null;
}
const WHO_TXT = { solo: 'para ti', pareja: 'para ti y tu pareja', familia: 'para la familia', visitas: 'para recibir visitas' };
const NEED_TXT = { sleep: 'descanso', sala: 'sala', comedor: 'comedor' };
function recap(found) {
  const bits = [];
  if (found.p) bits.push(found.p.name); else if (found.cat) bits.push(NEED_TXT[found.cat]);
  if (found.size) bits.push('medida ' + found.size.toLowerCase());
  if (found.who) bits.push(WHO_TXT[found.who]);
  if (found.city) bits.push('en ' + found.city);
  if (found.budget) bits.push('hasta ' + H.money(found.budget));
  if (found.dims) bits.push('espacio de ' + found.dims.map(x => String(x).replace('.', ',')).join(' × ') + ' m');
  return bits.length >= 2 ? '✅ Te entendí: <b>' + bits.join(' · ') + '</b>.' : '';
}

/* ───── Escenarios hipotéticos ───── */
function scFit(p, si, dims) {
  const d = cm(p.sizes[si].l); if (!d || !dims) return '';
  const [w, l] = d, side = Math.round((dims[0] * 100 - w) / 2), foot = Math.round(dims[1] * 100 - l);
  const roomTxt = dims.map(x => String(x).replace('.', ',')).join(' × ');
  if (side < 45 || foot < 50) return '📏 Imagínate tu cuarto de ' + roomTxt + ' m con la ' + p.sizes[si].l.split(' ')[0].toLowerCase() + ' (' + w + ' × ' + l + '): te quedarían solo ' + Math.max(side, 0) + ' cm a cada lado. Queda justo; una medida menor te deja caminar más cómodo.';
  return '📏 Imagínate tu cuarto de ' + roomTxt + ' m con la ' + p.sizes[si].l.split(' ')[0].toLowerCase() + ' (' + w + ' × ' + l + '): te quedan unos <b>' + side + ' cm a cada lado</b> y ' + (foot / 100).toFixed(1).replace('.', ',') + ' m a los pies. ' + (side < 60 ? 'Caben mesas de noche pequeñas; queda justo pero cómodo.' : 'Caben las mesas de noche y circulas tranquilo.');
}
function scCouple() { return '🛏️ Si duermen dos: en la <b>doble (140)</b> cada uno tiene 70 cm, en la <b>queen (160)</b> 80 cm y en la <b>king (200)</b> 1 metro. Si alguno se mueve mucho o mide más de 1,80 m, la queen se agradece.' }
function scPay(v, noTail) { return '💳 Haciendo cuentas: ' + H.money(v) + ' a <b>12 cuotas</b> con tarjeta quedaría alrededor de <b>' + cuota(v, 12) + ' al mes</b> (y a 6 cuotas, ~' + cuota(v, 6) + '); el valor exacto lo pone tu banco.' + (noTail ? '' : ' Si no tienes tarjeta, con <b>Addi o Sistecrédito</b> te aprueban en minutos.') }
function scShip(v, c) { if (!c) return ''; return free(c) ? '🚚 Y como estás en <b>' + c + '</b>, el envío es <b>GRATIS</b>: pagas ' + H.money(v) + ' y listo.' : '🚚 Con envío a <b>' + c + '</b> (+' + H.money(H.R.ship.fee) + ', zona urbana) te queda en <b>' + H.money(v + H.R.ship.fee) + '</b>.' }
function scNight(p) { return p.id === 'colchon-gran-duque' || p.id === 'cama-gran-duque-lujo' ? '✨ Míralo así: con 5 años de garantía en el colchón, ' + H.money(p.price) + ' sale a menos de <b>' + H.money(Math.ceil(p.price / (5 * 365) / 10) * 10) + ' por noche</b>. Menos que un tinto, para dormir como un rey.' : '' }
function scCombo(p) { const c = (p.combo || []).map(byId).find(Boolean); if (!c) return ''; return '🎁 Si lo combinas con <b>' + c.name + '</b>, el combo queda en <b>' + H.money(p.price + c.price * 0.95) + '</b> y te ahorras ' + H.money(c.price * 0.05) + ' (5% en el complemento).' }

/* ───── Respuestas por producto (solo con sus propios datos) ───── */
function about(p, si) {
  si = si ?? sizeIdx(p, ctx.size);
  const out = [['t', '<b>' + H.esc(p.name) + '</b> · ' + H.esc(p.tagline) + '. ' + H.esc(p.desc)], ['p', p, si]];
  if (isBed(p) && ctx.size && !p.sizes.some(s => s.l.startsWith(ctx.size))) out.push(['t', 'Ojo: este viene en <b>' + H.esc(p.sizes[0].l) + '</b>. ' + (p.id === 'colchon-gran-duque' ? '' : 'Si necesitas ' + ctx.size.toLowerCase() + ', el Gran Duque sí la tiene; otras medidas de este te las confirma el asesor.')]);
  if (p.badge === 'Base cama GRATIS' && si !== 2) out.push(['t', '🎁 Ojo: la base cama GRATIS aplica en la medida <b>doble 140 × 190</b>.']);
  return out;
}
function measures(p) {
  if (isBed(p)) {
    const list = p.sizes.map(s => '• ' + s.l + ': ' + H.money(s.p) + (s.ref ? '*' : '')).join('<br>');
    return [['t', '📏 Medidas del <b>' + H.esc(p.name) + '</b>:<br>' + list + (p.sizes.some(s => s.ref) ? '<br><span class="small muted">* valor de referencia: te lo confirma el asesor.</span>' : '')], ['t', ctx.dims ? scFit(p, sizeIdx(p, ctx.size), ctx.dims) : '¿Cuánto mide tu habitación (por ejemplo 3 × 3 m)? Te digo cómo te queda.']];
  }
  const comp = spec(p, /composicion|incluye|puestos/), dims = spec(p, /medidas|orientacion/);
  return [['t', '📏 <b>' + H.esc(p.name) + '</b>: ' + H.esc(comp || p.tagline) + '. ' + (dims && !/por confirmar/i.test(dims) ? H.esc(dims) + '.' : 'Las medidas exactas en centímetros te las confirma el asesor.') + ' Si me dices el largo de la pared donde la pondrías, te ayudo a imaginar cómo queda.']];
}
function colors(p) {
  if (!p.colors) return [['t', '<b>' + H.esc(p.name) + '</b> viene en su presentación original, sin opciones de color. Donde sí eliges color es en salas y comedores.']];
  return [['t', '🎨 <b>' + H.esc(p.name) + '</b> viene en: ' + p.colors.map(c => c.name).join(', ') + '. ' + (p.recolor ? 'En la ficha tocas cada color y ves la foto real con esa tela.' : 'Antes de despachar te mandamos por WhatsApp la foto real de la tela que elijas.') + ' ¿Qué colores tiene tu espacio? Te ayudo a combinar.']];
}
function warranty(p) {
  const w = p.warranty || spec(p, /garantia/);
  if (w && !/por confirmar/i.test(w)) return [['t', '🛡️ <b>' + H.esc(p.name) + '</b>: garantía de ' + H.esc(w) + '.' + (spec(p, /cuidado/) ? ' Para que te dure como nuevo: ' + H.esc(spec(p, /cuidado/)).toLowerCase() + '.' : '')]];
  return [['t', '🛡️ <b>' + H.esc(p.name) + '</b> tiene garantía de fábrica El Rey. Las condiciones exactas (tiempo y cobertura) te las confirma el asesor por escrito antes de despachar; prefiero no inventarte un dato.']];
}
function materials(p) { return [['t', '<b>' + H.esc(p.name) + '</b>, ficha técnica:<br>' + p.specs.map(([k, v]) => '• <b>' + H.esc(k) + ':</b> ' + H.esc(v)).join('<br>')]] }

/* ───── Recomendación según lo que pide ───── */
// Medida que se muestra: la pedida (si el producto la tiene); si no, la predeterminada o la más económica dentro del presupuesto.
function pickSize(p, B) {
  if (ctx.size) { const i = p.sizes.findIndex(s => s.l.startsWith(ctx.size)); if (i < 0) return -1; return !B || p.sizes[i].p <= B ? i : -1 }
  const d = p.defSize ?? 0; if (!B || p.sizes[d].p <= B) return d;
  let best = -1; p.sizes.forEach((s, i) => { if (s.p <= B && (best < 0 || s.p > p.sizes[best].p)) best = i }); return best;
}
function fitPool(pool, B, defIds) {
  let fit = pool.map(p => [p, pickSize(p, B)]).filter(([, i]) => i >= 0);
  if (B) fit.sort((a, b) => b[0].sizes[b[1]].p - a[0].sizes[a[1]].p);
  else if (defIds) fit.sort((a, b) => (defIds.indexOf(a[0].id) + 1 || 99) - (defIds.indexOf(b[0].id) + 1 || 99));
  return fit;
}
function recommend() {
  const need = ctx.need, B = ctx.budget;
  if (need === 'sleep') {
    const pool = P().filter(isBed);
    let fit = fitPool(pool, B, ctx.who === 'pareja' ? ['colchon-gran-duque', 'cama-gran-duque-lujo'] : ['colchon-gran-duque', 'colchon-pillow-confort']), note = '';
    if (!fit.length) {
      const cheap = pool.map(p => [p, ctx.size ? p.sizes.findIndex(s => s.l.startsWith(ctx.size)) : p.sizes.reduce((m, s, i, a) => s.p < a[m].p ? i : m, 0)]).filter(([, i]) => i >= 0).sort((a, b) => a[0].sizes[a[1]].p - b[0].sizes[b[1]].p);
      fit = cheap.length ? cheap : pool.map(p => [p, p.defSize ?? 0]);
      note = B ? 'Te soy sincera: dentro de ' + H.money(B) + (ctx.size ? ' en medida ' + ctx.size.toLowerCase() : '') + ' no tengo una opción, pero lo más cercano es esto y a cuotas se siente mucho menos:' : '';
    }
    const top = fit.slice(0, 2);
    const intro = note || (ctx.who === 'pareja' ? 'Para dormir en pareja y que nadie despierte al otro, mira estas:' : ctx.who === 'solo' ? 'Para ti, que quieres tu espacio, estas son buenas opciones:' : ctx.who === 'familia' ? 'Para las mañanas de domingo con todos en la cama:' : B ? 'Dentro de ' + H.money(B) + ' te recomiendo:' : 'El más pedido es el Gran Duque; te dejo también una opción que cuida el bolsillo:');
    const out = [['t', intro], ...top.map(([p, i]) => ['p', p, i])];
    if (ctx.size && ctx.size !== 'Doble' && top.length === 1 && top[0][0].id === 'colchon-gran-duque') out.push(['t', 'En medida ' + ctx.size.toLowerCase() + ' el que manejamos es el Gran Duque; los demás colchones vienen en 1,40 × 1,90. Ojo: esa medida tiene precio de referencia y te lo confirma el asesor.']);
    const si = p => (top.find(x => x[0] === p) || [0, p.defSize ?? 0])[1];
    const first = top[0][0];
    if (ctx.who === 'pareja' || ctx.who === 'familia') out.push(['t', scCouple()]);
    if (ctx.dims) out.push(['t', scFit(first, si(first), ctx.dims)]);
    if (ctx.city) out.push(['t', scShip(first.sizes[si(first)].p, ctx.city)]);
    if (note) out.push(['t', scPay(first.sizes[si(first)].p)]);
    return [out, ['¿Cuál me conviene?', 'Cuotas', 'Envío', 'Pagar ahora']];
  }
  if (need === 'sala') {
    const pool = P().filter(p => p.cat === 'salas');
    let fit = B ? pool.filter(p => p.price <= B).sort((a, b) => b.price - a.price) : (ctx.who === 'visitas' ? ['sala-boston', 'sala-nube'] : ['sala-venecia', 'sala-imperial']).map(byId), honest = false;
    if (!fit.length) { fit = pool.slice().sort((a, b) => a.price - b.price); honest = true }
    return [[['t', honest ? 'Te soy sincera: dentro de ' + H.money(B) + ' no tengo una sala, pero lo más cercano es esto y a cuotas se siente mucho menos:' : ctx.who === 'visitas' ? 'Si recibes visitas seguido, una esquinera o una sala amplia da puestos para todos:' : B ? 'Salas que entran en ' + H.money(B) + ':' : 'Estas son las salas que más se llevan:'], ...fit.slice(0, 2).map(p => ['p', p]), ['t', honest ? scPay(fit[0].price) : 'En Venecia, Boston y Roma tocas el color en la ficha y ves la foto real con esa tela 🎨']], ['Apartamento pequeño', 'Ver colores', 'Cuotas', 'Envío']];
  }
  if (need === 'comedor') return [[['t', '🍽️ Dos comedores que enamoran:'], ['p', byId('comedor-orion')], ['p', byId('comedor-nordico')], ['t', 'El Orión de la foto es de 4 puestos y en el Nórdico los puestos están por confirmar. Si necesitas 6 u 8 puestos, el asesor te dice si se puede; prefiero no prometértelo sin verificar.']], ['¿Cuál me conviene?', 'Colores', 'Envío', 'Cuotas']];
  return [[['t', 'Cuéntame qué quieres renovar y te guío: ¿descanso, sala o comedor?']], ['Quiero un colchón', 'Busco sala', 'Comedor', 'Proyecto para negocio']];
}

/* ───── Respuesta principal ───── */
function reply(raw) {
  const q = norm(raw);
  const found = { p: productOf(q) || ordinal(q), cat: catOf(q), size: sizeOf(q), who: whoOf(q), budget: budgetOf(q), dims: dimsOf(q), city: cityOf(q) };
  if (found.size) ctx.size = found.size; if (found.who) ctx.who = found.who; if (found.budget) ctx.budget = found.budget; if (found.dims) ctx.dims = found.dims; if (found.city) ctx.city = found.city;
  const nm = raw.match(/(?:me llamo|mi nombre es|soy)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)/); if (nm) ctx.name = nm[1];
  if (found.p) { ctx.last = found.p; ctx.need = group(found.p) }
  else if (found.cat) { if (ctx.last && group(ctx.last) !== found.cat) ctx.last = null; ctx.need = found.cat }
  const p = ctx.last, rc = recap(found), pre = rc ? [['t', rc]] : [];
  const say = (parts, ch) => bot(pre.concat(parts.filter(x => x[1] !== '')), ch);
  const askWhich = topic => say([['t', '¿De cuál producto te cuento ' + topic + '? Dime el nombre (por ejemplo Gran Duque, Venecia, Orión) o ábrelo en la tienda y te respondo con su ficha.']], ['Gran Duque', 'Sala Venecia', 'Comedor Orión']);

  // Botones de navegación (frases exactas de los chips): van antes que las reglas por palabra clave
  if (has(q, /ver todas las novedades/)) { H.go(H.url('novedades/')); return say([['t', 'Te llevé a Novedades ✨ Ahí está todo lo recién llegado al almacén.']], ['Cuotas', 'Envío']) }
  if (has(q, /ver productos para proyectos/)) { H.go(H.url('proyectos/')); return say([['t', 'Te llevé a Proyectos: ahí ves productos sugeridos y el formulario de cotización.']], ['Hablar con asesor']) }
  if (has(q, /ver colores en la foto/)) { const s = p && p.recolor ? p : byId('sala-venecia'); H.go(H.url('producto/' + s.id + '/')); return say([['t', 'Te abrí la ficha de <b>' + H.esc(s.name) + '</b>: toca los círculos de color y la foto cambia a esa tela 🎨']], ['¿Puedo ver la tela real?']) }
  if (has(q, /tela real|muestra fisica|muestra de tela|muestras de tela/)) return say([['t', 'Claro: antes de despachar te enviamos por WhatsApp foto o video de la tela real, o la ves en el almacén.']], ['Hablar con asesor', 'Pagar ahora']);
  if (has(q, /es para mi casa|hogar completo|amoblar (mi|la|toda)/)) return say([['t', '¡Qué emoción, casa nueva o renovada! 🏠 Podemos armarte un paquete completo: colchón y cama para las habitaciones, sala y comedor, con una sola entrega coordinada.'], ['t', 'Por ejemplo: Cama Gran Duque de Lujo + Sala Venecia + Comedor Orión. El valor final y los descuentos por volumen te los confirmamos en la cotización.'], ['h', '<a class="btn sm" href="' + H.url('proyectos/') + '#proj-form" data-bgo>Cotizar mi hogar →</a>']], ['Quiero un colchón', 'Busco sala', 'Hablar con asesor']);

  // Acciones directas
  if (has(q, /pagar ahora|finalizar compra|ir a pagar|quiero pagar|como compro|comprar ya|\blo quiero\b|\bla quiero\b|me lo llevo|me la llevo|listo compro/) && !has(q, /pensar|pienso/)) {
    if (!H.cart().length && p) H.addToCart(p.id, sizeIdx(p, ctx.size), null, 1, 0, true);
    if (!H.cart().length) return say([['t', '¡Qué emoción! Primero elijamos tu producto. ¿Buscas colchón, cama o sala?']], ['Quiero un colchón', 'Busco sala', 'Comedor']);
    H.go(H.url('checkout/'));
    return say([['t', '¡Así se habla! 👑 Te llevé al pago: son 3 pasos (tus datos, la entrega y el pago). Al elegir tu municipio te dice de una si el envío es gratis. Aquí sigo por si te surge una duda.']], ['¿Es seguro pagar aquí?', '¿Cuándo me llega?', 'Pagar a cuotas']);
  }
  if (has(q, /ver carrito|mi carrito/)) { H.openCart(); return say([['t', 'Ahí tienes tu carrito 🛒. Si llevas colchón y mueble, pagas una sola vez y cada marca recibe lo suyo con su factura.']], ['Pagar ahora', 'Armar combo']) }
  if (has(q, /armar combo|\bcombo\b/) && !(found.p && found.p.id === 'colchon-resortado-confort' && !has(q, /armar/))) {
    const base = p || byId('colchon-gran-duque'), c = (base.combo || []).map(byId).filter(Boolean).slice(0, 2);
    return say([['t', '¡Me encanta la idea! Con <b>' + H.esc(base.name) + '</b> combinan perfecto estos. En la ficha marcas los complementos y te descontamos 5% en ellos:'], ...c.map(x => ['p', x]), ['t', scCombo(base)]], ['Pagar ahora', 'Ver ficha de ' + base.name]);
  }
  if (has(q, /ver ficha de/)) { const t = productOf(q); if (t) { H.go(H.url('producto/' + t.id + '/')); return say([['t', 'Te abrí la ficha de <b>' + H.esc(t.name) + '</b> 👉 ahí eliges medida, color y cantidad.']], ['Envío', 'Cuotas', 'Garantía']) } }
  if (has(q, /ver todas las promos|ver promociones/)) { H.go(H.url('promos/')); return say([['t', 'Te llevé a las promociones de temporada 🔥']], ['Quiero un colchón', 'Busco sala']) }
  if (has(q, /ver novedades|novedad|que hay de nuevo|lo nuevo|recien llegad|que llego|lo ultimo/)) { const ns = P().filter(x => x.nuevo); return say([['t', '✨ ¡Y espera, que hay más! Esto es lo último que llegó al almacén:'], ...ns.slice(0, 3).map(x => ['p', x])], ['Ver todas las novedades', 'Cuotas', 'Envío']) }
  if (has(q, /proyecto|hotel|hostal|airbnb|finca|negocio|empresa|oficina|consultorio|por volumen|al por mayor|mayorista|muchos colchones|varias camas|varios colchones/)) {
    const hot = has(q, /hotel|hostal|airbnb|finca/), nh = (q.match(/(\d+) (habitaciones|cuartos|camas|alcobas)/) || [])[1];
    return say([['t', '¡Qué chévere! Eso lo atendemos con mucho gusto ' + (hot ? '🏨' : '🏢') + ' Para ' + (hot ? 'hoteles, hostales y fincas' : 'negocios, oficinas y hogares completos') + ' armamos una <b>propuesta a la medida</b>: productos, telas, cantidades y entrega coordinada, con cotización por escrito.'], ['t', hot ? 'Imagínate ' + (nh ? 'tus ' + nh + ' habitaciones' : 'un hostal de 8 habitaciones') + ': te cotizamos ' + (nh ? nh + ' colchones Gran Duque (o la referencia que prefieras)' : 'los colchones y camas') + ' en un solo paquete, y una sala para el lobby que haga que los huéspedes quieran quedarse. Los descuentos por volumen se confirman en la cotización.' : 'Por ejemplo, una sala de espera con una esquinera Imperial y un set de mesa auxiliar + puff, o el amoblado completo de un apartamento para arrendar. Los descuentos por volumen se confirman en la cotización.'], ['h', '<a class="btn sm" href="' + H.url('proyectos/') + '#proj-form" data-bgo>Cotizar mi proyecto →</a>']], ['Hablar con asesor', 'Ver productos para proyectos']);
  }
  if (has(q, /hablar con (un )?asesor|asesora|humano|persona real|llamar|vendedor|whatsapp/)) {
    return say([['t', '¡Con todo el gusto! Te paso con un asesor de la línea principal. Le dejo tu consulta escrita para que no tengas que repetir nada:'], ['h', '<a class="btn wa sm" target="_blank" rel="noopener" href="' + H.waLink('Hola El Rey, vengo de la página web.' + (p ? ' Me interesa ' + p.name + (ctx.size && isBed(p) ? ' en ' + ctx.size.toLowerCase() : '') + '.' : '') + (ctx.city ? ' Estoy en ' + ctx.city + '.' : '') + (ctx.budget ? ' Presupuesto: ' + H.money(ctx.budget) + '.' : '') + (H.cart().length ? '\n' + H.cartText() : '')) + '">💬 Abrir WhatsApp con mi consulta</a>']], ['Seguir aquí']);
  }
  if (has(q, /seguir aqui/)) return say([['t', '¡Perfecto! Sigo contigo. ¿Qué más te gustaría saber?']], ['Medidas', 'Envío', 'Cuotas', 'Garantía']);

  // Saludo, agradecimiento, despedida
  if (has(q, /^ (hola|buenas|buenos dias|buenas tardes|buenas noches|buen dia|hey|que mas|quiubo|ola|holi) /) && q.split(' ').length < 9 && !found.p && !found.cat) return say([['t', '¡Hola' + (ctx.name ? ', ' + ctx.name : '') + '! Bienvenido a El Rey 👑 Cuéntame, ¿qué quieres mejorar en tu casa? Te ayudo a elegir sin enredos.']], ['Quiero un colchón', 'Busco sala', 'Comedor', 'Ver promos']);
  if (has(q, / (gracias|muchas gracias|mil gracias|chevere|genial|super|perfecto|listo|vale|de una) /) && q.split(' ').length < 8 && !found.p) return say([['t', '¡Con todo el gusto' + (ctx.name ? ', ' + ctx.name : '') + '! Aquí estoy para lo que necesites. En El Rey dormimos como se debe 👑']], ['Ver promos', 'Pagar ahora']);
  if (has(q, / (chao|adios|hasta luego|nos vemos) /)) return say([['t', '¡Que estés muy bien! Cuando quieras seguimos; tu carrito queda guardado. ¡Ya sabes dónde encontrarnos! 👑']], []);

  // Salud y dolor (empatía sin promesas médicas)
  if (has(q, /dolor|espalda|columna|lumbar|hernia|cuello|me levanto cansad|duermo mal|insomnio|alergi|acaro|asma/)) {
    ctx.need = 'sleep'; const gd = byId('colchon-gran-duque');
    const allergy = has(q, /alergi|acaro|asma/);
    return say([['t', allergy ? 'Te entiendo, dormir con alergia es muy maluco. No tengo información verificada sobre tratamientos antialérgicos en nuestros colchones, así que prefiero no prometértelo: el asesor te confirma materiales exactos.' : 'Uy, levantarse con dolor es lo peor; te entiendo. No soy médico, así que si el dolor es fuerte o frecuente, vale la pena consultarlo con un profesional de salud.'],
      ['t', 'Lo que sí te puedo contar: quienes buscan buen soporte suelen elegir el <b>Gran Duque</b>: sensación de firmeza, doble pillow top y 40 cm, una firmeza que te sostiene toda la noche. ¡Imagínate levantarte descansado y con energía de rey!'], ['p', gd, sizeIdx(gd, ctx.size)],
      ['t', 'Y para el cuello, la <b>almohada cervical</b> tiene forma de contorno. Lo ideal es que vengas a probarlos acostado en Cerritos o Cartago. ¿Duermes solo o en pareja?']], ['Duermo solo', 'En pareja', '¿Lo puedo probar?']);
  }

  // Negociación
  if (has(q, /dejan (mas )?barat|rebaj|descuento adicional|negoci|me la dejan|me lo dejan|ultimo precio|precio especial para mi|regatear|lo dejan en/)) {
    const it = p || byId('colchon-gran-duque');
    return say([['t', 'Te entiendo, a todos nos gusta un mejor precio. <b>' + H.esc(it.name) + '</b> ' + (it.promo ? 'ya está en precio de promoción, así que no le podemos bajar más.' : 'ya tiene precio directo, sin intermediarios.')], ['t', 'Lo que sí te puedo dar: <b>5% en los complementos si armas combo</b>, envío gratis en 6 ciudades y pago a cuotas para que no se sienta en el bolsillo.'], ['t', scCombo(it)]], ['Armar combo', 'Pagar a cuotas', 'Hablar con asesor']);
  }
  // Competencia
  if (has(q, /otro lado|otra tienda|en otra parte|competencia|mas barato en|vi uno|me lo dan en|homecenter|falabella|alkosto|mercado libre/)) {
    return say([['t', 'Qué bien que estés comparando, así eliges tranquilo. Te cuento lo que nos diferencia:'], ['t', '👑 Somos El Rey, ¡añoooos vendiendo colchones!<br>🛡️ El Gran Duque tiene 5 años de garantía<br>🎁 Base cama GRATIS en el Gran Duque doble (hasta agotar)<br>🚚 Envío gratis en 6 ciudades<br>🏬 Almacén físico para probar antes de comprar'], ['t', 'La mejor comparación es acostarse: ven a Cerritos o Cartago y pruébalos.']], ['Cómo llegar', 'Ver promos', 'Pagar ahora']);
  }
  // Precio caro / presupuesto
  if (has(q, /caro|costoso|muy alto|mucha plata|no me alcanza|esta duro|esta pesado|presupuesto|economico|mas barato|algo mas economico|no tengo tanto|plata/) || (found.budget && !found.p)) {
    ctx.objections++;
    if (ctx.budget) {
      if (!ctx.need && p) ctx.need = group(p);
      const [parts, ch] = recommend(), first = parts.find(x => x[0] === 'p'), honest = parts.some(x => x[0] === 't' && /Te soy sincera/.test(x[1]));
      return say([['t', vary(['Perfecto, cuidemos ese presupuesto 💪', 'Listo, trabajemos con ese presupuesto', 'Claro que sí, ajustémonos a tu bolsillo'])], ...parts, ['t', first && !honest ? scPay(first[1].sizes[first[2] ?? first[1].defSize ?? 0].p) : '']], ch);
    }
    const it = p && p.price ? p : byId('colchon-gran-duque');
    return say([['t', 'Te entiendo, es una compra importante y está bien pensarla. Eso sí: es algo que vas a usar todos los días por años.'], ['t', scNight(it) || ('<b>' + H.esc(it.name) + '</b> está en ' + H.money(it.price) + '.')], ['t', scPay(it.price)], ['t', '¿Qué presupuesto te gustaría manejar? Te muestro lo mejor dentro de ese valor, sin presionarte.']], ['Hasta 700 mil', 'Hasta 1 millón', 'Hasta 2 millones', 'Pagar a cuotas']);
  }
  // Lo voy a pensar / consultar
  if (has(q, /lo pienso|lo voy a pensar|pensarlo|quiero pensar|pensar(lo)? bien|despues|luego miro|mas tarde|otro dia|consultarlo|hablarlo con|preguntarle a mi|mi pareja decide|no estoy segur|no se todavia|lo hablo/)) {
    ctx.objections++;
    return say([['t', '¡Claro que sí! Las decisiones del hogar se toman en familia y con calma.'], ['t', 'Te propongo algo: te mando el resumen por WhatsApp para que lo revisen juntos' + (p && p.promo ? '. Solo ten en cuenta que la promoción de ' + H.esc(p.name) + ' es hasta agotar unidades.' : '.')], ['h', '<a class="btn wa sm" target="_blank" rel="noopener" href="' + H.waLink(H.cart().length ? H.cartText() + '\n(Lo estoy pensando, ¿me guardan la promo?)' : 'Hola El Rey, me interesa ' + (p ? p.name : 'un producto') + ', lo estoy pensando con mi familia') + '">💬 Enviarme el resumen por WhatsApp</a>'], ['t', '¿Hay alguna duda que te frene? Muchas veces es la medida, la entrega o el pago, y eso lo resolvemos ya mismo.']], ['La medida', 'La entrega', 'El pago', 'Quiero verlo en persona']);
  }
  // Confianza / compra en línea
  if (has(q, /confia|confiable|estafa|es seguro|seguro pagar|fraude|es real|legal|no confio|miedo|por internet|en linea es seguro|me roban/)) {
    const r = H.R.reviews;
    return say([['t', 'Pregunta muy válida. Somos <b>El Rey</b>, con almacén físico en la <b>vía Cerritos–Pereira, antes del Hotel Sonesta</b>, y en <b>Cartago, carrera 6 con calle 11</b>. Puedes visitarnos cuando quieras.'], ['t', '🔒 El pago va por una pasarela certificada (no guardamos tu tarjeta), recibes factura electrónica y por ser compra en línea tienes <b>5 días hábiles de retracto</b> (Ley 1480).'], ['t', '⭐ En Google nos dicen: <i>"' + H.esc(r[4].t) + '"</i> y <i>"' + H.esc(r[1].t) + '"</i>.']], ['Pagar ahora', 'Hablar con asesor', 'Cómo llegar']);
  }
  // Calidad / durabilidad
  if (has(q, /se hunde|hundir|dura|cuanto dura|vida util|calidad|se dana|resiste|aguanta/)) {
    const it = p && isBed(p) ? p : byId('colchon-gran-duque');
    return say([['t', 'Te entiendo: nadie quiere un colchón que a los meses se hunda.'], ...warranty(it), ['t', spec(it, /peso/) ? 'Está recomendado para ' + H.esc(spec(it, /peso/)).toLowerCase() + '.' : ''], ['t', 'Lo mejor: ven a acostarte en él en el almacén antes de decidir. ¡Ya sabes dónde encontrarnos!']], ['¿Lo puedo probar?', 'Garantía', 'Pagar ahora']);
  }
  // Firmeza
  if (has(q, /muy duro|muy firme|muy blando|blandito|suave|firmeza|firme|\bduro\b/)) {
    const gd = byId('colchon-gran-duque'), pc = byId('colchon-pillow-confort');
    return say([['t', 'La firmeza es muy personal, y está bien que lo preguntes. El <b>Gran Duque</b> tiene <b>sensación de firmeza</b> con doble pillow top: te sostiene y a la vez se siente acolchado arriba.'], ['t', 'Si buscas una opción resortada que cuide más el bolsillo, el <b>Pillow Confort</b> es resortado con capa pillow. La diferencia real se siente acostándose: ven y pruébalos en el almacén.'], ['p', gd], ['p', pc]], ['¿Lo puedo probar?', 'Medidas', 'Cuotas']);
  }
  // Tiempo de entrega
  if (has(q, /cuando me llega|cuanto (se )?demora|cuanto tarda|en cuanto tiempo|tiempo de entrega|para cuando|que dia llega/)) {
    return say([['t', 'Te entiendo, uno quiere estrenar ya. Apenas confirmas la compra, un asesor te escribe por WhatsApp para <b>agendar el día y la franja</b> (mañana o tarde).'], ['t', 'El plazo exacto depende de tu municipio y del inventario; no te voy a prometer una fecha que no tengo verificada. ' + (ctx.city ? 'A ' + ctx.city + ' el envío ' + (free(ctx.city) ? 'es GRATIS.' : 'cuesta ' + H.money(H.R.ship.fee) + '.') : '¿En qué municipio estás?')]], ctx.city ? ['Pagar ahora', 'Hablar con asesor'] : ['Pereira', 'Dosquebradas', 'Cartago', 'Armenia']);
  }
  // Ver / probar / sedes
  if (has(q, /verlo en persona|probar|probarlo|ir al almacen|visitar|tienda fisica|donde quedan|direccion|ubicacion|como llegar|sede|punto de venta|almacen/)) {
    return say([['t', '¡Claro! En El Rey te dejamos ver y probar camas, colchones y muebles (así lo cuenta un cliente en Google).'], ...H.R.stores.map(s => ['h', '<div class="pcard"><div><b>📍 ' + H.esc(s.city) + '</b><span class="small">' + H.esc(s.addr) + '</span><div class="acts"><a href="' + s.map + '" target="_blank" rel="noopener">Cómo llegar</a><a href="https://wa.me/' + s.wa + '" target="_blank" rel="noopener">WhatsApp ' + s.waLabel + '</a></div></div></div>']), ['t', 'Los horarios te los confirma el asesor por WhatsApp. ¡Ya sabes dónde encontrarnos!']], ['Ver promos', 'Pagar ahora']);
  }
  // Retracto / devoluciones / cambios
  if (has(q, /retracto|devolu|devolver|cambio|cambiarlo|arrepient|no me gusta/)) {
    return say([['t', 'Tranqui: por ser compra en línea tienes <b>derecho de retracto de 5 días hábiles</b> desde la entrega para devolver el producto sin usar (Ley 1480 de 2011).'], ['t', 'Las condiciones de cambio por otros motivos te las da el asesor por escrito antes de despachar.']], ['Garantía', 'Pagar ahora', 'Hablar con asesor']);
  }
  // Instalación, armado, escaleras, colchón viejo
  if (has(q, /arman|armado|instala|subir|escalera|ascensor|piso alto|apartamento alto/)) return say([['t', 'Buena pregunta. En el checkout te pedimos <b>piso y si hay ascensor</b> para que el equipo de entrega vaya preparado. Si incluye armado o subida por escaleras te lo confirma el asesor; prefiero no prometerte algo que no tengo verificado.']], ['Pagar ahora', 'Hablar con asesor']);
  if (has(q, /colchon viejo|recogen|llevan el viejo|retiran/)) return say([['t', 'No tengo confirmado si recogemos el colchón viejo. Te lo resuelve el asesor por WhatsApp en un momento.']], ['Hablar con asesor', 'Seguir aquí']);
  // Disponibilidad / horarios
  if (has(q, /hay (en )?(stock|existencia)|disponib|tienen el|lo tienen|agotad/)) return say([['t', 'La disponibilidad exacta cambia día a día, así que te la confirma el asesor antes de despachar.' + (p && p.promo ? ' La promo de ' + H.esc(p.name) + ' es hasta agotar unidades: si te gusta, ¡corre por el tuyo!' : '')]], ['Hablar con asesor', 'Pagar ahora']);
  if (has(q, /horario|abren|cierran|a que hora|domingo|festivo/)) return say([['t', 'Los horarios de cada sede te los confirma el asesor por WhatsApp para darte el dato exacto del día.']], ['Hablar con asesor', 'Cómo llegar']);

  // Envío
  if (has(q, /envio|domicilio|entrega|llega a|despacho|transporte|flete|mandan|envian/) || (found.city && !found.p && !found.cat)) {
    if (ctx.city) { return say([['t', free(ctx.city) ? '¡Buenas noticias! El envío a <b>' + ctx.city + '</b> es <b>GRATIS</b> 🎉' : 'A <b>' + ctx.city + '</b> llegamos con envío de <b>' + H.money(H.R.ship.fee) + '</b> (zona urbana; si es rural, entregamos en el casco urbano).'], ['t', p ? scShip(p.sizes[sizeIdx(p, ctx.size)].p, ctx.city) : ''], ['t', 'Después de la compra un asesor te escribe para agendar el día y la franja.']], ['Pagar ahora', 'Quiero un colchón', 'Busco sala']) }
    return say([['t', '🚚 ' + H.R.kb.delivery], ['t', '¿En qué municipio estás? Te digo exacto cuánto te sale.']], ['Pereira', 'Dosquebradas', 'Cartago', 'Armenia', 'Chinchiná']);
  }
  // Pagos
  if (has(q, /cuota|credito|addi|sistecredito|financ|pse|nequi|tarjeta|\bpagos?\b|como pago|contraentrega|efectivo|no tengo tarjeta/)) {
    const pp = p || (ctx.options[0] && byId(ctx.options[0])), v = pp ? pp.sizes[sizeIdx(pp, ctx.size)].p : null;
    return say([['t', '💳 Puedes pagar con <b>' + H.R.kb.pay + '</b>.'], ['t', has(q, /no tengo tarjeta|sin tarjeta/) ? 'Sin tarjeta no hay problema: con <b>Addi o Sistecrédito</b> te aprueban en minutos, o pagas por PSE o Nequi.' : ''], ['t', v ? scPay(v, has(q, /no tengo tarjeta|sin tarjeta/)) : 'Si me dices qué producto te gusta, te hago la cuenta de cuánto te queda la cuota.'], ['t', 'Si llevas productos de las dos marcas, pagas una sola vez y cada una recibe lo suyo con su factura.']], ['Pagar ahora', 'Quiero un colchón', 'Busco sala']);
  }
  // Garantía
  if (has(q, /garantia/)) return p ? say(warranty(p), ['Pagar ahora', 'Cuidados', 'Hablar con asesor']) : say([['t', '🛡️ El <b>Gran Duque</b> tiene 5 años de garantía (no cubre el forro por humedad). En los demás productos la garantía es de fábrica y sus condiciones exactas te las confirma el asesor. ¿Cuál te interesa?']], ['Gran Duque', 'Sala Venecia', 'Comedor Orión']);
  if (has(q, /cuidados|como lo cuido|mantenimiento|limpiar|lavar/)) return p ? say([['t', spec(p, /cuidado/) ? 'Para el <b>' + H.esc(p.name) + '</b>: ' + H.esc(spec(p, /cuidado/)).toLowerCase() + '.' : 'Los cuidados específicos del <b>' + H.esc(p.name) + '</b> te los confirma el asesor según su tela o material.']], ['Garantía', 'Pagar ahora']) : askWhich('los cuidados');

  // Atributos del producto en conversación
  if (has(q, /color|tela|tono|que colores/)) return p ? say(colors(p), p.recolor ? ['Ver colores en la foto', 'Envío', 'Cuotas'] : ['Envío', 'Cuotas', 'Pagar ahora']) : (ctx.need === 'sala' || ctx.need === 'comedor' ? say([['t', '🎨 En Venecia, Boston, Roma y el comedor Orión tocas el color en la ficha y ves la foto real con esa tela. ¿Cuál te gusta?'], ['p', byId('sala-venecia')], ['p', byId('sala-boston')]], ['Ver colores en la foto']) : askWhich('los colores'));
  if (has(q, /que incluye|incluye|trae|viene con|material|de que es|ficha|especificacion|caracteristica|altura|peso/)) return p ? say(materials(p), ['Medidas', 'Garantía', 'Pagar ahora']) : askWhich('la ficha');
  if (has(q, /medida|tamano|\bcabe\b|espacio|habitacion|cuarto|mide|dimension|largo|ancho|cual me conviene/) || found.dims) {
    if (!p && ctx.need === 'sleep' && ctx.size && !has(q, /guia|que medida|cual medida/)) { const [parts, ch] = recommend(); return say(parts, ch) }
    if (p) return say(measures(p).concat(isBed(p) && (ctx.who === 'pareja') ? [['t', scCouple()]] : []), ['Pagar ahora', 'Cuotas', 'Envío']);
    if (ctx.need === 'sala' || ctx.need === 'comedor') return say([['t', 'Las medidas exactas en centímetros de salas y comedores te las confirma el asesor. Si me dices el largo de la pared, te ayudo a elegir entre una sala de 2 o 3 puestos o una esquinera.']], ['Apartamento pequeño', 'Para recibir visitas', 'Hablar con asesor']);
    const gd = byId('colchon-gran-duque');
    return say([['t', '📏 Guía rápida de colchones:<br>• <b>Sencillo 100 × 190</b>: una persona o cuarto juvenil<br>• <b>Semidoble 120 × 190</b>: una persona con espacio de sobra<br>• <b>Doble 140 × 190</b>: pareja, la más vendida<br>• <b>Queen 160 × 190</b>: pareja que quiere más espacio<br>• <b>King 200 × 200</b>: pareja con niños o mascotas'], ['t', ctx.dims ? scFit(gd, sizeIdx(gd, ctx.size || 'Doble'), ctx.dims) : 'Un truco: deja al menos 60 cm libres a los lados para caminar. ¿Cuánto mide tu habitación?']], ['Duermo solo', 'En pareja', 'Familia con niños']);
  }
  if (has(q, /apartamento pequeno|pequeno|poco espacio|apartaestudio|aparta estudio/)) { ctx.need = 'sala'; return say([['t', 'Para espacios compactos estas funcionan de maravilla:'], ['p', byId('sala-roma')], ['p', byId('sofa-cama')], ['t', 'El sofá cama es un 2 × 1: sala de día y cama para la visita de noche.']], ['Ver colores', 'Cuotas', 'Pagar ahora']) }
  if (has(q, /recibir visitas|familia grande|muchas personas/)) { ctx.need = 'sala'; ctx.who = 'visitas'; const [parts, ch] = recommend(); return say(parts, ch) }

  // Producto mencionado sin pregunta concreta
  if (found.p) return say(about(found.p, isBed(found.p) ? sizeIdx(found.p, ctx.size) : undefined).concat([['t', scNight(found.p)], ['t', isBed(found.p) ? (ctx.size || ctx.who ? '¿Te cuento la garantía, el envío o las cuotas?' : '¿Para quién es: solo, en pareja o con niños? Así te digo la medida ideal.') : found.p.colors ? '¿Te cuento colores, qué incluye, envío o cuotas?' : '¿Te cuento qué incluye, el envío o las cuotas?']]), isBed(found.p) ? (ctx.size || ctx.who ? ['Garantía', 'Envío', 'Cuotas', 'Pagar ahora'] : ['Duermo solo', 'En pareja', 'Garantía', 'Pagar ahora']) : (found.p.colors ? ['Colores', '¿Qué incluye?', 'Envío', 'Cuotas'] : ['¿Qué incluye?', 'Envío', 'Cuotas', 'Pagar ahora']));
  // Necesidad (categoría, medida, para quién, presupuesto)
  if (found.cat || found.size || found.who) {
    if (!ctx.need) ctx.need = found.size || found.who === 'solo' || found.who === 'pareja' ? 'sleep' : found.who === 'visitas' ? 'sala' : null;
    if (ctx.need === 'sleep' && !ctx.who && !ctx.size && !ctx.budget) {
      const gd = byId('colchon-gran-duque');
      return say([['t', '¡Buenísimo! El más pedido es el <b>Gran Duque</b>: doble pillow top, 40 cm, sensación de firmeza y en medida doble <b>la base cama te sale GRATIS</b>. ¡Así como lo lees! 👑'], ['p', gd, sizeIdx(gd, 'Doble')], ['t', 'Para recomendarte bien: ¿duermes solo, en pareja o con niños o mascotas?']], ['Duermo solo', 'En pareja', 'Familia con niños', 'Algo más económico']);
    }
    const [parts, ch] = recommend(); return say(parts, ch);
  }
  if (has(q, /ver promos|promo|oferta|black|friday|gratis|descuento/)) { const ps = P().filter(x => x.promo).slice(0, 3); return say([['t', '🔥 ¡Temporada Black Friday en El Rey! Estas son las que más se están llevando:'], ...ps.map(x => ['p', x]), ['t', 'La base cama gratis del Gran Duque es hasta agotar unidades: ¡corre por la tuya!']], ['Ver todas las promos', 'Cuotas', 'Envío']) }

  // No sé: honestidad + guía
  return say([['t', 'Mmm, esa no me la sé con certeza y no quiero inventarte nada.'], ['t', 'Te puedo ayudar con productos, medidas, colores, envíos, cuotas, garantía y proyectos para negocios u hoteles. O si prefieres, te paso con un asesor con tu pregunta ya escrita.']], ['Quiero un colchón', 'Busco sala', 'Envío', 'Hablar con asesor']);
}

function greet() {
  const path = location.pathname, p = H.R.products.find(x => path.includes('/producto/' + x.id + '/'));
  if (p) { ctx.last = p; ctx.need = group(p); return bot([['t', '¡Hola! 👑 Veo que te gusta <b>' + H.esc(p.name) + '</b>, ¡buen ojo!'], ['t', isBed(p) ? '¿Te ayudo con la medida, la garantía, el envío o las cuotas?' : '¿Te ayudo con los colores, qué incluye, el envío o las cuotas?']], isBed(p) ? ['¿Qué medida me sirve?', 'Garantía', 'Envío', 'Cuotas'] : ['Colores', '¿Qué incluye?', 'Envío', 'Cuotas']) }
  if (path.includes('/proyectos/')) return bot([['t', '¡Hola! 👑 ¿Tienes un proyecto para tu negocio, hotel o casa? Cuéntame qué espacio quieres amoblar y te oriento antes de cotizar.']], ['Es para un hotel', 'Es para un negocio', 'Es para mi casa']);
  if (H.cart().length) return bot([['t', '¡Hola de nuevo! Tienes ' + H.cart().length + ' producto(s) esperándote en el carrito 🛒 ¿Te ayudo a terminar la compra o tienes alguna duda?']], ['Pagar ahora', '¿Es seguro pagar aquí?', 'Envío', 'Cuotas']);
  return bot([['t', '¡Hola! Soy Reina, la guía de El Rey. ¡Añoooos vendiendo colchones! 👑'], ['t', '¿Qué quieres renovar hoy? Te ayudo a elegir lo mejor para tu casa y tu bolsillo.']], ['Quiero un colchón', 'Busco sala', 'Comedor', 'Ver promos']);
}
function openChat(q, helpers) {
  H = helpers || H; mount();
  document.getElementById('nudge')?.classList.remove('on');
  el.classList.add('on'); open = true; document.getElementById('chatBtn').style.display = 'none';
  if (!el.querySelector('.msg')) { H.track('ChatOpen', {}); greet().then(() => { if (q) user(q) }) } else if (q) user(q);
  setTimeout(() => innerWidth > 600 && el.querySelector('#chatIn').focus(), 350);
}
function close() { if (!el) return; el.classList.remove('on'); open = false; document.getElementById('chatBtn').style.display = '' }
window.ReyBot = { open: openChat, close, isOpen: () => open, _reply: q => reply(q), _ctx: () => ctx };
})();
