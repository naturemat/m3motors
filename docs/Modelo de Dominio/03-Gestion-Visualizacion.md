# Bounded Context: Gestion y Visualizacion

**Rol en DDD:** Generic Subdomain (Downstream / Customer)
**Ruta del codigo:** `backend/src/gestion-visualizacion/`

---

## 1. Descripcion General

El contexto de Gestion y Visualizacion se encarga de consultar, consolidar y presentar los datos del sistema a traves de los dashboards. Calcula indicadores clave de rendimiento (KPIs) para cada rol del sistema (dueno del taller, mecanico, cliente) y expone los endpoints REST que alimentan las interfaces de usuario.

No genera entidades propias; consume datos de los demas contextos para producir vistas agregadas.

---

## 2. Entidades de Dominio (Interfaces de KPIs)

### 2.1 KPIsTaller

**Archivo:** `domain/entities/KPIsTaller.ts`

| Propiedad | Tipo | Descripcion |
|-----------|------|-------------|
| totalVehiculos | number | Total de vehiculos registrados en el taller |
| totalClientes | number | Total de clientes atendidos |
| ingresosTotales | number | Suma total de mano de obra generada |
| ratingPromedio | number | Calificacion promedio de los mecanicos |
| serviciosActivos | number | Cantidad de servicios en el catalogo |
| alertasPendientes | number | Alertas predictivas sin resolver |
| intervencionesMes | number | Intervenciones del mes actual |

### 2.2 KPIsMecanico

**Archivo:** `domain/entities/KPIsTaller.ts`

| Propiedad | Tipo | Descripcion |
|-----------|------|-------------|
| totalIntervenciones | number | Total historico de intervenciones |
| intervencionesMes | number | Intervenciones del mes actual |
| vehiculosAtendidos | number | Vehiculos unicos atendidos |
| clientesAtendidos | number | Clientes unicos atendidos |
| ingresosGenerados | number | Suma de mano de obra generada |
| alertasAsignadas | number | Alertas predictivas asignadas |

### 2.3 KPIsCliente

**Archivo:** `domain/entities/KPIsTaller.ts`

| Propiedad | Tipo | Descripcion |
|-----------|------|-------------|
| totalVehiculos | number | Vehiculos registrados del cliente |
| totalIntervenciones | number | Total de intervenciones en sus vehiculos |
| proximoMantenimiento | string o null | Estimacion del proximo mantenimiento |
| historialReciente | any[] | Ultimas 5 intervenciones |

---

## 3. Objetos de Valor

### 3.1 Periodo

**Archivo:** `domain/value-objects/Periodo.ts`

Representa un rango temporal para consultas de KPIs.

| Metodo estatico | Rango |
|-----------------|-------|
| ultimoMes() | Desde el primer dia del mes actual |
| ultimosTresMeses() | Desde hace 3 meses |
| ultimoAnio() | Desde hace 1 ano |

---

## 4. Casos de Uso (Aplicacion)

| Caso de Uso | Archivo | Descripcion |
|-------------|---------|-------------|
| ObtenerKPIsTaller | `application/use-cases/ObtenerKPIsTaller.ts` | Consulta Prisma para calcular KPIs a nivel de taller: vehiculos, clientes, ingresos, calificaciones, alertas |
| ObtenerKPIsMecanico | `application/use-cases/ObtenerKPIsMecanico.ts` | Consulta Prisma para calcular KPIs a nivel de mecanico: intervenciones, vehiculos atendidos, ingresos |
| ObtenerKPIsCliente | `application/use-cases/ObtenerKPIsCliente.ts` | Consulta Prisma para calcular KPIs a nivel de cliente: vehiculos, intervenciones, historial |

---

## 5. Controladores

| Controlador | Archivo | Rutas | Descripcion |
|-------------|---------|-------|-------------|
| AdminController | `interfaces/controllers/admin.controller.ts` | /admin/dashboard/* | Dashboard del dueno del taller: KPIs, configuracion, CRUD de mecanicos, servicios y clientes |
| MechanicDashboardController | `interfaces/controllers/mechanic-dashboard.controller.ts` | /mechanic/dashboard/* | Dashboard del mecanico: KPIs, vehiculos asignados, clientes pendientes, catalogo de servicios, prediccion manual |
| ClientDashboardController | `interfaces/controllers/client-dashboard.controller.ts` | /client/dashboard/* | Dashboard del cliente: KPIs, vehiculos, historial de intervenciones |

---

## 6. Dependencias

- **Registro y Seguimiento (Upstream):** Fuente de datos de vehiculos, clientes, intervenciones y mecanicos
- **Prediccion y Analisis (Upstream):** Fuente de datos de alertas predictivas

---

## 7. Nota de Diseno

Este contexto no define repositorios propios ni entidades de persistencia. Todos los datos se obtienen directamente a traves de PrismaService, consultando las tablas de los otros contextos. EstaDecision简化ifica la capa de persistencia pero acopla este contexto al esquema de base de datos.
