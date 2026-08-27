/* Burger House — datos del menú y configuración del negocio.
   Edita precios, platillos y datos AQUÍ; el resto del sitio se arma solo desde esto.

   ── MODIFICADORES ──
   Cada item puede tener `mods`: grupos de opciones que el cliente elige al personalizar.
   Cada grupo: { id, nombre, tipo, min, max, opciones:[{id, nombre, precio}] }
     tipo 'quitar'  → checkboxes, precio 0, se listan como "sin ___" en la comanda.
     tipo 'agregar' → checkboxes con precio, se suman al total.
     tipo 'elegir'  → radios (excluyentes). min:1 lo vuelve obligatorio.
   Los grupos de categoría (`modsCat`) aplican a TODOS los items de esa categoría.

   ── IMÁGENES ──
   `img` en cada item es opcional. Si falta o no carga, se dibuja un placeholder
   tipográfico con la inicial del producto (ver ui.js). Para reemplazar: pon la
   ruta y listo — no hay que tocar nada más.
   Tamaño recomendado: 144×144 px (2x de 72), WebP o JPG, < 20 KB. */
window.BurgerHouse = window.BurgerHouse || {};

BurgerHouse.config = {
  nombre: 'Burger House',
  desde: '2024',
  // ⚠️ NÚMERO DE PRUEBAS (hermano de Javier). Antes de abrir al público,
  // cambiar por el del negocio. Sin '+', formato wa.me.
  whatsapp: '526221720186',
  instagram: 'https://www.instagram.com/burgerhousegyms/',
  direccion: 'Blvd. Luis Encinas, Guaymas, Sonora',
  ubicacion: 'Dentro del estacionamiento de comida',
  // Horario real, usado para validar si está abierto. 0=domingo … 6=sábado.
  horario: { dias: [4, 5, 6, 0], abre: '18:30', cierra: '22:30', texto: 'Jue a Dom · 6:30 – 10:30 pm' },
  // Promo maquila: descuento presentando credencial.
  promoMaquila: { activa: true, porcentaje: 10 },
  // Vigencia del pedido guardado (horas). Pasado esto se descarta solo.
  carritoHoras: 4,
};

/* Grupos de modificadores por categoría — aplican a todos los items de la categoría. */
BurgerHouse.MODS_CAT = {
  burgers: [
    {
      id: 'termino', nombre: 'Término de la carne', tipo: 'elegir', min: 1, max: 1,
      opciones: [
        { id: 'tres-cuartos', nombre: 'Tres cuartos', precio: 0, default: true },
        { id: 'medio', nombre: 'Término medio', precio: 0 },
        { id: 'bien-cocida', nombre: 'Bien cocida', precio: 0 },
      ],
    },
    {
      id: 'extras-burger', nombre: '¿Le agregamos algo?', tipo: 'agregar', max: 6,
      opciones: [
        { id: 'carne-extra', nombre: 'Carne extra', precio: 30, max: 3 },
        { id: 'queso-extra', nombre: 'Queso extra', precio: 15 },
        { id: 'tocino-extra', nombre: 'Tocino extra', precio: 20 },
        { id: 'aguacate', nombre: 'Aguacate', precio: 25 },
        { id: 'jalapenos', nombre: 'Jalapeños', precio: 10 },
        { id: 'aros-encima', nombre: 'Aros de cebolla encima', precio: 20 },
      ],
    },
  ],
  pizzas: [
    {
      id: 'extras-pizza', nombre: 'Ingredientes extra', tipo: 'agregar', max: 5,
      opciones: [
        { id: 'queso-extra-pz', nombre: 'Queso extra', precio: 25 },
        { id: 'peperoni-extra', nombre: 'Peperoni extra', precio: 25 },
        { id: 'tocino-pz', nombre: 'Tocino', precio: 25 },
        { id: 'champinon-pz', nombre: 'Champiñón', precio: 20 },
        { id: 'pina-pz', nombre: 'Piña', precio: 20 },
      ],
    },
  ],
};

/* MENU: bandas de la carta. Cada item es pedible (id estable = llave en el carrito). */
BurgerHouse.MENU = [
  {
    id: 'burgers',
    nombre: 'Burgers',
    desc: 'Pan brioche, carne de calidad y queso americano.',
    img: 'Media/burgers.jpg',
    items: [
      {
        id: 'cheese-burger', nombre: 'Cheese Burger', precio: 140,
        desc: 'Pan brioche, aderezo, carne con queso americano.',
        mods: [{ id: 'quitar-cb', nombre: '¿Le quitamos algo?', tipo: 'quitar', opciones: [
          { id: 'aderezo', nombre: 'Aderezo' },
        ] }],
      },
      {
        id: 'burger', nombre: 'Burger', precio: 160,
        desc: 'Pan brioche, aderezo, carne con queso americano, lechuga, tomate y cebolla caramelizada.',
        mods: [{ id: 'quitar-b', nombre: '¿Le quitamos algo?', tipo: 'quitar', opciones: [
          { id: 'lechuga', nombre: 'Lechuga' }, { id: 'tomate', nombre: 'Tomate' },
          { id: 'cebolla', nombre: 'Cebolla' }, { id: 'aderezo', nombre: 'Aderezo' },
        ] }],
      },
      {
        id: 'bacon-burger', nombre: 'Bacon Burger', precio: 180,
        desc: 'Pan brioche, aderezo, carne con queso americano, lechuga, tomate, cebolla caramelizada y tocino.',
        destacado: 'La favorita',
        mods: [{ id: 'quitar-bb', nombre: '¿Le quitamos algo?', tipo: 'quitar', opciones: [
          { id: 'lechuga', nombre: 'Lechuga' }, { id: 'tomate', nombre: 'Tomate' },
          { id: 'cebolla', nombre: 'Cebolla' }, { id: 'tocino', nombre: 'Tocino' },
          { id: 'aderezo', nombre: 'Aderezo' },
        ] }],
      },
      {
        id: 'bbq-burger', nombre: 'BBQ Burger', precio: 180,
        desc: 'Pan brioche, BBQ, carne con queso americano, tocino y aros de cebolla.',
        mods: [{ id: 'quitar-bbq', nombre: '¿Le quitamos algo?', tipo: 'quitar', opciones: [
          { id: 'tocino', nombre: 'Tocino' }, { id: 'aros', nombre: 'Aros de cebolla' },
          { id: 'bbq', nombre: 'Salsa BBQ' },
        ] }],
      },
      {
        id: 'green-burger', nombre: 'Green Burger', precio: 150,
        desc: 'Carne con queso americano, tomate, cebolla caramelizada y tocino, envuelta en hojas de lechuga.',
        destacado: 'Sin pan',
        mods: [{ id: 'quitar-gb', nombre: '¿Le quitamos algo?', tipo: 'quitar', opciones: [
          { id: 'tomate', nombre: 'Tomate' }, { id: 'cebolla', nombre: 'Cebolla' },
          { id: 'tocino', nombre: 'Tocino' }, { id: 'aderezo', nombre: 'Aderezo' },
        ] }],
      },
    ],
  },
  {
    id: 'entradas',
    nombre: 'Entradas',
    desc: 'Para empezar o compartir.',
    img: 'Media/entradas.jpg',
    items: [
      { id: 'aros-cebolla', nombre: 'Aros de Cebolla', precio: 120, desc: 'Rodajas de cebolla empanizadas y fritas.' },
      { id: 'dedos-queso', nombre: 'Dedos de Queso', precio: 120, desc: 'Bastones de queso con capa crujiente de pan molido y especias.' },
      { id: 'papas-fritas', nombre: 'Papas Fritas', precio: 80, desc: 'Bastones de papa fritos, con aderezo.' },
      {
        id: 'papas-especiales', nombre: 'Papas Especiales', precio: 130,
        desc: 'Papas fritas con cebolla caramelizada, tocino y aderezo.',
        mods: [{ id: 'quitar-pe', nombre: '¿Le quitamos algo?', tipo: 'quitar', opciones: [
          { id: 'cebolla', nombre: 'Cebolla' }, { id: 'tocino', nombre: 'Tocino' }, { id: 'aderezo', nombre: 'Aderezo' },
        ] }],
      },
      {
        id: 'papas-con-carne', nombre: 'Papas con Carne', precio: 150,
        desc: 'Papas fritas con cebolla caramelizada, tocino y carne molida.',
        mods: [{ id: 'quitar-pc', nombre: '¿Le quitamos algo?', tipo: 'quitar', opciones: [
          { id: 'cebolla', nombre: 'Cebolla' }, { id: 'tocino', nombre: 'Tocino' },
        ] }],
      },
    ],
  },
  {
    id: 'pizzas',
    nombre: 'Pizzas',
    desc: 'Masa delgada artesanal, horneada al momento.',
    img: 'Media/pizzas.jpg',
    items: [
      { id: 'pizza-3-carnes', nombre: '3 Carnes', precio: 180, desc: 'Salsa de tomate, queso, peperoni, tocino y salchicha italiana.',
        mods: [{ id: 'q1', nombre: '¿Le quitamos algo?', tipo: 'quitar', opciones: [
          { id: 'peperoni', nombre: 'Peperoni' }, { id: 'tocino', nombre: 'Tocino' }, { id: 'salchicha', nombre: 'Salchicha' } ] }] },
      { id: 'pizza-doble-peperoni', nombre: 'Doble Peperoni', precio: 180, desc: 'Salsa de tomate, queso y gran cantidad de peperoni.' },
      { id: 'pizza-italiana', nombre: 'Italiana', precio: 180, desc: 'Salsa de tomate, queso, peperoni, champiñón, cebolla y pimiento.',
        mods: [{ id: 'q2', nombre: '¿Le quitamos algo?', tipo: 'quitar', opciones: [
          { id: 'champinon', nombre: 'Champiñón' }, { id: 'cebolla', nombre: 'Cebolla' },
          { id: 'pimiento', nombre: 'Pimiento' }, { id: 'peperoni', nombre: 'Peperoni' } ] }] },
      { id: 'pizza-lombarda', nombre: 'Lombarda', precio: 180, desc: 'Salsa de tomate, queso, tocino y champiñón.',
        mods: [{ id: 'q3', nombre: '¿Le quitamos algo?', tipo: 'quitar', opciones: [
          { id: 'champinon', nombre: 'Champiñón' }, { id: 'tocino', nombre: 'Tocino' } ] }] },
      { id: 'pizza-margarita', nombre: 'Margarita', precio: 180, desc: 'Salsa de tomate, queso, tomate cherry, albahaca y aceite de oliva.',
        mods: [{ id: 'q4', nombre: '¿Le quitamos algo?', tipo: 'quitar', opciones: [
          { id: 'cherry', nombre: 'Tomate cherry' }, { id: 'albahaca', nombre: 'Albahaca' } ] }] },
      { id: 'pizza-hawaiana', nombre: 'Hawaiana', precio: 180, desc: 'Salsa de tomate, queso, piña y jamón.',
        mods: [{ id: 'q5', nombre: '¿Le quitamos algo?', tipo: 'quitar', opciones: [
          { id: 'pina', nombre: 'Piña' }, { id: 'jamon', nombre: 'Jamón' } ] }] },
      { id: 'pizza-salchicha-especial', nombre: 'Salchicha Especial', precio: 180, desc: 'Salsa de tomate, queso, salchicha italiana, tocino, cebolla, champiñón y pimiento verde.',
        mods: [{ id: 'q6', nombre: '¿Le quitamos algo?', tipo: 'quitar', opciones: [
          { id: 'salchicha', nombre: 'Salchicha' }, { id: 'tocino', nombre: 'Tocino' }, { id: 'cebolla', nombre: 'Cebolla' },
          { id: 'champinon', nombre: 'Champiñón' }, { id: 'pimiento', nombre: 'Pimiento verde' } ] }] },
    ],
  },
];

/* Bebidas — según el menú oficial. */
BurgerHouse.BEBIDAS = [
  { id: 'coca-cola', nombre: 'Coca Cola', precio: 35 },
  { id: 'pepsi', nombre: 'Pepsi', precio: 30 },
  { id: 'manzanita', nombre: 'Manzanita', precio: 30 },
  { id: 'naranja', nombre: 'Naranja', precio: 30 },
  { id: '7up', nombre: '7UP', precio: 30 },
  { id: 'jamaica', nombre: 'Jamaica', precio: 35, desc: 'Agua fresca',
    mods: [{ id: 'hielo', nombre: 'Hielo', tipo: 'quitar', opciones: [{ id: 'hielo', nombre: 'Hielo' }] }] },
];

/* Paquetes para eventos (cotización por WhatsApp). */
BurgerHouse.EVENTOS = [
  { id: 'basico',  nombre: 'Básico',  personas: 30,  precio: 3500, incluye: ['30 Cheese Burgers', 'Papas fritas', 'Cubiertos', 'Entrega en el lugar'] },
  { id: 'mediano', nombre: 'Mediano', personas: 50,  precio: 5000, incluye: ['50 Cheese Burgers', 'Papas fritas', 'Cubiertos', 'Entrega en el lugar'], destacado: 'El más pedido' },
  { id: 'grande',  nombre: 'Grande',  personas: 100, precio: 9000, incluye: ['100 Cheese Burgers', 'Papas fritas', 'Cubiertos', 'Entrega en el lugar'] },
];
