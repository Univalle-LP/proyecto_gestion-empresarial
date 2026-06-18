import { NextRequest, NextResponse } from 'next/server';
import { crearAdminRolService } from '@/lib/services/admin';
import { createClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('usuarios').select('*');
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: 'Falta el ID del usuario' }, { status: 400 });
    }

    console.log('ID recibido en POST:', id);

    await crearAdminRolService(id);
    return NextResponse.json({ message: 'Rol actualizado a administrador correctamente' });
  } catch (error: any) {
    console.error('Error assigning admin role:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
