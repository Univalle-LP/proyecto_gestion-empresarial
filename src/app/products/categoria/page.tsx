'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';

interface Categoria {
  id_categoria: number;
  nombre: string;
  precio_extra: string;
}

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Categoria | null>(null);
  const [nombre, setNombre] = useState('');
  const [precioExtra, setPrecioExtra] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadCategorias = async () => {
    try {
      const res = await fetch('/api/products/categoria');
      if (res.ok) {
        setCategorias(await res.json());
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategorias();
  }, []);

  const openAddModal = () => {
    setEditingCat(null);
    setNombre('');
    setPrecioExtra('');
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEditModal = (cat: Categoria) => {
    setEditingCat(cat);
    setNombre(cat.nombre);
    setPrecioExtra(parseFloat(cat.precio_extra).toString());
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!nombre.trim() || !precioExtra.trim()) {
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }

    const price = parseFloat(precioExtra);
    if (isNaN(price) || price < 0) {
      setErrorMsg('El precio extra debe ser un número positivo.');
      return;
    }

    try {
      const url = '/api/products/categoria';
      const method = editingCat ? 'PUT' : 'POST';
      const body = editingCat
        ? [{ id_categoria: editingCat.id_categoria, nombre, precio_extra: price }]
        : { nombre, precio_extra: price };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setModalOpen(false);
        loadCategorias();
      } else {
        const errData = await res.json();
        setErrorMsg(errData.error || 'Error al guardar.');
      }
    } catch (error) {
      setErrorMsg('Ocurrió un error inesperado.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta categoría?')) return;

    try {
      const res = await fetch('/api/products/categoria', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_categoria: id }),
      });

      if (res.ok) {
        loadCategorias();
      } else {
        alert('Error al eliminar la categoría');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const filteredCategorias = categorias.filter((cat) =>
    cat.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in text-theme-text max-w-5xl mx-auto">
      <h1 className="text-3xl font-extrabold font-pizza-title text-ctp-red text-center sm:text-left">
        Categorías
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="w-8 h-8 border-4 border-ctp-mauve border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="p-6 md:p-8 rounded-3xl border border-theme bg-theme-card shadow-xl space-y-6">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-3 text-theme-text/50" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar categoría..."
                className="w-full pl-9 pr-4 py-2 bg-theme-surface border border-theme/50 rounded-xl text-xs text-white outline-none"
              />
            </div>

            <button
              onClick={openAddModal}
              className="w-full sm:w-auto px-6 py-2.5 bg-ctp-mauve text-white text-xs font-bold rounded-xl shadow-md hover:scale-103 transition-transform flex items-center justify-center gap-2 cursor-pointer pulse-button"
            >
              <Plus size={14} />
              Agregar Categoría
            </button>
          </div>

          {/* Grid list */}
          {filteredCategorias.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategorias.map((cat) => (
                <div
                  key={cat.id_categoria}
                  className="p-5 rounded-2xl border-2 border-ctp-red bg-theme-surface hover:scale-[1.02] transition-transform duration-300 flex flex-col justify-between"
                >
                  <div>
                    <h2 className="text-xl font-bold font-pizza-title text-ctp-red mb-2">{cat.nombre}</h2>
                    <p className="text-xs font-semibold text-theme-secondary uppercase tracking-wider">
                      Precio Extra:{' '}
                      <span className="text-ctp-peach font-bold">${parseFloat(cat.precio_extra).toFixed(2)}</span>
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-theme/35">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-2 text-ctp-blue hover:bg-ctp-blue/10 rounded-full transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id_categoria)}
                      className="p-2 text-ctp-red hover:bg-ctp-red/10 rounded-full transition-colors cursor-pointer"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-theme-secondary font-medium">
              No se encontró la categoría 🧑‍🍳
            </div>
          )}
        </div>
      )}

      {/* Add / Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-[#12121b] border border-theme rounded-2xl w-full max-w-[440px] p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-theme/40 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingCat ? '✏️ Editar Categoría' : '➕ Agregar Categoría'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-theme-text/60 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-theme-secondary uppercase">Nombre de Categoría</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Especiales, Bebidas, etc."
                  required
                  className="w-full px-4 py-2.5 bg-theme-surface border border-theme/50 rounded-xl text-sm text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-theme-secondary uppercase">Precio Extra</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={precioExtra}
                  onChange={(e) => setPrecioExtra(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full px-4 py-2.5 bg-theme-surface border border-theme/50 rounded-xl text-sm text-white focus:outline-none"
                />
              </div>

              {errorMsg && (
                <div className="p-3 bg-ctp-red/10 text-ctp-red text-xs font-bold rounded-xl border border-ctp-red/20">
                  ⚠️ {errorMsg}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 border border-theme hover:bg-theme-surface rounded-xl text-sm font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-ctp-mauve text-white rounded-xl text-sm font-bold shadow hover:scale-102 transition-transform cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
