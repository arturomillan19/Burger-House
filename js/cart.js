/* Burger House — estado del carrito (una sola fuente de verdad).
   La UI se re-renderiza desde aquí vía onChange(). */
window.BurgerHouse = window.BurgerHouse || {};

BurgerHouse.cart = (function () {
  'use strict';

  /** @type {Array<{categoriaId,categoriaNombre,itemId,nombre,precio,cantidad,nota,regalo?}>} */
  let lineas = [];
  const suscriptores = [];

  function emit() {
    aplicaPromo();
    const snap = { lineas: lineas.slice(), subtotal: subtotal(), total: total(), count: count() };
    suscriptores.forEach((fn) => fn(snap));
  }

  function onChange(fn) { suscriptores.push(fn); fn({ lineas: lineas.slice(), subtotal: subtotal(), total: total(), count: count() }); }

  // Mismo item + misma nota = suma cantidad en vez de duplicar la línea.
  function mismaLinea(a, b) {
    return a.categoriaId === b.categoriaId && a.itemId === b.itemId &&
           (a.nota || '') === (b.nota || '') && !a.regalo;
  }

  function add(linea) {
    const existente = lineas.find((l) => mismaLinea(l, linea));
    if (existente) existente.cantidad += linea.cantidad;
    else lineas.push(Object.assign({ nota: '' }, linea));
    emit();
  }

  function updateCantidad(idx, cantidad) {
    if (!lineas[idx]) return;
    if (cantidad <= 0) return remove(idx);
    lineas[idx].cantidad = cantidad;
    emit();
  }

  function updateNota(idx, nota) {
    if (!lineas[idx] || lineas[idx].regalo) return;
    lineas[idx].nota = (nota || '').trim();
    emit();
  }

  function remove(idx) {
    if (lineas[idx] && lineas[idx].regalo) return; // el regalo se gestiona solo
    lineas.splice(idx, 1);
    emit();
  }

  function clear() { lineas = []; emit(); }

  // Subtotal cuenta solo lo pagado (excluye el regalo de promo).
  function subtotal() { return lineas.reduce((s, l) => s + (l.regalo ? 0 : l.precio * l.cantidad), 0); }
  function total() { return subtotal(); }
  function count() { return lineas.reduce((s, l) => s + (l.regalo ? 0 : l.cantidad), 0); }

  // Promo opcional: al cruzar el umbral se agrega el regalo; si se baja, se quita.
  // Si config.promo es null, no hace nada.
  function aplicaPromo() {
    const promo = BurgerHouse.config.promo;
    const idx = lineas.findIndex((l) => l.regalo);
    if (!promo) { if (idx !== -1) lineas.splice(idx, 1); return; }
    const califica = subtotal() >= promo.umbral;
    if (califica && idx === -1) {
      lineas.push({ categoriaId: 'promo', categoriaNombre: 'Cortesía', itemId: 'regalo',
        nombre: promo.regalo.nombre, precio: 0, cantidad: 1, nota: '', regalo: true });
    } else if (!califica && idx !== -1) {
      lineas.splice(idx, 1);
    }
  }

  // Cuánto falta para la promo (0 si ya califica o no hay promo). Lo usa el resumen para el nudge.
  function faltaParaPromo() {
    const promo = BurgerHouse.config.promo;
    if (!promo) return 0;
    const falta = promo.umbral - subtotal();
    return falta > 0 ? falta : 0;
  }

  return { onChange, add, updateCantidad, updateNota, remove, clear, subtotal, total, count, faltaParaPromo,
           get lineas() { return lineas.slice(); } };
})();
