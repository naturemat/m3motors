# Flujo de CI/CD - M3Motors

---

## 1. Vision General

M3Motors utiliza GitHub Actions para automatizar la integracion continua y el despliegue. El sistema consta de dos pipelines independientes:

1. **CI Pipeline:** Se ejecuta en Pull Requests hacia `main`. Valida lint y tests.
2. **Deploy Pipeline:** Se ejecuta al hacer push a `main`. Construye, empaqueta y despliega.

---

## 2. CI Pipeline (Pull Requests)

**Trigger:** Pull Request hacia `main`
**Concurrency:** Cancela ejecuciones anteriores del mismo PR

### 2.1 Deteccion de Cambios

El primer job analiza los archivos modificados para determinar que paquetes afectan los cambios:

| Filtro | Paquetes detectados |
|--------|---------------------|
| `backend/**` | Backend |
| `frontend/web/**` | Frontend Web |

Solo se ejecutan los jobs correspondientes a los paquetes modificados.

### 2.2 Jobs

| Job | Paquete | Acciones |
|-----|---------|----------|
| Backend Lint | Backend | `npm ci` + `npm run lint` (ESLint + Prettier) |
| Frontend Web Lint | Frontend Web | `npm install --legacy-peer-deps` + `npm run lint` (OxLint) |
| Backend Test | Backend | `npm ci` + `npm run test` (Jest) |
| Frontend Web Test | Frontend Web | `npm install --legacy-peer-deps` + `npm run test` (Vitest) |

### 2.3 Configuracion

- **Node.js:** Version 22
- **Timeout:** 10 minutos por job
- **Cache:** npm cache con dependencias de package-lock.json

---

## 3. Deploy Pipeline (Produccion)

**Trigger:** Push a `main`
**Concurrency:** Cancela ejecuciones anteriores

### 3.1 Fase: Deteccion de Cambios

Igual que en CI, analiza archivos modificados para determinar que construir.

### 3.2 Fase: Build Docker

#### Backend

| Paso | Descripcion |
|------|-------------|
| Checkout | Descarga el codigo |
| Docker Buildx | Configura el builder |
| Docker Login | Autenticacion con DockerHub |
| Build + Push | Construye imagen desde `backend/Dockerfile` y push a DockerHub |

**Etiqueta:** `<username>/m3motors-backend:latest`
**Cache:** GitHub Actions cache (GHA)

#### Frontend Web

| Paso | Descripcion |
|------|-------------|
| Checkout | Descarga el codigo |
| Docker Buildx | Configura el builder |
| Docker Login | Autenticacion con DockerHub |
| Build + Push | Construye imagen desde `frontend/web/Dockerfile` con build args de VITE y push a DockerHub |

**Etiqueta:** `<username>/m3motors-frontend:latest`
**Build args:** Variables de entorno de Vite inyectadas en tiempo de build
**Cache:** GitHub Actions cache (GHA)

### 3.3 Fase: Deploy via SSH

Se conecta al servidor via SSH y ejecuta un script de despliegue de 8 pasos:

| Paso | Accion |
|------|--------|
| 1 | Limpiar residuos Docker (contenedores, volumenes, redes huérfanas) |
| 2 | Pull de nuevas imagenes Docker (ANTES de detener las viejas) |
| 3 | Limpiar logs de contenedores mayores a 50MB |
| 4 | Detener y recrear contenedores con `docker compose up -d --force-recreate` |
| 5 | Verificar estado de contenedores (espera 15 segundos) |
| 6 | Verificar salud del backend via endpoint `/health` (3 intentos) |
| 7 | Construir APK local en el servidor |
| 8 | Limpiar imagenes Docker no utilizadas (mayores a 24h) |

### 3.4 Fase: Build APK (en servidor)

El APK de Android se construye directamente en el servidor de produccion:

| Paso | Descripcion |
|------|-------------|
| 1 | Limpiar APK anterior |
| 2 | Ejecutar script `scripts/build-apk.sh` |
| 3 | Verificar que el APK se genero correctamente |
| 4 | El APK queda disponible en `/apk/M3Motors.apk` |

### 3.5 Fase: Cleanup

Siempre se ejecuta, incluso si el deploy falla. Elimina la clave SSH temporal del runner.

---

## 4. Diagrama de Flujo

```
Push a main
     │
     ▼
Detect Changes
     │
     ├──► Build Backend (Docker)
     │         │
     │         ▼
     │    Push a DockerHub
     │
     ├──► Build Frontend (Docker)
     │         │
     │         ▼
     │    Push a DockerHub
     │
     ▼
Deploy via SSH
     │
     ├──► Pull nuevas imagenes
     ├──► Recrear contenedores
     ├──► Verificar salud backend
     ├──► Build APK
     └──► Limpiar imagenes
```

---

## 5. Servicios en Produccion

| Servicio | Imagen Docker | Puerto |
|----------|---------------|--------|
| Frontend (nginx) | `m3motors-frontend:latest` | 80 |
| Backend (Node.js) | `m3motors-backend:latest` | 3000 |
| Redis | `redis:7-alpine` | 6379 |

---

## 6. Variables de Entorno en Produccion

Las variables de entorno se construyen en el servidor a partir de GitHub Secrets. El archivo `.env` se genera automaticamente durante cada deploy.

**Principio:** Ninguna variable sensible se almacena en el repositorio. Todas las credenciales, tokens y claves se gestionan via GitHub Secrets.

---

## 7. Rollback

En caso de fallo, el proceso de rollback es manual:

1. Identificar el commit anterior funcional
2. Hacer revert o push del commit anterior a `main`
3. El pipeline de deploy se ejecuta automaticamente con la version anterior

---

## 8. Monitoreo

- **Health check:** Endpoint `GET /health` en el backend (verificacion cada 15 segundos durante deploy)
- **Logs:** `docker compose logs -f` en el servidor para monitoreo en tiempo real
- **Contenedores:** `docker compose ps` para verificar estado
