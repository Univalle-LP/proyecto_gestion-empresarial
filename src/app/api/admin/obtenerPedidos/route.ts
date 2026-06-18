import { NextResponse } from 'next/server';
import { fetchPedidosAdmin } from '@/lib/services/admin';

export async function GET() {
  try {
    const pedidos = await fetchPedidosAdmin();
    return NextResponse.json({
      success: true,
      pedidos,
    });
  } catch (error: any) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json({
      error: 'Error al recuperar los pedidos',
      details: error.message,
    }, { status: 500 });
  }
}
