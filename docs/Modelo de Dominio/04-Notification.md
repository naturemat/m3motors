# Bounded Context: Notificacion

**Ruta del codigo:** `backend/src/notification/`

---

## 1. Descripcion General

El contexto de Notificacion gestiona el envio de comunicaciones a los clientes del sistema a traves de multiples canales (email y push notification). Implementa un sistema de colas asincronas con reintento automatico, plantillas HTML para emails y registro completo del estado de entrega.

---

## 2. Entidades de Dominio

### 2.1 Notificacion

**Archivo:** `domain/entities/Notificacion.ts`

| Propiedad | Tipo | Descripcion |
|-----------|------|-------------|
| id | string | Identificador unico |
| clienteId | number | ID del cliente destinatario |
| tipo | TipoNotificacion | Tipo de notificacion |
| canal | CanalEnvio | EMAIL o PUSH |
| asunto | string | Asunto del mensaje (para email) |
| contenido | string | Cuerpo del mensaje |
| estado | EstadoNotificacion | PENDIENTE, ENVIADA o FALLIDA |
| intentos | number | Cantidad de intentos de envio |
| maxIntentos | number | Limite maximo de reintentos (3 por defecto) |
| enviadoEn | Date o null | Fecha y hora de envio exitoso |
| errorMensaje | string o null | Mensaje de error en caso de fallo |
| creadoEn | Date | Fecha de creacion |

**Metodos principales:**

| Metodo | Descripcion |
|--------|-------------|
| puedeReintentar() | Retorna true si no se supero el limite de intentos |
| marcarEnviada() | Actualiza estado a ENVIADA con fecha de envio |
| marcarFallida() | Incrementa intentos y actualiza estado y error |

---

## 3. Enums de Dominio

### 3.1 TipoNotificacion

**Archivo:** `domain/value-objects/TipoNotificacion.ts`

| Valor | Descripcion |
|-------|-------------|
| ALERTA_MANTENIMIENTO | Alerta de mantenimiento predictivo |
| RECOMENDACION | Recomendacion de servicio |
| BIENVENIDA | Mensaje de bienvenida al activarse |
| RECORDATORIO | Recordatorio de activacion pendiente |
| INTERVENCION_CREADA | Notificacion de intervencion registrada |
| CLIENTE_ACTIVADO | Confirmacion de activacion de cliente |
| VEHICULO_REGISTRADO | Confirmacion de registro de vehiculo |

### 3.2 EstadoNotificacion

**Archivo:** `domain/value-objects/EstadoNotificacion.ts`

| Valor | Descripcion |
|-------|-------------|
| PENDIENTE | En cola, pendiente de envio |
| ENVIADA | Enviada exitosamente |
| FALLIDA | Error en el envio |

### 3.3 CanalEnvio

**Archivo:** `domain/value-objects/CanalEnvio.ts`

| Valor | Descripcion |
|-------|-------------|
| EMAIL | Correo electronico via Resend |
| PUSH | Notificacion movil via OneSignal |

---

## 4. Puertos (Interfaces)

| Puerto | Archivo | Descripcion |
|--------|---------|-------------|
| IPushService | `domain/ports/IPushService.ts` | Interfaz abstracta para envio de notificaciones push |
| IEmailService | `domain/ports/IEmailService.ts` | Interfaz abstracta para envio de emails |
| INotificationRepository | `domain/ports/INotificationRepository.ts` | Interfaz abstracta para persistencia de notificaciones |

---

## 5. Eventos de Dominio

| Evento | Archivo | Descripcion |
|--------|---------|-------------|
| NotificacionEnviadaEvent | `domain/events/NotificacionEnviadaEvent.ts` | Se publica cuando una notificacion se envia exitosamente |
| NotificacionFallidaEvent | `domain/events/NotificacionFallidaEvent.ts` | Se publica cuando una notificacion falla definitivamente |

---

## 6. Casos de Uso

| Caso de Uso | Archivo | Descripcion |
|-------------|---------|-------------|
| EnviarNotificacion | `application/use-cases/EnviarNotificacion.ts` | Envia una notificacion por email o push, persiste el registro y maneja el estado de entrega |
| ReintentarNotificaciones | `application/use-cases/ReintentarNotificaciones.ts` | Reintenta notificaciones fallidas que superaron el tiempo de espera |

---

## 7. Handlers de Eventos

| Handler | Archivo | Evento consumido | Descripcion |
|---------|---------|------------------|-------------|
| AlertaGeneradaHandler | `application/handlers/AlertaGeneradaHandler.ts` | alerta.generada | Guarda la alerta en BD y envia email de notificacion al cliente |
| ClienteActivadoHandler | `application/handlers/ClienteActivadoHandler.ts` | cliente.activado | Envia email de bienvenida al cliente recien activado |
| RecordatorioHandler | `application/handlers/RecordatorioHandler.ts` | Cron programado | Envia recordatorios de activacion a clientes pre-registrados con mas de 30 dias |

---

## 8. DTOs

| DTO | Archivo | Descripcion |
|-----|---------|-------------|
| EnviarNotificacionDTO | `application/dto/EnviarNotificacionDTO.ts` | ID del cliente, tipo, canal, asunto, contenido, email |
| NotificacionResponseDTO | `application/dto/NotificacionResponseDTO.ts` | Estado completo de la notificacion incluyendo timestamps |

---

## 9. Infraestructura

### 9.1 Servicios de Envio

| Clase | Archivo | Descripcion |
|-------|---------|-------------|
| ResendEmailService | `infrastructure/email/ResendEmailService.ts` | Implementacion de IEmailService usando la API de Resend |
| OneSignalPushService | `infrastructure/push/OneSignalPushService.ts` | Implementacion de IPushService usando la API de OneSignal |

### 9.2 Cola de Notificaciones

| Clase | Archivo | Descripcion |
|-------|---------|-------------|
| NotificationProducer | `infrastructure/queue/NotificationProducer.ts` | Productor de la cola Bull. Encola trabajos de email y push con reintento exponencial |
| NotificationWorker | `infrastructure/queue/NotificationWorker.ts` | Procesador de la cola Bull. Ejecuta el envio real de email y push |

### 9.3 Persistencia

| Clase | Archivo | Descripcion |
|-------|---------|-------------|
| PrismaNotificacionRepository | `infrastructure/persistence/PrismaNotificacionRepository.ts` | Implementacion de INotificationRepository con CRUD completo y consultas de reintento |

### 9.4 Plantillas de Email

| Plantilla | Archivo | Descripcion |
|-----------|---------|-------------|
| alertaTemplate | `infrastructure/templates/alerta.template.ts` | Plantilla HTML para alertas de mantenimiento |
| bienvenidaTemplate | `infrastructure/templates/bienvenida.template.ts` | Plantilla HTML para mensajes de bienvenida |
| recordatorioTemplate | `infrastructure/templates/recordatorio.template.ts` | Plantilla HTML para recordatorios de activacion |

---

## 10. Flujo de Notificacion

```
Evento de Dominio (alerta.generada, cliente.activado, etc.)
        │
        ▼
Handler de Evento
        │
        ▼
EnviarNotificacion.execute()
        │
        ├──► PrismaNotificacionRepository.save() [estado: PENDIENTE]
        │
        ▼
NotificationProducer.encolar()
        │
        ▼
Bull Queue (Redis)
        │
        ▼
NotificationWorker.procesar()
        │
        ├──► ResendEmailService.sendEmail()  [canal: EMAIL]
        │    o
        └──► OneSignalPushService.sendPush() [canal: PUSH]
        │
        ▼
PrismaNotificacionRepository.update() [estado: ENVIADA | FALLIDA]
```

---

## 11. Dependencias

- **Prediccion y Analisis:** Consume AlertaGeneradaEvent
- **Registro y Seguimiento:** Consume ClienteActivadoEvent
- **Redis:** Cola Bull para procesamiento asincrono
- **Resend:** Servicio de envio de emails
- **OneSignal:** Servicio de notificaciones push
