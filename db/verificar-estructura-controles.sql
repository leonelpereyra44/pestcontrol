-- Verificar la estructura actual de la tabla controles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'controles'
ORDER BY ordinal_position;

-- Ver si existe la tabla control_puntos
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('control_puntos', 'control_fotos', 'control_productos')
AND table_schema = 'public';
