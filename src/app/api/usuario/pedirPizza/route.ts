import { NextRequest, NextResponse } from 'next/server';
import { crearPedidoConDetalles } from '@/lib/services/usuario';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_cliente, pedido, fecha } = body;

    if (!id_cliente || !pedido || pedido.length === 0) {
      return NextResponse.json({ error: 'Faltan datos del pedido' }, { status: 400 });
    }

    // Separate pizzas and products
    const pizzas = pedido
      .filter((item: any) => item.tipo === 'pizza')
      .map((pizza: any) => ({
        id_pizza: pizza.id_pizza,
        id_tamano: pizza.id_tamano,
        cantidad: pizza.cantidad,
        precio_unitario: pizza.precioUnitario,
      }));

    const productos = pedido
      .filter((item: any) => item.tipo === 'producto')
      .map((producto: any) => ({
        id_producto: producto.id_producto,
        cantidad: producto.cantidadProducto,
        precio_unitario: producto.precioUnitario,
      }));

    // Place order
    const result = await crearPedidoConDetalles({
      id_cliente,
      pizzas,
      productos,
      fecha,
    });

    return NextResponse.json({ success: true, message: 'Pedido creado correctamente', result });
  } catch (error: any) {
    console.error('Error placing order:', error);
    return NextResponse.json({ error: 'Error al crear el pedido', details: error.message }, { status: 500 });
  }
}
