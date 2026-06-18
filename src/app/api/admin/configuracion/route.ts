import { NextRequest, NextResponse } from 'next/server';
import { modifyConfiguracion } from '@/lib/services/configuracion';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre_pizzeria, logo_url, theme_flavor, custom_colors } = body;

    if (!nombre_pizzeria || !logo_url || !theme_flavor) {
      return NextResponse.json({ error: 'Faltan datos obligatorios para actualizar la configuración' }, { status: 400 });
    }

    const result = await modifyConfiguracion({
      nombre_pizzeria,
      logo_url,
      theme_flavor,
      custom_colors: custom_colors || {},
    });

    return NextResponse.json({
      success: true,
      message: 'Configuración actualizada correctamente',
      result,
    });
  } catch (error: any) {
    console.error('Error updating config:', error);
    return NextResponse.json({ error: 'Error al actualizar la configuración', details: error.message }, { status: 500 });
  }
}
