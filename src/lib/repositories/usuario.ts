import { usePostgres } from '../db';

export const getPedidosPorCliente = async (id_cliente: string) => {
  const sql = usePostgres();
  return await sql`
    SELECT id_pedido, fecha, estado, total
    FROM "Pedido"
    WHERE id_cliente = ${id_cliente}
    ORDER BY fecha DESC
  `;
};

export const getDetallesPizzasPorPedidos = async (pedidosIds: number[]) => {
  if (pedidosIds.length === 0) return [];
  const sql = usePostgres();
  return await sql`
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
    WHERE pp.id_pedido IN ${sql(pedidosIds)}
  `;
};

export const getDetallesProductosPorPedidos = async (pedidosIds: number[]) => {
  if (pedidosIds.length === 0) return [];
  const sql = usePostgres();
  return await sql`
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
    WHERE pp.id_pedido IN ${sql(pedidosIds)}
  `;
};

export const cancelarPedidoConComentario = async (
  id_pedido: number,
  supabase_uuid: string,
  comentario: string
) => {
  const sql = usePostgres();

  try {
    const result = await sql`
      SELECT public.get_client_by_user(${supabase_uuid}) AS id_cliente
    `;
    const id_cliente = result[0]?.id_cliente;

    if (!id_cliente) {
      return { success: false, error: 'No se encontró un cliente con ese UUID' };
    }

    await sql`
      UPDATE "Pedido"
      SET estado = 'Cancelado por el Cliente'
      WHERE id_pedido = ${id_pedido}
    `;

    await sql`
      INSERT INTO "Comentario" (id_cliente, id_pedido, texto)
      VALUES (${id_cliente}, ${id_pedido}, ${comentario})
    `;

    return { success: true };
  } catch (error: any) {
    console.error('Error en cancelarPedidoConComentario:', error);
    return { success: false, error: 'Error al cancelar y comentar el pedido: ' + error.message };
  }
};

export const crearPedido = async ({ id_cliente, total }: { id_cliente: string; total: number }) => {
  const sql = usePostgres();
  const result = await sql`
    INSERT INTO "Pedido" (id_cliente, estado, total)
    VALUES (${id_cliente}, 'Pendiente', ${total})
    RETURNING id_pedido
  `;
  return result[0];
};

export const agregarDetallePizza = async ({
  id_pedido,
  id_pizza,
  id_tamano,
  cantidad,
  precio_unitario,
}: {
  id_pedido: number;
  id_pizza: number;
  id_tamano: number;
  cantidad: number;
  precio_unitario: number;
}) => {
  const sql = usePostgres();
  await sql`
    INSERT INTO "PedidoPizza" (id_pedido, id_pizza, id_tamano, cantidad, precio_unitario)
    VALUES (${id_pedido}, ${id_pizza}, ${id_tamano}, ${cantidad}, ${precio_unitario})
  `;
};

export const getPedidosPorClienteBasico = async (id_cliente: string) => {
  const sql = usePostgres();
  return await sql`
    SELECT * FROM "Pedido" WHERE id_cliente = ${id_cliente} ORDER BY fecha DESC
  `;
};

export const agregarDetalleProducto = async ({
  id_pedido,
  id_producto,
  cantidad,
}: {
  id_pedido: number;
  id_producto: number;
  cantidad: number;
}) => {
  const sql = usePostgres();
  await sql`
    INSERT INTO "PedidoProducto" (id_pedido, id_producto, cantidad, precio_unitario)
    VALUES (
      ${id_pedido},
      ${id_producto},
      ${cantidad},
      (SELECT precio FROM "Producto" WHERE id_producto = ${id_producto})
    )
  `;
};
