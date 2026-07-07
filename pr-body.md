## Summary

Reorganización completa del backend por Bounded Contexts y actualización del dominio para alinearlo con los docs v2.0.0. Se implementó el flujo de ingreso vehicular con OCR (Gemini), scraper gubernamental (Playwright) e inferencia de specs de motor (Groq).

## Changes

### Arquitectura — Reorganización por Bounded Contexts

- Estructura plana `domain/`, `application/`, `infrastructure/` reemplazada por:
  - `registro-seguimiento/` (BC1 — Core Domain)
  - `prediccion-analisis/` (BC2 — Supporting Domain)
  - `gestion-visualizacion/` (BC3 — Generic Subdomain)
  - `shared/` (código compartido entre contextos)

### Dominio — Entidades y Agregados nuevos

- **Workshop** (Aggregate Root): taller mecánico con mecánicos, horarios y servicios
- **Mechanic** (Entity): mecánico con especialidad, estado y workshopId
- **PreRegisteredCustomer** (Entity): cliente pre-registrado con flujo PENDING → ACTIVATED
- **VehicleQR** (VO): código QR único por vehículo
- **VehiclePhoto** (VO): fotos del vehículo (FRONTAL, LATERAL, PLACA)
- **PhoneNumber**, **Email** (VOs): validación de formato Ecuador

### Dominio — Entidades y VOs actualizados

- **Vehicle**: +qrCode, +photos, +estadoActivacion, +clienteId, +activarVehiculo(), +generarQR()
- **Cliente**: +estado (PENDING/ACTIVATED), +fechaPreRegistro, +activarCliente()
- **ComponenteCritico**: +id, +kilometrajeInstalacion, +limiteKilometrajeFabricante, +estadoActual (OPTIMO/DESGASTE_MEDIO/CRITICO)
- **DiagnosticoTecnico**: +fallaDetectada, +observacionesMecanico, +nivelSeveridad (BAJA/MEDIA/ALTA)
- **Placa**: acepta formatos `ABC-1234` y `ABC1234`

### Infraestructura — Servicios externos

- **IOCRService** → `GeminiOCRService` (Google Gemini API — reconocimiento de placas)
- **IVehicleDataProvider** → `EcuadorVehicleDataProvider` (Playwright — scraping de axiscloud.ec)
- **IEngineInfoService** → `GroqEngineInfoService` (Groq API — inferencia de specs de motor)

### Aplicación — Use Case

- `RegistrarVehiculoDesdeFoto`: orquesta foto → OCR → datos gobierno → specs motor → vehículo registrado

### Tests

- 53 tests, 14 suites, todos pasan
- Tests nuevos: GeminiOCRService, EcuadorVehicleDataProvider, GroqEngineInfoService, RegistrarVehiculoDesdeFoto

### Infra

- `.gitignore`: excluye `docs/`, `.mimocode/`, `.context/`
- `.env.example`: agregadas `GEMINI_API_KEY` y `GROQ_API_KEY`
- Dependencias: `@google/genai`, `playwright`

## Test plan

- [x] `npm run build` — compila sin errores
- [x] `npm run test` — 53 tests pasan
- [x] Prueba end-to-end: foto → placa extraída → datos vehículo obtenidos → specs motor inferidos
