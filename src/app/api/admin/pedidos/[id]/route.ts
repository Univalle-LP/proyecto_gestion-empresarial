import { NextRequest, NextResponse } from 'next/server';
import { fetchPedidoPorIdAdmin } from '@/lib/services/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'ID de pedido no proporcionado' }, { status: 400 });
    }

    const pedido = await fetchPedidoPorIdAdmin(Number(id));
    if (!pedido) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, pedido });
  } catch (error: any) {
    console.error('Error fetching admin order by id:', error);
    return NextResponse.json({ error: 'Error al obtener el pedido', details: error.message }, { status: 500 });
  }
}
