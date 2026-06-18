'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

export interface Palette {
  base: string;
  text: string;
  mauve: string;
  red: string;
  peach: string;
  yellow: string;
  green: string;
  blue: string;
  rosewater: string;
  mantle: string;
  surface0: string;
  surface1: string;
  subtext0?: string;
}

export interface Configuracion {
  nombre_pizzeria: string;
  logo_url: string;
  theme_flavor: string;
  custom_colors: Record<string, string>;
}

export const themePalettes: Record<string, Palette> = {
  pizza_clasica: {
    base: '#eff1f5', text: '#4c4f69', mauve: '#d20f39', red: '#d20f39',
    peach: '#fe640b', yellow: '#df8e1d', green: '#40a02b', blue: '#1e66f5',
    rosewater: '#dc8a78', mantle: '#e6e9ef', surface0: '#ccd0da', surface1: '#bcc0cc'
  },
  pizza_dark: {
    base: '#11111b', text: '#cdd6f4', mauve: '#f38ba8', red: '#f38ba8',
    peach: '#fab387', yellow: '#f9e2af', green: '#a6e3a1', blue: '#89b4fa',
    rosewater: '#f5e0dc', mantle: '#181825', surface0: '#313244', surface1: '#45475a'
  },
  neon: {
    base: '#000000', text: '#ffffff', mauve: '#ff00ff', red: '#ff0055',
    peach: '#ffaa00', yellow: '#ffff00', green: '#00ff00', blue: '#00ffff',
    rosewater: '#ff8888', mantle: '#111111', surface0: '#222222', surface1: '#333333'
  },
  mocha: {
    base: '#1e1e2e', text: '#cdd6f4', mauve: '#cba6f7', red: '#f38ba8',
    peach: '#fab387', yellow: '#f9e2af', green: '#a6e3a1', blue: '#89b4fa',
    rosewater: '#f5e0dc', mantle: '#181825', surface0: '#313244', surface1: '#45475a'
  },
  latte: {
    base: '#eff1f5', text: '#4c4f69', mauve: '#8839ef', red: '#d20f39',
    peach: '#fe640b', yellow: '#df8e1d', green: '#40a02b', blue: '#1e66f5',
    rosewater: '#dc8a78', mantle: '#e6e9ef', surface0: '#ccd0da', surface1: '#bcc0cc'
  }
};

interface ConfigContextType {
  configuracion: Configuracion;
  loading: boolean;
  error: any;
  fetchConfig: () => Promise<void>;
  updateConfig: (newConfig: Configuracion) => Promise<any>;
  currentThemePalette: Palette;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [configuracion, setConfiguracion] = useState<Configuracion>({
    nombre_pizzeria: 'Pizzería OyJ',
    logo_url: 'https://via.placeholder.com/96',
    theme_flavor: 'pizza_dark',
    custom_colors: {}
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/configuracion');
      if (res.ok) {
        const data = await res.json();
        setConfiguracion({
          ...data,
          custom_colors: data.custom_colors || {}
        });
      }
    } catch (err) {
      setError(err);
      console.error('Error fetching config:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (newConfig: Configuracion) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/configuracion', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      const data = await res.json();
      if (data.success) {
        setConfiguracion({
          ...data.result,
          custom_colors: data.result.custom_colors || {}
        });
      }
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const currentThemePalette = useMemo(() => {
    return themePalettes[configuracion.theme_flavor] || themePalettes.pizza_dark;
  }, [configuracion.theme_flavor]);

  // Apply CSS Variables dynamically
  useEffect(() => {
    document.title = configuracion.nombre_pizzeria;

    const palette: Record<string, string> = { ...currentThemePalette };
    const customOverrides = configuracion.custom_colors;
    if (customOverrides) {
      Object.entries(customOverrides).forEach(([key, value]) => {
        if (value && value !== '') palette[key] = value;
      });
    }

    const root = document.documentElement;

    // 1. Inject Catppuccin / Base variables
    Object.entries(palette).forEach(([key, value]) => {
      root.style.setProperty(`--ctp-${key}`, value);
    });

    // 2. Semantic pizza colors
    root.style.setProperty('--pizza-red', palette.red);
    root.style.setProperty('--pizza-orange', palette.peach);
    root.style.setProperty('--pizza-cream', palette.rosewater || palette.surface0);
    root.style.setProperty('--pizza-brown', palette.text);
    root.style.setProperty('--pizza-bg', palette.base);
    root.style.setProperty('--pizza-card', palette.mantle || palette.surface1);

    // 3. Semantic theme colors
    root.style.setProperty('--theme-text', palette.text);
    root.style.setProperty('--theme-text-secondary', palette.subtext0 || palette.text);
    root.style.setProperty('--theme-bg', palette.base);
    root.style.setProperty('--theme-surface', palette.surface0 || palette.base);
    root.style.setProperty('--theme-card', palette.mantle || palette.surface1);
    root.style.setProperty('--theme-border', palette.surface1 || palette.surface0);

    // Remove dark class to avoid default Tailwind dark mode conflicts
    root.classList.remove('dark');
  }, [configuracion, currentThemePalette]);

  // Initial load
  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <ConfigContext.Provider value={{ configuracion, loading, error, fetchConfig, updateConfig, currentThemePalette }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
