import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { validateEmail, validatePassword, validateText } from '@/lib/validations';
import { usePostgres } from '@/lib/db';

const MAX_ATTEMPTS = 10;
const LOCKOUT_MINUTES = 1;

export async function POST(request: Request) {
  try {
    // 1. Obtener IP de forma segura y verificar Rate Limit (DDoS/Spam) ANTES de procesar nada
    let ip = request.headers.get('x-real-ip') || request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-forwarded-for');
    ip = ip ? ip.split(',')[0].trim() : 'unknown';

    const sql = usePostgres();
    const lockoutTime = new Date(Date.now() - LOCKOUT_MINUTES * 60 * 1000).toISOString();
    
    try {
      const attemptsCount = await sql`SELECT count(*) FROM login_attempts WHERE ip_address = ${ip} AND attempt_time >= ${lockoutTime}`;
      const count = parseInt(attemptsCount[0].count, 10);

      if (count >= MAX_ATTEMPTS) {
        return NextResponse.json({ 
          error: `Demasiadas solicitudes. Por favor, espera ${LOCKOUT_MINUTES} minuto(s) antes de intentar de nuevo.` 
        }, { status: 429 });
      }

      // Registrar este intento (success=false por defecto hasta que se complete exitosamente)
      await sql`INSERT INTO login_attempts (ip_address, success) VALUES (${ip}, false)`;
    } catch (err) {
      console.error("Error al registrar intento de signup:", err);
    }

    // 2. Extraer cuerpo y aplicar validaciones globales
    const body = await request.json();
    const { email, password, name } = body;

    const emailError = validateEmail(email);
    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const nameError = validateText(name, 'nombre de usuario', { required: true, maxLength: 50 });
    if (nameError) {
      return NextResponse.json({ error: nameError }, { status: 400 });
    }

    // 3. Verificar si el correo ya existe
    const existingUser = await sql`SELECT id FROM auth.users WHERE email = ${email}`;
    if (existingUser && existingUser.length > 0) {
      return NextResponse.json({ error: 'El correo electrónico ya está registrado.' }, { status: 400 });
    }

    // 4. Preparar el cliente de Supabase
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

    // 5. Crear el usuario en Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name,
          full_name: name,
          name: name,
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
