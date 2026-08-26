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
  dias: 'Jueves a Domingo',
  horario: 'Jue a Dom · 6:30 – 10:30 pm',
  // Imagen del menú completo que abre el botón "VER MENÚ" (opcional; deja null si no hay).
  menuImg: null,
  // Promo opcional de conversión. Deja en null para desactivarla.
  promo: null,
  // Promo maquila: descuento presentando credencial. { activa, porcentaje }
  promoMaquila: { activa: true, porcentaje: 10 },
};

/* MENU: bandas de la carta. Cada item es pedible (id estable = llave en el carrito).
   `quita`: ingredientes que se pueden remover (chips "sin ___" al personalizar).
   Deja el arreglo vacío o quítalo si el platillo no lleva nada removible. */
BurgerHouse.MENU = [
  {
    id: 'burgers',
    nombre: 'Burgers',
    desc: 'Pan brioche, carne de calidad y queso americano. Sabor de cadena, hechas como en casa.',
    img: 'Media/burgers.jpg',
    // Opciones extra que aplican a toda la categoría (se muestran al personalizar).
    extras: [
      { id: 'carne-extra', nombre: 'Carne extra', precio: 30, max: 3 },
    ],
    items: [
      { id: 'cheese-burger', nombre: 'Cheese Burger', precio: 140, desc: 'Pan brioche, aderezo, carne con queso americano.', quita: ['aderezo'] },
      { id: 'burger', nombre: 'Burger', precio: 160, desc: 'Pan brioche, aderezo, carne con queso americano, lechuga, tomate y cebolla caramelizada.', quita: ['lechuga', 'tomate', 'cebolla', 'aderezo'] },
      { id: 'bacon-burger', nombre: 'Bacon Burger', precio: 180, desc: 'Pan brioche, aderezo, carne con queso americano, lechuga, tomate, cebolla caramelizada y tocino.', quita: ['lechuga', 'tomate', 'cebolla', 'tocino', 'aderezo'] },
      { id: 'bbq-burger', nombre: 'BBQ Burger', precio: 180, desc: 'Pan brioche, BBQ, carne con queso americano, tocino y aros de cebolla.', quita: ['tocino', 'aros de cebolla'] },
      { id: 'green-burger', nombre: 'Green Burger', precio: 150, desc: 'Aderezo, carne con queso americano, tomate, cebolla caramelizada y tocino, envuelta en hojas de lechuga.', quita: ['tomate', 'cebolla', 'tocino', 'aderezo'] },
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
      { id: 'papas-especiales', nombre: 'Papas Especiales', precio: 130, desc: 'Papas fritas con cebolla caramelizada, tocino y aderezo.', quita: ['cebolla', 'tocino', 'aderezo'] },
      { id: 'papas-con-carne', nombre: 'Papas con Carne', precio: 150, desc: 'Papas fritas con cebolla caramelizada, tocino y carne molida.', quita: ['cebolla', 'tocino'] },
    ],
  },
  {
    id: 'pizzas',
    nombre: 'Pizzas',
    desc: 'Masa delgada artesanal, horneada al momento.',
    img: 'Media/pizzas.jpg',
    items: [
      { id: 'pizza-3-carnes', nombre: '3 Carnes', precio: 180, desc: 'Salsa de tomate, queso, peperoni, tocino y salchicha italiana.', quita: ['peperoni', 'tocino', 'salchicha'] },
      { id: 'pizza-doble-peperoni', nombre: 'Doble Peperoni', precio: 180, desc: 'Salsa de tomate, queso y gran cantidad de peperoni.' },
      { id: 'pizza-italiana', nombre: 'Italiana', precio: 180, desc: 'Salsa de tomate, queso, peperoni, champiñón, cebolla y pimiento.', quita: ['champiñón', 'cebolla', 'pimiento', 'peperoni'] },
      { id: 'pizza-lombarda', nombre: 'Lombarda', precio: 180, desc: 'Salsa de tomate, queso, tocino y champiñón.', quita: ['champiñón', 'tocino'] },
      { id: 'pizza-margarita', nombre: 'Margarita', precio: 180, desc: 'Salsa de tomate, queso, tomate cherry, albahaca y aceite de oliva.', quita: ['tomate cherry', 'albahaca'] },
      { id: 'pizza-hawaiana', nombre: 'Hawaiana', precio: 180, desc: 'Salsa de tomate, queso, piña y jamón.', quita: ['piña', 'jamón'] },
      { id: 'pizza-salchicha-especial', nombre: 'Salchicha Especial', precio: 180, desc: 'Salsa de tomate, queso, salchicha italiana, tocino, cebolla, champiñón y pimiento verde.', quita: ['salchicha', 'tocino', 'cebolla', 'champiñón', 'pimiento verde'] },
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
  { id: 'jamaica', nombre: 'Jamaica', precio: 35, desc: 'Agua fresca' },
];

/* Paquetes para eventos (cotización por WhatsApp). Datos de sus historias de Instagram. */
BurgerHouse.EVENTOS = [
  { id: 'basico',  nombre: 'Básico',  personas: 30,  precio: 3500, incluye: ['30 Cheese Burgers', 'Papas fritas', 'Cubiertos', 'Entrega en el lugar'] },
  { id: 'mediano', nombre: 'Mediano', personas: 50,  precio: 5000, incluye: ['50 Cheese Burgers', 'Papas fritas', 'Cubiertos', 'Entrega en el lugar'], destacado: 'El más pedido' },
  { id: 'grande',  nombre: 'Grande',  personas: 100, precio: 9000, incluye: ['100 Cheese Burgers', 'Papas fritas', 'Cubiertos', 'Entrega en el lugar'] },
];
