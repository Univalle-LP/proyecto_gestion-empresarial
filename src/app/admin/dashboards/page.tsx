'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { LayoutDashboard } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface CostoIngrediente {
  ingrediente: string;
  costo_total: string;
  cantidad_usada: string;
}

interface EvolucionVenta {
  producto: string;
  mes: string;
  estado: string;
  cantidad_vendida: string;
}

interface ProductoMasVendido {
  producto: string;
  total_vendido: string;
}

interface VentasPorCategoria {
  categoria: string;
  total_ventas: string;
}

export default function DashboardsPage() {
  const [costosIngredientesData, setCostosIngredientesData] = useState<CostoIngrediente[]>([]);
  const [evolucionVentasData, setEvolucionVentasData] = useState<EvolucionVenta[]>([]);
  const [productosMasVendidosData, setProductosMasVendidosData] = useState<ProductoMasVendido[]>([]);
  const [ventasPorCategoriaData, setVentasPorCategoriaData] = useState<VentasPorCategoria[]>([]);
  const [loading, setLoading] = useState(true);

  // States for filters
  const [filtroIngredientes, setFiltroIngredientes] = useState<'costo' | 'cantidad'>('costo');
  const [topIngredientes, setTopIngredientes] = useState<number>(10);

  const [productosSeleccionados, setProductosSeleccionados] = useState<string[]>([]);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<string>('');

  const [topProductos, setTopProductos] = useState<number>(10);
  const [ordenCategoria, setOrdenCategoria] = useState<'desc' | 'asc'>('desc');

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCostosIngredientesData(data.resumen.costosIngredientes || []);
          setEvolucionVentasData(data.resumen.evolucionVentas || []);
          setProductosMasVendidosData(data.resumen.productosMasVendidos || []);
          setVentasPorCategoriaData(data.resumen.ventasPorCategoria || []);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // 1. Costs & Ingredients Chart data
  const costosIngredientesChartData = useMemo(() => {
    let sorted = [...costosIngredientesData];
    sorted.sort((a, b) => {
      const valA = filtroIngredientes === 'costo' ? Number(a.costo_total) : Number(a.cantidad_usada);
      const valB = filtroIngredientes === 'costo' ? Number(b.costo_total) : Number(b.cantidad_usada);
      return valB - valA;
    });
    sorted = sorted.slice(0, topIngredientes);

    return {
      labels: sorted.map((i) => i.ingrediente),
      datasets: [
        {
          label: 'Costo Total ($)',
          data: sorted.map((i) => Number(i.costo_total)),
          backgroundColor: '#f38ba8',
          hidden: filtroIngredientes !== 'costo',
        },
        {
          label: 'Cantidad Usada',
          data: sorted.map((i) => Number(i.cantidad_usada)),
          backgroundColor: '#89b4fa',
          hidden: filtroIngredientes !== 'cantidad',
        },
      ],
    };
  }, [costosIngredientesData, filtroIngredientes, topIngredientes]);

  // Available products list for multi-select
  const productosDisponibles = useMemo(() => {
    return Array.from(new Set(evolucionVentasData.map((v) => v.producto)));
  }, [evolucionVentasData]);

  // 2. Evolution Chart data
  const evolucionVentasChartData = useMemo(() => {
    let filtered = [...evolucionVentasData];
    if (estadoSeleccionado) {
      filtered = filtered.filter((item) => item.estado === estadoSeleccionado);
    }

    const meses = Array.from(new Set(filtered.map((v) => v.mes))).sort();
    const prodsToRender = productosSeleccionados.length
      ? productosSeleccionados
      : productosDisponibles.slice(0, 5);

    const datasets = prodsToRender.map((prod, idx) => {
      return {
        label: prod,
        data: meses.map((mes) => {
          const record = filtered.find((v) => v.producto === prod && v.mes === mes);
          return record ? Number(record.cantidad_vendida) : 0;
        }),
        borderColor: `hsl(${(idx * 60) % 360}, 75%, 60%)`,
        backgroundColor: `hsl(${(idx * 60) % 360}, 75%, 60%)`,
        tension: 0.3,
        fill: false,
      };
    });

    return {
      labels: meses.map((m) => {
        const date = new Date(m);
        return date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
      }),
      datasets,
    };
  }, [evolucionVentasData, productosSeleccionados, estadoSeleccionado, productosDisponibles]);

  // 3. Best sellers Doughnut data
  const productosMasVendidosChartData = useMemo(() => {
    const sorted = [...productosMasVendidosData]
      .sort((a, b) => Number(b.total_vendido) - Number(a.total_vendido))
      .slice(0, topProductos);

    return {
      labels: sorted.map((p) => p.producto),
      datasets: [
        {
          data: sorted.map((p) => Number(p.total_vendido)),
          backgroundColor: [
            '#fab387',
            '#a6e3a1',
            '#89dceb',
            '#cba6f7',
            '#f9e2af',
            '#f5e0dc',
            '#f38ba8',
            '#eba0f2',
            '#b4befe',
            '#a6adc8',
          ],
        },
      ],
    };
  }, [productosMasVendidosData, topProductos]);

  // 4. Sales by category Bar data
  const ventasPorCategoriaChartData = useMemo(() => {
    const sorted = [...ventasPorCategoriaData].sort((a, b) => {
      return ordenCategoria === 'desc'
        ? Number(b.total_ventas) - Number(a.total_ventas)
        : Number(a.total_ventas) - Number(b.total_ventas);
    });

    return {
      labels: sorted.map((c) => c.categoria),
      datasets: [
        {
          label: 'Ventas Totales ($)',
          data: sorted.map((c) => Number(c.total_ventas)),
          backgroundColor: '#b4befe',
        },
      ],
    };
  }, [ventasPorCategoriaData, ordenCategoria]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-ctp-mauve border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-theme-text">
      <h1 className="text-3xl sm:text-4xl font-bold font-pizza-title flex items-center gap-3 text-ctp-red">
        <LayoutDashboard size={32} />
        Dashboard de Gestión
      </h1>

      {/* Row 1: Costs & Evolution */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Ingredient Costs */}
        <div className="p-6 rounded-2xl border border-theme bg-theme-card flex flex-col space-y-4 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-theme/40 pb-3">
            <h2 className="font-bold text-white">Costos y Uso de Ingredientes</h2>
            <div className="flex gap-2">
              <select
                value={filtroIngredientes}
                onChange={(e) => setFiltroIngredientes(e.target.value as 'costo' | 'cantidad')}
                className="px-2 py-1 bg-theme-surface border border-theme/50 rounded-lg text-xs text-white outline-none"
              >
                <option value="costo">Costo ($)</option>
                <option value="cantidad">Cantidad</option>
              </select>
              <select
                value={topIngredientes}
                onChange={(e) => setTopIngredientes(Number(e.target.value))}
                className="px-2 py-1 bg-theme-surface border border-theme/50 rounded-lg text-xs text-white outline-none"
              >
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
                <option value={15}>Top 15</option>
              </select>
            </div>
          </div>
          <div className="h-[320px] relative">
            <Bar
              data={costosIngredientesChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
              }}
            />
          </div>
        </div>

        {/* Sales Evolution */}
        <div className="p-6 rounded-2xl border border-theme bg-theme-card flex flex-col space-y-4 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-theme/40 pb-3">
            <h2 className="font-bold text-white">Evolución de Ventas</h2>
            <div className="flex gap-2">
              <select
                value={estadoSeleccionado}
                onChange={(e) => setEstadoSeleccionado(e.target.value)}
                className="px-2 py-1 bg-theme-surface border border-theme/50 rounded-lg text-xs text-white outline-none"
              >
                <option value="">Todos los Estados</option>
                <option value="Aprobado">Aprobado</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Cancelado por el Cliente">Cancelado</option>
              </select>
              <select
                multiple
                value={productosSeleccionados}
                onChange={(e) => {
                  const options = Array.from(e.target.selectedOptions, (option) => option.value);
                  setProductosSeleccionados(options);
                }}
                className="px-2 py-1 bg-theme-surface border border-theme/50 rounded-lg text-xs text-white outline-none max-h-8"
              >
                {productosDisponibles.map((prod) => (
                  <option key={prod} value={prod}>
                    {prod}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="h-[320px] relative">
            <Line
              data={evolucionVentasChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } },
              }}
            />
          </div>
        </div>
      </div>

      {/* Row 2: Best Sellers & Category sales */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Doughnut best sellers */}
        <div className="p-6 rounded-2xl border border-theme bg-theme-card flex flex-col space-y-4 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-theme/40 pb-3">
            <h2 className="font-bold text-white">Productos Más Vendidos</h2>
            <select
              value={topProductos}
              onChange={(e) => setTopProductos(Number(e.target.value))}
              className="px-2 py-1 bg-theme-surface border border-theme/50 rounded-lg text-xs text-white outline-none"
            >
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
              <option value={15}>Top 15</option>
            </select>
          </div>
          <div className="h-[300px] relative flex justify-center">
            <Doughnut
              data={productosMasVendidosChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right' } },
              }}
            />
          </div>
        </div>

        {/* Category Sales */}
        <div className="p-6 rounded-2xl border border-theme bg-theme-card flex flex-col space-y-4 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-theme/40 pb-3">
            <h2 className="font-bold text-white">Ventas por Categoría</h2>
            <select
              value={ordenCategoria}
              onChange={(e) => setOrdenCategoria(e.target.value as 'desc' | 'asc')}
              className="px-2 py-1 bg-theme-surface border border-theme/50 rounded-lg text-xs text-white outline-none"
            >
              <option value="desc">Mayor a menor</option>
              <option value="asc">Menor a mayor</option>
            </select>
          </div>
          <div className="h-[300px] relative">
            <Bar
              data={ventasPorCategoriaChartData}
              options={{
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
              }}
            />
          </div>
        </div>
      </div>

      {/* IA Section */}
      <div className="pt-6 border-t border-theme/40 space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-ctp-mauve border-b border-theme/40 pb-2">
          <span>🤖</span> Análisis Predictivo e IA
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 rounded-2xl border border-theme bg-theme-card shadow-lg space-y-4">
            <h3 className="font-bold text-ctp-blue">Segmentación K-Means</h3>
            <img
              src="https://k-means-hdsk.onrender.com/kmeans-image"
              className="w-full h-auto rounded-xl border border-theme bg-theme-surface"
              alt="K-Means"
            />
          </div>

          <div className="p-6 rounded-2xl border border-theme bg-theme-card shadow-lg space-y-4">
            <h3 className="font-bold text-ctp-green">Cluster Principal</h3>
            <img
              src="https://k-means-hdsk.onrender.com/kmeans-image/cluster?num=0"
              className="w-full h-auto rounded-xl border border-theme bg-theme-surface"
              alt="Cluster 0"
            />
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-theme bg-theme-card shadow-lg space-y-4">
          <h3 className="font-bold text-ctp-mauve">Árboles de Decisión (Predicción)</h3>
          <img
            src="https://k-means-hdsk.onrender.com/decision-tree-image"
            className="w-full h-auto rounded-xl border-2 border-theme bg-theme-surface"
            alt="Decision Tree"
          />
        </div>
      </div>
    </div>
  );
}
