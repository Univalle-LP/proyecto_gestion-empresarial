'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Check, Trash2, List, Filter, DollarSign, Calendar, Clock, AlertTriangle } from 'lucide-react';

interface Pedido {
  id_pedido: number;
  nombre?: string;
  fecha: string;
  estado: string;
  total: number;
  comentario?: string;
}

interface DetallePizza {
  id_pizza: number;
  nombre: string;
  id_tamano: string;
  cantidad: number;
}

interface DetalleProducto {
  id_producto: number;
  nombre: string;
  cantidad: number;
}

interface PedidoDetallado {
  id_pedido: number;
  nombre?: string;
  estado: string;
  total: number;
  pizzas: DetallePizza[];
  productos: DetalleProducto[];
}

export default function CancelarPedidoPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroNombre, setFiltroNombre] = useState('');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [busquedaGeneral, setBusquedaGeneral] = useState('');

  // Details Modal
  const [detallesModalOpen, setDetallesModalOpen] = useState(false);
  const [pedidoDetalle, setPedidoDetalle] = useState<PedidoDetallado | null>(null);
  const [loadingDetalles, setLoadingDetalles] = useState(false);

  // Confirm Action Modal
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pedidoEnProceso, setPedidoEnProceso] = useState<Pedido | null>(null);
  const [accionModal, setAccionModal] = useState<'aprobar' | 'cancelar' | null>(null);
  const [procesandoAccion, setProcesandoAccion] = useState(false);

  // Pagination
  const [paginaActual, setPaginaActual] = useState(1);
  const pedidosPorPagina = 9;

  const loadPedidos = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/obtenerPedidos');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPedidos(data.pedidos || []);
        }
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPedidos();
  }, []);

  const resetFiltros = () => {
    setFiltroEstado('');
    setFiltroNombre('');
    setPrecioMin('');
    setPrecioMax('');
    setBusquedaGeneral('');
    setPaginaActual(1);
  };

  // Filter logic
  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((pedido) => {
      const coincideEstado = !filtroEstado || pedido.estado === filtroEstado;
      const coincideNombre =
        !filtroNombre ||
        pedido.nombre?.toLowerCase().includes(filtroNombre.toLowerCase());
      
      const pMin = parseFloat(precioMin);
      const coincidePrecioMin = isNaN(pMin) || pedido.total >= pMin;

      const pMax = parseFloat(precioMax);
      const coincidePrecioMax = isNaN(pMax) || pedido.total <= pMax;

      const coincideBusqueda =
        !busquedaGeneral ||
        [
          pedido.id_pedido.toString(),
          pedido.nombre || '',
          pedido.estado,
          pedido.comentario || '',
        ].some((campo) =>
          campo.toLowerCase().includes(busquedaGeneral.toLowerCase())
        );

      return (
        coincideEstado &&
        coincideNombre &&
        coincidePrecioMin &&
        coincidePrecioMax &&
        coincideBusqueda
      );
    });
  }, [pedidos, filtroEstado, filtroNombre, precioMin, precioMax, busquedaGeneral]);

  // Reset pagination when filters change
  useEffect(() => {
    setPaginaActual(1);
  }, [filtroEstado, filtroNombre, precioMin, precioMax, busquedaGeneral]);

  const totalPaginas = Math.ceil(pedidosFiltrados.length / pedidosPorPagina);

  const pedidosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * pedidosPorPagina;
    return pedidosFiltrados.slice(inicio, inicio + pedidosPorPagina);
  }, [pedidosFiltrados, paginaActual]);

  const abrirConfirmacion = (pedido: Pedido, accion: 'aprobar' | 'cancelar') => {
    setPedidoEnProceso(pedido);
    setAccionModal(accion);
    setConfirmModalOpen(true);
  };

  const ejecutarAccion = async () => {
    if (!pedidoEnProceso || !accionModal) return;
    setProcesandoAccion(true);

    const nuevoEstado =
      accionModal === 'aprobar'
        ? 'Aprobado'
        : 'Cancelado por el Administrador';

    try {
      const res = await fetch('/api/admin/actualizarPedido', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_pedido: pedidoEnProceso.id_pedido,
          nuevo_estado: nuevoEstado,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          // Update local state
          setPedidos((prev) =>
            prev.map((p) =>
              p.id_pedido === pedidoEnProceso.id_pedido
                ? { ...p, estado: nuevoEstado }
                : p
            )
          );
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setProcesandoAccion(false);
      setConfirmModalOpen(false);
      setPedidoEnProceso(null);
      setAccionModal(null);
    }
  };

  const verDetalles = async (idPedido: number) => {
    setLoadingDetalles(true);
    setPedidoDetalle(null);
    setDetallesModalOpen(true);

    try {
      const res = await fetch(`/api/admin/pedidos/${idPedido}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPedidoDetalle(data.pedido);
        }
      }
    } catch (error) {
      console.error('Error loading order details:', error);
    } finally {
      setLoadingDetalles(false);
    }
  };

  const getEstadoBadgeStyle = (estado: string) => {
    switch (estado) {
      case 'Pendiente':
        return 'bg-ctp-peach/10 text-ctp-peach border border-ctp-peach/30';
      case 'Aprobado':
        return 'bg-ctp-green/10 text-ctp-green border border-ctp-green/30';
      case 'Cancelado por el Cliente':
      case 'Cancelado por el Administrador':
        return 'bg-ctp-red/10 text-ctp-red border border-ctp-red/30';
      default:
        return 'bg-theme-secondary/10 text-theme-secondary border border-theme/30';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-theme-text max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold font-pizza-title text-ctp-red text-center sm:text-left">
        Gestión de Pedidos 🍕
      </h1>

      {/* Filters Panel */}
      <div className="p-5 rounded-3xl border border-theme bg-theme-card shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-theme/40 pb-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <Filter size={16} className="text-ctp-mauve" />
            Filtros y Búsqueda
          </h2>
          <button
            onClick={resetFiltros}
            className="text-xs font-bold text-ctp-red hover:underline cursor-pointer"
          >
            Limpiar filtros
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-theme-secondary uppercase">Estado</label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-3 py-2 bg-theme-surface border border-theme/50 rounded-xl text-xs text-white outline-none cursor-pointer"
            >
              <option value="">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Cancelado por el Cliente">Cancelado por el Cliente</option>
              <option value="Cancelado por el Administrador">Cancelado por el Admin</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-theme-secondary uppercase">Cliente</label>
            <input
              type="text"
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
              placeholder="Nombre del cliente..."
              className="w-full px-3 py-2 bg-theme-surface border border-theme/50 rounded-xl text-xs text-white outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-theme-secondary uppercase">Precio Min ($)</label>
            <input
              type="number"
              min="0"
              value={precioMin}
              onChange={(e) => setPrecioMin(e.target.value)}
              placeholder="Min..."
              className="w-full px-3 py-2 bg-theme-surface border border-theme/50 rounded-xl text-xs text-white outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-theme-secondary uppercase">Precio Max ($)</label>
            <input
              type="number"
              min="0"
              value={precioMax}
              onChange={(e) => setPrecioMax(e.target.value)}
              placeholder="Max..."
              className="w-full px-3 py-2 bg-theme-surface border border-theme/50 rounded-xl text-xs text-white outline-none"
            />
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-theme-text/50" size={16} />
          <input
            type="text"
            value={busquedaGeneral}
            onChange={(e) => setBusquedaGeneral(e.target.value)}
            placeholder="Buscar por ID, cliente, estado, comentario..."
            className="w-full pl-9 pr-4 py-2 bg-theme-surface border border-theme/50 rounded-xl text-xs text-white outline-none"
          />
        </div>
      </div>

      {/* Grid of orders */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="w-8 h-8 border-4 border-ctp-mauve border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {pedidosFiltrados.length === 0 ? (
            <div className="text-center py-12 text-theme-secondary font-medium rounded-3xl border border-theme bg-theme-card">
              No hay pedidos que coincidan con los filtros 🔎
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pedidosPaginados.map((pedido) => (
                <div
                  key={pedido.id_pedido}
                  className="p-5 rounded-2xl border-2 border-ctp-red bg-theme-card hover:scale-[1.02] transition-transform duration-300 flex flex-col justify-between shadow-xl"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-bold text-theme-secondary uppercase tracking-wider">
                        ID: <span className="text-ctp-peach font-extrabold">#{pedido.id_pedido}</span>
                      </p>
                      <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-md uppercase tracking-wider ${getEstadoBadgeStyle(pedido.estado)}`}>
                        {pedido.estado}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs font-semibold text-theme-secondary">
                      <p className="uppercase tracking-wider">
                        Cliente: <span className="text-white normal-case font-medium">{pedido.nombre || 'Desconocido'}</span>
                      </p>
                      <p className="uppercase tracking-wider flex items-center gap-1">
                        <Clock size={12} className="text-ctp-mauve" />
                        Fecha:{' '}
                        <span className="text-white normal-case font-medium">
                          {new Date(pedido.fecha).toLocaleDateString()} {new Date(pedido.fecha).toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </p>
                      <p className="uppercase tracking-wider">
                        Total:{' '}
                        <span className="text-ctp-green font-extrabold">${parseFloat(pedido.total as any).toFixed(2)}</span>
                      </p>
                      {pedido.comentario && (
                        <p className="uppercase tracking-wider mt-1 text-ctp-peach italic">
                          Nota: <span className="normal-case font-medium text-white/90">{pedido.comentario}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-end gap-2 mt-4 pt-3 border-t border-theme/35">
                    {pedido.estado === 'Pendiente' && (
                      <button
                        onClick={() => abrirConfirmacion(pedido, 'aprobar')}
                        className="px-2.5 py-1.5 bg-ctp-green/20 hover:bg-ctp-green text-ctp-green hover:text-white border border-ctp-green/45 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Check size={12} />
                        Aprobar
                      </button>
                    )}

                    {pedido.estado !== 'Cancelado por el Cliente' &&
                      pedido.estado !== 'Cancelado por el Administrador' &&
                      pedido.estado !== 'Aprobado' && (
                        <button
                          onClick={() => abrirConfirmacion(pedido, 'cancelar')}
                          className="px-2.5 py-1.5 bg-ctp-red/20 hover:bg-ctp-red text-ctp-red hover:text-white border border-ctp-red/45 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={12} />
                          Cancelar
                        </button>
                      )}

                    <button
                      onClick={() => verDetalles(pedido.id_pedido)}
                      className="px-2.5 py-1.5 bg-theme hover:bg-theme-surface border border-theme rounded-lg text-[10px] font-bold uppercase text-white transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <List size={12} />
                      Detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPaginas > 1 && (
            <div className="flex justify-center items-center gap-4 pt-4">
              <button
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual((prev) => prev - 1)}
                className="p-2 border border-theme rounded-xl hover:bg-theme-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                &larr;
              </button>
              <span className="text-xs font-bold text-theme-secondary">
                Página {paginaActual} de {totalPaginas}
              </span>
              <button
                disabled={paginaActual === totalPaginas}
                onClick={() => setPaginaActual((prev) => prev + 1)}
                className="p-2 border border-theme rounded-xl hover:bg-theme-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                &rarr;
              </button>
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      {detallesModalOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-[#12121b] border border-theme rounded-2xl w-full max-w-[500px] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-theme/40 pb-3">
              <h3 className="text-lg font-bold text-white flex flex-col">
                <span>Detalles del Pedido</span>
                <span className="text-xs text-ctp-red font-pizza-title mt-0.5">Cliente: {pedidoDetalle?.nombre || 'Desconocido'}</span>
              </h3>
              <button onClick={() => setDetallesModalOpen(false)} className="text-theme-text/60 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {loadingDetalles ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-ctp-mauve border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : pedidoDetalle ? (
              <div className="space-y-4">
                {/* Pizzas */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-ctp-mauve uppercase tracking-wider border-b border-theme/45 pb-0.5">
                    Pizzas Ordenadas
                  </h4>
                  {pedidoDetalle.pizzas && pedidoDetalle.pizzas.length > 0 ? (
                    <ul className="space-y-2">
                      {pedidoDetalle.pizzas.map((p, idx) => (
                        <li key={idx} className="text-xs flex justify-between items-center bg-theme-surface p-2 rounded-lg border border-theme/35">
                          <div className="font-semibold text-white">
                            {p.nombre}{' '}
                            <span className="text-[10px] text-ctp-peach font-bold uppercase ml-2">
                              ({p.id_tamano})
                            </span>
                          </div>
                          <span className="text-theme-secondary font-bold">
                            Cant: <span className="text-white">{p.cantidad}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-theme-secondary italic">Ninguna pizza en este pedido.</p>
                  )}
                </div>

                {/* Products */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-ctp-mauve uppercase tracking-wider border-b border-theme/45 pb-0.5">
                    Complementos / Bebidas
                  </h4>
                  {pedidoDetalle.productos && pedidoDetalle.productos.length > 0 ? (
                    <ul className="space-y-2">
                      {pedidoDetalle.productos.map((prod, idx) => (
                        <li key={idx} className="text-xs flex justify-between items-center bg-theme-surface p-2 rounded-lg border border-theme/35">
                          <span className="font-semibold text-white">{prod.nombre}</span>
                          <span className="text-theme-secondary font-bold">
                            Cant: <span className="text-white">{prod.cantidad}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-theme-secondary italic">Ningún complemento en este pedido.</p>
                  )}
                </div>

                <div className="pt-2 flex justify-between items-center text-sm font-bold text-white border-t border-theme/40">
                  <span>Total a Pagar:</span>
                  <span className="text-ctp-green text-base">${parseFloat(pedidoDetalle.total as any).toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-theme-secondary">
                No se pudo cargar la información del pedido.
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setDetallesModalOpen(false)}
                className="px-6 py-2 bg-theme border border-theme hover:bg-theme-surface rounded-xl text-xs font-bold cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Action Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-[#12121b] border border-theme rounded-2xl w-full max-w-[400px] p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-theme/40 pb-2">
              <h3 className="text-md font-bold text-white flex items-center gap-1.5">
                <AlertTriangle size={18} className="text-ctp-peach" />
                {accionModal === 'aprobar' ? 'Confirmar Aprobación' : 'Confirmar Cancelación'}
              </h3>
              <button
                onClick={() => !procesandoAccion && setConfirmModalOpen(false)}
                className="text-theme-text/60 hover:text-white"
                disabled={procesandoAccion}
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-sm text-theme-secondary leading-relaxed">
              ¿Estás seguro de que deseas{' '}
              <span className="font-extrabold text-white">
                {accionModal === 'aprobar' ? 'aprobar' : 'cancelar'}
              </span>{' '}
              el pedido <span className="font-extrabold text-white">#{pedidoEnProceso?.id_pedido}</span>?
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={procesandoAccion}
                onClick={() => setConfirmModalOpen(false)}
                className="flex-1 py-2 bg-theme border border-theme hover:bg-theme-surface rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={procesandoAccion}
                onClick={ejecutarAccion}
                className={`flex-1 py-2 text-white rounded-xl text-xs font-bold hover:scale-102 transition-transform cursor-pointer disabled:opacity-50 flex items-center justify-center ${
                  accionModal === 'aprobar' ? 'bg-ctp-green hover:bg-ctp-green/85' : 'bg-ctp-red hover:bg-ctp-red/85'
                }`}
              >
                {procesandoAccion ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Confirmar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
