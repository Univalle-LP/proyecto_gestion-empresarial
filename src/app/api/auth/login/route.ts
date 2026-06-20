import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { validateEmail, validateText } from '@/lib/validations';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 1;

export async function POST(request: Request) {
  try {
    // 1. Obtener IP y preparar cliente Supabase ANTES de procesar body para proteger contra DDoS de payloads
    let ip = request.headers.get('x-real-ip') || request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-forwarded-for');
    ip = ip ? ip.split(',')[0].trim() : 'unknown';

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; 

    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {} // Placeholder, se configura después si es exitoso
      },
    });

    // Leer el body para poder aplicar Rate Limiting por email también
    let email = '';
    let password = '';
    let rememberMe = false;
    try {
      const body = await request.json();
      email = body.email;
      password = body.password;
      rememberMe = body.rememberMe;
    } catch (e) {
      // Ignorar error de parseo temporalmente para continuar con el Rate Limiting de IP
    }

    // 2. Verificar límite de intentos (Rate Limit) usando la tabla en Supabase
    const lockoutTime = new Date(Date.now() - LOCKOUT_MINUTES * 60 * 1000).toISOString();
    const { data: attempts, error: attemptsError } = await supabase
      .from('login_attempts')
      .select('ip_address, email, success')
      .gte('attempt_time', lockoutTime)
      .or(`ip_address.eq.${ip}${email ? `,email.eq.${email}` : ''}`)
      .order('attempt_time', { ascending: false });

    if (!attemptsError && attempts) {
      let failedIp = 0;
      let failedEmail = 0;
      let stopIp = false;
      let stopEmail = false;

      for (const attempt of attempts) {
        if (attempt.ip_address === ip && !stopIp) {
          if (attempt.success) stopIp = true;
          else failedIp++;
        }
        if (email && attempt.email === email && !stopEmail) {
          if (attempt.success) stopEmail = true;
          else failedEmail++;
        }
      }

      if (failedIp >= MAX_ATTEMPTS || (email && failedEmail >= MAX_ATTEMPTS)) {
        return NextResponse.json({ 
          error: `Demasiados intentos. Por favor, intenta de nuevo en ${LOCKOUT_MINUTES} minutos.` 
        }, { status: 429 });
      }
    }

    // 3. Validaciones globales
    const emailError = validateEmail(email);
    if (emailError) {
      // Registrar intento fallido
      await supabase.from('login_attempts').insert([{ ip_address: ip, email: email || 'invalid', success: false }]);
      return NextResponse.json({ error: emailError }, { status: 400 });
    }

    const passwordError = validateText(password, 'contraseña', { required: true });
    if (passwordError) {
      await supabase.from('login_attempts').insert([{ ip_address: ip, email: email, success: false }]);
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    // Configurar cliente real de Supabase con las cookies completas
    const supabaseFinal = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              const cookieOptions = { ...options };
              if (!rememberMe) {
                delete cookieOptions.maxAge;
                delete cookieOptions.expires;
              }
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


    // 4. Autenticación contra Supabase
    const { data, error } = await supabaseFinal.auth.signInWithPassword({
      email,
      password,
    });

    // 5. Registrar el resultado del intento en BD
    const { error: insertError } = await supabaseFinal.from('login_attempts').insert([
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
