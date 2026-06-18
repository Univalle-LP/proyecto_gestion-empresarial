'use client';

import React from 'react';
import { useConfig } from '@/context/ConfigContext';
import Link from 'next/link';

export default function About() {
  const { configuracion } = useConfig();

  return (
    <div className="space-y-8 animate-fade-in text-theme-text max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        <img
          src={configuracion.logo_url}
          alt="Logo Pizzería"
          className="mx-auto w-24 h-24 object-contain rounded-full border-4 border-ctp-red shadow-lg"
        />
        <h1 className="text-4xl font-extrabold font-pizza-title tracking-wider text-ctp-red">
          Sobre {configuracion.nombre_pizzeria}
        </h1>
        <p className="text-sm font-semibold uppercase tracking-widest text-theme-secondary">
          Nuestra Historia y Pasión
        </p>
      </div>

      <div className="p-6 md:p-8 rounded-2xl border border-theme bg-theme-card space-y-6 shadow-lg leading-relaxed">
        <p>
          En <span className="font-bold text-ctp-mauve">{configuracion.nombre_pizzeria}</span>, creemos que la pizza es más que solo comida; es una forma de arte y un momento para compartir en familia y con amigos. Cada una de nuestras pizzas se prepara de manera artesanal y se hornea a la perfección con ingredientes locales frescos.
        </p>
        <p>
          Nuestro viaje comenzó con el compromiso de ofrecer pizzas con masa crujiente, salsas preparadas en casa diariamente y combinaciones de ingredientes inolvidables. Gracias a la preferencia de nuestros clientes, seguimos innovando y mejorando nuestra plataforma digital para hacer que tu experiencia de pedido sea la más rápida y agradable posible.
        </p>
        
        <div className="pt-4 border-t border-theme/40 flex justify-center gap-4">
          <Link
            href="/"
            className="px-6 py-2.5 bg-ctp-mauve text-white text-sm font-bold rounded-xl shadow-lg hover:scale-105 duration-200 transition-transform cursor-pointer"
          >
            🍕 Ir al Inicio
          </Link>
          <Link
            href="/usuario/ordenarPizza"
            className="px-6 py-2.5 border border-theme bg-theme-surface/40 text-theme-text text-sm font-bold rounded-xl hover:bg-theme-surface duration-200 transition-colors"
          >
            🛒 Hacer un Pedido
          </Link>
        </div>
      </div>
    </div>
  );
}
