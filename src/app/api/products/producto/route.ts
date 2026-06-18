import { NextRequest, NextResponse } from 'next/server';
import { fetchProducto, createProducto, modifyProducto, deleteProducto } from '@/lib/services/products';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idStr = searchParams.get('id');
  const id = idStr ? Number(idStr) : 0;

  try {
    const result = await fetchProducto(id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Error al obtener producto', details: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createProducto(body);
    return NextResponse.json({ success: true, message: 'Producto insertado correctamente', result });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Error al insertar producto', details: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await modifyProducto(body);
    return NextResponse.json({ success: true, message: 'Producto actualizado correctamente', result });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Error al actualizar producto', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id_producto } = await request.json();
    const result = await deleteProducto({ id_producto: Number(id_producto), activo: 0 });
    return NextResponse.json({ success: true, message: 'Producto eliminado correctamente', result });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Error al eliminar producto', details: error.message }, { status: 500 });
  }
}
