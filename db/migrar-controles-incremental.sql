-- =====================================================================
-- MIGRACIÓN INCREMENTAL - SISTEMA DE CONTROLES
-- Agrega solo lo que falta sin modificar lo existente
-- =====================================================================

-- 1. AGREGAR COLUMNAS FALTANTES A LA TABLA controles
ALTER TABLE controles ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES clientes(cliente_id) ON DELETE CASCADE;
ALTER TABLE controles ADD COLUMN IF NOT EXISTS tecnico_id UUID REFERENCES worker(worker_id) ON DELETE RESTRICT;
ALTER TABLE controles ADD COLUMN IF NOT EXISTS tipo_control VARCHAR(50) DEFAULT 'preventivo' CHECK (tipo_control IN ('preventivo', 'correctivo', 'especial'));
ALTER TABLE controles ADD COLUMN IF NOT EXISTS estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_progreso', 'completado', 'cancelado'));
ALTER TABLE controles ADD COLUMN IF NOT EXISTS firma_tecnico TEXT;
ALTER TABLE controles ADD COLUMN IF NOT EXISTS firma_cliente TEXT;
ALTER TABLE controles ADD COLUMN IF NOT EXISTS nombre_cliente_firma VARCHAR(255);
ALTER TABLE controles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE controles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE controles ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE controles ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- Renombrar columna fecha a fecha_control (si no existe fecha_control)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'controles' AND column_name = 'fecha_control'
    ) THEN
        ALTER TABLE controles RENAME COLUMN fecha TO fecha_control;
    END IF;
END $$;

-- 2. CREAR TABLA control_puntos (cebaderos, trampas, aplicaciones)
CREATE TABLE IF NOT EXISTS control_puntos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    control_id UUID NOT NULL REFERENCES controles(control_id) ON DELETE CASCADE,
    
    -- Información del punto
    numero_punto INTEGER NOT NULL,
    tipo_plaga VARCHAR(50) NOT NULL CHECK (tipo_plaga IN ('roedores', 'voladores', 'rastreros')),
    tipo_dispositivo VARCHAR(100), -- Ej: "Cebadero", "Trampa de luz", "Aplicación"
    ubicacion VARCHAR(255),
    
    -- Estado del punto
    estado VARCHAR(50) NOT NULL CHECK (estado IN ('ok', 'con_actividad', 'faltante', 'reemplazado')),
    actividad_detectada BOOLEAN DEFAULT FALSE,
    descripcion_actividad TEXT,
    
    -- Acciones realizadas
    accion_realizada TEXT,
    producto_aplicado UUID REFERENCES productos(producto_id) ON DELETE SET NULL,
    cantidad_aplicada DECIMAL(10,2),
    
    -- Para voladores: conteo
    capturas_contadas INTEGER,
    
    -- Evidencia
    foto_url TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CREAR TABLA control_fotos (fotos adicionales del control)
CREATE TABLE IF NOT EXISTS control_fotos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    control_id UUID NOT NULL REFERENCES controles(control_id) ON DELETE CASCADE,
    foto_url TEXT NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. VERIFICAR Y AGREGAR COLUMNAS A control_productos SI FALTAN
ALTER TABLE control_productos ADD COLUMN IF NOT EXISTS cantidad_usada DECIMAL(10,2);
ALTER TABLE control_productos ADD COLUMN IF NOT EXISTS unidad VARCHAR(50);
ALTER TABLE control_productos ADD COLUMN IF NOT EXISTS notas TEXT;
ALTER TABLE control_productos ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Renombrar observaciones a notas si existe observaciones
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'control_productos' AND column_name = 'observaciones'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'control_productos' AND column_name = 'notas'
    ) THEN
        ALTER TABLE control_productos RENAME COLUMN observaciones TO notas;
    END IF;
END $$;

-- 5. CREAR ÍNDICES PARA MEJORAR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_controles_empresa ON controles(empresa_id);
CREATE INDEX IF NOT EXISTS idx_controles_cliente ON controles(cliente_id);
CREATE INDEX IF NOT EXISTS idx_controles_fecha ON controles(fecha_control DESC);
CREATE INDEX IF NOT EXISTS idx_controles_tecnico ON controles(tecnico_id);
CREATE INDEX IF NOT EXISTS idx_controles_estado ON controles(estado);
CREATE INDEX IF NOT EXISTS idx_control_productos_control ON control_productos(control_id);
CREATE INDEX IF NOT EXISTS idx_control_puntos_control ON control_puntos(control_id);
CREATE INDEX IF NOT EXISTS idx_control_puntos_tipo ON control_puntos(tipo_plaga);
CREATE INDEX IF NOT EXISTS idx_control_fotos_control ON control_fotos(control_id);

-- 6. CREAR TRIGGER PARA updated_at (si no existe)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_controles_updated_at ON controles;
CREATE TRIGGER update_controles_updated_at
    BEFORE UPDATE ON controles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. VERIFICAR RESULTADO
SELECT 
    'controles' as tabla,
    COUNT(*) as columnas
FROM information_schema.columns
WHERE table_name = 'controles'
UNION ALL
SELECT 
    'control_productos' as tabla,
    COUNT(*) as columnas
FROM information_schema.columns
WHERE table_name = 'control_productos'
UNION ALL
SELECT 
    'control_puntos' as tabla,
    COUNT(*) as columnas
FROM information_schema.columns
WHERE table_name = 'control_puntos'
UNION ALL
SELECT 
    'control_fotos' as tabla,
    COUNT(*) as columnas
FROM information_schema.columns
WHERE table_name = 'control_fotos';
