import { NextRequest, NextResponse } from 'next/server';
import { fetchTamanos, createTamanos, modifyTamanos, deleteLogicTamano } from '@/lib/services/products';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idStr = searchParams.get('id');
  const id = idStr ? Number(idStr) : 0;

  try {
    const result = await fetchTamanos(id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching sizes:', error);
    return NextResponse.json({ error: 'Error al obtener tamaño', details: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createTamanos(body);
    return NextResponse.json({ success: true, message: 'Tamaño insertado correctamente', result });
  } catch (error: any) {
    console.error('Error creating size:', error);
    return NextResponse.json({ error: 'Error al insertar tamaño', details: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await modifyTamanos(body);
    return NextResponse.json({ success: true, message: 'Tamaño actualizado correctamente', result });
  } catch (error: any) {
    console.error('Error updating size:', error);
    return NextResponse.json({ error: 'Error al actualizar tamaño', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id_tamano } = await request.json();
    const result = await deleteLogicTamano({ id_tamano: Number(id_tamano), activo: 0 });
    return NextResponse.json({ success: true, message: 'Tamaño eliminado correctamente', result });
  } catch (error: any) {
    console.error('Error deleting size:', error);
    return NextResponse.json({ error: 'Error al eliminar tamaño', details: error.message }, { status: 500 });
  }
}
