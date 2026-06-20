# Pizzería Victorino - Web Application

Este proyecto es una aplicación web moderna para la **Pizzería Victorino**, desarrollada con el framework **Next.js** y gestionada eficientemente utilizando el manejador de paquetes **pnpm**. La plataforma está diseñada para ofrecer una experiencia de usuario fluida, permitiendo la visualización del menú, la gestión de pedidos y una navegación intuitiva.

## Características Principales

- **Catálogo Interactivo:** Visualización dinámica de pizzas, especialidades, combos y bebidas.
- **Gestión de Pedidos:** Carrito de compras interactivo y flujo de checkout optimizado.
- **Diseño Responsivo:** Interfaz completamente adaptada para dispositivos móviles, tablets y ordenadores de escritorio.
- **Rendimiento de Vanguardia:** Implementación de Server-Side Rendering (SSR) y Static Site Generation (SSG) de Next.js para una velocidad de carga óptima.

## Tecnologías Utilizadas

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Lenguaje:** TypeScript / JavaScript
- **Gestor de Paquetes:** [pnpm](https://pnpm.io/)
- **Estilos:** Tailwind CSS

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado [Node.js](https://nodejs.org/) (versión 18.x o superior) en tu sistema. 

Si no tienes **pnpm** instalado globalmente, puedes instalarlo ejecutando el siguiente comando en tu terminal:



```text
File README.md successfully created.

```bash
npm install -g pnpm

```

## 🔧 Instalación y Configuración

Sigue estos pasos para clonar y ejecutar el proyecto en tu entorno local:

1. **Clonar el repositorio:**
```bash
git clone <URL_DEL_REPOSITORIO>
cd pizzeria-victorino

```


2. **Instalar las dependencias del proyecto:**
```bash
pnpm install

```


3. **Configurar las variables de entorno:**
Crea un archivo `.env.local` en la raíz del proyecto y añade las variables necesarias (puedes guiarte del archivo `.env.example` si está disponible).
```bash
cp .env.example .env.local

```


4. **Iniciar el servidor de desarrollo:**
```bash
pnpm run dev

```


5. **Ver el proyecto en el navegador:**
Abre [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) en tu navegador para interactuar con la aplicación.

## Scripts Disponibles

En este proyecto se pueden ejecutar los siguientes comandos utilizando `pnpm`:

* `pnpm run dev`: Levanta el entorno de desarrollo con recarga rápida (*Fast Refresh*).
* `pnpm build`: Compila y optimiza la aplicación para su despliegue en producción.
* `pnpm start`: Inicia el servidor de producción (requiere haber ejecutado `pnpm build` previamente).
* `pnpm lint`: Analiza el código fuente en busca de errores de sintaxis o malas prácticas utilizando ESLint.

## Miembros del Equipo

El desarrollo y mantenimiento de este proyecto está a cargo de:

* **Neptali German Alanoca Catunta**
* **Pablo Andres Jimenez Iriarte**
* **Oliver Jorge Medrano Chacolla**
* **Jorge Esteben Medrano Chacolla**
