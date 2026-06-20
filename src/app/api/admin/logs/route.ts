import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth-server';
import { obtenerLogs } from '@/lib/services/auditoria';
import { getRole } from '@/lib/repositories/signuplogin';

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const role = await getRole({ id: user.id });
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Prohibido: Se requiere rol de administrador' }, { status: 403 });
    }

    const logs = await obtenerLogs(200); // Fetch the last 200 log entries
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error('Error fetching logs:', error);
    return NextResponse.json({ error: 'Error al obtener logs de auditoría', details: error.message }, { status: 500 });
  }
}
