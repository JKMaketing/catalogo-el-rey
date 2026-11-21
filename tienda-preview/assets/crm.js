/* Preview CRM · captación y recaptación desde la línea principal de WhatsApp (datos simulados) */
(() => {
'use strict';
let H, root, sc, step = -1, timer = null;
const STAGES = ['Nuevo', 'Conversando', 'Cotizado', 'Seguimiento', 'Ganado', 'No contactar'];
const BOARD = [
  ['Valentina R.', 'ctwa', 'Gran Duque', 0], ['Jhon F.', 'web', 'Sala Boston', 0], ['Paola M.', 'ctwa', 'Comedor Orión', 1], ['Carlos A.', 'ctwa', 'Pillow Confort', 1],
  ['Luz Dary G.', 'web', 'Sala Nube', 2], ['Hernán T.', 'ctwa', 'Cama GD Lujo', 2], ['Diana C.', 'web', 'Sala Roma', 3], ['Mauricio P.', 'ctwa', 'Gran Duque', 3],
  ['Sofía L.', 'ctwa', 'Gran Duque', 4], ['Andrea V.', 'web', 'Comedor Nórdico', 4], ['Felipe O.', 'ctwa', 'Sala Imperial', 5]
];
const gd = () => H.img('gd-1', 400), ven = () => H.img('venecia', 400);

function scenarios() {
  const S = [];
  S.push({ id: 'ctwa', name: 'Laura · Dosquebradas', tag: 'Click to WhatsApp', desc: 'Clic en anuncio del Gran Duque, pregunta precio y envío, dice "lo voy a pensar".', kind: 'ctwa',
    lead: { Origen: 'Anuncio Meta · Click to WhatsApp', Campaña: 'BF26 · Mensajes · Gran Duque base gratis', Anuncio: 'Reel "Sí, leíste bien"', 'ID de clic': 'ctwa_clid ARAkLm…9Qx', Producto: 'Colchón Gran Duque doble', Municipio: 'Dosquebradas (envío gratis)', Consentimiento: 'Inició el chat · opt-in de marketing al responder', Asesora: 'Sandra · sede Cerritos' },
    steps: [
      { w: '0 s', ch: 'Meta Ads', t: 'Clic en el anuncio', n: 'El CRM crea el lead con campaña, anuncio y ctwa_clid. Mensaje prellenado del anuncio.', st: 0, sc: 15, m: [['sys', 'Laura inició la conversación desde un anuncio de Facebook'], ['in', 'Hola, vi el anuncio del colchón Gran Duque ¿qué precio tiene?']] },
      { w: '+5 s', ch: 'Bot', t: 'Respuesta automática en segundos', n: 'El bot saluda con la voz de la marca, da el precio real y califica (medida + municipio).', st: 1, sc: 30, m: [['out', '¡Hola Laura! 👑 Bienvenida a Colchones El Rey.\nEl Gran Duque doble está en $1.100.000 y ¡la base cama te sale GRATIS! Doble pillow top, 40 cm y 5 años de garantía.', gd()], ['out', '¿Para qué medida lo buscas y en qué municipio estás? Así te digo cuánto te llega 🚚']] },
      { w: '+2 min', ch: 'Bot', t: 'Calificación y link de compra', n: 'Detecta municipio con envío gratis. Envía link de pago prellenado. Evento QualifiedLead a Meta.', st: 2, sc: 55, capi: 'QualifiedLead', m: [['in', 'Doble, en Dosquebradas. ¿Cobran envío?'], ['out', '¡Envío GRATIS a Dosquebradas! 🎉\nTe dejo tu compra lista, solo eliges cómo pagar (tarjeta, PSE, Nequi o a cuotas con Addi/Sistecrédito):\nelrey.co/c/GD140-LAU', null, ['Pagar ahora', 'Tengo una duda']]] },
      { w: '+6 min', ch: 'Asesora', t: 'Pasa a asesora humana', n: 'Regla: si no paga en 5 min, se asigna a asesora de la sede más cercana (SLA 5 min). Objeción detectada.', st: 2, sc: 60, m: [['sys', 'Asignado a Sandra · sede Cerritos'], ['out', 'Hola Laura, soy Sandra de El Rey 😊 ¿Te quedó alguna duda del Gran Duque? Si quieres te mando un video de cómo se ve en una habitación real.'], ['in', 'Me gusta, pero lo voy a pensar con mi esposo 🙏']] },
      { w: '+2 h', ch: 'Asesora', t: 'Seguimiento con valor (ventana 24 h)', n: 'Dentro de la ventana de 24 h se envía mensaje libre: contenido útil para decidir en pareja, no presión.', st: 3, sc: 62, m: [['out', '¡Claro que sí! Decisiones de hogar se toman juntos 🏡 Te dejo el video del Gran Duque para que lo vean y el resumen:\n• Doble 140×190 · $1.100.000\n• Base cama GRATIS\n• Envío gratis a Dosquebradas\n¿Les queda alguna duda de medida o firmeza?', H.img('gd-video-poster')]] },
      { w: '+23 h', ch: 'Asesora', t: 'Último mensaje antes de cerrar la ventana', n: 'Sin respuesta. Un último toque corto antes de que se cierre la ventana de 24 h.', st: 3, sc: 58, m: [['out', 'Buenas tardes Laura 👋 Hoy todavía tenemos bases gratis disponibles. Si quieres te separo una, solo respóndeme SÍ.'], ['sys', 'Sin respuesta · se cierra la ventana de 24 h']] },
      { w: 'Día 2', ch: 'Plantilla', t: 'Plantilla de marketing aprobada por Meta', n: 'Fuera de la ventana solo se usan plantillas aprobadas, con opt-in. Prueba social real (reseña de Google) + botones.', st: 3, sc: 64, m: [['tpl', 'Laura, ¿ya lo hablaron? 😊\nAsí nos califican en Google: "Cumplimiento y calidad" ⭐⭐⭐⭐⭐\nTu Gran Duque con base gratis te sigue esperando.', gd(), ['Quiero el mío', 'Tengo una duda', 'No me interesa']], ['in', 'Tengo una duda'], ['in', '¿Y si no nos gusta la firmeza?'], ['out', 'Súper válida la pregunta 🙌 Pueden venir a probarlo en Cerritos (vía Cerritos–Pereira, antes del Hotel Sonesta) antes de pagar, y tiene 5 años de garantía. Y si prefieren no pagar todo de una, con Addi queda a cuotas.']] },
      { w: 'Día 4', ch: 'Plantilla', t: 'Cierre: urgencia real + facilidad de pago', n: 'Black Friday termina. Se ofrece el medio de pago que resuelve la objeción (cuotas).', st: 3, sc: 80, m: [['tpl', '⏳ El Black Friday de El Rey termina el domingo. ¿Te ayudo a dejar tu Gran Duque listo a cuotas?', null, ['Sí, a cuotas', 'Más adelante']], ['in', 'Sí, a cuotas con Addi'], ['out', '¡Hecho! 👑 Aquí está tu link de Addi: elrey.co/c/GD140-LAU?pago=addi\nApenas se apruebe te confirmo el día de entrega.']] },
      { w: 'Día 4', ch: 'Pasarela', t: 'Venta ganada', n: 'Pago aprobado: el CRM cierra el lead, detiene recordatorios y envía Purchase a Meta (CAPI) con el valor para optimizar la pauta.', st: 4, sc: 100, capi: 'Purchase · $1.100.000', m: [['sys', '✅ Pago aprobado · Orden CER-7K2PQ · $1.100.000'], ['out', '¡Bienvenida a la realeza, Laura! 👑 Tu Gran Duque y tu base salen el jueves en la franja de la tarde. Te aviso cuando el conductor vaya en camino 🚚']] },
      { w: 'Día 20', ch: 'Post-venta', t: 'Reseña y recompra', n: 'Pide reseña en Google y programa una sugerencia de complemento (almohada) a 30 días. Si responde BAJA, no se vuelve a contactar.', st: 4, sc: 100, m: [['out', 'Hola Laura 😊 ¿Cómo han dormido con el Gran Duque? Si les gustó, nos ayudas muchísimo con una reseña en Google ⭐ g.page/elrey'], ['in', '¡Delicioso! Ya la dejo 😍'], ['sys', 'Etiqueta: cliente feliz · Sugerencia en 30 días: almohada cervical']] }
    ] });
  S.push({ id: 'web', name: 'Andrés · Cartago', tag: 'Click a Conversión Web', desc: 'Llega a la landing de salas, personaliza la Sala Venecia y abandona en el pago.', kind: 'web',
    lead: { Origen: 'Anuncio Meta/Google · Conversión web', Campaña: 'BF26 · Ventas · Salas Eje Cafetero', Landing: '/salas-eje-cafetero/', 'ID de clic': 'fbclid IwAR3…kE · utm_source=meta', Producto: 'Sala Venecia · Gris perla', Municipio: 'Cartago (envío gratis)', Consentimiento: 'Autorizó WhatsApp en el checkout', Asesor: 'Julián · sede Cartago' },
    steps: [
      { w: '0 s', ch: 'Web', t: 'Clic en anuncio → landing de salas', n: 'Píxel + API de Conversiones: PageView y ViewContent con producto y valor.', st: 0, sc: 15, capi: 'ViewContent · Sala Venecia', m: [['sys', 'Andrés llegó a /salas-eje-cafetero/ desde un anuncio']] },
      { w: '+3 min', ch: 'Web', t: 'Personaliza color y agrega al carrito', n: 'Cambia la tela a Gris perla y Azul petróleo. AddToCart.', st: 1, sc: 35, capi: 'AddToCart · $2.500.000', m: [['sys', 'Probó colores: Azul petróleo → Gris perla · Agregó Sala Venecia al carrito']] },
      { w: '+6 min', ch: 'Web', t: 'Inicia pago y abandona', n: 'Completa datos y entrega (Cartago), autoriza WhatsApp y se va en el paso de pago. InitiateCheckout.', st: 2, sc: 50, capi: 'InitiateCheckout', m: [['sys', 'Checkout abandonado en paso 3 (pago) · celular y autorización registrados']] },
      { w: '+30 min', ch: 'Plantilla', t: 'Recuperación de carrito', n: 'Plantilla de utilidad aprobada, enviada desde la línea principal con el producto y el color exactos.', st: 3, sc: 55, m: [['tpl', 'Hola Andrés 👋 Tu Sala Venecia en Gris perla te está esperando. Guardamos tu carrito con envío GRATIS a Cartago.', ven(), ['Terminar compra', 'Tengo una duda']], ['in', 'Tengo una duda'], ['in', '¿La tela es antifluidos? tengo un perro 🐶']] },
      { w: '+31 min', ch: 'Bot', t: 'Resuelve la objeción con conocimiento del producto', n: 'Respuesta inmediata desde la ficha técnica + oferta de ver la tela real.', st: 3, sc: 62, m: [['out', '¡Sí! La Venecia viene en terciopelo antifluidos, ideal con mascotas 🐾 Te paso con Julián de la sede Cartago para mostrarte la tela real en video.']] },
      { w: '+1 h', ch: 'Asesor', t: 'Asesor muestra la tela y negocia', n: 'Objeción de precio: no se rebaja la promo, se agrega valor con combo.', st: 3, sc: 70, m: [['out', 'Hola Andrés, soy Julián 🙌 Así se ve la tela Gris perla en luz natural.', H.img('venecia-hogar', 400)], ['in', '¿Me la dejan en $2.300.000?'], ['out', 'La Venecia ya está en precio de promoción, así que no le puedo bajar más 🙏 Pero si la llevas con el Set Mesa auxiliar + Puff, te damos 5% en el set y el envío y armado siguen gratis en Cartago.']] },
      { w: '+1 h', ch: 'Pasarela', t: 'Venta ganada con combo', n: 'Ticket mayor que el carrito original. Purchase a Meta y Google Ads con valor real.', st: 4, sc: 100, capi: 'Purchase · $2.965.500', m: [['in', 'Dale, con el set'], ['out', '¡Excelente elección! 👑 Tu link: elrey.co/c/VEN-AND'], ['sys', '✅ Pago aprobado · Orden MER-4XQ8T · $2.965.500']] },
      { w: 'Día 1', ch: 'Post-venta', t: 'Agenda de entrega', n: 'Mensajes de estado del pedido (utilidad) y luego reseña. Fin de los recordatorios comerciales.', st: 4, sc: 100, m: [['out', 'Andrés, tu Sala Venecia llega el sábado en la mañana 🚚 ¿Hay ascensor o es por escaleras?'], ['in', 'Escaleras, segundo piso'], ['out', 'Perfecto, lo anoto para el equipo de entrega 💪']] }
    ] });
  S.push({ id: 'pay', name: 'Marta · Armenia', tag: 'Pago rechazado', desc: 'Intenta pagar la Cama Gran Duque de Lujo y el banco rechaza la tarjeta.', kind: 'web',
    lead: { Origen: 'Búsqueda Google · Performance Max', Campaña: 'BF26 · Habitación', 'ID de clic': 'gclid Cj0KC…BE', Producto: 'Cama Gran Duque de Lujo', Municipio: 'Armenia (envío gratis)', Consentimiento: 'Autorizó WhatsApp en el checkout', Asesora: 'Sandra · sede Cerritos' },
    steps: [
      { w: '0 s', ch: 'Pasarela', t: 'Pago rechazado', n: 'La pasarela devuelve rechazo. El carrito queda guardado y el CRM dispara el flujo de rescate.', st: 2, sc: 70, m: [['sys', '❌ Pago rechazado · Tarjeta · $1.690.000']] },
      { w: '+2 min', ch: 'Bot', t: 'Rescate inmediato', n: 'Mensaje empático con alternativas de pago, sin culpar al cliente.', st: 3, sc: 72, m: [['tpl', 'Hola Marta 👋 Vimos que tu pago de la Cama Gran Duque de Lujo no se completó. ¡Tranquila, tu pedido sigue apartado! ¿Lo intentamos de otra forma?', H.img('gd-lujo', 400), ['Pagar con Addi', 'Pagar con PSE', 'Hablar con asesora']], ['in', 'Pagar con Addi']] },
      { w: '+9 min', ch: 'Pasarela', t: 'Venta recuperada', n: 'Purchase registrado. Sin este flujo, esta venta se habría perdido.', st: 4, sc: 100, capi: 'Purchase · $1.690.000', m: [['sys', '✅ Crédito Addi aprobado · Orden CER-9PL2M'], ['out', '¡Listo Marta! 👑 Tu cama sale para Armenia el martes. Te escribo cuando vaya en camino.']] }
    ] });
  // Escenario con la navegación real de esta sesión
  const j = H.store.get('rey.journey', []), last = H.store.get('rey.lastOrder'), cart = H.store.get('rey.cart', []), co = H.store.get('rey.co', {}), utm = H.store.get('rey.utm', {});
  if (j.length) {
    const views = [...new Set(j.filter(e => e.ev === 'ViewContent' && e.name && !/^Landing|^Hotspot/.test(e.name)).map(e => e.name))].slice(-3);
    const added = [...new Set(j.filter(e => e.ev === 'AddToCart').map(e => e.name))];
    const nm = co.nombre || 'Visitante';
    const steps = [{ w: '0 s', ch: 'Web', t: 'Tu visita', n: 'Eventos reales de esta sesión del preview: ' + j.length + ' eventos de píxel registrados.', st: 0, sc: 15, capi: 'PageView / ViewContent', m: [['sys', 'Productos vistos: ' + (views.join(', ') || 'ninguno aún')]] }];
    if (added.length) steps.push({ w: '+min', ch: 'Web', t: 'Agregaste al carrito', n: 'AddToCart enviado con valor y producto.', st: 1, sc: 40, capi: 'AddToCart', m: [['sys', 'Carrito: ' + added.join(', ')]] });
    if (last) steps.push({ w: 'Ahora', ch: 'Pasarela', t: 'Compraste en el preview', n: 'Pago dividido por marca: ' + last.legs.map(l => l.ref).join(' + '), st: 4, sc: 100, capi: 'Purchase', m: [['sys', '✅ ' + last.legs.length + ' orden(es): ' + last.legs.map(l => l.ref + ' ' + H.money(l.v)).join(' · ')], ['out', '¡Bienvenido a la realeza, ' + (last.name || nm) + '! 👑 Tu pedido (' + last.items.join(', ') + ') va para ' + (last.mun || 'tu municipio') + '. Te escribimos para agendar la entrega 🚚']] });
    else if (cart.length || added.length) steps.push({ w: '+30 min', ch: 'Plantilla', t: 'Así te recuperaríamos', n: co.cel ? 'Tenemos tu celular del checkout: se envía plantilla de carrito.' : 'Sin celular ni opt-in: no se envía WhatsApp; se usa retargeting en Meta/Google con el producto visto.', st: 3, sc: 55, m: co.cel ? [['tpl', 'Hola ' + nm + ' 👋 Tu ' + (added[0] || 'selección') + ' te está esperando en El Rey. ¿Te ayudo a terminarla?', null, ['Terminar compra', 'Tengo una duda']]] : [['sys', 'Retargeting dinámico: anuncio con ' + (added[0] || views[0] || 'el producto visto') + ' en Instagram y Google']] });
    else steps.push({ w: '+1 día', ch: 'Anuncio', t: 'Retargeting', n: 'Sin datos de contacto: anuncio dinámico con lo que viste.', st: 1, sc: 25, m: [['sys', 'Anuncio dinámico: ' + (views[0] || 'productos más vendidos')]] });
    S.unshift({ id: 'me', name: 'Tú · esta sesión', tag: 'Datos reales del preview', desc: 'Construido con lo que hiciste en la tienda (vistas, carrito, compra).', kind: utm.ctwa_clid ? 'ctwa' : 'web', lead: { Origen: Object.keys(utm).length ? Object.entries(utm).map(([k, v]) => k + '=' + v).join(' · ') : 'Directo (sin UTM)', Producto: views[views.length - 1] || '—', Municipio: co.mun || '—', Celular: co.cel ? co.cel.replace(/\d(?=\d{3})/g, '•') : '—', Consentimiento: co.optin === false ? 'No autorizó WhatsApp' : co.cel ? 'Autorizó WhatsApp' : 'Pendiente' }, steps });
  }
  return S;
}

function mount(el, helpers) {
  H = helpers; root = el; const S = scenarios(); sc = S[0];
  root.innerHTML = '<div class="crumbs"><a href="' + H.url('') + '" data-link>Inicio</a> / Preview CRM</div><span class="kicker">Línea principal de WhatsApp · CRM integrado</span><h1 style="font-size:clamp(30px,4.4vw,54px)">Del clic en la pauta a la venta.<br>Y si no compra, lo recuperamos.</h1><p style="max-width:780px">Simulación del recorrido completo para <b>Click to WhatsApp</b> y <b>Click a Conversión Web</b>: respuesta en segundos, calificación, asesor humano, seguimientos con plantillas aprobadas y cierre. Cada venta vuelve a Meta y Google para que la pauta aprenda a quién mostrarle los anuncios.</p>' +
    '<div class="kpi"><div><b>&lt; 1 min</b><span>Primera respuesta (bot 24/7)</span></div><div><b>5 min</b><span>SLA de asignación a asesor</span></div><div><b>3</b><span>Seguimientos máx. sin respuesta</span></div><div><b>100%</b><span>Ventas reportadas a Meta y Google</span></div></div>' +
    '<div class="crm-grid"><div><div class="panel"><h4>Escenarios</h4><div class="scen" id="scen">' + S.map((s, i) => '<button data-sc="' + s.id + '" class="' + (i ? '' : 'on') + '"><b>' + H.esc(s.name) + '</b><span class="tag ' + (s.kind === 'ctwa' ? '' : 'red') + '" style="display:inline-block;margin:4px 0;' + (s.kind === 'ctwa' ? 'background:#1FA855;color:#fff' : '') + '">' + H.esc(s.tag) + '</span><br><span class="small muted">' + H.esc(s.desc) + '</span></button>').join('') + '</div></div>' +
    '<div class="panel" style="margin-top:14px"><h4>Reglas del CRM</h4><ul class="small" style="padding-left:18px;margin:0;display:grid;gap:6px"><li>Respuesta automática inmediata con la voz de El Rey.</li><li>Asignación por sede más cercana al municipio.</li><li>Ventana de 24 h: mensajes libres. Fuera de ella: solo plantillas aprobadas y con autorización.</li><li>Máximo 3 seguimientos sin respuesta. Se detienen al comprar.</li><li>"BAJA" o "No me interesa" → no contactar, siempre.</li><li>Toda venta se reporta a Meta (API de Conversiones) y Google Ads.</li></ul></div></div>' +
    '<div><div class="phone"><div class="scr"><div class="wa-top"><span class="av">👑</span><div><b>El Rey · Línea principal</b><small id="waSub">en línea</small></div></div><div class="wa-body" id="waBody"></div></div></div><div class="ctrl" style="justify-content:center"><button class="btn sm" id="play">▶ Reproducir</button><button class="btn sm dark" id="next">Siguiente paso →</button><button class="btn sm ghost" id="reset">↺ Reiniciar</button></div></div>' +
    '<div class="col-tl"><div class="panel leadinfo"><h4>Ficha del lead</h4><div id="leadBox"></div><div style="margin-top:12px"><span class="small muted">Etapa: <b id="stage"></b> · Puntaje de compra</span><div class="score"><i id="score" style="width:0"></i></div></div></div>' +
    '<div class="panel" style="margin-top:14px"><h4>Línea de tiempo</h4><div class="tl" id="tl"></div></div>' +
    '<div class="panel" style="margin-top:14px"><h4>Eventos enviados a Meta / Google</h4><div class="pixel-list" id="capi">—</div></div></div></div>' +
    '<h2 style="font-size:30px;margin-top:50px">Tablero del equipo</h2><p class="small muted">Leads de ejemplo. El lead del escenario se mueve de columna a medida que avanza.</p><div class="kanban" id="kanban"></div>' +
    '<div class="panel" style="margin-top:30px"><h4>Cómo se conecta en producción</h4><div class="flow"><span>Anuncio CTWA / Web</span><i>→</i><span>WhatsApp Business API (línea principal)</span><i>→</i><span>CRM (ej. Kommo, HubSpot o Leadsales)</span><i>→</i><span>Bot con base de conocimiento El Rey</span><i>→</i><span>Asesor por sede</span><i>→</i><span>Pasarela con pagos divididos</span><i>→</i><span>API de Conversiones Meta + Google Ads</span></div><p class="small muted">Este preview no envía mensajes ni conecta cuentas reales. Plantillas, números y proveedor se definen con El Rey.</p></div>';
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-sc]'); if (b) { stop(); sc = S.find(s => s.id === b.dataset.sc); $$('[data-sc]').forEach(x => x.classList.toggle('on', x === b)); reset() }
    if (e.target.id === 'next') { stop(); adv() } if (e.target.id === 'reset') { stop(); reset() }
    if (e.target.id === 'play') { if (timer) stop(); else play() }
    const ev = e.target.closest('[data-step]'); if (ev) { stop(); jump(+ev.dataset.step) }
  });
  reset(); setTimeout(play, 600);
}
const $ = (s, el = root) => el.querySelector(s), $$ = (s, el = root) => [...el.querySelectorAll(s)];
function reset() {
  step = -1; $('#waBody').innerHTML = ''; $('#capi').innerHTML = '—';
  $('#leadBox').innerHTML = '<dl>' + Object.entries(sc.lead).map(([k, v]) => '<dt>' + H.esc(k) + '</dt><dd>' + H.esc(v) + '</dd>').join('') + '</dl>';
  $('#tl').innerHTML = sc.steps.map((s, i) => '<div class="ev" data-step="' + i + '" style="cursor:pointer"><span class="when">' + s.w + '</span><span class="what"><b>' + H.esc(s.t) + '</b>' + H.esc(s.n) + '<br><span class="chan">' + s.ch + '</span></span></div>').join('');
  $('#stage').textContent = '—'; $('#score').style.width = '0'; board(-1);
}
function msgHTML([d, t, im, btns]) {
  const time = new Date(Date.now()).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  if (d === 'sys') return '<div class="wa sys">' + H.esc(t) + '</div>';
  return '<div class="wa ' + (d === 'in' ? '' : 'out') + (d === 'tpl' ? ' out tpl' : '') + '">' + (d === 'tpl' ? '<span class="small" style="color:#a07a1d;font-weight:700">Plantilla aprobada · Marketing</span>\n' : '') + (im ? '<img src="' + im + '" alt="" loading="lazy">' : '') + H.esc(t) + (btns ? '<div class="btns">' + btns.map(x => '<span>' + H.esc(x) + '</span>').join('') + '</div>' : '') + '<span class="t">' + time + (d === 'in' ? '' : ' ✓✓') + '</span></div>';
}
function apply(i, animate) {
  const s = sc.steps[i], body = $('#waBody');
  if (body.innerHTML) body.insertAdjacentHTML('beforeend', '<div class="wa sys" style="opacity:.75">— ' + H.esc(s.w) + ' —</div>');
  s.m.forEach(m => body.insertAdjacentHTML('beforeend', msgHTML(m)));
  body.scrollTop = body.scrollHeight;
  $$('.ev').forEach((e, k) => { e.classList.toggle('on', k <= i); e.classList.toggle('cur', k === i) });
  const cur = $('.ev.cur'), tl = $('#tl'); if (cur) tl.scrollTop = cur.offsetTop - tl.offsetTop - 60;
  $('#stage').textContent = STAGES[s.st]; $('#score').style.width = s.sc + '%';
  if (s.capi) { const c = $('#capi'); if (c.textContent === '—') c.innerHTML = ''; c.insertAdjacentHTML('beforeend', '<div>▸ ' + H.esc(s.capi) + ' <span style="color:#888">· ' + H.esc(sc.lead['ID de clic'] || 'event_id') + '</span></div>') }
  $('#waSub').textContent = s.ch === 'Asesor' || s.ch === 'Asesora' ? 'asesor escribiendo…' : 'en línea';
  board(s.st);
}
function adv() { if (step >= sc.steps.length - 1) return false; step++; apply(step, true); return true }
function jump(i) { reset(); for (let k = 0; k <= i; k++) { step = k; apply(k, false) } }
function play() { $('#play').textContent = '❚❚ Pausar'; timer = setInterval(() => { if (!adv()) stop() }, 2600); adv() }
function stop() { clearInterval(timer); timer = null; const p = $('#play'); if (p) p.textContent = '▶ Reproducir' }
function board(st) {
  const k = $('#kanban'); if (!k) return;
  k.innerHTML = STAGES.map((n, i) => { const ls = BOARD.filter(b => b[3] === i); const me = st === i; return '<div class="kcol"><h5><span>' + n + '</span><span>' + (ls.length + (me ? 1 : 0)) + '</span></h5>' + (me ? '<div class="klead ' + sc.kind + ' moving" style="outline:2px solid var(--red)"><b>' + H.esc(sc.name) + '</b>' + H.esc(sc.lead.Producto || '') + '</div>' : '') + ls.map(l => '<div class="klead ' + l[1] + '"><b>' + l[0] + '</b>' + l[2] + ' · ' + (l[1] === 'ctwa' ? 'WhatsApp' : 'Web') + '</div>').join('') + '</div>' }).join('');
}
window.ReyCRM = { mount };
})();
