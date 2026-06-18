'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import { Lock, Mail } from 'lucide-react';

export default function Signup() {
  const router = useRouter();
  const supabase = createBrowserClient();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock config for now (before config module is added)
  const configuracion = {
    nombre_pizzeria: "Victorino's Pizzería",
    logo_url: "https://via.placeholder.com/96"
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: name,
          },
        },
      });

      if (error) throw error;

      setSuccessMsg('¡Registro exitoso! Revisa tu email para confirmar tu cuenta.');
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
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
            {configuracion.nombre_pizzeria}
          </h2>
          <p className="text-xs text-theme-text/80 uppercase tracking-widest font-semibold">
            Crea tu cuenta y empieza a disfrutar
          </p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-theme-text/80 uppercase">Nombre de Usuario</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre o apodo"
              required
              className="w-full px-4 py-3 bg-theme-surface/50 border border-theme/50 rounded-xl text-sm text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-theme-text/80 uppercase">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@correo.com"
              required
              className="w-full px-4 py-3 bg-theme-surface/50 border border-theme/50 rounded-xl text-sm text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-theme-text/80 uppercase">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              className="w-full px-4 py-3 bg-theme-surface/50 border border-theme/50 rounded-xl text-sm text-white"
            />
          </div>

          {errorMsg && (
            <div className="p-3 text-xs font-bold text-center bg-ctp-red/10 border border-ctp-red/20 text-ctp-red rounded-xl">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 text-xs font-bold text-center bg-ctp-green/10 border border-ctp-green/20 text-ctp-green rounded-xl">
              {successMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-ctp-mauve hover:scale-102 transition-all duration-200 text-white text-sm font-bold rounded-xl shadow-lg pulse-button cursor-pointer"
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-theme/35">
          <p className="text-xs text-theme-text/80 font-medium">
            ¿Ya tienes una cuenta?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-ctp-mauve hover:underline font-bold transition duration-200 cursor-pointer"
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
