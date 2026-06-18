'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useConfig } from '@/context/ConfigContext';
import { createBrowserClient } from '@/lib/supabase';
import { Lock, Mail, User } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const { syncUserToDb, fetchUserRole } = useAuth();
  const { configuracion } = useConfig();
  const supabase = createBrowserClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
        {/* Header */}
        <div className="text-center space-y-3">
          <img
            src={configuracion.logo_url}
            alt="Logo Pizzería"
            className="mx-auto w-20 h-20 object-contain rounded-full border-4 border-ctp-red shadow-lg transition-transform duration-500 hover:rotate-360"
          />
          <h2 className="text-3xl font-extrabold text-white font-pizza-title tracking-wider">
            Bienvenido a {configuracion.nombre_pizzeria}
          </h2>
          <p className="text-xs text-theme-text/80 uppercase tracking-widest font-semibold">
            Inicia sesión para continuar
          </p>
        </div>

        {/* Social logins */}
        <div className="space-y-3 pt-2">
          <button
            onClick={() => handleOAuth('google')}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-sm font-bold text-black bg-gradient-to-r from-red-500 to-yellow-500 hover:scale-102 transition-transform cursor-pointer shadow-md"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png"
              alt="Google"
              className="w-4 h-4 object-contain"
            />
            Iniciar con Google
          </button>

          <button
            onClick={() => handleOAuth('facebook')}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-sm font-bold text-black bg-gradient-to-r from-green-500 to-red-500 hover:scale-102 transition-transform cursor-pointer shadow-md"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/2023_Facebook_icon.svg/2048px-2023_Facebook_icon.svg.png"
              alt="Facebook"
              className="w-4 h-4 object-contain"
            />
            Iniciar con Facebook
          </button>

          <button
            onClick={() => handleOAuth('twitter')}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-sm font-bold text-black bg-gradient-to-r from-yellow-500 to-green-500 hover:scale-102 transition-transform cursor-pointer shadow-md"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_of_Twitter.svg/2491px-Logo_of_Twitter.svg.png"
              alt="Twitter"
              className="w-4 h-4 object-contain"
            />
            Iniciar con Twitter
          </button>
        </div>

        {/* Separator */}
        <div className="flex items-center my-4">
          <hr className="flex-grow border-t border-theme/40" />
          <span className="px-3 text-xs text-theme-text/60 font-bold uppercase">o</span>
          <hr className="flex-grow border-t border-theme/40" />
        </div>

        {/* Form */}
        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-theme-text/80 uppercase">Correo electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 text-theme-text/50" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                required
                className="w-full pl-11 pr-4 py-3 bg-theme-surface/50 border border-theme/50 rounded-xl text-sm text-white focus:outline-none focus:border-ctp-mauve focus:ring-1 focus:ring-ctp-mauve transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-theme-text/80 uppercase">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 text-theme-text/50" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******"
                required
                className="w-full pl-11 pr-4 py-3 bg-theme-surface/50 border border-theme/50 rounded-xl text-sm text-white focus:outline-none focus:border-ctp-mauve focus:ring-1 focus:ring-ctp-mauve transition-all"
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
            className="w-full py-3 bg-ctp-mauve hover:scale-102 transition-all duration-200 text-white text-sm font-bold rounded-xl shadow-lg pulse-button cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Signup redirection */}
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
