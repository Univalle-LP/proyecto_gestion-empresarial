'use client';

import React from 'react';
import Link from 'next/link';

export default function Home() {
  const configuracion = {
    nombre_pizzeria: "Victorino's Pizzería",
    logo_url: "https://via.placeholder.com/96"
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-[#1b1b2f] to-[#12121b] border border-theme shadow-2xl flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="space-y-3 text-center md:text-left flex-1">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">
            ¡Bienvenido a <span className="text-ctp-red font-pizza-title">{configuracion.nombre_pizzeria}</span>!
          </h1>
          <p className="text-sm text-theme-text/80 max-w-xl">
            Preparamos las pizzas artesanales más deliciosas con ingredientes frescos de la mejor calidad. ¡Inicia sesión para comenzar!
          </p>
          <div className="pt-2 flex justify-center md:justify-start gap-4">
            <Link
              href="/login"
              className="px-6 py-2.5 bg-ctp-mauve text-white text-sm font-bold rounded-xl shadow-lg hover:scale-105 duration-200 transition-transform cursor-pointer"
            >
              🔐 Iniciar Sesión
            </Link>
            <Link
              href="/signup"
              className="px-6 py-2.5 border border-theme bg-theme-surface/40 text-theme-text text-sm font-bold rounded-xl hover:bg-theme-surface duration-200 transition-colors"
            >
              📝 Crear Cuenta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
