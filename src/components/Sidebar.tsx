'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  X,
  User,
  Pizza,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  ChefHat
} from 'lucide-react';

interface SidebarRouteChild {
  path: string;
  name: string;
}

interface SidebarRoute {
  path: string;
  name: string;
  icon: React.ReactNode;
  roles: string[];
  children?: SidebarRouteChild[];
}

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Mock roles and config for now
  const role = 'comun';
  const configuracion = {
    nombre_pizzeria: "Victorino's Pizzería",
    logo_url: "https://via.placeholder.com/96"
  };

  const signOut = async () => {};

  const [isMobile, setIsMobile] = useState(false);
  const [isMobileVisible, setIsMobileVisible] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const toggleMobileSidebar = () => {
    setIsMobileVisible(!isMobileVisible);
  };

  const toggleMenu = (path: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileVisible(false);
      }
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleNavigate = (path: string) => {
    if (isMobile) setIsMobileVisible(false);
    router.push(path);
  };

  const handleLogout = async () => {
    if (isMobile) setIsMobileVisible(false);
    await signOut();
    router.push('/login');
  };

  const sidebarRoutes: SidebarRoute[] = [
    {
      path: 'admin',
      name: 'Administración',
      icon: <Settings size={20} />,
      roles: ['admin'],
      children: [
        { path: '/admin/oferta', name: 'Ofertas' },
        { path: '/admin/cancelarPedido', name: 'Pedidos' },
        { path: '/admin/asignar', name: 'Asignar Admins' },
        { path: '/admin/dashboards', name: 'Dashboard' },
      ],
    },
    {
      path: 'products',
      name: 'Productos',
      icon: <ChefHat size={20} />,
      roles: ['admin'],
      children: [
        { path: '/products/categoria', name: 'Categorías' },
        { path: '/products/ingrediente', name: 'Ingredientes' },
        { path: '/products/pizza', name: 'Pizzas' },
        { path: '/products/producto', name: 'Productos' },
        { path: '/products/tamano', name: 'Tamaños' },
      ],
    },
    {
      path: 'usuario',
      name: 'Mi Cuenta',
      icon: <User size={20} />,
      roles: ['comun'],
      children: [
        { path: '/usuario', name: 'Mis Pedidos' },
        { path: '/usuario/ordenarPizza', name: 'Ordenar Pizza' },
        { path: '/usuario/perfil', name: 'Mi Perfil' },
      ],
    },
  ];

  const activeRoutes = sidebarRoutes.filter((route) => route.roles.includes(role || ''));

  return (
    <div className="flex min-h-screen bg-theme-bg text-theme-text overflow-hidden">
      {isMobile && (
        <button
          onClick={toggleMobileSidebar}
          className="fixed top-3 left-3 z-[1100] flex items-center justify-center w-11 h-11 rounded-xl bg-ctp-mauve text-white shadow-lg cursor-pointer transition-all duration-200"
        >
          {isMobileVisible ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {isMobile && isMobileVisible && (
        <div
          onClick={() => setIsMobileVisible(false)}
          className="fixed inset-0 bg-black/60 z-[999] transition-opacity duration-300"
        ></div>
      )}

      <aside
        className={`fixed md:relative top-0 bottom-0 left-0 z-[1000] flex flex-col w-[260px] bg-theme-card border-r border-theme transition-all duration-300 ${
          isMobile
            ? isMobileVisible
              ? 'translate-x-0 shadow-2xl'
              : '-translate-x-full'
            : 'translate-x-0'
        }`}
      >
        <div className="flex flex-col items-center p-6 border-b border-theme mb-4">
          <img
            src={configuracion.logo_url}
            alt="Logo"
            className="w-20 h-20 object-contain rounded-full shadow-lg border-4 border-ctp-red mb-3 transition-transform duration-300 hover:scale-105"
          />
          <span className="text-lg font-bold text-ctp-red text-center font-pizza-title tracking-wide">
            {configuracion.nombre_pizzeria}
          </span>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">
          <button
            onClick={() => handleNavigate('/')}
            className={`flex items-center w-full px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
              pathname === '/'
                ? 'bg-theme-surface text-ctp-mauve font-bold shadow-sm'
                : 'hover:bg-theme-surface/60 text-theme-text'
            }`}
          >
            <Pizza size={20} className="mr-3" />
            Inicio
          </button>

          {activeRoutes.map((route) => {
            const isExpanded = expandedMenus[route.path];
            const hasActiveChild = route.children?.some((child) => pathname === child.path);

            return (
              <div key={route.path} className="space-y-1">
                <button
                  onClick={() => toggleMenu(route.path)}
                  className={`flex items-center justify-between w-full px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                    hasActiveChild
                      ? 'bg-theme-surface/40 text-ctp-mauve'
                      : 'hover:bg-theme-surface/60 text-theme-text'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="mr-3">{route.icon}</span>
                    {route.name}
                  </div>
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                {isExpanded && route.children && (
                  <div className="pl-9 pr-2 py-1 space-y-1 border-l border-theme/50 ml-6">
                    {route.children.map((child) => {
                      const isActive = pathname === child.path;
                      return (
                        <button
                          key={child.path}
                          onClick={() => handleNavigate(child.path)}
                          className={`flex items-center w-full px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-150 ${
                            isActive
                              ? 'bg-theme-surface text-ctp-mauve font-bold shadow-sm'
                              : 'hover:bg-theme-surface/40 text-theme-text/80'
                          }`}
                        >
                          {child.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-theme">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-3 text-sm font-bold rounded-xl bg-transparent border border-ctp-red/35 text-ctp-red hover:bg-ctp-red hover:text-white transition-all duration-200 cursor-pointer"
          >
            <LogOut size={18} className="mr-2" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 md:p-8 lg:p-10 pt-20 sm:pt-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
