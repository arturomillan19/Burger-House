/* Burger House — UI del menú interactivo. Mobile-first, sin frameworks.

   Superficies:
   - #menu       carta completa en la página, con tabs pegajosos por categoría.
   - #hoja       hoja de personalización (bottom sheet) con modificadores.
   - #pedido     resumen del pedido y datos de entrega.
   - #barra      barra fija con total y CTA, visible en cuanto hay algo.

   Diseño gobernado por brand-profile-burger-house.md. */
window.BurgerHouse = window.BurgerHouse || {};

BurgerHouse.ui = (function () {
  'use strict';

  const peso = (n) => '$' + n.toLocaleString('es-MX');
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.prototype.slice.call((c || document).querySelectorAll(s));
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  let scrollY = 0;
  let hojaCtx = null;      // { catId, itemId, editIdx? } mientras la hoja está abierta
  let folioActual = null;

  /* ═════════ Datos ═════════ */
  function categorias() {
    return BurgerHouse.MENU.concat([{
      id: 'bebidas', nombre: 'Bebidas', desc: 'Para acompañar.', items: BurgerHouse.BEBIDAS,
    }]);
  }
  function cat(id) { return categorias().find((c) => c.id === id); }
  function item(catId, itemId) {
    const c = cat(catId);
    return c ? c.items.find((i) => i.id === itemId) : null;
  }
  // Grupos de modificadores: los del item + los de su categoría.
  function modsDe(catId, itemId) {
    const it = item(catId, itemId);
    if (!it) return [];
    return (it.mods || []).concat(BurgerHouse.MODS_CAT[catId] || []);
  }
  function tienePersonalizacion(catId, itemId) { return modsDe(catId, itemId).length > 0; }

  /* ═════════ Imagen con placeholder ═════════
     Si no hay foto, se dibuja un bloque tipográfico con la inicial. Se ve
     intencional, no roto. Reemplazar = poner `img` en data.js, nada más. */
  function imgHTML(it, cls) {
    const inicial = esc(it.nombre.trim()[0] || '?');
    if (!it.img) {
      return '<div class="' + cls + ' ph" aria-hidden="true"><span>' + inicial + '</span></div>';
    }
    return '<img class="' + cls + '" src="' + esc(it.img) + '" alt="" loading="lazy" decoding="async" ' +
           'width="144" height="144" onerror="this.replaceWith(Object.assign(document.createElement(\'div\'),' +
           '{className:\'' + cls + ' ph\',innerHTML:\'<span>' + inicial + '</span>\'}))" />';
  }

  /* ═════════ Carta en la página ═════════ */
  function renderMenu() {
    const cont = $('#menu-cats');
    if (!cont) return;
    cont.innerHTML = categorias().map((c) => {
      if (c.id === 'bebidas') return bebidasHTML(c);
      const filas = c.items.map((it) => filaHTML(c, it)).join('');
      return '<section class="cat" id="cat-' + c.id + '">' +
        '<div class="cat__head"><h3>' + esc(c.nombre) + '</h3><p>' + esc(c.desc || '') + '</p></div>' +
        '<div class="filas">' + filas + '</div></section>';
    }).join('');
  }

  /* Bebidas: desplegable compacto tipo formulario (elige cuáles y cuántas).
     Ocupa poco y no necesita una foto por bebida. */
  function bebidasHTML(c) {
    const desde = Math.min.apply(null, c.items.map((b) => b.precio));
    const rows = c.items.map((b) =>
      '<div class="beb__row" data-beb-row="' + b.id + '">' +
        '<span class="beb__nom">' + esc(b.nombre) + '<small>' + peso(b.precio) + '</small></span>' +
        '<div class="qty qty--beb">' +
          '<button type="button" data-beb-menos="' + b.id + '" aria-label="Quitar ' + esc(b.nombre) + '">−</button>' +
          '<b data-beb-q="' + b.id + '">0</b>' +
          '<button type="button" data-beb-mas="' + b.id + '" aria-label="Agregar ' + esc(b.nombre) + '">+</button>' +
        '</div>' +
      '</div>').join('');
    return '<section class="cat" id="cat-bebidas">' +
      '<div class="cat__head"><h3>' + esc(c.nombre) + '</h3><p>' + esc(c.desc || '') + '</p></div>' +
      '<details class="beb">' +
        '<summary class="beb__sum">' +
          '<svg class="beb__ico" aria-hidden="true"><use href="#bh-vaso"/></svg>' +
          '<span class="beb__lbl">Elegir bebidas <small>desde ' + peso(desde) + '</small></span>' +
          '<span class="beb__n" data-beb-total hidden>0</span>' +
          '<svg class="beb__chev" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l4 4 4-4"/></svg>' +
        '</summary>' +
        '<div class="beb__lista">' + rows + '</div>' +
      '</details></section>';
  }

  function addBebida(id, delta) {
    const b = BurgerHouse.BEBIDAS.find((x) => x.id === id);
    if (!b) return;
    const idx = BurgerHouse.cart.lineas.findIndex((l) => l.catId === 'bebidas' && l.itemId === id);
    if (delta > 0) {
      if (idx === -1) BurgerHouse.cart.add({ catId: 'bebidas', catNombre: 'Bebidas', itemId: id, nombre: b.nombre, base: b.precio, cantidad: 1, mods: [], nota: '' });
      else BurgerHouse.cart.updateCantidad(idx, BurgerHouse.cart.lineas[idx].cantidad + 1);
      pulso();
    } else if (idx !== -1) {
      BurgerHouse.cart.updateCantidad(idx, BurgerHouse.cart.lineas[idx].cantidad - 1);
    }
  }

  function refreshBebidas() {
    let tot = 0;
    BurgerHouse.BEBIDAS.forEach((b) => {
      const q = $('[data-beb-q="' + b.id + '"]');
      if (!q) return;
      const idx = BurgerHouse.cart.lineas.findIndex((l) => l.catId === 'bebidas' && l.itemId === b.id);
      const n = idx === -1 ? 0 : BurgerHouse.cart.lineas[idx].cantidad;
      tot += n;
      q.textContent = n;
      const row = q.closest('.beb__row'); if (row) row.classList.toggle('beb__row--on', n > 0);
    });
    const badge = $('[data-beb-total]');
    if (badge) { badge.textContent = tot; badge.hidden = tot === 0; }
  }

  function filaHTML(c, it) {
    const badge = it.destacado ? '<span class="fila__badge">' + esc(it.destacado) + '</span>' : '';
    const pers = tienePersonalizacion(c.id, it.id);
    return '<article class="fila" data-cat="' + c.id + '" data-item="' + it.id + '">' +
      '<div class="fila__txt">' +
        '<h4>' + esc(it.nombre) + badge + '</h4>' +
        (it.desc ? '<p>' + esc(it.desc) + '</p>' : '') +
        '<span class="fila__precio">' + peso(it.precio) + '</span>' +
      '</div>' +
      '<div class="fila__media">' +
        imgHTML(it, 'fila__img') +
        '<button class="add" type="button" data-add="' + c.id + ':' + it.id + '" ' +
          'aria-label="' + (pers ? 'Personalizar y agregar ' : 'Agregar ') + esc(it.nombre) + '">' +
          (pers ? 'Elegir' : 'Agregar') +
          '<span class="add__n" data-n="' + c.id + ':' + it.id + '" hidden>0</span>' +
        '</button>' +
      '</div>' +
    '</article>';
  }

  // Contadores en los botones: refleja cuántos de ese producto van en el pedido.
  function refreshContadores() {
    const tot = {};
    BurgerHouse.cart.lineas.forEach((l) => {
      const k = l.catId + ':' + l.itemId;
      tot[k] = (tot[k] || 0) + l.cantidad;
    });
    $$('[data-n]').forEach((el) => {
      const n = tot[el.getAttribute('data-n')] || 0;
      el.textContent = n;
      el.hidden = n === 0;
      el.closest('.add').classList.toggle('add--activo', n > 0);
    });
  }

  /* ═════════ Vista del menú (cuadrícula ↔ lista) ═════════
     Preferencia del usuario, recordada entre visitas. En móvil el CSS ignora
     el atributo: la lista es la única forma sensata en una columna. */
  const LLAVE_VISTA = 'bh.vista';

  function aplicarVista(v) {
    const cont = $('#menu-cats');
    if (cont) cont.setAttribute('data-vista', v);
    $$('.vista__b').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-vista') === v));
    });
    try { localStorage.setItem(LLAVE_VISTA, v); } catch (e) { /* modo privado */ }
  }

  function vistaGuardada() {
    try { return localStorage.getItem(LLAVE_VISTA) === 'lista' ? 'lista' : 'cuadricula'; }
    catch (e) { return 'cuadricula'; }
  }

  function bindVista() {
    const grupo = document.querySelector('.vista');
    if (!grupo) return;
    grupo.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-vista]');
      if (b) aplicarVista(b.getAttribute('data-vista'));
    });
  }

  /* ═════════ Tabs de categoría ═════════ */
  function renderTabs() {
    const cont = $('#tabs');
    if (!cont) return;
    cont.innerHTML = categorias().map((c, i) =>
      '<button class="tab' + (i === 0 ? ' tab--on' : '') + '" type="button" data-tab="' + c.id + '">' +
        esc(c.nombre) + '</button>').join('');
  }

  /* Altura real de lo pegajoso (nav + tabs) + un respiro. Se mide en vivo:
     si el nav crece —por un horario en dos líneas, por ejemplo— el ancla
     se ajusta sola en vez de tapar el título de la categoría. */
  function offsetPegajoso() {
    const nav = $('#nav'), tabs = $('.tabs-wrap');
    const h = (nav ? nav.offsetHeight : 0) + (tabs ? tabs.offsetHeight : 0);
    return h + 16;
  }

  /* Pasa las alturas medidas al CSS, para que `scroll-margin-top` (que usa el
     navegador al saltar por teclado o por enlace) coincida con lo que mide el JS. */
  function sincronizarAlturas() {
    const nav = $('#nav'), tabs = $('.tabs-wrap');
    const r = document.documentElement.style;
    if (nav) r.setProperty('--nav-h', nav.offsetHeight + 'px');
    if (tabs) r.setProperty('--tabs-h', tabs.offsetHeight + 'px');
  }

  function bindTabs() {
    const cont = $('#tabs');
    if (!cont) return;
    cont.addEventListener('click', (e) => {
      const b = e.target.closest('[data-tab]');
      if (!b) return;
      const sec = document.getElementById('cat-' + b.getAttribute('data-tab'));
      if (!sec) return;
      const y = sec.getBoundingClientRect().top + window.scrollY - offsetPegajoso();
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
    // El tab activo sigue a la sección visible.
    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entradas) => {
        entradas.forEach((en) => {
          if (!en.isIntersecting) return;
          const id = en.target.id.replace('cat-', '');
          $$('.tab').forEach((t) => t.classList.toggle('tab--on', t.getAttribute('data-tab') === id));
        });
      }, { rootMargin: '-120px 0px -70% 0px' });
      $$('.cat').forEach((s) => obs.observe(s));
    }
  }

  /* ═════════ Hoja de personalización ═════════ */
  function abrirHoja(catId, itemId, editIdx) {
    const it = item(catId, itemId);
    if (!it) return;
    const grupos = modsDe(catId, itemId);
    // Sin modificadores y sin editar: va directo al pedido, sin fricción.
    if (!grupos.length && editIdx == null) {
      BurgerHouse.cart.add({ catId: catId, catNombre: cat(catId).nombre, itemId: itemId,
        nombre: it.nombre, base: it.precio, cantidad: 1, mods: [], nota: '' });
      pulso();
      return;
    }
    hojaCtx = { catId: catId, itemId: itemId, editIdx: editIdx };
    const previo = editIdx != null ? BurgerHouse.cart.lineas[editIdx] : null;
    $('#hoja-body').innerHTML = hojaHTML(it, grupos, previo);
    $('#hoja-titulo').textContent = it.nombre;
    lockScroll();
    const h = $('#hoja');
    h.hidden = false;
    requestAnimationFrame(() => h.classList.add('hoja--on'));
    $('#hoja-scrim').hidden = false;
    calcHoja();
    setTimeout(() => { const f = $('#hoja-body input, #hoja-body textarea'); if (f) f.focus({ preventScroll: true }); }, 260);
  }

  function hojaHTML(it, grupos, previo) {
    const sel = {};
    if (previo) previo.mods.forEach((m) => { sel[m.id] = m.cantidad || 1; });

    const gruposHTML = grupos.map((g) => {
      const req = g.tipo === 'elegir' && g.min ? '<span class="grupo__req">Obligatorio</span>' : '';
      const ops = g.opciones.map((o) => {
        const marcado = previo ? !!sel[o.id] : (g.tipo === 'elegir' && o.default);
        const cant = sel[o.id] || 1;
        const precio = o.precio ? '<span class="op__precio">+' + peso(o.precio) + '</span>' : '';
        if (g.tipo === 'elegir') {
          return '<label class="op"><input type="radio" name="g-' + g.id + '" value="' + o.id + '"' +
            (marcado ? ' checked' : '') + ' data-grupo="' + g.id + '" /><span class="op__t">' + esc(o.nombre) + '</span>' + precio + '</label>';
        }
        // Opción con cantidad (ej. carne extra hasta 3)
        const stepper = o.max && o.max > 1
          ? '<span class="op__step" data-step="' + o.id + '"' + (marcado ? '' : ' hidden') + '>' +
              '<button type="button" class="op__b" data-menos="' + o.id + '" aria-label="Menos ' + esc(o.nombre) + '">−</button>' +
              '<b data-cant="' + o.id + '">' + cant + '</b>' +
              '<button type="button" class="op__b" data-mas="' + o.id + '" aria-label="Más ' + esc(o.nombre) + '">+</button>' +
            '</span>'
          : '';
        return '<label class="op"><input type="checkbox" value="' + o.id + '"' + (marcado ? ' checked' : '') +
          ' data-grupo="' + g.id + '" /><span class="op__t">' + esc(o.nombre) + '</span>' + precio + stepper + '</label>';
      }).join('');
      return '<fieldset class="grupo"><legend>' + esc(g.nombre) + req + '</legend>' + ops + '</fieldset>';
    }).join('');

    return '<div class="hoja__top">' + imgHTML(it, 'hoja__img') +
      '<div><p class="hoja__desc">' + esc(it.desc || '') + '</p>' +
      '<span class="hoja__base">' + peso(it.precio) + '</span></div></div>' +
      gruposHTML +
      '<fieldset class="grupo"><legend>Algo más para la cocina</legend>' +
      '<textarea id="hoja-nota" rows="2" maxlength="140" placeholder="Ej: bien doradita, aderezo aparte">' +
      esc(previo ? previo.nota : '') + '</textarea></fieldset>';
  }

  // Lee la hoja y devuelve los modificadores elegidos.
  function leerHoja() {
    if (!hojaCtx) return null;
    const grupos = modsDe(hojaCtx.catId, hojaCtx.itemId);
    const mods = [];
    grupos.forEach((g) => {
      g.opciones.forEach((o) => {
        const input = $('#hoja-body input[value="' + o.id + '"][data-grupo="' + g.id + '"]');
        if (!input || !input.checked) return;
        const cantEl = $('#hoja-body [data-cant="' + o.id + '"]');
        const cantidad = cantEl ? parseInt(cantEl.textContent, 10) || 1 : 1;
        mods.push({ id: o.id, nombre: o.nombre, precio: o.precio || 0, cantidad: cantidad, tipo: g.tipo });
      });
    });
    const nota = ($('#hoja-nota') && $('#hoja-nota').value) || '';
    return { mods: mods, nota: nota };
  }

  // Total en vivo del botón de la hoja.
  function calcHoja() {
    if (!hojaCtx) return;
    const it = item(hojaCtx.catId, hojaCtx.itemId);
    const leido = leerHoja();
    let p = it.precio;
    leido.mods.forEach((m) => { p += m.precio * m.cantidad; });
    const b = $('#hoja-cta');
    b.textContent = (hojaCtx.editIdx != null ? 'Guardar cambios · ' : 'Agregar · ') + peso(p);
    // Un grupo obligatorio sin elegir bloquea el botón.
    const falta = modsDe(hojaCtx.catId, hojaCtx.itemId).some((g) =>
      g.tipo === 'elegir' && g.min && !$('#hoja-body input[data-grupo="' + g.id + '"]:checked'));
    b.disabled = falta;
  }

  function cerrarHoja() {
    const h = $('#hoja');
    h.classList.remove('hoja--on');
    $('#hoja-scrim').hidden = true;
    setTimeout(() => { h.hidden = true; }, 220);
    hojaCtx = null;
    unlockScroll();
  }

  function confirmarHoja() {
    if (!hojaCtx) return;
    const it = item(hojaCtx.catId, hojaCtx.itemId);
    const leido = leerHoja();
    const linea = {
      catId: hojaCtx.catId, catNombre: cat(hojaCtx.catId).nombre, itemId: hojaCtx.itemId,
      nombre: it.nombre, base: it.precio, mods: leido.mods, nota: leido.nota,
    };
    if (hojaCtx.editIdx != null) BurgerHouse.cart.replace(hojaCtx.editIdx, linea);
    else BurgerHouse.cart.add(Object.assign({ cantidad: 1 }, linea));
    cerrarHoja();
    pulso();
  }

  /* ═════════ Barra fija ═════════ */
  function renderBarra(snap) {
    const barra = $('#barra');
    if (!barra) return;
    const hay = snap.count > 0;
    barra.hidden = !hay;
    document.body.classList.toggle('con-barra', hay);
    if (!hay) {
      document.documentElement.style.removeProperty('--barra-h');
      const p = $('#barra-promo');
      if (p) p.hidden = true;   // sin pedido no hay ahorro que anunciar
      return;
    }
    $('#barra-n').textContent = snap.count;
    $('#barra-total').textContent = peso(snap.total);

    // Recordatorio del descuento justo donde el cliente mira su total. Aparece
    // solo cuando ya hay algo que descontar, con el ahorro en pesos.
    const pm = BurgerHouse.config.promoMaquila;
    const promo = $('#barra-promo');
    if (promo && pm && pm.activa && snap.total > 0) {
      const ahorro = Math.round(snap.total * pm.porcentaje / 100);
      promo.innerHTML = '¿Trabajas en maquila? Ahorra <b>' + peso(ahorro) + '</b> con tu credencial';
      promo.hidden = false;
    } else if (promo) {
      promo.hidden = true;
    }

    // La barra cambia de alto según lleve o no el recordatorio: el hueco que
    // deja el body debe seguirla, o tapa la última fila del menú. Se mide en
    // el momento (no en un frame futuro) porque el aviso de pedido restaurado
    // se ancla sobre ella y necesita el valor ya resuelto.
    document.documentElement.style.setProperty('--barra-h', barra.offsetHeight + 'px');
  }

  /* El atajo del nav cambia de destino según el estado: sin pedido lleva al
     menú; con pedido abre el resumen. Un solo botón, siempre útil. */
  function renderNavCta(snap) {
    const cta = $('#nav-cta'), txt = $('#nav-cta-txt'), n = $('#nav-cta-n');
    if (!cta) return;
    const hay = snap.count > 0;
    txt.textContent = hay ? 'Ver pedido' : 'Hacer pedido';
    cta.href = hay ? '#' : '#menu';
    cta.setAttribute('aria-label', hay
      ? 'Ver mi pedido, ' + snap.count + ' artículo' + (snap.count === 1 ? '' : 's')
      : 'Ir al menú para hacer un pedido');
    if (n) { n.textContent = snap.count; n.hidden = !hay; }
  }

  function pulso() {
    const b = $('#barra');
    if (!b) return;
    b.classList.remove('barra--pulso');
    void b.offsetWidth;
    b.classList.add('barra--pulso');
  }

  /* ═════════ Pedido (resumen) ═════════ */
  function abrirPedido() {
    renderPedido();
    lockScroll();
    const p = $('#pedido');
    p.hidden = false;
    requestAnimationFrame(() => p.classList.add('pedido--on'));
  }
  function cerrarPedido() {
    const p = $('#pedido');
    p.classList.remove('pedido--on');
    setTimeout(() => { p.hidden = true; }, 220);
    unlockScroll();
  }

  function renderPedido() {
    const body = $('#pedido-body');
    const lineas = BurgerHouse.cart.lineas;
    if (!lineas.length) {
      body.innerHTML = '<div class="vacio"><svg class="vacio__ico" aria-hidden="true"><use href="#bh-bolsa"/></svg>' +
        '<p>Todavía no has elegido nada.</p>' +
        '<button class="btn btn--ghost" type="button" data-cerrar-pedido>Ver el menú</button></div>';
      $('#pedido-foot').hidden = true;
      return;
    }
    $('#pedido-foot').hidden = false;

    const pm = BurgerHouse.config.promoMaquila;
    body.innerHTML =
      lineas.map((l, i) => lineaHTML(l, i)).join('') +
      '<button class="mas" type="button" data-cerrar-pedido>+ Agregar algo más</button>' +
      '<div class="entrega">' +
        '<div class="entrega__fijo"><svg aria-hidden="true"><use href="#bh-bolsa"/></svg>' +
        '<span>Paso a recoger al local</span></div>' +
        '<label class="campo"><span class="campo__lbl">¿A nombre de quién? <em>opcional</em></span>' +
        '<input type="text" id="f-nombre" autocomplete="name" placeholder="Para que sepan de quién es" /></label>' +
        (pm && pm.activa ? maquilaHTML(pm) : '') +
      '</div>' +
      '<button class="vaciar" type="button" data-vaciar>Vaciar pedido</button>';
    pintarTotales();
  }

  function lineaHTML(l, i) {
    const it = item(l.catId, l.itemId) || { nombre: l.nombre, img: null };
    const det = [];
    const quitar = l.mods.filter((m) => m.tipo === 'quitar').map((m) => m.nombre.toLowerCase());
    const agregar = l.mods.filter((m) => m.tipo === 'agregar').map((m) => (m.cantidad > 1 ? m.cantidad + '× ' : '') + m.nombre.toLowerCase());
    const elegir = l.mods.filter((m) => m.tipo === 'elegir').map((m) => m.nombre.toLowerCase());
    if (elegir.length) det.push(elegir.join(', '));
    if (quitar.length) det.push('sin ' + quitar.join(', '));
    if (agregar.length) det.push('con ' + agregar.join(', '));
    if (l.nota) det.push('“' + l.nota + '”');
    const pers = tienePersonalizacion(l.catId, l.itemId);

    return '<article class="li">' +
      imgHTML(it, 'li__img') +
      '<div class="li__txt">' +
        '<h4>' + esc(l.nombre) + '</h4>' +
        (det.length ? '<p class="li__det">' + esc(det.join(' · ')) + '</p>' : '') +
        (pers ? '<button class="li__edit" type="button" data-editar="' + i + '">Editar</button>' : '') +
      '</div>' +
      '<div class="li__der">' +
        '<span class="li__precio">' + peso(BurgerHouse.cart.precioLinea(l)) + '</span>' +
        '<div class="qty">' +
          '<button type="button" data-menos-li="' + i + '" aria-label="Quitar uno de ' + esc(l.nombre) + '">−</button>' +
          '<b>' + l.cantidad + '</b>' +
          '<button type="button" data-mas-li="' + i + '" aria-label="Agregar uno de ' + esc(l.nombre) + '">+</button>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  /* La casilla de maquila con el ahorro en pesos. Un "10%" abstracto se ignora;
     "ahorra $31" es una cifra que el cliente compara con el total que ya ve. */
  function maquilaHTML(pm) {
    const ahorro = Math.round(BurgerHouse.cart.total() * pm.porcentaje / 100);
    return '<label class="maquila" id="maquila-caja">' +
      '<input type="checkbox" id="f-maquila" />' +
      '<span class="maquila__txt">' +
        '<b>¿Trabajas en maquila?</b>' +
        '<small>Presenta tu credencial al recoger y ahorra <b class="maquila__ahorro">' + peso(ahorro) + '</b></small>' +
      '</span>' +
      '<span class="maquila__pct" aria-hidden="true">−' + pm.porcentaje + '%</span>' +
    '</label>';
  }

  function pintarTotales() {
    const sub = BurgerHouse.cart.total();
    const pm = BurgerHouse.config.promoMaquila;
    const maq = $('#f-maquila') && $('#f-maquila').checked;
    const desc = (maq && pm && pm.activa) ? Math.round(sub * pm.porcentaje / 100) : 0;
    const cont = $('#pedido-totales');
    if (!cont) return;
    cont.innerHTML =
      (desc ? '<div class="tot"><span>Subtotal</span><b>' + peso(sub) + '</b></div>' +
              '<div class="tot tot--desc"><span>Descuento maquila</span><b>−' + peso(desc) + '</b></div>' : '') +
      '<div class="tot tot--grande"><span>Total</span><b>' + peso(sub - desc) + '</b></div>';
  }

  /* ═════════ Enviar ═════════ */
  function enviar() {
    const nombre = ($('#f-nombre') && $('#f-nombre').value) || '';
    const maquila = !!($('#f-maquila') && $('#f-maquila').checked);
    folioActual = folioActual || BurgerHouse.whatsapp.folio();
    const r = BurgerHouse.whatsapp.enviarPedido({ nombre: nombre, maquila: maquila, folio: folioActual });
    if (!r.msg) return;
    if (r.ok) pantallaExito(r);
    else pantallaManual(r);
  }

  function pantallaExito(r) {
    $('#pedido-body').innerHTML =
      '<div class="exito"><svg class="exito__ico" aria-hidden="true"><use href="#bh-check"/></svg>' +
      '<h3>Tu pedido va en camino</h3>' +
      '<p>Se abrió WhatsApp con la comanda <b>' + esc(folioActual) + '</b>. Solo dale enviar para que llegue a la cocina.</p>' +
      '<p class="exito__nota">Si no se abrió, <button class="link" type="button" data-manual>ábrelo aquí</button>.</p>' +
      '<button class="btn btn--ghost" type="button" data-nuevo>Empezar otro pedido</button></div>';
    $('#pedido-foot').hidden = true;
    window.__bhUrl = r.url;
  }

  function pantallaManual(r) {
    window.__bhUrl = r.url;
    window.__bhMsg = r.msg;
    $('#pedido-body').innerHTML =
      '<div class="exito exito--alerta">' +
      '<h3>No pudimos abrir WhatsApp</h3>' +
      '<p>Tu navegador bloqueó la ventana. Tu pedido <b>' + esc(folioActual) + '</b> está listo — ábrelo o cópialo:</p>' +
      '<a class="btn btn--rojo" href="' + esc(r.url) + '" target="_blank" rel="noopener">Abrir WhatsApp</a>' +
      '<button class="btn btn--ghost" type="button" data-copiar>Copiar la comanda</button>' +
      '<p class="exito__nota">Si copias, pégalo en un mensaje a ' + esc(BurgerHouse.config.whatsapp) + '.</p></div>';
    $('#pedido-foot').hidden = true;
  }

  /* ═════════ Aviso de pedido restaurado ═════════ */
  function avisoRestaurado() {
    if (!BurgerHouse.cart.restaurado) return;
    const min = BurgerHouse.cart.minutosDesdeGuardado();
    const cuando = min < 60 ? 'hace ' + min + ' min' : 'hace ' + Math.round(min / 60) + ' h';
    const el = document.createElement('div');
    el.className = 'aviso';
    el.setAttribute('role', 'status');
    el.innerHTML = '<p>Retomamos tu pedido de ' + cuando + '.</p>' +
      '<div class="aviso__b"><button type="button" data-aviso-ver>Ver</button>' +
      '<button type="button" data-aviso-no>Descartar</button></div>';
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('aviso--on'));
    BurgerHouse.cart.marcarAvisado();
    const quitar = () => { el.classList.remove('aviso--on'); setTimeout(() => el.remove(), 250); };
    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-aviso-ver]')) { quitar(); abrirPedido(); }
      if (e.target.closest('[data-aviso-no]')) { quitar(); BurgerHouse.cart.descartarRestaurado(); }
    });
    setTimeout(quitar, 12000);
  }

  /* ═════════ Horario ═════════ */
  function pintarHorario() {
    const est = BurgerHouse.whatsapp.estadoHorario();
    const el = $('#horario');
    if (el) {
      el.textContent = est.abierto ? 'Abierto ahora · cierra 10:30 pm' : 'Cerrado · abre ' + (est.proximo || est.texto);
      el.classList.toggle('horario--off', !est.abierto);
    }
    if (!est.abierto) {
      const b = $('#aviso-cerrado');
      if (b) {
        b.hidden = false;
        b.textContent = 'Ahorita estamos cerrados. Abrimos ' + (est.proximo || est.texto) + '. Puedes dejar tu pedido armado.';
      }
    }
  }

  /* ═════════ Eventos ═════════ */
  function renderEventos() {
    const cont = $('#eventos-grid');
    if (!cont) return;
    cont.innerHTML = BurgerHouse.EVENTOS.map((p) =>
      '<article class="pack' + (p.destacado ? ' pack--on' : '') + '">' +
        (p.destacado ? '<span class="pack__badge">' + esc(p.destacado) + '</span>' : '') +
        '<h3>' + esc(p.nombre) + '</h3>' +
        '<p class="pack__gente">' + p.personas + ' personas</p>' +
        '<p class="pack__precio">' + peso(p.precio) + '</p>' +
        '<ul>' + p.incluye.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>' +
        '<button class="btn btn--ghost" type="button" data-evento="' + esc(p.nombre) + '">Cotizar</button>' +
      '</article>').join('');
  }

  /* ═════════ Scroll lock ═════════ */
  function lockScroll() {
    scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = -scrollY + 'px';
    document.body.style.width = '100%';
  }
  function unlockScroll() {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollY);
  }

  /* ═════════ Enlaces de WhatsApp ═════════ */
  function pintarWhatsApp() {
    const n = BurgerHouse.config.whatsapp;
    $$('[data-wa]').forEach((a) => {
      a.href = 'https://wa.me/' + n;
      a.rel = 'noopener';
      a.target = '_blank';
    });
  }

  /* ═════════ Binds ═════════ */
  function bind() {
    // Carta: agregar / personalizar
    document.addEventListener('click', (e) => {
      const add = e.target.closest('[data-add]');
      if (add) {
        const [c, i] = add.getAttribute('data-add').split(':');
        abrirHoja(c, i);
        return;
      }
      const bmas = e.target.closest('[data-beb-mas]');
      if (bmas) { e.preventDefault(); addBebida(bmas.getAttribute('data-beb-mas'), 1); return; }
      const bmenos = e.target.closest('[data-beb-menos]');
      if (bmenos) { e.preventDefault(); addBebida(bmenos.getAttribute('data-beb-menos'), -1); return; }
      if (e.target.closest('[data-abrir-pedido]')) { abrirPedido(); return; }
      // El atajo del nav abre el resumen solo si ya hay algo; si no, deja que
      // el enlace haga su trabajo y baje al menú.
      const navCta = e.target.closest('#nav-cta');
      if (navCta) {
        if (BurgerHouse.cart.count() > 0) { e.preventDefault(); abrirPedido(); }
        return;
      }
      if (e.target.closest('[data-cerrar-pedido]')) { cerrarPedido(); return; }
      const ev = e.target.closest('[data-evento]');
      if (ev) { BurgerHouse.whatsapp.cotizarEvento(ev.getAttribute('data-evento')); return; }
    });

    // Hoja
    $('#hoja-scrim').addEventListener('click', cerrarHoja);
    $('#hoja-cerrar').addEventListener('click', cerrarHoja);
    $('#hoja-cta').addEventListener('click', confirmarHoja);
    $('#hoja-body').addEventListener('change', (e) => {
      const inp = e.target.closest('input');
      if (inp) {
        const step = $('#hoja-body [data-step="' + inp.value + '"]');
        if (step) step.hidden = !inp.checked;
      }
      calcHoja();
    });
    $('#hoja-body').addEventListener('input', calcHoja);
    $('#hoja-body').addEventListener('click', (e) => {
      const mas = e.target.closest('[data-mas]');
      const menos = e.target.closest('[data-menos]');
      if (!mas && !menos) return;
      e.preventDefault();
      const id = (mas || menos).getAttribute(mas ? 'data-mas' : 'data-menos');
      const b = $('#hoja-body [data-cant="' + id + '"]');
      if (!b) return;
      const grupos = modsDe(hojaCtx.catId, hojaCtx.itemId);
      let max = 9;
      grupos.forEach((g) => g.opciones.forEach((o) => { if (o.id === id && o.max) max = o.max; }));
      let n = parseInt(b.textContent, 10) || 1;
      n = mas ? Math.min(n + 1, max) : Math.max(n - 1, 1);
      b.textContent = n;
      calcHoja();
    });

    // Pedido
    $('#pedido-cerrar').addEventListener('click', cerrarPedido);
    $('#pedido-body').addEventListener('click', (e) => {
      const mas = e.target.closest('[data-mas-li]');
      const menos = e.target.closest('[data-menos-li]');
      const editar = e.target.closest('[data-editar]');
      const vaciar = e.target.closest('[data-vaciar]');
      if (mas) {
        const i = +mas.getAttribute('data-mas-li');
        BurgerHouse.cart.updateCantidad(i, BurgerHouse.cart.lineas[i].cantidad + 1);
      } else if (menos) {
        const i = +menos.getAttribute('data-menos-li');
        BurgerHouse.cart.updateCantidad(i, BurgerHouse.cart.lineas[i].cantidad - 1);
      } else if (editar) {
        const i = +editar.getAttribute('data-editar');
        const l = BurgerHouse.cart.lineas[i];
        cerrarPedido();
        setTimeout(() => abrirHoja(l.catId, l.itemId, i), 240);
      } else if (vaciar) {
        if (confirm('¿Vaciar todo el pedido?')) { BurgerHouse.cart.clear(); }
      } else if (e.target.closest('[data-nuevo]')) {
        BurgerHouse.cart.clear(); folioActual = null; cerrarPedido();
      } else if (e.target.closest('[data-manual]')) {
        if (window.__bhUrl) window.open(window.__bhUrl, '_blank', 'noopener');
      } else if (e.target.closest('[data-copiar]')) {
        const b = e.target.closest('[data-copiar]');
        navigator.clipboard.writeText(window.__bhMsg || '').then(() => {
          b.textContent = 'Comanda copiada';
          setTimeout(() => { b.textContent = 'Copiar la comanda'; }, 2200);
        });
      }
    });
    $('#pedido-body').addEventListener('change', (e) => {
      if (e.target.id === 'f-maquila') pintarTotales();
    });
    $('#pedido-enviar').addEventListener('click', enviar);

    // Escape cierra la capa de arriba
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (hojaCtx) cerrarHoja();
      else if (!$('#pedido').hidden) cerrarPedido();
    });
  }

  /* ═════════ Init ═════════ */
  function init() {
    renderTabs();
    renderMenu();
    renderEventos();
    sincronizarAlturas();
    aplicarVista(vistaGuardada());
    bindVista();
    bindTabs();
    bind();
    pintarWhatsApp();
    pintarHorario();

    BurgerHouse.cart.onChange((snap) => {
      renderBarra(snap);
      renderNavCta(snap);
      refreshContadores();
      refreshBebidas();
      if (!$('#pedido').hidden) {
        // Redibujar el resumen borraría lo que el cliente ya llenó: se rescata
        // el nombre, el foco y —crítico— la casilla de maquila, para que nadie
        // pierda su descuento por cambiar una cantidad.
        const foco = document.activeElement;
        const eraNombre = foco && foco.id === 'f-nombre';
        const nombre = $('#f-nombre') ? $('#f-nombre').value : null;
        const maquila = $('#f-maquila') ? $('#f-maquila').checked : false;
        renderPedido();
        if (nombre && $('#f-nombre')) $('#f-nombre').value = nombre;
        if (maquila && $('#f-maquila')) { $('#f-maquila').checked = true; pintarTotales(); }
        if (eraNombre && $('#f-nombre')) $('#f-nombre').focus();
      }
    });

    avisoRestaurado();

    // Al rotar el teléfono o cambiar el ancho, las alturas pegajosas cambian.
    let t;
    window.addEventListener('resize', () => {
      clearTimeout(t);
      t = setTimeout(sincronizarAlturas, 150);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  return { abrirPedido, abrirHoja };
})();
