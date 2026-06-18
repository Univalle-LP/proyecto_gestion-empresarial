import { NextRequest, NextResponse } from 'next/server';
import { fetchOfertas, createOfertas, modifyOfertas, deleteOfertas } from '@/lib/services/ofertas';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idStr = searchParams.get('id');
  const id = idStr ? Number(idStr) : 0;

  try {
    const result = await fetchOfertas(id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching offers:', error);
    return NextResponse.json({ error: 'Error al obtener ofertas', details: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const oferta = await request.json();
    const result = await createOfertas(oferta);
    return NextResponse.json({ success: true, message: 'Oferta insertada correctamente', result });
  } catch (error: any) {
    console.error('Error creating offer:', error);
    return NextResponse.json({ error: 'Error al insertar Oferta', details: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const oferta = await request.json();
    const result = await modifyOfertas(oferta);
    return NextResponse.json({ success: true, message: 'Oferta actualizada correctamente', result });
  } catch (error: any) {
    console.error('Error updating offer:', error);
    return NextResponse.json({ error: 'Error al actualizar Oferta', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id_categoria } = await request.json();
    const result = await deleteOfertas({ id_categoria, activo: 0 });
    return NextResponse.json({ success: true, message: 'Categoría eliminada correctamente', result });
  } catch (error: any) {
    console.error('Error deleting offer:', error);
    return NextResponse.json({ error: 'Error al eliminar categoría', details: error.message }, { status: 500 });
  }
}
