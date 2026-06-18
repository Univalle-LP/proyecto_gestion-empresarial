'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';

interface Ingrediente {
  id_ingrediente: number;
  nombre: string;
  costo_unitario: string; // postgres returns numeric as string
  tipo: string;
}

const TIPOS_INGREDIENTE = [
  'Vegetal',
  'Cárnico',
  'Lácteo',
  'Mariscos',
  'Frutas',
  'Salsas',
  'Otro',
];

const PALABRAS_PROHIBIDAS = [
  'select', 'insert', 'update', 'delete', 'drop', 'truncate', 'exec', 'execute',
  'union', 'sleep', 'benchmark', 'or 1=1', 'and 1=1', 'or true', 'is null',
  '--', ';--', ';', '/*', '*/', '@@', '@', 'char', 'nchar', 'varchar', 'nvarchar',
  'alter', 'begin', 'cast', 'create', 'cursor', 'declare', 'end', 'fetch',
  'kill', 'open', 'sys', 'sysobjects', 'syscolumns', 'information_schema',
  '<', '>', 'script', '/script', 'alert', 'onerror', 'onload', 'onmouseover',
  'onfocus', 'onmouseenter', 'onmouseleave', 'onchange', 'onclick', 'confirm',
  'prompt', 'eval', 'document', 'window', 'parent', 'console.log', 'Function',
  'setTimeout', 'setInterval', 'iframe', 'href', 'src=', 'javascript:',
  'data:', 'base64', 'encodeURI', 'decodeURI',
  'tonto', 'burro', 'idiota', 'estúpido', 'imbécil', 'pendejo', 'bobo', 'menso',
  'inútil', 'feo', 'puto', 'puta', 'mierda', 'cabron', 'maldito', 'diablo', 'jaja',
  'jeje', 'lol', 'xd', 'lmao', 'noob', 'wtf', 'asqueroso', 'perra', 'cerdo'
];

const PATRONES_INVALIDOS = [
  /\b[xj]{1,5}[djs]{1,10}\b/i, // xd, xddd, jajsjd
  /\b(?:ja|je|jo|ju|ji|lol|lmao|uwu|owo|nwn){2,}\b/i,
  /\b(\w{2,})\b(?:\s+\1\b){2,}/i,
  /([a-záéíóúüñ])\1{3,}/i,
  /([!@#$%^&*()_+={}\[\]:;"'<>,.?\\/|`~°¬\-])\1{2,}/,
  /^[ \t\r\n]+$/,
];

export default function IngredientesPage() {
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIng, setEditingIng] = useState<Ingrediente | null>(null);
  const [nombre, setNombre] = useState('');
  const [costoUnitario, setCostoUnitario] = useState('');
  const [tipo, setTipo] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadIngredientes = async () => {
    try {
      const res = await fetch('/api/products/ingrediente');
      if (res.ok) {
        setIngredientes(await res.json());
      }
    } catch (error) {
      console.error('Error loading ingredients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIngredientes();
  }, []);

  const openAddModal = () => {
    setEditingIng(null);
    setNombre('');
    setCostoUnitario('');
    setTipo('');
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEditModal = (ing: Ingrediente) => {
    setEditingIng(ing);
    setNombre(ing.nombre);
    setCostoUnitario(parseFloat(ing.costo_unitario).toString());
    setTipo(ing.tipo);
    setErrorMsg('');
    setModalOpen(true);
  };

  const validateForm = (): boolean => {
    const nameTrimmed = nombre.trim();
    if (!nameTrimmed) {
      setErrorMsg('El nombre es obligatorio.');
      return false;
    }
    if (nameTrimmed.length < 3 || nameTrimmed.length > 50) {
      setErrorMsg('El nombre debe tener entre 3 y 50 caracteres.');
      return false;
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(nameTrimmed)) {
      setErrorMsg('Solo letras y espacios permitidos en el nombre.');
      return false;
    }

    const contieneProhibida = PALABRAS_PROHIBIDAS.some((p) =>
      nameTrimmed.toLowerCase().includes(p)
    );
    if (contieneProhibida) {
      setErrorMsg('El nombre contiene palabras no permitidas.');
      return false;
    }

    const tienePatronInvalido = PATRONES_INVALIDOS.some((r) => r.test(nameTrimmed));
    if (tienePatronInvalido) {
      setErrorMsg('El nombre tiene un patrón no válido.');
      return false;
    }

    if (!costoUnitario) {
      setErrorMsg('El costo es obligatorio.');
      return false;
    }
    const cost = parseFloat(costoUnitario);
    if (isNaN(cost) || cost < 1) {
      setErrorMsg('El costo debe ser mayor o igual a 1.');
      return false;
    }
    if (cost > 500) {
      setErrorMsg('El costo no debe superar los $500.');
      return false;
    }
    if (!/^\d{1,3}(\.\d{1,2})?$/.test(costoUnitario)) {
      setErrorMsg('Máximo 2 decimales permitidos.');
      return false;
    }

    if (!tipo || !TIPOS_INGREDIENTE.includes(tipo)) {
      setErrorMsg('Debe seleccionar un tipo de ingrediente válido.');
      return false;
    }

    return true;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!validateForm()) return;

    try {
      const url = '/api/products/ingrediente';
      const method = editingIng ? 'PUT' : 'POST';
      
      const cost = parseFloat(costoUnitario);
      const body = editingIng
        ? [{ id_ingrediente: editingIng.id_ingrediente, nombre, costo_unitario: cost, tipo }]
        : { nombre, costo_unitario: cost, tipo };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setModalOpen(false);
        loadIngredientes();
      } else {
        const errData = await res.json();
        setErrorMsg(errData.error || 'Error al guardar.');
      }
    } catch (error) {
      setErrorMsg('Ocurrió un error inesperado.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este ingrediente?')) return;

    try {
      const res = await fetch('/api/products/ingrediente', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_ingrediente: id }),
      });

      if (res.ok) {
        loadIngredientes();
      } else {
        alert('Error al eliminar ingrediente');
      }
    } catch (error) {
      console.error('Error deleting ingredient:', error);
    }
  };

  const filteredIngredientes = ingredientes.filter((ing) => {
    const matchesSearch = ing.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const tiposDefinidos = ['Vegetal', 'Cárnico', 'Lácteo', 'Mariscos', 'Frutas', 'Salsas'];
    const matchesTipo =
      !selectedTipo ||
      (selectedTipo === 'Otro'
        ? !tiposDefinidos.includes(ing.tipo)
        : ing.tipo === selectedTipo);
    return matchesSearch && matchesTipo;
  });

  return (
    <div className="space-y-6 animate-fade-in text-theme-text max-w-5xl mx-auto">
      <h1 className="text-3xl font-extrabold font-pizza-title text-ctp-red text-center sm:text-left">
        Ingredientes 🧑‍🍳
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="w-8 h-8 border-4 border-ctp-mauve border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="p-6 md:p-8 rounded-3xl border border-theme bg-theme-card shadow-xl space-y-6">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 text-theme-text/50" size={16} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar ingrediente..."
                  className="w-full pl-9 pr-4 py-2 bg-theme-surface border border-theme/50 rounded-xl text-xs text-white outline-none"
                />
              </div>

              <select
                value={selectedTipo}
                onChange={(e) => setSelectedTipo(e.target.value)}
                className="px-3 py-2 bg-theme-surface border border-theme/50 rounded-xl text-xs text-white outline-none cursor-pointer"
              >
                <option value="">Todos los Tipos</option>
                {TIPOS_INGREDIENTE.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={openAddModal}
              className="w-full sm:w-auto px-6 py-2.5 bg-ctp-mauve text-white text-xs font-bold rounded-xl shadow-md hover:scale-103 transition-transform flex items-center justify-center gap-2 cursor-pointer pulse-button"
            >
              <Plus size={14} />
              Agregar Ingrediente
            </button>
          </div>

          {/* Grid list */}
          {filteredIngredientes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIngredientes.map((ing) => (
                <div
                  key={ing.id_ingrediente}
                  className="p-5 rounded-2xl border-2 border-ctp-red bg-theme-surface hover:scale-[1.02] transition-transform duration-300 flex flex-col justify-between"
                >
                  <div>
                    <h2 className="text-xl font-bold font-pizza-title text-ctp-red mb-2">{ing.nombre}</h2>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-theme-secondary uppercase tracking-wider">
                        Costo Unitario:{' '}
                        <span className="text-ctp-peach font-bold">${parseFloat(ing.costo_unitario).toFixed(2)}</span>
                      </p>
                      <p className="text-xs font-semibold text-theme-secondary uppercase tracking-wider flex items-center gap-2">
                        Tipo:{' '}
                        <span className="px-2 py-0.5 bg-ctp-peach/10 text-ctp-peach text-[10px] font-extrabold rounded-md border border-ctp-peach/25 uppercase">
                          {ing.tipo}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-theme/35">
                    <button
                      onClick={() => openEditModal(ing)}
                      className="p-2 text-ctp-blue hover:bg-ctp-blue/10 rounded-full transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(ing.id_ingrediente)}
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
              No se encontró el ingrediente 🧑‍🍳
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
                {editingIng ? '✏️ Editar Ingrediente' : '➕ Agregar Ingrediente'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-theme-text/60 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-theme-secondary uppercase">Nombre del Ingrediente</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Pepperoni, Champiñones, etc."
                  required
                  className="w-full px-4 py-2.5 bg-theme-surface border border-theme/50 rounded-xl text-sm text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-theme-secondary uppercase">Costo Unitario ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={costoUnitario}
                  onChange={(e) => setCostoUnitario(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full px-4 py-2.5 bg-theme-surface border border-theme/50 rounded-xl text-sm text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-theme-secondary uppercase">Tipo de Ingrediente</label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-theme-surface border border-theme/50 rounded-xl text-sm text-white focus:outline-none cursor-pointer"
                >
                  <option value="">Seleccione un tipo</option>
                  {TIPOS_INGREDIENTE.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
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
