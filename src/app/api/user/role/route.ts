import { NextRequest, NextResponse } from 'next/server';
import { userRole } from '@/lib/services/signuplogin';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Falta el parámetro id' }, { status: 400 });
  }

  try {
    const role = await userRole(id);
    return NextResponse.json(role);
  } catch (error: any) {
    console.error('Error fetching role:', error);
    return NextResponse.json({ error: 'Error al obtener el rol' }, { status: 500 });
  }
}
