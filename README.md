# Linz Shell - Enterprise Application Platform

Linz Shell es una plataforma base (skeleton/shell) moderna y robusta para aplicaciones empresariales, construida sobre el ecosistema de **Laravel 12** y **React**. Está diseñada para ser modular, escalable y con un sistema de diseño propio y consistente.

## 🚀 Tecnologías Principales

- **Backend:** PHP 8.2+, Laravel 12, Laravel Reverb (WebSockets nativos), Laravel Sanctum (Auth).
- **Frontend:** React 18, TypeScript, Inertia.js, Vite.
- **Styling:** Tailwind CSS 4, Radix UI, Lucide Icons.
- **Arquitectura:** Sistema de módulos dinámicos y sistema de diseño atómico.

## ✨ Características Destacadas

### 1. Sistema de Módulos
La aplicación cuenta con un gestor de módulos que permite activar o desactivar funcionalidades de forma dinámica:
- **Chat:** Sistema de mensajería en tiempo real con soporte para grupos, chats privados y reacciones.
- **Carrito de Compras:** Integración completa para flujos de e-commerce.
- **Inventario:** Gestión de stock y productos para administradores.

### 2. Diseño Atómico (Linz Design System)
Un sistema de diseño centralizado basado en componentes de React que aseguran la consistencia visual:
- `<Surface />`: Contenedor base para paneles y tarjetas.
- `<Typography />`: Jerarquía de textos estandarizada.
- `<Button />`: Acciones consistentes.
*(Consulta `DESIGN_SYSTEM.md` para más detalles)*.

### 3. Panel de Administración
Incluye herramientas avanzadas para la gestión del sistema:
- Control de visibilidad de módulos.
- Editor de Landing Page basado en secciones.
- Configuración global del sistema.
- Gestión de productos, menús e inventarios.

### 4. Tiempo Real
Gracias a **Laravel Reverb**, la aplicación soporta funcionalidades en tiempo real (como el chat) de manera nativa sin dependencias externas como Pusher.

## 🛠️ Instalación y Configuración

Sigue estos pasos para poner en marcha el proyecto localmente:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/lLinZ/linz-shell.git
   cd linz-shell
   ```

2. **Instalar dependencias de PHP:**
   ```bash
   composer install
   ```

3. **Instalar dependencias de JS:**
   ```bash
   npm install
   ```

4. **Configurar el entorno:**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   *Configura tus credenciales de base de datos en el archivo `.env`.*

5. **Ejecutar migraciones y seeders:**
   ```bash
   php artisan migrate --seed
   ```

6. **Iniciar el servidor de desarrollo:**
   Para ejecutar todo simultáneamente (Servidor, Vite, Colas, Reverb):
   ```bash
   npm run dev
   # O usando el script definido en composer.json:
   composer dev
   ```

## 📂 Estructura del Proyecto

- `app/Http/Controllers`: Lógica de negocio y controladores.
- `resources/js/Pages`: Componentes de página de React.
- `resources/js/Components/ui`: Componentes del sistema de diseño core.
- `routes/web.php`: Definiciones de rutas y middleware de módulos.

## 🤝 Contribución

Para añadir nuevas funcionalidades o variantes visuales, por favor sigue los principios definidos en el `DESIGN_SYSTEM.md`. ¡Mantengamos el código limpio y consistente!

---
Desarrollado con ❤️ por el equipo de Linz.
