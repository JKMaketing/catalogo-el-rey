/* Catálogo, sedes, reseñas y conocimiento de marca · Preview eCommerce El Rey
   ref:true = precio de referencia del preview (no publicado por El Rey). Los demás vienen de piezas reales del cliente. */
window.REY = (() => {
  const C = 'colchones', M = 'muebles';
  const FABRICS = {
    gris:    { name: 'Gris perla',      hex: '#9a9a98' },
    marfil:  { name: 'Marfil',          hex: '#e8dfcf' },
    arena:   { name: 'Arena',           hex: '#cdb58f' },
    petroleo:{ name: 'Azul petróleo',   hex: '#2f5866' },
    oliva:   { name: 'Verde oliva',     hex: '#727a4f' },
    terracota:{name: 'Terracota',       hex: '#b0593b' },
    mostaza: { name: 'Mostaza',         hex: '#c9952d' },
    grafito: { name: 'Grafito',         hex: '#4a4a4c' }
  };
  const fab = (...k) => k.map(x => ({ id: x, ...FABRICS[x] }));

  // Fuentes: piezas publicadas por El Rey (Instagram/archivo), etiqueta del Gran Duque y lo que se ve en las fotos.
  // ref:true = precio de referencia del preview, sin publicación de El Rey. "por confirmar" = dato que falta validar con El Rey.
  // nuevo:true = llegó al archivo de contenido más reciente (sept–oct 2026): se muestra en Novedades.
  const products = [
    // ───────── COLCHONES EL REY ─────────
    { id: 'colchon-gran-duque', brand: C, cat: 'colchones', room: 'habitacion', name: 'Colchón Gran Duque', tagline: 'Doble pillow top · 40 cm · sensación de firmeza',
      price: 1100000, badge: 'Base cama GRATIS', promo: true, bestseller: true, imgs: ['gd-1', 'gd-2', 'gd-3', 'gd-hogar'],
      sizes: [{ l: 'Sencillo 100 × 190', p: 890000, ref: true }, { l: 'Semidoble 120 × 190', p: 990000, ref: true }, { l: 'Doble 140 × 190', p: 1100000 }, { l: 'Queen 160 × 190', p: 1390000, ref: true }, { l: 'King 200 × 200', p: 1790000, ref: true }], defSize: 2,
      desc: 'El más pedido de El Rey. Doble pillow top, 40 cm de altura y una firmeza que te sostiene toda la noche. En medida doble te llevas la base cama 140 × 190 GRATIS, hasta agotar unidades.',
      specs: [['Altura', '40 cm'], ['Confort', 'Doble pillow top · sensación de firmeza'], ['Peso recomendado', 'Hasta 140 kg por persona (1,40 × 1,90)'], ['Garantía', '5 años (no cubre el forro por humedad)'], ['Cuidado', 'Rotar cada 30 días · no saltar sobre él'], ['Fabricación', '2026 · modelo Super Pillow']],
      warranty: '5 años (no cubre el forro por humedad)', firmness: 'firme',
      combo: ['almohada-viscoelastica', 'cama-gran-duque-lujo', 'sala-venecia'] },
    { id: 'cama-gran-duque-lujo', brand: C, cat: 'camas', room: 'habitacion', name: 'Cama Gran Duque de Lujo', tagline: 'Cama con espaldar + colchón Gran Duque 140 × 190',
      price: 1690000, badge: 'Precio especial', promo: true, bestseller: true, nuevo: true, imgs: ['gd-lujo', 'gd-lujo-2', 'gd-3'],
      sizes: [{ l: 'Doble 140 × 190', p: 1690000 }], defSize: 0,
      desc: 'La cama con espaldar tapizado y el colchón Gran Duque 1,40 × 1,90 en una sola compra, a precio especial. Así como lo lees: tu habitación queda lista.',
      specs: [['Incluye', 'Cama con espaldar tapizado + colchón Gran Duque 1,40 × 1,90'], ['Espaldar', 'Tapizado en diseño chevron (según la foto)'], ['Colchón', 'Doble pillow top · 40 cm · sensación de firmeza'], ['Garantía del colchón', '5 años (no cubre el forro por humedad)'], ['Otras medidas', 'Por confirmar con el asesor']],
      warranty: '5 años en el colchón Gran Duque (no cubre el forro por humedad)', firmness: 'firme',
      combo: ['almohada-viscoelastica', 'set-puff-mesa'] },
    { id: 'colchon-pillow-confort', brand: C, cat: 'colchones', room: 'habitacion', name: 'Colchón Pillow Confort Resortado', tagline: 'Resortado con pillow · 140 × 190',
      price: 630000, badge: 'Mejor precio', promo: true, bestseller: true, imgs: ['pillow'],
      sizes: [{ l: 'Doble 140 × 190', p: 630000 }], defSize: 0,
      desc: 'Resortado con capa pillow en 1,40 × 1,90. La opción para estrenar descanso cuidando el bolsillo.',
      specs: [['Tipo', 'Resortado con pillow (también llamado "cazata")'], ['Medida', '1,40 × 1,90'], ['Precio', 'Pieza publicada por El Rey · vigencia por confirmar'], ['Garantía', 'Por confirmar con el asesor']],
      firmness: 'intermedia',
      combo: ['almohada-viscoelastica', 'colchon-gran-duque'] },
    { id: 'colchon-semiortopedico-base', brand: C, cat: 'colchones', room: 'habitacion', name: 'Colchón Semiortopédico + Base Cama', tagline: 'Resortado semiortopédico con base incluida · 140 × 190',
      price: 620000, badge: 'Combo listo', promo: true, imgs: ['semi'],
      sizes: [{ l: 'Doble 140 × 190 + base', p: 620000 }], defSize: 0,
      desc: 'Colchón resortado semiortopédico con su base cama, en 1,40 × 1,90. Llega completo para estrenar esa misma noche.',
      specs: [['Incluye', 'Colchón + base cama'], ['Tipo', 'Resortado semiortopédico'], ['Medida', '1,40 × 1,90'], ['Precio', 'Pieza publicada por El Rey · vigencia por confirmar'], ['Garantía', 'Por confirmar con el asesor']],
      firmness: 'intermedia a firme',
      combo: ['almohada-viscoelastica'] },
    { id: 'colchon-resortado-confort', brand: C, cat: 'colchones', room: 'habitacion', name: 'Combo Colchón Resortado + Base Cama', tagline: 'Colchón resortado + base cama',
      price: 770000, imgs: ['confort'],
      sizes: [{ l: 'Combo colchón + base', p: 770000 }], defSize: 0,
      desc: 'Colchón resortado con su base cama en un solo combo. Medida y referencia exacta te las confirma el asesor.',
      specs: [['Incluye', 'Colchón resortado + base cama'], ['Medida', 'Por confirmar con el asesor'], ['Precio', 'Pieza publicada por El Rey · vigencia por confirmar'], ['Garantía', 'Por confirmar con el asesor']],
      combo: ['almohada-viscoelastica'] },
    { id: 'almohada-viscoelastica', brand: C, cat: 'almohadas', room: 'habitacion', name: 'Almohada Cervical', tagline: 'Forma de contorno para el cuello',
      price: 89000, imgs: ['almohada'],
      sizes: [{ l: 'Estándar', p: 89000, ref: true }], defSize: 0,
      desc: 'Almohada de contorno que acompaña la curva del cuello. El complemento que remata un colchón nuevo.',
      specs: [['Forma', 'Cervical / contorno (según la foto)'], ['Material y medidas', 'Por confirmar con el asesor'], ['Precio', 'De referencia · por confirmar']],
      combo: ['colchon-gran-duque'] },

    // ───────── MUEBLES EL REY ─────────
    { id: 'sala-venecia', brand: M, cat: 'salas', room: 'sala', name: 'Sala Venecia', tagline: 'Sofá 3 puestos + 2 poltronas',
      price: 2500000, badge: 'Promoción', promo: true, bestseller: true, imgs: ['venecia', 'venecia-hogar'], recolor: true,
      colors: fab('gris', 'marfil', 'arena', 'petroleo', 'oliva', 'terracota'),
      sizes: [{ l: 'Juego como en la foto', p: 2500000 }], defSize: 0,
      desc: 'Curvas suaves y tela aspecto terciopelo. De las salas más preguntadas en el almacén, en promoción.',
      specs: [['Composición (según la foto)', 'Sofá de 3 puestos + 2 poltronas · la mesa de centro se confirma con el asesor'], ['Tela', 'Aspecto terciopelo · muestras en el almacén'], ['Precio', 'Promoción publicada por El Rey · vigencia por confirmar']],
      combo: ['set-puff-mesa', 'comedor-orion', 'colchon-gran-duque'] },
    { id: 'sala-boston', brand: M, cat: 'salas', room: 'sala', name: 'Sala Boston en L', tagline: 'Esquinera en L + puff',
      price: 2890000, bestseller: true, imgs: ['boston'], recolor: true,
      colors: fab('grafito', 'gris', 'marfil', 'petroleo', 'oliva', 'mostaza'),
      sizes: [{ l: 'Esquinera en L + puff', p: 2890000, ref: true }], defSize: 0,
      desc: 'Esquinera amplia para que quepa toda la familia, con puff a juego y respaldo acanalado.',
      specs: [['Composición (según la foto)', 'Esquinera en L + puff'], ['Tela', 'Texturizada aspecto terciopelo'], ['Orientación y medidas', 'Por confirmar con el asesor'], ['Precio', 'De referencia · por confirmar']],
      combo: ['set-puff-mesa', 'colchon-gran-duque'] },
    { id: 'sala-roma', brand: M, cat: 'salas', room: 'sala', name: 'Sala Roma', tagline: 'Sofá 2 puestos + 2 poltronas',
      price: 2390000, imgs: ['roma', 'roma-hogar'], recolor: true,
      colors: fab('marfil', 'arena', 'gris', 'petroleo', 'terracota', 'oliva'),
      sizes: [{ l: 'Sofá 2 puestos + 2 poltronas', p: 2390000, ref: true }], defSize: 0,
      desc: 'Líneas acanaladas y poltronas envolventes para apartamentos donde cada metro cuenta.',
      specs: [['Composición (según la foto)', 'Sofá de 2 puestos + 2 poltronas'], ['Detalle', 'Respaldo acanalado'], ['Patas', 'Madera (según la foto)'], ['Precio', 'De referencia · por confirmar']],
      combo: ['set-puff-mesa', 'comedor-nordico'] },
    { id: 'sala-capriani', brand: M, cat: 'salas', room: 'sala', name: 'Sala Capriani', tagline: 'Sofá 3 puestos + 2 poltronas capitoneadas',
      price: 2990000, imgs: ['capriani', 'capriani-2', 'capriani-3'],
      colors: fab('marfil', 'arena', 'gris'),
      sizes: [{ l: 'Sofá 3 puestos + 2 poltronas', p: 2990000, ref: true }], defSize: 0,
      desc: 'Capitoneado clásico, cojines generosos y un tono claro que ilumina la sala.',
      specs: [['Composición (según la foto)', 'Sofá de 3 puestos + 2 poltronas'], ['Estilo', 'Clásico capitoneado'], ['Tela', 'Por confirmar con el asesor'], ['Precio', 'De referencia · por confirmar']],
      combo: ['set-puff-mesa', 'comedor-orion'] },
    { id: 'sala-vancouver', brand: M, cat: 'salas', room: 'sala', name: 'Sala Vancouver', tagline: 'Sofá + 2 poltronas',
      price: 3500000, imgs: ['vancouver', 'vancouver-2', 'vancouver-3'],
      colors: fab('marfil', 'arena', 'gris'),
      sizes: [{ l: 'Juego como en la foto', p: 3500000 }], defSize: 0,
      desc: 'Envolvente, cálida y hecha para recibir visitas. Un diseño que se ve en hogares de Pereira y Dosquebradas.',
      specs: [['Composición (según la foto)', 'Sofá + 2 poltronas'], ['Estilo', 'Contemporáneo'], ['Precio', 'Publicado por El Rey · vigencia por confirmar']],
      combo: ['set-puff-mesa', 'comedor-orion'] },
    { id: 'sala-imperial', brand: M, cat: 'salas', room: 'sala', name: 'Sala Imperial', tagline: 'Esquinera envolvente + puff',
      price: 1900000, badge: 'Precio especial', promo: true, bestseller: true, imgs: ['imperial'],
      colors: fab('gris', 'grafito'),
      sizes: [{ l: 'Esquinera + puff', p: 1900000 }], defSize: 0,
      desc: 'Mucha sala por un precio que sorprende: esquinera envolvente con puff.',
      specs: [['Composición (según la foto)', 'Esquinera + puff'], ['Tela', 'Aspecto terciopelo gris'], ['Precio', 'Publicado por El Rey · vigencia por confirmar']],
      combo: ['set-puff-mesa', 'colchon-pillow-confort'] },
    { id: 'sala-nube', brand: M, cat: 'salas', room: 'sala', name: 'Sala Nube', tagline: 'Modular capitoneado tipo cloud',
      price: 3900000, bestseller: true, imgs: ['nube'],
      colors: fab('gris', 'marfil'),
      sizes: [{ l: 'Sofá + poltrona + puff', p: 3900000 }], defSize: 0,
      desc: 'La tendencia cloud: módulos mullidos que te abrazan. Para que la sala sea el mejor lugar de la casa.',
      specs: [['Composición (según la foto)', 'Sofá + poltrona + puff'], ['Tela', 'Tipo bouclé'], ['Precio', 'Publicado por El Rey · vigencia por confirmar']],
      combo: ['set-puff-mesa', 'colchon-gran-duque'] },
    { id: 'sofa-cama', brand: M, cat: 'salas', room: 'sala', name: 'Sofá Cama', tagline: 'Sofá de día, cama de noche',
      price: 1590000, nuevo: true, imgs: ['sofacama'],
      colors: fab('marfil', 'gris'),
      sizes: [{ l: 'Dos puestos', p: 1590000, ref: true }], defSize: 0,
      desc: 'Perfecto para apartamentos y visitas: de día es sala y de noche se abre como cama.',
      specs: [['Uso', 'Sofá de día, cama de noche'], ['Mecanismo y medidas abierto', 'Por confirmar con el asesor'], ['Precio', 'De referencia · por confirmar']],
      combo: ['almohada-viscoelastica', 'set-puff-mesa'] },
    { id: 'comedor-orion', brand: M, cat: 'comedores', room: 'comedor', name: 'Comedor Orión', tagline: 'Mesa efecto mármol + 4 sillas',
      price: 1890000, bestseller: true, nuevo: true, imgs: ['orion', 'orion-hogar', 'orion-hogar-2'], recolor: true,
      colors: fab('gris', 'grafito', 'marfil', 'oliva', 'terracota'),
      sizes: [{ l: '4 puestos', p: 1890000, ref: true }], defSize: 0,
      desc: 'Mesa con cubierta efecto mármol y sillas tapizadas de líneas nórdicas. Para comidas largas y conversaciones mejores.',
      specs: [['Mesa', 'Cubierta efecto mármol'], ['Sillas', 'Tapizadas, patas metálicas negras'], ['Puestos', '4 (como en la foto) · otras opciones por confirmar'], ['Precio', 'De referencia · por confirmar']],
      combo: ['sala-venecia', 'set-puff-mesa'] },
    { id: 'comedor-nordico', brand: M, cat: 'comedores', room: 'comedor', name: 'Comedor Nórdico', tagline: 'Mesa efecto mármol + sillas con patas de madera',
      price: 1590000, nuevo: true, imgs: ['nordico'],
      colors: fab('marfil', 'gris'),
      sizes: [{ l: 'Juego como en la foto', p: 1590000, ref: true }], defSize: 0,
      desc: 'Sillas envolventes con patas de madera y una cubierta clara que agranda el espacio.',
      specs: [['Mesa', 'Cubierta efecto mármol (según la foto)'], ['Sillas', 'Tapizadas, patas de madera'], ['Puestos', 'Por confirmar con el asesor'], ['Precio', 'De referencia · por confirmar']],
      combo: ['sala-roma'] },
    { id: 'set-puff-mesa', brand: M, cat: 'complementos', room: 'sala', name: 'Set Mesa Auxiliar + Puff', tagline: 'Mesa dorada + puff tapizado',
      price: 490000, imgs: ['puff'],
      colors: fab('gris', 'marfil'),
      sizes: [{ l: 'Set', p: 490000, ref: true }], defSize: 0,
      desc: 'El detalle que hace que tu sala se vea de revista.',
      specs: [['Incluye (según la foto)', 'Mesa auxiliar dorada + puff tapizado'], ['Precio', 'De referencia · por confirmar']],
      combo: ['sala-venecia', 'sala-boston'] }
  ];

  const ship = {
    free: ['Pereira', 'Dosquebradas', 'Santa Rosa de Cabal', 'Manizales', 'Armenia', 'Cartago'],
    fee: 40000,
    depts: {
      'Risaralda': ['Pereira', 'Dosquebradas', 'Santa Rosa de Cabal', 'La Virginia', 'Marsella', 'Belén de Umbría', 'Apía', 'Balboa', 'Guática', 'La Celia', 'Mistrató', 'Pueblo Rico', 'Quinchía', 'Santuario'],
      'Quindío': ['Armenia', 'Buenavista', 'Calarcá', 'Circasia', 'Córdoba', 'Filandia', 'Génova', 'La Tebaida', 'Montenegro', 'Pijao', 'Quimbaya', 'Salento'],
      'Caldas': ['Manizales', 'Aguadas', 'Anserma', 'Aranzazu', 'Belalcázar', 'Chinchiná', 'Filadelfia', 'La Merced', 'Marmato', 'Neira', 'Pácora', 'Palestina', 'Riosucio', 'Risaralda', 'Salamina', 'San José', 'Supía', 'Villamaría', 'Viterbo'],
      'Valle del Cauca (norte)': ['Cartago', 'Alcalá', 'Ansermanuevo', 'Argelia', 'Bolívar', 'El Águila', 'El Cairo', 'El Dovio', 'La Unión', 'La Victoria', 'Obando', 'Roldanillo', 'Toro', 'Ulloa', 'Versalles', 'Zarzal']
    }
  };

  const stores = [
    { city: 'Pereira · Cerritos', addr: 'Vía Cerritos–Pereira, antes del Hotel Sonesta', wa: '573206777716', waLabel: '320 677 7716', map: 'https://maps.google.com/?cid=14057671815827023160' },
    { city: 'Cartago', addr: 'Carrera 6 con calle 11', wa: '573128768221', waLabel: '312 876 8221', map: 'https://maps.google.com/?q=Carrera+6+con+calle+11+Cartago' }
  ];

  // Reseñas reales de Google (ficha "Colchones El Rey | Punto de Venta | Cerritos"), textuales, consultadas el 20-nov-2026.
  const reviews = [
    { n: 'César Augusto M.', t: 'Excelente empresa excelente servicios productos de gran calidad súper recomendado', w: 'Hace 4 meses', g: 'Local Guide' },
    { n: 'Juan Guillermo G.', t: 'Muy buenos productos, son muy amables y los precios muy competitivos', w: 'Hace un año', g: 'Local Guide' },
    { n: 'Yeison S.', t: 'Buena atención, dejan ver y probar las camas, colchones y muebles', w: 'Hace un año' },
    { n: 'Luis Vargas G.', t: 'Muy buena atención, excelentes colchones y buenos precios', w: 'Hace 7 años', g: 'Local Guide' },
    { n: 'Jesús Antonio P.', t: 'Cumplimiento y calidad', w: 'Hace 11 meses' },
    { n: 'Yarledy S.', t: 'Me encantan. Super recomendado', w: 'Hace 3 años' },
    { n: 'Víctor V.', t: 'Productos de mucha calidad', w: 'Hace un año', g: 'Local Guide' },
    { n: 'Bernardo J.', t: 'excelentes colchones', w: 'Hace un año' }
  ];
  const reviewsUrl = 'https://maps.google.com/?cid=14057671815827023160';

  // Hogares (fotos del archivo del cliente) con puntos "compra el look" en % sobre la imagen 16:9
  const homes = [
    { img: 'h-vancouver', place: 'Pereira', title: 'Una sala para recibir', spots: [{ x: 50, y: 58, id: 'sala-vancouver' }] },
    { img: 'h-orion', place: 'Eje Cafetero', title: 'Comidas largas, mejores conversaciones', spots: [{ x: 48, y: 62, id: 'comedor-orion' }] },
    { img: 'h-gd', place: 'Eje Cafetero', title: 'Dormir como un rey', spots: [{ x: 52, y: 62, id: 'colchon-gran-duque' }, { x: 30, y: 40, id: 'almohada-viscoelastica' }] },
    { img: 'h-roma', place: 'Eje Cafetero', title: 'Luz, vista y calma', spots: [{ x: 45, y: 60, id: 'sala-roma' }] },
    { img: 'h-venecia', place: 'Eje Cafetero', title: 'Terciopelo que invita a quedarse', spots: [{ x: 40, y: 62, id: 'sala-venecia' }] },
    { img: 'h-capriani', place: 'Eje Cafetero', title: 'Clásico que nunca falla', spots: [{ x: 55, y: 60, id: 'sala-capriani' }] }
  ];

  // Landings para pauta (subpáginas)
  const landings = {
    'colchones-pereira': { kicker: 'COLCHONES EN PEREIRA', h: 'En Pereira preferimos dormir como se debe.', p: 'Fábrica y punto de venta en la vía Cerritos. Envío gratis en Pereira y Dosquebradas.', img: 'h-gd', filter: p => p.brand === C, city: 'Pereira' },
    'colchones-cartago': { kicker: 'COLCHONES EN CARTAGO', h: 'Cartago ya duerme como un rey.', p: 'Visítanos en la carrera 6 con calle 11 o compra aquí: envío gratis en Cartago.', img: 'h-almacen', filter: p => p.brand === C, city: 'Cartago' },
    'salas-eje-cafetero': { kicker: 'SALAS EN EL EJE CAFETERO', h: 'La sala que tu casa estaba esperando.', p: 'Elige el color en la foto, recíbela en casa y págala a cuotas con Addi o Sistecrédito.', img: 'h-venecia', filter: p => p.cat === 'salas' },
    'habitacion': { kicker: 'HABITACIÓN', h: 'Tu habitación, tu reino.', p: 'Colchones, camas y almohadas para que despiertes sin dolor y con energía de rey.', img: 'h-gd', filter: p => p.room === 'habitacion' },
    'sala': { kicker: 'SALA', h: 'La vida pasa en la sala. Hazle espacio.', p: 'Salas, esquineras y complementos en telas que eliges desde tu celular.', img: 'h-vancouver', filter: p => p.room === 'sala' },
    'comedor': { kicker: 'COMEDOR', h: 'Que nadie se quiera levantar de la mesa.', p: 'Comedores con cubierta efecto mármol y sillas tapizadas.', img: 'h-orion', filter: p => p.room === 'comedor' },
    'apartamento-nuevo': { kicker: 'ESTRENAS APARTAMENTO', h: 'Amuebla tu apartamento nuevo en una sola compra.', p: 'Colchón + sala + comedor con envío gratis en 6 ciudades y cuotas con Addi o Sistecrédito.', img: 'h-roma', filter: p => p.bestseller }
  };

  // Base de conocimiento del asistente
  const kb = {
    slogan: 'Somos Colchones El Rey, ¡añoooos vendiendo colchones! 👑',
    pay: 'Tarjeta débito/crédito, PSE, Nequi y crédito con Addi o Sistecrédito',
    credit: 'Addi y Sistecrédito',
    warrantyGD: '5 años de garantía en el Gran Duque (no cubre el forro por humedad)',
    delivery: 'Envío GRATIS en Pereira, Dosquebradas, Santa Rosa de Cabal, Manizales, Armenia y Cartago; +$40.000 en 55 municipios del Eje Cafetero y norte del Valle. Solo zonas urbanas; en zona rural entregamos en el casco urbano.'
  };

  return { products, ship, stores, reviews, reviewsUrl, homes, landings, kb, FABRICS };
})();
