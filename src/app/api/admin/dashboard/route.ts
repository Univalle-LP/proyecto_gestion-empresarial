import { NextResponse } from 'next/server';
import { fetchDashboardData } from '@/lib/services/admin';

export async function GET() {
  try {
    const resumen = await fetchDashboardData();
    return NextResponse.json({
      success: true,
      resumen,
    });
  } catch (error: any) {
    console.error('[API] Error en dashboard:', error);
    return NextResponse.json({
      error: 'Error al recuperar el resumen del dashboard',
      details: error.message,
    }, { status: 500 });
  }
}
