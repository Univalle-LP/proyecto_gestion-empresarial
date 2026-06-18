'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Search, X, Calendar, Percent, ShoppingCart } from 'lucide-react';

interface Oferta {
  id_oferta: number;
  nombre: string;
  descripcion: string;
  tipo: 'descuento' | 'n_x_m';
  descuento?: number;
  n_cantidad?: number;
  m_paga?: number;
  fecha_inicio: string;
  fecha_fin: string;
  activo: number; // 0 or 1
  pizzas: number[];
}

interface Pizza {
  id_pizza: number;
  nombre: string;
}

export default function OfertasPage() {
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOferta, setEditingOferta] = useState<Oferta | null>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState<'descuento' | 'n_x_m'>('descuento');
  const [descuento, setDescuento] = useState(''); // percent (e.g. 50)
  const [nCantidad, setNCantidad] = useState('');
  const [mPaga, setMPaga] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [activo, setActivo] = useState(true);
  const [selectedPizzas, setSelectedPizzas] = useState<number[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    try {
      const [resOfertas, resPizzas] = await Promise.all([
        fetch('/api/ofertas'),
        fetch('/api/products/pizza')
      ]);

      if (resOfertas.ok) {
        const data = await resOfertas.json();
        setOfertas(Array.isArray(data) ? data : (data.data || []));
      }
      if (resPizzas.ok) {
        setPizzas(await resPizzas.json());
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingOferta(null);
    setNombre('');
    setDescripcion('');
    setTipo('descuento');
    setDescuento('');
    setNCantidad('');
    setMPaga('');
    
    // Set default dates (today to next week)
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setFechaInicio(today);
    setFechaFin(nextWeek);
    
    setActivo(true);
    setSelectedPizzas([]);
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEditModal = (oferta: Oferta) => {
    setEditingOferta(oferta);
    setNombre(oferta.nombre);
    setDescripcion(oferta.descripcion);
    setTipo(oferta.tipo);
    setDescuento(oferta.descuento ? (oferta.descuento * 100).toString() : '');
    setNCantidad(oferta.n_cantidad?.toString() || '');
    setMPaga(oferta.m_paga?.toString() || '');
    
    // Format date strings to YYYY-MM-DD
    setFechaInicio(oferta.fecha_inicio ? new Date(oferta.fecha_inicio).toISOString().split('T')[0] : '');
    setFechaFin(oferta.fecha_fin ? new Date(oferta.fecha_fin).toISOString().split('T')[0] : '');
    
    setActivo(oferta.activo === 1);
    setSelectedPizzas(oferta.pizzas || []);
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleTogglePizza = (id: number) => {
    setSelectedPizzas((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const validateForm = (): boolean => {
    if (!nombre.trim()) {
      setErrorMsg('El nombre es obligatorio.');
      return false;
    }
    if (nombre.trim().length < 3 || nombre.trim().length > 100) {
      setErrorMsg('El nombre debe tener entre 3 y 100 caracteres.');
      return false;
    }

    if (tipo === 'descuento') {
      const d = parseFloat(descuento);
      if (isNaN(d) || d <= 0 || d > 100) {
        setErrorMsg('El descuento debe ser un porcentaje entre 1 y 100.');
        return false;
      }
    } else {
      const n = parseInt(nCantidad);
      const m = parseInt(mPaga);
      if (isNaN(n) || n < 1) {
        setErrorMsg('La cantidad N (compras) debe ser al menos 1.');
        return false;
      }
      if (isNaN(m) || m < 1) {
        setErrorMsg('La cantidad M (pagas) debe ser al menos 1.');
        return false;
      }
      if (n < m) {
        setErrorMsg('N (compras) debe ser mayor o igual a M (pagas).');
        return false;
      }
    }

    if (!fechaInicio) {
      setErrorMsg('La fecha de inicio es obligatoria.');
      return false;
    }
    if (!fechaFin) {
      setErrorMsg('La fecha de fin es obligatoria.');
      return false;
    }
    if (new Date(fechaFin) <= new Date(fechaInicio)) {
      setErrorMsg('La fecha de fin debe ser posterior a la fecha de inicio.');
      return false;
    }

    if (selectedPizzas.length === 0) {
      setErrorMsg('Debe seleccionar al menos una pizza aplicable.');
      return false;
    }

    return true;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!validateForm()) return;

    try {
      const url = '/api/ofertas';
      const method = editingOferta ? 'PUT' : 'POST';

      const payload = {
        id_oferta: editingOferta?.id_oferta,
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        tipo,
        descuento: tipo === 'descuento' ? parseFloat(descuento) / 100 : null,
        n_cantidad: tipo === 'n_x_m' ? parseInt(nCantidad) : null,
        m_paga: tipo === 'n_x_m' ? parseInt(mPaga) : null,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        activo: activo ? 1 : 0,
        pizzas: selectedPizzas,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setModalOpen(false);
        loadData();
      } else {
        const errData = await res.json();
        setErrorMsg(errData.error || 'Error al guardar.');
      }
    } catch (error) {
      setErrorMsg('Ocurrió un error inesperado.');
    }
  };

  const filteredOfertas = ofertas.filter((of) =>
    of.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in text-theme-text max-w-5xl mx-auto">
      <h1 className="text-3xl font-extrabold font-pizza-title text-ctp-red text-center sm:text-left">
        Ofertas y Promociones 🏷️
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
                placeholder="Buscar oferta..."
                className="w-full pl-9 pr-4 py-2 bg-theme-surface border border-theme/50 rounded-xl text-xs text-white outline-none"
              />
            </div>

            <button
              onClick={openAddModal}
              className="w-full sm:w-auto px-6 py-2.5 bg-ctp-mauve text-white text-xs font-bold rounded-xl shadow-md hover:scale-103 transition-transform flex items-center justify-center gap-2 cursor-pointer pulse-button"
            >
              <Plus size={14} />
              Agregar Oferta
            </button>
          </div>

          {/* Grid list */}
          {filteredOfertas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOfertas.map((of) => (
                <div
                  key={of.id_oferta}
                  className={`p-5 rounded-2xl border-2 bg-theme-surface hover:scale-[1.02] transition-transform duration-300 flex flex-col justify-between ${
                    of.activo === 1 ? 'border-ctp-red' : 'border-theme-secondary/40 opacity-75'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h2 className="text-xl font-bold font-pizza-title text-ctp-red">{of.nombre}</h2>
                      <span
                        className={`px-2 py-0.5 text-[9px] font-extrabold rounded-md uppercase tracking-wider ${
                          of.activo === 1
                            ? 'bg-ctp-green/10 text-ctp-green border border-ctp-green/25'
                            : 'bg-ctp-red/10 text-ctp-red border border-ctp-red/25'
                        }`}
                      >
                        {of.activo === 1 ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>

                    <p className="text-xs text-theme-secondary font-medium italic">
                      {of.descripcion || 'Sin descripción'}
                    </p>

                    <div className="space-y-1 text-xs font-semibold text-theme-secondary">
                      <p className="uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar size={12} className="text-ctp-mauve" />
                        Vigencia:{' '}
                        <span className="text-white normal-case font-medium">
                          {new Date(of.fecha_inicio).toLocaleDateString()} -{' '}
                          {new Date(of.fecha_fin).toLocaleDateString()}
                        </span>
                      </p>

                      {of.tipo === 'descuento' ? (
                        <p className="uppercase tracking-wider flex items-center gap-1.5">
                          <Percent size={12} className="text-ctp-peach" />
                          Descuento:{' '}
                          <span className="text-ctp-peach font-extrabold">
                            {Math.round((of.descuento || 0) * 100)}%
                          </span>
                        </p>
                      ) : (
                        <p className="uppercase tracking-wider flex items-center gap-1.5">
                          <ShoppingCart size={12} className="text-ctp-peach" />
                          Promo:{' '}
                          <span className="text-ctp-peach font-extrabold">
                            Paga {of.m_paga} y lleva {of.n_cantidad} ({of.n_cantidad}x{of.m_paga})
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-theme/35">
                    <button
                      onClick={() => openEditModal(of)}
                      className="p-2 text-ctp-blue hover:bg-ctp-blue/10 rounded-full transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-theme-secondary font-medium">
              No se encontró ninguna oferta 🏷️
            </div>
          )}
        </div>
      )}

      {/* Add / Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-[#12121b] border border-theme rounded-2xl w-full max-w-[500px] p-6 shadow-2xl space-y-4 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-theme/40 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingOferta ? '✏️ Editar Oferta' : '➕ Agregar Oferta'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-theme-text/60 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-theme-secondary uppercase">Nombre de la Oferta</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Promo Verano, Martes 2x1..."
                  required
                  className="w-full px-4 py-2.5 bg-theme-surface border border-theme/50 rounded-xl text-sm text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-theme-secondary uppercase">Descripción</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Detalles sobre en qué consiste la oferta..."
                  rows={2}
                  className="w-full px-4 py-2.5 bg-theme-surface border border-theme/50 rounded-xl text-sm text-white focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-theme-secondary uppercase">Tipo de Oferta</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as 'descuento' | 'n_x_m')}
                    required
                    className="w-full px-4 py-2.5 bg-theme-surface border border-theme/50 rounded-xl text-sm text-white focus:outline-none cursor-pointer"
                  >
                    <option value="descuento">Descuento %</option>
                    <option value="n_x_m">N x M (Ej: 2x1)</option>
                  </select>
                </div>

                {tipo === 'descuento' ? (
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-theme-secondary uppercase">Descuento (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      step="1"
                      value={descuento}
                      onChange={(e) => setDescuento(e.target.value)}
                      placeholder="Ej. 50"
                      required
                      className="w-full px-4 py-2.5 bg-theme-surface border border-theme/50 rounded-xl text-sm text-white focus:outline-none"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-theme-secondary uppercase">Pides (N)</label>
                      <input
                        type="number"
                        min="1"
                        value={nCantidad}
                        onChange={(e) => setNCantidad(e.target.value)}
                        placeholder="Ej. 2"
                        required
                        className="w-full px-4 py-2.5 bg-theme-surface border border-theme/50 rounded-xl text-sm text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-theme-secondary uppercase">Pagas (M)</label>
                      <input
                        type="number"
                        min="1"
                        value={mPaga}
                        onChange={(e) => setMPaga(e.target.value)}
                        placeholder="Ej. 1"
                        required
                        className="w-full px-4 py-2.5 bg-theme-surface border border-theme/50 rounded-xl text-sm text-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-theme-secondary uppercase">Fecha Inicio</label>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-theme-surface border border-theme/50 rounded-xl text-sm text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-theme-secondary uppercase">Fecha Fin</label>
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-theme-surface border border-theme/50 rounded-xl text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="activoCheckbox"
                  checked={activo}
                  onChange={(e) => setActivo(e.target.checked)}
                  className="w-4 h-4 accent-ctp-mauve rounded border-theme"
                />
                <label htmlFor="activoCheckbox" className="text-xs font-bold text-theme-secondary uppercase cursor-pointer select-none">
                  Oferta Activa (Visible al cliente)
                </label>
              </div>

              {/* Pizza Multi-select */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-theme-secondary uppercase">Pizzas Aplicables</label>
                <div className="max-h-[140px] overflow-y-auto border border-theme/50 bg-theme-surface rounded-xl p-3 space-y-2">
                  {pizzas.map((pizza) => {
                    const isChecked = selectedPizzas.includes(pizza.id_pizza);
                    return (
                      <div
                        key={pizza.id_pizza}
                        onClick={() => handleTogglePizza(pizza.id_pizza)}
                        className="flex items-center gap-2 cursor-pointer hover:bg-theme-surface/80 p-1 rounded transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by parent onClick
                          className="w-3.5 h-3.5 accent-ctp-red"
                        />
                        <span className="text-xs font-semibold text-white select-none">{pizza.nombre}</span>
                      </div>
                    );
                  })}
                </div>
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
