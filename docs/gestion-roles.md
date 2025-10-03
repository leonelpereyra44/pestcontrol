# 👥 Gestión de Roles de Trabajadores

## 📋 Descripción

El administrador y supervisores pueden cambiar los roles de los trabajadores de su empresa directamente desde la página **Información de Empresa**.

---

## 🎯 Roles Disponibles

### 🔴 Admin
- Acceso total al sistema
- Puede gestionar empresa, trabajadores, clientes, plantas
- Puede cambiar roles de otros trabajadores
- Puede gestionar documentos (logos, sellos, firmas)
- Color: Rojo (#e74c3c)

### 🟠 Supervisor
- Acceso intermedio
- Puede ver y gestionar la mayoría de módulos
- Puede cambiar roles de operadores
- Puede gestionar documentos
- Color: Naranja (#f39c12)

### 🔵 Operador
- Acceso básico
- Puede realizar controles/inspecciones
- Puede ver clientes y plantas asignadas
- No puede cambiar configuraciones
- Color: Azul (#3498db)

---

## ✅ Cómo Cambiar el Rol de un Trabajador

### Paso 1: Acceder a Información de Empresa
1. Inicia sesión como **Admin** o **Supervisor**
2. En el dashboard, haz clic en **"Información de Empresa"**

### Paso 2: Encontrar al Trabajador
En la sección **"✍️ Firmas y Sellos de Trabajadores"**, verás una lista de todos los trabajadores de tu empresa con sus tarjetas.

### Paso 3: Cambiar el Rol
1. En la parte superior derecha de cada tarjeta hay un selector de **"Rol"**
2. Haz clic en el selector
3. Selecciona el nuevo rol:
   - **Operador** - Acceso básico
   - **Supervisor** - Acceso intermedio
   - **Admin** - Acceso total
4. Aparecerá un mensaje de confirmación
5. Haz clic en **"Aceptar"**
6. ✅ El rol se actualiza inmediatamente

---

## 🔒 Permisos

### ¿Quién puede cambiar roles?
- ✅ **Admin** - Puede cambiar el rol de cualquier trabajador
- ✅ **Supervisor** - Puede cambiar el rol de cualquier trabajador
- ❌ **Operador** - No puede cambiar roles (el selector aparece deshabilitado)

### Restricciones
- No puedes cambiar tu propio rol
- Los cambios se aplican inmediatamente
- El trabajador verá los cambios la próxima vez que inicie sesión o recargue la página

---

## 🎨 Interfaz

El selector de rol aparece en cada tarjeta de trabajador:

```
┌─────────────────────────────────────────┐
│ Juan Pérez                    Rol: [▼]  │
│ juan@ejemplo.com • Técnico              │
├─────────────────────────────────────────┤
│ [Firma] [Sello]                         │
└─────────────────────────────────────────┘
```

### Estados del Selector

**Habilitado** (Admin/Supervisor):
- Border azul al hacer hover
- Fondo blanco
- Cursor pointer
- Colores por rol en las opciones

**Deshabilitado** (Operador):
- Fondo gris claro
- Cursor not-allowed
- Opacidad reducida

---

## 🔍 Casos de Uso

### Caso 1: Promover a Supervisor
Un operador ha demostrado liderazgo y quieres darle más acceso:
1. Encuentra su tarjeta
2. Cambia de **"operador"** → **"supervisor"**
3. Confirma
4. Ahora puede gestionar otros trabajadores

### Caso 2: Nuevo Admin
El dueño de la empresa quiere dar acceso total a un gerente:
1. Encuentra su tarjeta
2. Cambia a **"admin"**
3. Confirma
4. Ahora tiene acceso completo al sistema

### Caso 3: Reducir Permisos
Un supervisor ya no necesita ese nivel de acceso:
1. Encuentra su tarjeta
2. Cambia de **"supervisor"** → **"operador"**
3. Confirma
4. Sus permisos se reducen inmediatamente

---

## 🐛 Solución de Problemas

### El selector está deshabilitado
- **Causa**: No eres admin ni supervisor
- **Solución**: Pide a un admin que cambie tu rol

### El cambio no se guardó
- **Causa**: Error de conexión o permisos de base de datos
- **Solución**: Verifica tu conexión y vuelve a intentar

### No veo la sección de trabajadores
- **Causa**: No eres admin ni supervisor
- **Solución**: Solo admin y supervisor pueden acceder a esta página

---

## 📊 Base de Datos

El rol se guarda en la tabla `worker`:

```sql
-- Ver roles de todos los trabajadores
SELECT 
  worker_id,
  nombre,
  apellido,
  mail,
  rol,
  empresa_id
FROM worker
WHERE empresa_id = 'tu-empresa-id'
ORDER BY nombre;

-- Cambiar rol manualmente (si es necesario)
UPDATE worker
SET rol = 'admin'
WHERE worker_id = 'worker-id-aqui';
```

---

## ✅ Checklist de Verificación

- [ ] Puedo ver el selector de rol en cada tarjeta de trabajador
- [ ] Al hacer clic en el selector, veo las 3 opciones (operador, supervisor, admin)
- [ ] Al cambiar un rol, aparece el mensaje de confirmación
- [ ] Después de confirmar, el rol se actualiza correctamente
- [ ] El trabajador ve sus nuevos permisos al recargar
- [ ] Los operadores ven el selector deshabilitado

---

## 🎯 Próximos Pasos

Ahora que la gestión de documentos y roles está completa, podemos avanzar con:
1. **Módulo de Controles** - Registrar inspecciones de plagas
2. **Generación de PDF** - Incluir firmas y sellos en los reportes
3. **Asignación de Trabajadores** - Asignar operadores a controles específicos

---

**Fecha de actualización**: 2 de octubre de 2025
