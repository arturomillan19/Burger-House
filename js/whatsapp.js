/* Burger House — checkout por WhatsApp.
   Arma la comanda desde el ESTADO del carrito (no del DOM) y abre wa.me.

   La comanda está escrita para quien la TOMA, no para el cliente: agrupada por
   categoría, con la personalización desglosada bajo cada platillo y un folio
   corto para referirse al pedido por teléfono. */
window.BurgerHouse = window.BurgerHouse || {};

BurgerHouse.whatsapp = (function () {
  'use strict';

  const peso = (n) => '$' + n.toLocaleString('es-MX');

  // Folio corto y legible por teléfono: BH-4F2A
  function folio() {
    const s = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let r = '';
    for (let i = 0; i < 4; i++) r += s[Math.floor(Math.random() * s.length)];
    return 'BH-' + r;
  }

  // Desglose de una línea: "sin cebolla", "+ 2 carne extra", término, nota.
  function detalle(l) {
    const out = [];
    const quitados = [], agregados = [], elegidos = [];
    (l.mods || []).forEach((m) => {
      if (m.tipo === 'quitar') quitados.push(m.nombre.toLowerCase());
      else if (m.tipo === 'agregar') agregados.push((m.cantidad > 1 ? m.cantidad + '× ' : '') + m.nombre.toLowerCase());
      else elegidos.push(m.nombre.toLowerCase());
    });
    if (elegidos.length) out.push(elegidos.join(', '));
    if (quitados.length) out.push('SIN ' + quitados.join(', '));
    if (agregados.length) out.push('CON ' + agregados.join(', '));
    if (l.nota) out.push('Nota: ' + l.nota);
    return out;
  }

  // entrega: { nombre?, maquila? } — solo para recoger (sin servicio a domicilio)
  function mensajePedido(entrega) {
    const lineas = BurgerHouse.cart.lineas;
    if (!lineas.length) return null;

    const ref = entrega.folio || folio();
    const nombre = (entrega.nombre || '').trim();

    let msg = '*PEDIDO ' + ref + '* · Burger House 🍔\n';
    if (nombre) msg += 'A nombre de: *' + nombre + '*\n';
    msg += '\n';

    // Agrupar por categoría, respetando el orden de la carta.
    const orden = [];
    const porCat = {};
    lineas.forEach((l) => {
      if (!porCat[l.catNombre]) { porCat[l.catNombre] = []; orden.push(l.catNombre); }
      porCat[l.catNombre].push(l);
    });

    orden.forEach((cat) => {
      msg += '━━ ' + cat.toUpperCase() + ' ━━\n';
      porCat[cat].forEach((l) => {
        const unit = BurgerHouse.cart.precioUnit(l);
        msg += l.cantidad + '× *' + l.nombre + '*';
        msg += '   ' + peso(unit * l.cantidad) + '\n';
        detalle(l).forEach((d) => { msg += '   › ' + d + '\n'; });
      });
      msg += '\n';
    });

    const sub = BurgerHouse.cart.total();
    const pm = BurgerHouse.config.promoMaquila;
    const aplicaMaq = !!(entrega.maquila && pm && pm.activa);
    const desc = aplicaMaq ? Math.round(sub * pm.porcentaje / 100) : 0;

    msg += '─────────────\n';
    msg += 'Artículos: ' + BurgerHouse.cart.count() + '\n';
    if (aplicaMaq) {
      msg += 'Subtotal: ' + peso(sub) + '\n';
      msg += 'Desc. maquila (' + pm.porcentaje + '%): -' + peso(desc) + '\n';
    }
    msg += '*TOTAL: ' + peso(sub - desc) + '*\n\n';
    msg += '📍 Paso a recoger al local\n';
    if (aplicaMaq) msg += '🏭 Presento credencial de la planta\n';
    msg += '\n¡Gracias!';
    return msg;
  }

  function urlPedido(entrega) {
    const msg = mensajePedido(entrega);
    if (!msg) return null;
    return 'https://wa.me/' + BurgerHouse.config.whatsapp + '?text=' + encodeURIComponent(msg);
  }

  /* Abre WhatsApp. Devuelve { ok, url, msg } — si `ok` es false, la UI muestra
     el enlace manual y el botón de copiar en vez de asumir que se envió.
     El pop-up puede morir por bloqueador o por navegador embebido (Instagram). */
  function enviarPedido(entrega) {
    const msg = mensajePedido(entrega);
    if (!msg) return { ok: false, url: null, msg: null };
    const url = 'https://wa.me/' + BurgerHouse.config.whatsapp + '?text=' + encodeURIComponent(msg);
    let win = null;
    try { win = window.open(url, '_blank', 'noopener'); } catch (e) { win = null; }
    return { ok: !!win, url: url, msg: msg };
  }

  function cotizarEvento(paquete) {
    abrir('¡Hola! Quiero cotizar el *paquete ' + paquete + '* para un evento con *Burger House* 🍔');
  }

  function abrir(texto) {
    const url = 'https://wa.me/' + BurgerHouse.config.whatsapp + '?text=' + encodeURIComponent(texto);
    let win = null;
    try { win = window.open(url, '_blank', 'noopener'); } catch (e) { win = null; }
    if (!win) location.href = url;   // último recurso: navegar en la misma pestaña
  }

  /* ¿Está abierto ahora? Lo usa la UI para avisar sin bloquear el pedido. */
  function estadoHorario(ahora) {
    const h = BurgerHouse.config.horario;
    if (!h) return { abierto: true };
    const d = ahora || new Date();
    const min = d.getHours() * 60 + d.getMinutes();
    const [ah, am] = h.abre.split(':').map(Number);
    const [ch, cm] = h.cierra.split(':').map(Number);
    const abierto = h.dias.indexOf(d.getDay()) !== -1 && min >= ah * 60 + am && min < ch * 60 + cm;
    return { abierto: abierto, texto: h.texto, proximo: proximoDia(d, h) };
  }

  const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  // "18:30" → "6:30 pm" — la gente lee el horario en 12 horas, no en 24.
  function doce(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    const suf = h >= 12 ? 'pm' : 'am';
    const h12 = h % 12 || 12;
    return h12 + (m ? ':' + String(m).padStart(2, '0') : '') + ' ' + suf;
  }
  function proximoDia(d, h) {
    for (let i = 0; i <= 7; i++) {
      const dia = (d.getDay() + i) % 7;
      if (h.dias.indexOf(dia) === -1) continue;
      const min = d.getHours() * 60 + d.getMinutes();
      const [ah, am] = h.abre.split(':').map(Number);
      if (i === 0 && min >= ah * 60 + am) continue;   // hoy ya pasó la hora de abrir
      const cuando = i === 0 ? 'hoy' : (i === 1 ? 'mañana' : 'el ' + DIAS[dia]);
      return cuando + ' a las ' + doce(h.abre);
    }
    return null;
  }

  return { enviarPedido, urlPedido, cotizarEvento, mensajePedido, estadoHorario, folio };
})();
