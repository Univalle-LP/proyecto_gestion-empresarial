'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, UserCheck, Shield, ChevronLeft, ChevronRight } from 'lucide-react';

interface Usuario {
  id: string;
  name: string;
  email: string;
  rol: string; // 'admin' or 'comun'
}

export default function AsignarAdminsPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  
  // Pagination
  const [paginaActual, setPaginaActual] = useState(1);
  const pageSize = 9;

  // Confirm Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const obtenerUsuarios = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/admins');
      if (res.ok) {
        setUsuarios(await res.json());
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const usuariosFiltrados = useMemo(() => {
    const term = filtro.trim().toLowerCase();
    if (!term) return usuarios;
    return usuarios.filter(
      (u) =>
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term)
    );
  }, [usuarios, filtro]);

  // Reset page when filter changes
  useEffect(() => {
    setPaginaActual(1);
  }, [filtro]);

  const totalPaginas = Math.ceil(usuariosFiltrados.length / pageSize);

  const usuariosPagina = useMemo(() => {
    const start = (paginaActual - 1) * pageSize;
    return usuariosFiltrados.slice(start, start + pageSize);
  }, [usuariosFiltrados, paginaActual]);

  const abrirConfirmacion = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
    setErrorMsg('');
    setSuccessMsg('');
    setModalOpen(true);
  };

  const hacerAdmin = async () => {
    if (!usuarioSeleccionado) return;
    setConfirmando(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: usuarioSeleccionado.id }),
      });

      if (res.ok) {
        setSuccessMsg(`¡${usuarioSeleccionado.name} ahora es administrador!`);
        await obtenerUsuarios();
        setTimeout(() => {
          setModalOpen(false);
          setUsuarioSeleccionado(null);
        }, 1500);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'No se pudo actualizar el rol del usuario.');
      }
    } catch (error) {
      setErrorMsg('Error de red al actualizar rol.');
    } finally {
      setConfirmando(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-theme-text max-w-5xl mx-auto">
      <h1 className="text-3xl font-extrabold font-pizza-title text-ctp-red text-center sm:text-left">
        Gestión de Administradores 🛡️
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="w-8 h-8 border-4 border-ctp-mauve border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="p-6 md:p-8 rounded-3xl border border-theme bg-theme-card shadow-xl space-y-6">
          {/* Search Toolbar */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-3 text-theme-text/50" size={16} />
            <input
              type="text"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Buscar por nombre o correo..."
              className="w-full pl-9 pr-4 py-2 bg-theme-surface border border-theme/50 rounded-xl text-xs text-white outline-none"
            />
          </div>

          {/* Grid List */}
          {usuariosFiltrados.length === 0 ? (
            <div className="text-center py-12 text-theme-secondary font-medium">
              No se encontraron usuarios. 🧑‍🍳
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {usuariosPagina.map((usuario) => (
                <div
                  key={usuario.id}
                  className={`p-5 rounded-2xl border-2 bg-theme-surface hover:scale-[1.02] transition-transform duration-300 flex flex-col justify-between ${
                    usuario.rol === 'admin' ? 'border-ctp-red bg-ctp-red/5' : 'border-theme/60'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Shield
                        size={18}
                        className={usuario.rol === 'admin' ? 'text-ctp-red' : 'text-theme-secondary/40'}
                      />
                      <h2 className="text-lg font-bold text-white truncate max-w-[200px]" title={usuario.name}>
                        {usuario.name || 'Sin nombre'}
                      </h2>
                    </div>
                    <p className="text-xs text-theme-secondary truncate font-medium" title={usuario.email}>
                      {usuario.email}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-theme/35">
                    {usuario.rol === 'admin' ? (
                      <div className="w-full text-center py-2 bg-ctp-red/10 text-ctp-red border border-ctp-red/20 rounded-xl text-xs font-bold uppercase tracking-wider">
                        Administrador
                      </div>
                    ) : (
                      <button
                        onClick={() => abrirConfirmacion(usuario)}
                        className="w-full py-2 bg-ctp-mauve text-white rounded-xl text-xs font-bold hover:scale-102 transition-transform cursor-pointer pulse-button flex items-center justify-center gap-1.5"
                      >
                        <UserCheck size={14} />
                        Hacer Admin
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPaginas > 1 && (
            <div className="flex justify-center items-center gap-4 pt-4">
              <button
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual((prev) => prev - 1)}
                className="p-2 border border-theme rounded-xl hover:bg-theme-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold text-theme-secondary">
                Página {paginaActual} de {totalPaginas}
              </span>
              <button
                disabled={paginaActual === totalPaginas}
                onClick={() => setPaginaActual((prev) => prev + 1)}
                className="p-2 border border-theme rounded-xl hover:bg-theme-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Confirm Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-[#12121b] border border-theme rounded-2xl w-full max-w-[400px] p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-theme/40 pb-2">
              <h3 className="text-md font-bold text-white">Confirmar Acción</h3>
              <button
                onClick={() => !confirmando && setModalOpen(false)}
                className="text-theme-text/60 hover:text-white disabled:opacity-50"
                disabled={confirmando}
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-sm text-theme-secondary leading-relaxed">
              ¿Estás seguro de que deseas hacer administrador a{' '}
              <span className="font-extrabold text-white">{usuarioSeleccionado?.name}</span>?
              <p className="text-xs text-ctp-peach font-bold mt-2">
                ⚠️ Esta acción le otorgará privilegios completos de administración del sistema.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-ctp-red/10 text-ctp-red text-xs font-bold rounded-xl border border-ctp-red/20">
                ⚠️ {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-ctp-green/10 text-ctp-green text-xs font-bold rounded-xl border border-ctp-green/20">
                ✅ {successMsg}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={confirmando}
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2 bg-theme border border-theme hover:bg-theme-surface rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={confirmando}
                onClick={hacerAdmin}
                className="flex-1 py-2 bg-ctp-mauve text-white rounded-xl text-xs font-bold hover:scale-102 transition-transform cursor-pointer disabled:opacity-50 flex items-center justify-center"
              >
                {confirmando ? (
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
