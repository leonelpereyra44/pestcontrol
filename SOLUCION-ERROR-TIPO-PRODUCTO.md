# 🔧 SOLUCIÓN: Error "column productos.tipo_producto does not exist"

## Problema
Al ir a `nuevo-control.html` aparece el error:
```
Error en inicialización: column productos.tipo_producto does not exist
code: "42703"
```

## Causa
La tabla `productos` en Supabase no tiene las columnas nuevas que agregamos localmente:
- `tipo_producto`
- `principio_activo`
- `laboratorio`
- `certificado`

## Solución

### Paso 1: Ejecutar Migración SQL
1. Ve a tu proyecto en **Supabase** → **SQL Editor**
2. Copia y pega el contenido del archivo: `db/agregar-columnas-productos-produccion.sql`
3. Haz clic en **RUN** o presiona `Ctrl+Enter`

### Paso 2: Verificar
Deberías ver mensajes como:
```
✅ Columna tipo_producto agregada
✅ Columna principio_activo agregada
✅ Columna laboratorio agregada
✅ Columna certificado agregada
```

### Paso 3: Probar
1. Recarga la página en producción
2. Ve a **Nuevo Control**
3. Debería cargar sin errores

## Código Corregido
También se corrigieron las referencias en el código:
- ✅ `data-loader.js`: Ahora usa `tipo_producto` en lugar de `tipo`
- ✅ `nuevo-control.html`: Actualizado para usar `tipo_producto`
- ✅ Compatibilidad hacia atrás: `tipo_producto || tipo` (fallback)

## Notas
- El script SQL es idempotente (se puede ejecutar múltiples veces sin problemas)
- Migra datos automáticamente si existe columna `tipo` antigua
- No afecta datos existentes
