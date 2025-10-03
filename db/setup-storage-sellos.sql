-- =====================================================================
-- CONFIGURACIÓN DE STORAGE PARA SELLOS DE TÉCNICOS
-- =====================================================================

-- 1. Crear bucket para sellos de técnicos
INSERT INTO storage.buckets (id, name, public)
VALUES ('sello', 'sello', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Política para permitir que los usuarios vean todos los sellos (público)
CREATE POLICY "Sellos públicos - SELECT" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'sello');

-- 3. Política para que solo el dueño pueda subir/actualizar su sello
CREATE POLICY "Solo dueño puede subir sello" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'sello' AND
        (storage.foldername(name))[1] IN (
            SELECT worker_id::text FROM worker WHERE user_id = auth.uid()
        )
    );

-- 4. Política para actualizar su propio sello
CREATE POLICY "Solo dueño puede actualizar sello" ON storage.objects
    FOR UPDATE TO authenticated
    USING (
        bucket_id = 'sello' AND
        (storage.foldername(name))[1] IN (
            SELECT worker_id::text FROM worker WHERE user_id = auth.uid()
        )
    );

-- 5. Política para eliminar su propio sello
CREATE POLICY "Solo dueño puede eliminar sello" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'sello' AND
        (storage.foldername(name))[1] IN (
            SELECT worker_id::text FROM worker WHERE user_id = auth.uid()
        )
    );

-- 6. Agregar columna para URL del sello en la tabla worker (si no existe)
ALTER TABLE worker ADD COLUMN IF NOT EXISTS sello_url TEXT;

-- 7. Comentarios para documentación
COMMENT ON TABLE storage.buckets IS 'Bucket para almacenar sellos de técnicos';
COMMENT ON COLUMN worker.sello_url IS 'URL del sello del técnico almacenado en storage';

-- =====================================================================
-- INSTRUCCIONES DE USO:
-- =====================================================================

-- Para subir un sello, la ruta debe ser:
-- {worker_id}/sello.png (o cualquier nombre de archivo válido)

-- Ejemplo de URL pública:
-- https://{project}.supabase.co/storage/v1/object/public/sello/{worker_id}/sello.png

-- =====================================================================