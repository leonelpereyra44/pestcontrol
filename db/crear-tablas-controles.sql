-- =====================================================================
-- SISTEMA DE CONTROLES DE PLAGAS - ESTRUCTURA DE BASE DE DATOS
-- Versión: 2.0 (Actualizado: 2025-10-10)
-- =====================================================================

-- Tabla principal de controles
CREATE TABLE IF NOT EXISTS controles (
    control_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresa(empresa_id) ON DELETE CASCADE,
    cliente_id UUID NOT NULL REFERENCES clientes(cliente_id) ON DELETE CASCADE,
    planta_id UUID REFERENCES plantas(planta_id) ON DELETE SET NULL,
    tecnico_id UUID NOT NULL REFERENCES worker(worker_id) ON DELETE RESTRICT,
    
    -- Información del control
    fecha_control TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tipo_control VARCHAR(50) NOT NULL CHECK (tipo_control IN ('preventivo', 'correctivo', 'especial')),
    estado VARCHAR(50) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_progreso', 'completado', 'cancelado')),
    
    -- Observaciones generales
    observaciones TEXT,
    
    -- Firmas digitales (URLs a imágenes en storage)
    firma_tecnico TEXT,
    firma_cliente TEXT,
    nombre_cliente_firma VARCHAR(255),
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- PDF generado
    pdf_url TEXT
);

COMMENT ON TABLE controles IS 'Tabla principal de controles de plagas';
COMMENT ON COLUMN controles.estado IS 'Estado del control completo';
COMMENT ON COLUMN controles.tipo_control IS 'Tipo de control realizado';

-- Tabla de productos utilizados en el control
CREATE TABLE IF NOT EXISTS control_productos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    control_id UUID NOT NULL REFERENCES controles(control_id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(producto_id) ON DELETE RESTRICT,
    cantidad_usada DECIMAL(10,2) NOT NULL CHECK (cantidad_usada > 0),
    unidad VARCHAR(50) NOT NULL,
    notas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE control_productos IS 'Productos utilizados en cada control';

-- Tabla de cebaderos/puntos de control (ACTUALIZADA)
CREATE TABLE IF NOT EXISTS control_puntos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    control_id UUID NOT NULL REFERENCES controles(control_id) ON DELETE CASCADE,
    
    -- Información del punto
    numero_punto INTEGER NOT NULL,
    tipo_plaga VARCHAR(50) NOT NULL CHECK (tipo_plaga IN ('roedores', 'voladores', 'rastreros')),
    tipo_dispositivo VARCHAR(100), -- Ej: "Cebadero", "Trampa de luz", "Aplicación en grietas"
    ubicacion VARCHAR(255), -- Descripción de la ubicación
    
    -- Estado del punto (SIN restricciones para mayor flexibilidad)
    estado VARCHAR(50) NOT NULL,
    actividad_detectada BOOLEAN DEFAULT FALSE,
    descripcion_actividad TEXT, -- JSON con datos específicos: {caja_n, vivos, muertos, densidad, etc.}
    
    -- Acciones realizadas
    accion_realizada TEXT,
    producto_aplicado UUID REFERENCES productos(producto_id) ON DELETE SET NULL,
    cantidad_aplicada DECIMAL(10,2),
    
    -- Para voladores: conteo de capturas
    capturas_contadas INTEGER,
    
    -- Evidencia fotográfica
    foto_url TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE control_puntos IS 'Puntos de control revisados (roedores, voladores, rastreros)';
COMMENT ON COLUMN control_puntos.numero_punto IS 'Número entero del punto. Generado automáticamente si no es numérico';
COMMENT ON COLUMN control_puntos.estado IS 'Estado flexible: ok, con_actividad, baja, media, alta, na, etc.';
COMMENT ON COLUMN control_puntos.descripcion_actividad IS 'JSON con datos específicos: {caja_n, vivos, muertos, densidad, reposicion, etc.}';

-- Tabla de fotos adicionales del control
CREATE TABLE IF NOT EXISTS control_fotos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    control_id UUID NOT NULL REFERENCES controles(control_id) ON DELETE CASCADE,
    foto_url TEXT NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE control_fotos IS 'Fotos adicionales del control (evidencias)';

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_controles_empresa ON controles(empresa_id);
CREATE INDEX IF NOT EXISTS idx_controles_cliente ON controles(cliente_id);
CREATE INDEX IF NOT EXISTS idx_controles_fecha ON controles(fecha_control DESC);
CREATE INDEX IF NOT EXISTS idx_controles_tecnico ON controles(tecnico_id);
CREATE INDEX IF NOT EXISTS idx_controles_estado ON controles(estado);
CREATE INDEX IF NOT EXISTS idx_control_productos_control ON control_productos(control_id);
CREATE INDEX IF NOT EXISTS idx_control_puntos_control ON control_puntos(control_id);
CREATE INDEX IF NOT EXISTS idx_control_puntos_tipo ON control_puntos(tipo_plaga);
CREATE INDEX IF NOT EXISTS idx_control_puntos_numero ON control_puntos(control_id, numero_punto);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_controles_updated_at
    BEFORE UPDATE ON controles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentarios para documentación
COMMENT ON TABLE controles IS 'Registros de controles de plagas realizados';
COMMENT ON TABLE control_productos IS 'Productos químicos utilizados en cada control';
COMMENT ON TABLE control_puntos IS 'Puntos de control (cebaderos, trampas, aplicaciones)';
COMMENT ON TABLE control_fotos IS 'Fotografías adicionales del control';
