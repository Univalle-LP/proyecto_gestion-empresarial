import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { validateEmail, validatePassword } from '@/lib/validations';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 1;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    const emailError = validateEmail(email);
    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    // 1. Obtener IP (para mitigación DDoS/fuerza bruta básica)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; 

    const cookieStore = await cookies();
    
    // Cliente específico para esta petición para aplicar "rememberMe" y cookies seguras
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              const cookieOptions = { ...options };
              
              // Si no marca "Recuérdame", la cookie debe ser de sesión
              if (!rememberMe) {
                delete cookieOptions.maxAge;
                delete cookieOptions.expires;
              }
              
              // Medidas extra de seguridad para las cookies
              cookieOptions.secure = process.env.NODE_ENV === 'production';
              cookieOptions.httpOnly = true;
              cookieOptions.sameSite = 'lax';
              
              cookieStore.set(name, value, cookieOptions);
            });
          } catch (error) {
            console.error('Error al configurar cookies:', error);
          }
        },
      },
    });

    // 2. Verificar límite de intentos (Rate Limit) usando la tabla en Supabase
    const lockoutTime = new Date(Date.now() - LOCKOUT_MINUTES * 60 * 1000).toISOString();
    
    const { data: attempts, error: attemptsError } = await supabase
      .from('login_attempts')
      .select('success')
      .eq('ip_address', ip)
      .gte('attempt_time', lockoutTime)
      .order('attempt_time', { ascending: false });
      console.log(attempts);

    if (!attemptsError && attempts) {
      let failedConsecutive = 0;
      for (const attempt of attempts) {
        if (attempt.success) break; 
        failedConsecutive++;
      }

      if (failedConsecutive >= MAX_ATTEMPTS) {
        return NextResponse.json({ 
          error: `Demasiados intentos. Por favor, intenta de nuevo en ${LOCKOUT_MINUTES} minutos.` 
        }, { status: 429 });
      }
    }

    // 3. Autenticación contra Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // 4. Registrar el resultado del intento en BD
    const { error: insertError } = await supabase.from('login_attempts').insert([
      { 
        ip_address: ip, 
        email: email, 
        success: !error 
      }
    ]);

    if (insertError) {
      console.error('No se pudo registrar el intento en BD:', insertError);
      // Opcional: Podrías lanzar un error si consideras crítico que el intento quede registrado.
      // throw new Error('No se pudo registrar el intento');
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({ 
      user: {
        id: data.user?.id,
        email: data.user?.email,
        metadata: data.user?.user_metadata
      }
    });

  } catch (err: any) {
    console.error('Login internal error:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
