'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, List, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Pizza {
  id_pizza: number;
  nombre: string;
  descripcion: string;
  precio_base: string; // postgres returns numeric as string
}

interface IngredienteAsociado {
  id_ingrediente: number;
  nombre: string;
  cantidad: number;
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
  /\b[xj]{1,5}[djs]{1,10}\b/i, // xd, xddd
  /\b(?:ja|je|jo|ju|ji|lol|lmao|uwu|owo|nwn){2,}\b/i,
  /\b(\w{2,})\b(?:\s+\1\b){2,}/i,
  /([a-záéíóúüñ])\1{3,}/i,
  /([!@#$%^&*()_+={}\[\]:;"'<>,.?\\/|`~°¬\-])\1{2,}/,
];

export default function PizzasPage() {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPizza, setEditingPizza] = useState<Pizza | null>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // View Ingredients modal
  const [ingredientesModalOpen, setIngredientesModalOpen] = useState(false);
  const [selectedPizza, setSelectedPizza] = useState<Pizza | null>(null);
  const [ingredientes, setIngredientes] = useState<IngredienteAsociado[]>([]);
  const [loadingIngredientes, setLoadingIngredientes] = useState(false);

  const loadPizzas = async () => {
    try {
      const res = await fetch('/api/products/pizza');
      if (res.ok) {
        setPizzas(await res.json());
      }
    } catch (error) {
      console.error('Error loading pizzas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPizzas();
  }, []);

  const openAddModal = () => {
    setEditingPizza(null);
    setNombre('');
    setDescripcion('');
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEditModal = (pizza: Pizza) => {
    setEditingPizza(pizza);
    setNombre(pizza.nombre);
    setDescripcion(pizza.descripcion);
    setErrorMsg('');
    setModalOpen(true);
  };

  const openIngredientesModal = async (pizza: Pizza) => {
    setSelectedPizza(pizza);
    setIngredientesModalOpen(true);
    setLoadingIngredientes(true);
    setIngredientes([]);

    try {
      const res = await fetch(`/api/products/pizzaIngrediente?id_pizza=${pizza.id_pizza}`);
      if (res.ok) {
        setIngredientes(await res.json());
      }
    } catch (error) {
      console.error('Error fetching pizza ingredients:', error);
    } finally {
      setLoadingIngredientes(false);
    }
  };

  const validateForm = (): boolean => {
    const nameTrimmed = nombre.trim();
    const descTrimmed = descripcion.trim();

    if (!nameTrimmed) {
      setErrorMsg('El nombre es obligatorio.');
      return false;
    }
    if (nameTrimmed.length > 100) {
      setErrorMsg('El nombre no puede exceder los 100 caracteres.');
      return false;
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s\-]+$/.test(nameTrimmed)) {
      setErrorMsg('El nombre solo puede contener letras, espacios y guiones.');
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
    if (descTrimmed.length > 1000) {
      setErrorMsg('La descripción no puede exceder los 1000 caracteres.');
      return false;
    }

    return true;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!validateForm()) return;

    try {
      const url = '/api/products/pizza';
      const method = editingPizza ? 'PUT' : 'POST';
      
      const body = editingPizza
        ? [{ id_pizza: editingPizza.id_pizza, nombre, descripcion }]
        : { nombre, descripcion };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setModalOpen(false);
        loadPizzas();
      } else {
        const errData = await res.json();
        setErrorMsg(errData.error || 'Error al guardar.');
      }
    } catch (error) {
      setErrorMsg('Ocurrió un error inesperado.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta pizza?')) return;

    try {
      const res = await fetch('/api/products/pizza', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_pizza: id }),
      });

      if (res.ok) {
        loadPizzas();
      } else {
        alert('Error al eliminar pizza');
      }
    } catch (error) {
      console.error('Error deleting pizza:', error);
    }
  };

  const filteredPizzas = pizzas.filter((pizza) =>
    pizza.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in text-theme-text max-w-5xl mx-auto">
      <h1 className="text-3xl font-extrabold font-pizza-title text-ctp-red text-center sm:text-left">
        Pizzas 🍕
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
                placeholder="Buscar pizza..."
                className="w-full pl-9 pr-4 py-2 bg-theme-surface border border-theme/50 rounded-xl text-xs text-white outline-none"
              />
            </div>

            <button
              onClick={openAddModal}
              className="w-full sm:w-auto px-6 py-2.5 bg-ctp-mauve text-white text-xs font-bold rounded-xl shadow-md hover:scale-103 transition-transform flex items-center justify-center gap-2 cursor-pointer pulse-button"
            >
              <Plus size={14} />
              Agregar Pizza
            </button>
          </div>

          {/* Grid list */}
          {filteredPizzas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPizzas.map((pizza) => (
                <div
                  key={pizza.id_pizza}
                  className="p-5 rounded-2xl border-2 border-ctp-red bg-theme-surface hover:scale-[1.02] transition-transform duration-300 flex flex-col justify-between"
                >
                  <div>
                    <h2 className="text-xl font-bold font-pizza-title text-ctp-red mb-2">{pizza.nombre}</h2>
                    <div className="space-y-1 text-xs font-semibold text-theme-secondary">
                      <p className="uppercase tracking-wider">
                        Descripción: <span className="text-white normal-case font-medium">{pizza.descripcion}</span>
                      </p>
                      <p className="uppercase tracking-wider">
                        Precio Base:{' '}
                        <span className="text-ctp-peach font-bold">${parseFloat(pizza.precio_base || '0').toFixed(2)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-theme/35">
                    <button
                      onClick={() => openIngredientesModal(pizza)}
                      className="text-[10px] font-bold text-ctp-peach hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <List size={12} />
                      Ver Ingredientes
                    </button>

                    <div className="flex gap-2">
                      <Link
                        href={`/products/pizza/ingredientes?id=${pizza.id_pizza}`}
                        className="p-2 text-ctp-green hover:bg-ctp-green/10 rounded-full transition-colors cursor-pointer"
                        title="Gestionar ingredientes"
                      >
                        <Plus size={14} />
                      </Link>
                      <button
                        onClick={() => openEditModal(pizza)}
                        className="p-2 text-ctp-blue hover:bg-ctp-blue/10 rounded-full transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(pizza.id_pizza)}
                        className="p-2 text-ctp-red hover:bg-ctp-red/10 rounded-full transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-theme-secondary font-medium">
              No se encontró la pizza 🧑‍🍳
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
                {editingPizza ? '✏️ Editar Pizza' : '➕ Agregar Pizza'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-theme-text/60 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-theme-secondary uppercase">Nombre de la Pizza</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Margarita, Pepperoni, etc."
                  required
                  className="w-full px-4 py-2.5 bg-theme-surface border border-theme/50 rounded-xl text-sm text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-theme-secondary uppercase">Descripción</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Ej. Con salsa de tomate artesanal, mozzarella fresca y albahaca..."
                  required
                  rows={3}
                  className="w-full px-4 py-2.5 bg-theme-surface border border-theme/50 rounded-xl text-sm text-white focus:outline-none resize-none"
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

      {/* Show Ingredients Modal */}
      {ingredientesModalOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-[#12121b] border border-theme rounded-2xl w-full max-w-[440px] p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-theme/40 pb-3">
              <h3 className="text-lg font-bold text-white flex flex-col">
                <span>Ingredientes de la Pizza</span>
                <span className="text-xs text-ctp-red font-pizza-title mt-0.5">{selectedPizza?.nombre}</span>
              </h3>
              <button onClick={() => setIngredientesModalOpen(false)} className="text-theme-text/60 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[300px] overflow-y-auto pr-1">
              {loadingIngredientes ? (
                <div className="flex justify-center py-6">
                  <div className="w-6 h-6 border-2 border-ctp-mauve border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : ingredientes.length === 0 ? (
                <div className="text-center py-6 text-theme-secondary text-sm flex flex-col items-center gap-2">
                  <AlertCircle size={24} className="text-ctp-red/60" />
                  Esta pizza no tiene ingredientes asignados.
                </div>
              ) : (
                <ul className="divide-y divide-theme/35">
                  {ingredientes.map((ing) => (
                    <li key={ing.id_ingrediente} className="py-2.5 flex justify-between items-center text-sm">
                      <span className="font-semibold text-white">{ing.nombre}</span>
                      <span className="text-xs text-theme-secondary font-bold">
                        Cant: <span className="text-ctp-peach">{ing.cantidad}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="pt-2 border-t border-theme/40 flex gap-3">
              <Link
                href={`/products/pizza/ingredientes?id=${selectedPizza?.id_pizza}`}
                className="flex-1 py-2.5 bg-ctp-green text-center text-white rounded-xl text-sm font-bold shadow hover:scale-102 transition-transform cursor-pointer"
              >
                Gestionar
              </Link>
              <button
                type="button"
                onClick={() => setIngredientesModalOpen(false)}
                className="flex-1 py-2.5 border border-theme hover:bg-theme-surface rounded-xl text-sm font-semibold cursor-pointer"
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
