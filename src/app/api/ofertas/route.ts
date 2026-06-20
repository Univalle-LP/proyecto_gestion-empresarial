import { NextRequest, NextResponse } from 'next/server';
import { fetchOfertas, createOfertas, modifyOfertas, deleteOfertas } from '@/lib/services/ofertas';
import { getServerUser } from '@/lib/auth-server';
import { registrarAccion } from '@/lib/services/auditoria';

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
    const user = await getServerUser(request);
    const oferta = await request.json();
    const result = await createOfertas(oferta);
    
    // Log create offer
    await registrarAccion({
      id_usuario: user?.id || null,
      accion: 'CREAR_OFERTA',
      entidad: 'Oferta',
      entidad_id: String(result.id_oferta || ''),
      detalles: { nombre: oferta.nombre, tipo: oferta.tipo }
    });

    return NextResponse.json({ success: true, message: 'Oferta insertada correctamente', result });
  } catch (error: any) {
    console.error('Error creating offer:', error);
    return NextResponse.json({ error: 'Error al insertar Oferta', details: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    const oferta = await request.json();
    const result = await modifyOfertas(oferta);

    // Log update offer
    await registrarAccion({
      id_usuario: user?.id || null,
      accion: 'MODIFICAR_OFERTA',
      entidad: 'Oferta',
      entidad_id: String(oferta.id_oferta || ''),
      detalles: { nombre: oferta.nombre, tipo: oferta.tipo, activo: oferta.activo }
    });

    return NextResponse.json({ success: true, message: 'Oferta actualizada correctamente', result });
  } catch (error: any) {
    console.error('Error updating offer:', error);
    return NextResponse.json({ error: 'Error al actualizar Oferta', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    const { id_oferta } = await request.json();
    
    if (!id_oferta) {
      return NextResponse.json({ error: 'Falta el parámetro id_oferta' }, { status: 400 });
    }

    const result = await deleteOfertas({ id_oferta: Number(id_oferta), activo: 0 });

    // Log delete offer
    await registrarAccion({
      id_usuario: user?.id || null,
      accion: 'ELIMINAR_OFERTA',
      entidad: 'Oferta',
      entidad_id: String(id_oferta),
      detalles: { activo: 0 }
    });

    return NextResponse.json({ success: true, message: 'Oferta eliminada correctamente', result });
  } catch (error: any) {
    console.error('Error deleting offer:', error);
    return NextResponse.json({ error: 'Error al eliminar Oferta', details: error.message }, { status: 500 });
  }
}

