'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Pizza, ShoppingCart, Trash2, Award, Info, X } from 'lucide-react';

interface PizzaData {
  id_pizza: number;
  nombre: string;
  descripcion: string;
  precio_base: string;
}

interface Tamano {
  id_tamano: number;
  nombre: string;
  precio_base: string;
}

interface Producto {
  id_producto: number;
  nombre: string;
  descripcion: string;
  precio: string;
}

interface Oferta {
  id_oferta: number;
  tipo: string;
  descuento?: number;
  n_cantidad?: number;
  m_paga?: number;
  activo: number;
  fecha_inicio: string;
  fecha_fin: string;
  pizzas: number[];
}

interface CarritoItem {
  tipo: 'pizza' | 'producto';
  id_pizza: number | null;
  pizzaNombre: string | null;
  id_tamano: number | null;
  tamanoNombre: string | null;
  cantidad: number;
  precioUnitario: number;
  id_producto: number | null;
  productoNombre: string | null;
  cantidadProducto: number;
}

export default function OrdenarPizza() {
  const { user } = useAuth();

  const [pizzas, setPizzas] = useState<PizzaData[]>([]);
  const [tamanos, setTamanos] = useState<Tamano[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);

  const [modalPizza, setModalPizza] = useState(false);
  const [modalProducto, setModalProducto] = useState(false);
  const [modalConfirmacion, setModalConfirmacion] = useState(false);

  const [selectedPizza, setSelectedPizza] = useState('');
  const [selectedTamano, setSelectedTamano] = useState('');
  const [cantidad, setCantidad] = useState(1);

  const [selectedProducto, setSelectedProducto] = useState('');
  const [cantidadProducto, setCantidadProducto] = useState(1);

  const [mensaje, setMensaje] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [loading, setLoading] = useState(true);

  const cargarDatos = async () => {
    try {
      const [resPizzas, resTamanos, resProductos, resOfertas] = await Promise.all([
        fetch('/api/products/pizza'),
        fetch('/api/products/tamano'),
        fetch('/api/products/producto'),
        fetch('/api/ofertas'),
      ]);

      if (resPizzas.ok) setPizzas(await resPizzas.json());
      if (resTamanos.ok) setTamanos(await resTamanos.json());
      if (resProductos.ok) {
        const prodData = await resProductos.json();
        setProductos(Array.isArray(prodData) ? prodData : prodData.data || []);
      }
      if (resOfertas.ok) setOfertas(await resOfertas.json());
    } catch (error) {
      console.error('Error loading order options:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirModal = (tipo: 'pizza' | 'producto') => {
    setMensajeError('');
    if (tipo === 'pizza') {
      setSelectedPizza('');
      setSelectedTamano('');
      setCantidad(1);
      setModalPizza(true);
    } else {
      setSelectedProducto('');
      setCantidadProducto(1);
      setModalProducto(true);
    }
  };

  const obtenerTextoOfertaParaPizza = (id_pizza: number) => {
    const ahora = new Date();
    const ofertasParaPizza = ofertas.filter((oferta) => {
      if (!oferta.activo) return false;
      const inicio = new Date(oferta.fecha_inicio);
      const fin = new Date(oferta.fecha_fin);
      if (ahora < inicio || ahora > fin) return false;
      return oferta.pizzas.includes(id_pizza);
    });

    if (ofertasParaPizza.length === 0) return '';
    const oferta = ofertasParaPizza[0];

    if (oferta.tipo === 'descuento') {
      const porcentaje = (oferta.descuento ?? 0) * 100;
      return `${porcentaje}% OFF`;
    } else if (oferta.tipo === 'n_x_m') {
      return `${oferta.n_cantidad}x${oferta.m_paga}`;
    }
    return '';
  };

  const obtenerTotalUnidades = () => {
    return carrito.reduce((total, item) => {
      return total + (item.tipo === 'pizza' ? item.cantidad : item.cantidadProducto);
    }, 0);
  };

  const agregarAlCarrito = (tipo: 'pizza' | 'producto') => {
    setMensajeError('');

    if (tipo === 'pizza') {
      if (!selectedPizza || !selectedTamano) {
        setMensajeError('Por favor selecciona una pizza y su tamaño.');
        return;
      }

      const totalActual = obtenerTotalUnidades();
      if (totalActual + cantidad > 100) {
        setMensajeError('No puedes agregar más de 100 unidades al carrito.');
        return;
      }

      const pizza = pizzas.find((p) => p.id_pizza === Number(selectedPizza));
      const tamano = tamanos.find((t) => t.id_tamano === Number(selectedTamano));

      if (!pizza || !tamano) {
        setMensajeError('Pizza o tamaño inválido.');
        return;
      }

      const precioFinal = parseFloat(pizza.precio_base) + parseFloat(tamano.precio_base);

      const existente = carrito.find(
        (item) =>
          item.tipo === 'pizza' &&
          item.id_pizza === Number(selectedPizza) &&
          item.id_tamano === Number(selectedTamano)
      );

      if (existente) {
        existente.cantidad += cantidad;
        setCarrito([...carrito]);
      } else {
        setCarrito([
          ...carrito,
          {
            tipo: 'pizza',
            id_pizza: Number(selectedPizza),
            pizzaNombre: pizza.nombre,
            id_tamano: Number(selectedTamano),
            tamanoNombre: tamano.nombre,
            cantidad: cantidad,
            precioUnitario: precioFinal,
            id_producto: null,
            productoNombre: null,
            cantidadProducto: 0,
          },
        ]);
      }
      setModalPizza(false);
    } else {
      if (!selectedProducto) {
        setMensajeError('Por favor selecciona un complemento.');
        return;
      }

      const totalActual = obtenerTotalUnidades();
      if (totalActual + cantidadProducto > 100) {
        setMensajeError('No puedes agregar más de 100 unidades al carrito.');
        return;
      }

      const producto = productos.find((p) => p.id_producto === Number(selectedProducto));

      if (!producto) {
        setMensajeError('Producto inválido.');
        return;
      }

      const existente = carrito.find(
        (item) => item.tipo === 'producto' && item.id_producto === Number(selectedProducto)
      );

      if (existente) {
        existente.cantidadProducto += cantidadProducto;
        setCarrito([...carrito]);
      } else {
        setCarrito([
          ...carrito,
          {
            tipo: 'producto',
            id_producto: Number(selectedProducto),
            productoNombre: producto.nombre,
            cantidadProducto: cantidadProducto,
            precioUnitario: parseFloat(producto.precio),
            id_pizza: null,
            pizzaNombre: null,
            cantidad: 0,
            tamanoNombre: null,
            id_tamano: null,
          },
        ]);
      }
      setModalProducto(false);
    }
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => {
      if (item.tipo === 'pizza') {
        return total + item.precioUnitario * item.cantidad;
      } else {
        return total + item.precioUnitario * item.cantidadProducto;
      }
    }, 0);
  };

  const eliminarDelCarrito = (index: number) => {
    const updated = [...carrito];
    updated.splice(index, 1);
    setCarrito(updated);
  };

  const finalizarPedido = () => {
    if (carrito.length === 0) return;
    setModalConfirmacion(true);
  };

  const confirmarPedido = async () => {
    const id_cliente = user?.id;
    const total = calcularTotal();

    setLoading(true);
    try {
      const res = await fetch('/api/usuario/pedirPizza', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_cliente,
          pedido: carrito,
          fecha: new Date().toISOString(),
          total,
        }),
      });

      const resultado = await res.json();

      if (res.ok) {
        setMensaje('¡Pedido realizado con éxito! 🍕');
        setCarrito([]);
        setModalConfirmacion(false);
        setTimeout(() => setMensaje(''), 5000);
      } else {
        setMensaje(resultado.message || 'Error al realizar el pedido.');
      }
    } catch (error) {
      console.error(error);
      setMensaje('Error al realizar el pedido.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && carrito.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-ctp-mauve border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-theme-text max-w-4xl mx-auto">
      <h1 className="text-3xl font-extrabold font-pizza-title text-center sm:text-left text-ctp-red">
        ¿Qué quieres agregar hoy?
      </h1>

      {/* Grid Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
        <button
          onClick={() => abrirModal('pizza')}
          className="flex flex-col items-center justify-center bg-theme-card border-2 border-ctp-yellow hover:border-ctp-yellow/80 p-8 rounded-3xl shadow-lg hover:scale-[1.02] active:scale-98 transition-all group cursor-pointer"
        >
          <span className="text-5xl group-hover:animate-bounce">🍕</span>
          <h2 className="text-2xl font-bold mt-4 text-ctp-yellow group-hover:scale-105 transition-transform">Pizza</h2>
          <p className="text-theme-secondary text-sm mt-2">Arma tu pizza ideal a tu gusto</p>
        </button>

        <button
          onClick={() => abrirModal('producto')}
          className="flex flex-col items-center justify-center bg-theme-card border-2 border-ctp-green hover:border-ctp-green/80 p-8 rounded-3xl shadow-lg hover:scale-[1.02] active:scale-98 transition-all group cursor-pointer"
        >
          <span className="text-5xl group-hover:animate-bounce">🛒</span>
          <h2 className="text-2xl font-bold mt-4 text-ctp-green group-hover:scale-105 transition-transform">Complementos</h2>
          <p className="text-theme-secondary text-sm mt-2">Bebidas refrescantes y snacks deliciosos</p>
        </button>
      </div>

      {/* Carrito / Order list */}
      {carrito.length > 0 && (
        <div className="p-6 md:p-8 rounded-3xl border border-theme bg-theme-card shadow-xl space-y-6 animate-slide-up">
          <div className="flex items-center justify-between border-b border-theme/40 pb-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingCart className="text-ctp-mauve" /> Tu Pedido
            </h2>
            <span className="text-xs font-bold bg-ctp-mauve/15 text-ctp-mauve px-3 py-1 rounded-full border border-ctp-mauve/25">
              {carrito.length} {carrito.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          <ul className="divide-y divide-theme/45">
            {carrito.map((item, index) => (
              <li key={index} className="py-4 flex justify-between items-center group">
                <div className="flex-1">
                  {item.tipo === 'pizza' ? (
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-white text-sm sm:text-base">
                        <span>🍕</span> {item.pizzaNombre}
                        <span className="text-xs text-theme-secondary font-medium">({item.tamanoNombre})</span>
                      </div>
                      <div className="mt-1 flex items-center gap-3">
                        <span className="text-xs bg-theme-surface/70 px-2 py-0.5 rounded border border-theme">
                          x{item.cantidad}
                        </span>
                        <span className="text-ctp-peach font-bold text-sm">
                          ${(item.precioUnitario * item.cantidad).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-white text-sm sm:text-base">
                        <span>🛒</span> {item.productoNombre}
                      </div>
                      <div className="mt-1 flex items-center gap-3">
                        <span className="text-xs bg-theme-surface/70 px-2 py-0.5 rounded border border-theme">
                          x{item.cantidadProducto}
                        </span>
                        <span className="text-ctp-peach font-bold text-sm">
                          ${(item.precioUnitario * item.cantidadProducto).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => eliminarDelCarrito(index)}
                  className="p-2.5 text-ctp-red hover:bg-ctp-red/10 rounded-full transition-colors cursor-pointer"
                  title="Eliminar"
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>

          <div className="p-4 bg-theme-surface/45 rounded-2xl border border-theme/60 flex justify-between items-center">
            <span className="font-bold text-theme-secondary">Total Estimado</span>
            <span className="text-2xl font-extrabold text-ctp-peach">${calcularTotal().toFixed(2)}</span>
          </div>

          <div>
            <button
              onClick={finalizarPedido}
              className="w-full py-4 text-base font-bold bg-ctp-mauve text-white rounded-xl shadow-lg pulse-button cursor-pointer"
            >
              Confirmar y Finalizar
            </button>
          </div>
        </div>
      )}

      {mensaje && (
        <div className="p-4 bg-theme-surface border border-ctp-blue text-ctp-blue rounded-xl font-bold text-center animate-pulse">
          {mensaje}
        </div>
      )}

      {/* Pizza Modal */}
      {modalPizza && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-[#12121b] border border-theme rounded-2xl w-full max-w-[480px] p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-theme/40 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🍕</span> Agregar Pizza
              </h3>
              <button onClick={() => setModalPizza(false)} className="text-theme-text/60 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-theme-secondary uppercase">Selecciona Variedad</label>
                <select
                  value={selectedPizza}
                  onChange={(e) => setSelectedPizza(e.target.value)}
                  className="w-full px-4 py-3 bg-theme-surface border border-theme/50 rounded-xl text-sm text-white focus:outline-none"
                >
                  <option value="">Elige una pizza</option>
                  {pizzas.map((pizza) => {
                    const promoText = obtenerTextoOfertaParaPizza(pizza.id_pizza);
                    return (
                      <option key={pizza.id_pizza} value={pizza.id_pizza}>
                        {pizza.nombre} {promoText ? `(${promoText})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-theme-secondary uppercase">Tamaño</label>
                <select
                  value={selectedTamano}
                  onChange={(e) => setSelectedTamano(e.target.value)}
                  className="w-full px-4 py-3 bg-theme-surface border border-theme/50 rounded-xl text-sm text-white focus:outline-none"
                >
                  <option value="">Elige el tamaño</option>
                  {tamanos.map((tam) => (
                    <option key={tam.id_tamano} value={tam.id_tamano}>
                      {tam.nombre} (+${parseFloat(tam.precio_base).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-theme-secondary uppercase">Cantidad</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={cantidad}
                  onChange={(e) => setCantidad(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-theme-surface border border-theme/50 rounded-xl text-sm text-white focus:outline-none"
                />
              </div>

              {mensajeError && (
                <div className="p-3 bg-ctp-red/10 text-ctp-red text-xs font-bold rounded-xl border border-ctp-red/20">
                  ⚠️ {mensajeError}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-3">
              <button
                onClick={() => setModalPizza(false)}
                className="flex-1 py-2.5 border border-theme hover:bg-theme-surface rounded-xl text-sm font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => agregarAlCarrito('pizza')}
                className="flex-1 py-2.5 bg-ctp-mauve text-white rounded-xl text-sm font-bold shadow hover:scale-102 transition-transform cursor-pointer"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complemento Modal */}
      {modalProducto && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-[#12121b] border border-theme rounded-2xl w-full max-w-[480px] p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-theme/40 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🛒</span> Agregar Complemento
              </h3>
              <button onClick={() => setModalProducto(false)} className="text-theme-text/60 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-theme-secondary uppercase">Producto</label>
                <select
                  value={selectedProducto}
                  onChange={(e) => setSelectedProducto(e.target.value)}
                  className="w-full px-4 py-3 bg-theme-surface border border-theme/50 rounded-xl text-sm text-white focus:outline-none"
                >
                  <option value="">Selecciona un complemento</option>
                  {productos.map((producto) => (
                    <option key={producto.id_producto} value={producto.id_producto}>
                      {producto.nombre} - ${parseFloat(producto.precio).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-theme-secondary uppercase">Cantidad</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={cantidadProducto}
                  onChange={(e) => setCantidadProducto(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-theme-surface border border-theme/50 rounded-xl text-sm text-white focus:outline-none"
                />
              </div>

              {mensajeError && (
                <div className="p-3 bg-ctp-red/10 text-ctp-red text-xs font-bold rounded-xl border border-ctp-red/20">
                  ⚠️ {mensajeError}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-3">
              <button
                onClick={() => setModalProducto(false)}
                className="flex-1 py-2.5 border border-theme hover:bg-theme-surface rounded-xl text-sm font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => agregarAlCarrito('producto')}
                className="flex-1 py-2.5 bg-ctp-mauve text-white rounded-xl text-sm font-bold shadow hover:scale-102 transition-transform cursor-pointer"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {modalConfirmacion && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-[#12121b] border border-theme rounded-2xl w-full max-w-[540px] p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-theme/40 pb-3">
              <h3 className="text-lg font-bold text-white">Confirmar Pedido</h3>
              <button onClick={() => setModalConfirmacion(false)} className="text-theme-text/60 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-4">
              <h4 className="font-bold text-theme-secondary uppercase text-[10px] tracking-widest">Resumen de tu pedido</h4>
              <ul className="divide-y divide-theme/35">
                {carrito.map((item, idx) => (
                  <li key={idx} className="py-2.5 flex justify-between items-center text-sm">
                    <span className="font-semibold text-white/90">
                      {item.tipo === 'pizza' ? `🍕 ${item.pizzaNombre}` : `🛒 ${item.productoNombre}`}
                      <span className="text-xs text-theme-secondary font-medium ml-1">
                        (x{item.tipo === 'pizza' ? item.cantidad : item.cantidadProducto})
                      </span>
                    </span>
                    <span className="text-ctp-peach font-bold">
                      ${(item.precioUnitario * (item.tipo === 'pizza' ? item.cantidad : item.cantidadProducto)).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="pt-3 border-t border-theme/40 flex flex-col items-end">
                <span className="text-xs text-theme-secondary font-semibold uppercase tracking-wider">Total a Pagar</span>
                <span className="text-2xl font-extrabold text-ctp-peach">${calcularTotal().toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2 justify-end">
              <button
                onClick={() => setModalConfirmacion(false)}
                className="px-6 py-2.5 border border-theme hover:bg-theme-surface rounded-xl text-sm font-semibold cursor-pointer"
              >
                Volver
              </button>
              <button
                onClick={confirmarPedido}
                disabled={loading}
                className="px-8 py-2.5 bg-ctp-mauve text-white rounded-xl text-sm font-bold shadow hover:scale-102 transition-transform cursor-pointer"
              >
                {loading ? 'Confirmando...' : 'Confirmar Pedido'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
