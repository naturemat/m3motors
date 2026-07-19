# Comunicacion con la Base de Datos - M3Motors

---

## 1. Proveedor de Base de Datos

M3Motors utiliza PostgreSQL como sistema de gestion de base de datos relacional. La instancia esta gestionada por Supabase, que proporciona pool de conexiones, backups automaticos y panel de administracion.

---

## 2. ORM: Prisma

### 2.1 Arquitectura

```
Aplicacion NestJS
       │
       ▼
  PrismaService (wrapper)
       │
       ▼
  PrismaClient (generado)
       │
       ▼
  PostgreSQL (Supabase)
```

El PrismaClient se genera a partir del esquema declarativo en `backend/prisma/schema.prisma`. La salida se configura en `backend/generated/prisma` en lugar de la ruta por defecto `node_modules/.prisma`.

### 2.2 Esquema

El esquema Prisma define las siguientes tablas principales:

| Tabla | Descripcion |
|-------|-------------|
| vehiculo | Vehiculos registrados con datos tecnicos y estado de activacion |
| cliente | Clientes del taller (pre-registrados y activados) |
| mecanico | Mecanicos asignados al taller |
| intervencion | Intervenciones mecanicas realizadas |
| detalle_intervencion | Componentes reemplazados en cada intervencion |
| intervention_photo | Fotos de intervenciones (antes, durante, despues, detalle) |
| vehicle_photo | Fotos de vehiculos (frontal, lateral, placa) |
| vehicle_qr | Codigos QR generados para vehiculos |
| alerta_predictiva | Alertas de mantenimiento predictivo generadas |
| service_catalog | Catalogo de servicios del taller |
| parts_catalog | Catalogo global de repuestos |
| notificacion | Registro de notificaciones enviadas |
| workshop | Talleres registrados en la plataforma |
| registro_kilometraje | Historial de lecturas de kilometraje |
| historial_evolutivo | Timeline de eventos del vehiculo |

### 2.3 Convenciones de Nombres

- **Tablas:** snake_case singular (ej: `vehiculo`, `intervencion`)
- **Columnas:** snake_case (ej: `ultimo_kilometraje`, `tipo_motor`)
- **Prisma models:** PascalCase singular (ej: `Vehiculo`, `Intervencion`)
- **Prisma fields:** camelCase (ej: `ultimoKilometraje`, `tipoMotor`)

Las directivas `@map()` y `@@map()` en el esquema Prisma mapean entre los nombres de Prisma (camelCase) y los nombres de PostgreSQL (snake_case).

---

## 3. Patron de Acceso a Datos

### 3.1 En el Contexto de Registro y Seguimiento

Se sigue el patron de Puertos y Adaptadores (Hexagonal). Los repositorios definen interfaces (puertos) en el dominio y se implementan en la infraestructura:

```
Dominio
  ├── IVehiculoRepository (puerto)
  ├── IIntervencionRepository (puerto)
  └── IClienteRepository (puerto)

Infraestructura
  ├── PrismaVehiculoRepository (adaptador Prisma)
  ├── PrismaIntervencionRepository (adaptador Prisma)
  └── PrismaClienteRepository (adaptador Prisma)
```

Cada repositorio Prisma incluye metodos de mapeo (`toDomain()`, `toPersistence()`) para convertir entre entidades de dominio y registros de Prisma.

### 3.2 En el Contexto de Gestion y Visualizacion

Se accede directamente a PrismaService desde los casos de uso de KPIs, sin pasar por repositorios. Esta decision simplifica la capa de persistencia para consultas de solo lectura.

### 3.3 En el Contexto de Notificacion

Se utiliza un repositorio Prisma (`PrismaNotificacionRepository`) que implementa la interfaz `INotificationRepository` con consultas especificas para reintento de notificaciones fallidas.

---

## 4. Patrones de Consulta

### 4.1 Consultas con Relaciones

Prisma soporta inclusion de relaciones con `include`:

```typescript
const vehicle = await this.prisma.vehicle.findUnique({
  where: { id },
  include: {
    qr: true,
    fotos: true,
    intervenciones: {
      orderBy: { fecha: 'desc' },
      include: {
        detalles: { include: { partsCatalog: true } },
        fotos: true,
        mecanico: { select: { nombre: true } },
      },
    },
    alertas: { orderBy: { createdAt: 'desc' } },
  },
});
```

### 4.2 Consultas Agregadas

Para KPIs se utilizan consultas de agregacion:

```typescript
const totalIntervenciones = await this.prisma.intervencion.count({
  where: { idMecanico: mecanicoId }
});

const ingresos = await this.prisma.intervencion.aggregate({
  where: { idMecanico: mecanicoId },
  _sum: { manoDeObra: true }
});
```

### 4.3 Consultas con Filtros Dinamicos

```typescript
const where: Record<string, unknown> = { activo: true };
if (categoria) where.categoria = categoria;
if (workshopId) {
  where.OR = [{ workshopId: null }, { workshopId: parseInt(workshopId) }];
}
```

---

## 5. Pool de Conexiones

Supabase gestiona automaticamente el pool de conexiones a PostgreSQL. La cadena de conexion (`DATABASE_URL`) incluye el endpoint del pooler de sesiones, mientras que `DIRECT_URL` proporciona conexion directa para migraciones.

---

## 6. Migraciones

Las migraciones de Prisma se ejecutan con:

```bash
npx prisma migrate dev        # Desarrollo
npx prisma migrate deploy     # Produccion
```

Despues de cada cambio en el esquema, se debe ejecutar `npx prisma generate` para regenerar el cliente.

---

## 7. Consideraciones

- Los repositorios en memoria (`InMemory*Repository`) estan disponibles para pruebas y desarrollo, pero no persisten datos entre reinicios.
- El cliente Prisma se genera en una ruta no estandar (`backend/generated/prisma`) para evitar conflictos con la version por defecto.
- Todas las consultas a la base de datos pasan por PrismaService, que extiende PrismaClient con loggging de consultas en modo debug.
- Las tablas de un contexto pueden ser consultadas por otro contexto en el caso de Gestion y Visualizacion, lo cual es una decision de diseno conocida.
