/* Colchones El Rey · Asistente de venta del Colchón Gran Duque.
   Usa las constantes globales de index.html (VALOR, ENVIO, PRODUCTO, PAY_URL, PAY_URL_ENVIO, IS_DEMO, wa, fmt, track). */
(() => {
  const s = document.createElement('style');
  s.textContent = `.bot{position:fixed;z-index:80;right:16px;bottom:16px;width:min(390px,calc(100vw - 32px));height:min(620px,calc(100svh - 32px));display:flex;flex-direction:column;background:#fff;border-radius:24px;box-shadow:0 30px 80px rgba(36,20,22,.35);overflow:hidden;animation:botIn .25s ease-out}
.bot[hidden]{display:none}
@keyframes botIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
.bot-h{display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--red);color:#fff}
.bot-h .av{width:40px;height:40px;border-radius:50%;background:var(--yellow);display:grid;place-items:center;font-size:1.2rem;flex-shrink:0}
.bot-h b{display:block;font-family:var(--serif);font-size:1.1rem;line-height:1.15}
.bot-h small{display:block;color:#FFD9E0;font-size:.76rem;font-weight:700}
.bot-x{margin-left:auto;background:rgba(255,255,255,.16);color:#fff;border:0;width:38px;height:38px;border-radius:50%;font-size:1.4rem;line-height:1;cursor:pointer;flex-shrink:0}
.bot-demo{background:var(--yellow);color:#3A2600;font-weight:800;font-size:.76rem;letter-spacing:.04em;text-align:center;padding:6px 10px}
.bot-log{flex:1;overflow-y:auto;padding:16px 14px;display:flex;flex-direction:column;gap:10px;background:var(--cream);overscroll-behavior:contain}
.msg{max-width:88%;padding:10px 14px;border-radius:18px;font-size:.95rem;line-height:1.45;white-space:pre-line;overflow-wrap:anywhere}
.msg.b{align-self:flex-start;background:#fff;border:1px solid var(--line);border-bottom-left-radius:6px;color:var(--text)}
.msg.u{align-self:flex-end;background:var(--red);color:#fff;border-bottom-right-radius:6px}
.msg b{color:var(--ink)}.msg.u b{color:#fff}
.msg a.cta{display:block;margin-top:10px;text-align:center;background:var(--red);color:#fff;font-weight:800;padding:11px 12px;border-radius:12px;white-space:normal}
.msg a.cta.wa{background:var(--wa);color:#08220f}
.msg a.lnk{color:var(--red);font-weight:800;text-decoration:underline}
.msg.typing{padding:14px 16px}
.msg.typing span{display:inline-block;width:7px;height:7px;margin:0 2px;border-radius:50%;background:var(--muted);animation:bl 1s infinite}
.msg.typing span:nth-child(2){animation-delay:.15s}.msg.typing span:nth-child(3){animation-delay:.3s}
@keyframes bl{0%,80%,100%{opacity:.25}40%{opacity:1}}
.bot-chips{display:flex;gap:8px;overflow-x:auto;padding:10px 12px 2px;background:#fff;scrollbar-width:none}
.bot-chips::-webkit-scrollbar{display:none}
.bot-chips:empty{display:none}
.bot-chips button{flex-shrink:0;border:2px solid var(--red);background:#fff;color:var(--red);font:800 .85rem var(--sans);padding:8px 14px;border-radius:99px;cursor:pointer;min-height:40px}
.bot-chips button:hover{background:var(--red-bg)}
.bot-in{display:flex;gap:8px;padding:10px 12px 6px;background:#fff}
.bot-in input{flex:1;min-width:0;font:inherit;font-size:16px;padding:11px 14px;border:2px solid var(--line);border-radius:99px;color:var(--ink)}
.bot-in input:focus{outline:none;border-color:var(--red)}
.bot-in button{width:46px;height:46px;border-radius:50%;border:0;background:var(--red);color:#fff;font-size:1.05rem;cursor:pointer;flex-shrink:0}
.bot-legal{font-size:.7rem;color:var(--muted);text-align:center;padding:0 12px 10px;background:#fff}
.demo-live{position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:90;background:var(--red);color:#fff;font-weight:800;font-size:.78rem;padding:8px 16px;border-radius:99px;box-shadow:0 10px 24px rgba(143,21,48,.4);white-space:nowrap;max-width:calc(100vw - 20px);overflow:hidden;text-overflow:ellipsis}
.demo-live::before{content:"";display:inline-block;width:8px;height:8px;border-radius:50%;background:#fff;margin-right:8px;animation:bl 1.2s infinite}
@media (max-width:600px){.bot{right:0;bottom:0;width:100%;height:100%;height:100dvh;border-radius:0}body.chat-open .demo-live{display:none}}`;
  document.head.appendChild(s);
})();
/* ============ Asistente de venta en el chat ============
   Bot por reglas, sin servidor ni claves: responde con los mismos datos de esta página
   y arma el pedido completo para enviarlo por WhatsApp. Los datos no se guardan en ningún lado.
   ?demo=1 reproduce una venta simulada para presentarla (no abre WhatsApp ni dispara píxeles).
   Se inicia cuando la página ya pintó (no compite con la primera carga) o al tocar el botón. */
function iniciarBot(abrirYa) {
  if (window.__botOn) return; window.__botOn = true;
  const N = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const limpio = s => ' ' + N(s).replace(/[^a-z0-9]+/g, ' ').trim() + ' ';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MUNIS = [...document.querySelectorAll('#ciudad option[data-ship]')].filter(o => o.dataset.ship !== 'cotizar')
    .map(o => ({ mun: o.value, dep: o.dataset.dep, ship: +o.dataset.ship, n: limpio(o.value) }));
  const GRATIS = MUNIS.filter(m => m.ship === 0);
  const ALIAS = { ' santa rosa ': 'Santa Rosa de Cabal', ' cerritos ': 'Pereira', ' dosquebrada ': 'Dosquebradas' };
  const MAPS = [...document.querySelectorAll('.loc a.map')].map(a => a.href);
  const MENU = ['Quiero comprarlo', 'Precio y qué incluye', 'Envío a mi ciudad', 'Garantía', 'Pago a cuotas', 'Dónde están'];
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const tactil = matchMedia('(pointer:coarse)').matches;
  const btn = document.getElementById('botBtn');
  let el, log, chipsEl, txt, ocupado = false;
  const st = { paso: -1, d: {}, esperaMuni: false };

  function findMuni(t) {
    const x = limpio(t);
    let hits = MUNIS.filter(m => x.includes(m.n));
    for (const [a, mun] of Object.entries(ALIAS)) if (x.includes(a)) hits.push(MUNIS.find(m => m.mun === mun));
    hits = hits.filter(Boolean);
    if (hits.length > 1) hits = hits.filter(m => m.mun !== 'Risaralda');
    hits.sort((a, b) => a.ship - b.ship || b.n.length - a.n.length);
    return hits[0] || null;
  }
  const espera = ms => new Promise(r => setTimeout(r, ms));
  const abajo = () => { log.scrollTop = log.scrollHeight; };
  function burbuja(cls, html) { const m = document.createElement('div'); m.className = 'msg ' + cls; m.innerHTML = html; log.appendChild(m); abajo(); return m; }
  async function bot(html) {
    const t = burbuja('b typing', '<span></span><span></span><span></span>');
    await espera(reduce ? 60 : Math.min(1500, 500 + html.replace(/<[^>]+>/g, '').length * 7) * (IS_DEMO ? 1.3 : 1));
    t.className = 'msg b'; t.innerHTML = html; abajo();
  }
  function chips(list) {
    chipsEl.innerHTML = '';
    (list || []).forEach(c => { const b = document.createElement('button'); b.type = 'button'; b.textContent = c; b.addEventListener('click', () => enviar(c)); chipsEl.appendChild(b); });
    abajo();
  }
  function entrada(inp) {
    const [type, mode, ac] = inp || ['text', 'text', 'off'];
    txt.type = type; txt.inputMode = mode; txt.autocomplete = ac;
    txt.placeholder = st.paso >= 0 ? 'Escribe tu respuesta…' : 'Escribe tu pregunta…';
  }
  const waLink = (t, label) => `<a class="cta wa" href="${IS_DEMO ? '#' : wa(t)}" target="_blank" rel="noopener" data-wa>${label}</a>`;
  const envioTxt = m => m.ship === 0 ? `🚚 ¡Envío <b>GRATIS</b> a ${esc(m.mun)}!`
    : m.ship > 0 ? `🚚 Envío a ${esc(m.mun)} (${esc(m.dep)}): <b>${fmt(m.ship)}</b>. Total: <b>${fmt(VALOR + m.ship)}</b>.`
    : '🚚 El envío a tu municipio te lo cotizamos por WhatsApp.';

  /* ---- Respuestas (mismos datos de la página y la FAQ) ---- */
  async function envioResp(m, enFlujo) {
    if (m) {
      await bot(m.ship === 0
        ? `¡Sí! El envío a <b>${esc(m.mun)}</b> es <b>GRATIS</b> 🚚. Pagas solo <b>$1.100.000</b> por el colchón y la base cama va de regalo.`
        : `Sí llegamos a <b>${esc(m.mun)}</b> (${esc(m.dep)}). El envío cuesta <b>$40.000</b>, así que el total es <b>$1.140.000</b>.`);
      await bot('Ojo: solo llegamos a <b>zonas urbanas</b>. Si vives en zona rural, la entrega se hace en el casco urbano de tu municipio.');
      if (!enFlujo) chips(['Quiero comprarlo', 'Pago a cuotas', 'Garantía']);
      return;
    }
    await bot('Envío <b>GRATIS</b> en Pereira, Dosquebradas, Santa Rosa de Cabal, Manizales, Armenia y Cartago 🚚.\nPara los demás municipios de Risaralda, Quindío, Norte del Valle y Caldas cercano, el envío cuesta <b>$40.000</b>.\n¿A qué municipio te lo enviamos?');
    if (!enFlujo) { st.esperaMuni = true; chips(GRATIS.map(x => x.mun)); }
  }

  async function responder(t, enFlujo) {
    const x = N(t), has = re => re.test(x);
    const fin = c => { if (!enFlujo) chips(c || MENU); };
    const m = findMuni(t);
    if (has(/(asesor|humano|persona real|llamar|whatsapp|hablar con|alguien)/)) { await bot('¡Claro! Te paso con un asesor de El Rey 👇' + waLink('Hola, vengo de la página del Colchón Gran Duque y tengo una pregunta.', 'Escribir por WhatsApp')); return fin(); }
    if (!enFlujo && has(/(compr|lo quiero|me lo llevo|reserv|pedido|pedir|separ|quiero (el|uno|mi|ese))/)) return iniciarPedido();
    if (has(/otra pregunta/)) { await bot('¡Claro! Pregúntame lo que quieras 👇'); return fin(); }
    if (has(/(rural|vereda|finca|corregimiento)/)) { await bot('Solo llegamos a <b>zonas urbanas</b>. Si vives en zona rural, la entrega se hace dentro del casco urbano de tu municipio.'); return fin(); }
    if (has(/(envi|domicil|entreg|despach|llegan|mandan|transport|flete)/) || (m && !has(/(donde|sede|almacen|tienda|ubica)/))) return envioResp(m, enFlujo);
    if (has(/(cuota|credit|addi|sistecredit|financ|plazo)/)) { await bot('En nuestros almacenes manejamos crédito con <b>Addi</b> y <b>Sistecrédito</b>. Para comprarlo a cuotas, un asesor te dice cómo aplica para ti 👇' + waLink('Hola, quiero el Colchón Gran Duque 1,40 x 1,90 a cuotas. ¿Qué opciones de crédito tienen?', 'Preguntar por cuotas')); return fin(['Quiero comprarlo', 'Envío a mi ciudad']); }
    if (has(/(pag(o|ar|as|an|ue|os)|tarjeta|mercado ?pago|pse|nequi|daviplata|efectivo|transferencia|contraentrega)/)) { await bot((PAY_URL ? 'Puedes pagar en línea con nuestro link de pago o con un asesor por WhatsApp.' : 'Por ahora el pago se coordina con un asesor por WhatsApp: te indica los medios disponibles.') + ' Nosotros no vemos ni guardamos los datos de tu tarjeta.'); return fin(['Quiero comprarlo', 'Pago a cuotas']); }
    if (has(/(sencill|semidoble|queen|king|1[ .,]?20|1[ .,]?60|2[ .,]?00|sala|comedor|almohad|otra medida|otro colchon|catalogo|tocador|alcoba)/)) { await bot('Esta promoción es solo del <b>Gran Duque 1,40 x 1,90</b>. Para otras medidas, salas o comedores, mira el <a class="lnk" href="../">catálogo completo</a> o pregúntale a un asesor 👇' + waLink('Hola, quiero información de otros productos de Colchones El Rey.', 'Preguntar por otros productos')); return fin(); }
    if (has(/(precio|cuanto|vale|cuesta|valor|costo|promo|ofert|descuento|incluye)/)) { await bot('El <b>Colchón Gran Duque 1,40 x 1,90</b> está en <b>$1.100.000</b> y te llevas la <b>base cama de 140 x 190 GRATIS</b>. ¡Así como lo lees! 🔥\nAplica hasta agotar unidades.'); return fin(['Quiero comprarlo', 'Envío a mi ciudad', 'Pago a cuotas']); }
    if (has(/\bbase\b/)) { await bot('Sí: la <b>base cama de 140 x 190</b> va GRATIS con el colchón. Es parte de la promoción, hasta agotar unidades.'); return fin(['Quiero comprarlo', 'Envío a mi ciudad']); }
    if (has(/garant/)) { await bot('La etiqueta del colchón indica <b>5 años de garantía</b>. No cubre el forro por humedad; te recomendamos rotarlo cada 30 días y no dejar que los niños salten sobre él. Te confirmamos las condiciones al comprar.'); return fin(['Quiero comprarlo', 'Precio y qué incluye']); }
    if (has(/(peso|kilo|kg|pesad)/)) { await bot('Según la etiqueta, el peso recomendado es de hasta <b>140 kg</b> para la medida 1,40 x 1,90.'); return fin(); }
    if (has(/(medida|tamano|mide|altura|alto|grande|cm|metro|1[ .,]?40|1[ .,]?90)/)) { await bot('Mide <b>1,40 x 1,90 m</b> (doble), tiene <b>40 cm de altura</b>, doble pillow top y sensación de firmeza.'); return fin(['Quiero comprarlo', 'Precio y qué incluye']); }
    if (has(/(firme|duro|blando|suave|espalda|dolor|columna|pillow|comod|descans)/)) { await bot('El Gran Duque tiene <b>sensación de firmeza</b> con <b>doble pillow top</b>: soporte parejo y una capa mullida arriba, para levantarte sin dolor de espalda y con energía de rey 👑.\nLo mejor es probarlo: ven al almacén.'); return fin(['Dónde están', 'Quiero comprarlo']); }
    if (has(/(donde|ubica|direccion|sede|almacen|tienda|local|mapa|llegar|queda|visit)/)) { await bot(`¡Ya sabes dónde encontrarnos! 👑\n<b>Pereira:</b> vía Cerritos – Pereira, antes del Hotel Sonesta. <a class="lnk" href="${MAPS[0]}" target="_blank" rel="noopener">Abrir en Google Maps</a>\n<b>Cartago:</b> carrera 6 con calle 11. <a class="lnk" href="${MAPS[1]}" target="_blank" rel="noopener">Abrir en Google Maps</a>`); return fin(['Quiero comprarlo', 'Envío a mi ciudad']); }
    if (has(/(horario|hora|abren|cierran|abierto|domingo|sabado|festivo)/)) { await bot('Para confirmarte el horario de hoy, escríbenos por WhatsApp al 320 677 7716 👇' + waLink('Hola, ¿qué horario tienen hoy?', 'Preguntar el horario')); return fin(); }
    if (has(/(foto|imagen|video|como se ve)/)) { await bot('Mira las fotos reales de nuestro almacén aquí 👉 <a class="lnk" href="#galeria" data-cierra>Ver fotos</a>'); return fin(); }
    if (has(/(me gust|me interes|me sirve|me llama la atencion|me encant)/)) { await bot('¡Qué bien! 🔥 El Gran Duque es el más pedido por nuestros clientes. ¿Armamos tu pedido de una? Toma un minuto.'); return fin(['Quiero comprarlo', 'Envío a mi ciudad', 'Pago a cuotas']); }
    if (has(/^(hola|buen|hey|saludo|que tal|holi)/)) { await bot('¡Hola! 👋 ¿Te cuento del Gran Duque o armamos tu pedido de una?'); return fin(); }
    if (has(/(gracias|chevere|perfecto|excelente|genial)/)) { await bot('¡Con gusto! 👑 Somos Colchones El Rey, añoooos vendiendo colchones.'); return fin(); }
    await bot('Esa no me la sé 🙈, pero un asesor te responde al toque 👇' + waLink('Hola, tengo una pregunta sobre el Colchón Gran Duque: ' + t, 'Preguntarle a un asesor'));
    return fin();
  }

  /* ---- Pedido conversacional (mismas validaciones del formulario) ---- */
  const PASOS = [
    { k: 'nombre', q: () => 'Para reservar tu Gran Duque necesito unos datos 📝\n¿Cuál es tu <b>nombre completo</b>?', ok: v => v.split(/\s+/).filter(Boolean).length >= 2 && v.length >= 5, err: 'Escríbeme tu nombre y apellido, porfa.', inp: ['text', 'text', 'name'] },
    { k: 'cedula', q: d => `Mucho gusto, ${esc(d.nombre.split(/\s+/)[0])} 👑 ¿Cuál es tu <b>número de cédula</b>?`, limpia: v => v.replace(/[\s.]/g, ''), ok: v => /^\d{6,10}$/.test(v), err: 'La cédula debe tener entre 6 y 10 números, sin puntos.', inp: ['text', 'numeric', 'off'] },
    { k: 'cel', q: () => '¿A qué <b>celular / WhatsApp</b> te escribimos?', limpia: v => v.replace(/\D/g, '').replace(/^57(?=\d{10}$)/, ''), ok: v => /^\d{10}$/.test(v), err: 'Necesito un celular de 10 dígitos, por ejemplo 310 000 0000.', inp: ['tel', 'tel', 'tel'] },
    { k: 'correo', q: () => '¿Y tu <b>correo electrónico</b>?', limpia: v => v.trim().toLowerCase(), ok: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), err: 'Ese correo no parece válido. Revisa que tenga @ y el dominio (ej: nombre@gmail.com).', inp: ['email', 'email', 'email'] },
    { k: 'muni', q: () => '¿En qué <b>municipio</b> recibes el colchón?', chips: () => GRATIS.map(m => m.mun).concat('Otro municipio'), parse: v => /otro/.test(N(v)) ? { mun: 'Otro municipio', dep: '', ship: -1 } : findMuni(v), err: 'No encontré ese municipio en nuestra zona de entrega. Escríbelo de nuevo o toca "Otro municipio" y te cotizamos el envío.', inp: ['text', 'text', 'address-level2'] },
    { k: 'dir', q: d => envioTxt(d.muni) + '\n¿Cuál es la <b>dirección completa</b>? (calle o carrera, número, barrio, apto o casa)', ok: v => v.length >= 10, err: 'Escríbeme la dirección completa: calle o carrera, número y barrio.', inp: ['text', 'text', 'street-address'] },
    { k: 'zona', q: () => 'Última cosita: <b>solo llegamos a zonas urbanas</b>. Si vives en zona rural, la entrega se hace en el casco urbano de tu municipio. ¿Estás de acuerdo?', chips: () => ['Sí, de acuerdo', 'Tengo dudas'], parse: v => /^(si|sip|de acuerdo|ok|listo|dale|claro|acepto|perfecto|vale|correcto)/.test(N(v).trim()) ? true : null }
  ];
  async function preguntar() {
    const p = PASOS[st.paso];
    entrada(p.inp);
    await bot(p.q(st.d));
    chips((p.chips ? p.chips() : []).concat('Cancelar'));
  }
  async function iniciarPedido() { st.paso = 0; st.d = {}; track('AddToCart', 'add_to_cart'); return preguntar(); }
  function mensaje(d) {
    const m = d.muni, L = ['Hola, quiero comprar el ' + PRODUCTO + ' (pedido hecho en el chat de la página).'];
    if (d.nombre) L.push('Nombre: ' + d.nombre);
    if (d.cedula) L.push('Cédula: ' + d.cedula);
    if (d.cel) L.push('Celular: ' + d.cel);
    if (d.correo) L.push('Correo: ' + d.correo);
    if (m) L.push('Municipio: ' + m.mun + (m.dep ? ' (' + m.dep + ')' : ''));
    if (d.dir) L.push('Dirección: ' + d.dir);
    if (d.zona) L.push('Entrega en zona urbana: sí');
    if (m) L.push('Envío: ' + (m.ship === 0 ? 'GRATIS' : m.ship > 0 ? fmt(m.ship) : 'por cotizar'));
    if (m && m.ship >= 0) L.push('Total: ' + fmt(VALOR + m.ship));
    return L.join('\n');
  }
  async function pasoPedido(t) {
    const p = PASOS[st.paso];
    let v = p.parse ? p.parse(t) : (p.limpia ? p.limpia(t) : t.trim());
    if (!p.parse && !p.ok(v)) v = null;
    if (v === null || v === undefined) {
      if (p.k === 'zona') {
        st.paso = -1; entrada();
        await bot('Sin problema, mejor que lo hables con un asesor 👇' + waLink(mensaje(st.d) + '\nTengo dudas sobre la entrega.', 'Hablar con un asesor'));
        return chips(MENU);
      }
      await bot(p.err);
      return chips((p.chips ? p.chips() : []).concat('Cancelar'));
    }
    st.d[p.k] = v; st.paso++;
    if (st.paso < PASOS.length) return preguntar();
    st.paso = -1; entrada();
    return resumen();
  }
  async function resumen() {
    const d = st.d, m = d.muni, tot = VALOR + (m.ship > 0 ? m.ship : 0);
    const link = m.ship === 0 ? PAY_URL : m.ship > 0 ? PAY_URL_ENVIO : '';
    await bot(`¡Listo! Así quedó tu pedido 👑\n<b>Colchón Gran Duque 1,40 x 1,90 + base cama GRATIS</b>\nNombre: ${esc(d.nombre)}\nCédula: ${esc(d.cedula)}\nCelular: ${esc(d.cel)}\nCorreo: ${esc(d.correo)}\nMunicipio: ${esc(m.mun)}${m.dep ? ' (' + esc(m.dep) + ')' : ''}\nDirección: ${esc(d.dir)}\nEnvío: ${m.ship === 0 ? 'GRATIS' : m.ship > 0 ? fmt(m.ship) : 'por cotizar'}\n<b>Total: ${m.ship >= 0 ? fmt(tot) : fmt(VALOR) + ' + envío por cotizar'}</b>`);
    track('Lead', 'generate_lead', { value: tot });
    await bot('Último paso: envíanos el pedido por WhatsApp y un asesor de El Rey lo confirma y coordina la entrega contigo.'
      + waLink(mensaje(d), 'Enviar mi pedido por WhatsApp')
      + (link ? `<a class="cta" href="${IS_DEMO ? '#' : link}" target="_blank" rel="noopener" data-pay>Pagar ${fmt(tot)} en línea</a>` : ''));
    chips(['Tengo otra pregunta']);
  }

  /* ---- Entrada del usuario ---- */
  async function procesar(t) {
    const x = N(t);
    if (st.paso >= 0) {
      if (/^(cancelar|salir|cancela)/.test(x)) { st.paso = -1; entrada(); await bot('Listo, cancelé el pedido. ¿Te ayudo con algo más?'); return chips(MENU); }
      if (t.trim().endsWith('?')) { await responder(t, true); return preguntar(); }
      return pasoPedido(t);
    }
    if (st.esperaMuni) { st.esperaMuni = false; const m = findMuni(t); if (m) return envioResp(m); }
    return responder(t);
  }
  async function enviar(raw) {
    const t = String(raw).trim();
    if (!t || ocupado) return;
    ocupado = true; chips([]); txt.value = '';
    burbuja('u', esc(t));
    try { await procesar(t); } finally { ocupado = false; if (!IS_DEMO && !tactil) txt.focus({ preventScroll: true }); }
  }

  /* ---- Ventana del chat ---- */
  function construir() {
    el = document.createElement('div');
    el.className = 'bot'; el.id = 'botPanel'; el.hidden = true;
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Asistente de Colchones El Rey');
    el.innerHTML = '<div class="bot-h"><div class="av" aria-hidden="true">👑</div><div><b>Asistente El Rey</b><small>Responde al instante · Pereira y Cartago</small></div><button class="bot-x" type="button" aria-label="Cerrar chat">×</button></div>'
      + (IS_DEMO ? '<div class="bot-demo">● EN VIVO · Simulación de venta · demo interna, no envía nada</div>' : '')
      + '<div class="bot-log" aria-live="polite"></div><div class="bot-chips"></div>'
      + '<form class="bot-in"><input aria-label="Escribe tu mensaje" placeholder="Escribe tu pregunta…" autocomplete="off" maxlength="300"><button type="submit" aria-label="Enviar">➤</button></form>'
      + '<p class="bot-legal">Asistente automático de Colchones El Rey. Tus datos solo se usan para armar tu pedido por WhatsApp.</p>';
    document.body.appendChild(el);
    log = el.querySelector('.bot-log'); chipsEl = el.querySelector('.bot-chips'); txt = el.querySelector('input');
    el.querySelector('form').addEventListener('submit', e => { e.preventDefault(); enviar(txt.value); });
    el.querySelector('.bot-x').addEventListener('click', cerrar);
    el.addEventListener('keydown', e => { if (e.key === 'Escape') cerrar(); });
    log.addEventListener('click', e => {
      const a = e.target.closest('a'); if (!a) return;
      if (IS_DEMO && (a.dataset.wa !== undefined || a.dataset.pay !== undefined)) { e.preventDefault(); return; }
      if (a.dataset.wa !== undefined) track('Contact', 'contact', { method: 'whatsapp_chat' });
      if (a.dataset.pay !== undefined) track('InitiateCheckout', 'begin_checkout');
      if (a.dataset.cierra !== undefined) cerrar();
    });
  }
  async function abrir() {
    if (!el) construir();
    el.hidden = false; btn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('chat-open');
    if (matchMedia('(max-width:600px)').matches) document.body.style.overflow = 'hidden';
    if (!tactil && !IS_DEMO) txt.focus();
    if (!log.children.length) {
      await bot('¡Hola! Soy el asistente de <b>Colchones El Rey</b> 👑\nTe ayudo con el <b>Colchón Gran Duque 1,40 x 1,90</b> ($1.100.000 con la base cama GRATIS): precio, envío, garantía o tu pedido. ¿Qué necesitas?');
      chips(MENU);
    }
  }
  function cerrar() { el.hidden = true; document.body.classList.remove('chat-open'); btn.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; btn.focus({ preventScroll: true }); }
  btn.addEventListener('click', abrir);
  document.querySelectorAll('[data-bot-open]').forEach(b => b.addEventListener('click', abrir));

  /* ---- Simulación de venta en vivo (?demo=1) ---- */
  async function escribir(s) { txt.value = ''; for (const ch of s) { txt.value += ch; await espera(reduce ? 0 : 38); } await espera(250); }
  async function demo() {
    const aviso = document.createElement('div');
    aviso.className = 'demo-live'; aviso.textContent = 'EN VIVO · Simulación de venta (demo interna, no envía nada)';
    document.body.appendChild(aviso);
    await espera(900); await abrir();
    const guion = ['Hola, ¿cuánto vale el Gran Duque?', '¿Hacen envío a Salento?', '¿Se puede pagar a cuotas?', 'Quiero comprarlo',
      'Laura Gómez (cliente de prueba)', '1234567890', '310 000 0000', 'laura.prueba@ejemplo.com', 'Salento', 'Carrera 6 # 4-20, barrio Centro', 'Sí, de acuerdo'];
    for (const g of guion) { await espera(1100); await escribir(g); await enviar(g); }
    aviso.textContent = 'Simulación terminada · así llega el pedido completo a WhatsApp';
  }
  if (IS_DEMO) setTimeout(demo, 400);
  else if (abrirYa) abrir();
  window.__botTest = { procesar: t => procesar(t), findMuni, st };
}
