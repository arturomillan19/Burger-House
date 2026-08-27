/* Burger House — estado del carrito (una sola fuente de verdad).
   La UI se re-renderiza desde aquí vía onChange().

   Cada línea lleva sus modificadores resueltos, para que la comanda se arme
   del estado y nunca del DOM.

   PERSISTENCIA: el pedido sobrevive una recarga, pero NUNCA en silencio —
   caduca solo a las N horas (config.carritoHoras) y la UI avisa al restaurar,
   con opción de descartar. Ver `restaurado` y `descartarRestaurado()`. */
window.BurgerHouse = window.BurgerHouse || {};

BurgerHouse.cart = (function () {
  'use strict';

  const LLAVE = 'bh.pedido.v1';

  /** @type {Array<{catId,catNombre,itemId,nombre,base,cantidad,mods,nota}>} */
  let lineas = [];
  const suscriptores = [];
  // true solo en el arranque, si se rehidrató algo. La UI lo usa para avisar.
  let restaurado = false;
  let guardadoEn = null;

  /* ---------- Precio de una línea ---------- */
  // El precio unitario es la base + la suma de modificadores con costo.
  function precioUnit(l) {
    let p = l.base;
    (l.mods || []).forEach((m) => { p += (m.precio || 0) * (m.cantidad || 1); });
    return p;
  }
  function precioLinea(l) { return precioUnit(l) * l.cantidad; }

  /* ---------- Identidad de línea ---------- */
  // Mismo item + mismos modificadores + misma nota = suma cantidad.
  // Distinta personalización = línea aparte (la cocina las prepara distinto).
  function firma(l) {
    const mods = (l.mods || []).map((m) => m.id + (m.cantidad > 1 ? 'x' + m.cantidad : '')).sort().join(',');
    return [l.catId, l.itemId, mods, (l.nota || '').trim().toLowerCase()].join('|');
  }
  function mismaLinea(a, b) { return firma(a) === firma(b); }

  /* ---------- Mutaciones ---------- */
  function add(linea) {
    const nueva = Object.assign({ cantidad: 1, mods: [], nota: '' }, linea);
    const existente = lineas.find((l) => mismaLinea(l, nueva));
    if (existente) existente.cantidad += nueva.cantidad;
    else lineas.push(nueva);
    emit();
  }

  function updateCantidad(idx, cantidad) {
    if (!lineas[idx]) return;
    if (cantidad <= 0) return remove(idx);
    lineas[idx].cantidad = Math.min(cantidad, 99);
    emit();
  }

  function updateNota(idx, nota) {
    if (!lineas[idx]) return;
    lineas[idx].nota = (nota || '').trim().slice(0, 140);
    emit();
  }

  // Reemplaza por completo la personalización de una línea (al editarla).
  function replace(idx, linea) {
    if (!lineas[idx]) return;
    const nueva = Object.assign({ cantidad: lineas[idx].cantidad, mods: [], nota: '' }, linea);
    // Si al editar queda idéntica a otra línea, se fusionan.
    const gemela = lineas.findIndex((l, i) => i !== idx && mismaLinea(l, nueva));
    if (gemela !== -1) {
      lineas[gemela].cantidad += nueva.cantidad;
      lineas.splice(idx, 1);
    } else {
      lineas[idx] = nueva;
    }
    emit();
  }

  function remove(idx) { lineas.splice(idx, 1); emit(); }
  function clear() { lineas = []; restaurado = false; emit(); }

  /* ---------- Totales ---------- */
  function subtotal() { return lineas.reduce((s, l) => s + precioLinea(l), 0); }
  function total() { return subtotal(); }
  function count() { return lineas.reduce((s, l) => s + l.cantidad, 0); }

  /* ---------- Persistencia ---------- */
  function guardar() {
    try {
      if (!lineas.length) { localStorage.removeItem(LLAVE); return; }
      localStorage.setItem(LLAVE, JSON.stringify({ t: Date.now(), lineas: lineas }));
    } catch (e) { /* modo privado o cuota llena: el pedido sigue en memoria */ }
  }

  function cargar() {
    try {
      const raw = localStorage.getItem(LLAVE);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!data || !Array.isArray(data.lineas) || !data.lineas.length) return;
      const horas = (BurgerHouse.config && BurgerHouse.config.carritoHoras) || 4;
      const edad = Date.now() - (data.t || 0);
      if (edad > horas * 3600e3) { localStorage.removeItem(LLAVE); return; }
      // Validar contra el menú actual: si un producto ya no existe o cambió de
      // precio, se descarta esa línea en vez de mandar una comanda equivocada.
      lineas = data.lineas.filter(vigente);
      restaurado = lineas.length > 0;
      guardadoEn = data.t;
    } catch (e) { /* JSON corrupto: se ignora y se empieza limpio */ }
  }

  // Una línea sigue siendo válida si su producto existe y el precio base no cambió.
  function vigente(l) {
    const cats = BurgerHouse.MENU.concat([{ id: 'bebidas', items: BurgerHouse.BEBIDAS }]);
    const c = cats.find((x) => x.id === l.catId);
    if (!c) return false;
    const it = c.items.find((i) => i.id === l.itemId);
    return !!it && it.precio === l.base;
  }

  function descartarRestaurado() { clear(); }
  function minutosDesdeGuardado() {
    if (!guardadoEn) return 0;
    return Math.max(1, Math.round((Date.now() - guardadoEn) / 60000));
  }

  /* ---------- Suscripción ---------- */
  function snapshot() {
    return { lineas: lineas.slice(), subtotal: subtotal(), total: total(), count: count(), restaurado: restaurado };
  }
  function emit() {
    guardar();
    const snap = snapshot();
    suscriptores.forEach((fn) => fn(snap));
  }
  function onChange(fn) { suscriptores.push(fn); fn(snapshot()); }
  // La UI llama esto tras avisar del pedido restaurado, para no repetir el aviso.
  function marcarAvisado() { restaurado = false; }

  cargar();

  return {
    onChange, add, updateCantidad, updateNota, replace, remove, clear,
    subtotal, total, count, precioUnit, precioLinea,
    descartarRestaurado, minutosDesdeGuardado, marcarAvisado,
    get restaurado() { return restaurado; },
    get lineas() { return lineas.slice(); },
  };
})();
