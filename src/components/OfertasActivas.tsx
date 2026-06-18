'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Oferta {
  id_oferta: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  descuento: number;
  n_cantidad: number;
  m_paga: number;
  fecha_inicio: string;
  fecha_fin: string;
  activo: number;
  pizzas: number[];
}

interface Pizza {
  id_pizza: number;
  nombre: string;
}

export default function OfertasActivas() {
  const { role } = useAuth();
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [pizzas, setPizzas] = useState<Pizza[]>([]);

  const fetchOfertas = async () => {
    try {
      const res = await fetch('/api/ofertas');
      if (res.ok) {
        const data = await res.json();
        setOfertas(data);
      }
    } catch (e) {
      console.error('Error fetching offers:', e);
    }
  };

  const fetchPizzas = async () => {
    try {
      const res = await fetch('/api/products/pizza');
      if (res.ok) {
        const data = await res.json();
        setPizzas(data);
      }
    } catch (e) {
      console.error('Error fetching pizzas:', e);
    }
  };

  useEffect(() => {
    if (role === 'comun') {
      fetchPizzas();
      fetchOfertas();
    }
  }, [role]);

  const obtenerNombrePizza = (id: number) => {
    const pizza = pizzas.find((p) => p.id_pizza === id);
    return pizza ? pizza.nombre : 'Pizza';
  };

  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const obtenerTitulo = (oferta: Oferta) => {
    if (oferta.tipo === 'descuento') {
      return `${(Number(oferta.descuento) * 100).toFixed(0)}% de Descuento`;
    } else if (oferta.tipo === 'n_x_m') {
      return `${oferta.n_cantidad}x${oferta.m_paga} en Pizzas`;
    }
    return 'Oferta Especial';
  };

  const ofertasFiltradas = ofertas.filter((oferta) => {
    if (!oferta.activo) return false;
    const hoy = new Date();
    const inicio = new Date(oferta.fecha_inicio);
    const fin = new Date(oferta.fecha_fin);
    return hoy >= inicio && hoy <= fin;
  });

  if (role !== 'comun') return null;

  return (
    <div className="p-6 sm:p-8 rounded-2xl shadow-xl border border-theme bg-theme-card text-theme-text transition-all duration-300">
      <h2 className="text-3xl font-bold mb-6 font-pizza-title flex items-center gap-3 text-ctp-red">
        <span>🎁</span> Ofertas Activas
      </h2>

      {ofertasFiltradas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ofertasFiltradas.map((oferta) => (
            <div
              key={oferta.id_oferta}
              className="p-6 rounded-2xl border border-theme bg-theme-surface hover:shadow-lg transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-extrabold text-ctp-mauve group-hover:text-ctp-peach transition-colors">
                  {obtenerTitulo(oferta)}
                </h3>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-ctp-green/20 text-ctp-green border border-ctp-green/30 animate-pulse">
                  Activo
                </span>
              </div>
              <p className="text-sm font-semibold text-theme-text/80 mb-2">
                {oferta.descripcion}
              </p>
              
              <p className="text-xs font-bold text-theme-secondary uppercase tracking-wider mb-4 flex items-center gap-1">
                <span>📅</span> {formatearFecha(oferta.fecha_inicio)} al {formatearFecha(oferta.fecha_fin)}
              </p>

              {oferta.pizzas && oferta.pizzas.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-theme/60">
                  <span className="text-xs font-bold text-theme-secondary uppercase tracking-wider">Aplica a:</span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {oferta.pizzas.map((id) => (
                      <li key={id} className="flex items-center gap-2 text-sm font-medium text-theme-text/90">
                        <span className="text-ctp-peach text-base">🍕</span> {obtenerNombrePizza(id)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-theme rounded-2xl bg-theme-surface/30">
          <span className="text-5xl block mb-3">🏷️</span>
          <p className="text-theme-text/75 font-semibold">No hay ofertas activas en este momento</p>
        </div>
      )}
    </div>
  );
}
