import { NextRequest, NextResponse } from 'next/server';
import { fetchIngrediente, createIngrediente, modifyIngrediente, deleteIngrediente } from '@/lib/services/products';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idStr = searchParams.get('id');
  const id = idStr ? Number(idStr) : 0;

  try {
    const result = await fetchIngrediente(id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching ingredients:', error);
    return NextResponse.json({ error: 'Error al obtener ingrediente', details: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createIngrediente(body);
    return NextResponse.json({ success: true, message: 'Ingrediente insertado correctamente', result });
  } catch (error: any) {
    console.error('Error creating ingredient:', error);
    return NextResponse.json({ error: 'Error al insertar ingrediente', details: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await modifyIngrediente(body);
    return NextResponse.json({ success: true, message: 'Ingrediente actualizado correctamente', result });
  } catch (error: any) {
    console.error('Error updating ingredient:', error);
    return NextResponse.json({ error: 'Error al actualizar ingrediente', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id_ingrediente } = await request.json();
    const result = await deleteIngrediente({ id_ingrediente: Number(id_ingrediente), activo: 0 });
    return NextResponse.json({ success: true, message: 'Ingrediente eliminado correctamente', result });
  } catch (error: any) {
    console.error('Error deleting ingredient:', error);
    return NextResponse.json({ error: 'Error al eliminar ingrediente', details: error.message }, { status: 500 });
  }
}
