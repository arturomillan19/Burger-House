# Brand Profile — Burger House
<!-- version: 0.1 · updated: 2026-08-26 · status: draft -->
<!-- Prism · Forge (extracción + derivación). Campos sin confirmar marcados (inferido — confirmar) -->

## 0. Snapshot
- **Definición**: puesto de hamburguesas y pizzas en un estacionamiento de comida en Guaymas, Sonora. El cliente arma su pedido en el sitio y llega como comanda a WhatsApp.
- **Frase**: "Sabor de cadena, hecho en casa." *(ya en uso, del sitio actual)*
- **Canales**: sitio móvil (principal) · Instagram @burgerhousegyms · WhatsApp
- **Meta de la mayoría de los visuales**: vender — pedido armado y enviado.
- **Función principal del producto**: menú interactivo que produce una comanda detallada y sin ambigüedad para quien la toma.

## 1. Esencia
- **Misión**: dar la consistencia de una cadena sin perder que alguien lo cocina a mano, aquí.
- **Personalidad**: directo, cálido, sin pretensión, confiado, familiar.
- **Arquetipo**: Everyman / El de a pie *(sombra: volverse genérico — la "casa" es lo que lo salva de ser un puesto más)*.
- **Audiencia**: familias y trabajadores de maquila en Guaymas, 20-45, piden de noche, con una mano, con hambre y prisa. Estado interno: *"quiero algo rico, rápido, sin batallar."*
- **EL sentimiento**: **antojo resuelto** — verlo, quererlo, y que pedirlo no estorbe.
- **Referencias admiradas** (dirección, nunca copia):
  - **In-N-Out** — menú corto, sin ruido, confianza en pocos productos.
  - **Apple** — restricción como lujo; el producto es el héroe; nada sobra.
  - **Roberta's Pizza** — el rojo posee secciones enteras; contraste sin gradientes.
- **La tesis**: *si el equipo de Apple hubiera hecho In-N-Out*. No es minimalismo frío ni fast-food ruidoso: es **calidez con disciplina**.

## 2. Sistema de color
Estrategia 60-30-10. El error del sitio actual es que el rojo es un detalle; aquí **posee territorio**.

- **Dominante (~60%) · Papel** `#F5F0E6` — fondo, superficies de lectura, listas de menú.
- **Secundario (~30%) · Tinta** `#1E1A17` — texto, bandas oscuras, pie de página, barra de pedido.
- **Acento (~10%) · Brasa** `#C0342A` — precio activo, CTA único, banda de sección, estado "en el pedido".
- **Neutros**: elevado `#FCF9F3` · inset `#EBE3D4` · texto secundario `#6E6358` · línea `rgba(30,26,23,.14)`
- **Modo oscuro** (el sitio se usa de noche, 6:30–10:30 pm): papel `#17130F` · tinta `#F2EBE0` · brasa `#F0705F` *(el rojo sube en luminosidad para mantener contraste sobre fondo oscuro)*
- **Armonía**: monocromática cálida con un solo acento saturado. ← La esencia es "una cosa hecha bien", no variedad. Un solo rojo es la traducción cromática del menú corto.
- **Semántica UI**: éxito `#3F6B45` · alerta `#B4700E` · error = brasa `#C0342A`
- **Contraste verificado**:
  - Tinta sobre Papel = **13.2:1** (AAA)
  - Brasa sobre Papel = **5.1:1** (AA, incluye texto normal)
  - Papel sobre Brasa = **4.9:1** (AA — válido para botón primario)
  - Brasa oscuro `#F0705F` sobre `#17130F` = **7.4:1** (AAA)

## 3. Sistema tipográfico
El sitio actual empareja Baloo 2 + Nunito: ambas redondeadas, sin contraste. Una sola voz, y esa voz es "app amigable genérica".

- **Display**: **Archivo Black** (Google Fonts) — grotesca pesada, ancha, americana. Es la voz del letrero del puesto.
- **Cuerpo**: **Archivo** 400/500/600 — misma familia, peso normal. Hermana del display: unidad sin monotonía.
- **Datos**: **Archivo** con `font-variant-numeric: tabular-nums` para que los precios aliñen en columna.
- **Razón del pairing** (← esencia): Archivo es una grotesca americana de señalética — el linaje visual del *roadside stand* de In-N-Out. Usar una sola superfamilia en dos pesos extremos (900 vs 400) es la disciplina de Apple: contraste por **peso y escala**, no por meter otra fuente. *(inferido — confirmar: si prefieres más calidez, la alternativa es cambiar el cuerpo a Public Sans y dejar Archivo Black solo para display.)*
- **Escala**: base 16px · ratio **1.250** → 12 · 14 · 16 · 20 · 25 · 31 · 39 · 49 · 61
- **Defaults**: cuerpo 1.55 · display 0.95-1.05 · tracking display `-0.03em` · línea 60-70 caracteres
- **Alineación**: izquierda siempre. Centrado solo para display de ≤4 palabras.
- **Regla de números**: todo precio en tabular-nums. Un menú donde los precios bailan se ve amateur.

## 4. Composición y layout
- **Grid**: una columna en móvil (390px base), 12 col desde 768px. Base de espaciado **4px**.
- **Escala de espacio**: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96
- **Balance**: asimétrico editorial — el peso a la izquierda, precio anclado a la derecha.
- **Foco**: en cada pantalla **una sola cosa domina**. En el menú, la foto del producto. En el resumen, el total.
- **Espacio negativo**: generoso en display, denso en listas. Un menú se escanea; un hero se contempla.
- **Movimientos firma**:
  1. **Banda de color a sangre completa** que corta la página (papel → brasa → tinta). Es lo que le falta al sitio actual.
  2. **Fila de menú**: nombre en peso 600 + descripción en secundario + precio tabular a la derecha + miniatura 72px. Sin tarjetas ni bordes; separadas por hairline.
  3. **Precio como ancla visual** — siempre a la derecha, siempre tabular, nunca dentro de un botón.
- **Ratios**: hero 3:2 · miniatura de producto 1:1 · foto de categoría 4:5 · IG 4:5

## 5. Dirección estética
- **Mezcla**: **55% señalética americana** (letrero de puesto, peso, claridad a distancia) / **30% restricción premium** (aire, jerarquía, nada sobra) / **15% calidez de casa** (papel cálido, fotografía real, sin estilizar de más).
- **Textura**: plano. Sin gradientes, sin glass, sin sombras decorativas. La profundidad viene del contraste de color y la escala.
- **Forma**: radio **6px** en todo lo interactivo. **Una excepción**: el botón primario de enviar comanda va en píldora completa. Dos formas, dos significados — hoy hay quince píldoras y ninguna significa nada.
- **Sombra**: solo una, funcional, para elevar la barra de pedido sobre el contenido. `0 -8px 24px -12px rgba(30,26,23,.35)`
- **Motion**: rápido y seco. 150-200ms, `cubic-bezier(.2,.7,.2,1)`. Nada rebota. Respeta `prefers-reduced-motion`.

## 6. Dirección de imagen
- **Medio**: fotografía real del producto. Nada de render ni stock.
- **Tratamiento**: luz cálida, fondo neutro o de madera, producto centrado, sin filtro pesado. Se ve lo que llega.
- **Sí**: producto completo y armado · manos entregando · el puesto de noche con luz encendida.
- **No**: ingredientes flotando, salpicaduras congeladas, gente sonriendo a cámara con la hamburguesa a media boca.
- **Sistema de placeholder** (mientras no haya fotos): bloque en `inset` con la inicial del producto en Archivo Black a gran escala y opacidad baja. Se ve intencional, no roto, y se reemplaza cambiando una sola ruta en `data.js`.
- **Rendimiento**: miniaturas a 144×144 (2x de 72), formato WebP con fallback JPG, `loading="lazy"` en todo **menos** el hero, `width`/`height` siempre declarados.

## 7. Logo y assets
- **Marca**: SVG propio `#bh-burger` — trazo 1.7, `currentColor`, 32×24. Ya existe y es bueno.
- **Familia pendiente**: `#bh-papas`, `#bh-pizza`, `#bh-vaso`, `#bh-bolsa` en el mismo lenguaje de trazo. Reemplazan los emojis 🍔🍟🍕🥤.
- **Nunca**: emoji del sistema operativo como icono de interfaz. Se dibuja distinto en cada teléfono, así que la identidad cambia según el dispositivo.
- **Sí en WhatsApp**: ahí los emoji son texto de chat, no interfaz. Se quedan.

## 8. Voz
- **Tono en 3 palabras**: directo, cálido, sin adorno.
- **Cómo se ve**: frases cortas. Verbos concretos ("Agregar", no "Añadir al carrito"). Precio siempre visible, nunca escondido tras un toque. El sitio nunca finge ser una app grande: dice "te contestamos por WhatsApp" porque eso es lo que pasa.
- **Ejemplos**: "Paso a recoger" ✓ · "Selecciona tu método de entrega" ✗ — "Ahorita estamos cerrados. Abrimos el jueves 6:30 pm" ✓ · "Fuera de horario de servicio" ✗

## 9. Guardarraíles — la lista de "nunca"
- Nunca más de **un acento** por composición. Si dos cosas gritan, ninguna se oye.
- Nunca **gradiente** de fondo, ni en hero ni en botón.
- Nunca **emoji como icono de UI** (sí en el mensaje de WhatsApp).
- Nunca **píldora** salvo en el botón primario de enviar.
- Nunca **texto centrado** de más de 4 palabras.
- Nunca **precio dentro del botón** — el precio es dato, el botón es acción.
- Nunca **objetivo táctil bajo 44px**. Se usa de noche, con una mano, con hambre.
- Nunca **guardar el pedido en silencio** — si se restaura, se avisa y se puede descartar.
- Nunca **sombra decorativa**. Solo la funcional de la barra de pedido.
- Nunca **dos tipografías de familias distintas**. El contraste se hace con peso.

---

## Anexo — Trazabilidad de decisiones

| Decisión visual | Viene de |
|---|---|
| Un solo rojo saturado | Menú corto de In-N-Out: pocas cosas, bien hechas |
| Una sola superfamilia en pesos extremos | Restricción de Apple: contraste por peso, no por acumular |
| Bandas de color a sangre completa | Roberta's: el acento posee territorio, no decora |
| Papel cálido en vez de blanco puro | "Hecho en casa" — el blanco puro es de laboratorio |
| Radio 6px + una píldora | Jerarquía de forma: si todo es suave, la forma no comunica |
| Precio tabular a la derecha | Menú se escanea en columna; los números deben aliñar |
| Placeholder tipográfico | Mejor un vacío intencional que una foto mala |
