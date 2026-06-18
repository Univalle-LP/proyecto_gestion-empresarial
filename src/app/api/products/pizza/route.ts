import { NextRequest, NextResponse } from 'next/server';
import { fetchPizza, createPizza, modifyPizza, deletePizza } from '@/lib/services/products';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idStr = searchParams.get('id');
  const id = idStr ? Number(idStr) : 0;

  try {
    const result = await fetchPizza(id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching pizzas:', error);
    return NextResponse.json({ error: 'Error al obtener pizza', details: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createPizza(body);
    return NextResponse.json({ success: true, message: 'Pizza insertada correctamente', result });
  } catch (error: any) {
    console.error('Error creating pizza:', error);
    return NextResponse.json({ error: 'Error al insertar pizza', details: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await modifyPizza(body);
    return NextResponse.json({ success: true, message: 'Pizza actualizada correctamente', result });
  } catch (error: any) {
    console.error('Error updating pizza:', error);
    return NextResponse.json({ error: 'Error al actualizar pizza', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id_pizza } = await request.json();
    const result = await deletePizza({ id_pizza: Number(id_pizza) });
    return NextResponse.json({ success: true, message: 'Pizza eliminada correctamente', result });
  } catch (error: any) {
    console.error('Error deleting pizza:', error);
    return NextResponse.json({ error: 'Error al eliminar pizza', details: error.message }, { status: 500 });
  }
}
