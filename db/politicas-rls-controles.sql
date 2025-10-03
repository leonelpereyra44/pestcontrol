-- =====================================================================
-- POLÍTICAS RLS PARA SISTEMA DE CONTROLES
-- =====================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE controles ENABLE ROW LEVEL SECURITY;
ALTER TABLE control_productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE control_puntos ENABLE ROW LEVEL SECURITY;
ALTER TABLE control_fotos ENABLE ROW LEVEL SECURITY;

-- ==================== POLÍTICAS PARA TABLA: controles ====================

-- SELECT: Ver controles de su empresa
CREATE POLICY controles_select_own_company ON controles
    FOR SELECT
    TO authenticated
    USING (empresa_id = get_worker_empresa_id());

-- SELECT: Super admins ven todos
CREATE POLICY super_admin_select_controles ON controles
    FOR SELECT
    TO authenticated
    USING (auth_is_super_admin() = true);

-- INSERT: Crear controles en su empresa
CREATE POLICY controles_insert_own_company ON controles
    FOR INSERT
    TO authenticated
    WITH CHECK (empresa_id = get_worker_empresa_id());

-- UPDATE: Actualizar controles de su empresa
CREATE POLICY controles_update_own_company ON controles
    FOR UPDATE
    TO authenticated
    USING (empresa_id = get_worker_empresa_id())
    WITH CHECK (empresa_id = get_worker_empresa_id());

-- DELETE: Eliminar controles de su empresa (solo admins)
CREATE POLICY controles_delete_own_company ON controles
    FOR DELETE
    TO authenticated
    USING (
        empresa_id = get_worker_empresa_id()
        AND EXISTS (
            SELECT 1 FROM worker
            WHERE worker.user_id = auth.uid()
            AND worker.rol IN ('admin', 'supervisor')
        )
    );

-- ==================== POLÍTICAS PARA TABLA: control_productos ====================

-- SELECT: Ver productos de controles de su empresa
CREATE POLICY control_productos_select ON control_productos
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM controles c
            WHERE c.control_id = control_productos.control_id
            AND c.empresa_id = get_worker_empresa_id()
        )
    );

-- INSERT: Agregar productos a controles de su empresa
CREATE POLICY control_productos_insert ON control_productos
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM controles c
            WHERE c.control_id = control_productos.control_id
            AND c.empresa_id = get_worker_empresa_id()
        )
    );

-- UPDATE: Actualizar productos de controles de su empresa
CREATE POLICY control_productos_update ON control_productos
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM controles c
            WHERE c.control_id = control_productos.control_id
            AND c.empresa_id = get_worker_empresa_id()
        )
    );

-- DELETE: Eliminar productos de controles de su empresa
CREATE POLICY control_productos_delete ON control_productos
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM controles c
            WHERE c.control_id = control_productos.control_id
            AND c.empresa_id = get_worker_empresa_id()
        )
    );

-- ==================== POLÍTICAS PARA TABLA: control_puntos ====================

-- SELECT
CREATE POLICY control_puntos_select ON control_puntos
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM controles c
            WHERE c.control_id = control_puntos.control_id
            AND c.empresa_id = get_worker_empresa_id()
        )
    );

-- INSERT
CREATE POLICY control_puntos_insert ON control_puntos
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM controles c
            WHERE c.control_id = control_puntos.control_id
            AND c.empresa_id = get_worker_empresa_id()
        )
    );

-- UPDATE
CREATE POLICY control_puntos_update ON control_puntos
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM controles c
            WHERE c.control_id = control_puntos.control_id
            AND c.empresa_id = get_worker_empresa_id()
        )
    );

-- DELETE
CREATE POLICY control_puntos_delete ON control_puntos
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM controles c
            WHERE c.control_id = control_puntos.control_id
            AND c.empresa_id = get_worker_empresa_id()
        )
    );

-- ==================== POLÍTICAS PARA TABLA: control_fotos ====================

-- SELECT
CREATE POLICY control_fotos_select ON control_fotos
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM controles c
            WHERE c.control_id = control_fotos.control_id
            AND c.empresa_id = get_worker_empresa_id()
        )
    );

-- INSERT
CREATE POLICY control_fotos_insert ON control_fotos
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM controles c
            WHERE c.control_id = control_fotos.control_id
            AND c.empresa_id = get_worker_empresa_id()
        )
    );

-- DELETE
CREATE POLICY control_fotos_delete ON control_fotos
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM controles c
            WHERE c.control_id = control_fotos.control_id
            AND c.empresa_id = get_worker_empresa_id()
        )
    );

-- Verificar políticas creadas
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('controles', 'control_productos', 'control_puntos', 'control_fotos')
ORDER BY tablename, cmd, policyname;
