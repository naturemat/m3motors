# Rutas del Frontend Web — M3Motors

## Rutas de React Router (Frontend)

| Ruta | Componente | Auth | Rol | Descripcion |
|------|-----------|------|-----|-------------|
| `/` | `PublicLanding` | No | Publico | Landing publico con formulario de pre-registro de clientes |
| `/landing/:id` | `Landing` | No | Publico | Landing de taller especifico (por ID de taller) |
| `/login/*` | `Login` | `SignedOut` | Publico | Login con Clerk (routing path-based) |
| `/register/*` | `Register` | `SignedOut` | Publico | Registro con Clerk (routing path-based) |
| `/dashboard` | `Dashboard` | `SignedIn` | Cualquier rol | Dashboard general — muestra perfil y links segun rol |
| `/dashboard/admin` | `AdminDashboard` | `SignedIn` | `admin` | Panel de administracion del taller (mecanicos, servicios, clientes, KPIs) |
| `/dashboard/cliente` | `PanelCliente` | `SignedIn` | Cualquier rol | Panel del cliente — vehiculo, kilometraje, historial |
| `*` (catch-all) | `Navigate to /` | No | — | Cualquier ruta no definida redirige a `/` |

### Guard de autenticacion

- **`ProtectedRoute`**: Usa `<SignedIn>` de Clerk. Si no esta autenticado, no renderiza hijos.
- **`PublicRoute`**: Usa `<SignedOut>` de Clerk. Solo renderiza si NO esta autenticado (evita ver login/registro estando logueado).
- **`AdminRoute`**: Verifica `user.publicMetadata.role === 'admin'`. Si no es admin, redirige a `/dashboard`.

### Dependencias de Clerk

- `@clerk/clerk-react` v5.61.8
- Requiere `VITE_CLERK_PUBLISHABLE_KEY` en `.env`
- Login y Register usan `<SignIn>` / `<SignUp>` con routing path-based

---

## Endpoints del Backend consumidos

### Publicos (sin auth)

| Metodo | Endpoint | Pagina | Descripcion |
|--------|----------|--------|-------------|
| `GET` | `/public/workshop/:id` | PublicLanding | Obtener datos del taller |
| `POST` | `/public/workshop/:id/pre-register` | PublicLanding | Pre-registrar cliente (requiere captcha) |

### Autenticados (requieren Bearer token)

| Metodo | Endpoint | Pagina | Descripcion |
|--------|----------|--------|-------------|
| `GET` | `/auth/me` | Dashboard | Obtener perfil del usuario actual |
| `GET` | `/vehicles` | PanelCliente | Listar vehiculos del cliente |
| `GET` | `/vehicles/:id` | PanelCliente | Detalle de vehiculo con historial |
| `POST` | `/interventions` | PanelCliente | Actualizar kilometraje |

### Admin (requieren Bearer token + rol admin)

| Metodo | Endpoint | Pagina | Descripcion |
|--------|----------|--------|-------------|
| `GET` | `/admin/kpis` | AdminDashboard | KPIs del taller |
| `GET` | `/admin/workshop` | AdminDashboard | Datos del taller |
| `PUT` | `/admin/workshop` | AdminDashboard | Actualizar datos del taller |
| `GET` | `/admin/mechanics` | AdminDashboard | Listar mecanicos |
| `POST` | `/admin/mechanics` | AdminDashboard | Crear mecanico |
| `DELETE` | `/admin/mechanics/:id` | AdminDashboard | Eliminar mecanico |
| `GET` | `/admin/services` | AdminDashboard | Listar servicios del catalogo |
| `POST` | `/admin/services` | AdminDashboard | Crear servicio |
| `GET` | `/admin/customers` | AdminDashboard | Listar clientes (activos + pre-registrados) |
| `POST` | `/admin/customers/:id/activate` | AdminDashboard | Activar cliente pre-registrado |

---

## Variables de Entorno

| Variable | Requerida | Descripcion |
|----------|-----------|-------------|
| `VITE_API_URL` | Si | URL base del backend (`http://localhost:3000` en dev) |
| `VITE_CLERK_PUBLISHABLE_KEY` | Si | Clerk publishable key (test o live) |
| `VITE_RECAPTCHA_SITE_KEY` | No | Google reCAPTCHA site key (solo para pre-registro) |
| `VITE_TELEGRAM_BOT_USERNAME` | No | Username del bot de Telegram |
| `VITE_NODE_ENV` | No | `development` o `production` |

---

## Estructura de Paginas

```
src/
├── main.tsx          → Entry point: ClerkProvider + BrowserRouter + App
├── App.tsx           → Router config: todas las rutas + guards
├── index.css         → Tailwind + CSS custom properties (colores del tema)
├── pages/
│   ├── PublicLanding.tsx      → Landing publico + formulario pre-registro
│   ├── Landing.tsx            → Landing de taller especifico
│   ├── Login.tsx              → Login con Clerk
│   ├── Register.tsx           → Registro con Clerk
│   ├── Dashboard.tsx          → Dashboard general (perfil + links por rol)
│   ├── AdminDashboard.tsx     → Panel admin: mecanicos, servicios, clientes, KPIs
│   └── PanelCliente.tsx       → Panel cliente: vehiculo, kilometraje, historial
├── components/
│   ├── atoms/                 → (vacio, por crear)
│   ├── molecules/             → (vacio, por crear)
│   ├── organisms/             → (vacio, por crear)
│   └── templates/             → (vacio, por crear)
├── hooks/                     → (vacio, por crear)
├── services/                  → (vacio, por crear)
├── store/                     → (vacio, por crear)
├── types/                     → (vacio, por crear)
└── utils/                     → (vacio, por crear)
```

### Estado actual

- **7 paginas creadas** (~950 lineas de codigo total)
- **Componentes atomicos no extraidos**: toda la UI esta en los archivos de pagina
- **Sin tests**: directorio `tests/` vacio
- **Sin servicios abstractos**: llamadas API inline en cada pagina
- **Sin state management**: solo `useState` local en cada componente
