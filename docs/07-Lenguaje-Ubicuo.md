# Lenguaje Ubicuo - M3Motors

**Proyecto:** M3Motors
**Tipo de documento:** Guia
**Estado:** Aprobado
**Version:** 2.0.0

---

## 1. Proposito del Documento

El presente documento define el Lenguaje Ubicuo del proyecto M3Motors. Constituye el glosario oficial de terminos que deben ser utilizados por todos los miembros del equipo, stakeholders y cualquier persona involucrada en el proyecto, con el fin de garantizar una comunicacion precisa y sin ambiguedades.

El Lenguaje Ubicuo es un pilar fundamental del enfoque Domain-Driven Design (DDD) adoptado para el proyecto, ya que alinea el vocabulario del negocio con el modelo de dominio y su implementacion tecnica.

---

## 2. Introduccion al Lenguaje Ubicuo

El Lenguaje Ubicuo es el vocabulario comun compartido por el equipo de desarrollo y los expertos del dominio. En M3Motors, este lenguaje se construye a partir de los conceptos propios del negocio de talleres mecanicos, la gestion de mantenimiento vehicular y la fidelizacion de clientes.

Todos los terminos definidos en este documento deben ser utilizados de manera consistente en:

- Conversaciones y reuniones del equipo
- Documentacion del proyecto
- Codigo fuente (nombres de clases, metodos, variables)
- Interfaces de usuario
- APIs y contratos de servicios

---

## 3. Terminos del Dominio

### 3.1 Actores

| Termino | Definicion |
|---------|------------|
| Dueno del Taller | Persona responsable de la gestion estrategica y administrativa del taller mecanico. Es el usuario principal que se registra en M3Motors, configura los parametros del negocio, crea cuentas para los mecanicos y visualiza reportes globales de operacion. Es el cliente pagante de la plataforma. |
| Mecanico | Tecnico especializado que realiza intervenciones directas sobre los vehiculos. Tiene permisos para activar clientes pre-registrados, tomar fotos de vehiculos, registrar intervenciones mecanicas y escanear codigos QR para acceder al historial de vehiculos. |
| Cliente | Propietario del vehiculo que lleva su automovil al taller para recibir servicios de mantenimiento y reparacion. Interactua con el sistema a traves de la aplicacion movil para visualizar su historial, recibir alertas y actualizar el kilometraje. |
| Taller Mecanico | Entidad comercial que ofrece servicios de mantenimiento, reparacion y diagnostico de vehiculos. Es el cliente principal del sistema M3Motors y el responsable del pago de la suscripcion a la plataforma. |
| Cliente Pre-registrado | Usuario que ha completado el formulario de pre-registro en la landing page del taller pero aun no ha sido activado por el mecanico. Se encuentra en estado PENDING y no tiene acceso al historial ni a las alertas del sistema hasta su activacion. |

### 3.2 Entidades del Negocio

| Termino | Definicion |
|---------|------------|
| Vehiculo | Automovil registrado en el sistema que pertenece a un cliente y es atendido por el taller. Posee atributos como placa, marca, modelo, anio, tipo de motor, y esta asociado a un QR del Vehiculo unico y a una coleccion de Photos de Vehiculo. Constituye la entidad central alrededor de la cual se organiza el historial de mantenimiento. |
| Cliente (Persona) | Individuo propietario del vehiculo. El sistema registra sus datos de contacto (nombre, telefono, email) para enviar notificaciones y alertas. Puede tener uno o mas vehiculos registrados. Un cliente existe en el sistema en dos estados: PENDING (pre-registrado) o ACTIVATED (activado por el taller). |
| QR del Vehiculo | Codigo QR unico generado automaticamente en el momento de activacion de un vehiculo. Permite al mecanico acceder instantaneamente al historial del vehiculo escaneandolo con la aplicacion movil. Es un elemento compartido (Shared Kernel) entre los contextos de Registro y Visualizacion. |
| Photo de Vehiculo | Imagen del vehiculo capturada durante el proceso de activacion. Incluye tipos especificos: frontal, lateral y placa. Se almacena en la nube y queda asociada al vehiculo como evidencia visual y fuente de datos para OCR. |
| Intervencion | Servicio o reparacion realizada sobre un vehiculo en el taller. Incluye diagnostico, mano de obra, piezas reemplazadas y cualquier otra accion tecnica realizada por el mecanico. Queda registrada en el historial del vehiculo. |
| Registro de Kilometraje | Medicion del kilometraje de un vehiculo en un momento especifico, generalmente asociada a una intervencion o a la llegada del vehiculo al taller. Permite calcular la tasa de desgaste y predecir mantenimientos futuros. El cliente puede actualizarlo desde la aplicacion. |
| Componente Critico | Pieza o parte del vehiculo que tiene un ciclo de vida definido y cuya sustitucion debe ser rastreada. Ejemplos incluyen banda de distribucion, pastillas de freno, filtros de aceite, entre otros. |
| Historial Evolutivo (Timeline) | Registro cronologico de todas las intervenciones, registros de kilometraje y eventos relevantes asociados a un vehiculo. Permite visualizar la vida util completa del automovil dentro del taller. |
| Workshop (Taller) | Entidad raiz que representa al taller mecanico registrado en la plataforma. Contiene informacion del dueno, lista de mecanicos, configuracion de horarios y servicios ofrecidos. Es el punto de partida del sistema. |

### 3.3 Procesos y Operaciones

| Termino | Definicion |
|---------|------------|
| Registro de Taller | Proceso mediante el cual el dueno del taller se registra en la plataforma M3Motors, crea su cuenta, configura los datos del negocio y establece los parametros iniciales de operacion. |
| Landing Page | Pagina publica del taller donde los clientes potenciales pueden visualizar informacion del negocio (horarios, servicios, contacto) y completar un formulario de pre-registro para ser atendidos. |
| Pre-registro de Cliente | Proceso por el cual un cliente potencial completa un formulario en la landing page con sus datos basicos (nombre, telefono, email y opcionalmente placa). El cliente queda en estado PENDING hasta su activacion en el taller. |
| Activacion de Cliente | Proceso critico realizado por el mecanico cuando el cliente llega al taller por primera vez. Incluye: busqueda del cliente pre-registrado, toma de fotos del vehiculo, reconocimiento automatico de placa mediante OCR, registro del vehiculo en el sistema y generacion de un QR unico. El cliente pasa de estado PENDING a ACTIVATED. |
| Reconocimiento de Placa (OCR) | Tecnologia que identifica automaticamente la placa del vehiculo a partir de la foto capturada durante la activacion. El sistema procesa la imagen, extrae los caracteres y valida la placa para registrar el vehiculo automaticamente. |
| Generacion de QR | Proceso automatico que ocurre durante la activacion del cliente. El sistema genera un codigo QR unico por vehiculo, que queda asociado permanentemente al mismo y permite acceso rapido al historial. |
| Seguimiento Dinamico de Kilometraje | Practica de capturar el kilometraje del vehiculo en cada interaccion con el taller, actualizando los algoritmos de uso y desgaste del sistema. El cliente tambien puede actualizarlo desde la aplicacion. |
| Escaneo QR | Proceso por el cual el mecanico escanea el codigo QR del vehiculo utilizando la aplicacion movil, obteniendo acceso instantaneo al historial completo del vehiculo para registrar nuevas intervenciones. |
| Mantenimiento Preventivo | Intervencion programada y proactiva sobre el vehiculo, realizada antes de que ocurra una aperia, con el objetivo de prolongar su vida util y evitar fallos costosos. |
| Alerta Predictiva | Notificacion automatizada enviada al cliente (mediante Push Notification o Email) que indica la proximidad de un mantenimiento necesario basado en el analisis del historial del vehiculo y la tasa de desgaste. |
| Prediccion de Mantenimiento | Estimacion generada por el sistema sobre el momento optimo (expresado en semanas o meses) para realizar una intervencion preventiva especifica, basada en el analisis de datos historicos y especificaciones del fabricante. |
| Notificacion Push | Alerta enviada directamente a la aplicacion movil del cliente. Constituye el canal principal de comunicacion para alertas predictivas y recordatorios de mantenimiento. |
| Actualizacion de Kilometraje | Proceso mediante el cual el cliente puede actualizar el kilometraje de su vehiculo desde la aplicacion movil, opcionalmente acompanado de una foto del tablero para validacion. |

### 3.4 Tecnicos del Dominio

| Termino | Definicion |
|---------|------------|
| Tasa de Desgaste Semanal | Indicador calculado automaticamente por el sistema que representa el promedio de kilometros recorridos por un vehiculo por semana, basado en el historial de registros de kilometraje. Permite proyectar cuando se necesitara mantenimiento. |
| Agente LLM | Componente del sistema que utiliza un modelo de lenguaje extenso (Large Language Model) para procesar el historial del vehiculo, las especificaciones tecnicas y el uso estimado, generando predicciones de mantenimiento precisas. |
| RAG (Retrieval-Augmented Generation) | Tecnica utilizada en el agente LLM que combina la recuperacion de informacion desde una base de conocimiento (especificaciones tecnicas, historial) con la generacion de texto, mejorando la precision de las predicciones y recomendaciones. |
| MCP (Model Context Protocol) | Protocolo de conversacion que permite a los usuarios interactuar directamente con el sistema mediante un chat conversacional, complementando a la aplicacion movil como canal de comunicacion. |
| OCR (Optical Character Recognition) | Tecnologia utilizada para extraer texto de imagenes, en particular para reconocer la placa del vehiculo a partir de la fotografia capturada durante la activacion del cliente. |
| Shared Kernel | Elemento compartido entre contextos delimitados. En M3Motors, el QR del Vehiculo es un Shared Kernel entre los contextos de Registro y Seguimiento y Gestion y Visualizacion. |

---

## 4. sinonimos y Terminos a Evitar

| Termino a Evitar | Termino Correcto | Motivo |
|------------------|------------------|--------|
| Auto, coche, carro | Vehiculo | Unifica el vocabulario tecnico |
| Dueno, propietario | Cliente | Refleja la relacion comercial con el taller |
| Reparacion, arreglo | Intervencion | Termino mas amplio que incluye diagnostico y mantenimiento |
| Trabajo, tarea (en contexto de taller) | Intervencion | Evita confusion con tareas de desarrollo |
| KM, millas | Kilometraje | Estandariza la unidad de medida |
| Aviso, recordatorio | Alerta Predictiva | Diferencia las alertas proactivas de recordatorios genericos |
| Pronostico, estimacion | Prediccion de Mantenimiento | Termino especifico del dominio |
| Registro manual | Activacion con foto | Refleja el nuevo proceso automatizado |
| Codigo, Codigo QR | QR del Vehiculo | Especifico del dominio y su proposito |
| Foto, Imagen | Photo de Vehiculo | Formaliza el concepto en el dominio |
| Bot de Telegram | Aplicacion movil | Canal principal de comunicacion con el cliente |

---

## 5. Relaciones entre Terminos

```
Dueno del Taller ── registra y configura ──> Workshop (Taller)
Dueno del Taller ── crea cuentas ──> Mecanico

Cliente ── completa ──> Pre-registro
Pre-registro ── genera ──> Cliente Pre-registrado (PENDING)
Cliente Pre-registrado ── es activado por ──> Activacion de Cliente

Mecanico ── realiza ──> Activacion de Cliente
Activacion de Cliente ── incluye ──> Reconocimiento de Placa (OCR)
Activacion de Cliente ── dispara ──> Generacion de QR

OCR ── identifica placa ──> Vehiculo
Generacion de QR ── genera ──> QR del Vehiculo

Activacion de Cliente ── crea ──> Vehiculo
Vehiculo ── posee ──> QR del Vehiculo
Vehiculo ── tiene ──> Photo de Vehiculo
Vehiculo ── pertenece a ──> Cliente (ACTIVATED)

Workshop ── atendido por ──> Mecanico
Workshop ── tiene clientes ──> Cliente

Mecanico ── registra ──> Intervencion
Intervencion ── se aplica a ──> Vehiculo

Vehiculo ── registra ──> Registro de Kilometraje
Registro de Kilometraje ── alimenta ──> Tasa de Desgaste Semanal
Tasa de Desgaste Semanal ── genera ──> Alerta Predictiva
Alerta Predictiva ── notifica a ──> Cliente

QR del Vehiculo ── permite acceso a ──> Intervencion

Cliente Pre-registrado ── transicion ──> Cliente (ACTIVATED)
```

---

## 6. Interpretacion del Diagrama

- **Flujo de Registro del Taller:** El Dueno del Taller registra el Workshop y crea cuentas para los Mecanicos.
- **Flujo de Pre-registro y Activacion:** El Cliente se pre-registra, queda en estado PENDING, el Mecanico lo activa con foto + OCR, se genera el QR.
- **Flujo de Gestion de Mantenimiento:** El Mecanico registra Intervenciones, se actualiza el Kilometraje, se calcula la Tasa de Desgaste, se generan Alertas Predictivas.
- **Flujo de Acceso:** El QR del Vehiculo permite acceso rapido al historial del vehiculo.
