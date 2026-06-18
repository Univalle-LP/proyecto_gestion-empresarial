'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { User, Pizza, ShoppingBag } from 'lucide-react';

export default function UsuarioDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const nombreCompleto = user?.user_metadata?.full_name || user?.user_metadata?.name || 'Usuario';
  const fotoPerfil = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || 'https://via.placeholder.com/96';

  return (
    <div className="min-h-[70vh] flex justify-center items-start pt-6 sm:pt-10 px-4 text-theme-text">
      <div className="w-full max-w-2xl bg-theme-card border border-theme rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* User profile header */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
          <img
            src={fotoPerfil}
            alt="Foto de perfil"
            className="w-24 h-24 rounded-full shadow-lg object-cover border-4 border-ctp-red"
          />
          <div className="flex flex-col justify-center space-y-1">
            <h1 className="text-3xl font-bold text-ctp-red font-pizza-title tracking-wide">
              {nombreCompleto}
            </h1>
            <p className="text-theme-secondary italic text-sm font-medium">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-t border-theme/40" />

        {/* Navigation actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/usuario/perfil')}
            className="w-full py-3.5 px-4 bg-ctp-red hover:bg-ctp-red/90 text-white rounded-xl shadow font-bold flex items-center justify-center gap-2 hover:scale-102 transition-transform cursor-pointer"
          >
            <User size={18} />
            Mi Perfil
          </button>
          <button
            onClick={() => router.push('/usuario/ordenarPizza')}
            className="w-full py-3.5 px-4 bg-ctp-yellow hover:bg-ctp-yellow/90 text-black rounded-xl shadow font-bold flex items-center justify-center gap-2 hover:scale-102 transition-transform cursor-pointer"
          >
            <Pizza size={18} />
            Ordenar Pizza
          </button>
          <button
            onClick={() => router.push('/usuario/misPedidos')}
            className="w-full py-3.5 px-4 bg-ctp-blue hover:bg-ctp-blue/90 text-white rounded-xl shadow font-bold flex items-center justify-center gap-2 hover:scale-102 transition-transform cursor-pointer"
          >
            <ShoppingBag size={18} />
            Mis Pedidos
          </button>
        </div>
      </div>
    </div>
  );
}
