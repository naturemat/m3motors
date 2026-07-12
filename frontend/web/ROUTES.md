# Rutas del Frontend Web — M3Motors

## Arquitectura

- **Web**: Panel del **dueño/admin del taller** + landing pública de pre-registro
- **Mobile**: Cliente y mecánico (app React Native separada)

## Rutas de React Router

| Ruta | Componente | Auth | Descripcion |
|------|-----------|------|-------------|
| `/` | `Login` | `SignedOut` | Login del dueño del taller (pantalla principal) |
| `/dashboard` | `AdminDashboard` | `SignedIn` | Panel de administración del taller |
| `/workshop/:id` | `PublicLanding` | No | Landing pública del taller — formulario de pre-registro para clientes |
| `*` | `Navigate to /` | — | Catch-all → redirige al login |

### Guard de autenticacion

- **`ProtectedRoute`**: Usa `<SignedIn>` de Clerk. Si no está autenticado, redirige a login.
- **`PublicRoute`**: Usa `<SignedOut>` de Clerk. Solo renderiza si NO está autenticado.

---

## Endpoints del Backend consumidos

### Publicos (sin auth)

| Metodo | Endpoint | Pagina | Descripcion |
|--------|----------|--------|-------------|
| `GET` | `/public/workshop/:id` | PublicLanding | Datos del taller |
| `POST` | `/public/workshop/:id/pre-register` | PublicLanding | Pre-registrar cliente (requiere captcha) |

### Admin (requieren Bearer token)

| Metodo | Endpoint | Pagina | Descripcion |
|--------|----------|--------|-------------|
| `GET` | `/admin/kpis` | AdminDashboard | KPIs del taller |
| `GET` | `/admin/workshop` | AdminDashboard | Datos del taller |
| `PUT` | `/admin/workshop` | AdminDashboard | Actualizar datos del taller |
| `GET` | `/admin/mechanics` | AdminDashboard | Listar mecánicos |
| `POST` | `/admin/mechanics` | AdminDashboard | Crear mecánico |
| `DELETE` | `/admin/mechanics/:id` | AdminDashboard | Eliminar mecánico |
| `GET` | `/admin/services` | AdminDashboard | Catálogo de servicios |
| `POST` | `/admin/services` | AdminDashboard | Crear servicio |
| `GET` | `/admin/customers` | AdminDashboard | Clientes (activos + pre-registrados) |
| `POST` | `/admin/customers/:id/activate` | AdminDashboard | Activar cliente pre-registrado |

---

## Variables de Entorno

| Variable | Requerida | Descripcion |
|----------|-----------|-------------|
| `VITE_API_URL` | Si | URL base del backend (`http://localhost:3000` en dev) |
| `VITE_CLERK_PUBLISHABLE_KEY` | Si | Clerk publishable key |
| `VITE_RECAPTCHA_SITE_KEY` | No | Google reCAPTCHA site key (pre-registro) |
| `VITE_TELEGRAM_BOT_USERNAME` | No | Bot de Telegram |

---

## Estructura de Paginas

```
src/
├── main.tsx              → Entry: ClerkProvider + BrowserRouter + App
├── App.tsx               → Router: /, /dashboard, /workshop/:id
├── index.css             → Tailwind + CSS custom properties
├── pages/
│   ├── Login.tsx           → Login del dueño (pantalla principal con branding)
│   ├── AdminDashboard.tsx  → Panel admin: mecánicos, servicios, clientes, KPIs
│   └── PublicLanding.tsx   → Landing pública: info del taller + formulario pre-registro
├── components/            → (atomicos, por crear)
├── hooks/                 → (por crear)
├── services/              → (por crear)
├── store/                 → (por crear)
├── types/                 → (por crear)
└── utils/                 → (por crear)
```
