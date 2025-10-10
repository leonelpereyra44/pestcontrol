# 📦 GUÍA: Migración de Productos a Supabase

## 🎯 Objetivo
Migrar todos los productos de tu sistema actual (21 productos) a la base de datos Supabase.

## 📋 Productos a Migrar
- **7 Roedores**: GLEXRAT GRANO, PANIC ALMENDRA BLOQUE, HUAGRO RAT PELLETS, etc.
- **14 Insecticidas**: PERFENO, PROTEGINAL, CHEMONIL, K-OBIOL, etc.

---

## 🚀 PASOS PARA EJECUTAR

### **Paso 1: Ejecutar Migración de Columnas** (Si aún no lo hiciste)
1. Abre **Supabase** → **SQL Editor**
2. Ejecuta: `db/agregar-columnas-productos-produccion.sql`
3. Verifica que aparezcan las columnas: `tipo_producto`, `principio_activo`, `laboratorio`, `certificado`

### **Paso 2: Verificar/Crear Estructura de Tabla Productos**
1. En **Supabase** → **SQL Editor**
2. Ejecuta: `db/crear-tabla-productos.sql`
3. Esto:
   - ✅ Crea la tabla `productos` si no existe
   - ✅ Agrega columnas necesarias
   - ✅ Crea índices para optimizar
   - ✅ Configura políticas RLS (seguridad)
   - ✅ Evita duplicados con constraint UNIQUE

### **Paso 3: Migrar Productos**
1. En **Supabase** → **SQL Editor**
2. Ejecuta: `db/migrar-productos-completos.sql`
3. El script:
   - 🔍 Busca automáticamente tu empresa "San Agustin"
   - ➕ Inserta los 21 productos
   - ⚠️ No duplica (usa `ON CONFLICT DO NOTHING`)
   - ✅ Muestra resultado al final

### **Paso 4: Verificar Resultado**
Deberías ver:
```
NOTICE: Empresa encontrada: [UUID]
NOTICE: Productos insertados correctamente

Tabla de productos (21 filas):
- GLEXRAT GRANO | ROEDORES | BROMADIOLONE | ...
- PANIC ALMENDRA BLOQUE | ROEDORES | ...
- PERFENO | INSECTICIDA | Propoxur 20 % | ...
...

Resumen por tipo:
INSECTICIDA: 14
ROEDORES: 7
```

---

## 📊 MAPEO DE CAMPOS

| Campo Original | Campo Supabase | Ejemplo |
|----------------|----------------|---------|
| Nombre | `nombre` | "GLEXRAT GRANO" |
| Tipo | `tipo_producto` | "ROEDORES" |
| Principio Activo | `principio_activo` | "BROMADIOLONE" |
| Laboratorio | `laboratorio` | "GLEBA S.A" |
| Certificado | `certificado` | "C.S-872 / C.A- 0250003" |
| - | `unidad_medida` | "kg", "litro", "unidad" |
| - | `activo` | true |

---

## ⚠️ NOTAS IMPORTANTES

### **Si el script falla con "empresa no encontrada":**
1. Primero ejecuta:
```sql
SELECT empresa_id, nombre FROM empresa;
```
2. Copia el `empresa_id` de tu empresa
3. Reemplaza en el script `migrar-productos-completos.sql` la línea:
```sql
WHERE nombre ILIKE '%san agustin%'
```
Por:
```sql
WHERE empresa_id = 'TU-UUID-AQUI'
```

### **Campos con valores especiales:**
- `***` → Se inserta como está (ej: TRAMPAS MECANICAS)
- `NULL` o `EMPTY` → Se inserta como NULL
- Unidades sugeridas: 
  - Roedores: `kg` o `unidad`
  - Insecticidas: `litro` o `kg`

### **Seguridad RLS:**
- Solo usuarios de tu empresa verán estos productos
- Solo Administradores pueden agregar/editar/eliminar
- Los técnicos solo pueden ver y usar

---

## ✅ DESPUÉS DE MIGRAR

1. **Verifica en la app:**
   - Ve a **Productos** en tu sistema
   - Deberías ver los 21 productos listados
   - Prueba filtrar por tipo (ROEDORES, INSECTICIDA)

2. **Prueba en Nuevo Control:**
   - Ve a **Nuevo Control**
   - En "Agregar Producto" deberías ver todos listados
   - Formato: "GLEXRAT GRANO (ROEDORES)"

3. **Edita si es necesario:**
   - Puedes editar stocks, precios, etc. desde la página de Productos
   - O directamente en Supabase → Table Editor

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "duplicate key value violates unique constraint"
- **Causa:** El producto ya existe
- **Solución:** Ya está migrado, no hay problema

### Error: "relation productos does not exist"
- **Causa:** La tabla no está creada
- **Solución:** Ejecuta primero `crear-tabla-productos.sql`

### Error: "column tipo_producto does not exist"
- **Causa:** Falta ejecutar migración de columnas
- **Solución:** Ejecuta `agregar-columnas-productos-produccion.sql`

---

## 📞 SOPORTE
Si tienes problemas, verifica:
1. ✅ Conexión a Supabase activa
2. ✅ Tabla `empresa` existe y tiene tu empresa
3. ✅ Eres administrador de la empresa
4. ✅ Scripts ejecutados en orden correcto
