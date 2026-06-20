import { NextRequest, NextResponse } from 'next/server';
import { modifyConfiguracion } from '@/lib/services/configuracion';
import { getServerUser } from '@/lib/auth-server';
import { registrarAccion } from '@/lib/services/auditoria';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre_pizzeria, logo_url, theme_flavor, custom_colors } = body;

    if (!nombre_pizzeria || !logo_url || !theme_flavor) {
      return NextResponse.json({ error: 'Faltan datos obligatorios para actualizar la configuración' }, { status: 400 });
    }

    const user = await getServerUser(request);
    const result = await modifyConfiguracion({
      nombre_pizzeria,
      logo_url,
      theme_flavor,
      custom_colors: custom_colors || {},
    });

    // Log brand config update
    await registrarAccion({
      id_usuario: user?.id || null,
      accion: 'MODIFICAR_CONFIGURACION_MARCA',
      entidad: 'Configuracion',
      entidad_id: '1',
      detalles: { nombre_pizzeria, theme_flavor }
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

