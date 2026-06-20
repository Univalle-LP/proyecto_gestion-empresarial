'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Search, RefreshCw, Filter, Calendar, Info, ChevronDown, ChevronRight, Eye, Database } from 'lucide-react';

interface AuditLog {
  id: number;
  id_usuario: string | null;
  accion: string;
  entidad: string | null;
  entidad_id: string | null;
  detalles: any;
  fecha: string;
  usuario_email: string | null;
  usuario_nombre: string | null;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filtroAccion, setFiltroAccion] = useState('');
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [busquedaDetalles, setBusquedaDetalles] = useState('');
  
  // Expand details row state
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const cargarLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/logs');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setLogs(data.logs || []);
        }
      }
    } catch (err) {
      console.error('Error loading logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarLogs();
  }, []);

  const toggleRow = (id: number) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter actions list
  const uniqueActions = useMemo(() => {
    return Array.from(new Set(logs.map(l => l.accion))).sort();
  }, [logs]);

  const logsFiltrados = useMemo(() => {
    return logs.filter(log => {
      const coincideAccion = !filtroAccion || log.accion === filtroAccion;
      
      const coincideUsuario = !filtroUsuario || 
        (log.usuario_nombre?.toLowerCase() || '').includes(filtroUsuario.toLowerCase()) ||
        (log.usuario_email?.toLowerCase() || '').includes(filtroUsuario.toLowerCase()) ||
        (log.id_usuario || '').includes(filtroUsuario);
      
      const detallesString = log.detalles ? JSON.stringify(log.detalles).toLowerCase() : '';
      const coincideDetalles = !busquedaDetalles || detallesString.includes(busquedaDetalles.toLowerCase());

      return coincideAccion && coincideUsuario && coincideDetalles;
    });
  }, [logs, filtroAccion, filtroUsuario, busquedaDetalles]);

  // Statistics
  const stats = useMemo(() => {
    const total = logs.length;
    const logins = logs.filter(l => l.accion === 'LOGIN').length;
    const pedidos = logs.filter(l => l.accion === 'CREAR_PEDIDO').length;
    const configs = logs.filter(l => l.accion === 'MODIFICAR_CONFIGURACION_MARCA').length;
    
    return { total, logins, pedidos, configs };
  }, [logs]);

  const getActionBadgeClass = (accion: string) => {
    switch (accion) {
      case 'LOGIN':
        return 'bg-ctp-green/20 text-ctp-green border-ctp-green/30';
      case 'CREAR_PEDIDO':
        return 'bg-ctp-mauve/20 text-ctp-mauve border-ctp-mauve/30';
      case 'CANCELAR_PEDIDO_CLIENTE':
      case 'ELIMINAR_OFERTA':
        return 'bg-ctp-red/20 text-ctp-red border-ctp-red/30';
      case 'ACTUALIZAR_PEDIDO_ADMIN':
        return 'bg-ctp-blue/20 text-ctp-blue border-ctp-blue/30';
      case 'MODIFICAR_OFERTA':
      case 'CREAR_OFERTA':
        return 'bg-ctp-peach/20 text-ctp-peach border-ctp-peach/30';
      case 'MODIFICAR_CONFIGURACION_MARCA':
        return 'bg-ctp-yellow/20 text-ctp-yellow border-ctp-yellow/30';
      default:
        return 'bg-theme-surface/50 text-theme-text/80 border border-theme/40';
    }
  };

  const getFechaFormateada = (fechaStr: string) => {
    const d = new Date(fechaStr);
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in text-theme-text max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-extrabold font-pizza-title text-ctp-red flex items-center gap-3">
          <Database size={30} />
          Logs de Auditoría
        </h1>
        <button
          onClick={cargarLogs}
          disabled={loading}
          className="px-4 py-2.5 bg-theme-surface hover:bg-theme-surface/75 border border-theme rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refrescar Logs
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="p-5 bg-theme-card border border-theme rounded-2xl shadow space-y-2">
          <p className="text-[10px] text-theme-secondary uppercase font-bold tracking-wider">Eventos Totales (Recientes)</p>
          <p className="text-3xl font-extrabold text-white">{stats.total}</p>
        </div>
        <div className="p-5 bg-theme-card border border-theme rounded-2xl shadow space-y-2">
          <p className="text-[10px] text-theme-secondary uppercase font-bold tracking-wider">Inicios de Sesión</p>
          <p className="text-3xl font-extrabold text-ctp-green">{stats.logins}</p>
        </div>
        <div className="p-5 bg-theme-card border border-theme rounded-2xl shadow space-y-2">
          <p className="text-[10px] text-theme-secondary uppercase font-bold tracking-wider">Pedidos Creados</p>
          <p className="text-3xl font-extrabold text-ctp-mauve">{stats.pedidos}</p>
        </div>
        <div className="p-5 bg-theme-card border border-theme rounded-2xl shadow space-y-2">
          <p className="text-[10px] text-theme-secondary uppercase font-bold tracking-wider">Cambios de Configuración</p>
          <p className="text-3xl font-extrabold text-ctp-yellow">{stats.configs}</p>
        </div>
      </div>

      {/* Filters Panel */}
      <div className="p-5 rounded-2xl border border-theme bg-theme-card shadow-lg space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5 border-b border-theme/40 pb-2">
          <Filter size={14} className="text-ctp-mauve" />
          Filtros de Búsqueda
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-theme-secondary uppercase">Acción</label>
            <select
              value={filtroAccion}
              onChange={(e) => setFiltroAccion(e.target.value)}
              className="w-full px-3 py-2 bg-theme-surface border border-theme/50 rounded-xl text-xs text-white outline-none cursor-pointer"
            >
              <option value="">Todas las acciones</option>
              {uniqueActions.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-theme-secondary uppercase">Usuario (Nombre/Correo/UUID)</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 text-theme-text/40" size={14} />
              <input
                type="text"
                value={filtroUsuario}
                onChange={(e) => setFiltroUsuario(e.target.value)}
                placeholder="Buscar usuario..."
                className="w-full pl-8 pr-3 py-2 bg-theme-surface border border-theme/50 rounded-xl text-xs text-white outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-theme-secondary uppercase">Buscar en Detalles (JSON)</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 text-theme-text/40" size={14} />
              <input
                type="text"
                value={busquedaDetalles}
                onChange={(e) => setBusquedaDetalles(e.target.value)}
                placeholder="Ej. 'Aprobado', 'pizza'..."
                className="w-full pl-8 pr-3 py-2 bg-theme-surface border border-theme/50 rounded-xl text-xs text-white outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="w-8 h-8 border-4 border-ctp-mauve border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl border border-theme bg-theme-card shadow-xl overflow-x-auto">
          {logsFiltrados.length === 0 ? (
            <div className="text-center py-12 text-theme-secondary font-medium">
              No se encontraron registros de logs que coincidan con los filtros 🔎
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-theme/40 text-xs font-bold text-theme-secondary uppercase tracking-wider pb-3">
                  <th className="py-3 px-2 w-8"></th>
                  <th className="py-3 px-2">Fecha y Hora</th>
                  <th className="py-3 px-2">Usuario</th>
                  <th className="py-3 px-2">Acción</th>
                  <th className="py-3 px-2">Entidad Afectada</th>
                  <th className="py-3 px-2 text-right">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme/35 text-xs">
                {logsFiltrados.map((log) => {
                  const isExpanded = expandedRows[log.id];
                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-theme-surface/30 transition-colors">
                        <td className="py-3 px-2 text-center">
                          <button
                            onClick={() => toggleRow(log.id)}
                            className="text-theme-text/60 hover:text-white cursor-pointer"
                          >
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>
                        </td>
                        <td className="py-3 px-2 font-medium text-white/95">
                          {getFechaFormateada(log.fecha)}
                        </td>
                        <td className="py-3 px-2">
                          {log.usuario_email ? (
                            <div className="flex flex-col">
                              <span className="font-bold text-white/90">{log.usuario_nombre || 'Sin nombre'}</span>
                              <span className="text-[10px] text-theme-secondary font-medium">{log.usuario_email}</span>
                            </div>
                          ) : (
                            <span className="text-theme-text/40 italic">Sistema / Anónimo</span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border tracking-wider ${getActionBadgeClass(log.accion)}`}>
                            {log.accion}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          {log.entidad ? (
                            <span className="font-semibold text-white/90">
                              {log.entidad} <span className="text-[10px] text-ctp-peach font-bold">#{log.entidad_id}</span>
                            </span>
                          ) : (
                            <span className="text-theme-text/40 italic">N/A</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <button
                            onClick={() => toggleRow(log.id)}
                            className="px-2.5 py-1 bg-theme-surface hover:bg-theme border border-theme rounded-lg font-bold text-[10px] text-white uppercase inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye size={10} />
                            {isExpanded ? 'Ocultar' : 'Ver'}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-theme-surface/20">
                          <td colSpan={6} className="py-4 px-6 border-b border-theme/40">
                            <div className="space-y-3">
                              <div className="flex justify-between items-center text-[10px] uppercase font-bold text-theme-secondary tracking-wider">
                                <span>ID del Log: #{log.id}</span>
                                <span>ID del Usuario: {log.id_usuario || 'N/A'}</span>
                              </div>
                              <pre className="p-4 rounded-xl bg-[#0a0a0f] border border-theme/50 text-[11px] font-mono text-ctp-green overflow-x-auto leading-relaxed shadow-inner">
                                {JSON.stringify(log.detalles, null, 2)}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
