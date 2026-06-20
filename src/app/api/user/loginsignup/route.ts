import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '@/lib/services/signuplogin';
import { registrarAccion } from '@/lib/services/auditoria';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uuid = searchParams.get('uuid');
  const name = searchParams.get('name');

  if (!uuid || !name) {
    return NextResponse.json({ error: 'Faltan parámetros uuid o name' }, { status: 400 });
  }

  try {
    const result = await verifyUser({ uuid, name });

    // Log the user login action
    await registrarAccion({
      id_usuario: uuid,
      accion: 'LOGIN',
      entidad: 'Usuario',
      entidad_id: uuid,
      detalles: { nombre: name, method: 'Supabase' }
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error logging in user:', error);
    return NextResponse.json({ error: 'Error al iniciar sesión', details: error.message }, { status: 500 });
  }
}

