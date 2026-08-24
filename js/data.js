/* Burger House — datos del menú y configuración del negocio.
   Edita precios, platillos y datos AQUÍ; el resto del sitio se arma solo desde esto.
   Modelo: cada categoría (Entradas / Burgers / Pizzas) agrupa PRODUCTOS reales,
   y cada producto tiene su propio precio (no son variantes de una misma cosa). */
window.BurgerHouse = window.BurgerHouse || {};

BurgerHouse.config = {
  nombre: 'Burger House',
  desde: '2024',
  // NÚMERO DE PRUEBA (tuyo). Para producción, cámbialo por el del negocio: 526221720186
  whatsapp: '16232399551',            // sin '+', formato wa.me
  tel: '+16232399551',
  instagram: 'https://www.instagram.com/burgerhousegyms/',
  direccion: 'Blvd. Luis Encinas, Guaymas, Sonora',
  // CONFIRMAR con el negocio (tomado de sus historias: "abierto 6:30–10:30 pm").
  horario: 'Abierto · 6:30 pm – 10:30 pm',
  // Imagen del menú completo que abre el botón "VER MENÚ" (opcional; deja null si no hay).
  menuImg: null,
  // Promo opcional de conversión. Deja en null para desactivarla.
  // Ej: { umbral: 350, regalo: { nombre: 'Papas fritas — cortesía', precio: 0 } }
  promo: null,
};

/* MENU: bandas de la carta. Cada item es pedible (id estable = llave en el carrito). */
BurgerHouse.MENU = [
  {
    id: 'burgers',
    nombre: 'Burgers',
    desc: 'Pan brioche, carne de calidad y queso americano. Sabor de cadena, hechas como en casa.',
    img: 'Media/burgers.jpg',
    items: [
      { id: 'cheese-burger', nombre: 'Cheese Burger', precio: 140, desc: 'Pan brioche, aderezo, carne con queso americano.' },
      { id: 'burger', nombre: 'Burger', precio: 160, desc: 'Pan brioche, aderezo, carne con queso americano, lechuga, tomate y cebolla caramelizada.' },
      { id: 'bacon-burger', nombre: 'Bacon Burger', precio: 180, desc: 'Pan brioche, aderezo, carne con queso americano, lechuga, tomate, cebolla caramelizada y tocino.' },
      { id: 'bbq-burger', nombre: 'BBQ Burger', precio: 180, desc: 'Pan brioche, BBQ, carne con queso americano, tocino y aros de cebolla.' },
      { id: 'green-burger', nombre: 'Green Burger', precio: 150, desc: 'Aderezo, carne con queso americano, tomate, cebolla caramelizada y tocino, envuelta en hojas de lechuga.' },
    ],
  },
  {
    id: 'entradas',
    nombre: 'Entradas',
    desc: 'Para empezar o compartir.',
    img: 'Media/entradas.jpg',
    items: [
      { id: 'aros-cebolla', nombre: 'Aros de Cebolla', precio: 120, desc: 'Rodajas de cebolla en forma de anillo, empanizadas y fritas.' },
      { id: 'dedos-queso', nombre: 'Dedos de Queso', precio: 120, desc: 'Bastones de queso con una capa crujiente de pan molido y especias.' },
      { id: 'papas-fritas', nombre: 'Papas Fritas', precio: 80, desc: 'Bastones de papa fritos, acompañados de aderezo.' },
      { id: 'papas-especiales', nombre: 'Papas Especiales', precio: 130, desc: 'Papas fritas con cebolla caramelizada, tocino y aderezo.' },
      { id: 'papas-con-carne', nombre: 'Papas con Carne', precio: 150, desc: 'Papas fritas con cebolla caramelizada, tocino y carne molida.' },
    ],
  },
  {
    id: 'pizzas',
    nombre: 'Pizzas',
    desc: 'Masa delgada artesanal, horneada al momento.',
    img: 'Media/pizzas.jpg',
    items: [
      { id: 'pizza-3-carnes', nombre: '3 Carnes', precio: 180, desc: 'Salsa de tomate, queso, peperoni, tocino y salchicha italiana.' },
      { id: 'pizza-doble-peperoni', nombre: 'Doble Peperoni', precio: 180, desc: 'Salsa de tomate, queso y gran cantidad de peperoni.' },
      { id: 'pizza-italiana', nombre: 'Italiana', precio: 180, desc: 'Salsa de tomate, queso, peperoni, champiñón, cebolla y pimiento.' },
      { id: 'pizza-lombarda', nombre: 'Lombarda', precio: 180, desc: 'Salsa de tomate, queso, tocino y champiñón.' },
      { id: 'pizza-margarita', nombre: 'Margarita', precio: 180, desc: 'Salsa de tomate, queso, tomate cherry, albahaca y aceite de oliva.' },
    ],
  },
];

/* Paso 2 · Bebidas — PRECIOS PLACEHOLDER, confirma con el negocio. */
BurgerHouse.BEBIDAS = [
  { id: 'refresco', nombre: 'Refresco de lata', precio: 30, desc: 'Coca-Cola y sabores' },
  { id: 'agua-fresca', nombre: 'Agua fresca', precio: 35, desc: 'Del día' },
  { id: 'agua', nombre: 'Agua embotellada', precio: 20, desc: '600 ml' },
];

/* Paquetes para eventos (cotización por WhatsApp). Datos de sus historias de Instagram. */
BurgerHouse.EVENTOS = [
  { id: 'basico',  nombre: 'Básico',  personas: 30,  precio: 3500, incluye: ['30 Cheese Burgers', 'Papas fritas', 'Cubiertos', 'Entrega en el lugar'] },
  { id: 'mediano', nombre: 'Mediano', personas: 50,  precio: 5000, incluye: ['50 Cheese Burgers', 'Papas fritas', 'Cubiertos', 'Entrega en el lugar'], destacado: 'El más pedido' },
  { id: 'grande',  nombre: 'Grande',  personas: 100, precio: 9000, incluye: ['100 Cheese Burgers', 'Papas fritas', 'Cubiertos', 'Entrega en el lugar'] },
];
