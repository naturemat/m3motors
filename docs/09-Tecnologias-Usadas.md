# Tecnologias Utilizadas - M3Motors

---

## 1. Backend

### 1.1 NestJS

Framework de Node.js para aplicaciones server-side. Proporciona arquitectura modular, inyeccion de dependencias, guards de autenticacion, interceptores y una estructura de codigo basada en DDD.

**Uso en M3Motors:** Framework principal del API server. Cada bounded context se implementa como un modulo NestJS con sus controladores, servicios y repositorios.

### 1.2 Prisma

ORM tipo-safe para Node.js y TypeScript. Genera un cliente de base de datos a partir de un esquema declarativo. Soporta migraciones, relaciones, y consultas raw.

**Uso en M3Motors:** Acceso a PostgreSQL. El esquema esta definido en `backend/prisma/schema.prisma`. El cliente se genera a `backend/generated/prisma` (ruta no estandar).

### 1.3 PostgreSQL

Sistema de base de datos relacional open-source. Soporta JSONB, extensions geograficas, y transacciones ACID.

**Uso en M3Motors:** Base de datos principal gestionada por Supabase. Almacena todos los datos del dominio: vehiculos, clientes, intervenciones, alertas, notificaciones, catalogos.

### 1.4 Redis

Base de datos en memoria tipo key-value. Utilizada como broker de mensajes para colas de trabajo y como cache.

**Uso en M3Motors:** Broker de la cola Bull para procesamiento asincrono de notificaciones (email y push). Tambien sirve como cache para datos de sesion.

### 1.5 Clerk

Plataforma de autenticacion y gestion de usuarios. Proporciona SSO, organizaciones, webhooks y tokens JWT.

**Uso en M3Motors:** Autenticacion de la interfaz web (admin, mecanico). Webhooks para sincronizar usuarios con la base de datos local.

### 1.6 JWT (JSON Web Tokens)

Estandar para transmision de informacion firmada entre partes. Permite autenticacion stateless sin sesiones en servidor.

**Uso en M3Motors:** Autenticacion de la aplicacion movil. Tokens firmados con JWT_SECRET y verificados por UnifiedAuthGuard.

### 1.7 Groq

Plataforma de inferencia LLM rapida y de bajo costo. Soporta modelos como Llama 3.3.

**Uso en M3Motors:** Dos servicios: (1) Prediccion de mantenimiento basada en historial del vehiculo, (2) Obtencion de especificaciones tecnicas del motor.

### 1.8 Google Gemini AI

Plataforma de IA de Google. Proporciona modelos de lenguaje multimodal (texto + imagen).

**Uso en M3Motors:** Servicio OCR para reconocimiento de placas vehiculares a partir de fotografias.

### 1.9 Playwright

Framework de automatizacion de navegadores web. Soporta multiples navegadores y modos headless.

**Uso en M3Motors:** Scraping del Registro Civil vehicular de Ecuador (CRV) para obtener datos del vehiculo a partir de la placa.

### 1.10 Resend

Servicio de envio de emails transaccionales. API moderna basada en React Email.

**Uso en M3Motors:** Envio de emails: bienvenida, alertas predictivas, recordatorios de activacion.

### 1.11 OneSignal

Plataforma de notificaciones push multiplataforma (web, movil, email).

**Uso en M3Motors:** Notificaciones push a la aplicacion movil para alertas de mantenimiento y recordatorios.

### 1.12 Supabase Storage

Servicio de almacenamiento de archivos en la nube, compatible con S3.

**Uso en M3Motors:** Almacenamiento de fotos de vehiculos y fotos de intervenciones.

### 1.13 Bull

Libreria de colas de trabajo para Node.js basada en Redis. Soporta reintentos, prioridades, y workers.

**Uso en M3Motors:** Cola asincrona para envio de notificaciones email y push con reintento exponencial.

### 1.14 EventEmitter2

Libreria de eventos para Node.js. Soporta namespaces, wildcards y manejo de errores.

**Uso en M3Motors:** EventBus para publicacion y consumo de eventos de dominio entre bounded contexts.

---

## 2. Frontend

### 2.1 React

Libreria de JavaScript para construir interfaces de usuario basadas en componentes.

**Uso en M3Motors:** Framework UI principal. Componentes funcionales con hooks.

### 2.2 Vite

Herramienta de build rapida para frontend. Proporciona HMR (Hot Module Replacement) y optimizacion de produccion.

**Uso en M3Motors:** Build tool del frontend web. Configurado en `frontend/web/vite.config.ts`.

### 2.3 Tailwind CSS

Framework de estilos utility-first. Permite construir interfaces personalizadas sin abandonar el archivo CSS.

**Uso en M3Motors:** Sistema de estilos de toda la interfaz web y movil. Configurado en `frontend/web/tailwind.config.js`.

### 2.4 React Router

Libreria de enrutamiento para React. Soporta rutas anidadas, parametros dinamicos y guards.

**Uso en M3Motors:** Navegacion entre vistas del dashboard y la interfaz movil.

### 2.5 Capacitor

Framework para construir aplicaciones moviles nativas a partir de una app web.

**Uso en M3Motors:** Compilacion del APK de Android a partir del frontend web.

### 2.6 Lucide React

Libreria de iconos open-source para React.

**Uso en M3Motors:** Iconografia de la interfaz de usuario.

### 2.7 Axios

Libreria HTTP para navegadores y Node.js.

**Uso en M3Motors:** Comunicacion del frontend con el API backend.

---

## 3. DevOps

### 3.1 Docker

Plataforma de contenedores. Permite empaquetar aplicaciones con todas sus dependencias.

**Uso en M3Motors:** Contenedores para backend (Node.js), frontend (nginx) y Redis. Archivos Dockerfile en cada directorio.

### 3.2 Docker Compose

Herramienta para definir y ejecutar aplicaciones Docker multi-contenedor.

**Uso en M3Motors:** Orquestacion de servicios. `docker-compose.yml` para desarrollo, `docker-compose.prod.yml` para produccion.

### 3.3 GitHub Actions

Plataforma de CI/CD integrada en GitHub. Permite automatizar pipelines de construccion, test y deploy.

**Uso en M3Motors:** Pipeline CI (lint + test) en PRs a main. Pipeline Deploy (build Docker + push + SSH deploy) al hacer push a main.

### 3.4 nginx

Servidor web de alto rendimiento. Utilizado como reverse proxy y servidor de archivos estaticos.

**Uso en M3Motors:** Servidor del frontend web en produccion. Sirve archivos estaticos construidos por Vite y redirige rutas al index.html para SPA routing.
