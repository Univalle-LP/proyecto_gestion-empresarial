import * as usuarioRepo from '../repositories/usuario';
import { registrarAccion } from './auditoria';

/**
 * Recupera todos los pedidos de un cliente junto con sus detalles de pizzas y productos.
 */
export const recuperarPedidosDeCliente = async (id_cliente: string) => {
  // 1. Traer todos los pedidos
  const pedidos = await usuarioRepo.getPedidosPorCliente(id_cliente);

  if (pedidos.length === 0) {
    return [];
  }

  // 2. Obtener IDs de todos los pedidos
  const pedidosIds = pedidos.map(p => Number(p.id_pedido));

  // 3. Traer detalles de todos los pedidos de golpe
  const [detallesPizzas, detallesProductos] = await Promise.all([
    usuarioRepo.getDetallesPizzasPorPedidos(pedidosIds),
    usuarioRepo.getDetallesProductosPorPedidos(pedidosIds)
  ]);

  // 4. Agrupar detalles por id_pedido
  const pizzasPorPedido = groupBy(detallesPizzas, 'id_pedido');
  const productosPorPedido = groupBy(detallesProductos, 'id_pedido');

  // 5. Armar pedidos finales
  const pedidosConDetalles = pedidos.map(pedido => ({
    ...pedido,
    pizzas: pizzasPorPedido[Number(pedido.id_pedido)] || [],
    productos: productosPorPedido[Number(pedido.id_pedido)] || []
  }));

  return pedidosConDetalles;
};

/**
 * Función para cancelar un pedido y agregar un comentario.
 */
export const cancelarPedido = async (id_pedido: number, supabase_uuid: string, comentario: string) => {
  try {
    const result = await usuarioRepo.cancelarPedidoConComentario(id_pedido, supabase_uuid, comentario);
    if (result.success) {
      // Log order cancellation by customer
      await registrarAccion({
        id_usuario: supabase_uuid,
        accion: 'CANCELAR_PEDIDO_CLIENTE',
        entidad: 'Pedido',
        entidad_id: String(id_pedido),
        detalles: { comentario }
      });
      return { success: true, message: 'Pedido cancelado con éxito' };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('Error al cancelar el pedido:', error);
    return { success: false, error: 'Error al cancelar el pedido' };
  }
};

export const crearPedidoConDetalles = async (data: {
  id_cliente: string;
  pizzas: any[];
  productos: any[];
  fecha?: string;
}) => {
  const { id_cliente, pizzas, productos } = data;

  const hayPizzas = Array.isArray(pizzas) && pizzas.length > 0;
  const hayProductos = Array.isArray(productos) && productos.length > 0;

  if (!hayPizzas && !hayProductos) {
    throw new Error('Debe seleccionar al menos una pizza o un producto');
  }

  // Calcular total
  let total = 0;
  if (hayPizzas) {
    total += pizzas.reduce((acc, pizza) => acc + (Number(pizza.precio_unitario) * Number(pizza.cantidad)), 0);
  }
  if (hayProductos) {
    total += productos.reduce((acc, producto) => acc + (Number(producto.precio_unitario) * Number(producto.cantidad)), 0);
  }

  // Crear pedido
  const pedido = await usuarioRepo.crearPedido({ id_cliente, total });

  // Insertar detalles de pizzas
  if (hayPizzas) {
    for (const pizza of pizzas) {
      await usuarioRepo.agregarDetallePizza({
        id_pedido: Number(pedido.id_pedido),
        id_pizza: Number(pizza.id_pizza),
        id_tamano: Number(pizza.id_tamano),
        cantidad: Number(pizza.cantidad),
        precio_unitario: Number(pizza.precio_unitario)
      });
    }
  }

  // Insertar detalles de productos
  if (hayProductos) {
    for (const producto of productos) {
      await usuarioRepo.agregarDetalleProducto({
        id_pedido: Number(pedido.id_pedido),
        id_producto: Number(producto.id_producto),
        cantidad: Number(producto.cantidad)
      });
    }
  }

  // Log order creation
  await registrarAccion({
    id_usuario: id_cliente,
    accion: 'CREAR_PEDIDO',
    entidad: 'Pedido',
    entidad_id: String(pedido.id_pedido),
    detalles: {
      total,
      cantidad_pizzas: pizzas?.length || 0,
      cantidad_productos: productos?.length || 0
    }
  });

  return { id_pedido: pedido.id_pedido };
};

export const obtenerPedidosDeCliente = async (id_cliente: string) => {
  return await usuarioRepo.getPedidosPorClienteBasico(id_cliente);
};


// Helper para agrupar resultados
function groupBy<T>(list: T[], key: keyof T): { [key: string]: T[] } {
  return list.reduce((acc: { [key: string]: T[] }, item) => {
    const group = String(item[key]);
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});
}
