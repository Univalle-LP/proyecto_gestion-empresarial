import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { validateEmail, validatePassword, validateText } from '@/lib/validations';
import { usePostgres } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // 1. Validaciones globales
    const emailError = validateEmail(email);
    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const nameError = validateText(name, 'nombre de usuario', true);
    if (nameError) {
      return NextResponse.json({ error: nameError }, { status: 400 });
    }

    // 2. Verificar si el correo ya existe
    const sql = usePostgres();
    const existingUser = await sql`SELECT id FROM auth.users WHERE email = ${email}`;
    if (existingUser && existingUser.length > 0) {
      return NextResponse.json({ error: 'El correo electrónico ya está registrado.' }, { status: 400 });
    }

    // 3. Preparar el cliente de Supabase
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; 

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            console.error('Error al configurar cookies en signup:', error);
          }
        },
      },
    });

    // 4. Crear el usuario en Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name,
        },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: '¡Registro exitoso! Revisa tu email para confirmar tu cuenta.',
      user: {
        id: data.user?.id,
        email: data.user?.email
      }
    });

  } catch (err: any) {
    console.error('Signup internal error:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
