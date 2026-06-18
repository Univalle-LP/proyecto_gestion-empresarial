import { NextRequest, NextResponse } from 'next/server';
import { fetchCategorias, createCategorias, modifyCategorias, deleteLogicCategorias } from '@/lib/services/products';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idStr = searchParams.get('id');
  const id = idStr ? Number(idStr) : 0;

  try {
    const result = await fetchCategorias(id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Error al obtener categoría', details: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createCategorias(body);
    return NextResponse.json({ success: true, message: 'Categoría insertada correctamente', result });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Error al insertar categoría', details: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await modifyCategorias(body);
    return NextResponse.json({ success: true, message: 'Categoría actualizada correctamente', result });
  } catch (error: any) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Error al actualizar categoría', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id_categoria } = await request.json();
    const result = await deleteLogicCategorias({ id_categoria: Number(id_categoria), activo: 0 });
    return NextResponse.json({ success: true, message: 'Categoría eliminada correctamente', result });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Error al eliminar categoría', details: error.message }, { status: 500 });
  }
}
