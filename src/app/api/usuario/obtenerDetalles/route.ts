import { NextRequest, NextResponse } from 'next/server';
import { recuperarPedidosDeCliente, cancelarPedido } from '@/lib/services/usuario';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_cliente, id_pedido, comentario } = body;

    // Fetch orders if only id_cliente is provided
    if (id_cliente && !id_pedido) {
      const pedidos = await recuperarPedidosDeCliente(id_cliente);
      return NextResponse.json({ success: true, pedidos });
    }

    // Cancel order if id_cliente, id_pedido, and comment are provided
    if (id_cliente && id_pedido && comentario) {
      const result = await cancelarPedido(Number(id_pedido), id_cliente, comentario);
      if (result.success) {
        return NextResponse.json({ success: true, message: result.message });
      } else {
        return NextResponse.json({ error: 'Error al cancelar el pedido', details: result.error }, { status: 500 });
      }
    }

    return NextResponse.json({ error: 'Faltan parámetros necesarios' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in api/usuario/obtenerDetalles:', error);
    return NextResponse.json({ error: 'Error interno al procesar la solicitud', details: error.message }, { status: 500 });
  }
}
