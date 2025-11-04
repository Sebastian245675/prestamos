-- Base de datos para PrestaCol
-- Sistema de gestión de préstamos

-- Tabla de usuarios
CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(255) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('PRESTAMISTA', 'COBRADOR', 'CLIENTE')),
    activo BOOLEAN NOT NULL DEFAULT true,
    fecha_suscripcion DATE NOT NULL,
    fecha_vencimiento_suscripcion DATE NOT NULL,
    suscripcion_activa BOOLEAN NOT NULL DEFAULT false,
    prestamista_id BIGINT REFERENCES usuarios(id),
    fecha_creacion TIMESTAMP NOT NULL,
    fecha_actualizacion TIMESTAMP NOT NULL
);

-- Tabla de préstamos
CREATE TABLE prestamos (
    id BIGSERIAL PRIMARY KEY,
    prestamista_id BIGINT NOT NULL REFERENCES usuarios(id),
    cobrador_id BIGINT REFERENCES usuarios(id),
    nombre_cliente VARCHAR(255) NOT NULL,
    direccion TEXT NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    monto_prestado NUMERIC(15, 2) NOT NULL,
    saldo_pendiente NUMERIC(15, 2) NOT NULL,
    numero_cuotas INTEGER NOT NULL,
    cuotas_pagadas INTEGER NOT NULL DEFAULT 0,
    frecuencia_pago VARCHAR(20) NOT NULL CHECK (frecuencia_pago IN ('DIARIO', 'SEMANAL', 'QUINCENAL', 'MENSUAL')),
    fecha_inicio DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    recordatorios_activos BOOLEAN NOT NULL DEFAULT true,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('ACTIVO', 'VENCIDO', 'FINALIZADO', 'INCOBRABLE')),
    zona VARCHAR(100) NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL,
    fecha_actualizacion TIMESTAMP NOT NULL
);

-- Tabla de abonos
CREATE TABLE abonos (
    id BIGSERIAL PRIMARY KEY,
    prestamo_id BIGINT NOT NULL REFERENCES prestamos(id) ON DELETE CASCADE,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
    monto NUMERIC(15, 2) NOT NULL,
    fecha_abono DATE NOT NULL,
    observaciones TEXT,
    fecha_creacion TIMESTAMP NOT NULL
);

-- Tabla de cuotas
CREATE TABLE cuotas (
    id BIGSERIAL PRIMARY KEY,
    prestamo_id BIGINT NOT NULL REFERENCES prestamos(id) ON DELETE CASCADE,
    numero_cuota INTEGER NOT NULL,
    monto NUMERIC(15, 2) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    fecha_pago DATE,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('PENDIENTE', 'PAGADA', 'VENCIDA')),
    fecha_creacion TIMESTAMP NOT NULL,
    fecha_actualizacion TIMESTAMP NOT NULL
);

-- Tabla de suscripciones
CREATE TABLE suscripciones (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('MENSUAL', 'ANUAL')),
    monto NUMERIC(15, 2) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('ACTIVA', 'VENCIDA', 'CANCELADA')),
    fecha_creacion TIMESTAMP NOT NULL,
    fecha_actualizacion TIMESTAMP NOT NULL
);

-- Tabla de movimientos (entradas y salidas)
CREATE TABLE movimientos (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ENTRADA', 'SALIDA')),
    monto NUMERIC(15, 2) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    fecha DATE NOT NULL,
    observaciones TEXT,
    fecha_creacion TIMESTAMP NOT NULL
);

-- Índices para mejor rendimiento
CREATE INDEX idx_prestamos_prestamista ON prestamos(prestamista_id);
CREATE INDEX idx_movimientos_usuario ON movimientos(usuario_id);
CREATE INDEX idx_movimientos_fecha ON movimientos(fecha);
CREATE INDEX idx_movimientos_tipo ON movimientos(tipo);
CREATE INDEX idx_prestamos_cobrador ON prestamos(cobrador_id);
CREATE INDEX idx_prestamos_estado ON prestamos(estado);
CREATE INDEX idx_prestamos_zona ON prestamos(zona);
CREATE INDEX idx_prestamos_fecha_vencimiento ON prestamos(fecha_vencimiento);
CREATE INDEX idx_abonos_prestamo ON abonos(prestamo_id);
CREATE INDEX idx_abonos_fecha ON abonos(fecha_abono);
CREATE INDEX idx_cuotas_prestamo ON cuotas(prestamo_id);
CREATE INDEX idx_cuotas_fecha_vencimiento ON cuotas(fecha_vencimiento);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_prestamista ON usuarios(prestamista_id);

