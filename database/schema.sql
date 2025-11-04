-- Base de datos para PrestaCol
-- Sistema de gestión de préstamos
-- Esquema optimizado para alto rendimiento

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
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
    codigo_referido VARCHAR(50) UNIQUE,
    prestamista_id BIGINT REFERENCES usuarios(id),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de préstamos
CREATE TABLE IF NOT EXISTS prestamos (
    id BIGSERIAL PRIMARY KEY,
    prestamista_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    cobrador_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
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
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de abonos
CREATE TABLE IF NOT EXISTS abonos (
    id BIGSERIAL PRIMARY KEY,
    prestamo_id BIGINT NOT NULL REFERENCES prestamos(id) ON DELETE CASCADE,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    monto NUMERIC(15, 2) NOT NULL,
    fecha_abono DATE NOT NULL,
    observaciones TEXT,
    es_solo_intereses BOOLEAN NOT NULL DEFAULT false,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de cuotas
CREATE TABLE IF NOT EXISTS cuotas (
    id BIGSERIAL PRIMARY KEY,
    prestamo_id BIGINT NOT NULL REFERENCES prestamos(id) ON DELETE CASCADE,
    numero_cuota INTEGER NOT NULL,
    monto NUMERIC(15, 2) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    fecha_pago DATE,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('PENDIENTE', 'PAGADA', 'VENCIDA')),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de suscripciones
CREATE TABLE IF NOT EXISTS suscripciones (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('MENSUAL', 'ANUAL')),
    monto NUMERIC(15, 2) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('ACTIVA', 'VENCIDA', 'CANCELADA')),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de movimientos (entradas y salidas)
CREATE TABLE IF NOT EXISTS movimientos (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ENTRADA', 'SALIDA')),
    monto NUMERIC(15, 2) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    fecha DATE NOT NULL,
    observaciones TEXT,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de referidos
CREATE TABLE IF NOT EXISTS referidos (
    id BIGSERIAL PRIMARY KEY,
    referidor_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    referido_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    codigo_referido VARCHAR(50) NOT NULL UNIQUE,
    fecha_registro DATE NOT NULL DEFAULT CURRENT_DATE,
    monto_generado NUMERIC(15, 2) NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT false,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_referido_id UNIQUE (referido_id)
);

-- Tabla de rutas
CREATE TABLE IF NOT EXISTS rutas (
    id BIGSERIAL PRIMARY KEY,
    prestamista_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
    activa BOOLEAN NOT NULL DEFAULT true,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ÍNDICES SIMPLES (para consultas básicas)
-- ============================================

-- Índices para usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_prestamista ON usuarios(prestamista_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo);
CREATE INDEX IF NOT EXISTS idx_usuarios_codigo_referido ON usuarios(codigo_referido);

-- Índices para referidos
CREATE INDEX IF NOT EXISTS idx_referidos_referidor ON referidos(referidor_id);
CREATE INDEX IF NOT EXISTS idx_referidos_referido ON referidos(referido_id);
CREATE INDEX IF NOT EXISTS idx_referidos_codigo ON referidos(codigo_referido);
CREATE INDEX IF NOT EXISTS idx_referidos_fecha ON referidos(fecha_registro DESC);

-- Índices para rutas
CREATE INDEX IF NOT EXISTS idx_rutas_prestamista ON rutas(prestamista_id);
CREATE INDEX IF NOT EXISTS idx_rutas_nombre ON rutas(prestamista_id, nombre);

-- Índices para préstamos (consultas frecuentes)
CREATE INDEX IF NOT EXISTS idx_prestamos_prestamista ON prestamos(prestamista_id);
CREATE INDEX IF NOT EXISTS idx_prestamos_cobrador ON prestamos(cobrador_id);
CREATE INDEX IF NOT EXISTS idx_prestamos_estado ON prestamos(estado);
CREATE INDEX IF NOT EXISTS idx_prestamos_zona ON prestamos(zona);
CREATE INDEX IF NOT EXISTS idx_prestamos_fecha_vencimiento ON prestamos(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_prestamos_fecha_creacion ON prestamos(fecha_creacion DESC);
CREATE INDEX IF NOT EXISTS idx_prestamos_fecha_inicio ON prestamos(fecha_inicio);

-- Índices para abonos
CREATE INDEX IF NOT EXISTS idx_abonos_prestamo ON abonos(prestamo_id);
CREATE INDEX IF NOT EXISTS idx_abonos_fecha ON abonos(fecha_abono DESC);
CREATE INDEX IF NOT EXISTS idx_abonos_usuario ON abonos(usuario_id);

-- Índices para cuotas
CREATE INDEX IF NOT EXISTS idx_cuotas_prestamo ON cuotas(prestamo_id);
CREATE INDEX IF NOT EXISTS idx_cuotas_fecha_vencimiento ON cuotas(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_cuotas_estado ON cuotas(estado);
CREATE INDEX IF NOT EXISTS idx_cuotas_prestamo_numero ON cuotas(prestamo_id, numero_cuota);

-- Índices para movimientos
CREATE INDEX IF NOT EXISTS idx_movimientos_usuario ON movimientos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON movimientos(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_movimientos_tipo ON movimientos(tipo);
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha_creacion ON movimientos(fecha_creacion DESC);

-- Índices para suscripciones
CREATE INDEX IF NOT EXISTS idx_suscripciones_usuario ON suscripciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_suscripciones_estado ON suscripciones(estado);
CREATE INDEX IF NOT EXISTS idx_suscripciones_fecha_vencimiento ON suscripciones(fecha_vencimiento);

-- ============================================
-- ÍNDICES COMPUESTOS (para consultas optimizadas)
-- ============================================

-- Índices compuestos para préstamos (consultas más frecuentes)
CREATE INDEX IF NOT EXISTS idx_prestamos_prestamista_estado ON prestamos(prestamista_id, estado);
CREATE INDEX IF NOT EXISTS idx_prestamos_prestamista_fecha_creacion ON prestamos(prestamista_id, fecha_creacion DESC);
CREATE INDEX IF NOT EXISTS idx_prestamos_prestamista_estado_fecha ON prestamos(prestamista_id, estado, fecha_creacion DESC);
CREATE INDEX IF NOT EXISTS idx_prestamos_cobrador_estado ON prestamos(cobrador_id, estado) WHERE cobrador_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_prestamos_zona_estado ON prestamos(zona, estado);
CREATE INDEX IF NOT EXISTS idx_prestamos_fecha_vencimiento_estado ON prestamos(fecha_vencimiento, estado) WHERE estado = 'ACTIVO';

-- Índices compuestos para movimientos
CREATE INDEX IF NOT EXISTS idx_movimientos_usuario_fecha ON movimientos(usuario_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_movimientos_usuario_tipo_fecha ON movimientos(usuario_id, tipo, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_movimientos_usuario_fecha_rango ON movimientos(usuario_id, fecha DESC, fecha_creacion DESC);

-- Índices compuestos para cuotas (calendario y consultas de vencimientos)
CREATE INDEX IF NOT EXISTS idx_cuotas_prestamo_estado ON cuotas(prestamo_id, estado);
CREATE INDEX IF NOT EXISTS idx_cuotas_fecha_vencimiento_estado ON cuotas(fecha_vencimiento, estado) WHERE estado = 'PENDIENTE';

-- Índices compuestos para abonos
CREATE INDEX IF NOT EXISTS idx_abonos_prestamo_fecha ON abonos(prestamo_id, fecha_abono DESC);

-- ============================================
-- ÍNDICES PARA BÚSQUEDAS DE TEXTO
-- ============================================

-- Índices para búsquedas por nombre de cliente y teléfono
CREATE INDEX IF NOT EXISTS idx_prestamos_nombre_cliente_lower ON prestamos(LOWER(nombre_cliente));
CREATE INDEX IF NOT EXISTS idx_prestamos_telefono ON prestamos(telefono);

-- ============================================
-- TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
-- ============================================

-- Función para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar fecha_actualizacion
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prestamos_updated_at BEFORE UPDATE ON prestamos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cuotas_updated_at BEFORE UPDATE ON cuotas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suscripciones_updated_at BEFORE UPDATE ON suscripciones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VISTAS MATERIALIZADAS (opcional, para reportes)
-- ============================================

-- Vista para estadísticas de préstamos por prestamista (puede ser materializada)
CREATE OR REPLACE VIEW v_prestamos_stats AS
SELECT 
    prestamista_id,
    COUNT(*) as total_prestamos,
    COUNT(*) FILTER (WHERE estado = 'ACTIVO') as prestamos_activos,
    COUNT(*) FILTER (WHERE estado = 'VENCIDO') as prestamos_vencidos,
    COUNT(*) FILTER (WHERE estado = 'FINALIZADO') as prestamos_finalizados,
    SUM(monto_prestado) as total_prestado,
    SUM(saldo_pendiente) as total_pendiente,
    SUM(monto_prestado - saldo_pendiente) as total_cobrado
FROM prestamos
GROUP BY prestamista_id;

-- ============================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- ============================================

COMMENT ON TABLE prestamos IS 'Tabla principal de préstamos con índices optimizados para consultas frecuentes';
COMMENT ON TABLE abonos IS 'Registro de pagos realizados en préstamos';
COMMENT ON TABLE cuotas IS 'Cuotas programadas de cada préstamo';
COMMENT ON TABLE movimientos IS 'Movimientos financieros (entradas y salidas)';
COMMENT ON INDEX idx_prestamos_prestamista_estado_fecha IS 'Índice compuesto optimizado para listar préstamos por estado y fecha';
COMMENT ON INDEX idx_movimientos_usuario_tipo_fecha IS 'Índice compuesto para consultas de movimientos filtrados por tipo y fecha';
