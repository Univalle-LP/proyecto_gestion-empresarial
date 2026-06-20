'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConfig } from '@/context/ConfigContext';
import { createBrowserClient } from '@/lib/supabase';
import { Lock, Mail, User } from 'lucide-react';
import { validateEmail, validatePassword, validateText } from '@/lib/validations';

export default function Signup() {
  const router = useRouter();
  const { configuracion } = useConfig();
  const supabase = createBrowserClient();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const nameErr = validateText(name, 'nombre de usuario', { required: true, minLength: 3, maxLength: 50, preventInjection: true });
    if (nameErr) {
      setErrorMsg(nameErr);
      setLoading(false);
      return;
    }

    const emailErr = validateEmail(email, { required: true });
    if (emailErr) {
      setErrorMsg(emailErr);
      setLoading(false);
      return;
    }

    const passErr = validatePassword(password, { required: true, minLength: 8 });
    if (passErr) {
      setErrorMsg(passErr);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al crear la cuenta');
      }

      setSuccessMsg(data.message || '¡Registro exitoso! Revisa tu email para confirmar tu cuenta.');
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
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
            {configuracion.nombre_pizzeria}
          </h2>
          <p className="text-xs text-theme-text/80 uppercase tracking-widest font-semibold">
            Crea tu cuenta y empieza a disfrutar
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignUp} className="space-y-4" noValidate>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-theme-text/80 uppercase">Nombre de Usuario</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 text-theme-text/50" size={18} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre o apodo"
                className="w-full pl-11 pr-4 py-3 bg-theme-surface/50 border border-theme/50 rounded-xl text-sm text-white focus:outline-none focus:border-ctp-mauve focus:ring-1 focus:ring-ctp-mauve transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-theme-text/80 uppercase">Correo electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 text-theme-text/50" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
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
                placeholder="Mín. 8 caracteres, mayúscula, número y símbolo"
                className="w-full pl-11 pr-4 py-3 bg-theme-surface/50 border border-theme/50 rounded-xl text-sm text-white focus:outline-none focus:border-ctp-mauve focus:ring-1 focus:ring-ctp-mauve transition-all"
              />
            </div>
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
            className="w-full py-3 bg-ctp-mauve hover:scale-102 transition-all duration-200 text-white text-sm font-bold rounded-xl shadow-lg pulse-button cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        {/* Login redirection */}
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
