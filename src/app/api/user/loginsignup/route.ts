import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '@/lib/services/signuplogin';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uuid = searchParams.get('uuid');
  const name = searchParams.get('name');

  if (!uuid || !name) {
    return NextResponse.json({ error: 'Faltan parámetros uuid o name' }, { status: 400 });
  }

  try {
    const result = await verifyUser({ uuid, name });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error logging in user:', error);
    return NextResponse.json({ error: 'Error al iniciar sesión', details: error.message }, { status: 500 });
  }
}
