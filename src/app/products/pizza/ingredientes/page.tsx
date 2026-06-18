'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Plus, AlertCircle } from 'lucide-react';

interface Pizza {
  id_pizza: number;
  nombre: string;
  descripcion: string;
  precio_base: string;
}

interface Ingrediente {
  id_ingrediente: number;
  nombre: string;
  costo_unitario: string;
  tipo: string;
}

interface IngredienteAsociado {
  id_ingrediente: number;
  nombre: string;
  cantidad: number;
}

function PizzaIngredientesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pizzaId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [pizzaActual, setPizzaActual] = useState<Pizza | null>(null);
  const [ingredientes, setIngredientes] = useState<IngredienteAsociado[]>([]);
  const [allIngredientes, setAllIngredientes] = useState<Ingrediente[]>([]);
  
  const [selectedIngrediente, setSelectedIngrediente] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadPizzaInfo = async () => {
    if (!pizzaId) return;
    try {
      const response = await fetch(`/api/products/pizza?id=${pizzaId}`);
      if (response.ok) {
        const data = await response.json();
        const encontrada = data.find((p: any) => String(p.id_pizza) === String(pizzaId));
        if (encontrada) {
          setPizzaActual(encontrada);
        }
      }
    } catch (error) {
      console.error('Error loading pizza info:', error);
    }
  };

  const loadIngredientes = async () => {
    if (!pizzaId) return;
    try {
      const response = await fetch(`/api/products/pizzaIngrediente?id_pizza=${pizzaId}`);
      if (response.ok) {
        setIngredientes(await response.json());
      }
    } catch (error) {
      console.error('Error loading current ingredients:', error);
    }
  };

  const loadAllIngredientes = async () => {
    try {
      const response = await fetch('/api/products/ingrediente');
      if (response.ok) {
        setAllIngredientes(await response.json());
      }
    } catch (error) {
      console.error('Error loading all ingredients:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadPizzaInfo(), loadIngredientes(), loadAllIngredientes()]);
      setLoading(false);
    };
    init();
  }, [pizzaId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedIngrediente) {
      setErrorMsg('Debe seleccionar un ingrediente.');
      return;
    }

    const qty = parseInt(cantidad);
    if (isNaN(qty) || qty < 5 || qty > 1300) {
      setErrorMsg('La cantidad debe estar entre 5 y 1300 gramos.');
      return;
    }

    try {
      const response = await fetch('/api/products/pizzaIngrediente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_pizza: Number(pizzaId),
          id_ingrediente: Number(selectedIngrediente),
          cantidad: qty,
        }),
      });

      if (response.ok) {
        setSuccessMsg('Ingrediente agregado correctamente.');
        await loadIngredientes();
        setCantidad('');
        setSelectedIngrediente('');
      } else {
        const data = await response.json();
        setErrorMsg(data.error || 'Error al agregar ingrediente.');
      }
    } catch (error) {
      setErrorMsg('Error al agregar ingrediente.');
    }
  };

  const handleRemove = async (idIngrediente: number) => {
    if (!window.confirm('¿Seguro que quieres eliminar este ingrediente de la pizza?')) return;
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch('/api/products/pizzaIngrediente', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_pizza: Number(pizzaId),
          id_ingrediente: idIngrediente,
        }),
      });

      if (response.ok) {
        setSuccessMsg('Ingrediente eliminado correctamente.');
        await loadIngredientes();
      } else {
        setErrorMsg('Error al eliminar ingrediente.');
      }
    } catch (error) {
      setErrorMsg('Error al eliminar ingrediente.');
    }
  };

  if (!pizzaId) {
    return (
      <div className="p-6 text-center text-ctp-red font-bold">
        ⚠️ ID de pizza no proporcionado.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-theme-text max-w-xl mx-auto relative">
      <button
        onClick={() => router.push('/products/pizza')}
        className="flex items-center gap-1 text-xs font-bold text-ctp-mauve hover:underline cursor-pointer mb-2"
      >
        <ArrowLeft size={14} />
        Volver a Pizzas
      </button>

      <h1 className="text-3xl font-extrabold font-pizza-title text-ctp-red text-center">
        Ingredientes de la Pizza
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="w-8 h-8 border-4 border-ctp-mauve border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="p-6 rounded-3xl border border-theme bg-theme-card shadow-xl space-y-6">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-theme-secondary uppercase">Pizza Seleccionada</label>
            <input
              type="text"
              value={pizzaActual?.nombre || ''}
              disabled
              className="w-full px-4 py-2.5 bg-theme-surface/50 border border-theme/50 rounded-xl text-sm text-theme-secondary cursor-not-allowed font-pizza-title text-ctp-red"
            />
          </div>

          {/* Current ingredients list */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-theme/35 pb-1">
              Ingredientes Actuales
            </h3>
            {ingredientes.length === 0 ? (
              <div className="text-center py-4 text-xs text-theme-secondary font-medium flex items-center justify-center gap-2">
                <AlertCircle size={16} />
                Aún no se agregaron ingredientes a esta pizza.
              </div>
            ) : (
              <ul className="space-y-2">
                {ingredientes.map((ing) => (
                  <li
                    key={ing.id_ingrediente}
                    className="flex justify-between items-center px-4 py-2 bg-theme-surface border border-theme/50 rounded-xl text-sm transition-all hover:bg-theme-surface/80"
                  >
                    <span className="font-semibold text-white">
                      {ing.nombre}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-theme-secondary font-bold">
                        Cant: <span className="text-ctp-peach">{ing.cantidad} g</span>
                      </span>
                      <button
                        onClick={() => handleRemove(ing.id_ingrediente)}
                        className="p-1.5 text-ctp-red hover:bg-ctp-red/10 rounded-full transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Add ingredients form */}
          <form onSubmit={handleAdd} className="space-y-4 pt-4 border-t border-theme/40">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Asociar Nuevo Ingrediente
            </h3>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-theme-secondary uppercase">Ingrediente</label>
              <select
                value={selectedIngrediente}
                onChange={(e) => setSelectedIngrediente(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-theme-surface border border-theme/50 rounded-xl text-sm text-white focus:outline-none cursor-pointer"
              >
                <option value="">Seleccionar ingrediente</option>
                {allIngredientes
                  .filter((ai) => !ingredientes.some((i) => i.id_ingrediente === ai.id_ingrediente))
                  .map((ing) => (
                    <option key={ing.id_ingrediente} value={ing.id_ingrediente}>
                      {ing.nombre} ({ing.tipo})
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-theme-secondary uppercase">Cantidad (gramos)</label>
              <input
                type="number"
                min="5"
                max="1300"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                placeholder="Ej. 150"
                required
                className="w-full px-4 py-2.5 bg-theme-surface border border-theme/50 rounded-xl text-sm text-white focus:outline-none"
              />
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

            <button
              type="submit"
              className="w-full py-2.5 bg-ctp-mauve text-white rounded-xl text-sm font-bold shadow hover:scale-102 transition-transform cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Agregar Ingrediente
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function PizzaIngredientesPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-48 text-theme-text">
        <div className="w-8 h-8 border-4 border-ctp-mauve border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <PizzaIngredientesContent />
    </Suspense>
  );
}
