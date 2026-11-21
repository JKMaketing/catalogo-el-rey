/* Asistente de ventas El Rey · motor de intenciones con base de conocimiento (sin API externa).
   En producción puede conectarse a un LLM con esta misma base como contexto (ver propuesta). */
(() => {
'use strict';
let H, el, open = false, ctx = { need: null, size: null, budget: null, city: null, last: null, objections: 0, name: null };
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[¿?¡!.,;:]/g, ' ');
const has = (q, re) => re.test(q);
const sleep = ms => new Promise(r => setTimeout(r, ms));

function mount() {
  if (el) return;
  el = document.createElement('div'); el.className = 'chat'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Asistente El Rey');
  el.innerHTML = '<div class="chat-top"><span class="av">👑</span><div><b>Reina · Guía El Rey</b><small>Asistente automático · responde al instante</small></div><button class="x" aria-label="Cerrar asistente">×</button></div><div class="msgs" id="msgs" aria-live="polite"></div><div class="chips" id="chips"></div><form id="chatF"><label class="sr" for="chatIn">Escribe tu pregunta</label><input id="chatIn" autocomplete="off" maxlength="300" placeholder="Escribe tu duda…"><button aria-label="Enviar">➤</button></form>';
  document.body.append(el);
  el.querySelector('.x').onclick = close;
  el.querySelector('#chatF').onsubmit = e => { e.preventDefault(); const i = el.querySelector('#chatIn'), v = i.value.trim(); if (!v) return; i.value = ''; user(v); };
  el.addEventListener('click', e => {
    const c = e.target.closest('[data-c]'); if (c) return user(c.dataset.c);
    const a = e.target.closest('[data-badd]'); if (a) { const [id, s] = a.dataset.badd.split('|'); H.addToCart(id, s === '' ? null : +s); bot([['t', '¡Listo! Ya está en tu carrito 🛒 ¿Lo pagas de una vez o quieres agregarle algo para armar combo?']], ['Pagar ahora', 'Armar combo', 'Ver carrito']); }
    const g = e.target.closest('[data-bgo]'); if (g) { e.preventDefault(); H.go(g.getAttribute('href')); if (innerWidth < 600) close(); }
  });
}
function add(html, me) { const m = document.createElement('div'); m.className = 'msg' + (me ? ' me' : ''); m.innerHTML = html; el.querySelector('#msgs').append(m); scroll(); return m }
function scroll() { const b = el.querySelector('#msgs'); b.scrollTop = b.scrollHeight }
function chips(list) { el.querySelector('#chips').innerHTML = (list || []).map(c => '<button data-c="' + H.esc(c) + '">' + H.esc(c) + '</button>').join('') }
function pcard(p, si) {
  const s = si ?? p.defSize ?? 0;
  return '<div class="pcard"><img src="' + H.img(p.imgs[0], 400) + '" alt=""><div><b>' + H.esc(p.name) + '</b><span class="small muted">' + H.esc(p.sizes[s].l) + '</span><div class="price">' + H.money(p.sizes[s].p) + '</div><div class="acts"><button data-badd="' + p.id + '|' + s + '">Agregar</button><a href="' + H.url('producto/' + p.id + '/') + '" data-bgo>Ver</a></div></div></div>';
}
async function bot(parts, ch) {
  const typing = add('<span class="typing"><i></i><i></i><i></i></span>');
  await sleep(Math.min(1400, 450 + (parts[0]?.[1]?.length || 40) * 9));
  typing.remove();
  let shown = false;
  for (const [k, v, s] of parts) {
    if (k === 'p' && !shown) { ctx.last = v; shown = true; }
    if (k === 't') add(v);
    else if (k === 'p') { const w = document.createElement('div'); w.innerHTML = pcard(v, s); el.querySelector('#msgs').append(w.firstChild); }
    else if (k === 'h') { const w = document.createElement('div'); w.innerHTML = v; el.querySelector('#msgs').append(w.firstChild); }
    scroll(); await sleep(260);
  }
  chips(ch);
}
function user(t) { add(H.esc(t), true); chips([]); H.track('ChatMessage', { name: t.slice(0, 40) }); reply(t); }

/* Entidades */
function sizeOf(q) {
  if (has(q, /\bking|200 ?x ?200|2 ?x ?2\b/)) return 'King';
  if (has(q, /\bqueen|160/)) return 'Queen';
  if (has(q, /semi ?doble|120/)) return 'Semidoble';
  if (has(q, /\bdoble|140|matrimonial|pareja|esposa|esposo|novi[oa]|dos personas/)) return 'Doble';
  if (has(q, /sencill|individual|\b100\b|una persona|nino|nina|hij[oa]|juvenil|solo yo|duermo solo/)) return 'Sencillo';
  return null;
}
function budgetOf(q) {
  let m = q.match(/(\d+(?:[.,]\d+)?)\s*(millon|millones|palo|palos|m\b)/); if (m) return parseFloat(m[1].replace(',', '.')) * 1e6;
  m = q.match(/(\d{2,4})\s*(mil|k\b|lucas)/); if (m) return +m[1] * 1000;
  m = q.match(/\$?\s?(\d{1,3}(?:[.\s]\d{3}){1,2})/); if (m) return +m[1].replace(/[.\s]/g, '');
  return null;
}
function cityOf(q) { for (const cs of Object.values(H.R.ship.depts)) for (const c of cs) if (q.includes(norm(c).trim())) return c; return null }
function productOf(q) {
  const map = [['colchon-gran-duque', /gran duque|duque|pillow top|40 ?cm|super pillow/], ['cama-gran-duque-lujo', /cama.*lujo|espaldar|cabecero|cama completa|cama gran/], ['colchon-pillow-confort', /pillow confort|confort resort/], ['colchon-semiortopedico-base', /semi ?ortoped/], ['colchon-resortado-confort', /resortado confort/], ['almohada-viscoelastica', /almohad/], ['sala-venecia', /venecia/], ['sala-boston', /boston/], ['sala-roma', /\broma\b/], ['sala-capriani', /caprian/], ['sala-vancouver', /vancouver/], ['sala-imperial', /imperial/], ['sala-nube', /\bnube|cloud|boucle/], ['sofa-cama', /sofa ?cama/], ['comedor-orion', /orion/], ['comedor-nordico', /nordico/], ['set-puff-mesa', /\bpuff|mesa auxiliar|mesa de centro/]];
  for (const [id, re] of map) if (re.test(q)) return H.byId(id);
  return null;
}
const sizeIdx = (p, sz) => { if (!sz) return p.defSize ?? 0; const i = p.sizes.findIndex(s => s.l.startsWith(sz)); return i < 0 ? (p.defSize ?? 0) : i };
const P = () => H.R.products;
const mattresses = () => P().filter(p => p.cat === 'colchones' || p.cat === 'camas');

/* Respuestas */
function reply(raw) {
  const q = ' ' + norm(raw) + ' ';
  const sz = sizeOf(q), bud = budgetOf(q), city = cityOf(q), prod = productOf(q);
  if (sz) ctx.size = sz; if (bud) ctx.budget = bud; if (city) ctx.city = city; if (prod) ctx.last = prod;
  const nm = raw.match(/(?:me llamo|soy)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)/); if (nm) ctx.name = nm[1];
  const p = ctx.last;
  if (has(q, /sala|sofa|esquinera|poltrona|mueble/)) ctx.need = 'sala'; else if (has(q, /comedor|sillas|puestos/)) ctx.need = 'comedor'; else if (has(q, /colchon|cama|dormir|descanso/)) ctx.need = 'sleep';
  // Negociación de precio
  if (has(q, /dejan (mas )?barat|mas barat|rebaj|descuento adicional|negoci|me la dejan|me lo dejan|ultimo precio|precio especial para mi/)) {
    const it = p || H.byId('colchon-gran-duque');
    return bot([['t', 'Te entiendo, a todos nos gusta un mejor precio 😊 ' + 'El precio de <b>' + H.esc(it.name) + '</b> ' + (it.promo ? 'ya es de promoción, así que no le podemos bajar más.' : 'ya es directo de fábrica, sin intermediarios.')], ['t', 'Lo que sí te puedo dar: <b>5% en los complementos si armas combo</b>, <b>envío gratis</b> en 6 ciudades y la opción de pagarlo <b>a cuotas</b> con Addi o Sistecrédito para que no se sienta en el bolsillo.']], ['Armar combo', 'Pagar a cuotas', 'Hablar con asesor']);
  }

  // Atajos de chips
  if (has(q, /pagar ahora|finalizar|checkout|quiero pagar|como compro|comprar ya|lo quiero|me lo llevo|listo compro/)) {
    if (!H.cart().length && p) H.addToCart(p.id, sizeIdx(p, ctx.size), null, 1, 0, true);
    if (!H.cart().length) return bot([['t', '¡Qué emoción! 🙌 Primero elijamos tu producto. ¿Buscas colchón, cama o sala?']], ['Colchón', 'Cama completa', 'Sala', 'Comedor']);
    H.go(H.url('checkout/'));
    return bot([['t', '¡Así se habla! 👑 Te llevé al pago: son 3 pasos (datos, entrega y pago). Si eliges tu municipio te digo de una vez si el envío es gratis. Aquí sigo si te surge una duda.']], ['¿Es seguro pagar aquí?', '¿Cuándo me llega?', 'Pagar a cuotas']);
  }
  if (has(q, /ver carrito|mi carrito/)) { H.openCart(); return bot([['t', 'Ahí tienes tu carrito 🛒. Si compras colchón + mueble verás dos cobros en un solo pago: uno por cada marca.']], ['Pagar ahora', 'Armar combo']) }
  if (has(q, /armar combo|combo/)) {
    const base = p || H.byId('colchon-gran-duque'), c = (base.combo || []).map(H.byId).filter(Boolean).slice(0, 2);
    return bot([['t', 'Me encanta la idea 😍 Con <b>' + H.esc(base.name) + '</b> combinan perfecto estos, y en el combo te descontamos 5% en los complementos (lo aplicas desde la ficha del producto):'], ...c.map(x => ['p', x])], ['Pagar ahora', 'Ver ' + base.name]);
  }

  // Respuestas a botones rápidos (antes que reglas generales)
  if (has(q, /algo mas economico|mas economico|mas barato/)) { ctx.budget = 800000; const a = H.byId('colchon-pillow-confort'), b = H.byId('colchon-semiortopedico-base'); return bot([['t', '¡Claro! Opciones buenas que cuidan el bolsillo:'], ['p', a, sizeIdx(a, ctx.size)], ['p', b], ['t', 'El Semiortopédico ya trae la base: estrenas cama completa por ' + H.money(620000) + '.']], ['Pagar ahora', 'Ver Gran Duque', 'Cuotas']) }
  if (has(q, /ver todas las promos/)) { H.go(H.url('promos/')); return bot([['t', 'Te llevé a la sección de promos 👉']], ['Quiero un colchón']) }
  if (has(q, /seguir aqui/)) return bot([['t', '¡Perfecto! Sigo contigo 😊 ¿Qué más te gustaría saber?']], ['Medidas', 'Envío', 'Cuotas']);
  if (has(q, /ver colores/)) { const s = p && p.colors ? p : H.byId('sala-venecia'); H.go(H.url('producto/' + s.id + '/')); return bot([['t', 'Te abrí la ficha de ' + H.esc(s.name) + ': toca los círculos de color y la foto cambia 🎨']], ['¿Puedo ver la tela real?']) }
  if (has(q, /tela real|muestra/)) return bot([['t', '¡Claro! La vista de color en la foto es una referencia. Antes de despachar te enviamos por WhatsApp foto o video de la tela real, o la ves en el almacén.']], ['Pagar ahora', 'Hablar con asesor']);
  if (has(q, /recibir visitas|familia grande/)) return bot([['t', 'Para recibir, lo ideal es una esquinera o una sala con poltronas:'], ['p', H.byId('sala-boston')], ['p', H.byId('sala-nube')]], ['Cuotas', 'Envío', 'Pagar ahora']);
  if (has(q, /apartamento pequeno|pequeno|poco espacio|apartaestudio/)) { ctx.need = 'sala'; } if (has(q, /apartamento pequeno|pequeno|poco espacio|apartaestudio/)) return bot([['t', 'Para espacios compactos estas funcionan de maravilla:'], ['p', H.byId('sala-roma')], ['p', H.byId('sofa-cama')], ['t', 'El sofá cama es un 2×1: sala de día, cama para la visita de noche 😉']], ['Pagar ahora', 'Ver colores']);
  if (has(q, /ver todas las salas/)) { H.go(H.url('muebles/salas/')); return bot([['t', 'Aquí están todas las salas 👉 Puedes filtrar por color y precio.']], []) }
  if (has(q, /6 puestos|seis|para (6|8)\b|(6|8) personas|familia grande de/)) { const o = H.byId('comedor-orion'); return bot([['p', o, 1], ['t', 'El Orión de 6 puestos es ideal para familias grandes y almuerzos de domingo 🙌']], ['Pagar ahora', 'Armar combo']) }
  if (has(q, /4 puestos|cuatro/)) return bot([['p', H.byId('comedor-orion'), 0], ['p', H.byId('comedor-nordico')]], ['Pagar ahora', 'Armar combo']);

  // Saludo
  if (has(q, /^\s*(hola|buenas|buenos|buen dia|hey|que mas|quiubo|ola)\b/) && q.trim().split(' ').length < 6) return bot([['t', '¡Hola' + (ctx.name ? ' ' + ctx.name : '') + '! 😊 Cuéntame, ¿qué quieres mejorar en tu casa? Te ayudo a elegir sin enredos.']], ['Quiero un colchón', 'Busco sala', 'Comedor', 'Ver promos']);

  // Salud / dolor (empatía sin promesas médicas)
  if (has(q, /dolor|espalda|columna|lumbar|hernia|cervical|me levanto cansad|duermo mal|insomnio|ortoped/)) {
    ctx.need = 'sleep';
    return bot([['t', 'Uy, levantarse con dolor es lo peor 😔 Te entiendo. No soy médico, así que si el dolor es fuerte vale la pena consultarlo con un profesional.'], ['t', 'Lo que sí te puedo decir: muchos clientes que se despertaban adoloridos con un colchón hundido eligen el <b>Gran Duque</b>: sensación de firmeza, doble pillow top y 40 cm, para que la columna quede bien apoyada sin sentirte en una tabla. Y si buscas algo más económico, el <b>Semiortopédico</b> viene con base.'], ['p', H.byId('colchon-gran-duque'), sizeIdx(H.byId('colchon-gran-duque'), ctx.size)], ['p', H.byId('colchon-semiortopedico-base')], ['t', 'Para la nuca, la <b>almohada cervical</b> ayuda bastante. ¿Duermes solo o en pareja?']], ['Duermo solo', 'En pareja', '¿Lo puedo probar?']);
  }

  // Objeciones
  if (has(q, /caro|costoso|muy alto|mucha plata|no me alcanza|esta duro|presupuesto|economico|barato|mas bajo|descuento|rebaja|menos plata/)) {
    ctx.objections++;
    if (ctx.budget || bud) {
      const B = ctx.budget, fit = (ctx.need === 'sala' ? P().filter(x => x.cat === 'salas') : ctx.need === 'comedor' ? P().filter(x => x.cat === 'comedores') : mattresses()).filter(x => Math.min(...x.sizes.map(s => s.p)) <= B).sort((a, b) => b.price - a.price).slice(0, 2);
      if (fit.length) return bot([['t', 'Perfecto, cuidemos ese presupuesto de ' + H.money(B) + ' 💪 Estas opciones entran sin problema:'], ...fit.map(x => ['p', x, sizeIdx(x, ctx.size)]), ['t', 'Y si prefieres no sacar todo de una, con <b>Addi o Sistecrédito</b> lo pagas a cuotas.']], ['Pagar a cuotas', 'Pagar ahora', 'Hablar con asesor']);
    }
    const gd = H.byId('colchon-gran-duque');
    return bot([['t', 'Te entiendo, es una compra importante y está bien pensarla 🙏'], ['t', 'Míralo así: el Gran Duque doble cuesta ' + H.money(1100000) + ' <b>con la base cama GRATIS</b>, y con 5 años de garantía te sale en menos de <b>' + H.money(1100000 / (5 * 365)) + ' por noche</b>. Menos que un tinto, para dormir como un rey 😉'], ['t', 'Además lo puedes pagar a cuotas con <b>Addi o Sistecrédito</b>, o con tu tarjeta. ¿Qué presupuesto te gustaría manejar? Te muestro lo mejor dentro de ese valor.']], ['Hasta 700 mil', 'Hasta 1 millón', 'Hasta 2 millones', 'Pagar a cuotas']);
  }
  if (has(q, /lo pienso|lo voy a pensar|despues|luego|mas tarde|otro dia|consultar|mi esposa|mi esposo|mi pareja decide|no estoy segur/)) {
    ctx.objections++;
    return bot([['t', '¡Claro que sí! Decisiones de hogar se toman en familia 🏡'], ['t', 'Te propongo algo: te guardo el carrito y te mando el resumen por WhatsApp para que lo revisen juntos con calma. Solo ten en cuenta que la base cama gratis del Gran Duque es <b>hasta agotar unidades</b>.'], ['h', '<a class="btn wa sm" target="_blank" rel="noopener" href="' + H.waLink(H.cart().length ? H.cartText() + '\n(Lo estoy pensando, ¿me guardan la promo?)' : 'Hola El Rey 👑 me interesa ' + (p ? p.name : 'un producto') + ', lo estoy pensando con mi familia') + '">Enviarme el resumen por WhatsApp</a>'], ['t', '¿Hay alguna duda puntual que te frene? Muchas veces es la medida, la entrega o el pago, y eso lo resolvemos ya 😉']], ['La medida', 'La entrega', 'El pago', 'Quiero verlo en persona']);
  }
  if (has(q, /confia|confiable|estafa|seguro pagar|es seguro|fraude|real|legal|no confio|miedo|por internet/)) {
    return bot([['t', 'Pregunta muy válida 👌 Somos <b>Colchones El Rey</b>, fábrica y almacén físico en la <b>vía Cerritos–Pereira, antes del Hotel Sonesta</b>, y en <b>Cartago, carrera 6 con calle 11</b>. Puedes visitarnos cuando quieras.'], ['t', 'El pago se procesa en una pasarela certificada (no guardamos tu tarjeta) y te llega factura electrónica. Y nuestros clientes en Google lo dicen mejor que yo: <i>"Cumplimiento y calidad"</i>, <i>"Excelente empresa… súper recomendado"</i> ⭐⭐⭐⭐⭐'], ['t', 'Si prefieres, también puedes pagar contra confirmación de un asesor por WhatsApp.']], ['Pagar ahora', 'Hablar con asesor', 'Cómo llegar']);
  }
  if (has(q, /ver(lo)? en persona|probar|probarlo|ir al almacen|visitar|tienda fisica|donde quedan|direccion|ubicacion|como llegar|sede|punto de venta/)) {
    return bot([['t', '¡Claro! En El Rey te dejamos ver y probar las camas, colchones y muebles (así lo dice un cliente en Google 😄).'], ...H.R.stores.map(s => ['h', '<div class="pcard"><div><b>📍 ' + H.esc(s.city) + '</b><span class="small">' + H.esc(s.addr) + '</span><div class="acts"><a href="' + s.map + '" target="_blank" rel="noopener">Cómo llegar</a><a href="https://wa.me/' + s.wa + '" target="_blank" rel="noopener">WhatsApp ' + s.waLabel + '</a></div></div></div>']), ['t', 'Los horarios te los confirma el asesor por WhatsApp. Y si quieres asegurar tu precio antes de ir, puedes agregarlo al carrito.']], ['Ver promos', 'Pagar ahora']);
  }

  // Envío / entrega
  if (has(q, /envio|domicilio|entrega|llega|despacho|cuanto tarda|cuando me llega|transporte|flete/) || (city && !prod)) {
    const c = ctx.city;
    if (c) { const free = H.R.ship.free.includes(c); return bot([['t', free ? '¡Buenas noticias! 🎉 El envío a <b>' + c + '</b> es <b>GRATIS</b>.' : 'A <b>' + c + '</b> llegamos con envío de <b>' + H.money(H.R.ship.fee) + '</b> (zona urbana; si es rural, entregamos en el casco urbano).'], ['t', 'Después de tu compra un asesor te escribe por WhatsApp para agendar el día y la franja (mañana o tarde). El plazo exacto te lo confirma según tu municipio y el inventario.']], ['Pagar ahora', 'Quiero un colchón', 'Busco sala']) }
    return bot([['t', '🚚 ' + H.R.kb.delivery], ['t', '¿En qué municipio estás? Te digo exacto cuánto te cuesta.']], ['Pereira', 'Dosquebradas', 'Cartago', 'Armenia', 'Chinchiná']);
  }
  // Pagos / cuotas
  if (has(q, /cuota|credito|addi|sistecredito|financ|pse|nequi|tarjeta|forma de pago|medios de pago|como pago|contraentrega|efectivo/)) {
    return bot([['t', '💳 Puedes pagar con <b>' + H.R.kb.pay + '</b>.'], ['t', 'Con <b>Addi o Sistecrédito</b> lo pagas a cuotas sin tarjeta, con aprobación en minutos. Con tarjeta de crédito, hasta 36 cuotas según tu banco.' + (p ? ' Por ejemplo, ' + H.esc(p.name) + ' a 12 cuotas queda en ~' + H.money(p.price / 12) + ' al mes.' : '')], ['t', 'Si llevas productos de las dos marcas, pagas una sola vez y el sistema le entrega a cada marca lo suyo con su factura.']], ['Pagar ahora', 'Quiero un colchón', 'Busco sala']);
  }
  // Garantía
  if (has(q, /garantia|devolucion|cambio|se hunde|dura|cuanto dura|vida util|defecto/)) {
    return bot([['t', '🛡️ El <b>Gran Duque tiene 5 años de garantía</b> (no cubre el forro por humedad). Para que te dure como nuevo: rótalo cada 30 días y no dejes que los niños salten encima 😅'], ['t', 'Los demás productos tienen garantía de fábrica El Rey. Las condiciones exactas de cambios y devoluciones te las confirma el asesor antes de despachar, por escrito.']], ['Ver Gran Duque', 'Pagar ahora', 'Hablar con asesor']);
  }
  // Humano
  if (has(q, /asesor|humano|persona|llamar|llamada|whatsapp|hablar con alguien|vendedor/)) {
    return bot([['t', '¡Con gusto! Te paso con un asesor de la línea principal 🙋. Le dejo tu consulta escrita para que no tengas que repetir nada:'], ['h', '<a class="btn wa sm" target="_blank" rel="noopener" href="' + H.waLink('Hola El Rey 👑 vengo de la página web.' + (p ? ' Me interesa ' + p.name + (ctx.size ? ' en ' + ctx.size : '') + '.' : '') + (ctx.city ? ' Estoy en ' + ctx.city + '.' : '') + (H.cart().length ? '\n' + H.cartText() : '')) + '">Abrir WhatsApp con mi consulta</a>']], ['Seguir aquí']);
  }
  // Promos
  if (has(q, /promo|oferta|black|friday|descuento|gratis|rebaja/)) {
    const ps = P().filter(x => x.promo).slice(0, 3);
    return bot([['t', '🔥 ¡Black Friday El Rey! Estas son las que más se están llevando:'], ...ps.map(x => ['p', x]), ['t', 'La base cama gratis del Gran Duque es hasta agotar unidades. ¿Cuál te gustó?']], ['Gran Duque', 'Sala Venecia', 'Ver todas las promos']);
  }

  // Medidas
  if (has(q, /medida|tamano|cabe|espacio|habitacion pequen|cuarto|mide|dimension/) && !prod) {
    return bot([['t', '📏 Guía rápida de medidas:<br>• <b>Sencillo 100×190</b>: una persona o juvenil<br>• <b>Semidoble 120×190</b>: una persona con espacio<br>• <b>Doble 140×190</b>: pareja, la más vendida<br>• <b>Queen 160×190</b>: pareja que quiere más espacio<br>• <b>King 200×200</b>: pareja + niños o mascotas'], ['t', 'Un truco: deja al menos 60 cm libres a los lados para caminar. ¿Cuánto mide tu habitación o para cuántas personas es?']], ['Duermo solo', 'En pareja', 'Familia con niños']);
  }
  if (has(q, /familia con ninos|ninos|mascota|perro|gato/)) { ctx.size = 'King'; const gd = H.byId('colchon-gran-duque'); return bot([['t', '¡Las mañanas de domingo con todos en la cama son lo mejor! 🐶👧 Te recomiendo King 200×200 o Queen.'], ['p', gd, sizeIdx(gd, 'King')], ['p', gd, sizeIdx(gd, 'Queen')]], ['Pagar ahora', 'Envío', 'Cuotas']) }

  // Necesidad: colchón
  if (has(q, /colchon|dormir|descanso|cama|quiero un colchon|duermo solo|en pareja|ver gran duque|gran duque/) || (sz && !ctx.need) || (p && ['colchones', 'camas', 'almohadas'].includes(p.cat))) {
    ctx.need = 'sleep';
    if (has(q, /cama completa|espaldar|cabecero|cama$/) && !has(q, /colchon/)) { const c = H.byId('cama-gran-duque-lujo'); return bot([['t', 'Si quieres la habitación lista en una sola compra, la <b>Cama Gran Duque de Lujo</b> es un golazo: espaldar tapizado, base y el colchón Gran Duque, a precio especial.'], ['p', c, sizeIdx(c, ctx.size)]], ['Pagar ahora', 'Armar combo', 'Envío']) }
    if (p && p.cat !== 'colchones' && p.cat !== 'camas' && p.cat !== 'almohadas') { /* sigue abajo */ }
    else {
      const target = p && (p.cat === 'colchones' || p.cat === 'camas') ? p : (ctx.budget && ctx.budget < 1000000 ? H.byId('colchon-pillow-confort') : H.byId('colchon-gran-duque'));
      const si = sizeIdx(target, ctx.size);
      if (!ctx.size && target.sizes.length > 1) return bot([['t', '¡Buenísimo! El más pedido es el <b>Gran Duque</b>: doble pillow top, 40 cm, sensación de firmeza y en medida doble <b>la base cama te sale GRATIS</b>. ¡Así como lo lees! 👑'], ['p', target, si], ['t', 'Para recomendarte la medida exacta: ¿duermes solo, en pareja o con niños/mascotas?']], ['Duermo solo', 'En pareja', 'Familia con niños', 'Algo más económico']);
      const parts = [['t', ctx.size === 'Sencillo' || ctx.size === 'Semidoble' ? 'Para ti solo, perfecto 😌 Te dejo el ' + H.esc(target.name) + ' en ' + target.sizes[si].l + ':' : 'En ' + ctx.size + ' quedan cómodos los dos 💑 Mira:'], ['p', target, si]];
      if (target.id === 'colchon-gran-duque' && si === 2) parts.push(['t', '🎁 Y en doble te llevas la <b>base cama 140×190 GRATIS</b>.']);
      if (target.sizes[si].ref) parts.push(['t', '<span class="small muted">El valor de esta medida lo confirma el asesor antes de despachar.</span>']);
      parts.push(['t', '¿Te lo agrego? También puedo mostrarte una opción más económica.']);
      return bot(parts, ['Pagar ahora', 'Algo más económico', 'Envío', 'Garantía']);
    }
  }

  // Sala
  if (has(q, /sala|sofa|mueble|esquinera|poltrona|living|busco sala/) || (p && p.cat === 'salas')) {
    ctx.need = 'sala';
    if (p && p.cat === 'salas') return bot([['t', '¡Buen gusto! 😍 La <b>' + H.esc(p.name) + '</b>: ' + H.esc(p.tagline.toLowerCase()) + '.'], ['p', p], ['t', p.recolor ? 'En la ficha puedes tocar los colores y ver cómo cambia la tela en la foto. ¿Qué colores tiene tu espacio?' : 'Viene en ' + p.colors.map(c => c.name.toLowerCase()).join(', ') + '. Te enviamos foto de la tela real por WhatsApp.']], ['Ver colores', 'Envío', 'Cuotas', 'Armar combo']);
    return bot([['t', '¡A renovar la sala! 🛋️ Para orientarte: ¿cuántas personas se sientan normalmente y qué estilo te gusta?'], ['p', H.byId('sala-venecia')], ['p', H.byId('sala-boston')], ['t', 'La <b>Venecia</b> está en promoción a ' + H.money(2500000) + ' y en la Boston eliges el color en la foto 🎨']], ['Para recibir visitas', 'Apartamento pequeño', 'Hasta 2 millones', 'Ver todas las salas']);
  }
  // Comedor
  if (has(q, /comedor|mesa|sillas|puestos/) || (p && p.cat === 'comedores')) {
    ctx.need = 'comedor';
    return bot([['t', '🍽️ Tenemos dos comedores que enamoran:'], ['p', H.byId('comedor-orion')], ['p', H.byId('comedor-nordico')], ['t', 'El Orión viene en 4 o 6 puestos. ¿Para cuántas personas lo necesitas?']], ['4 puestos', '6 puestos', 'Envío', 'Cuotas']);
  }
  // Producto específico sin intención clara
  if (p) return bot([['t', 'Te cuento del <b>' + H.esc(p.name) + '</b>: ' + H.esc(p.desc)], ['p', p, sizeIdx(p, ctx.size)]], ['Envío', 'Cuotas', 'Garantía', 'Pagar ahora']);
  if (bud) return reply('presupuesto');
  if (has(q, /gracias|chevere|super|genial|listo|ok\b|perfecto|vale/)) return bot([['t', '¡Con todo el gusto! 👑 Aquí estoy si necesitas algo más. Recuerda: ¡en El Rey dormimos como se debe!']], ['Ver promos', 'Pagar ahora']);
  if (has(q, /horario|abren|cierran|hora/)) return bot([['t', 'Los horarios de cada sede te los confirma el asesor por WhatsApp para darte el dato exacto del día 🙏']], ['Hablar con asesor', 'Cómo llegar']);
  if (has(q, /no encuentro|ayudame/)) return bot([['t', '¡Para eso estoy! Cuéntame con tus palabras qué buscas (por ejemplo: "colchón doble firme", "sala gris para apartamento", "comedor de 6") y te lo encuentro.']], ['Quiero un colchón', 'Busco sala', 'Comedor']);

  // Desconocido: honestidad + guía
  return bot([['t', 'Mmm, esa no me la sé con certeza y no quiero inventarte nada 🙈'], ['t', 'Puedo ayudarte con productos, medidas, colores, envíos, pagos a cuotas y garantía. O si prefieres, te paso con un asesor humano con tu pregunta ya escrita.']], ['Quiero un colchón', 'Busco sala', 'Envío', 'Hablar con asesor']);
}

function greet() {
  const path = location.pathname, p = H.R.products.find(x => path.includes('/producto/' + x.id));
  if (p) { ctx.last = p; return bot([['t', '¡Hola! 👑 Veo que te gusta <b>' + H.esc(p.name) + '</b>, ¡buen ojo!'], ['t', '¿Te ayudo con la medida, el color, el envío o el pago a cuotas?']], p.cat === 'salas' ? ['Ver colores', 'Envío', 'Cuotas', '¿Es seguro pagar aquí?'] : ['¿Qué medida me sirve?', 'Envío', 'Cuotas', 'Garantía']) }
  if (H.cart().length) return bot([['t', '¡Hola de nuevo! 👋 Tienes ' + H.cart().length + ' producto(s) esperándote en el carrito. ¿Te ayudo a terminar la compra o tienes alguna duda?']], ['Pagar ahora', '¿Es seguro pagar aquí?', 'Envío', 'Cuotas']);
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
