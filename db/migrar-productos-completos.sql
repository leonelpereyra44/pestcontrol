-- =====================================================================
-- MIGRACIÓN DE PRODUCTOS - SAN AGUSTIN
-- Fecha: 2025-10-10
-- Descripción: Migrar productos existentes a Supabase
-- =====================================================================

-- PASO 1: Asegurar que la tabla tiene todas las columnas necesarias
-- (Ejecutar primero agregar-columnas-productos-produccion.sql si aún no lo hiciste)

-- PASO 2: Obtener el empresa_id de SAN AGUSTIN
-- Reemplaza 'TU_EMPRESA_ID' con el UUID real de tu empresa
-- Para obtenerlo: SELECT empresa_id, nombre FROM empresa WHERE nombre ILIKE '%san agustin%';

DO $$ 
DECLARE
    v_empresa_id UUID;
BEGIN
    -- Buscar empresa San Agustin
    SELECT empresa_id INTO v_empresa_id 
    FROM empresa 
    WHERE nombre ILIKE '%san agustin%' 
    LIMIT 1;
    
    IF v_empresa_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró empresa San Agustin. Verifica el nombre en la tabla empresa.';
    END IF;
    
    RAISE NOTICE 'Empresa encontrada: %', v_empresa_id;
    
    -- PASO 3: Insertar productos (solo si no existen)
    -- Usamos ON CONFLICT DO NOTHING para evitar duplicados
    
    -- ROEDORES
    INSERT INTO productos (empresa_id, nombre, tipo_producto, principio_activo, laboratorio, certificado, unidad_medida, activo)
    VALUES 
        (v_empresa_id, 'GLEXRAT GRANO', 'ROEDORES', 'BROMADIOLONE', 'GLEBA S.A', 'C.S-872 / C.A- 0250003', 'kg', true),
        (v_empresa_id, 'PANIC ALMENDRA BLOQUE', 'ROEDORES', 'BRODIFACOUM', 'PANIC', 'C.S- 2334 / C.A-0250019', 'unidad', true),
        (v_empresa_id, 'HUAGRO RAT PELLETS', 'ROEDORES', 'BROMADIOLONE', 'HUAGRO', 'C.A-0250003', 'kg', true),
        (v_empresa_id, 'PEGARAT PARA RATAS', 'ROEDORES', 'PEGAMENTO (No Toxico)', 'SUPRABOND', NULL, 'unidad', true),
        (v_empresa_id, 'ROETRAP', 'ROEDORES', 'PEGAMENTO', 'ECO-WORLD', NULL, 'unidad', true),
        (v_empresa_id, 'Podilcebo', 'ROEDORES', 'Brodifacoum', 'Podil S.A', 'M.S.PCIA Bs As092579', 'kg', true),
        (v_empresa_id, 'TRAMPAS MECANICAS', 'ROEDORES', '***', '***', '***', 'unidad', true)
    ON CONFLICT (empresa_id, nombre) DO NOTHING;
    
    -- INSECTICIDAS
    INSERT INTO productos (empresa_id, nombre, tipo_producto, principio_activo, laboratorio, certificado, unidad_medida, activo)
    VALUES 
        (v_empresa_id, 'PERFENO', 'INSECTICIDA', 'Propoxur 20 %', 'CHEMOTECNICA', 'C.A-0250030', 'litro', true),
        (v_empresa_id, 'PROTEGINAL', 'INSECTICIDA', 'Cipermetrina 20 % emul', 'CHEMOTECNICA', 'C.S- 375 / C.A- 0250010', 'litro', true),
        (v_empresa_id, 'CHEMONIL', 'INSECTICIDA', 'Fipronil 2 %', 'CHEMOTECNICA', 'C.A-0250103', 'litro', true),
        (v_empresa_id, 'DEMOLEDOR', 'INSECTICIDA', 'Betacipermetrina + Lufenuron', 'CHEMOTECNICA', 'C.S-3250 / C.A-0250101', 'litro', true),
        (v_empresa_id, 'ASI-NET', 'INSECTICIDA', 'CIPERMETRINA 5% + BUTOXIDO DE PIPERONILO 20%', 'CHEMOTECNICA', 'C-2907', 'litro', true),
        (v_empresa_id, 'DEPE', 'INSECTICIDA', 'Permetrina 10 % (80% Hcja)', 'CHEMOTECNICA', 'C.A-0250082', 'litro', true),
        (v_empresa_id, 'K-OBIOL', 'INSECTICIDA', 'DELTAMETRINA 2,5G/100ML', 'BAYER, ENVU', 'C.S- 30.997', 'litro', true),
        (v_empresa_id, 'FENDONA 6 SC', 'INSECTICIDA', 'ALFA-CIPERMETRINA 6%', 'BAYER, ENVU', 'C.S-0566 / C.A-0270002', 'litro', true),
        (v_empresa_id, 'Formidor® CEBO', 'INSECTICIDA', 'FIPRONIL 0,003%', 'BAYER, ENVU', 'C.S-00284', 'kg', true),
        (v_empresa_id, 'GELTEK HORMIGAS', 'INSECTICIDA', 'Imidacloprid 2,15 %', 'GELTEK', NULL, 'unidad', true),
        (v_empresa_id, 'DAST POLVO', 'INSECTICIDA', 'Deltametrina 0,2 %', 'GLEBA S.A', 'C.S- 0250016 /C.A- 0250016', 'kg', true),
        (v_empresa_id, 'FLY HUNT-ATRAP. MOSCAS', 'INSECTICIDA', 'ECOLOGICO- NO TOXICO', 'FLY HUNT', NULL, 'unidad', true),
        (v_empresa_id, 'ULTRA HA', 'INSECTICIDA', 'ACIDO GLICOLICO 4% - NITRATO DE AMONIO 20%', 'KERSIA', 'CS:C- 3237', 'litro', true),
        (v_empresa_id, 'BOLATTE', 'INSECTICIDA', 'Beta-Cipermetrina 5 grs', 'CHEMOTECNICA', 'C.A 0250014- CS C-2039', 'litro', true)
    ON CONFLICT (empresa_id, nombre) DO NOTHING;
    
    RAISE NOTICE 'Productos insertados correctamente';
    
END $$;

-- PASO 4: Verificar productos insertados
SELECT 
    nombre,
    tipo_producto,
    principio_activo,
    laboratorio,
    certificado,
    unidad_medida,
    activo
FROM productos
WHERE empresa_id IN (SELECT empresa_id FROM empresa WHERE nombre ILIKE '%san agustin%')
ORDER BY tipo_producto, nombre;

-- PASO 5: Contar productos por tipo
SELECT 
    tipo_producto,
    COUNT(*) as total
FROM productos
WHERE empresa_id IN (SELECT empresa_id FROM empresa WHERE nombre ILIKE '%san agustin%')
GROUP BY tipo_producto
ORDER BY tipo_producto;
