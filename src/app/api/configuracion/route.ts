import { NextResponse } from 'next/server';
import { fetchConfiguracion } from '@/lib/services/configuracion';

export async function GET() {
  try {
    const config = await fetchConfiguracion();
    return NextResponse.json(config);
  } catch (error: any) {
    console.error('Error fetching config:', error);
    return NextResponse.json({ error: 'Error al obtener la configuración' }, { status: 500 });
  }
}
