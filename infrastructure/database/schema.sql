-- =============================================================================
-- M3Motors — Script SQL: Esquema de Base de Datos
-- =============================================================================
-- Descripción: Script de inicialización del esquema de la base de datos M3Motors
--              compatible con PostgreSQL 16.
--
-- Este script crea las tablas principales del sistema de gestión y mantenimiento
-- predictivo para talleres mecánicos.
--
-- Uso:
--   - Ejecutar en Supabase: pegar el contenido en el SQL Editor y ejecutar
--   - Ejecutar en Docker: el script se ejecuta automáticamente al iniciar el
--     contenedor postgres por primera vez
-- =============================================================================

-- =============================================================================
-- TABLA: CLIENTE
-- =============================================================================
-- Almacena la información de los clientes del taller mecánico.
-- Incluye integración con Clerk para autenticación futura.
-- =============================================================================
CREATE TABLE IF NOT EXISTS CLIENTE (
    id_cliente    SERIAL PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    telefono      VARCHAR(20),
    telegram_id   VARCHAR(50),
    clerk_id      VARCHAR(255),
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comentario de tabla
COMMENT ON TABLE CLIENTE IS 'Clientes registrados del taller mecánico';

-- Comentarios de columnas
COMMENT ON COLUMN CLIENTE.id_cliente IS 'Identificador único del cliente';
COMMENT ON COLUMN CLIENTE.nombre IS 'Nombre completo del cliente';
COMMENT ON COLUMN CLIENTE.email IS 'Correo electrónico del cliente (único)';
COMMENT ON COLUMN CLIENTE.telefono IS 'Número de teléfono del cliente';
COMMENT ON COLUMN CLIENTE.telegram_id IS 'ID de usuario de Telegram para notificaciones';
COMMENT ON COLUMN CLIENTE.clerk_id IS 'ID de Clerk para autenticación (integración futura)';

-- =============================================================================
-- TABLA: VEHICULO
-- =============================================================================
-- Registra los vehículos asociados a cada cliente.
-- =============================================================================
CREATE TABLE IF NOT EXISTS VEHICULO (
    id_vehiculo   SERIAL PRIMARY KEY,
    placa         VARCHAR(20) NOT NULL UNIQUE,
    marca         VARCHAR(50) NOT NULL,
    modelo        VARCHAR(50) NOT NULL,
    anio          INTEGER NOT NULL,
    id_cliente    INTEGER NOT NULL,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Restricción de clave foránea con CASCADE
    CONSTRAINT fk_vehiculo_cliente
        FOREIGN KEY (id_cliente)
        REFERENCES CLIENTE(id_cliente)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Comentarios
COMMENT ON TABLE VEHICULO IS 'Vehículos registrados en el sistema';
COMMENT ON COLUMN VEHICULO.id_vehiculo IS 'Identificador único del vehículo';
COMMENT ON COLUMN VEHICULO.placa IS 'Placa del vehículo (única)';
COMMENT ON COLUMN VEHICULO.marca IS 'Marca del vehículo';
COMMENT ON COLUMN VEHICULO.modelo IS 'Modelo del vehículo';
COMMENT ON COLUMN VEHICULO.anio IS 'Año de fabricación del vehículo';
COMMENT ON COLUMN VEHICULO.id_cliente IS 'Referencia al propietario del vehículo';

-- =============================================================================
-- TABLA: MECANICO
-- =============================================================================
-- Registra los mecánicos disponibles en el taller.
-- Incluye integración con Clerk para autenticación futura.
-- =============================================================================
CREATE TABLE IF NOT EXISTS MECANICO (
    id_mecanico   SERIAL PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL,
    especialidad  VARCHAR(100),
    estado        VARCHAR(20) DEFAULT 'activo',
    clerk_id      VARCHAR(255),
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Restricción CHECK para el estado del mecánico
ALTER TABLE MECANICO
    ADD CONSTRAINT chk_mecanico_estado
    CHECK (estado IN ('activo', 'inactivo', 'vacaciones'));

-- Comentarios
COMMENT ON TABLE MECANICO IS 'Mecánicos del taller';
COMMENT ON COLUMN MECANICO.id_mecanico IS 'Identificador único del mecánico';
COMMENT ON COLUMN MECANICO.nombre IS 'Nombre completo del mecánico';
COMMENT ON COLUMN MECANICO.especialidad IS 'Especialidad del mecánico (ej: motor, frenos, electricidad)';
COMMENT ON COLUMN MECANICO.estado IS 'Estado actual: activo, inactivo, vacaciones';
COMMENT ON COLUMN MECANICO.clerk_id IS 'ID de Clerk para autenticación (integración futura)';

-- =============================================================================
-- TABLA: INTERVENCION
-- =============================================================================
-- Registra cada intervención o servicio realizado en un vehículo.
-- =============================================================================
CREATE TABLE IF NOT EXISTS INTERVENCION (
    id_intervencion           SERIAL PRIMARY KEY,
    fecha                     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    kilometraje_odometro      INTEGER NOT NULL,
    observaciones             TEXT,
    id_vehiculo               INTEGER NOT NULL,
    id_mecanico               INTEGER NOT NULL,
    created_at                TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at                TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Restricción de clave foránea a VEHICULO
    CONSTRAINT fk_intervencion_vehiculo
        FOREIGN KEY (id_vehiculo)
        REFERENCES VEHICULO(id_vehiculo)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    -- Restricción de clave foránea a MECANICO
    CONSTRAINT fk_intervencion_mecanico
        FOREIGN KEY (id_mecanico)
        REFERENCES MECANICO(id_mecanico)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Comentarios
COMMENT ON TABLE INTERVENCION IS 'Intervenciones o servicios realizados en vehículos';
COMMENT ON COLUMN INTERVENCION.id_intervencion IS 'Identificador único de la intervención';
COMMENT ON COLUMN INTERVENCION.fecha IS 'Fecha y hora de la intervención';
COMMENT ON COLUMN INTERVENCION.kilometraje_odometro IS 'Kilometraje actual del odómetro al momento de la intervención';
COMMENT ON COLUMN INTERVENCION.observaciones IS 'Observaciones adicionales sobre la intervención';
COMMENT ON COLUMN INTERVENCION.id_vehiculo IS 'Vehículo al que se le realizó la intervención';
COMMENT ON COLUMN INTERVENCION.id_mecanico IS 'Mecánico que realizó la intervención';

-- =============================================================================
-- TABLA: DETALLE_INTERVENCION
-- =============================================================================
-- Detalla los componentes reemplazados y tipos de servicio en cada intervención.
-- =============================================================================
CREATE TABLE IF NOT EXISTS DETALLE_INTERVENCION (
    id_detalle                SERIAL PRIMARY KEY,
    componente_reemplazado    VARCHAR(150),
    tipo_servicio             VARCHAR(100) NOT NULL,
    id_intervencion           INTEGER NOT NULL,
    created_at                TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at                TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Restricción de clave foránea a INTERVENCION
    CONSTRAINT fk_detalle_intervencion
        FOREIGN KEY (id_intervencion)
        REFERENCES INTERVENCION(id_intervencion)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Comentarios
COMMENT ON TABLE DETALLE_INTERVENCION IS 'Detalles de los componentes y servicios en cada intervención';
COMMENT ON COLUMN DETALLE_INTERVENCION.id_detalle IS 'Identificador único del detalle';
COMMENT ON COLUMN DETALLE_INTERVENCION.componente_reemplazado IS 'Componente que fue reemplazado (puede ser NULL si no hubo reemplazo)';
COMMENT ON COLUMN DETALLE_INTERVENCION.tipo_servicio IS 'Tipo de servicio realizado (ej: cambio de aceite, alineación, etc.)';
COMMENT ON COLUMN DETALLE_INTERVENCION.id_intervencion IS 'Intervención a la que pertenece este detalle';

-- =============================================================================
-- TABLA: ALERTA_PREDICTIVA
-- =============================================================================
-- Almacena las alertas generadas por el sistema de mantenimiento predictivo.
-- =============================================================================
CREATE TABLE IF NOT EXISTS ALERTA_PREDICTIVA (
    id_alerta                 SERIAL PRIMARY KEY,
    fecha_estimada            TIMESTAMP WITH TIME ZONE NOT NULL,
    kilometraje_proyectado    INTEGER NOT NULL,
    estado_alerta             VARCHAR(20) DEFAULT 'pendiente',
    id_intervencion           INTEGER NOT NULL,
    created_at                TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at                TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Restricción de clave foránea a INTERVENCION
    CONSTRAINT fk_alerta_intervencion
        FOREIGN KEY (id_intervencion)
        REFERENCES INTERVENCION(id_intervencion)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Restricción CHECK para el estado de la alerta
ALTER TABLE ALERTA_PREDICTIVA
    ADD CONSTRAINT chk_alerta_estado
    CHECK (estado_alerta IN ('pendiente', 'notificada', 'completada', 'cancelada'));

-- Comentarios
COMMENT ON TABLE ALERTA_PREDICTIVA IS 'Alertas de mantenimiento predictivo generadas por el sistema';
COMMENT ON COLUMN ALERTA_PREDICTIVA.id_alerta IS 'Identificador único de la alerta';
COMMENT ON COLUMN ALERTA_PREDICTIVA.fecha_estimada IS 'Fecha estimada para el próximo mantenimiento';
COMMENT ON COLUMN ALERTA_PREDICTIVA.kilometraje_proyectado IS 'Kilometraje proyectado para el próximo mantenimiento';
COMMENT ON COLUMN ALERTA_PREDICTIVA.estado_alerta IS 'Estado de la alerta: pendiente, notificada, completada, cancelada';
COMMENT ON COLUMN ALERTA_PREDICTIVA.id_intervencion IS 'Intervención que originó esta alerta predictiva';

-- =============================================================================
-- ÍNDICES PARA BÚSQUEDAS FRECUENTES
-- =============================================================================
-- Estos índices optimizan las consultas más comunes del sistema.

-- Índice para búsqueda de vehículos por placa
CREATE INDEX IF NOT EXISTS idx_vehiculo_placa
    ON VEHICULO(placa);

-- Índice para búsqueda de vehículos por cliente
CREATE INDEX IF NOT EXISTS idx_vehiculo_id_cliente
    ON VEHICULO(id_cliente);

-- Índice para búsqueda de intervenciones por vehículo
CREATE INDEX IF NOT EXISTS idx_intervencion_id_vehiculo
    ON INTERVENCION(id_vehiculo);

-- Índice para búsqueda de intervenciones por mecánico
CREATE INDEX IF NOT EXISTS idx_intervencion_id_mecanico
    ON INTERVENCION(id_mecanico);

-- Índice para búsqueda de detalles por intervención
CREATE INDEX IF NOT EXISTS idx_detalle_id_intervencion
    ON DETALLE_INTERVENCION(id_intervencion);

-- Índice para búsqueda de alertas por intervención
CREATE INDEX IF NOT EXISTS idx_alerta_id_intervencion
    ON ALERTA_PREDICTIVA(id_intervencion);

-- Índice para búsqueda de alertas pendientes
CREATE INDEX IF NOT EXISTS idx_alerta_estado
    ON ALERTA_PREDICTIVA(estado_alerta);

-- =============================================================================
-- FUNCIONES TRIGGER PARA UPDATED_AT
-- =============================================================================
-- Función que actualiza automáticamente el campo updated_at

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para cada tabla
CREATE TRIGGER update_cliente_updated_at
    BEFORE UPDATE ON CLIENTE
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehiculo_updated_at
    BEFORE UPDATE ON VEHICULO
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mecanico_updated_at
    BEFORE UPDATE ON MECANICO
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_intervencion_updated_at
    BEFORE UPDATE ON INTERVENCION
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_detalle_intervencion_updated_at
    BEFORE UPDATE ON DETALLE_INTERVENCION
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alerta_predictiva_updated_at
    BEFORE UPDATE ON ALERTA_PREDICTIVA
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- FIN DEL SCRIPT
-- =============================================================================