'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Calendar, Tag, ShieldCheck, HelpCircle, X, Receipt } from 'lucide-react';

interface PizzaDetalle {
  id_pedido: number;
  id_pizza: number;
  id_tamano: number;
  cantidad: number;
  precio_unitario: string;
  nombre: string;
  descripcion: string;
  precio_base: string;
}

interface ProductoDetalle {
  id_pedido: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: string;
  nombre: string;
  descripcion: string;
  precio: string;
}

interface Pedido {
  id_pedido: number;
  fecha: string;
  estado: string;
  total: string;
  pizzas: PizzaDetalle[];
  productos: ProductoDetalle[];
}

export default function MisPedidos() {
  const { user } = useAuth();

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState<Pedido[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<string>('');

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [comentario, setComentario] = useState('');
  const [selectedPedidoId, setSelectedPedidoId] = useState<number | null>(null);

  const [isDetallesVisible, setIsDetallesVisible] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);

  const [loading, setLoading] = useState(true);

  const cargarPedidos = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/usuario/obtenerDetalles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_cliente: user.id }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPedidos(data.pedidos || []);
          setPedidosFiltrados(data.pedidos || []);
        }
      }
    } catch (error) {
      console.error('Error fetching customer orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      cargarPedidos();
    }
  }, [user]);

  const filterOrders = (status: string) => {
    setFiltroEstado(status);
    if (!status) {
      setPedidosFiltrados(pedidos);
    } else {
      setPedidosFiltrados(pedidos.filter((p) => p.estado === status));
    }
  };

  const statusBadgeClass = (status: string) => {
    if (status === 'Aprobado') return 'bg-ctp-green/20 text-ctp-green border-ctp-green/35';
    if (status === 'Pendiente') return 'bg-ctp-yellow/20 text-ctp-yellow border-ctp-yellow/35';
    if (status.includes('Cancelado')) return 'bg-ctp-red/20 text-ctp-red border-ctp-red/35';
    return 'bg-theme-surface text-theme-text border-theme';
  };

  const canCancel = (status: string) => {
    return !status.includes('Cancelado') && status !== 'Aprobado';
  };

  const initCancelOrder = (pedidoId: number) => {
    setSelectedPedidoId(pedidoId);
    setComentario('');
    setIsModalVisible(true);
  };

  const handleConfirmCancel = async () => {
    if (!user || !selectedPedidoId || !comentario.trim()) return;

    try {
      const res = await fetch('/api/usuario/obtenerDetalles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_cliente: user.id,
          id_pedido: selectedPedidoId,
          comentario: comentario,
        }),
      });

      if (res.ok) {
        const updated = pedidos.map((p) => {
          if (p.id_pedido === selectedPedidoId) {
            return { ...p, estado: 'Cancelado por el Cliente' };
          }
          return p;
        });
        setPedidos(updated);
        // Apply current filter to updated list
        if (filtroEstado) {
          setPedidosFiltrados(updated.filter((p) => p.estado === filtroEstado));
        } else {
          setPedidosFiltrados(updated);
        }
        setIsModalVisible(false);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  const verDetalles = (pedidoId: number) => {
    const found = pedidos.find((p) => p.id_pedido === pedidoId);
    if (found) {
      setPedidoSeleccionado(found);
      setIsDetallesVisible(true);
    }
  };

  const formatearFecha = (fechaStr: string) => {
    return new Date(fechaStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-ctp-mauve border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-theme-text max-w-5xl mx-auto">
      <div className="p-6 md:p-8 rounded-3xl border border-theme bg-theme-card shadow-xl space-y-6">
        <h1 className="text-3xl font-extrabold font-pizza-title text-ctp-red border-b border-theme/40 pb-4">
          Mis Pedidos
        </h1>

        {/* Filter header */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-theme-secondary uppercase tracking-wider">Filtrar:</span>
          <select
            value={filtroEstado}
            onChange={(e) => filterOrders(e.target.value)}
            className="px-4 py-2.5 bg-theme-surface border border-theme/50 rounded-xl text-sm text-white outline-none w-full sm:w-64"
          >
            <option value="">Todos los Estados</option>
            <option value="Aprobado">Aprobado</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Cancelado por el Cliente">Cancelado por el Cliente</option>
            <option value="Cancelado por el Administrador">Cancelado por el Administrador</option>
          </select>
        </div>

        {/* Orders list */}
        {pedidosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pedidosFiltrados.map((pedido) => (
              <div
                key={pedido.id_pedido}
                className="rounded-2xl border border-theme bg-theme-surface shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden"
              >
                <div className="p-5 flex flex-col h-full space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-theme-secondary uppercase tracking-wider">
                        Pedido #{pedido.id_pedido}
                      </p>
                      <p className="text-xs text-theme-text/80 mt-0.5 flex items-center gap-1">
                        <Calendar size={12} />
                        {formatearFecha(pedido.fecha)}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${statusBadgeClass(
                        pedido.estado
                      )}`}
                    >
                      {pedido.estado}
                    </span>
                  </div>

                  <div className="flex-1">
                    <p className="text-2xl font-black text-ctp-peach">
                      ${parseFloat(pedido.total).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    {canCancel(pedido.estado) && (
                      <button
                        onClick={() => initCancelOrder(pedido.id_pedido)}
                        className="w-full py-2 border border-ctp-red/40 hover:bg-ctp-red hover:text-white text-ctp-red text-sm font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Cancelar Pedido
                      </button>
                    )}
                    <button
                      onClick={() => verDetalles(pedido.id_pedido)}
                      className="w-full py-2 bg-ctp-mauve hover:scale-102 transition-transform text-white text-sm font-bold rounded-xl shadow cursor-pointer"
                    >
                      Ver Detalles
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-theme rounded-2xl bg-theme-surface/30">
            <span className="text-5xl block mb-3">📦</span>
            <p className="text-theme-text/75 font-semibold">No tienes pedidos con este filtro</p>
          </div>
        )}
      </div>

      {/* Cancel dialog modal */}
      {isModalVisible && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-[#12121b] border border-theme rounded-2xl w-full max-w-[480px] p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-theme/40 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>💬</span> Cancelar Pedido
              </h3>
              <button onClick={() => setIsModalVisible(false)} className="text-theme-text/60 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-theme-secondary font-medium">Por favor, cuéntanos el motivo de la cancelación:</p>
              <textarea
                rows={4}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Escribe tu motivo aquí..."
                className="w-full p-4 bg-theme-surface border border-theme/50 rounded-xl text-sm text-white focus:outline-none resize-none"
              ></textarea>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsModalVisible(false)}
                className="flex-1 py-2.5 border border-theme hover:bg-theme-surface rounded-xl text-sm font-semibold cursor-pointer"
              >
                Volver
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={!comentario.trim()}
                className="flex-1 py-2.5 bg-ctp-red text-white rounded-xl text-sm font-bold shadow hover:scale-102 transition-transform cursor-pointer disabled:opacity-50"
              >
                Confirmar Cancelación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details dialog modal */}
      {isDetallesVisible && pedidoSeleccionado && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-[#12121b] border border-theme rounded-2xl w-full max-w-[540px] p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-theme/40 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Receipt size={18} /> Detalles del Pedido #{pedidoSeleccionado.id_pedido}
              </h3>
              <button onClick={() => setIsDetallesVisible(false)} className="text-theme-text/60 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto pr-1 space-y-6">
              {/* Pizzas */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white border-b border-theme/30 pb-1 flex items-center gap-1.5">
                  <span>🍕</span> Pizzas
                </h4>
                {pedidoSeleccionado.pizzas && pedidoSeleccionado.pizzas.length > 0 ? (
                  <ul className="space-y-2">
                    {pedidoSeleccionado.pizzas.map((pizza, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between items-center text-xs p-3 bg-theme-surface rounded-xl border border-theme/40"
                      >
                        <span className="font-semibold text-white/95">
                          {pizza.nombre}
                          <span className="text-[10px] text-theme-secondary font-medium ml-1">
                            ({pizza.descripcion || 'Especial'})
                          </span>
                        </span>
                        <span className="font-bold bg-ctp-mauve/15 text-ctp-mauve px-2.5 py-0.5 rounded-full border border-ctp-mauve/25">
                          x{pizza.cantidad}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-theme-secondary italic">No hay pizzas en este pedido.</p>
                )}
              </div>

              {/* Products */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white border-b border-theme/30 pb-1 flex items-center gap-1.5">
                  <span>🛒</span> Complementos
                </h4>
                {pedidoSeleccionado.productos && pedidoSeleccionado.productos.length > 0 ? (
                  <ul className="space-y-2">
                    {pedidoSeleccionado.productos.map((prod, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between items-center text-xs p-3 bg-theme-surface rounded-xl border border-theme/40"
                      >
                        <span className="font-semibold text-white/95">{prod.nombre}</span>
                        <span className="font-bold bg-ctp-green/15 text-ctp-green px-2.5 py-0.5 rounded-full border border-ctp-green/25">
                          x{prod.cantidad}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-theme-secondary italic">No hay complementos en este pedido.</p>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-theme/40 flex justify-end">
              <button
                onClick={() => setIsDetallesVisible(false)}
                className="px-6 py-2 bg-theme-surface border border-theme/50 hover:bg-theme-surface/75 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
