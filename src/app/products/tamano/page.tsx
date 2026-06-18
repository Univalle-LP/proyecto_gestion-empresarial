'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';

interface Tamano {
  id_tamano: number;
  nombre: string;
  descripcion: string;
  precio_base: string; // postgres returns numeric as string
}

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
  /\b[xj]{1,5}[djs]{1,10}\b/i,
  /\b(?:ja|je|jo|ju|ji|lol|lmao|uwu|owo|nwn){2,}\b/i,
  /\b(\w{2,})\b(?:\s+\1\b){2,}/i,
  /([a-záéíóúüñ])\1{3,}/i,
  /([!@#$%^&*()_+={}\[\]:;"'<>,.?\\/|`~°¬\-])\1{2,}/,
];

export default function TamanosPage() {
  const [tamanos, setTamanos] = useState<Tamano[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTam, setEditingTam] = useState<Tamano | null>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precioBase, setPrecioBase] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadTamanos = async () => {
    try {
      const res = await fetch('/api/products/tamano');
      if (res.ok) {
        setTamanos(await res.json());
      }
    } catch (error) {
      console.error('Error loading sizes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTamanos();
  }, []);

  const openAddModal = () => {
    setEditingTam(null);
    setNombre('');
    setDescripcion('');
    setPrecioBase('');
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEditModal = (tam: Tamano) => {
    setEditingTam(tam);
    setNombre(tam.nombre);
    setDescripcion(tam.descripcion);
    setPrecioBase(parseFloat(tam.precio_base).toString());
    setErrorMsg('');
    setModalOpen(true);
  };

  const validateForm = (): boolean => {
    const nameTrimmed = nombre.trim();
    const descTrimmed = descripcion.trim();

    if (!nameTrimmed) {
      setErrorMsg('El nombre es obligatorio.');
      return false;
    }
    if (nameTrimmed.length > 50) {
      setErrorMsg('El nombre no puede exceder los 50 caracteres.');
      return false;
    }

    const contieneProhibida = PALABRAS_PROHIBIDAS.some((p) =>
      nameTrimmed.toLowerCase().includes(p) || descTrimmed.toLowerCase().includes(p)
    );
    if (contieneProhibida) {
      setErrorMsg('El formulario contiene palabras no permitidas.');
      return false;
    }

    const tienePatronInvalido = PATRONES_INVALIDOS.some((r) =>
      r.test(nameTrimmed) || r.test(descTrimmed)
    );
    if (tienePatronInvalido) {
      setErrorMsg('El formulario contiene patrones no válidos.');
      return false;
    }

    if (!descTrimmed) {
      setErrorMsg('La descripción es obligatoria.');
      return false;
    }

    if (!precioBase) {
      setErrorMsg('El precio base es obligatorio.');
      return false;
    }
    const valPrecio = parseFloat(precioBase);
    if (isNaN(valPrecio) || valPrecio < 0) {
      setErrorMsg('El precio base debe ser un número positivo o cero.');
      return false;
    }

    return true;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!validateForm()) return;

    try {
      const url = '/api/products/tamano';
      const method = editingTam ? 'PUT' : 'POST';
      
      const priceVal = parseFloat(precioBase);

      // PUT expects array of 1 element, POST expects single object
      const body = editingTam
        ? [{ id_tamano: editingTam.id_tamano, nombre, descripcion, precio_base: priceVal }]
        : { nombre, descripcion, precio_base: priceVal };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setModalOpen(false);
        loadTamanos();
      } else {
        const errData = await res.json();
        setErrorMsg(errData.error || 'Error al guardar.');
      }
    } catch (error) {
      setErrorMsg('Ocurrió un error inesperado.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este tamaño?')) return;

    try {
      const res = await fetch('/api/products/tamano', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_tamano: id }),
      });

      if (res.ok) {
        loadTamanos();
      } else {
        alert('Error al eliminar tamaño');
      }
    } catch (error) {
      console.error('Error deleting size:', error);
    }
  };

  const filteredTamanos = tamanos.filter((tam) =>
    tam.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in text-theme-text max-w-5xl mx-auto">
      <h1 className="text-3xl font-extrabold font-pizza-title text-ctp-red text-center sm:text-left">
        Tamaños 🍕
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
                placeholder="Buscar tamaño..."
                className="w-full pl-9 pr-4 py-2 bg-theme-surface border border-theme/50 rounded-xl text-xs text-white outline-none"
              />
            </div>

            <button
              onClick={openAddModal}
              className="w-full sm:w-auto px-6 py-2.5 bg-ctp-mauve text-white text-xs font-bold rounded-xl shadow-md hover:scale-103 transition-transform flex items-center justify-center gap-2 cursor-pointer pulse-button"
            >
              <Plus size={14} />
              Agregar Tamaño
            </button>
          </div>

          {/* Grid list */}
          {filteredTamanos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTamanos.map((tam) => (
                <div
                  key={tam.id_tamano}
                  className="p-5 rounded-2xl border-2 border-ctp-red bg-theme-surface hover:scale-[1.02] transition-transform duration-300 flex flex-col justify-between"
                >
                  <div>
                    <h2 className="text-xl font-bold font-pizza-title text-ctp-red mb-2">{tam.nombre}</h2>
                    <div className="space-y-1.5 text-xs font-semibold text-theme-secondary">
                      <p className="uppercase tracking-wider">
                        Descripción: <span className="text-white normal-case font-medium">{tam.descripcion}</span>
                      </p>
                      <p className="uppercase tracking-wider">
                        Precio Base:{' '}
                        <span className="text-ctp-green font-extrabold">${parseFloat(tam.precio_base).toFixed(2)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-theme/35">
                    <button
                      onClick={() => openEditModal(tam)}
                      className="p-2 text-ctp-blue hover:bg-ctp-blue/10 rounded-full transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(tam.id_tamano)}
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
              No se encontró ningún tamaño 🍕
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
                {editingTam ? '✏️ Editar Tamaño' : '➕ Agregar Tamaño'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-theme-text/60 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-theme-secondary uppercase">Nombre del Tamaño</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Personal, Mediana, Familiar, etc."
                  required
                  className="w-full px-4 py-2.5 bg-theme-surface border border-theme/50 rounded-xl text-sm text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-theme-secondary uppercase">Descripción</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Ej. Pizza de 4 porciones ideal para una persona..."
                  required
                  rows={2}
                  className="w-full px-4 py-2.5 bg-theme-surface border border-theme/50 rounded-xl text-sm text-white focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-theme-secondary uppercase">Precio Base ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={precioBase}
                  onChange={(e) => setPrecioBase(e.target.value)}
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
