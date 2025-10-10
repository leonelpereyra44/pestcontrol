-- =====================================================================
-- ESTRUCTURA TABLA PRODUCTOS - VERIFICACIÓN Y CREACIÓN
-- Fecha: 2025-10-10
-- Ejecutar ANTES de migrar-productos-completos.sql
-- =====================================================================

-- PASO 1: Verificar si la tabla productos existe y su estructura
SELECT 
    table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'productos'
ORDER BY ordinal_position;

-- PASO 2: Crear tabla productos si no existe
CREATE TABLE IF NOT EXISTS productos (
    producto_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresa(empresa_id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    tipo_producto VARCHAR(50),  -- ROEDORES, INSECTICIDA, etc.
    principio_activo VARCHAR(255),
    laboratorio VARCHAR(255),
    certificado VARCHAR(255),
    unidad_medida VARCHAR(50) NOT NULL DEFAULT 'unidad',
    stock_actual DECIMAL(10,2) DEFAULT 0,
    stock_minimo DECIMAL(10,2) DEFAULT 0,
    precio_unitario DECIMAL(10,2),
    activo BOOLEAN NOT NULL DEFAULT true,
    notas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraint para evitar duplicados por empresa
    CONSTRAINT uk_productos_empresa_nombre UNIQUE (empresa_id, nombre)
);

-- PASO 3: Crear índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_productos_empresa ON productos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_productos_tipo ON productos(tipo_producto);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);
CREATE INDEX IF NOT EXISTS idx_productos_nombre ON productos(nombre);

-- PASO 4: Agregar comentarios
COMMENT ON TABLE productos IS 'Catálogo de productos para control de plagas';
COMMENT ON COLUMN productos.tipo_producto IS 'Tipo: ROEDORES, INSECTICIDA, etc.';
COMMENT ON COLUMN productos.principio_activo IS 'Componente químico activo';
COMMENT ON COLUMN productos.laboratorio IS 'Fabricante o laboratorio';
COMMENT ON COLUMN productos.certificado IS 'Número de certificado/registro';
COMMENT ON COLUMN productos.activo IS 'Si el producto está disponible para usar';

-- PASO 5: Habilitar RLS (Row Level Security)
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- PASO 6: Crear políticas RLS para productos
-- Política de lectura: usuarios pueden ver productos de su empresa
DROP POLICY IF EXISTS "Usuarios pueden ver productos de su empresa" ON productos;
CREATE POLICY "Usuarios pueden ver productos de su empresa"
ON productos FOR SELECT
USING (
    empresa_id IN (
        SELECT empresa_id FROM worker 
        WHERE worker_id = auth.uid()
    )
);

-- Política de inserción: solo administradores
DROP POLICY IF EXISTS "Solo admins pueden crear productos" ON productos;
CREATE POLICY "Solo admins pueden crear productos"
ON productos FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM worker 
        WHERE worker_id = auth.uid() 
        AND empresa_id = productos.empresa_id
        AND puesto IN ('Administrador', 'Super Admin')
    )
);

-- Política de actualización: solo administradores
DROP POLICY IF EXISTS "Solo admins pueden actualizar productos" ON productos;
CREATE POLICY "Solo admins pueden actualizar productos"
ON productos FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM worker 
        WHERE worker_id = auth.uid() 
        AND empresa_id = productos.empresa_id
        AND puesto IN ('Administrador', 'Super Admin')
    )
);

-- Política de eliminación: solo administradores
DROP POLICY IF EXISTS "Solo admins pueden eliminar productos" ON productos;
CREATE POLICY "Solo admins pueden eliminar productos"
ON productos FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM worker 
        WHERE worker_id = auth.uid() 
        AND empresa_id = productos.empresa_id
        AND puesto IN ('Administrador', 'Super Admin')
    )
);

-- PASO 7: Verificar estructura final
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'productos'
ORDER BY ordinal_position;

-- PASO 8: Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies
WHERE tablename = 'productos';
