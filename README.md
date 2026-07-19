# M3Motors

Plataforma inteligente de gestión y mantenimiento predictivo para talleres mecánicos.

M3Motors es un ecosistema digital diseñado para modernizar la operación de talleres mecánicos mediante la captura sistemática de intervenciones técnicas y la implementación de un motor analítico predictivo. La plataforma calcula tasas de desgaste vehicular para despachar alertas proactivas a los clientes a través de un canal conversacional automatizado.

---

## Aplicación en Producción

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Frontend Web | https://m3motors.me | Panel de administración + dashboard del taller |
| API Backend | https://m3motors.me/api | API REST documentada con Swagger |
| Documentación API | https://m3motors.me/api/docs | Swagger UI |
| APK Mobile | https://m3motors.me/apk/M3Motors.apk | App Android (Capacitor) |

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | NestJS 11 + Prisma 7 + TypeScript |
| Frontend Web | React 19 + Vite 8 + Tailwind CSS 3 |
| Mobile | Capacitor (envuelve la app web) |
| Base de Datos | PostgreSQL 16 (Supabase) |
| Autenticación Web | Clerk (JWT + SSO) |
| Autenticación Mobile | JWT propio (bcrypt + JWT firmado) |
| OCR | Google Gemini (reconocimiento de placas vehiculares) |
| Inferencia LLM | Groq (predicción de mantenimiento) |
| Notificaciones Email | Resend |
| Notificaciones Push | OneSignal |
| Cola Asíncrona | Redis + Bull |
| Contenedores | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Infraestructura | DigitalOcean Droplet |
| Registry | DockerHub |

---

## Arquitectura

El proyecto sigue los principios de **Domain-Driven Design (DDD)** y **Clean Architecture**. Está organizado en tres paquetes independientes con sus propios archivos `package.json`:

| Paquete | Ruta | Stack | Tests | Linter |
|---------|------|-------|-------|--------|
| Backend | `backend/` | NestJS + Prisma + PostgreSQL | Jest | ESLint + Prettier |
| Frontend Web | `frontend/web/` | React + Vite + Tailwind CSS | Vitest | OxLint |
| Frontend Mobile | `frontend/mobile/` | Capacitor (envuelve web) | Jest | ESLint |

### Bounded Contexts (DDD)

```
backend/src/
├── registro-seguimiento/       # CORE: vehículos, clientes, intervenciones
│   ├── domain/                 # Entidades, value objects, eventos, puertos
│   ├── application/            # Casos de uso, DTOs
│   ├── infrastructure/         # Repos InMemory, servicios externos (Gemini OCR, Groq)
│   └── interfaces/             # Controladores HTTP
│
├── prediccion-analisis/        # SUPPORTING: análisis predictivo de mantenimiento
│   ├── domain/                 # Eventos de predicción
│   ├── application/            # Casos de uso de predicción
│   └── infrastructure/         # LLM (Groq), handlers de eventos
│
├── gestion-visualizacion/      # GENERIC: dashboard y visualización
│   ├── domain/                 # Entidades de KPIs
│   ├── application/            # Casos de uso de KPIs (taller, mecánico, cliente)
│   └── interfaces/             # Controladores de dashboard
│
├── notification/               # CROSS-CUTTING: notificaciones
│   ├── domain/                 # Value objects de notificación
│   ├── application/            # Casos de uso (enviar, reintentar)
│   └── infrastructure/         # Bull queues, OneSignal, Resend
│
└── shared/                     # Infraestructura compartida
    ├── infrastructure/         # Prisma, Clerk, Auth, Storage (Supabase)
    ├── domain/                 # Value objects, puertos, errores
    └── interfaces/             # Controladores compartidos (auth, vehicles, etc.)
```

### Mapa de Contextos DDD

```
BC1: Registro y Seguimiento (Core)
  ── Provee historial de KM e intervenciones ──►
BC2: Predicción y Análisis (Supporting)
  ── Provee alertas predictivas y recomendaciones ──►
BC3: Gestión y Visualización (Generic)
  ── Consuma datos de BC1 y BC2 para dashboards ──►
BC4: Notificación (Cross-Cutting)
  ── Envía emails (Resend) y push (OneSignal) ──►
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
| AlertaGeneradaEvent | `alerta.generada` | Predicción y Análisis |
| NotificacionEnviadaEvent | `notificacion.enviada` | Notificación |

---

## Funcionalidades

### Panel de Administración (Web)
- **Dashboard**: KPIs del taller (vehículos, clientes, ingresos, intervenciones)
- **Gestión de Mecánicos**: CRUD de mecánicos con especialidad y calificación
- **Gestión de Clientes**: CRUD de clientes con pre-registro y activación
- **Catálogo de Servicios**: Servicios del taller con precios de referencia
- **Órdenes de Servicio**: Órdenes de trabajo con seguimiento de estados

### Panel del Mecánico (Mobile)
- **Dashboard**: KPIs personales (intervenciones, vehículos atendidos, clientes)
- **Escanear QR**: Cámara para escanear código QR del vehículo
- **Registrar Vehículo**: Foto + OCR para reconocer placa automáticamente
- **Historial de Intervenciones**: Lista de trabajos realizados
- **Clientes Asignados**: Lista de clientes del taller

### Panel del Cliente (Mobile)
- **Mis Vehículos**: Lista de vehículos registrados con kilometraje
- **Historial**: Intervenciones realizadas en cada vehículo
- **Actualizar Kilometraje**: Registro rápido de nuevo kilometraje
- **Código QR**: Visualización del QR del vehículo
- **Notificaciones**: Alertas de mantenimiento y servicios

### Motor Predictivo
- **Cálculo de Desgaste**: Tasa semanal de desgaste por vehículo
- **Alertas Proactivas**: Predicción de próximo mantenimiento
- **Recomendaciones**: LLM (Groq) genera mensajes amigables para el cliente
- **Componentes Críticos**: Seguimiento de vida útil por componente

---

## Estructura del Repositorio

```
m3motors/
├── backend/                    # API NestJS
│   ├── src/                    # Código fuente (DDD)
│   ├── prisma/                 # Schema Prisma
│   ├── test/                   # Tests unitarios y e2e
│   ├── Dockerfile              # Build producción
│   └── package.json
│
├── frontend/
│   ├── web/                    # SPA React + Vite
│   │   ├── src/                # Código fuente
│   │   ├── android/            # Capacitor (build APK)
│   │   ├── tests/              # Tests Vitest
│   │   ├── Dockerfile          # Build producción (Nginx)
│   │   ├── nginx.conf          # Configuración Nginx
│   │   └── package.json
│   └── mobile/                 # Artefactos APK
│
├── .github/workflows/
│   ├── ci.yml                  # Pipeline CI (lint + test)
│   └── deploy.yml              # Deploy automático a producción
│
├── docker-compose.yml          # Entorno de desarrollo
├── docker-compose.prod.yml     # Entorno de producción
├── .env.example                # Variables de entorno de ejemplo
├── AGENTS.md                   # Guía para agentes de IA
├── ONBOARDING.md               # Guía de onboarding
└── README.md                   # Este archivo
```

---

## Requisitos del Sistema

### Para Desarrollo

| Herramienta | Versión Mínima | Propósito |
|-------------|---------------|-----------|
| Node.js | v22+ | Runtime para backend y frontend |
| npm | v10+ | Gestor de paquetes |
| Docker | v24+ | Contenedores |
| Docker Compose | v2.20+ | Orquestación de servicios |
| Git | v2.40+ | Control de versiones |

### Para Producción

| Componente | Especificación |
|------------|---------------|
| Servidor | DigitalOcean Droplet (Ubuntu 24.04+) |
| CPU | 2+ vCPU |
| RAM | 4GB+ recomendado |
| Disco | 40GB+ SSD |
| Docker | v24+ instalado |
| Docker Compose | v2.20+ instalado |
| Dominio | DNS apuntando al IP del Droplet |

---

## Configuración del Entorno de Desarrollo

### 1. Clonar el repositorio

```bash
git clone https://github.com/naturemat/m3motors.git
cd m3motors
```

### 2. Configurar variables de entorno

```bash
# Backend
cp .env.example backend/.env
# Editar backend/.env con tus valores (ver sección Variables de Entorno)

# Frontend Web
cp frontend/web/.env.example frontend/web/.env
# Editar frontend/web/.env
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

El backend estará disponible en `http://localhost:3000`.
Documentación Swagger: `http://localhost:3000/api/docs`

### 5. Iniciar frontend web

```bash
cd frontend/web
npm install
npm run dev
```

El frontend estará disponible en `http://localhost:5173`.

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

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `APP_PORT` | Puerto del backend | Sí (3000) |
| `NODE_ENV` | Entorno de ejecución | Sí (development) |
| `DATABASE_URL` | URL de PostgreSQL (pooler transacciones) | Sí |
| `DIRECT_URL` | URL de PostgreSQL (pooler sesiones, para migraciones) | Sí |
| `SUPABASE_URL` | URL del proyecto Supabase | Sí |
| `SUPABASE_ANON_KEY` | Clave pública de Supabase | Sí |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio de Supabase | Sí |
| `SUPABASE_STORAGE_BUCKET` | Nombre del bucket de almacenamiento | Sí (m3motors-photos) |
| `CLERK_SECRET_KEY` | Secreto de Clerk (web auth) | Sí |
| `CLERK_ISSUER_URL` | URL del emisor de Clerk | Sí |
| `CLERK_WEBHOOK_SECRET` | Secreto del webhook de Clerk | Sí |
| `JWT_SECRET` | Secreto para JWT mobile | Sí |
| `JWT_EXPIRES_IN` | Tiempo de expiración JWT | Sí (7d) |
| `GEMINI_API_KEY` | API key de Google AI Studio (OCR) | Sí |
| `GROQ_API_KEY` | API key de Groq (inferencia LLM) | Sí |
| `RESEND_API_KEY` | API key de Resend (email) | Sí |
| `RESEND_FROM_EMAIL` | Email remitente | Sí |
| `ONESIGNAL_APP_ID` | App ID de OneSignal (push) | Sí |
| `ONESIGNAL_REST_API_KEY` | REST API key de OneSignal | Sí |
| `REDIS_HOST` | Host de Redis | Sí (localhost) |
| `REDIS_PORT` | Puerto de Redis | Sí (6379) |
| `LOG_LEVEL` | Nivel de logging (debug/info/warn) | Sí (debug) |
| `CORS_ORIGIN` | Origen permitido CORS | Sí |
| `QR_BASE_URL` | URL base para códigos QR | Sí |

### Frontend Web (`frontend/web/.env`)

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `VITE_API_URL` | URL base del backend | Sí (http://localhost:3000) |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clave pública de Clerk | Sí |

---

## Despliegue a Producción

### Flujo CI/CD

```
Push a main → GitHub Actions detecta cambios
  → Build Docker images (backend + frontend)
  → Push a DockerHub
  → SSH al Droplet
  → git pull
  → Crea .env desde GitHub Secrets
  → docker-compose.prod.yml up -d
  → Build APK (Capacitor)
  → Limpiar imágenes antiguas
```

### Configuración Inicial del Servidor

1. **Crear Droplet en DigitalOcean** (Ubuntu 24.04, 4GB RAM, 40GB SSD)

2. **Instalar Docker y Docker Compose en el Droplet:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
apt install docker-compose-plugin
```

3. **Crear GitHub Secrets** en Settings > Secrets and variables > Actions:

| Secret | Descripción |
|--------|-------------|
| `DOCKERHUB_USERNAME` | Usuario de DockerHub |
| `DOCKERHUB_TOKEN` | Token de acceso DockerHub |
| `DO_HOST` | IP del Droplet |
| `DO_USERNAME` | Usuario SSH (root) |
| `DO_SSH_KEY` | Clave privada SSH completa |
| `DATABASE_URL` | URL de PostgreSQL en producción |
| `DIRECT_URL` | URL directa de PostgreSQL (migraciones) |
| `JWT_SECRET` | Secreto JWT (generar nuevo por entorno) |
| `JWT_EXPIRES_IN` | Tiempo de expiración JWT |
| `CLERK_SECRET_KEY` | Secreto de Clerk |
| `CLERK_ISSUER_URL` | URL del emisor de Clerk |
| `CLERK_WEBHOOK_SECRET` | Secreto del webhook de Clerk |
| `GEMINI_API_KEY` | API key de Google AI Studio |
| `GROQ_API_KEY` | API key de Groq |
| `RESEND_API_KEY` | API key de Resend |
| `RESEND_FROM_EMAIL` | Email remitente |
| `ONESIGNAL_APP_ID` | App ID de OneSignal |
| `ONESIGNAL_REST_API_KEY` | REST API key de OneSignal |
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_ANON_KEY` | Clave pública de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio de Supabase |
| `SUPABASE_STORAGE_BUCKET` | Nombre del bucket |
| `QR_BASE_URL` | URL base para QR |
| `LOG_LEVEL` | Nivel de logging (info) |
| `CORS_ORIGIN` | Dominio de producción |
| `VITE_API_URL` | URL de la API para el frontend |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clave pública de Clerk |

### Estructura en Producción

```
/opt/m3motors/
├── .env                         # Variables de entorno (generado por CI)
├── docker-compose.prod.yml      # Orquestación de servicios
├── frontend/web/android/        # Capacitor (build APK)
└── apk/
    └── M3Motors.apk             # APK generado
```

### Servicios en Producción

| Servicio | Puerto | Imagen Docker |
|----------|--------|---------------|
| Frontend (Nginx) | 80 | `DOCKERHUB_USER/m3motors-frontend:latest` |
| Backend (NestJS) | 3000 (interno) | `DOCKERHUB_USER/m3motors-backend:latest` |
| Redis | 6379 (interno) | `redis:7-alpine` |

---

## Comandos Útiles

### Backend (ejecutar desde `backend/`)

```bash
npm install              # Instalar dependencias
npm run build            # Build de producción
npm run start:dev        # Servidor con hot-reload (puerto 3000)
npm run lint             # ESLint + auto-fix
npm run test             # Todos los tests
npm run test:unit        # Solo tests unitarios
npm run test:cov         # Tests con cobertura
npm run test:e2e         # Tests end-to-end
npx prisma generate      # Regenerar cliente Prisma
npx prisma migrate dev   # Ejecutar migraciones
```

### Frontend Web (ejecutar desde `frontend/web/`)

```bash
npm install              # Instalar dependencias
npm run dev              # Servidor de desarrollo Vite (puerto 5173)
npm run build            # Build de producción (tsc + vite)
npm run lint             # OxLint
npm run test             # Vitest
npm run preview          # Preview del build de producción
```

### Docker

```bash
# Todos los servicios
docker-compose up -d

# Solo bases de datos
docker-compose up postgres redis

# Ver logs del backend
docker-compose logs -f backend

# Producción
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml ps
```

---

## Testing

```bash
# Backend - todos los tests
cd backend && npm test

# Backend - cobertura
cd backend && npm run test:cov

# Frontend - tests
cd frontend/web && npm test
```

El umbral de cobertura para código de dominio es del 80% en branches/functions/lines/statements.

---

## Convenciones

### Commits

Prefijos requeridos: `feat`, `fix`, `docs`, `refactor`, `test`

```
feat(domain): implementar eventos de dominio
fix(backend): corregir validación de placa
docs: actualizar README con instrucciones de despliegue
refactor(infrastructure): migrar repos a Prisma
test(domain): agregar tests para AlertaGeneradaEvent
```

### Ramas

- `feat/`, `feature/` — Nuevas funcionalidades
- `fix/` — Corrección de bugs
- `doc/` — Documentación
- `dev` — Rama de desarrollo (PRs aquí)
- `main` — Producción (deploy automático)

### Código

- **TypeScript strict mode** habilitado en backend
- **Prettier**: single quotes, trailing commas
- **Backend**: ESLint flat config (`eslint.config.mjs`)
- **Frontend**: OxLint (`.oxlintrc.json`)
- **Sin emojis** en código ni comentarios
- **Nombres en pasado** para eventos de dominio (`WorkshopRegistradoEvent`)

---

## Debug y Logging

El sistema de logging del backend tiene 5 capas, activadas con `LOG_LEVEL=debug`:

| Capa | Qué loguea |
|------|-----------|
| HTTP Middleware | Cada request/response (método, URL, status, duración) |
| Auth Guard | Token recibido, payload decodificado |
| Controllers | Datos recibidos, usuario encontrado, datos enviados |
| KPIs Use Cases | Tablas consultadas, filtros, resultados |
| Prisma Service | Cada query SQL, parámetros, duración |

En producción (`LOG_LEVEL=info`) todo está desactivado.

---

## Documentación Adicional

| Archivo | Contenido |
|---------|-----------|
| `AGENTS.md` | Guía completa para agentes de IA |
| `ONBOARDING.md` | Guía de onboarding para nuevos desarrolladores |
| `DIAGNOSTICO_MOBILE.md` | Diagnóstico del flujo mobile (auditoría completa) |

---

## Licencia

Este proyecto es privado. Todos los derechos reservados.
