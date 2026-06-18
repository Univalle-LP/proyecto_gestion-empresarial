import { NextRequest, NextResponse } from 'next/server';
import { actualizarEstadoPedidoAdmin } from '@/lib/services/admin';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_pedido, nuevo_estado } = body;

    if (!id_pedido || !nuevo_estado) {
      return NextResponse.json({ error: 'Faltan datos para actualizar el pedido' }, { status: 400 });
    }

    const result = await actualizarEstadoPedidoAdmin(Number(id_pedido), nuevo_estado);

    return NextResponse.json({
      success: true,
      message: 'Estado del pedido actualizado correctamente',
      result,
    });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Error al actualizar el pedido', details: error.message }, { status: 500 });
  }
}
