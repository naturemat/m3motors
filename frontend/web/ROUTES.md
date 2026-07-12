# Frontend Web — M3Motors

## Arquitectura

- **Web**: Panel del **dueño/admin del taller** (7 pantallas)
- **Mobile**: Cliente y mecánico (app React Native separada)

## Pantallas

| # | Pantalla | Componente | Descripción |
|---|----------|-----------|-------------|
| 1 | Login | `LoginView` | Login del dueño con animación 3D y acceso demo |
| 2 | Dashboard | `DashboardView` | KPIs, gráficos de ingresos, evolución de clientes, actividad reciente |
| 3 | Clientes | `ClientsView` | Listado, búsqueda, filtros, KPIs de clientes, CRUD |
| 4 | Servicios | `ServicesView` | Órdenes de trabajo, estados, filtros, CRUD |
| 5 | Mecánicos | `MechanicsView` | Equipo técnico, carga de trabajo, especialidades, CRUD |
| 6 | Reportes | `ReportsView` | KPIs de rendimiento, distribución de servicios, horas pico |
| 7 | Configuración | `SettingsView` | Ajustes del taller, notificaciones, reset de datos |

## Navegación

- **Sidebar** (desktop) + **Drawer** (mobile) — componente reutilizado en todas las pantallas
- Navegación por **tabs** (estado `activeTab` en App.tsx)
- Login con **localStorage** (`m3_logged_in`)
- Datos persistidos en **localStorage** (clientes, mecánicos, órdenes)

## Componentes reutilizados

- `Sidebar` — navegación lateral con logo M3Motors, menú, perfil de admin, logout
- `LoginView` — pantalla de login con branding M3Motors, formulario, acceso demo rápido
- Cada vista tiene su **top bar** sticky con título y acciones contextual

## Estructura de archivos

```
src/
├── main.tsx              → Entry point
├── App.tsx               → Estado global + navegación por tabs
├── types.ts              → Interfaces (Client, Mechanic, ServiceOrder)
├── data.ts               → Datos iniciales de demostración
├── index.css             → Tailwind CSS
├── components/
│   ├── Sidebar.tsx       → Navegación lateral (reutilizado en todas las vistas)
│   ├── LoginView.tsx     → Login del admin
│   ├── DashboardView.tsx → Dashboard con KPIs y gráficos
│   ├── ClientsView.tsx   → Gestión de clientes
│   ├── MechanicsView.tsx → Gestión de mecánicos
│   ├── ServicesView.tsx  → Gestión de servicios/órdenes
│   ├── ReportsView.tsx   → Reportes de rendimiento
│   └── SettingsView.tsx  → Configuración del taller
└── public/
    └── Logo_M3Motors.png → Logo del proyecto
```

## Stack

- React 19 + TypeScript
- Tailwind CSS v3 (PostCSS)
- lucide-react (iconos)
- Vite 8 (build con sourcemaps)
- OxLint (linting)
- Vitest (testing)
