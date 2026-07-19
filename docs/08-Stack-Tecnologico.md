# Stack Tecnologico - M3Motors

---

## 1. Vision General

M3Motors se compone de tres paquetes independientes, cada uno con su propio `package.json` y gestor de dependencias. No existe un monorepo a nivel raiz.

---

## 2. Backend

| Componente | Tecnologia | Version |
|------------|------------|---------|
| Runtime | Node.js | 22 |
| Framework | NestJS | 11 |
| ORM | Prisma | 7 |
| Base de datos | PostgreSQL | 16 (via Supabase) |
| Cache / Colas | Redis | 7 (via Docker) |
| Autenticacion | Clerk (web) + JWT (mobile) | - |
| LLM | Groq (Llama 3.3) | - |
| OCR | Google Gemini AI | - |
| Scraping vehicular | Playwright | - |
| Email | Resend | - |
| Push notifications | OneSignal | - |
| Almacenamiento de archivos | Supabase Storage | - |
| Validacion | class-validator + Swagger | - |
| Testing | Jest | - |
| Linting | ESLint (flat config) + Prettier | - |

**Ruta:** `backend/`

---

## 3. Frontend Web

| Componente | Tecnologia | Version |
|------------|------------|---------|
| Runtime | React | 19 |
| Build tool | Vite | 8 |
| Estilos | Tailwind CSS | 3 |
| Routing | React Router | - |
| HTTP client | Axios | - |
| Icons | Lucide React | - |
| Movil (APK) | Capacitor | - |
| Testing | Vitest | - |
| Linting | OxLint | - |

**Ruta:** `frontend/web/`
**Puerto de desarrollo:** 5173
**Puerto en produccion:** 80 (nginx)

---

## 4. Infraestructura

| Componente | Tecnologia | Descripcion |
|------------|------------|-------------|
| Contenedores | Docker | Backend (Node.js) + Frontend (nginx) + Redis |
| Orquestacion | Docker Compose | Archivos: docker-compose.yml (dev), docker-compose.prod.yml (prod) |
| CI/CD | GitHub Actions | Pipeline de lint, test, build y deploy automatico |
| Servidor | DigitalOcean Droplet | Ubuntu 24.04, 2GB RAM + 2GB swap |
| Dominio | m3motors.me | via Cloudflare |
| Base de datos | Supabase | PostgreSQL gestionado con pool de conexiones |
| Autenticacion (web) | Clerk | SSO, organizaciones, webhooks |
| Autenticacion (mobile) | JWT local | Tokens firmados con JWT_SECRET |

---

## 5. Herramientas de Desarrollo

| Herramienta | Uso |
|-------------|-----|
| TypeScript | Lenguaje principal (strict mode en backend) |
| Prisma Studio | Visualizacion y edicion de datos en BD |
| ESLint | Linting en backend (flat config) |
| OxLint | Linting en frontend web |
| Prettier | Formateo de codigo en backend |
| Vitest | Testing unitario en frontend web |
| Jest | Testing unitario en backend |
| Playwright | Automatizacion de scraping vehicular (CRV Ecuador) |

---

## 6. Arquitectura de Docker

```
┌─────────────────────────────────────────────────┐
│                 Docker Compose                   │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────┐  ┌──────────────────────────┐ │
│  │   Frontend   │  │        Backend           │ │
│  │   (nginx)    │──│      (Node.js)           │ │
│  │   Puerto 80  │  │      Puerto 3000         │ │
│  └──────────────┘  └──────────┬───────────────┘ │
│                               │                  │
│                    ┌──────────▼───────────────┐  │
│                    │         Redis            │  │
│                    │      Puerto 6379         │  │
│                    └──────────────────────────┘  │
│                                                  │
└─────────────────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Supabase PostgreSQL │
              │   (Base de datos)    │
              └──────────────────────┘
```

---

## 7. Configuracion por Entorno

### 7.1 Backend (.env)

Las variables de entorno necesarias incluyen: `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `GEMINI_API_KEY`, `GROQ_API_KEY`, `RESEND_API_KEY`, `ONESIGNAL_APP_ID`, `ONESIGNAL_REST_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, entre otras.

### 7.2 Frontend Web (.env)

Las variables de entorno necesarias incluyen: `VITE_API_URL` (URL del backend), `VITE_CLERK_PUBLISHABLE_KEY` (clave publica de Clerk).

### 7.3 Variables sensibles

Ninguna variable sensible debe ser commiteada al repositorio. Se utilizan GitHub Secrets para el deploy y archivos `.env` para el desarrollo local.
