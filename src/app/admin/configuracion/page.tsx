'use client';

import React, { useState, useEffect } from 'react';
import { useConfig, themePalettes } from '@/context/ConfigContext';
import { Settings, CheckCircle2, AlertCircle } from 'lucide-react';

const configurableColors = [
  'base', 'text', 'mauve', 'red', 'blue', 'green', 'yellow', 'peach'
];

export default function ConfigPage() {
  const { configuracion, updateConfig, loading } = useConfig();

  const [nombrePizzeria, setNombrePizzeria] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [themeFlavor, setThemeFlavor] = useState('');
  const [customColors, setCustomColors] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (configuracion) {
      setNombrePizzeria(configuracion.nombre_pizzeria);
      setLogoUrl(configuracion.logo_url);
      setThemeFlavor(configuracion.theme_flavor);

      const colors: Record<string, string> = {};
      configurableColors.forEach((c) => {
        colors[c] = configuracion.custom_colors[c] || '';
      });
      setCustomColors(colors);
    }
  }, [configuracion]);

  const handleColorChange = (colorKey: string, value: string) => {
    setCustomColors((prev) => ({
      ...prev,
      [colorKey]: value,
    }));
  };

  const handleSave = async () => {
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const cleanColors: Record<string, string> = {};
      Object.entries(customColors).forEach(([k, v]) => {
        if (v && v.trim() !== '') {
          cleanColors[k] = v;
        }
      });

      const payload = {
        nombre_pizzeria: nombrePizzeria,
        logo_url: logoUrl,
        theme_flavor: themeFlavor,
        custom_colors: cleanColors,
      };

      const result = await updateConfig(payload);
      if (result.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        throw new Error(result.error || 'Error desconocido');
      }
    } catch (error: any) {
      setSaveError(error.message || 'Error al guardar la configuración');
      setTimeout(() => setSaveError(null), 5000);
      console.error('Error saving config:', error);
    }
  };

  const localPalette: any = {
    ...(themePalettes[themeFlavor] || themePalettes.pizza_dark),
  };

  Object.entries(customColors).forEach(([key, value]) => {
    if (value && value.trim() !== '') {
      localPalette[key] = value;
    }
  });

  const previewStyle = {
    '--ctp-base': localPalette.base,
    '--ctp-text': localPalette.text,
    '--ctp-mauve': localPalette.mauve,
    '--ctp-red': localPalette.red,
    '--ctp-blue': localPalette.blue,
    '--ctp-green': localPalette.green,
    '--ctp-yellow': localPalette.yellow,
    '--ctp-peach': localPalette.peach,
    '--ctp-rosewater': localPalette.rosewater,
    '--ctp-mantle': localPalette.mantle,
    '--ctp-surface0': localPalette.surface0,
    '--ctp-surface1': localPalette.surface1,

    '--theme-text': localPalette.text,
    '--theme-text-secondary': localPalette.text,
    '--theme-bg': localPalette.base,
    '--theme-card': localPalette.mantle || localPalette.surface1,
    '--theme-surface': localPalette.surface0 || localPalette.base,
    '--theme-border': localPalette.surface1 || localPalette.surface0,

    '--pizza-red': localPalette.red,
    '--pizza-orange': localPalette.peach,
    '--pizza-cream': localPalette.rosewater || localPalette.surface0,
    '--pizza-bg': localPalette.base,
    '--pizza-card': localPalette.mantle || localPalette.surface1,
  } as React.CSSProperties;

  return (
    <div className="space-y-8 animate-fade-in text-theme-text">
      <h1 className="text-3xl font-extrabold font-pizza-title flex items-center gap-3 text-ctp-red">
        <Settings size={28} />
        Configuración de Marca
      </h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="xl:col-span-2 space-y-6">
          {saveSuccess && (
            <div className="p-4 rounded-xl bg-ctp-green/20 border border-ctp-green text-ctp-green font-semibold flex items-center gap-2 text-sm animate-bounce">
              <CheckCircle2 size={18} />
              ¡Configuración guardada correctamente!
            </div>
          )}

          {saveError && (
            <div className="p-4 rounded-xl bg-ctp-red/20 border border-ctp-red text-ctp-red font-semibold flex items-center gap-2 text-sm">
              <AlertCircle size={18} />
              {saveError}
            </div>
          )}

          <div className="p-6 md:p-8 rounded-2xl border border-theme bg-theme-card space-y-6 shadow-lg">
            <h2 className="text-xl font-bold text-white border-b border-theme/40 pb-3">Identidad Visual</h2>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-theme-text/80 uppercase">Nombre de la Pizzería</label>
                <input
                  type="text"
                  value={nombrePizzeria}
                  onChange={(e) => setNombrePizzeria(e.target.value)}
                  placeholder="Ej. Pizzería La Increíble"
                  className="w-full px-4 py-3 bg-theme-surface/50 border border-theme/50 rounded-xl text-sm text-white focus:outline-none focus:border-ctp-mauve focus:ring-1 focus:ring-ctp-mauve transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-theme-text/80 uppercase">URL del Logo</label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://ejemplo.com/mi-logo.png"
                  className="w-full px-4 py-3 bg-theme-surface/50 border border-theme/50 rounded-xl text-sm text-white focus:outline-none focus:border-ctp-mauve focus:ring-1 focus:ring-ctp-mauve transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-theme-text/80 uppercase">Elegir Paleta de Colores</label>
                <select
                  value={themeFlavor}
                  onChange={(e) => setThemeFlavor(e.target.value)}
                  className="w-full px-4 py-3 bg-theme-surface/75 border border-theme/50 rounded-xl text-sm text-white focus:outline-none focus:border-ctp-mauve focus:ring-1 focus:ring-ctp-mauve transition-all"
                >
                  <option value="pizza_clasica">🍕 Pizzería Clásica (Blanco/Rojo)</option>
                  <option value="pizza_dark">🌙 Pizzería Dark (Negro/Naranja)</option>
                  <option value="neon">✨ Estilo Neón (Cyber)</option>
                  <option value="latte">🎀 Catppuccin Latte</option>
                  <option value="mocha">🌌 Catppuccin Mocha</option>
                </select>
              </div>
            </div>
          </div>

          {/* Color picker customizer */}
          <div className="p-6 md:p-8 rounded-2xl border border-theme bg-theme-card space-y-6 shadow-lg">
            <h2 className="text-xl font-bold text-white border-b border-theme/40 pb-3">Personalizar Colores Manualmente</h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {configurableColors.map((color) => (
                <div key={color} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-theme-surface/30 border border-theme/35">
                  <span className="text-[10px] font-extrabold uppercase text-theme-secondary text-center tracking-wider">{color}</span>
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-theme hover:scale-105 transition-transform">
                    <input
                      type="color"
                      value={customColors[color] || '#000000'}
                      onChange={(e) => handleColorChange(color, e.target.value)}
                      className="absolute -inset-2 w-16 h-16 cursor-pointer border-none p-0 bg-transparent"
                    />
                  </div>
                  <button
                    onClick={() => handleColorChange(color, '')}
                    className="text-[10px] font-bold text-ctp-red hover:underline mt-1 cursor-pointer"
                  >
                    Borrar
                  </button>
                </div>
              ))}
            </div>

            <p className="text-xs text-theme-secondary text-center italic pt-2 border-t border-theme/35">
              Los colores manuales tienen prioridad sobre la paleta elegida arriba. Borra un color para volver al valor por defecto.
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full sm:w-auto px-12 py-4 text-base font-bold rounded-xl shadow-lg bg-ctp-mauve text-white hover:scale-103 transition-transform pulse-button cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Configuración Global'}
            </button>
          </div>
        </div>

        {/* Live Preview */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-theme bg-theme-card sticky top-6 shadow-xl space-y-6">
            <h2 className="text-xl font-bold text-white border-b border-theme/40 pb-3">Vista Previa Real</h2>

            <div style={previewStyle} className="flex flex-col items-center justify-center p-6 bg-theme-bg rounded-2xl border-2 border-theme">
              <img
                src={logoUrl || 'https://via.placeholder.com/128'}
                alt="Preview"
                className="w-28 h-28 object-contain rounded-full shadow-lg border-4 border-ctp-red mb-4"
              />
              <h2 className="text-xl font-extrabold text-ctp-red font-pizza-title text-center mb-6">
                {nombrePizzeria || 'Tu Pizzería'}
              </h2>

              <div className="w-full space-y-3">
                <button className="w-full py-2 px-4 text-xs font-bold rounded-xl bg-ctp-mauve text-white shadow-sm">
                  Botón Principal
                </button>
                <button className="w-full py-2 px-4 text-xs font-bold rounded-xl bg-ctp-green text-white shadow-sm">
                  Confirmar Pedido
                </button>
                <button className="w-full py-2 px-4 text-xs font-bold rounded-xl bg-transparent border border-ctp-red text-ctp-red">
                  Cancelar
                </button>
                <div className="mt-4 pt-4 border-t border-theme w-full space-y-1">
                  <p className="text-[10px] font-bold text-theme-secondary uppercase tracking-wider">Campos de Texto:</p>
                  <input
                    type="text"
                    disabled
                    placeholder="Ejemplo de input"
                    className="w-full px-3 py-2 bg-theme-surface/50 border border-theme/50 rounded-xl text-xs text-white opacity-80"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
