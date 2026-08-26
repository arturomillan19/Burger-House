/* Burger House — UI: carta editorial de una sola pantalla + carrito drawer.
   Sin frameworks: DOM directo, patrón módulo. Mobile-first.
   Flujo: explorar la carta → "Añadir" agrega al pedido → el drawer gestiona
   cantidades, notas, entrega y nombre → se manda la comanda por WhatsApp. */
window.BurgerHouse = window.BurgerHouse || {};

BurgerHouse.ui = (function () {
  'use strict';

  const peso = (n) => '$' + n.toLocaleString('es-MX');
  const num = (n) => n.toLocaleString('es-MX');
  const $ = (s, c) => (c || document).querySelector(s);
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  let scrollY = 0;
  let footBuilt = false;
  let mostrandoExito = false;

  const notaPH = { burgers: 'Ej: término medio, sin cebolla', pizzas: 'Ej: mitad y mitad, extra queso', entradas: 'Ej: aderezo aparte', bebidas: 'Ej: sin hielo' };

  /* Categorías de la carta = MENU + Bebidas como una banda más. */
  function categorias() {
    return BurgerHouse.MENU.concat([{ id: 'bebidas', nombre: 'Bebidas', desc: 'Para acompañar.', items: BurgerHouse.BEBIDAS }]);
  }
  function buscaItem(catId, itemId) {
    const cat = categorias().find((c) => c.id === catId);
    return cat ? cat.items.find((i) => i.id === itemId) : null;
  }
  function nombreCat(catId) { const c = categorias().find((x) => x.id === catId); return c ? c.nombre : catId; }

  /* ---------- bloqueo de scroll ---------- */
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
     1 · Carta (render una vez; los controles se refrescan)
     ============================================================ */
  function mrowHTML(cat, it) {
    const key = cat.id + ':' + it.id;
    return '<article class="mrow reveal">' +
      '<div class="mrow__body">' +
        '<div class="mrow__top">' +
          '<span class="mrow__name">' + esc(it.nombre) + '</span>' +
          '<span class="mrow__dots" aria-hidden="true"></span>' +
          '<span class="mrow__price">' + num(it.precio) + '</span>' +
        '</div>' +
        (it.desc ? '<p class="mrow__desc">' + esc(it.desc) + '</p>' : '') +
      '</div>' +
      '<div class="mrow__act">' +
        '<button class="add" type="button" data-add="' + key + '" aria-label="Añadir ' + esc(it.nombre) + '">' +
          '<span class="add__plus" aria-hidden="true">+</span><span class="add__txt">Añadir</span>' +
          '<span class="add__count" data-add-count="' + key + '" hidden></span>' +
        '</button>' +
      '</div>' +
    '</article>';
  }

  function renderMenu() {
    const cont = $('#menu-cats');
    if (!cont) return;
    cont.innerHTML = categorias().map((cat) => {
      const precios = cat.items.map((i) => i.precio);
      const desde = Math.min.apply(null, precios);
      const meta = cat.items.length + ' opciones · desde ' + peso(desde);
      return '<section class="cat reveal" id="cat-' + cat.id + '">' +
        '<div class="cat__head">' +
          '<h3 class="cat__name">' + esc(cat.nombre) + '</h3>' +
          '<span class="cat__meta muted">' + meta + '</span>' +
        '</div>' +
        (cat.desc ? '<p class="cat__desc">' + esc(cat.desc) + '</p>' : '') +
        '<div class="cat__rule"></div>' +
        cat.items.map((it) => mrowHTML(cat, it)).join('') +
      '</section>';
    }).join('');
  }
  // pequeño CSS inline para el head de categoría (nombre + meta a los lados)
  // (definido aquí para no depender de reglas extra en el CSS)

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
     2 · Drawer del pedido
     ============================================================ */
  function abrirDrawer() {
    mostrandoExito = false;
    footBuilt = false;
    renderDrawerBody();
    renderDrawerFoot();
    $('#scrim').classList.add('is-open');
    $('#scrim').setAttribute('aria-hidden', 'false');
    const d = $('#drawer');
    d.classList.add('is-open');
    d.setAttribute('aria-hidden', 'false');
    lockScroll();
    $('#drawer-close').focus();
    trapFocus(d);
  }
  function cerrarDrawer() {
    $('#scrim').classList.remove('is-open');
    $('#scrim').setAttribute('aria-hidden', 'true');
    const d = $('#drawer');
    d.classList.remove('is-open');
    d.setAttribute('aria-hidden', 'true');
    unlockScroll();
    actualizaCartbar();
  }

  function renderDrawerBody() {
    if (mostrandoExito) return;
    const body = $('#drawer-body');
    const lineas = BurgerHouse.cart.lineas;
    const cnt = $('#drawer-count');
    if (cnt) cnt.textContent = lineas.length ? '· ' + BurgerHouse.cart.count() + ' art.' : '';

    if (!lineas.length) {
      body.innerHTML = '<div class="drawer__vacio">' +
        '<svg viewBox="0 0 32 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 9.5C3.5 4.8 9 2.5 16 2.5S28.5 4.8 28.5 9.5Z"/><path d="M4 13h24"/><path d="M4.5 16.5h23c0 3-4.6 5-11.5 5s-11.5-2-11.5-5Z"/></svg>' +
        '<p>Tu pedido está vacío.<br>Agrega algo de la carta 🍔</p></div>';
      return;
    }
    body.innerHTML = lineas.map((l, idx) => {
      const sub = l.regalo ? 'Gratis' : peso(l.precio * l.cantidad);
      const notaBlock = l.regalo ? '' :
        (l.nota
          ? '<div class="li__nota"><input type="text" value="' + esc(l.nota) + '" data-nota-input="' + idx + '" placeholder="' + (notaPH[l.categoriaId] || 'Nota') + '" /></div>'
          : '<button class="li__nota-toggle" type="button" data-nota-open="' + idx + '">+ Agregar nota</button>');
      return '<div class="li' + (l.regalo ? ' li--regalo' : '') + '">' +
        '<div class="li__top"><span class="li__nombre">' + esc(l.nombre) + '</span><span class="li__precio">' + sub + '</span></div>' +
        (l.regalo ? '<div class="li__row"><span class="muted" style="font-size:.86rem">Cortesía 🎉</span></div>' :
          '<div class="li__row">' +
            '<div class="qtl qtl--sm"><button class="qtl__b" type="button" data-qty="-1" data-idx="' + idx + '" aria-label="Menos">−</button>' +
            '<span class="qtl__n">' + l.cantidad + '</span>' +
            '<button class="qtl__b" type="button" data-qty="1" data-idx="' + idx + '" aria-label="Más">+</button></div>' +
            '<button class="li__quitar" type="button" data-remove="' + idx + '">Quitar</button>' +
          '</div>' + notaBlock) +
      '</div>';
    }).join('');
  }

  function renderDrawerFoot() {
    const foot = $('#drawer-foot');
    if (mostrandoExito) return;
    if (!BurgerHouse.cart.count()) { foot.innerHTML = ''; footBuilt = false; return; }
    foot.innerHTML =
      '<div class="nudge" id="drawer-nudge" hidden></div>' +
      '<div class="entrega" role="radiogroup" aria-label="Entrega">' +
        '<label class="entrega__op"><input type="radio" name="entrega" value="recoger" checked> Recojo</label>' +
        '<label class="entrega__op"><input type="radio" name="entrega" value="domicilio"> A domicilio</label>' +
      '</div>' +
      '<div class="campo" id="campo-dir" hidden><input type="text" id="f-direccion" placeholder="Dirección de entrega" /></div>' +
      '<div class="campo"><input type="text" id="f-nombre" placeholder="¿A nombre de quién?" autocomplete="name" /></div>' +
      '<div class="totline"><span>Total</span><b id="drawer-total">' + num(BurgerHouse.cart.total()) + '</b></div>' +
      '<button class="btn btn--red btn-enviar" type="button" id="f-enviar">Enviar por WhatsApp</button>';
    footBuilt = true;
    updateNudge();
    syncEntrega();
  }

  // Respaldo de :has() para navegadores viejos: resalta la opción de entrega elegida.
  function syncEntrega() {
    document.querySelectorAll('.entrega__op').forEach((op) => {
      const r = op.querySelector('input');
      op.classList.toggle('is-sel', !!(r && r.checked));
    });
  }

  function updateFootDynamic() {
    if (mostrandoExito) return;
    const count = BurgerHouse.cart.count();
    if (count === 0) { $('#drawer-foot').innerHTML = ''; footBuilt = false; return; }
    if (!footBuilt) { renderDrawerFoot(); return; }
    const t = $('#drawer-total'); if (t) t.textContent = num(BurgerHouse.cart.total());
    updateNudge();
  }

  function updateNudge() {
    const el = $('#drawer-nudge');
    if (!el) return;
    const promo = BurgerHouse.config.promo;
    if (!promo) { el.hidden = true; return; }
    const falta = BurgerHouse.cart.faltaParaPromo();
    el.hidden = false;
    el.innerHTML = falta > 0
      ? 'Te faltan <b>' + peso(falta) + '</b> para tu <b>' + esc(promo.regalo.nombre.replace(' — cortesía', '')) + ' gratis</b>'
      : '¡Llevas tu <b>cortesía</b>! 🎉';
  }

  /* eventos del drawer (delegados) */
  function bindDrawer() {
    const d = $('#drawer');
    d.addEventListener('click', (e) => {
      const q = e.target.closest('[data-qty]');
      if (q) { const idx = +q.getAttribute('data-idx'); const l = BurgerHouse.cart.lineas[idx]; if (l) BurgerHouse.cart.updateCantidad(idx, l.cantidad + (+q.getAttribute('data-qty'))); return; }
      const rm = e.target.closest('[data-remove]');
      if (rm) { BurgerHouse.cart.remove(+rm.getAttribute('data-remove')); return; }
      const no = e.target.closest('[data-nota-open]');
      if (no) {
        const idx = no.getAttribute('data-nota-open');
        const wrap = document.createElement('div'); wrap.className = 'li__nota';
        wrap.innerHTML = '<input type="text" data-nota-input="' + idx + '" placeholder="' + (notaPH[(BurgerHouse.cart.lineas[+idx] || {}).categoriaId] || 'Nota') + '" />';
        no.replaceWith(wrap); wrap.querySelector('input').focus();
        return;
      }
      const env = e.target.closest('#f-enviar');
      if (env) { enviar(); return; }
    });
    d.addEventListener('change', (e) => {
      if (e.target.name === 'entrega') {
        const dir = $('#campo-dir'); if (dir) { dir.hidden = e.target.value !== 'domicilio'; if (!dir.hidden) $('#f-direccion').focus(); }
        syncEntrega();
      }
      const ni = e.target.closest('[data-nota-input]');
      if (ni) BurgerHouse.cart.updateNota(+ni.getAttribute('data-nota-input'), ni.value);
    });
    d.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.matches('[data-nota-input]')) { e.preventDefault(); e.target.blur(); }
    });
  }

  function enviar() {
    const tipo = ($('#drawer input[name="entrega"]:checked') || {}).value || 'recoger';
    const direccion = (($('#f-direccion') || {}).value || '').trim();
    const nombre = (($('#f-nombre') || {}).value || '').trim();
    if (tipo === 'domicilio' && !direccion) { const el = $('#f-direccion'); el.focus(); el.classList.add('shake'); setTimeout(() => el.classList.remove('shake'), 500); return; }
    if (!nombre) { const el = $('#f-nombre'); el.focus(); el.classList.add('shake'); setTimeout(() => el.classList.remove('shake'), 500); return; }
    const entrega = { tipo, direccion, nombre };
    const url = BurgerHouse.whatsapp.urlPedido(entrega);
    if (!url) return;
    window.open(url, '_blank');
    mostrarExito(url);
  }

  function mostrarExito(url) {
    mostrandoExito = true;
    BurgerHouse.cart.clear();
    const cnt = $('#drawer-count'); if (cnt) cnt.textContent = '';
    $('#drawer-foot').innerHTML = '';
    $('#drawer-body').innerHTML =
      '<div class="exito">' +
        '<div class="exito__check" aria-hidden="true">✓</div>' +
        '<h3>¡Pedido enviado!</h3>' +
        '<p>Se abrió WhatsApp con tu pedido. Solo tócale <b>enviar</b> ahí para confirmarlo.</p>' +
        (url ? '<button class="link" type="button" id="ex-reenviar" style="justify-self:center">¿No se abrió? Reenviar <span aria-hidden="true">→</span></button>' : '') +
        '<div class="exito__acciones">' +
          '<button class="btn btn--ink" type="button" id="ex-cerrar">Listo</button>' +
        '</div>' +
      '</div>';
    if (url) $('#ex-reenviar').addEventListener('click', () => window.open(url, '_blank'));
    $('#ex-cerrar').addEventListener('click', () => { mostrandoExito = false; cerrarDrawer(); });
  }

  /* ============================================================
     3 · Cartbar flotante
     ============================================================ */
  function actualizaCartbar() {
    const bar = $('#cartbar');
    const label = $('#cartbar-label');
    const count = BurgerHouse.cart.count();
    const drawerOpen = $('#drawer').classList.contains('is-open');
    if (label) label.innerHTML = 'Ver mi pedido <span class="cartbar__sep">·</span> <span class="cartbar__total">' + peso(BurgerHouse.cart.total()) + '</span> <span class="cartbar__n">' + count + '</span>';
    const visible = count > 0 && !drawerOpen;
    bar.classList.toggle('is-visible', visible);
    bar.setAttribute('aria-hidden', visible ? 'false' : 'true');
    // Botón "Ver pedido" del nav superior (acceso siempre visible arriba)
    const navCart = $('#nav-cart');
    const navOrdenar = $('#nav-ordenar');
    if (navCart) {
      navCart.hidden = count === 0;
      const n = $('#nav-cart-n'); if (n) n.textContent = count;
    }
    if (navOrdenar) navOrdenar.style.display = count > 0 ? 'none' : '';
  }
  function pulsoCartbar() {
    const bar = $('#cartbar');
    if (!bar.classList.contains('is-visible')) return;
    bar.classList.add('is-pulse');
    setTimeout(() => bar.classList.remove('is-pulse'), 430);
  }

  /* ---------- focus trap ---------- */
  function trapFocus(container) {
    container.onkeydown = (e) => {
      if (e.key === 'Escape') { cerrarDrawer(); return; }
      if (e.key !== 'Tab') return;
      const foc = container.querySelectorAll('button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!foc.length) return;
      const first = foc[0], last = foc[foc.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
  }

  /* ---------- reveal on scroll ---------- */
  function initReveal() {
    if (!('IntersectionObserver' in window)) { document.querySelectorAll('.reveal').forEach((r) => r.classList.add('is-in')); return; }
    const io = new IntersectionObserver((ents) => {
      ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .06 });
    document.querySelectorAll('.reveal').forEach((r) => io.observe(r));
  }

  /* ---------- eventos (paquetes) ---------- */
  function renderEventos() {
    const cont = $('#eventos-grid');
    if (!cont) return;
    cont.innerHTML = BurgerHouse.EVENTOS.map((p) =>
      '<article class="paquete">' +
        '<div class="paquete__info">' +
          '<div class="paquete__top">' +
            '<span class="paquete__nombre">Paquete ' + esc(p.nombre) + '<small>' + p.personas + ' personas</small></span>' +
            '<span class="paquete__precio">' + num(p.precio) + '</span>' +
          '</div>' +
          '<div class="paquete__incluye">' + p.incluye.map((x) => '<span>' + esc(x) + '</span>').join('') + '</div>' +
        '</div>' +
        '<div class="paquete__cta">' + (p.destacado ? '<span class="paquete__badge">' + esc(p.destacado) + '</span> ' : '') +
          '<button class="link" type="button" data-evento="' + esc(p.nombre) + '">Cotizar por WhatsApp <span aria-hidden="true">→</span></button>' +
        '</div>' +
      '</article>'
    ).join('');
    cont.addEventListener('click', (e) => { const b = e.target.closest('[data-evento]'); if (b) BurgerHouse.whatsapp.cotizarEvento(b.getAttribute('data-evento')); });
  }

  /* ---------- init ---------- */
  /* ---------- header transparente → sólido al hacer scroll ---------- */
  function initHeader() {
    const header = $('.masthead');
    const hero = $('.hero');
    if (!header) return;
    function onScroll() {
      const limite = hero ? hero.offsetHeight - 80 : 60;
      header.classList.toggle('is-scrolled', window.scrollY > limite);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  function init() {
    renderMenu();
    renderEventos();
    bindDrawer();
    initReveal();
    initHeader();

    // Añadir desde la carta (delegado)
    $('#menu-cats').addEventListener('click', (e) => {
      const b = e.target.closest('[data-add]');
      if (!b) return;
      const [c, i] = b.getAttribute('data-add').split(':');
      const it = buscaItem(c, i);
      if (!it) return;
      BurgerHouse.cart.add({ categoriaId: c, categoriaNombre: nombreCat(c), itemId: i, nombre: it.nombre, precio: it.precio, cantidad: 1, nota: '' });
      pulsoCartbar();
    });

    // Cambios del carrito
    BurgerHouse.cart.onChange(() => {
      refreshAddCounts();
      actualizaCartbar();
      if ($('#drawer').classList.contains('is-open')) { renderDrawerBody(); updateFootDynamic(); }
    });

    // Abrir/cerrar drawer
    $('#cartbar-btn').addEventListener('click', abrirDrawer);
    const navCart = $('#nav-cart'); if (navCart) navCart.addEventListener('click', abrirDrawer);
    $('#drawer-close').addEventListener('click', cerrarDrawer);
    $('#scrim').addEventListener('click', cerrarDrawer);

    // Scroll suave
    document.querySelectorAll('[data-scroll]').forEach((a) =>
      a.addEventListener('click', (e) => { e.preventDefault(); const t = document.querySelector(a.getAttribute('data-scroll')); if (t) t.scrollIntoView({ behavior: 'smooth' }); }));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  return { abrirDrawer, cerrarDrawer };
})();
