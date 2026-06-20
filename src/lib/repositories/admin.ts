import { usePostgres } from '../db';

export const actualizarEstado = async (id_pedido: number, nuevo_estado: string) => {
  const sql = usePostgres();
  const result = await sql`
    UPDATE "Pedido"
    SET estado = ${nuevo_estado}
    WHERE id_pedido = ${id_pedido}
    RETURNING *
  `;
  return result[0];
};

export const crearAdminRol = async (uuid: string) => {
  try {
    const sql = usePostgres();
    return await sql`
      SELECT public.crear_admin_rol(${uuid});
    `;
  } catch (error) {
    console.error('Error en crearAdminRol:', error);
    throw error;
  }
};

export const obtenerDatosDashboard = async () => {
  try {
    const sql = usePostgres();

    const costosIngredientes = await sql`SELECT * FROM costos_y_uso_ingredientes ORDER BY id_ingrediente`;
    const evolucionVentas = await sql`SELECT * FROM evolucion_mensual_ventas_producto ORDER BY mes, id_producto`;
    const productosMasVendidos = await sql`SELECT * FROM productos_mas_vendidos ORDER BY total_vendido DESC`;
    const ventasPorCategoria = await sql`SELECT * FROM ventas_totales_por_categoria ORDER BY id_categoria`;

    return {
      costosIngredientes,
      evolucionVentas,
      productosMasVendidos,
      ventasPorCategoria,
    };
  } catch (error: any) {
    throw new Error('Error al consultar el dashboard: ' + error.message);
  }
};

export const obtenerPedidos = async () => {
  const sql = usePostgres();
  return await sql`
    SELECT 
      p.id_pedido,
      p.fecha,
      p.estado,
      p.total,
      u.email,
      u.raw_user_meta_data ->> 'full_name' AS nombre
    FROM "Pedido" AS p
    LEFT JOIN auth.users AS u ON p.id_cliente::uuid = u.id
    ORDER BY p.fecha DESC;
  `;
};

export const obtenerPedidoPorId = async (idPedido: number) => {
  const sql = usePostgres();
  const pedido = await sql`
    SELECT 
      p.*,
      u.raw_user_meta_data ->> 'full_name' AS nombre
    FROM "Pedido" AS p
    LEFT JOIN auth.users AS u ON p.id_cliente::uuid = u.id
    WHERE p.id_pedido = ${idPedido}
  `;

  if (!pedido.length) return null;

  // Obtener pizzas del pedido
  const pizzas = await sql`
    SELECT 
      pp.id_pedido,
      pp.id_pizza, 
      pp.id_tamano, 
      pp.cantidad, 
      pp.precio_unitario,
      p.nombre, 
      p.descripcion, 
      p.precio_base
    FROM "PedidoPizza" pp
    INNER JOIN "Pizza" p ON pp.id_pizza = p.id_pizza
    WHERE pp.id_pedido = ${idPedido}
  `;

  // Obtener productos del pedido
  const productos = await sql`
    SELECT 
      pp.id_pedido,
      pp.id_producto, 
      pp.cantidad, 
      pp.precio_unitario,
      p.nombre, 
      p.descripcion, 
      p.precio
    FROM "PedidoProducto" pp
    INNER JOIN "Producto" p ON pp.id_producto = p.id_producto
    WHERE pp.id_pedido = ${idPedido}
  `;

  return {
    ...pedido[0],
    pizzas,
    productos
  };
};
