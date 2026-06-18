'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createBrowserClient } from '@/lib/supabase';
import { User, Edit3, Shield, CheckCircle, RefreshCw } from 'lucide-react';

export default function Perfil() {
  const { user } = useAuth();
  const supabase = createBrowserClient();

  const [seccionActiva, setSeccionActiva] = useState<'info' | 'editar' | 'cuentas'>('info');
  const [cargando, setCargando] = useState(false);
  const [actualizando, setActualizando] = useState(false);

  // Edit fields state
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const nombreCompleto = user?.user_metadata?.full_name || user?.user_metadata?.name || 'Usuario';
  const fotoPerfil = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || 'https://via.placeholder.com/96';
  const rol = user?.user_metadata?.role || 'Cliente';
  const userNickname = user?.user_metadata?.nickname || 'Sin nickname';
  const proveedor = user?.app_metadata?.provider || 'Desconocido';
  const ultimoIngreso = user?.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleString()
    : 'Desconocido';

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || user.user_metadata?.name || '');
      setNickname(user.user_metadata?.nickname || '');
    }
  }, [user]);

  const cambiarSeccion = (seccion: 'info' | 'editar' | 'cuentas') => {
    setCargando(true);
    setTimeout(() => {
      setSeccionActiva(seccion);
      setCargando(false);
    }, 250);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setActualizando(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          nickname: nickname,
        },
      });

      if (error) throw error;

      setSuccessMsg('¡Perfil actualizado correctamente!');
      setTimeout(() => {
        setSuccessMsg(null);
        cambiarSeccion('info');
      }, 1500);
    } catch (error: any) {
      setErrorMsg(error.message || 'Error al actualizar el perfil');
    } finally {
      setActualizando(false);
    }
  };

  const isProviderLinked = (provider: string) => {
    return user?.app_metadata?.providers?.includes(provider) || user?.app_metadata?.provider === provider;
  };

  const providerStatusClass = (provider: string) => {
    return isProviderLinked(provider)
      ? 'text-ctp-green font-bold bg-ctp-green/10 border-ctp-green/30'
      : 'text-theme-text/50 bg-theme-bg/30 border-theme/40';
  };

  const providerStatusText = (provider: string) => {
    return isProviderLinked(provider) ? 'Conectado' : 'No conectado';
  };

  return (
    <div className="flex justify-center p-4 sm:p-8 text-theme-text">
      <div className="w-full max-w-2xl bg-theme-card border border-theme rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
          <img
            src={fotoPerfil}
            alt="Foto de perfil"
            className="w-24 h-24 rounded-full border-4 border-theme shadow-md object-cover"
          />
          <div className="flex-1 space-y-1.5">
            <h1 className="text-3xl font-bold text-white">{nombreCompleto}</h1>
            <p className="text-theme-secondary text-sm font-medium">{user?.email}</p>
            <div>
              <span className="text-xs text-theme-bg bg-ctp-mauve px-3 py-1 rounded-full shadow font-bold tracking-wide">
                {rol}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-theme/40 pb-2 gap-2">
          {[
            { id: 'info', label: '👤 Información' },
            { id: 'editar', label: '✍️ Editar Perfil' },
            { id: 'cuentas', label: '🔒 Seguridad' },
          ].map((tab) => {
            const isActive = seccionActiva === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => cambiarSeccion(tab.id as any)}
                className={`flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-theme-surface text-ctp-mauve shadow border-b-2 border-ctp-mauve'
                    : 'hover:bg-theme-surface/50 text-theme-text/70'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="min-h-[200px]">
          {cargando ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <RefreshCw size={28} className="animate-spin text-ctp-mauve" />
              <p className="text-theme-secondary animate-pulse text-xs font-semibold">Cargando...</p>
            </div>
          ) : (
            <div className="animate-fade-in">
              {/* Info section */}
              {seccionActiva === 'info' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-theme-surface/40 rounded-2xl border border-theme/60">
                      <p className="text-[10px] text-theme-secondary uppercase font-bold tracking-wider mb-1">Nickname</p>
                      <p className="text-white font-semibold text-sm">{userNickname}</p>
                    </div>
                    <div className="p-4 bg-theme-surface/40 rounded-2xl border border-theme/60">
                      <p className="text-[10px] text-theme-secondary uppercase font-bold tracking-wider mb-1">Proveedor Principal</p>
                      <p className="text-white font-semibold text-sm capitalize">{proveedor}</p>
                    </div>
                    <div className="p-4 bg-theme-surface/40 rounded-2xl border border-theme/60 sm:col-span-2">
                      <p className="text-[10px] text-theme-secondary uppercase font-bold tracking-wider mb-1">Último Ingreso</p>
                      <p className="text-white font-semibold text-sm">{ultimoIngreso}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Profile section */}
              {seccionActiva === 'editar' && (
                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-theme/40 pb-2">
                    <Edit3 size={18} className="text-ctp-mauve" /> Editar Información Personal
                  </h2>

                  <div className="space-y-4 max-w-md">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-theme-text/80 uppercase">Nombre Completo</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Tu nombre real"
                        required
                        className="w-full px-4 py-3 bg-theme-surface/50 border border-theme/50 rounded-xl text-sm text-white focus:outline-none focus:border-ctp-mauve"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-theme-text/80 uppercase">Nombre de Usuario (Nickname)</label>
                      <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="Tu alias"
                        className="w-full px-4 py-3 bg-theme-surface/50 border border-theme/50 rounded-xl text-sm text-white focus:outline-none focus:border-ctp-mauve"
                      />
                    </div>
                  </div>

                  {successMsg && (
                    <div className="p-3 text-xs font-bold text-center bg-ctp-green/10 border border-ctp-green/20 text-ctp-green rounded-xl max-w-md flex items-center justify-center gap-2">
                      <CheckCircle size={14} />
                      {successMsg}
                    </div>
                  )}

                  {errorMsg && (
                    <div className="p-3 text-xs font-bold text-center bg-ctp-red/10 border border-ctp-red/20 text-ctp-red rounded-xl max-w-md">
                      {errorMsg}
                    </div>
                  )}

                  <div className="flex gap-3 max-w-md pt-2">
                    <button
                      type="button"
                      onClick={() => resetForm()}
                      disabled={actualizando}
                      className="flex-1 py-2.5 border border-theme hover:bg-theme-surface rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={actualizando}
                      className="flex-1 py-2.5 bg-ctp-mauve text-white rounded-xl text-sm font-bold shadow hover:scale-102 transition-transform cursor-pointer pulse-button disabled:opacity-50"
                    >
                      {actualizando ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                </form>
              )}

              {/* Accounts / Security section */}
              {seccionActiva === 'cuentas' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-theme/40 pb-2">
                    <Shield size={18} className="text-ctp-blue" /> Proveedores de Autenticación
                  </h2>

                  <div className="space-y-3">
                    {['google', 'facebook', 'twitter', 'email'].map((p) => (
                      <div
                        key={p}
                        className="flex items-center justify-between p-4 bg-theme-surface/40 rounded-2xl border border-theme/60"
                      >
                        <span className="font-semibold capitalize text-white text-sm">{p}</span>
                        <span
                          className={`text-xs px-3 py-1 rounded-full border ${providerStatusClass(p)}`}
                        >
                          {providerStatusText(p)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  function resetForm() {
    if (user) {
      setFullName(user.user_metadata?.full_name || user.user_metadata?.name || '');
      setNickname(user.user_metadata?.nickname || '');
    }
    setErrorMsg(null);
    setSuccessMsg(null);
  }
}
