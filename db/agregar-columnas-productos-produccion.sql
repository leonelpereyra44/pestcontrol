-- =====================================================
-- MIGRACIÓN: Agregar columnas faltantes a tabla productos
-- Fecha: 2025-10-10
-- Ejecutar en: Supabase SQL Editor
-- =====================================================

-- 1. Verificar estructura actual
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'productos'
ORDER BY ordinal_position;

-- 2. Agregar columna tipo_producto si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'productos' AND column_name = 'tipo_producto'
    ) THEN
        ALTER TABLE productos ADD COLUMN tipo_producto VARCHAR(50);
        RAISE NOTICE 'Columna tipo_producto agregada';
    ELSE
        RAISE NOTICE 'Columna tipo_producto ya existe';
    END IF;
END $$;

-- 3. Agregar columna principio_activo si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'productos' AND column_name = 'principio_activo'
    ) THEN
        ALTER TABLE productos ADD COLUMN principio_activo VARCHAR(255);
        RAISE NOTICE 'Columna principio_activo agregada';
    ELSE
        RAISE NOTICE 'Columna principio_activo ya existe';
    END IF;
END $$;

-- 4. Agregar columna laboratorio si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'productos' AND column_name = 'laboratorio'
    ) THEN
        ALTER TABLE productos ADD COLUMN laboratorio VARCHAR(255);
        RAISE NOTICE 'Columna laboratorio agregada';
    ELSE
        RAISE NOTICE 'Columna laboratorio ya existe';
    END IF;
END $$;

-- 5. Agregar columna certificado si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'productos' AND column_name = 'certificado'
    ) THEN
        ALTER TABLE productos ADD COLUMN certificado VARCHAR(255);
        RAISE NOTICE 'Columna certificado agregada';
    ELSE
        RAISE NOTICE 'Columna certificado ya existe';
    END IF;
END $$;

-- 6. Si existe columna 'tipo', migrar datos a tipo_producto
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'productos' AND column_name = 'tipo'
    ) THEN
        UPDATE productos SET tipo_producto = tipo WHERE tipo_producto IS NULL;
        RAISE NOTICE 'Datos migrados de tipo a tipo_producto';
    END IF;
END $$;

-- 7. Verificar resultado final
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'productos'
AND column_name IN ('tipo', 'tipo_producto', 'principio_activo', 'laboratorio', 'certificado')
ORDER BY ordinal_position;

-- 8. Mostrar ejemplo de productos
SELECT 
    producto_id,
    nombre,
    tipo,
    tipo_producto,
    principio_activo,
    laboratorio,
    certificado
FROM productos
LIMIT 3;
