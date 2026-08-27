# Burger House · Guaymas 🍔

Menú interactivo para **Burger House** (Guaymas, Sonora). El cliente arma su pedido con
todo el detalle —quitar ingredientes, extras, término de la carne, notas— y llega como
comanda estructurada por **WhatsApp**, lista para quien la toma.

Sitio estático (HTML + CSS + JS, sin build ni dependencias). Se publica tal cual en
**GitHub Pages**. Mobile-first.

El sistema visual está gobernado por [`brand-profile-burger-house.md`](brand-profile-burger-house.md)
— léelo antes de cambiar colores, tipografía o formas.

## Estructura

```
Burger House/
├─ index.html                      # Página + capas (hoja de personalización, pedido)
├─ brand-profile-burger-house.md   # ⭐ Sistema visual: color, tipografía, guardarraíles
├─ css/
│  └─ styles.css                   # Tokens + componentes (Archivo Black + Archivo)
├─ js/
│  ├─ data.js                      # ⭐ Menú, modificadores, precios y datos (edita AQUÍ)
│  ├─ cart.js                      # Estado del carrito + persistencia
│  ├─ whatsapp.js                  # Arma la comanda, horario y apertura de wa.me
│  └─ ui.js                        # Menú, personalización, resumen, barra
├─ Media/                          # Fotos + _originales
├─ .nojekyll                       # Para que GitHub Pages sirva los archivos tal cual
└─ README.md
```

## Cómo verlo en local

```bash
python -m http.server 8000
```

Y abre <http://localhost:8000>. (O usa **Live Server** de VS Code.)

## Cómo editar el menú

Todo vive en [`js/data.js`](js/data.js). No hay que tocar la interfaz.

### Agregar un platillo

```js
{ id: 'nuevo-item', nombre: 'Nombre', precio: 150, desc: 'Descripción corta.' }
```

El `id` debe ser único y estable: es la llave del carrito.

### Modificadores

Cada platillo acepta `mods`, y cada categoría acepta grupos en `MODS_CAT` que aplican
a todos sus items. Tres tipos:

| Tipo | Control | Uso |
|---|---|---|
| `quitar` | Casillas | Ingredientes removibles → "SIN cebolla" |
| `agregar` | Casillas con precio | Extras que suman al total |
| `elegir` | Radios | Opciones excluyentes (con `min: 1` es obligatorio) |

Una opción con `max: 3` muestra un contador (ej. carne extra ×3).

### Fotos de producto

Pon la ruta en `img` del platillo. Si falta o falla al cargar, se dibuja un placeholder
tipográfico con la inicial — se ve intencional, no roto.

**Tamaño recomendado:** 144×144 px, WebP o JPG, menos de 20 KB.

### Horario

`config.horario` define días y horas. El sitio valida contra la hora real: fuera de
horario avisa que está cerrado y deja armar el pedido de todos modos.

## Cómo funciona el pedido

1. El cliente arma su pedido; el estado vive en `cart.js` (única fuente de verdad).
2. Se guarda en `localStorage` y **caduca a las 4 horas** (`config.carritoHoras`).
   Al volver, la página avisa qué se restauró y ofrece descartarlo.
3. `whatsapp.js` arma la comanda desde el estado —nunca del DOM— con folio (`BH-XXXX`),
   desglose por línea y totales.
4. Si el navegador bloquea la ventana de WhatsApp, se muestra el enlace manual y un
   botón de copiar, en vez de asumir que se envió.

## Pendientes antes de abrir al público

- [ ] **WhatsApp:** hoy usa el número de pruebas `526221720186`. Cambiar en
      [`js/data.js`](js/data.js) por el del negocio antes de publicarlo a clientes.
- [ ] **Fotos por producto:** el sistema ya las acepta; es lo que más levantaría el menú.
- [ ] **Bebidas:** confirmar precios con el negocio.
- [ ] **Modificadores:** revisar precios de extras (queso $15, tocino $20, aguacate $25…).

## Despliegue (GitHub Pages)

Ya está configurado: cada push a `main` actualiza <https://arturomillan19.github.io/Burger-House/>.

Al cambiar CSS o JS, sube el número de versión en las rutas de `index.html`
(`?v=25` → `?v=26`) para que los navegadores no sirvan la versión vieja en caché.

---

Hecho con 🍔 en Guaymas, Sonora.
