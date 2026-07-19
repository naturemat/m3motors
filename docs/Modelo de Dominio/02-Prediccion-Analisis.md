# Bounded Context: Prediccion y Analisis

**Rol en DDD:** Supporting Domain (Downstream / Conformist)
**Ruta del codigo:** `backend/src/prediccion-analisis/`

---

## 1. Descripcion General

El contexto de Prediccion y Analisis es responsable de calcular las tasas de desgaste de los vehiculos y generar alertas de mantenimiento predictivo. Utiliza modelos de lenguaje (LLM) y tecnicas estadisticas para proyectar cuando un componente requerira servicio, basandose en el historial de kilometraje y las especificaciones tecnicas del fabricante.

Depende del contexto de Registro y Seguimiento como fuente de datos (intervenciones y registros de kilometraje).

---

## 2. Objetos de Valor

### 2.1 TasaDesgaste

**Archivo:** `domain/value-objects/TasaDesgaste.ts`

Objeto de valor central que representa la velocidad de deterioro de un vehiculo.

| Propiedad | Tipo | Descripcion |
|-----------|------|-------------|
| kilometrosPorSemana | number | Kilometros promedio recorridos por semana |
| metodoCalculo | string | REGRESION_LINEAL o MEDIA_MOVIL |
| confianza | number | Nivel de confianza del calculo (0 - 1) |
| fechaCalculo | Date | Fecha del ultimo calculo |
| registrosBase | number | Cantidad de registros utilizados para el calculo |

**Metodos principales:**

| Metodo | Descripcion |
|--------|-------------|
| calcularSemanasRestantes() | Estima semanas hasta alcanzar el kilometraje limite |
| calcularMesesRestantes() | Estima meses hasta alcanzar el kilometraje limite |
| esConfiable() | Retorna true si la confianza supera el umbral minimo |
| proyectosKilometraje() | Proyecta el kilometraje futuro basado en la tasa |

---

## 3. Servicios de Dominio (Interfaces)

| Servicio | Archivo | Descripcion |
|----------|---------|-------------|
| ServicioPrediccionLLM | `domain/domain-services/ServicioPrediccionLLM.ts` | Interfaz para prediccion de mantenimiento basada en LLM. Retorna severidad, recomendaciones y tiempo estimado |
| ServicioCalculoDesgaste | `domain/domain-services/ServicioCalculoDesgaste.ts` | Interfaz para calcular la tasa de desgaste semanal a partir de registros de kilometraje |

---

## 4. Eventos de Dominio

| Evento | Archivo | Descripcion |
|--------|---------|-------------|
| AlertaGeneradaEvent | `domain/events/AlertaGeneradaEvent.ts` | Se publica cuando se genera una alerta de mantenimiento predictivo para un componente del vehiculo. Contiene: vehiculoId, componente, severidad, kilometraje actual, kilometraje limite, semanas estimadas, recomendacion |

---

## 5. Casos de Uso (Aplicacion)

| Caso de Uso | Archivo | Descripcion |
|-------------|---------|-------------|
| GenerarPrediccion | `application/use-cases/GenerarPrediccion.ts` | Orquesta la prediccion: llama al servicio LLM, filtra resultados de baja severidad y publica AlertaGeneradaEvent |

---

## 6. Infraestructura

### 6.1 Servicios

| Clase | Archivo | Descripcion |
|-------|---------|-------------|
| PrediccionLLMService | `infrastructure/PrediccionLLMService.ts` | Implementacion del ServicioPrediccionLLM usando Groq LLM con fallback matematico cuando la API no esta disponible |
| CalculoDesgasteService | `infrastructure/CalculoDesgasteService.ts` | Implementacion del ServicioCalculoDesgaste usando regresion lineal o media movil con exclusion de valores atipicos |

### 6.2 Handlers de Eventos

| Clase | Archivo | Descripcion |
|-------|---------|-------------|
| EvaluacionDiariaHandler | `infrastructure/handlers/EvaluacionDiariaHandler.ts` | Tarea programada diaria que evalua todos los vehiculos activos, prediciendo el desgaste de componentes usando el kilometraje estimado actual |
| IntervencionRegistradaHandler | `infrastructure/handlers/IntervencionRegistradaHandler.ts` | Escucha eventos `intervencion.registrada` y recalcula la tasa de desgaste del vehiculo |

---

## 7. Flujo de Prediccion

```
IntervencionRegistradaEvent
        │
        ▼
IntervencionRegistradaHandler
        │
        ▼
CalculoDesgasteService.calcular()
  (regresion lineal o media movil)
        │
        ▼
Actualiza TasaDesgaste en Vehiculo
        │
        ▼
EvaluacionDiariaHandler (cron diario)
        │
        ▼
GenerarPrediccion.execute()
        │
        ├──► PrediccionLLMService.predecir()
        │      (Groq LLM o fallback matematico)
        │
        ▼
AlertaGeneradaEvent
        │
        ▼
Contexto notification (envia email/push)
```

---

## 8. Dependencias

- **Registro y Seguimiento (Upstream):** Provee historial de intervenciones y registros de kilometraje
- **Notificacion (Downstream):** Consumed AlertaGeneradaEvent para enviar notificaciones
