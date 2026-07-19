# Modulo Shared

**Ruta del codigo:** `backend/src/shared/`

---

## 1. Descripcion General

El modulo Shared contiene elementos de dominio compartidos entre todos los bounded contexts. Incluye objetos de valor genericos, puertos de infraestructura, eventos base, servicios de autenticacion y utilidades transversales.

---

## 2. Objetos de Valor Compartidos

### 2.1 Placa

**Archivo:** `domain/value-objects/Placa.ts`

Objeto de valor que representa una placa vehicular ecuatoriana.

| Metodo | Descripcion |
|--------|-------------|
| constructor(valor) | Normaliza a mayusculas y valida formato ABC-1234 |
| get valor() | Retorna el valor normalizado |
| equals(otra) | Compara dos placas por su valor |

**Formato valido:** 3 letras seguidas de 4 numeros (ej: ABC-1234)

---

## 3. Puertos Compartidos

### 3.1 Tokens de Inyeccion de Dependencias

**Archivo:** `domain/ports/tokens.ts`

Tokens NestJS para inyeccion de dependencias de repositorios y servicios:

| Token | Descripcion |
|-------|-------------|
| IVEHICULO_REPOSITORY | Repositorio de vehiculos |
| ICLIENTE_REPOSITORY | Repositorio de clientes |
| IINTERVENCION_REPOSITORY | Repositorio de intervenciones |
| IOCR_SERVICE | Servicio de reconocimiento optico |
| IVEHICLE_DATA_PROVIDER | Proveedor de datos vehiculares |
| IENGINE_INFO_SERVICE | Servicio de informacion de motor |
| ISERVICIO_GENERACION_QR | Servicio de generacion de QR |

### 3.2 Publicador de Eventos

**Archivo:** `domain/ports/events/IDomainEventPublisher.ts`

| Metodo | Descripcion |
|--------|-------------|
| publish(event) | Publica un evento de dominio para que sea consumido por handlers |

---

## 4. Eventos Base

**Archivo:** `domain/events/DomainEventBase.ts`

| Propiedad | Tipo | Descripcion |
|-----------|------|-------------|
| eventId | string | Identificador unico del evento |
| occurredOn | Date | Fecha y hora de ocurrencia |
| eventName | string | Nombre del tipo de evento |

**Handler generico:**

```typescript
type EventHandler<T> = (event: T) => Promise<void>;
```

---

## 5. Infraestructura

### 5.1 Base de Datos

| Clase | Archivo | Descripcion |
|-------|---------|-------------|
| PrismaService | `infrastructure/prisma/prisma.service.ts` | Wrapper del cliente Prisma para acceso a la base de datos |

### 5.2 Autenticacion

| Clase | Archivo | Descripcion |
|-------|---------|-------------|
| MobileJwtService | `infrastructure/auth/jwt.service.ts` | Servicio JWT para autenticacion de la aplicacion movil (firmar y verificar tokens) |
| UnifiedAuthGuard | `infrastructure/auth/unified-auth.guard.ts` | Guard de autenticacion unificado que soporta tokens mobile legacy y JWT |
| MobileAuthGuard | `infrastructure/auth/mobile-auth.guard.ts` | Guard para formato legacy mobile: mobile:::userId:::m3motors |

### 5.3 Clerk (Autenticacion Web)

| Clase | Archivo | Descripcion |
|-------|---------|-------------|
| ClerkService | `infrastructure/clerk/clerk.service.ts` | Wrapper del SDK de Clerk para gestion de usuarios y organizaciones |
| ClerkAuthGuard | `infrastructure/clerk/clerk.guard.ts` | Guard que verifica tokens JWT de Clerk para rutas web de admin y mecanico |
| WebhookHandlerService | `infrastructure/clerk/services/webhook-handler.service.ts` | Procesa webhooks de Clerk para sincronizar usuarios (admin, mecanico, cliente) |
| AuthController | `infrastructure/clerk/controllers/auth.controller.ts` | Controlador de autenticacion: /auth/me (usuario actual) y /auth/webhook (receptor de webhooks) |

### 5.4 Almacenamiento

| Clase | Archivo | Descripcion |
|-------|---------|-------------|
| SupabaseStorageService | `infrastructure/storage/supabase-storage.service.ts` | Servicio de archivos usando Supabase Storage API (subir, eliminar, validar imagenes) |

### 5.5 Eventos

| Clase | Archivo | Descripcion |
|-------|---------|-------------|
| NestEventPublisher | `infrastructure/events/NestEventPublisher.ts` | Implementacion de IDomainEventPublisher usando EventEmitter2 de NestJS |

### 5.6 Logging

| Clase | Archivo | Descripcion |
|-------|---------|-------------|
| HttpLoggerMiddleware | `infrastructure/logging/http-logger.middleware.ts` | Middleware de logging HTTP para peticiones entrantes. Activo solo en modo debug |

---

## 6. Patron de Autenticacion

```
Peticion HTTP
     │
     ▼
UnifiedAuthGuard
     │
     ├──► MobileAuthGuard (formato legacy: mobile:::userId:::m3motors)
     │
     ├──► MobileJwtService.verify() (tokens JWT mobile)
     │
     └──► ClerkAuthGuard (tokens Clerk para web)
              │
              ▼
         ClerkService.verifyToken()
```
