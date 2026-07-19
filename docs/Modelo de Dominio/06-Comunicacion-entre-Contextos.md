# Comunicacion entre Bounded Contexts

---

## 1. Vision General

M3Motors utiliza cuatro bounded contexts que se comunican a traves de dos mecanismos principales:

1. **Publicacion de Eventos de Dominio:** Comunicacion asincrona entre contextos mediante un EventBus (EventEmitter2 de NestJS)
2. **Consultas Directas a Prisma:** Comunicacion sincrona donde un contexto consulta las tablas de otro contexto a traves de PrismaService

---

## 2. Mapa de Dependencias

```
                    ┌─────────────────────────────────┐
                    │     Registro y Seguimiento      │
                    │          (CORE DOMAIN)          │
                    │  Upstream / Supplier            │
                    └──────┬──────────────┬────────────┘
                           │              │
              Eventos      │              │  Consulta directa
              publicados   │              │  (Prisma)
                           │              │
              ┌────────────▼──┐    ┌──────▼──────────────────┐
              │  Prediccion   │    │   Gestion y             │
              │  y Analisis   │    │   Visualizacion         │
              │  (SUPPORTING) │    │   (GENERIC)             │
              │  Downstream   │    │   Downstream            │
              └──────┬────────┘    │   (Customer)            │
                     │             └─────────────────────────┘
                     │ Eventos
                     │ publicados
                     ▼
              ┌──────────────────┐
              │   Notificacion   │
              │   (Infra)        │
              └──────────────────┘
```

---

## 3. Eventos de Dominio y Consumidores

### 3.1 Evento: intervencion.registrada

| Campo | Valor |
|-------|-------|
| Origen | Registro y Seguimiento |
| Publicador | RegistrarIntervencion (use case) |
| Consumidor | IntervencionRegistradaHandler (Prediccion y Analisis) |
| Accion | Recalcula la tasa de desgaste del vehiculo afectado |

### 3.2 Evento: alerta.generada

| Campo | Valor |
|-------|-------|
| Origen | Prediccion y Analisis |
| Publicador | GenerarPrediccion (use case) |
| Consumidor | AlertaGeneradaHandler (Notificacion) |
| Accion | Guarda la alerta en BD y envia email de notificacion al cliente |

### 3.3 Evento: cliente.activado

| Campo | Valor |
|-------|-------|
| Origen | Registro y Seguimiento |
| Publicador | ActivacionClienteService (infraestructura) |
| Consumidor | ClienteActivadoHandler (Notificacion) |
| Accion | Envia email de bienvenida al cliente recien activado |

### 3.4 Evento: vehiculo.activado

| Campo | Valor |
|-------|-------|
| Origen | Registro y Seguimiento |
| Publicador | ActivacionClienteService (infraestructura) |
| Consumidor | Pendiente de implementacion |
| Accion | Puede disparar alerta inicial de mantenimiento preventivo |

### 3.5 Evento: workshop.registrado

| Campo | Valor |
|-------|-------|
| Origen | Registro y Seguimiento |
| Publicador | Registro de taller |
| Consumidor | Pendiente de implementacion |
| Accion | Puede disparar configuracion inicial de notificaciones |

---

## 4. Consultas Directas a Prisma

El contexto de Gestion y Visualizacion consulta directamente las tablas de otros contextos usando PrismaService. Este patron es utilizado por los casos de uso de KPIs:

| Caso de Uso | Tablas consultadas | Contexto origen |
|-------------|-------------------|-----------------|
| ObtenerKPIsTaller | vehiculo, cliente, intervencion, mecanico, alerta_predictiva, service_catalog | Registro y Seguimiento, Prediccion |
| ObtenerKPIsMecanico | intervencion, vehiculo, cliente, alerta_predictiva | Registro y Seguimiento, Prediccion |
| ObtenerKPIsCliente | vehiculo, intervencion, alerta_predictiva | Registro y Seguimiento, Prediccion |

---

## 5. Shared Kernel

El **QR del Vehiculo** funciona como Shared Kernel entre los contextos de Registro y Seguimiento y Gestion y Visualizacion:

- **Registro y Seguimiento:** Genera y almacena el QR durante la activacion del vehiculo
- **Gestion y Visualizacion:** Lee el QR para presentar el historial del vehiculo en los dashboards
- **Prediccion y Analisis:** Utiliza el kilometraje del vehiculo (relacionado al QR) para calcular predicciones

---

## 6. Flujo Completo de Activacion

```
1. Cliente se pre-registra (landing page)
        │
        ▼
2. Evento: cliente.pre-registrado
        │
        ▼
3. Mecanico busca al cliente pre-registrado
        │
        ▼
4. Mecanico toma fotos del vehiculo
        │
        ▼
5. ServicioActivacionCliente:
   ├──► GeminiOCRService: Reconoce la placa
   ├──► EcuadorVehicleDataProvider: Obtiene datos del vehiculo
   ├──► GroqEngineInfoService: Obtiene info del motor
   ├──► Crea el vehiculo en BD
   ├──► QRServiceImpl: Genera codigo QR
   └──► Publica evento: vehiculo.activado
        │
        ▼
6. Evento: cliente.activado
        │
        ▼
7. ClienteActivadoHandler (Notificacion):
   └──► ResendEmailService: Envia email de bienvenida
        │
        ▼
8. Cliente activado, historial disponible via QR
```

---

## 7. Flujo Completo de Mantenimiento Predictivo

```
1. Mecanico registra intervencion
        │
        ▼
2. Evento: intervencion.registrada
        │
        ▼
3. IntervencionRegistradaHandler (Prediccion):
   └──► CalculoDesgasteService: Recalcula tasa de desgaste
        │
        ▼
4. EvaluacionDiariaHandler (cron diario):
   └──► GenerarPrediccion.execute()
        │
        ├──► PrediccionLLMService: Analiza componentes
        │
        ▼
5. Evento: alerta.generada
        │
        ▼
6. AlertaGeneradaHandler (Notificacion):
   ├──► Guarda alerta en BD
   └──► ResendEmailService: Envia email de alerta
```

---

## 8. Patrones de Comunicacion Utilizados

| Patron | Contextos | Descripcion |
|--------|-----------|-------------|
| Event-Driven | Todos | Comunicacion asincrona a traves del EventBus |
| Customer-Supplier | Gestion-Visualizacion consume de Registro | Gestion consulta datos de Registro via Prisma |
| Conformist | Prediccion se adapta a Registro | Prediccion consume datos de Registro sin influir en su modelo |
| Shared Kernel | Registro y Gestion comparten QR | Ambos contextos dependen del esquema del QR |
| Publisher-Subscriber | Notificacion consume eventos | Notificacion se suscribe a eventos de otros contextos |
