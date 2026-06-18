'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createBrowserClient } from '@/lib/supabase';
import { Lock, Mail } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const { syncUserToDb, fetchUserRole } = useAuth();
  const supabase = createBrowserClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock config for now (before config module is added)
  const configuracion = {
    nombre_pizzeria: "Victorino's Pizzería",
    logo_url: "https://via.placeholder.com/96"
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data?.user) {
        const fullName = data.user.user_metadata?.display_name || data.user.email || 'Cliente';
        await syncUserToDb(data.user.id, fullName);
        await fetchUserRole(data.user.id);
        router.push('/');
      }
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'facebook' | 'twitter') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/confirm`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      setErrorMsg(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
      <div className="bg-[#12121b] border border-theme p-8 rounded-3xl shadow-2xl w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <img
            src={configuracion.logo_url}
            alt="Logo Pizzería"
            className="mx-auto w-20 h-20 object-contain rounded-full border-4 border-ctp-red shadow-lg"
          />
          <h2 className="text-3xl font-extrabold text-white font-pizza-title tracking-wider">
            Bienvenido a {configuracion.nombre_pizzeria}
          </h2>
          <p className="text-xs text-theme-text/80 uppercase tracking-widest font-semibold">
            Inicia sesión para continuar
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={() => handleOAuth('google')}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-sm font-bold text-black bg-gradient-to-r from-red-500 to-yellow-500 hover:scale-102 transition-transform cursor-pointer shadow-md"
          >
            Iniciar con Google
          </button>
        </div>

        <div className="flex items-center my-4">
          <hr className="flex-grow border-t border-theme/40" />
          <span className="px-3 text-xs text-theme-text/60 font-bold uppercase">o</span>
          <hr className="flex-grow border-t border-theme/40" />
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-theme-text/80 uppercase">Correo electrónico</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                required
                className="w-full px-4 py-3 bg-theme-surface/50 border border-theme/50 rounded-xl text-sm text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-theme-text/80 uppercase">Contraseña</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******"
                required
                className="w-full px-4 py-3 bg-theme-surface/50 border border-theme/50 rounded-xl text-sm text-white"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 text-xs font-bold text-center bg-ctp-red/10 border border-ctp-red/20 text-ctp-red rounded-xl">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-ctp-mauve hover:scale-102 transition-all duration-200 text-white text-sm font-bold rounded-xl shadow-lg pulse-button cursor-pointer"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-theme/35">
          <p className="text-xs text-theme-text/80 font-medium">
            ¿No tienes una cuenta?{' '}
            <button
              onClick={() => router.push('/signup')}
              className="text-ctp-mauve hover:underline font-bold transition duration-200 cursor-pointer"
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
