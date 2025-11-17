-- Tabla para registros pendientes de pago
CREATE TABLE IF NOT EXISTS registros_pendientes (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    nombre_completo VARCHAR(255) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    tipo_suscripcion VARCHAR(20) NOT NULL CHECK (tipo_suscripcion IN ('MENSUAL', 'ANUAL')),
    codigo_referido VARCHAR(50),
    paypal_order_id VARCHAR(255) NOT NULL UNIQUE,
    paypal_capture_id VARCHAR(255),
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('PENDIENTE', 'PAGADO', 'EXPIRADO', 'CANCELADO')),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_pago TIMESTAMP,
    fecha_expiracion TIMESTAMP NOT NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_registros_pendientes_email ON registros_pendientes(email);
CREATE INDEX IF NOT EXISTS idx_registros_pendientes_order_id ON registros_pendientes(paypal_order_id);
CREATE INDEX IF NOT EXISTS idx_registros_pendientes_fecha ON registros_pendientes(fecha_creacion);
CREATE INDEX IF NOT EXISTS idx_registros_pendientes_estado ON registros_pendientes(estado);

