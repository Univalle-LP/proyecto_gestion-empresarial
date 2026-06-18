'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useConfig } from '@/context/ConfigContext';
import Link from 'next/link';
import { LayoutDashboard, Pizza, Settings, Award } from 'lucide-react';

export default function Home() {
  const { user, role, loading: authLoading } = useAuth();
  const { configuracion } = useConfig();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-ctp-mauve border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Welcome panel for Admins
  if (role === 'admin') {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-[#1b1b2f] to-[#12121b] border border-theme shadow-2xl flex flex-col md:flex-row items-center md:items-start gap-6">
          <img
            src={configuracion.logo_url}
            alt="Logo"
            className="w-24 h-24 object-contain rounded-full shadow-lg border-4 border-ctp-red"
          />
          <div className="space-y-3 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white">
              Panel de Control de <span className="text-ctp-red font-pizza-title">{configuracion.nombre_pizzeria}</span>
            </h1>
            <p className="text-sm text-theme-text/80 max-w-xl">
              Bienvenido de vuelta, Administrador. Aquí puedes controlar las ofertas activas, visualizar métricas de ventas y editar ingredientes, pizzas y personalizaciones globales.
            </p>
          </div>
        </div>

        {/* Quick admin access */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <Link
            href="/admin/dashboards"
            className="p-6 rounded-2xl border border-theme bg-theme-card hover:bg-theme-surface hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center space-y-3 group hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-full bg-ctp-blue/20 text-ctp-blue flex items-center justify-center group-hover:scale-110 transition-transform">
              <LayoutDashboard size={24} />
            </div>
            <h3 className="text-base font-bold text-white">Ver Dashboard</h3>
            <p className="text-xs text-theme-text/70">Métricas, costos y ventas mensuales</p>
          </Link>

          <Link
            href="/products/pizza"
            className="p-6 rounded-2xl border border-theme bg-theme-card hover:bg-theme-surface hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center space-y-3 group hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-full bg-ctp-peach/20 text-ctp-peach flex items-center justify-center group-hover:scale-110 transition-transform">
              <Pizza size={24} />
            </div>
            <h3 className="text-base font-bold text-white">Gestión de Pizzas</h3>
            <p className="text-xs text-theme-text/70">Crear pizzas y asignar ingredientes</p>
          </Link>

          <Link
            href="/admin/oferta"
            className="p-6 rounded-2xl border border-theme bg-theme-card hover:bg-theme-surface hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center space-y-3 group hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-full bg-ctp-green/20 text-ctp-green flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award size={24} />
            </div>
            <h3 className="text-base font-bold text-white">Administrar Ofertas</h3>
            <p className="text-xs text-theme-text/70">Promociones temporales y descuentos</p>
          </Link>

          <Link
            href="/admin/configuracion"
            className="p-6 rounded-2xl border border-theme bg-theme-card hover:bg-theme-surface hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center space-y-3 group hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-full bg-ctp-mauve/20 text-ctp-mauve flex items-center justify-center group-hover:scale-110 transition-transform">
              <Settings size={24} />
            </div>
            <h3 className="text-base font-bold text-white">Personalizar Sitio</h3>
            <p className="text-xs text-theme-text/70">Editar logotipo, colores y temas</p>
          </Link>
        </div>
      </div>
    );
  }

  // Panel for Customers
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-[#1b1b2f] to-[#12121b] border border-theme shadow-2xl flex flex-col md:flex-row items-center md:items-start gap-6">
        <img
          src={configuracion.logo_url}
          alt="Logo"
          className="w-24 h-24 object-contain rounded-full shadow-lg border-4 border-ctp-red"
        />
        <div className="space-y-3 text-center md:text-left flex-1">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">
            ¡Bienvenido a <span className="text-ctp-red font-pizza-title">{configuracion.nombre_pizzeria}</span>!
          </h1>
          <p className="text-sm text-theme-text/80 max-w-xl">
            Preparamos las pizzas artesanales más deliciosas con ingredientes frescos de la mejor calidad. ¡Arma tu pizza a tu gusto o elige uno de nuestros productos adicionales!
          </p>
          <div className="pt-2 flex justify-center md:justify-start gap-4">
            <Link
              href="/usuario/ordenarPizza"
              className="px-6 py-2.5 bg-ctp-mauve text-white text-sm font-bold rounded-xl shadow-lg hover:scale-105 duration-200 transition-transform cursor-pointer"
            >
              🍕 Ordenar Ahora
            </Link>
            <Link
              href="/usuario"
              className="px-6 py-2.5 border border-theme bg-theme-surface/40 text-theme-text text-sm font-bold rounded-xl hover:bg-theme-surface duration-200 transition-colors"
            >
              📦 Mis Pedidos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
