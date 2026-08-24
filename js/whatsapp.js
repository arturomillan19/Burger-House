/* Burger House — checkout por WhatsApp.
   Arma la comanda desde el ESTADO del carrito (no del DOM) y abre wa.me.
   El mensaje se agrupa por categoría para que la cocina lo lea como la carta. */
window.BurgerHouse = window.BurgerHouse || {};

BurgerHouse.whatsapp = (function () {
  'use strict';

  const peso = (n) => '$' + n.toLocaleString('es-MX');

  // entrega: { tipo:'recoger'|'domicilio', direccion?, nombre? }
  function mensajePedido(entrega) {
    const lineas = BurgerHouse.cart.lineas;
    if (!lineas.length) return null;

    const nombre = (entrega.nombre || '').trim();
    let msg = '¡Hola! Quiero hacer un pedido en *Burger House* 🍔\n';
    if (nombre) msg += '*A nombre de:* ' + nombre + '\n';
    msg += '\n';

    // Agrupar por categoría, respetando el orden de la carta.
    const porCategoria = {};
    lineas.forEach((l) => { (porCategoria[l.categoriaNombre] = porCategoria[l.categoriaNombre] || []).push(l); });

    Object.keys(porCategoria).forEach((cat) => {
      msg += '*' + cat.toUpperCase() + '*\n';
      porCategoria[cat].forEach((l) => {
        let linea = '  • ' + l.cantidad + '× ' + l.nombre;
        if (!l.regalo) linea += '   ' + peso(l.precio * l.cantidad);
        else linea += '   (gratis)';
        if (l.nota) linea += '\n      ↳ ' + l.nota;
        msg += linea + '\n';
      });
      msg += '\n';
    });

    msg += '────────────\n';
    msg += '*Total:* ' + peso(BurgerHouse.cart.total()) + '\n\n';

    if (entrega.tipo === 'domicilio') {
      msg += '*Entrega:* A domicilio\n';
      msg += '*Dirección:* ' + (entrega.direccion ? entrega.direccion : '(la envío por este chat)') + '\n';
    } else {
      msg += '*Entrega:* Paso a recoger al local\n';
    }

    msg += '\n¡Gracias!';
    return msg;
  }

  function urlPedido(entrega) {
    const msg = mensajePedido(entrega);
    if (!msg) return null;
    return 'https://wa.me/' + BurgerHouse.config.whatsapp + '?text=' + encodeURIComponent(msg);
  }

  function enviarPedido(entrega) {
    const url = urlPedido(entrega);
    if (!url) return false;
    window.open(url, '_blank');
    return true;
  }

  function cotizarEvento(paquete) {
    const msg = '¡Hola! Quiero cotizar el *paquete ' + paquete + '* para un evento con *Burger House* 🍔';
    abrir(msg);
  }

  function abrir(texto) {
    window.open('https://wa.me/' + BurgerHouse.config.whatsapp + '?text=' + encodeURIComponent(texto), '_blank');
  }

  return { enviarPedido, urlPedido, cotizarEvento, mensajePedido };
})();
