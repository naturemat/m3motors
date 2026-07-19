# APIs y Servicios - M3Motors

---

## 1. Vision General

M3Motors expone una API RESTful construida con NestJS. La API se organiza en modulos, cada uno responsable de un area funcional del negocio. Todas las rutas requieren autenticacion excepto las rutas publicas.

**URL base:** `/`

---

## 2. Autenticacion

### 2.1 Login Mobile

| Campo | Valor |
|-------|-------|
| Ruta | `POST /auth/login-mobile` |
| Autenticacion | Ninguna |
| Descripcion | Login de usuarios moviles (mecanicos y clientes) |

### 2.2 Registro Mobile

| Campo | Valor |
|-------|-------|
| Ruta | `POST /auth/register-mobile` |
| Autenticacion | Ninguna |
| Descripcion | Registro de nuevos usuarios moviles |

### 2.3 Usuario Actual

| Campo | Valor |
|-------|-------|
| Ruta | `GET /auth/me` |
| Autenticacion | Bearer Token |
| Descripcion | Retorna el usuario autenticado actual |

### 2.4 Webhook Clerk

| Campo | Valor |
|-------|-------|
| Ruta | `POST /auth/webhook` |
| Autenticacion | Clerk Webhook |
| Descripcion | Recibe webhooks de Clerk para sincronizar usuarios |

---

## 3. Vehiculos

### 3.1 Listar Vehiculos

| Campo | Valor |
|-------|-------|
| Ruta | `GET /vehicles` |
| Autenticacion | Bearer Token |
| Descripcion | Lista vehiculos asignados al mecanico autenticado |

### 3.2 Obtener Vehiculo

| Campo | Valor |
|-------|-------|
| Ruta | `GET /vehicles/:id` |
| Autenticacion | Bearer Token |
| Descripcion | Perfil completo del vehiculo con timeline, intervenciones, fotos, QR y alertas |

### 3.3 Crear Vehiculo

| Campo | Valor |
|-------|-------|
| Ruta | `POST /vehicles` |
| Autenticacion | Bearer Token |
| Descripcion | Registra un nuevo vehiculo manualmente |

### 3.4 Reconocimiento de Placa

| Campo | Valor |
|-------|-------|
| Ruta | `POST /vehicles/recognize-plate` |
| Autenticacion | Bearer Token |
| Descripcion | Envio de imagen para OCR y reconocimiento automatico de placa |

### 3.5 Generar QR

| Campo | Valor |
|-------|-------|
| Ruta | `POST /vehicles/qr/generate/:id` |
| Autenticacion | Bearer Token |
| Descripcion | Genera un codigo QR unico para el vehiculo |

### 3.6 Buscar por QR

| Campo | Valor |
|-------|-------|
| Ruta | `GET /vehicles/qr/:code` |
| Autenticacion | Bearer Token |
| Descripcion | Busca un vehiculo por su codigo QR |

### 3.7 Subir Foto

| Campo | Valor |
|-------|-------|
| Ruta | `POST /vehicles/:id/photos` |
| Autenticacion | Bearer Token |
| Descripcion | Sube una foto del vehiculo a Supabase Storage |

### 3.8 Prediccion

| Campo | Valor |
|-------|-------|
| Ruta | `GET /vehicles/:id/prediction` |
| Autenticacion | Bearer Token |
| Descripcion | Genera prediccion de mantenimiento para el vehiculo |

---

## 4. Intervenciones

### 4.1 Listar Intervenciones

| Campo | Valor |
|-------|-------|
| Ruta | `GET /interventions` |
| Autenticacion | Bearer Token |
| Descripcion | Lista intervenciones del mecanico autenticado |

### 4.2 Crear Intervencion

| Campo | Valor |
|-------|-------|
| Ruta | `POST /interventions` |
| Autenticacion | Bearer Token |
| Descripcion | Registra una nueva intervencion con diagnostico, componentes y fotos |

---

## 5. Catalogos

### 5.1 Catalogo de Repuestos

| Campo | Valor |
|-------|-------|
| Ruta | `GET /parts-catalog` |
| Autenticacion | Bearer Token |
| Descripcion | Lista repuestos globales y del taller |

### 5.2 Categorias de Repuestos

| Campo | Valor |
|-------|-------|
| Ruta | `GET /parts-catalog/categories` |
| Autenticacion | Bearer Token |
| Descripcion | Lista categorias disponibles |

---

## 6. Alertas

### 6.1 Listar Alertas

| Campo | Valor |
|-------|-------|
| Ruta | `GET /alerts` |
| Autenticacion | Bearer Token |
| Descripcion | Lista alertas predictivas del taller |

### 6.2 Obtener Alerta

| Campo | Valor |
|-------|-------|
| Ruta | `GET /alerts/:id` |
| Autenticacion | Bearer Token |
| Descripcion | Detalle de una alerta especifica |

### 6.3 Confirmar Alerta

| Campo | Valor |
|-------|-------|
| Ruta | `PATCH /alerts/:id/confirm` |
| Autenticacion | Bearer Token |
| Descripcion | Marca una alerta como confirmada |

---

## 7. Dashboard del Mecanico

### 7.1 KPIs del Mecanico

| Campo | Valor |
|-------|-------|
| Ruta | `GET /mechanic/dashboard/kpis` |
| Autenticacion | Bearer Token |
| Descripcion | Indicadores: intervenciones, vehiculos atendidos, clientes, ingresos, alertas |

### 7.2 Clientes Pendientes

| Campo | Valor |
|-------|-------|
| Ruta | `GET /mechanic/dashboard/clientes-pendientes` |
| Autenticacion | Bearer Token |
| Descripcion | Clientes asignados al mecanico con sus vehiculos |

### 7.3 Clientes del Taller

| Campo | Valor |
|-------|-------|
| Ruta | `GET /mechanic/dashboard/clients` |
| Autenticacion | Bearer Token |
| Descripcion | Todos los clientes activos del taller |

### 7.4 Servicios del Taller

| Campo | Valor |
|-------|-------|
| Ruta | `GET /mechanic/dashboard/services` |
| Autenticacion | Bearer Token |
| Descripcion | Catalogo de servicios del taller con precios |

### 7.5 Activar Cliente

| Campo | Valor |
|-------|-------|
| Ruta | `POST /mechanic/dashboard/activate-client` |
| Autenticacion | Bearer Token |
| Descripcion | Activa un cliente pre-registrado con fotos del vehiculo y OCR |

---

## 8. Dashboard del Cliente

### 8.1 KPIs del Cliente

| Campo | Valor |
|-------|-------|
| Ruta | `GET /client/dashboard/kpis` |
| Autenticacion | Bearer Token |
| Descripcion | Indicadores: vehiculos, intervenciones, proximo mantenimiento |

### 8.2 Vehiculos del Cliente

| Campo | Valor |
|-------|-------|
| Ruta | `GET /client/dashboard/vehicles` |
| Autenticacion | Bearer Token |
| Descripcion | Vehiculos registrados del cliente autenticado |

---

## 9. Dashboard Admin

### 9.1 KPIs del Taller

| Campo | Valor |
|-------|-------|
| Ruta | `GET /admin/dashboard/kpis` |
| Autenticacion | Bearer Token (admin) |
| Descripcion | Indicadores globales: vehiculos, clientes, ingresos, rating, servicios |

### 9.2 Gestion de Mecanicos

| Ruta | Metodo | Descripcion |
|------|--------|-------------|
| `/admin/dashboard/mechanics` | GET | Listar mecanicos |
| `/admin/dashboard/mechanics` | POST | Crear mecanico |
| `/admin/dashboard/mechanics/:id` | PATCH | Actualizar mecanico |
| `/admin/dashboard/mechanics/:id` | DELETE | Eliminar mecanico |

### 9.3 Gestion de Servicios

| Ruta | Metodo | Descripcion |
|------|--------|-------------|
| `/admin/dashboard/services` | GET | Listar servicios |
| `/admin/dashboard/services` | POST | Crear servicio |
| `/admin/dashboard/services/:id` | PATCH | Actualizar servicio |
| `/admin/dashboard/services/:id` | DELETE | Eliminar servicio |

---

## 10. Publico (Sin Autenticacion)

### 10.1 Info del Taller

| Campo | Valor |
|-------|-------|
| Ruta | `GET /public/workshop/:id` |
| Descripcion | Informacion publica del taller para la landing page |

### 10.2 Pre-registro de Cliente

| Campo | Valor |
|-------|-------|
| Ruta | `POST /public/pre-register` |
| Descripcion | Pre-registro de cliente desde la landing page (con reCAPTCHA) |

### 10.3 Health Check

| Campo | Valor |
|-------|-------|
| Ruta | `GET /health` |
| Descripcion | Verificacion de salud del API (sin autenticacion) |

---

## 11. Formatode Respuestas

### 11.1 Respuesta Exitosa

```json
{
  "data": { ... }
}
```

### 11.2 Respuesta de Error

```json
{
  "statusCode": 400,
  "message": ["mensaje de error"],
  "error": "Bad Request"
}
```

### 11.3 Paginacion

Las consultas de listado soportan parametros de paginacion via query string: `?page=1&limit=20`

---

## 12. Seguridad

- Todas las rutas (excepto publicas) requieren Bearer Token en el header `Authorization`
- El token se valida via `UnifiedAuthGuard` que soporta tokens JWT mobile y Clerk
- Los webhooks de Clerk validan la firma del webhook
- El endpoint de pre-registro utiliza reCAPTCHA para prevenir spam
- Las fotos se almacenan en Supabase Storage con acceso controlado
