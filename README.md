# M3Motors

Plataforma inteligente de gestion y mantenimiento predictivo para talleres mecanicos.

M3Motors es un ecosistema digital disenado para modernizar la operacion de talleres mecanicos mediante la captura sistematica de intervenciones tecnicas y la implementacion de un motor analitico predictivo. La plataforma calcula tasas de desgaste vehicular para despachar alertas proactivas a los clientes a traves de un canal conversacional automatizado.

---

## Aplicacion en Produccion

| Servicio | URL |
|----------|-----|
| Frontend | https://m3motors.com |
| API Backend | https://m3motors.com/api |

---

## Stack Tecnologico

| Capa | Tecnologia |
|------|-----------|
| Backend | NestJS 11 + Prisma 7 + TypeScript |
| Frontend | React 19 + Vite 8 + Tailwind CSS 3 |
| Base de Datos | PostgreSQL 16 (Supabase) |
| Autenticacion | Clerk |
| OCR | Google Gemini |
| Inferencia LLM | Groq |
| Notificaciones Email | Resend |
| Notificaciones Push | OneSignal |
| Cola Asincrona | Redis + Bull |
| Contenedores | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Infraestructura | DigitalOcean Droplet |
| Registry | DockerHub |

---

## Arquitectura

El proyecto sigue los principios de **Domain-Driven Design (DDD)** y **Clean Architecture**. Esta organizado en tres paquetes independientes con sus propios archivos `package.json`:

| Paquete | Ruta | Stack | Tests | Linter |
|---------|------|-------|-------|--------|
| Backend | `backend/` | NestJS + Prisma + PostgreSQL | Jest | ESLint + Prettier |
| Frontend | `frontend/` | React + Vite + Tailwind CSS | Vitest | OxLint |

### Bounded Contexts

```
backend/src/
├── registro-seguimiento/       # CORE: vehiculos, clientes, intervenciones
│   ├── domain/                 # Entidades, value objects, eventos, puertos
│   ├── application/            # Casos de uso, DTOs
│   ├── infrastructure/         # Repos InMemory, servicios externos (Gemini OCR, Groq)
│   └── interfaces/             # Controladores HTTP
├── prediccion-analisis/        # SUPPORTING: analisis predictivo
├── gestion-visualizacion/      # GENERIC: dashboard y visualizacion
├── notification/               # Notificaciones (Bull queues, OneSignal, Resend)
└── shared/                     # Value objects, puertos, errores, utilidades
```

### Mapa de Contextos DDD

```
BC1: Registro y Seguimiento (Core)
  ── Provee historial de KM e intervenciones ──►
BC2: Prediccion y Analisis (Supporting)
  ── Provee alertas predictivas y JSONs MCP ──►
BC3: Gestion y Visualizacion (Generic)
```

### Eventos de Dominio

| Evento | EVENT_NAME | Bounded Context |
|--------|-----------|-----------------|
| WorkshopRegistradoEvent | `workshop.registrado` | Registro y Seguimiento |
| MechanicAgregadoEvent | `mechanic.agregado` | Registro y Seguimiento |
| ClientePreRegistradoEvent | `cliente.pre-registrado` | Registro y Seguimiento |
| ClienteActivadoEvent | `cliente.activado` | Registro y Seguimiento |
| VehiculoActivadoEvent | `vehiculo.activado` | Registro y Seguimiento |
| QRGeneradoEvent | `qr.generado` | Registro y Seguimiento |
| KilometrajeActualizadoEvent | `kilometraje.actualizado` | Registro y Seguimiento |
| IntervencionRegistradaEvent | `intervencion.registrada` | Registro y Seguimiento |
| AlertaGeneradaEvent | `alerta.generada` | Prediccion y Analisis |
| NotificacionEnviadaEvent | `notificacion.enviada` | Notificacion |

---

## Estructura del Repositorio

```
m3motors/
├── backend/                    # API NestJS
│   ├── src/                    # Codigo fuente
│   ├── prisma/                 # Schema Prisma
│   ├── test/                   # Tests unitarios
│   ├── Dockerfile              # Build produccion
│   └── package.json
├── frontend/                   # SPA React
│   ├── src/                    # Codigo fuente (Atomic Design)
│   ├── tests/                  # Tests
│   ├── Dockerfile              # Build produccion (Nginx)
│   ├── nginx.conf              # Configuracion Nginx
│   └── package.json
├── infrastructure/
│   └── database/
│       └── schema.sql          # Schema SQL inicial
├── docs/                       # Documentacion del proyecto
│   ├── 04.6-estructura-carpetas.md
│   ├── 04.7-mapa-contextos.md
│   └── informe-clerk-prisma-supabase.md
├── .github/workflows/
│   ├── ci.yml                  # Pipeline CI (lint + test)
│   └── deploy.yml              # Deploy automatico a produccion
├── docker-compose.yml          # Entorno de desarrollo
├── docker-compose.prod.yml     # Entorno de produccion
├── .env.example                # Variables de entorno de ejemplo
├── AGENTS.md                   # Guia para agentes de IA
├── ONBOARDING.md               # Guia de onboarding
└── README.md                   # Este archivo
```

---

## Requisitos del Sistema

### Para Desarrollo

| Herramienta | Version Minima | Proposito |
|-------------|---------------|-----------|
| Node.js | v22+ | Runtime para backend y frontend |
| npm | v10+ | Gestor de paquetes |
| Docker | v24+ | Contenedores |
| Docker Compose | v2.20+ | Orquestacion de servicios |
| Git | v2.40+ | Control de versiones |

### Para Produccion

| Componente | Especificacion |
|------------|---------------|
| Servidor | DigitalOcean Droplet (Ubuntu 22.04+) |
| CPU | 2+ vRAM |
| RAM | 4GB+ recomendado |
| Disco | 40GB+ SSD |
| Docker | v24+ instalado |
| Docker Compose | v2.20+ instalado |
| Dominio | DNS apuntando al IP del Droplet |
| SSL | Configurado via Nginx (recomendado) |

---

## Configuracion del Entorno de Desarrollo

### 1. Clonar el repositorio

```bash
git clone https://github.com/naturemat/m3motors.git
cd m3motors
```

### 2. Configurar variables de entorno

```bash
# Backend
cp .env.example backend/.env
# Editar backend/.env con tus valores

# Frontend
cp frontend/.env.example frontend/.env
# Editar frontend/.env con tus valores
```

### 3. Iniciar base de datos

```bash
docker-compose up -d postgres redis
```

### 4. Instalar dependencias y iniciar backend

```bash
cd backend
npm install
npx prisma generate
npm run start:dev
```

El backend estara disponible en `http://localhost:3000`.

### 5. Iniciar frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend estara disponible en `http://localhost:5173`.

### Docker Compose (alternativa)

```bash
# Todos los servicios
docker-compose up -d

# Solo bases de datos
docker-compose up postgres redis

# Ver logs del backend
docker-compose logs -f backend
```

---

## Variables de Entorno

### Backend (`backend/.env`)

| Variable | Descripcion | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de conexion a PostgreSQL | `postgresql://postgres:postgres@localhost:5432/m3motors?schema=public` |
| `JWT_SECRET` | Secreto para JWT (generar con `openssl rand -hex 32`) | `<hex-string>` |
| `JWT_EXPIRES_IN` | Tiempo de expiracion JWT | `7d` |
| `GEMINI_API_KEY` | API key de Google AI Studio (OCR) | `AIza...` |
| `GROQ_API_KEY` | API key de Groq (inferencia LLM) | `gsk_...` |
| `RESEND_API_KEY` | API key de Resend (email) | `re_...` |
| `RESEND_FROM_EMAIL` | Email remitente | `onboarding@resend.dev` |
| `ONESIGNAL_APP_ID` | App ID de OneSignal (push) | UUID |
| `ONESIGNAL_REST_API_KEY` | REST API key de OneSignal | UUID |
| `TELEGRAM_BOT_TOKEN` | Token del bot de Telegram | `123456:ABC...` |
| `TELEGRAM_BOT_USERNAME` | Username del bot | `m3motors_bot` |
| `REDIS_HOST` | Host de Redis | `localhost` |
| `REDIS_PORT` | Puerto de Redis | `6379` |
| `LOG_LEVEL` | Nivel de logging | `debug` |
| `CORS_ORIGIN` | Origen permitido CORS | `http://localhost:5173` |
| `APP_PORT` | Puerto del backend | `3000` |
| `NODE_ENV` | Entorno de ejecucion | `development` |

### Frontend (`frontend/.env`)

| Variable | Descripcion | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | URL base del backend | `http://localhost:3000` |
| `VITE_NODE_ENV` | Entorno de ejecucion | `development` |
| `VITE_TELEGRAM_BOT_USERNAME` | Username del bot Telegram | `m3motors_bot` |

---

## Despliegue a Produccion

### Flujo CI/CD

```
Push a main → GitHub Actions detecta cambios
  → Build Docker images → Push a DockerHub
  → SSH al Droplet → Descarga imagenes
  → Crea .env desde GitHub Secrets
  → docker-compose.prod.yml up -d
```

### Configuracion Inicial del Servidor

1. **Crear Droplet en DigitalOcean** (Ubuntu 22.04, 4GB RAM, 40GB SSD)

2. **Instalar Docker y Docker Compose en el Droplet:**
```bash
# Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Docker Compose
apt install docker-compose-plugin
```

3. **Crear GitHub Secrets** en Settings > Secrets and variables > Actions:

| Secret | Descripcion |
|--------|-------------|
| `DOCKERHUB_USERNAME` | Usuario de DockerHub |
| `DOCKERHUB_TOKEN` | Token de acceso DockerHub |
| `DO_HOST` | IP del Droplet |
| `DO_USERNAME` | Usuario SSH (root) |
| `DO_SSH_KEY` | Clave privada SSH completa |
| `DATABASE_URL` | URL de PostgreSQL en produccion |
| `DB_PASSWORD` | Password de PostgreSQL |
| `JWT_SECRET` | Secreto JWT (generar nuevo por entorno) |
| `JWT_EXPIRES_IN` | `7d` |
| `LLM_API_KEY` | API key de OpenAI/Gemini |
| `LLM_MODEL` | `gpt-4` |
| `GEMINI_API_KEY` | API key de Google AI Studio |
| `GROQ_API_KEY` | API key de Groq |
| `RESEND_API_KEY` | API key de Resend |
| `RESEND_FROM_EMAIL` | `onboarding@resend.dev` |
| `ONESIGNAL_APP_ID` | App ID de OneSignal |
| `ONESIGNAL_REST_API_KEY` | REST API key de OneSignal |
| `TELEGRAM_BOT_TOKEN` | Token del bot de Telegram |
| `TELEGRAM_BOT_USERNAME` | `m3motors_bot` |
| `LOG_LEVEL` | `info` |
| `CORS_ORIGIN` | `https://m3motors.com` |

### Deploy Manual

Si necesitas hacer deploy manualmente desde el Droplet:

```bash
cd /opt/m3motors

# Crear .env (o copiarlo manualmente)
cat > .env <<'EOF'
DATABASE_URL=postgresql://postgres:<PASSWORD>@<HOST>:5432/postgres
DB_PASSWORD=<PASSWORD>
JWT_SECRET=<SECRET>
JWT_EXPIRES_IN=7d
LLM_API_KEY=<KEY>
LLM_MODEL=gpt-4
GEMINI_API_KEY=<KEY>
GROQ_API_KEY=<KEY>
RESEND_API_KEY=<KEY>
RESEND_FROM_EMAIL=onboarding@resend.dev
ONESIGNAL_APP_ID=<ID>
ONESIGNAL_REST_API_KEY=<KEY>
TELEGRAM_BOT_TOKEN=<TOKEN>
TELEGRAM_BOT_USERNAME=m3motors_bot
REDIS_HOST=redis
REDIS_PORT=6379
NOTIFICATION_ENABLED=true
NOTIFICATION_MAX_RETRIES=3
NOTIFICATION_RETRY_DELAY_MS=5000
LOG_LEVEL=info
CORS_ORIGIN=https://m3motors.com
DOCKERHUB_USERNAME=<USER>
EOF

# Descargar imagenes
docker compose -f docker-compose.prod.yml pull

# Detener servicios antiguos
docker compose -f docker-compose.prod.yml down

# Iniciar servicios
docker compose -f docker-compose.prod.yml up -d

# Verificar estado
docker compose -f docker-compose.prod.yml ps
```

### Estructura en Produccion

```
/opt/m3motors/
├── .env                    # Variables de entorno (generado por CI)
├── docker-compose.prod.yml # Orquestacion de servicios
├── infrastructure/
│   └── database/
│       └── schema.sql      # Schema SQL
└── postgres_data/          # Volumen de PostgreSQL
```

### Servicios en Produccion

| Servicio | Puerto | Imagen Docker |
|----------|--------|---------------|
| Frontend (Nginx) | 80 | `DOCKERHUB_USER/m3motors-frontend:latest` |
| Backend (NestJS) | 3000 (interno) | `DOCKERHUB_USER/m3motors-backend:latest` |
| PostgreSQL | 5432 (interno) | `postgres:16` |

---

## Comandos Utiles

### Backend (ejecutar desde `backend/`)

```bash
npm install              # Instalar dependencias
npm run build            # Build de produccion
npm run start:dev        # Servidor con hot-reload (puerto 3000)
npm run lint             # ESLint + auto-fix
npm run test             # Todos los tests
npm run test:unit        # Solo tests unitarios
npm run test:cov         # Tests con cobertura
npm run test:e2e         # Tests end-to-end
```

### Frontend (ejecutar desde `frontend/`)

```bash
npm install              # Instalar dependencias
npm run dev              # Servidor de desarrollo Vite (puerto 5173)
npm run build            # Build de produccion (tsc + vite)
npm run lint             # OxLint
npm run test             # Vitest
npm run preview          # Preview del build de produccion
```

---

## Testing

### Ejecutar todos los tests

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

### Cobertura

```bash
cd backend && npm run test:cov
```

El umbral de cobertura para codigo de dominio es del 80% en branches/functions/lines/statements.

---

## Convenciones

### Commits

Prefijos requeridos: `feat`, `fix`, `docs`, `refactor`, `test`

```
feat(domain): implementar eventos de dominio
fix(backend): corregir validacion de placa
docs: actualizar README con instrucciones de despliegue
refactor(infrastructure): migrar repos a Prisma
test(domain): agregar tests para AlertaGeneradaEvent
```

### Ramas

- `feat/`, `feature/` — Nuevas funcionalidades
- `fix/` — Correccion de bugs
- `doc/` — Documentacion
- `dev` — Rama de desarrollo (PRs aqui)
- `main` — Produccion (deploy automatico)

### Codigo

- **TypeScript strict mode** habilitado en backend
- **Prettier**: single quotes, trailing commas
- **Backend**: ESLint flat config (`eslint.config.mjs`)
- **Frontend**: OxLint (`.oxlintrc.json`)
- **Sin emojis** en codigo ni comentarios
- **Nombres en pasado** para eventos de dominio (`WorkshopRegistradoEvent`)

---

## Documentacion Adicional

| Archivo | Contenido |
|---------|-----------|
| `AGENTS.md` | Guia completa para agentes de IA (comandos, arquitectura, convenciones) |
| `ONBOARDING.md` | Guia de onboarding para nuevos desarrolladores |
| `docs/04.6-estructura-carpetas.md` | Estructura de carpetas Backend y Frontend |
| `docs/04.7-mapa-contextos.md` | Mapa de contextos DDD con diagrama Mermaid |
| `docs/informe-clerk-prisma-supabase.md` | Informe de integracion Clerk + Prisma + Supabase |
| `backend/README.md` | README del backend (NestJS) |
| `frontend/README.md` | README del frontend (React + Vite) |

---

## Licencia

Este proyecto es privado. Todos los derechos reservados.
