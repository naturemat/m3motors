# Diagnóstico: Flujo de Datos - Mobile y Web

## Arquitectura dual: Mobile vs Web

```
MOBILE (Capacitor):
  MobileLogin → POST /auth/login-mobile { email, password }
    → Backend: AuthMobileController → JWT con { sub: clerkId, role }
    → localStorage guarda token
  Mobile pages → Authorization: Bearer <jwt-token>
    → Backend: UnifiedAuthGuard → extrae userId del JWT
    → Controllers buscan por clerkId

WEB (Clerk):
  Login → Clerk SignIn → Clerk maneja auth
    → ClerkProvider con HashRouter
  Web pages → Clerk useAuth() → getToken()
    → Backend: ClerkAuthGuard → verifica Clerk JWT
    → Controllers buscan por Clerk userId
```

**Diferencia clave:**
- Mobile usa **JWT propio** (generado por `AuthMobileController`)
- Web usa **Clerk JWT** (generado por Clerk, verificado por `ClerkAuthGuard`)
- Ambos comparten el **mismo backend**, pero usan **guards diferentes**

---

## Auditoría de los 12 puntos de falla (ambos flujos)

### #1 - Parseo del token ✅ OK

El backend NO usa el formato `mobile:::email:::m3motors`. Usa **JWT real**.

- `MobileLogin.tsx` llama `POST /auth/login-mobile` con `{ email, password }`
- `AuthMobileController.loginMobile()` busca el usuario, genera un JWT con `{ sub: clerkId, role, workshopId }`
- `UnifiedAuthGuard` verifica el JWT y extrae `userId = payload.sub` (el clerkId)
- Las paginas mobile envian `Authorization: Bearer <jwt-token>`

**Estado:** Funciona correctamente. El token es un JWT estandar, no un string legacy.

---

### #2 - Coincidencia del email ⚠️ RIESGO MEDIO

El backend busca el email **tal cual llega**, sin sanitizar:

```typescript
// auth-mobile.controller.ts:134
const mechanic = await this.prisma.client$.mechanic.findFirst({
  where: { email },  // <-- sin trim(), sin toLowerCase()
});
```

PostgreSQL es **case-sensitive**. Si el usuario escribe `Mecanico@M3motors.me` pero en BD es `mecanico@m3motors.me`, **no lo encuentra**.

**Estado:** Falta `trim()` y `toLowerCase()` en el email antes de buscar.

---

### #3 - Campo de búsqueda (email vs clerk_id) ✅ OK

Hay una cadena coherente:

1. **Login** busca por `email` en tabla mecanico/cliente
2. Si encuentra, obtiene `mechanic.clerkId` (si es null, genera uno nuevo con `crypto.randomUUID()`)
3. El JWT tiene `sub: clerkId`
4. **Los endpoints del dashboard** buscan por `clerkId: userId` (que es `payload.sub`)

**Estado:** La cadena login → JWT → endpoints funciona. Pero ver punto #7.

---

### #4 - Determinación del rol ✅ OK

```typescript
// auth-mobile.controller.ts:133-217
// 1. Primero busca en tabla "mechanic" -> si encuentra, rol = 'mechanic'
// 2. Luego busca en tabla "cliente" -> si encuentra, rol = 'client'
// 3. El rol se guarda en el JWT y se retorna al frontend
```

**Estado:** Correcto. El rol se deduce de la tabla donde se encuentra el email.

---

### #5 - Filtro de status ✅ OK (no es el problema)

El login **NO filtra por status ni por `activo`**. Busca solo por email:

```typescript
const mechanic = await this.prisma.client$.mechanic.findFirst({
  where: { email },  // sin filtro de activo ni status
});
```

**Estado:** No hay filtro restrictivo. Si el email existe en la tabla, puede loguear.

---

### #6 - Filtro por id_workshop ✅ OK

- El JWT incluye `workshopId`
- Los endpoints mobile buscan el mecanico/cliente por `clerkId`, y de ahi obtienen el `workshopId`
- No hay conflicto de workshop

**Estado:** Correcto.

---

### #7 - Obtención del ID del mecánico ⚠️ PROBLEMA CRITICO

El ID numerico del mecanico (`mechanic.id`) **NO viene en el JWT**. Solo viene `clerkId` (UUID).

Cada endpoint lo busca:
```typescript
// mechanic-dashboard.controller.ts:37-38
const mechanic = await this.prisma.client$.mechanic.findFirst({
  where: { clerkId: userId },
});
```

**El problema real es otro:** Cuando el **admin crea un mecanico** via `/admin/mechanics`, el mecanico se crea **SIN `passwordHash`**:

```typescript
// admin.controller.ts:137-146
const mechanic = await this.prisma.client$.mechanic.create({
  data: {
    workshopId: workshop.id,
    clerkId: clerkUserId ?? crypto.randomUUID(),
    nombre: dto.nombre,
    especialidad: dto.especialidad ?? null,
    activo: true,
    // NO SE GENERA passwordHash
  },
});
```

Entonces cuando el mecanico intenta login mobile:
```typescript
// auth-mobile.controller.ts:140-151
if (mechanic.passwordHash) {
  // verificar password... 
} else {
  throw new UnauthorizedException('Cuenta sin configurar. Contacta al administrador.');
}
```

**Estado:** Mecánicos creados por el admin **NO pueden hacer login mobile** porque no tienen password.

---

### #8 - Formato de respuesta ✅ OK

Los endpoints retornan la estructura que la app espera:
- `/mechanic/dashboard/kpis` → objeto con KPIs
- `/mechanic/dashboard/clientes-pendientes` → `{ clientes: [...] }`
- `/client/dashboard/vehiculos` → `{ vehiculos: [...] }`
- `/client/dashboard/historial` → `{ historial: [...] }`

La app lee `res.data.vehiculos`, `res.data.clientes`, etc.

**Estado:** Correcto.

---

### #9 - Envío del token ⚠️ RIESGO BAJO

La app guarda el token en localStorage:
```typescript
localStorage.setItem('mobile_user', JSON.stringify({
  userId, role, name, workshopId, token
}))
```

Y lo lee asi:
```typescript
const mobileUser = JSON.parse(localStorage.getItem('mobile_user') ?? '{}')
const headers = { Authorization: `Bearer ${mobileUser.token}` }
```

Si `localStorage` está vacío o corrupto, `mobileUser.token` será `undefined` y el header será `Bearer undefined`.

**Estado:** Funciona, pero no hay validación de que el token exista antes de hacer requests.

---

### #10 - Endpoint correcto ✅ OK

Los paths coinciden:
| Mobile llama | Backend controller |
|---|---|
| `${apiUrl}/auth/login-mobile` | `@Controller('auth')` + `@Post('login-mobile')` |
| `${apiUrl}/mechanic/dashboard/kpis` | `@Controller('mechanic/dashboard')` + `@Get('kpis')` |
| `${apiUrl}/mechanic/dashboard/clientes-pendientes` | `@Controller('mechanic/dashboard')` + `@Get('clientes-pendientes')` |
| `${apiUrl}/client/dashboard/vehiculos` | `@Controller('client/dashboard')` | `@Get('vehiculos')` |
| `${apiUrl}/client/dashboard/historial` | `@Controller('client/dashboard')` | `@Get('historial')` |

**Estado:** Correcto.

---

### #11 - Renderizado en la app ⚠️ RIESGO MEDIO

Si el backend no encuentra el mecanico/cliente, retorna datos vacíos **sin error HTTP**:

```typescript
// mechanic-dashboard.controller.ts:41
if (!mechanic) return { vehiculos: [] };

// client-dashboard.controller.ts:41
if (!cliente) return { vehiculos: [] };
```

La app mobile no distingue entre "no hay datos" y "hubo un error":
```typescript
// MobileMechanicDashboard.tsx:47-48
if (kpisRes.data) setKpis(kpisRes.data)
setClientesPendientes(clientesRes.data.clientes ?? [])
```

Si `kpisRes.data` es `{ totalIntervenciones: 0, ... }` (caso cuando no encuentra mecanico), la app **muestra zeros sin error visible**.

**Estado:** La app no muestra error cuando el backend retorna datos vacíos.

---

### #12 - CORS o problemas de red ✅ OK

```typescript
// main.ts:16-34
app.enableCors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(null, false);
  },
  credentials: true,
});
```

**Estado:** CORS permite localhost y el dominio configurado.

---

## Resumen de los 12 puntos

| # | Punto | Estado | Impacto |
|---|-------|--------|---------|
| 1 | Parseo del token | ✅ OK | - |
| 2 | Coincidencia del email | ⚠️ Sin trim/toLowerCase | Puede no encontrar usuario |
| 3 | Campo de búsqueda | ✅ OK | - |
| 4 | Determinación del rol | ✅ OK | - |
| 5 | Filtro de status | ✅ OK | - |
| 6 | Filtro por workshop | ✅ OK | - |
| 7 | ID del mecánico | ⚠️ CRITICO | Mecánicos sin password no pueden loguear |
| 8 | Formato de respuesta | ✅ OK | - |
| 9 | Envío del token | ⚠️ Sin validación | Token undefined si localStorage vacío |
| 10 | Endpoint correcto | ✅ OK | - |
| 11 | Renderizado en app | ⚠️ Sin manejo de error | Muestra zeros sin error visible |
| 12 | CORS/Red | ✅ OK | - |

---

---

## Verificación específica del equipo (5 puntos)

### PUNTO 1: ¿Qué valor usa el JWT para `sub`?

**Archivo:** `backend/src/interfaces/controllers/auth-mobile.controller.ts`

**Líneas 92-97** (registro):
```typescript
const token = this.jwtService.signToken({
  sub: clerkId,      // <-- clerkId = UUID generado con crypto.randomUUID()
  role: 'client',
  workshopId: assignedWorkshopId,
  name: client.nombre,
});
```

**Líneas 162-167** (login mecánico):
```typescript
const token = this.jwtService.signToken({
  sub: clerkId,      // <-- clerkId = mechanic.clerkId (UUID de Clerk o generado)
  role: 'mechanic',
  workshopId: mechanic.workshopId,
  name: mechanic.nombre,
});
```

**Líneas 204-208** (login cliente):
```typescript
const token = this.jwtService.signToken({
  sub: clerkId,      // <-- clerkId = client.clerkId (UUID de Clerk o generado)
  role: 'client',
  name: client.nombre,
});
```

**Respuesta: `sub` = `clerkId` (UUID), NO el id numérico.**

---

### PUNTO 2: ¿Qué valor usa el dashboard para buscar al usuario?

**Archivo:** `backend/src/gestion-visualizacion/interfaces/controllers/mechanic-dashboard.controller.ts`

**Líneas 27-29** (extrae del token):
```typescript
async getKpis(@Req() req: Request) {
  const { userId } = (req as any).auth;  // <-- userId = payload.sub = clerkId
```

**Líneas 37-39** (busca mecánico):
```typescript
const mechanic = await this.prisma.client$.mechanic.findFirst({
  where: { clerkId: userId },  // <-- busca por clerkId
});
```

**Archivo:** `backend/src/gestion-visualizacion/interfaces/controllers/client-dashboard.controller.ts`

**Líneas 34-39** (busca cliente):
```typescript
async getVehiculos(@Req() req: Request) {
  const { userId } = (req as any).auth;
  const cliente = await this.prisma.client$.cliente.findFirst({
    where: { clerkId: userId },  // <-- busca por clerkId
  });
```

**Respuesta: Busca por `clerkId`, que coincide con el `sub` del JWT. ✅ Correcto.**

---

### PUNTO 3: ¿El clerkId en BD coincide con el sub del JWT?

**Lo que genera el login:**
```typescript
// auth-mobile.controller.ts:154-160
const clerkId = mechanic.clerkId ?? crypto.randomUUID();
if (!mechanic.clerkId) {
  await this.prisma.client$.mechanic.update({
    where: { id: mechanic.id },
    data: { clerkId },
  });
}
```

**Caso 1: Mecánico tiene `clerkId` en BD** (ej: `user_3GeC5Hse6TW9V871aPBDptnDXij`)
→ El JWT usa ese mismo valor → el dashboard lo encuentra ✅

**Caso 2: Mecánico NO tiene `clerkId` en BD** (clerkId = null)
→ El login genera uno nuevo con `crypto.randomUUID()` → lo guarda en BD → el JWT lo usa → el dashboard lo encuentra ✅

**Caso 3: Mecánico tiene `passwordHash = null`** (creado por admin)
→ El login falla con "Cuenta sin configurar" antes de llegar al dashboard ❌

**Respuesta: Si el login es exitoso, el clerkId del JWT SIEMPRE coincide con BD.**

---

### PUNTO 4: ¿El dashboard retorna error o datos vacíos?

**Archivo:** `mechanic-dashboard.controller.ts`

**Líneas 40-41** (vehículos):
```typescript
if (!mechanic) return { vehiculos: [] };  // <-- retorna 200 con array vacío
```

**Líneas 65-66** (clientes pendientes):
```typescript
if (!mechanic) return { clientes: [] };  // <-- retorna 200 con array vacío
```

**Archivo:** `client-dashboard.controller.ts`

**Líneas 40-41** (vehículos):
```typescript
if (!cliente) return { vehiculos: [] };  // <-- retorna 200 con array vacío
```

**Líneas 69-70** (historial):
```typescript
if (!cliente) return { historial: [] };  // <-- retorna 200 con array vacío
```

**Respuesta: Retorna HTTP 200 con arrays vacíos, NO error HTTP. La app no puede distinguir entre "no hay datos" y "usuario no encontrado".**

---

### PUNTO 5: ¿La consulta SQL del dashboard usa los filtros correctos?

**Consulta SQL que el usuario probó (funciona):**
```sql
SELECT v.*, c.nombre as cliente_nombre 
FROM vehiculo v
JOIN cliente c ON v.id_cliente = c.id
WHERE v.id_mecanico_activo = 21 
  AND v.status IN ('ACTIVATED', 'ACTIVE');
-- Devuelve 2 vehículos ✅
```

**Lo que hace el backend Prisma:**

**MechanicDashboardController.getVehiculos** (`mechanic-dashboard.controller.ts:43-54`):
```typescript
const vehiculos = await this.prisma.client$.vehicle.findMany({
  where: { idMecanicoActivo: mechanic.id },  // <-- usa mechanic.id (numérico)
  include: {
    cliente: true,
    qr: true,
    alertas: {
      where: { estadoAlerta: { in: ['ACTIVA', 'PENDIENTE', 'activa', 'pendiente'] } },
    },
  },
});
```

**NO filtra por `status`**. Busca todos los vehículos del mecánico sin importar su status.

**ClientDashboardController.getVehiculos** (`client-dashboard.controller.ts:43-56`):
```typescript
const vehiculos = await this.prisma.client$.vehicle.findMany({
  where: { clienteId: cliente.id },  // <-- busca por cliente.id (numérico)
  include: {
    qr: true,
    intervenciones: { ... },
    alertas: { ... },
  },
});
```

**NO filtra por `status`**. Busca todos los vehículos del cliente.

**Diferencia con la consulta SQL del usuario:**
- SQL filtra `v.status IN ('ACTIVATED', 'ACTIVE')`
- Prisma NO filtra status

**Esto NO debería causar problemas** porque Prisma retornaría MÁS datos, no menos. Si los datos existen en BD, Prisma los debería encontrar.

**Respuesta: Las consultas Prisma son correctas pero menos restrictivas que las SQL. Si los datos existen, Prisma los encuentra.**

---

## DIAGNÓSTICO FINAL

### Cadenas de datos verificadas:

```
Login (auth-mobile.controller.ts)
  busca mecanico por email → obtiene clerkId → genera JWT con sub=clerkId ✅
  
Dashboard (mechanic-dashboard.controller.ts)
  extrae userId del JWT (=clerkId) → busca mecanico por clerkId → busca vehiculos por mechanic.id ✅

Cliente (client-dashboard.controller.ts)
  extrae userId del JWT (=clerkId) → busca cliente por clerkId → busca vehiculos por cliente.id ✅
```

### El problema NO es:
- ❌ El parseo del token
- ❌ El campo de búsqueda (coincide)
- ❌ Los filtros de status (son menos restrictivos)
- ❌ CORS
- ❌ Los endpoints

### El problema ES:
1. **Mecánicos creados por admin no tienen `passwordHash`** → no pueden loguear
2. **Sin `trim()`/`toLowerCase()` en email** → puede no encontrar usuario
3. **Sin filtro de `activo: true`** → mecánicos inactivos pueden loguear
4. **Dashboard retorna 200 con datos vacíos** → la app no muestra error

### Para que funcione, el mecánico necesita:
1. Tener `passwordHash` poblado (o poder registrarse con password)
2. Tener `clerkId` poblado (se genera automáticamente si es null)
3. Ingresar el email exacto que está en BD

---

---

## Auditoría de escritura (POST/PUT) - Pendiente de revisión post-pull

**Nota:** Cada operación se audita en ambos flujos (mobile + web). Los endpoints son los mismos pero el auth difiere.

### POST #1: Crear Cliente + Vehículo

**Preguntas clave:**
- ¿Cuando se crea un cliente, se crea también su vehículo en tabla `vehiculo`?
- ¿El cliente se guarda con `status = 'ACTIVATED'`?
- ¿El vehículo se guarda con `status = 'ACTIVATED'` o `'ACTIVE'`?
- ¿El vehículo queda asociado al cliente con `id_cliente`?
- ¿El vehículo queda asociado al mecánico con `id_mecanico_activo`?

**Flujo esperado:**
```
POST /client/create  (o similar)
  → Crear cliente en tabla `cliente`
  → Crear vehículo en tabla `vehiculo` con:
      id_cliente = cliente.id
      id_mecanico_activo = ? (¿quién lo asigna?)
      status = 'ACTIVATED' o 'ACTIVE'
  → Retornar cliente + vehículo creados
```

**Qué buscar en código:**
```typescript
// Buscar en client.controller.ts o similar
async createClient(dto) {
  const cliente = await this.prisma.cliente.create({
    data: { ...dto, status: 'ACTIVATED' }
  });
  // ¿Se crea vehículo también?
  const vehiculo = await this.prisma.vehicle.create({
    data: {
      id_cliente: cliente.id,
      status: 'ACTIVATED',
      id_mecanico_activo: ???
    }
  });
  return { cliente, vehiculo };
}
```

**Posibles fallos:**
- ❌ El vehículo no se crea
- ❌ El vehículo se crea con status incorrecto
- ❌ El vehículo no queda asociado al cliente
- ❌ El vehículo no queda asociado al mecánico

---

### POST #2: Crear Intervención + Detalles

**Preguntas clave:**
- ¿Cuando se crea una intervención, se crean también sus detalles en `detalle_intervencion`?
- ¿La intervención se guarda con estado correcto (`PENDIENTE`, `EN_PROGRESO`, `COMPLETADO`)?
- ¿Queda asociada al vehículo con `id_vehiculo`?
- ¿Queda asociada al mecánico con `id_mecanico`?
- ¿Los detalles se guardan con todos los campos necesarios?

**Flujo esperado:**
```
POST /interventions  (o similar)
  → Crear intervención en tabla `intervencion` con:
      id_vehiculo = vehiculo.id
      id_mecanico = mecanico.id
      estado = 'PENDIENTE'
  → Crear detalles en tabla `detalle_intervencion` con:
      id_intervencion = intervencion.id
      componente_reemplazado
      tipo_servicio
      kilometraje_instalacion
      limite_kilometraje
  → Retornar intervención + detalles creados
```

**Qué buscar en código:**
```typescript
// Buscar en intervention.controller.ts
async createIntervention(dto) {
  const intervention = await this.prisma.intervention.create({
    data: {
      vehiculoId: dto.vehiculoId,
      mecanicoId: dto.mecanicoId,
      estado: 'PENDIENTE',
      kilometrajeOdometro: dto.kilometraje,
    }
  });
  // ¿Se crean detalles?
  if (dto.detalles?.length) {
    await this.prisma.detalleIntervencion.createMany({
      data: dto.detalles.map(d => ({
        intervencionId: intervention.id,
        ...d
      }))
    });
  }
  return { intervention };
}
```

**Posibles fallos:**
- ❌ La intervención se crea pero sin detalles
- ❌ Los detalles no quedan asociados a la intervención
- ❌ La intervención no queda asociada al vehículo
- ❌ La intervención no queda asociada al mecánico
- ❌ El estado no se guarda o es incorrecto

---

### POST #3: Crear Mecánico

**Preguntas clave:**
- ¿Se guarda con `activo = true`?
- ¿Queda asociado al workshop con `id_workshop`?
- ¿Se genera `clerkId`?
- ¿Se genera `passwordHash`? (ya sabemos que NO)

**Flujo esperado:**
```
POST /admin/mechanics
  → Crear mecánico en tabla `mecanico` con:
      workshopId = workshop.id
      activo = true
      clerkId = UUID (generado por Clerk o crypto)
      passwordHash = null (si es creado por admin)
  → Retornar mecánico creado
```

**Qué buscar en código:**
```typescript
// admin.controller.ts (ya lo vimos)
const mechanic = await this.prisma.mechanic.create({
  data: {
    workshopId: workshop.id,
    clerkId: clerkUserId ?? crypto.randomUUID(),
    nombre: dto.nombre,
    especialidad: dto.especialidad ?? null,
    activo: true,
    // passwordHash = null (no se genera)
  },
});
```

**Posibles fallos:**
- ❌ El mecánico no queda asociado al workshop
- ❌ Se crea con `activo = false`
- ❌ El `clerkId` no se genera correctamente

---

### PUT #1: Actualizar Estado de Intervención

**Preguntas clave:**
- ¿Se actualiza el estado correctamente?
- ¿Se actualiza `updated_at`?
- ¿Se disparan alertas o notificaciones según el estado?

**Flujo esperado:**
```
PUT /interventions/:id
  → Actualizar intervención en tabla `intervencion` con:
      estado = 'COMPLETADO'
      updated_at = now()
  → Opcional: Crear alerta en `alerta_predictiva`
  → Retornar intervención actualizada
```

**Posibles fallos:**
- ❌ El estado no se actualiza
- ❌ El `updated_at` no se actualiza
- ❌ No se crean las alertas asociadas

---

### Consultas SQL de verificación (post-creación)

```sql
-- 1. Verificar creación de cliente + vehículo
SELECT * FROM cliente ORDER BY id DESC LIMIT 1;
SELECT * FROM vehiculo WHERE id_cliente = (SELECT MAX(id) FROM cliente);

-- 2. Verificar creación de intervención + detalles
SELECT * FROM intervencion ORDER BY id DESC LIMIT 1;
SELECT * FROM detalle_intervencion WHERE id_intervencion = (SELECT MAX(id) FROM intervencion);

-- 3. Verificar cadena completa: cliente → vehículo → intervención → detalles
SELECT 
  c.nombre as cliente,
  v.placa,
  i.fecha,
  i.estado,
  d.componente_reemplazado,
  d.tipo_servicio
FROM cliente c
JOIN vehiculo v ON v.id_cliente = c.id
JOIN intervencion i ON i.id_vehiculo = v.id
JOIN detalle_intervencion d ON d.id_intervencion = i.id
WHERE c.id = [ID_DEL_CLIENTE];

-- 4. Verificar mecánico
SELECT id, nombre, email, clerk_id, password_hash, activo, id_workshop 
FROM mecanico ORDER BY id DESC LIMIT 5;
```

---

### Resumen de verificaciones POST/PUT (Mobile + Web)

| # | Operación | Mobile | Web | Guard | Qué verificar |
|---|-----------|--------|-----|-------|---------------|
| 1 | Crear cliente | `POST /auth/register` | `POST /admin/customers` | MobileJwt / Clerk | Vehículo se crea, status='ACTIVATED' |
| 2 | Crear vehículo | `POST /vehicles` | `POST /admin/customers` (con placa) | Unified / Clerk | Asociaciones id_cliente, id_mecanico_activo |
| 3 | Crear intervención | `POST /interventions` | `POST /interventions` | Unified / Clerk | Detalles se crean, asociaciones correctas |
| 4 | Crear mecánico | N/A (solo admin) | `POST /admin/mechanics` | Clerk | activo=true, clerkId generado, passwordHash=null |
| 5 | Actualizar intervención | `PUT /interventions/:id` | `PUT /interventions/:id` | Unified / Clerk | Estado se actualiza, alertas se crean |

### Flujo de autenticación por plataforma

| Plataforma | Login | Token | Guard en backend | Busca usuario por |
|---|---|---|---|---|
| **Mobile** | `POST /auth/login-mobile` | JWT propio (`MobileJwtService`) | `UnifiedAuthGuard` | `clerkId` (de `payload.sub`) |
| **Web admin** | Clerk SignIn | Clerk JWT | `ClerkAuthGuard` | Clerk `userId` (de `req.auth.userId`) |
| **Web taller** | Clerk SignIn | Clerk JWT | `UnifiedAuthGuard` + `ClerkAuthGuard` | `clerkId` o Clerk `userId` |

### Endpoints compartidos (ambos flujos usan los mismos)

| Endpoint | Mobile usa | Web usa | Guard |
|---|---|---|---|
| `GET /admin/kpis` | ❌ | ✅ (admin) | ClerkAuthGuard |
| `GET /admin/mechanics` | ❌ | ✅ (admin) | ClerkAuthGuard |
| `GET /admin/customers` | ❌ | ✅ (admin) | ClerkAuthGuard |
| `GET /admin/services` | ❌ | ✅ (admin) | ClerkAuthGuard |
| `GET /admin/orders` | ❌ | ✅ (admin) | ClerkAuthGuard |
| `GET /mechanic/dashboard/kpis` | ✅ | ❌ | UnifiedAuthGuard |
| `GET /mechanic/dashboard/vehiculos` | ✅ | ❌ | UnifiedAuthGuard |
| `GET /mechanic/dashboard/clientes-pendientes` | ✅ | ❌ | UnifiedAuthGuard |
| `GET /client/dashboard/vehiculos` | ✅ | ❌ | UnifiedAuthGuard |
| `GET /client/dashboard/historial` | ✅ | ❌ | UnifiedAuthGuard |
| `GET /vehicles/:id` | ✅ | ✅ | UnifiedAuthGuard |
| `POST /interventions` | ✅ | ✅ | UnifiedAuthGuard |
| `GET /auth/me` | ❌ | ✅ | ClerkAuthGuard |
