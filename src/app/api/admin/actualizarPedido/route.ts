import { NextRequest, NextResponse } from 'next/server';
import { actualizarEstadoPedidoAdmin } from '@/lib/services/admin';
import { getServerUser } from '@/lib/auth-server';
import { registrarAccion } from '@/lib/services/auditoria';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_pedido, nuevo_estado } = body;

    if (!id_pedido || !nuevo_estado) {
      return NextResponse.json({ error: 'Faltan datos para actualizar el pedido' }, { status: 400 });
    }

    const user = await getServerUser(request);
    const result = await actualizarEstadoPedidoAdmin(Number(id_pedido), nuevo_estado);

    // Log admin action
    await registrarAccion({
      id_usuario: user?.id || null,
      accion: 'ACTUALIZAR_PEDIDO_ADMIN',
      entidad: 'Pedido',
      entidad_id: String(id_pedido),
      detalles: { nuevo_estado, admin_email: user?.email || 'Sistema/Desconocido' }
    });

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

