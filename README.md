# Burger House · Guaymas 🍔

Landing page para **Burger House** (Guaymas, Sonora). El cliente arma su pedido desde la
carta y lo manda como comanda por **WhatsApp**, lista para la cocina.

Sitio estático (HTML + CSS + JS, sin build). Se puede publicar tal cual en **GitHub Pages**.

## Estructura

```
Burger House/
├─ index.html          # Página (landing + carrito)
├─ css/
│  └─ styles.css        # Identidad editorial (crema + rojo, Fraunces + Hanken Grotesk)
├─ js/
│  ├─ data.js           # ⭐ Menú, precios y datos del negocio (edita AQUÍ)
│  ├─ cart.js           # Estado del carrito
│  ├─ whatsapp.js       # Arma la comanda y abre wa.me
│  └─ ui.js             # Carta + carrito drawer (interfaz)
├─ Media/               # Fotos (hero, burgers, pizzas, entradas) + _originales
├─ .nojekyll            # Para que GitHub Pages sirva los archivos tal cual
└─ README.md
```

## Cómo verlo en local

Desde la carpeta del proyecto:

```bash
python -m http.server 8000
```

Y abre <http://localhost:8000> en el navegador. (O usa la extensión **Live Server** de VS Code.)

## Cómo editar el menú

Todo el contenido pedible vive en [`js/data.js`](js/data.js): categorías, platillos, precios,
bebidas, paquetes de eventos, dirección, horario y número de WhatsApp. Cambia los valores ahí
y el sitio se reconstruye solo.

## Pendientes antes de producción

- [ ] **WhatsApp:** hoy usa un número de PRUEBA (`+1 623 239 9551`). Cambiar en `js/data.js`
      por el real del negocio (`526221720186`).
- [ ] **Bebidas:** precios provisionales; confirmar con el negocio.
- [ ] **Horario y días:** confirmar (por ahora "6:30–10:30 pm").
- [ ] Fotos propias por producto (opcional).

## Despliegue (GitHub Pages)

1. Sube el repo a GitHub.
2. En **Settings → Pages**, elige la rama `main` y carpeta `/root`.
3. El sitio queda en `https://arturomillan19.github.io/<repo>/` (o un dominio propio vía `CNAME`).

---

Hecho con 🍔 en Guaymas, Sonora.
