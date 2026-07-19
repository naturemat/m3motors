# Bounded Context: Registro y Seguimiento

**Rol en DDD:** Core Domain (Upstream / Supplier)
**Ruta del codigo:** `backend/src/registro-seguimiento/`

---

## 1. Descripcion General

El contexto de Registro y Seguimiento es el nucleo del dominio de M3Motors. Responsable del ciclo de vida completo de los vehiculos: desde su activacion inicial con reconocimiento de placa OCR, pasando por la generacion de codigos QR unicos, hasta el registro historico de intervenciones mecanicas y el seguimiento de kilometraje.

Todos los demas contextos dependen de este contexto como fuente de verdad.

---

## 2. Agregados

### 2.1 Vehiculo (Aggregate Root)

**Archivo:** `domain/aggregates/Vehiculo.ts`

Entidad central del sistema. Contiene el historial completo de mantenimiento de un automovil.

**Propiedades:**

| Propiedad | Tipo | Descripcion |
|-----------|------|-------------|
| id | string | Identificador unico del vehiculo |
| placa | Placa | Objeto de valor que encapsula la placa ecuatoriana |
| marca | string | Marca del vehiculo |
| modelo | string | Modelo del vehiculo |
| anio | number | Anio de fabricacion (1886 - anio actual + 1) |
| tipoMotor | string | Tipo de motor: GASOLINA, DIESEL, ELECTRICO, HIBRIDO |
| clienteId | string | ID del propietario |
| historialEvolutivo | Intervencion[] | Historial de intervenciones mecanicas |
| registrosKilometraje | RegistroKilometraje[] | Registro cronologico de kilometraje |
| tasaDesgasteActual | TasaDesgaste | Tasa de desgaste semanal actual |
| qrCode | VehicleQR o null | Codigo QR asociado al vehiculo |
| photos | VehiclePhoto[] | Fotos capturadas durante activacion |
| estadoActivacion | EstadoActivacion | PENDING o ACTIVATED |
| fechaActivacion | Date o null | Fecha y hora de activacion |
| activadoPor | string o null | Clerk ID del mecanico que activo |

**Metodos principales:**

| Metodo | Descripcion |
|--------|-------------|
| registrarIntervencion() | Agrega una intervencion al historial y publica evento |
| actualizarKilometraje() | Registra nuevo kilometraje y recalcula tasa de desgaste |
| activar() | Cambia estado a ACTIVATED con fecha y mecanico |
| asociarQR() | Asocia un codigo QR al vehiculo |
| asociarFotos() | Asocia fotos de activacion al vehiculo |
| validarDatosBasicos() | Valida placa, anio y tipo de motor |
| validarKilometrajeNoRetrocede() | Asegura que el kilometraje sea ascendente |

### 2.2 Workshop (Aggregate Root)

**Archivo:** `domain/aggregates/Workshop.ts`

Entidad raiz que representa al taller mecanico registrado en la plataforma.

**Propiedades:**

| Propiedad | Tipo | Descripcion |
|-----------|------|-------------|
| id | string | Identificador unico del taller |
| nombre | string | Nombre del taller |
| direccion | string | Direccion fisica |
| telefono | string | Numero de contacto |
| email | string | Correo electronico |
| horarios | string | Horario de atencion |
| dueno | string | Clerk ID del dueno |
| mecanicos | Mechanic[] | Lista de mecanicos asignados |
| servicios | ServiceCatalog[] | Catalogo de servicios ofrecidos |
| config | WorkshopConfig | Configuracion del taller |

---

## 3. Entidades de Dominio

### 3.1 Intervencion

**Archivo:** `domain/entities/Intervencion.ts`

Representa un servicio o reparacion realizada sobre un vehiculo.

| Propiedad | Tipo | Descripcion |
|-----------|------|-------------|
| id | string | Identificador unico |
| vehiculoId | string | Vehiculo al que se aplica |
| mecanicoId | string | Mecanico que la realiza |
| serviceCatalogId | number o null | Servicio del catalogo asociado |
| fecha | Date | Fecha de la intervencion |
| kilometrajeOdometro | number | Kilometraje al momento de la intervencion |
| diagnostico | string | Descripcion del diagnostico tecnico |
| observaciones | string o null | Notas adicionales |
| severidad | string | BAJA, MEDIA, ALTA, CRITICA |
| manoDeObra | number | Costo de mano de obra |
| estado | string | Estado de la intervencion |
| tipoIntervencion | TipoIntervencion | PREVENTIVO, CORRECTIVO, PREDICTIVO, DIAGNOSTICO |
| detalles | DetalleIntervencion[] | Componentes reemplazados |
| fotos | InterventionPhoto[] | Fotos antes, durante, despues, detalle |
| mecanico | Mecanico o null | Referencia al mecanico (populada) |

### 3.2 Cliente

**Archivo:** `domain/entities/Cliente.ts`

Individuo propietario del vehiculo. Puede estar en estado PENDING o ACTIVATED.

| Propiedad | Tipo | Descripcion |
|-----------|------|-------------|
| id | string | Identificador unico |
| clerkId | string | ID en Clerk (sistema de autenticacion) |
| nombre | string | Nombre completo |
| telefono | string | Numero de contacto |
| email | string | Correo electronico |
| status | string | PENDING o ACTIVATED |
| fechaActivacion | Date o null | Fecha de activacion |
| idMecanicoActivo | number o null | ID del mecanico que lo activo |

### 3.3 PreRegisteredCustomer

**Archivo:** `domain/entities/PreRegisteredCustomer.ts`

Cliente que se ha pre-registrado en la landing page pero aun no ha sido activado por un mecanico.

### 3.4 Mechanic

**Archivo:** `domain/entities/Mechanic.ts`

Tecnico especializado que realiza intervenciones directas sobre los vehiculos.

| Propiedad | Tipo | Descripcion |
|-----------|------|-------------|
| id | string | Identificador unico |
| clerkId | string | ID en Clerk |
| idWorkshop | number | Taller al que pertenece |
| nombre | string | Nombre completo |
| email | string | Correo electronico |
| especialidad | string | Area de especializacion |
| rating | number | Calificacion promedio |
| activo | boolean | Estado de actividad |

---

## 4. Objetos de Valor

| Objeto de Valor | Archivo | Descripcion |
|-----------------|---------|-------------|
| Placa | `shared/domain/value-objects/Placa.ts` | Placa ecuatoriana (ABC-1234). Valida formato y normaliza a mayusculas |
| VehicleQR | `domain/value-objects/VehicleQR.ts` | Codigo QR unico con codigo, URL y fecha de generacion |
| VehiclePhoto | `domain/value-objects/VehiclePhoto.ts` | Foto del vehiculo con URL, tipo (FRONTAL/LATERAL/PLACA), fecha y mecanico capturo |
| RegistroKilometraje | `domain/value-objects/RegistroKilometraje.ts` | Medicion de kilometraje con valor numerico y fecha |
| ComponenteCritico | `domain/value-objects/ComponenteCritico.ts` | Pieza con ciclo de vida definido, calcula desgaste basado en kilometraje |
| DiagnosticoTecnico | `domain/value-objects/DiagnosticoTecnico.ts` | Diagnostico con falla detectada, nivel de severidad y observaciones |
| PhoneNumber | `domain/value-objects/PhoneNumber.ts` | Telefono ecuatoriano (+593 o formato 09) |
| Email | `domain/value-objects/Email.ts` | Correo electronico validado y normalizado |
| TipoIntervencion | `domain/value-objects/TipoIntervencion.ts` | Tipo union: PREVENTIVO, CORRECTIVO, PREDICTIVO |
| CalidadRepuesto | `domain/value-objects/CalidadRepuesto.ts` | Tipo union: ORIGINAL, ALTERNATIVO, REACONDICIONADO |
| ClienteId | `domain/value-objects/ClienteId.ts` | Objeto de identidad para cliente |
| MecanicoId | `domain/value-objects/MecanicoId.ts` | Objeto de identidad para mecanico |
| IntervencionId | `domain/value-objects/IntervencionId.ts` | Objeto de identidad para intervencion |

---

## 5. Servicios de Dominio (Interfaces)

| Servicio | Archivo | Descripcion |
|----------|---------|-------------|
| ServicioGeneracionQR | `domain/domain-services/ServicioGeneracionQR.ts` | Interfaz para generacion de codigos QR de vehiculos |
| ServicioActivacionCliente | `domain/domain-services/ServicioActivacionCliente.ts` | Interfaz para el flujo de activacion: OCR, creacion de vehiculo, generacion de QR |

---

## 6. Eventos de Dominio

| Evento | Archivo | Descripcion |
|--------|---------|-------------|
| WorkshopRegistradoEvent | `domain/events/WorkshopRegistradoEvent.ts` | Se publica cuando un taller se registra en la plataforma |
| VehiculoActivadoEvent | `domain/events/VehiculoActivadoEvent.ts` | Se publica cuando un vehiculo es activado con QR y fotos |
| QRGeneradoEvent | `domain/events/QRGeneradoEvent.ts` | Se publica cuando se genera un codigo QR para un vehiculo |
| MechanicAgregadoEvent | `domain/events/MechanicAgregadoEvent.ts` | Se publica cuando un mecanico es agregado a un taller |
| KilometrajeActualizadoEvent | `domain/events/KilometrajeActualizadoEvent.ts` | Se publica cuando se actualiza el kilometraje de un vehiculo |
| IntervencionRegistradaEvent | `domain/events/IntervencionRegistradaEvent.ts` | Se publica cuando se registra una intervencion mecanica |
| ClientePreRegistradoEvent | `domain/events/ClientePreRegistradoEvent.ts` | Se publica cuando un cliente se pre-registra en la landing page |
| ClienteActivadoEvent | `domain/events/ClienteActivadoEvent.ts` | Se publica cuando un cliente pre-registrado es activado por un mecanico |

---

## 7. Puertos (Interfaces de Persistencia)

### 7.1 Repositorios

| Puerto | Archivo | Operaciones |
|--------|---------|-------------|
| IVehiculoRepository | `domain/ports/repositories/IVehiculoRepository.ts` | findByPlaca, findByQrCode, findAll, save |
| IIntervencionRepository | `domain/ports/repositories/IIntervencionRepository.ts` | findById, findAll, save |
| IClienteRepository | `domain/ports/repositories/IClienteRepository.ts` | findById, findAll, save |

### 7.2 Servicios Externos

| Puerto | Archivo | Descripcion |
|--------|---------|-------------|
| IOCRService | `domain/ports/services/IOCRService.ts` | Reconocimiento optico de caracteres para placas |
| IVehicleDataProvider | `domain/ports/services/IVehicleDataProvider.ts` | Consulta de datos de vehiculos por placa (CRV Ecuador) |
| IEngineInfoService | `domain/ports/services/IEngineInfoService.ts` | Especificaciones tecnicas del motor |

---

## 8. Casos de Uso (Aplicacion)

| Caso de Uso | Archivo | Descripcion |
|-------------|---------|-------------|
| ObtenerHistorialVehiculo | `application/use-cases/ObtenerHistorialVehiculo.ts` | Recupera el historial completo de un vehiculo por codigo QR |
| RegistrarVehiculoDesdeFoto | `application/use-cases/RegistrarVehiculoDesdeFoto.ts` | Registra un vehiculo desde una foto usando OCR, proveedor de datos y servicio de motor |
| RegistrarIntervencion | `application/use-cases/RegistrarIntervencion.ts` | Registra una intervencion con diagnostico, componentes y publicacion de eventos |
| RegistrarIngresoVehicular | `application/use-cases/RegistrarIngresoVehicular.ts` | Registra el ingreso de un vehiculo al taller con actualizacion de kilometraje |

---

## 9. DTOs

| DTO | Archivo | Descripcion |
|-----|---------|-------------|
| RegistrarVehiculoDesdeFotoDTO | `application/dto/RegistrarVehiculoDesdeFotoDTO.ts` | Buffer de imagen, tipo MIME, ID del mecanico |
| RegistrarIntervencionDTO | `application/dto/RegistrarIntervencionDTO.ts` | Placa, diagnostico, componentes, costo de mano de obra |
| RegistrarIngresoVehicularDTO | `application/dto/RegistrarIngresoVehicularDTO.ts` | Placa, marca, kilometraje, tipo de motor |

---

## 10. Infraestructura

### 10.1 Repositorios Prisma

| Clase | Archivo | Descripcion |
|-------|---------|-------------|
| PrismaVehiculoRepository | `infrastructure/persistence/repositories/PrismaVehiculoRepository.ts` | Implementacion persistente de IVehiculoRepository con mapeo de dominio |
| PrismaIntervencionRepository | `infrastructure/persistence/repositories/PrismaIntervencionRepository.ts` | Implementacion persistente de IIntervencionRepository |
| PrismaClienteRepository | `infrastructure/persistence/repositories/PrismaClienteRepository.ts` | Implementacion persistente de IClienteRepository |

### 10.2 Servicios Externos

| Clase | Archivo | Descripcion |
|-------|---------|-------------|
| QRServiceImpl | `infrastructure/external-services/QRServiceImpl.ts` | Genera codigos QR usando la libreria `qrcode` |
| GeminiOCRService | `infrastructure/external-services/GeminiOCRService.ts` | OCR con Google Gemini AI para reconocimiento de placas |
| GroqEngineInfoService | `infrastructure/external-services/GroqEngineInfoService.ts` | Info de motor con Groq LLM (Llama 3.3) |
| EcuadorVehicleDataProvider | `infrastructure/external-services/EcuadorVehicleDataProvider.ts` | Scraping del Registro Civil vehicular de Ecuador usando Playwright |
| ActivacionClienteService | `infrastructure/external-services/ActivacionClienteService.ts` | Orquesta activacion: OCR, creacion de vehiculo, QR, publicacion de eventos |

### 10.3 Repositorios InMemory (Desarrollo)

| Clase | Archivo |
|-------|---------|
| InMemoryVehiculoRepository | `infrastructure/persistence/repositories/InMemoryVehiculoRepository.ts` |
| InMemoryIntervencionRepository | `infrastructure/persistence/repositories/InMemoryIntervencionRepository.ts` |
| InMemoryClienteRepository | `infrastructure/persistence/repositories/InMemoryClienteRepository.ts` |

---

## 11. Diagrama de Dependencias

```
Vehiculo (Aggregate Root)
  ├── Placa (VO)
  ├── VehicleQR (VO)
  ├── VehiclePhoto (VO)
  ├── RegistroKilometraje (VO)
  ├── TasaDesgaste (VO, de prediccion-analisis)
  ├── ComponenteCritico (VO)
  └── Intervencion (Entity)
        ├── DetalleIntervencion
        ├── InterventionPhoto
        └── Mecanico (Entity)
```
