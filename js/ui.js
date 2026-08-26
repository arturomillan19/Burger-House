/* Burger House — UI: flujo guiado "¿qué se te antoja? → elige → listo" + carta en la página.
   Sin frameworks: DOM directo, patrón módulo. Mobile-first.
   Superficies:
   - Carta editorial en la página (browse) con botón "Añadir".
   - Overlay guiado #orden con 3 vistas: categorías → items → resumen/checkout.
   - Botón flotante #fab SIEMPRE visible + botón "Ver pedido" en el nav. */
window.BurgerHouse = window.BurgerHouse || {};

BurgerHouse.ui = (function () {
  'use strict';

  const peso = (n) => '$' + n.toLocaleString('es-MX');
  const num = (n) => n.toLocaleString('es-MX');
  const $ = (s, c) => (c || document).querySelector(s);
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const ICONO = { burgers: '🍔', entradas: '🍟', pizzas: '🍕', bebidas: '🥤' };
  const notaPH = { burgers: 'Ej: término medio, sin cebolla', pizzas: 'Ej: mitad y mitad, extra queso', entradas: 'Ej: aderezo aparte', bebidas: 'Ej: sin hielo' };

  let scrollY = 0;
  let vista = 'categorias';
  let catActual = null;
  let footBuilt = false;
  let mostrandoExito = false;

  function categorias() {
    return BurgerHouse.MENU.concat([{ id: 'bebidas', nombre: 'Bebidas', desc: 'Para acompañar.', items: BurgerHouse.BEBIDAS }]);
  }
  function cat(id) { return categorias().find((c) => c.id === id); }
  function item(catId, itemId) { const c = cat(catId); return c ? c.items.find((i) => i.id === itemId) : null; }
  function desde(c) { return Math.min.apply(null, c.items.map((i) => i.precio)); }
  // índice de la línea "simple" (sin nota) de un item, para +/- rápidos
  function lineaSimple(catId, itemId) {
    return BurgerHouse.cart.lineas.findIndex((l) => l.categoriaId === catId && l.itemId === itemId && !l.nota && !l.regalo);
  }
  function qtyDe(catId, itemId) {
    return BurgerHouse.cart.lineas.reduce((s, l) => s + ((l.categoriaId === catId && l.itemId === itemId && !l.regalo) ? l.cantidad : 0), 0);
  }
  // ¿El platillo se puede personalizar? (tiene ingredientes removibles o extras de categoría)
  function esPersonalizable(catId, itemId) {
    const it = item(catId, itemId); const c = cat(catId);
    return !!((it && it.quita && it.quita.length) || (c && c.extras && c.extras.length));
  }

  /* ---------- scroll lock ---------- */
  function lockScroll() {
    if (document.body.classList.contains('no-scroll')) return;
    scrollY = window.scrollY;
    document.body.style.top = -scrollY + 'px';
    document.body.classList.add('no-scroll');
  }
  function unlockScroll() {
    if (!document.body.classList.contains('no-scroll')) return;
    document.body.classList.remove('no-scroll');
    document.body.style.top = '';
    window.scrollTo(0, scrollY);
  }

  /* ============================================================
     Carta en la página (browse) + tarjetas "¿qué se te antoja?"
     ============================================================ */
  function mrowHTML(c, it) {
    const key = c.id + ':' + it.id;
    return '<article class="mrow">' +
      '<div class="mrow__body">' +
        '<div class="mrow__top"><span class="mrow__name">' + esc(it.nombre) + '</span>' +
          '<span class="mrow__dots" aria-hidden="true"></span>' +
          '<span class="mrow__price">' + num(it.precio) + '</span></div>' +
        (it.desc ? '<p class="mrow__desc">' + esc(it.desc) + '</p>' : '') +
      '</div>' +
      '<div class="mrow__act"><button class="add" type="button" data-add="' + key + '" aria-label="Añadir ' + esc(it.nombre) + '">' +
        '<span class="add__plus" aria-hidden="true">+</span><span class="add__txt">Añadir</span>' +
        '<span class="add__count" data-add-count="' + key + '" hidden></span></button></div>' +
    '</article>';
  }
  function renderMenu() {
    const cont = $('#menu-cats');
    if (!cont) return;
    cont.innerHTML = categorias().map((c) =>
      '<section class="cat" id="cat-' + c.id + '">' +
        '<div class="cat__head"><h3 class="cat__name">' + esc(c.nombre) + '</h3>' +
          '<span class="cat__meta muted">' + c.items.length + ' opciones · desde ' + peso(desde(c)) + '</span></div>' +
        (c.desc ? '<p class="cat__desc">' + esc(c.desc) + '</p>' : '') +
        '<div class="cat__rule"></div>' + c.items.map((it) => mrowHTML(c, it)).join('') +
      '</section>'
    ).join('');
  }

  function renderAntojo() {
    const cont = $('#antojo-grid');
    if (!cont) return;
    cont.innerHTML = categorias().map((c) =>
      '<button class="acard" type="button" data-cat-abrir="' + c.id + '">' +
        (c.img ? '<img class="acard__img" src="' + c.img + '" alt="" loading="lazy" onerror="this.remove()" />' : '') +
        '<span class="acard__ico" aria-hidden="true">' + (ICONO[c.id] || '🍽️') + '</span>' +
        '<span class="acard__body"><span class="acard__name">' + esc(c.nombre) + '</span>' +
          '<span class="acard__meta">desde ' + peso(desde(c)) + '</span></span>' +
        '<span class="acard__go" aria-hidden="true">→</span>' +
      '</button>'
    ).join('');
    // La apertura por categoría se maneja con un listener global (data-cat-abrir).
  }

  function refreshAddCounts() {
    const tot = {};
    BurgerHouse.cart.lineas.forEach((l) => { if (l.regalo) return; const k = l.categoriaId + ':' + l.itemId; tot[k] = (tot[k] || 0) + l.cantidad; });
    document.querySelectorAll('[data-add-count]').forEach((b) => {
      const n = tot[b.getAttribute('data-add-count')] || 0;
      const btn = b.closest('.add'); const txt = btn && btn.querySelector('.add__txt');
      if (n > 0) { b.textContent = n; b.hidden = false; if (btn) btn.classList.add('is-in'); if (txt) txt.textContent = 'Agregar otra'; }
      else { b.hidden = true; if (btn) btn.classList.remove('is-in'); if (txt) txt.textContent = 'Añadir'; }
    });
  }

  /* ============================================================
     Overlay guiado
     ============================================================ */
  function abrirOrden(v, catId) {
    mostrandoExito = false;
    const ov = $('#orden');
    ov.classList.add('is-open');
    ov.setAttribute('aria-hidden', 'false');
    lockScroll();
    setVista(v || 'categorias', catId);
    $('#orden-close').focus();
    trapFocus(ov);
  }
  function cerrarOrden() {
    const ov = $('#orden');
    ov.classList.remove('is-open');
    ov.setAttribute('aria-hidden', 'true');
    unlockScroll();
    actualizaFab();
  }

  function setVista(v, catId) {
    vista = v;
    if (catId) catActual = catId;
    if (v !== 'resumen') footBuilt = false;
    const back = $('#orden-back'); const title = $('#orden-title');
    if (v === 'categorias') { back.hidden = true; title.textContent = 'Arma tu pedido'; renderCategorias(); }
    else if (v === 'items') { back.hidden = false; $('.orden__back-txt', back).textContent = 'Categorías'; title.textContent = cat(catActual).nombre; renderItems(); }
    else { back.hidden = false; $('.orden__back-txt', back).textContent = 'Seguir eligiendo'; title.textContent = 'Tu pedido'; renderResumen(); }
    renderFootOrden();
    const body = $('#orden-body'); if (body) body.scrollTop = 0;
  }

  function renderCategorias() {
    $('#orden-body').innerHTML =
      '<div class="ov-head"><h2 class="display">¿Qué se te <em>antoja?</em></h2><p class="muted">Elige una categoría para empezar.</p></div>' +
      '<div class="ov-cats">' + categorias().map((c) =>
        '<button class="ovcat" type="button" data-ir-items="' + c.id + '">' +
          (c.img ? '<img class="ovcat__img" src="' + c.img + '" alt="" loading="lazy" onerror="this.remove()" />' : '<span class="ovcat__ph" aria-hidden="true"></span>') +
          '<span class="ovcat__ico" aria-hidden="true">' + (ICONO[c.id] || '🍽️') + '</span>' +
          '<span class="ovcat__t"><span class="ovcat__name">' + esc(c.nombre) + '</span><span class="ovcat__meta">' + c.items.length + ' opciones · desde ' + peso(desde(c)) + '</span></span>' +
        '</button>'
      ).join('') + '</div>';
  }

  function itemCtrlHTML(catId, itemId) {
    const it = item(catId, itemId);
    const n = qtyDe(catId, itemId);
    const key = catId + ':' + itemId;
    // Personalizable (removibles o extras) → abre la hoja.
    if (esPersonalizable(catId, itemId)) {
      return '<button class="oadd" type="button" data-ocustom="' + key + '"><span aria-hidden="true">+</span> Agregar</button>' +
        (n ? '<span class="oadd-n">' + n + ' en tu pedido</span>' : '');
    }
    if (n === 0) return '<button class="oadd" type="button" data-oadd="' + key + '"><span aria-hidden="true">+</span> Agregar</button>';
    return '<div class="qtl"><button class="qtl__b" type="button" data-oless="' + key + '" aria-label="Quitar">−</button>' +
      '<span class="qtl__n">' + n + '</span>' +
      '<button class="qtl__b" type="button" data-oadd="' + key + '" aria-label="Agregar">+</button></div>';
  }
  function renderItems() {
    const c = cat(catActual);
    $('#orden-body').innerHTML =
      '<div class="ov-head"><span class="ov-ico" aria-hidden="true">' + (ICONO[c.id] || '🍽️') + '</span>' +
        '<h2 class="display">' + esc(c.nombre) + '</h2>' + (c.desc ? '<p class="muted">' + esc(c.desc) + '</p>' : '') + '</div>' +
      '<div class="ov-items">' + c.items.map((it) =>
        '<article class="oitem">' +
          '<div class="oitem__info"><p class="oitem__name">' + esc(it.nombre) + '</p>' +
            (it.desc ? '<p class="oitem__desc">' + esc(it.desc) + '</p>' : '') +
            '<p class="oitem__price">' + peso(it.precio) + '</p></div>' +
          '<div class="oitem__ctrl" data-ctrl="' + c.id + ':' + it.id + '">' + itemCtrlHTML(c.id, it.id) + '</div>' +
        '</article>'
      ).join('') + '</div>';
  }
  function refreshItemCtrls() {
    document.querySelectorAll('#orden-body [data-ctrl]').forEach((el) => {
      const [c, i] = el.getAttribute('data-ctrl').split(':');
      el.innerHTML = itemCtrlHTML(c, i);
    });
  }

  function renderResumen() {
    const body = $('#orden-body');
    const lineas = BurgerHouse.cart.lineas;
    if (mostrandoExito) return;
    if (!lineas.length) {
      body.innerHTML = '<div class="ov-vacio"><span aria-hidden="true">🛒</span><p>Tu pedido está vacío.<br>Vuelve y elige algo rico 🍔</p>' +
        '<button class="btn btn--red" type="button" data-ir-cats>Ver categorías</button></div>';
      return;
    }
    body.innerHTML =
      '<div class="ov-head ov-head--sm"><h2 class="display">Tu <em>pedido</em></h2></div>' +
      '<div class="ov-lineas">' + lineas.map((l, idx) => {
        const sub = l.regalo ? 'Gratis' : peso(l.precio * l.cantidad);
        const nota = l.regalo ? '' : (l.nota
          ? '<div class="li__nota"><input type="text" value="' + esc(l.nota) + '" data-nota-input="' + idx + '" placeholder="' + (notaPH[l.categoriaId] || 'Nota') + '" /></div>'
          : '<button class="li__nota-toggle" type="button" data-nota-open="' + idx + '">+ Agregar nota</button>');
        return '<div class="li' + (l.regalo ? ' li--regalo' : '') + '">' +
          '<div class="li__top"><span class="li__nombre">' + esc(l.nombre) + '</span><span class="li__precio">' + sub + '</span></div>' +
          (l.regalo ? '<div class="li__row"><span class="muted" style="font-size:.86rem">Cortesía 🎉</span></div>' :
            '<div class="li__row"><div class="qtl qtl--sm">' +
              '<button class="qtl__b" type="button" data-qty="-1" data-idx="' + idx + '" aria-label="Menos">−</button>' +
              '<span class="qtl__n">' + l.cantidad + '</span>' +
              '<button class="qtl__b" type="button" data-qty="1" data-idx="' + idx + '" aria-label="Más">+</button></div>' +
              '<button class="li__quitar" type="button" data-remove="' + idx + '">Quitar</button></div>' + nota) +
        '</div>';
      }).join('') + '</div>' +
      '<button class="ov-mas" type="button" data-ir-cats><span aria-hidden="true">+</span> Agregar algo más</button>' +
      '<div class="ov-checkout">' +
        '<div class="entrega" role="radiogroup" aria-label="Entrega">' +
          '<label class="entrega__op"><input type="radio" name="entrega" value="recoger" checked> Recojo</label>' +
          '<label class="entrega__op"><input type="radio" name="entrega" value="domicilio"> A domicilio</label>' +
        '</div>' +
        '<div class="campo" id="campo-dir" hidden><input type="text" id="f-direccion" placeholder="Dirección de entrega" /></div>' +
        '<div class="campo"><input type="text" id="f-nombre" placeholder="¿A nombre de quién?" autocomplete="name" /></div>' +
      '</div>';
    syncEntrega();
  }

  function renderFootOrden() {
    const foot = $('#orden-foot');
    if (mostrandoExito) { foot.innerHTML = ''; return; }
    const count = BurgerHouse.cart.count();
    if (vista === 'resumen') {
      foot.innerHTML = count > 0
        ? '<div class="ov-total"><span>Total</span><b>' + num(BurgerHouse.cart.total()) + '</b></div>' +
          '<button class="btn btn--red btn--full" type="button" id="f-enviar">Enviar por WhatsApp</button>'
        : '';
      return;
    }
    // categorías / items: acceso al pedido si ya hay algo
    if (count > 0) {
      foot.innerHTML = '<button class="btn btn--red btn--full" type="button" data-ir-resumen>' +
        'Ver mi pedido · ' + peso(BurgerHouse.cart.total()) + ' <span class="ov-n">' + count + '</span></button>';
    } else {
      foot.innerHTML = '<p class="ov-hint">Toca “Agregar” en lo que quieras 👆</p>';
    }
  }

  /* ---------- eventos del overlay (delegados) ---------- */
  function bindOrden() {
    const ov = $('#orden');
    ov.addEventListener('click', (e) => {
      const irItems = e.target.closest('[data-ir-items]');
      if (irItems) { setVista('items', irItems.getAttribute('data-ir-items')); return; }
      if (e.target.closest('[data-ir-cats]')) { setVista('categorias'); return; }
      if (e.target.closest('[data-ir-resumen]')) { setVista('resumen'); return; }

      const ocustom = e.target.closest('[data-ocustom]');
      if (ocustom) { const [c, i] = ocustom.getAttribute('data-ocustom').split(':'); abrirCustom(c, i); return; }
      const oadd = e.target.closest('[data-oadd]');
      if (oadd) {
        const [c, i] = oadd.getAttribute('data-oadd').split(':');
        const it = item(c, i);
        if (it) BurgerHouse.cart.add({ categoriaId: c, categoriaNombre: cat(c).nombre, itemId: i, nombre: it.nombre, precio: it.precio, cantidad: 1, nota: '' });
        return;
      }
      const oless = e.target.closest('[data-oless]');
      if (oless) { const [c, i] = oless.getAttribute('data-oless').split(':'); const idx = lineaSimple(c, i); if (idx !== -1) BurgerHouse.cart.updateCantidad(idx, BurgerHouse.cart.lineas[idx].cantidad - 1); return; }

      const qty = e.target.closest('[data-qty]');
      if (qty) { const idx = +qty.getAttribute('data-idx'); const l = BurgerHouse.cart.lineas[idx]; if (l) BurgerHouse.cart.updateCantidad(idx, l.cantidad + (+qty.getAttribute('data-qty'))); return; }
      const rm = e.target.closest('[data-remove]');
      if (rm) { BurgerHouse.cart.remove(+rm.getAttribute('data-remove')); return; }
      const no = e.target.closest('[data-nota-open]');
      if (no) {
        const idx = no.getAttribute('data-nota-open');
        const w = document.createElement('div'); w.className = 'li__nota';
        w.innerHTML = '<input type="text" data-nota-input="' + idx + '" placeholder="' + (notaPH[(BurgerHouse.cart.lineas[+idx] || {}).categoriaId] || 'Nota') + '" />';
        no.replaceWith(w); w.querySelector('input').focus(); return;
      }
      if (e.target.closest('#f-enviar')) { enviar(); return; }
    });
    ov.addEventListener('change', (e) => {
      if (e.target.name === 'entrega') { const d = $('#campo-dir'); if (d) { d.hidden = e.target.value !== 'domicilio'; if (!d.hidden) $('#f-direccion').focus(); } syncEntrega(); }
      const ni = e.target.closest('[data-nota-input]');
      if (ni) BurgerHouse.cart.updateNota(+ni.getAttribute('data-nota-input'), ni.value);
    });
    ov.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches('[data-nota-input]')) { e.preventDefault(); e.target.blur(); } });
    $('#orden-back').addEventListener('click', () => setVista('categorias'));
    $('#orden-close').addEventListener('click', cerrarOrden);
  }

  function syncEntrega() {
    document.querySelectorAll('.entrega__op').forEach((op) => { const r = op.querySelector('input'); op.classList.toggle('is-sel', !!(r && r.checked)); });
  }

  function enviar() {
    const tipo = ($('#orden input[name="entrega"]:checked') || {}).value || 'recoger';
    const direccion = (($('#f-direccion') || {}).value || '').trim();
    const nombre = (($('#f-nombre') || {}).value || '').trim();
    if (tipo === 'domicilio' && !direccion) { const el = $('#f-direccion'); el.focus(); el.classList.add('shake'); setTimeout(() => el.classList.remove('shake'), 500); return; }
    if (!nombre) { const el = $('#f-nombre'); el.focus(); el.classList.add('shake'); setTimeout(() => el.classList.remove('shake'), 500); return; }
    const url = BurgerHouse.whatsapp.urlPedido({ tipo, direccion, nombre });
    if (!url) return;
    window.open(url, '_blank');
    mostrarExito(url);
  }

  function mostrarExito(url) {
    mostrandoExito = true;
    BurgerHouse.cart.clear();
    $('#orden-back').hidden = true;
    $('#orden-title').textContent = '¡Listo!';
    $('#orden-foot').innerHTML = '';
    $('#orden-body').innerHTML =
      '<div class="ov-exito"><div class="ov-exito__check" aria-hidden="true">✓</div>' +
        '<h2 class="display">¡Pedido enviado!</h2>' +
        '<p>Se abrió WhatsApp con tu pedido. Solo tócale <b>enviar</b> ahí para confirmarlo.</p>' +
        (url ? '<button class="link" type="button" id="ex-reenviar">¿No se abrió? Reenviar <span aria-hidden="true">→</span></button>' : '') +
        '<button class="btn btn--red btn--full" type="button" id="ex-cerrar">Listo</button></div>';
    if (url) $('#ex-reenviar').addEventListener('click', () => window.open(url, '_blank'));
    $('#ex-cerrar').addEventListener('click', () => { mostrandoExito = false; cerrarOrden(); });
  }

  /* ============================================================
     Hoja de personalización ("sin ___" + cantidad + nota)
     ============================================================ */
  let sheetEl = null;
  function abrirCustom(catId, itemId) {
    const it = item(catId, itemId);
    if (!it) return;
    const c = cat(catId);
    const quita = (it.quita && it.quita.length) ? it.quita : [];
    const extras = (c && c.extras && c.extras.length) ? c.extras : [];
    cerrarSheet();
    lockScroll();
    const selSin = new Set();
    const selExtra = new Set();
    let qty = 1;
    const extrasSum = () => [...selExtra].reduce((s, id) => { const x = extras.find((e) => e.id === id); return s + (x ? x.precio : 0); }, 0);
    const wrap = document.createElement('div');
    wrap.className = 'sheet-wrap';
    wrap.innerHTML =
      '<div class="sheet-scrim" data-cerrar></div>' +
      '<div class="sheet" role="dialog" aria-modal="true" aria-label="Personalizar ' + esc(it.nombre) + '">' +
        '<button class="sheet__close" type="button" data-cerrar aria-label="Cerrar">×</button>' +
        '<p class="sheet__eyebrow">' + esc(c.nombre) + '</p>' +
        '<h3 class="sheet__title">' + esc(it.nombre) + '</h3>' +
        (it.desc ? '<p class="sheet__desc">' + esc(it.desc) + '</p>' : '') +
        (extras.length ?
          '<div class="sheet__extras"><p class="sheet__lbl">¿Algo extra?</p><div class="chips">' +
            extras.map((e) => '<button class="chip chip--add" type="button" data-extra="' + e.id + '">+ ' + esc(e.nombre) + ' <span class="chip__price">+' + peso(e.precio) + '</span></button>').join('') +
          '</div></div>' : '') +
        (quita.length ?
          '<div class="sheet__quita"><p class="sheet__lbl">¿Le quitamos algo? <small>toca para quitar</small></p><div class="chips">' +
            quita.map((q) => '<button class="chip" type="button" data-sin="' + esc(q) + '">sin ' + esc(q) + '</button>').join('') +
          '</div></div>' : '') +
        '<label class="sheet__nota"><span class="sheet__lbl">Otra indicación <small>(opcional)</small></span>' +
          '<input type="text" id="c-nota" placeholder="Ej: bien dorada, extra queso" /></label>' +
        '<div class="sheet__foot">' +
          '<div class="qtl"><button class="qtl__b" type="button" data-c="-1" aria-label="Menos">−</button>' +
            '<span class="qtl__n" id="c-qty">1</span>' +
            '<button class="qtl__b" type="button" data-c="1" aria-label="Más">+</button></div>' +
          '<button class="btn btn--red sheet__add" type="button" id="c-add">Agregar · <span id="c-total">' + peso(it.precio) + '</span></button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap);
    sheetEl = wrap;
    const qEl = wrap.querySelector('#c-qty'); const tEl = wrap.querySelector('#c-total');
    const refresh = () => { qEl.textContent = qty; tEl.textContent = peso((it.precio + extrasSum()) * qty); };
    wrap.addEventListener('click', (e) => {
      if (e.target.closest('[data-cerrar]')) { cerrarSheet(); return; }
      const cc = e.target.closest('[data-c]'); if (cc) { qty = Math.max(1, qty + (+cc.getAttribute('data-c'))); refresh(); return; }
      const ex = e.target.closest('[data-extra]');
      if (ex) { const v = ex.getAttribute('data-extra'); if (selExtra.has(v)) { selExtra.delete(v); ex.classList.remove('is-on'); } else { selExtra.add(v); ex.classList.add('is-on'); } refresh(); return; }
      const chip = e.target.closest('[data-sin]');
      if (chip) { const v = chip.getAttribute('data-sin'); if (selSin.has(v)) { selSin.delete(v); chip.classList.remove('is-on'); } else { selSin.add(v); chip.classList.add('is-on'); } return; }
      if (e.target.closest('#c-add')) {
        const cons = [...selExtra].map((id) => { const x = extras.find((e) => e.id === id); return 'con ' + (x ? x.nombre.toLowerCase() : id); });
        const sins = [...selSin].map((s) => 'sin ' + s);
        const free = (wrap.querySelector('#c-nota').value || '').trim();
        const nota = cons.concat(sins).concat(free ? [free] : []).join(', ');
        BurgerHouse.cart.add({ categoriaId: catId, categoriaNombre: c.nombre, itemId: itemId, nombre: it.nombre, precio: it.precio + extrasSum(), cantidad: qty, nota: nota });
        cerrarSheet();
        pulsoFab();
      }
    });
    wrap.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); cerrarSheet(); } });
    setTimeout(() => { const cl = wrap.querySelector('.sheet__close'); if (cl) cl.focus(); }, 30);
  }
  function cerrarSheet() {
    if (!sheetEl) return;
    sheetEl.remove(); sheetEl = null;
    if (!$('#orden').classList.contains('is-open')) unlockScroll();
  }

  /* ============================================================
     Botón flotante + nav
     ============================================================ */
  function actualizaFab() {
    const count = BurgerHouse.cart.count();
    const fabTxt = $('#fab-txt');
    if (fabTxt) fabTxt.textContent = count > 0 ? ('Ver pedido · ' + peso(BurgerHouse.cart.total())) : 'Arma tu pedido';
    const fab = $('#fab');
    if (fab) fab.classList.toggle('fab--has', count > 0);
    // insignia de cantidad en el fab
    let n = $('#fab .fab__n');
    if (count > 0) {
      if (!n) { n = document.createElement('span'); n.className = 'fab__n'; fab.appendChild(n); }
      n.textContent = count;
    } else if (n) { n.remove(); }
    // nav
    const navCart = $('#nav-cart'); const navOrd = $('#nav-ordenar');
    if (navCart) { navCart.hidden = count === 0; const nn = $('#nav-cart-n'); if (nn) nn.textContent = count; }
    if (navOrd) navOrd.style.display = count > 0 ? 'none' : '';
  }
  function pulsoFab() {
    const fab = $('#fab');
    if (!fab) return;
    fab.classList.remove('is-pulse'); void fab.offsetWidth; fab.classList.add('is-pulse');
  }
  function abrirDesdeFab() { abrirOrden(BurgerHouse.cart.count() > 0 ? 'resumen' : 'categorias'); }

  /* ---------- Hero: palabra que rota ---------- */
  function initHeroRotator() {
    const el = $('#hero-rot');
    if (!el) return;
    const palabras = ['una burger', 'unas papas', 'una pizza'];
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let i = 0;
    setInterval(() => {
      el.classList.add('is-out');
      setTimeout(() => { i = (i + 1) % palabras.length; el.textContent = palabras[i]; el.classList.remove('is-out'); }, 300);
    }, 2600);
  }

  /* ---------- header sólido al hacer scroll ---------- */
  function initHeader() {
    const header = $('#masthead'); const hero = $('.hero');
    if (!header) return;
    const onScroll = () => { const lim = hero ? hero.offsetHeight - 80 : 60; header.classList.toggle('is-scrolled', window.scrollY > lim); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll); onScroll();
  }

  /* ---------- eventos (paquetes) ---------- */
  function renderEventos() {
    const cont = $('#eventos-grid');
    if (!cont) return;
    cont.innerHTML = BurgerHouse.EVENTOS.map((p) =>
      '<article class="paquete">' +
        '<div class="paquete__info"><div class="paquete__top">' +
          '<span class="paquete__nombre">Paquete ' + esc(p.nombre) + '<small>' + p.personas + ' personas</small></span>' +
          '<span class="paquete__precio">' + num(p.precio) + '</span></div>' +
          '<div class="paquete__incluye">' + p.incluye.map((x) => '<span>' + esc(x) + '</span>').join('') + '</div></div>' +
        '<div class="paquete__cta">' + (p.destacado ? '<span class="paquete__badge">' + esc(p.destacado) + '</span> ' : '') +
          '<button class="link" type="button" data-evento="' + esc(p.nombre) + '">Cotizar por WhatsApp <span aria-hidden="true">→</span></button></div>' +
      '</article>'
    ).join('');
    cont.addEventListener('click', (e) => { const b = e.target.closest('[data-evento]'); if (b) BurgerHouse.whatsapp.cotizarEvento(b.getAttribute('data-evento')); });
  }

  /* ---------- focus trap ---------- */
  function trapFocus(container) {
    container.onkeydown = (e) => {
      if (e.key === 'Escape') { cerrarOrden(); return; }
      if (e.key !== 'Tab') return;
      const foc = container.querySelectorAll('button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!foc.length) return;
      const first = foc[0], last = foc[foc.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
  }

  /* ---------- init ---------- */
  function init() {
    renderAntojo();
    renderMenu();
    renderEventos();
    bindOrden();
    initHeroRotator();
    initHeader();

    // "Añadir" en la carta de la página → personalizable abre la hoja; simple agrega directo
    $('#menu-cats').addEventListener('click', (e) => {
      const b = e.target.closest('[data-add]');
      if (!b) return;
      const [c, i] = b.getAttribute('data-add').split(':');
      const it = item(c, i);
      if (!it) return;
      if (esPersonalizable(c, i)) { abrirCustom(c, i); return; }
      BurgerHouse.cart.add({ categoriaId: c, categoriaNombre: cat(c).nombre, itemId: i, nombre: it.nombre, precio: it.precio, cantidad: 1, nota: '' });
      pulsoFab();
    });

    // Chips del hero / tarjetas de antojo → abren el flujo guiado en esa categoría
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-cat-abrir]');
      if (b) abrirOrden('items', b.getAttribute('data-cat-abrir'));
    });

    // Cambios del carrito → refrescar todo lo visible
    BurgerHouse.cart.onChange(() => {
      refreshAddCounts();
      actualizaFab();
      if ($('#orden').classList.contains('is-open') && !mostrandoExito) {
        if (vista === 'items') { refreshItemCtrls(); renderFootOrden(); }
        else if (vista === 'resumen') { renderResumen(); renderFootOrden(); }
        else renderFootOrden();
      }
    });

    // Aperturas
    $('#fab').addEventListener('click', abrirDesdeFab);
    document.querySelectorAll('[data-abrir-orden]').forEach((b) => b.addEventListener('click', () => abrirOrden('categorias')));
    const navOrd = $('#nav-ordenar'); if (navOrd) navOrd.addEventListener('click', () => abrirOrden('categorias'));
    const navCart = $('#nav-cart'); if (navCart) navCart.addEventListener('click', () => abrirOrden('resumen'));

    document.querySelectorAll('[data-scroll]').forEach((a) =>
      a.addEventListener('click', (e) => { e.preventDefault(); const t = document.querySelector(a.getAttribute('data-scroll')); if (t) t.scrollIntoView({ behavior: 'smooth' }); }));

    actualizaFab();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  return { abrirOrden, cerrarOrden };
})();
