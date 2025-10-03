# 📦 Gestión de Inventario - Sistema de Control de Plagas

## 📋 Descripción

Módulo completo para gestionar el inventario de productos utilizados en las operaciones de control de plagas. Incluye productos químicos, herramientas, trampas y equipos.

---

## ✨ Características Principales

### 1. **Dashboard de Estadísticas**
- 📊 Productos con bajo stock (alertas automáticas)
- 📋 Total de productos en inventario
- 💰 Valor estimado del inventario

### 2. **Gestión de Productos**
- ➕ Crear nuevos productos
- ✏️ Editar productos existentes
- 🗑️ Eliminar productos (soft delete)
- 🔍 Búsqueda y filtros avanzados

### 3. **Control de Stock**
- Nivel de alerta configurable
- Indicadores visuales de bajo stock
- Badges de colores según estado

### 4. **Multi-Tenant**
- Productos globales (disponibles para todas las empresas)
- Productos específicos por empresa
- Aislamiento total de datos

---

## 🗄️ Estructura de Base de Datos

### Tabla: `productos`

```sql
CREATE TABLE productos (
  producto_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT NOT NULL, -- 'Químico', 'Herramienta', 'Trampa', 'Equipo', 'Otro'
  unidad_medida TEXT NOT NULL, -- 'Litros', 'Kilogramos', 'Unidades', etc.
  cantidad_actual NUMERIC DEFAULT 0,
  nivel_alerta NUMERIC DEFAULT 10,
  precio_unitario NUMERIC DEFAULT 0,
  empresa_id UUID REFERENCES empresa(empresa_id),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Campos:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `producto_id` | UUID | Identificador único del producto |
| `nombre` | TEXT | Nombre del producto |
| `descripcion` | TEXT | Descripción detallada |
| `tipo` | TEXT | Tipo de producto (Químico, Herramienta, etc.) |
| `unidad_medida` | TEXT | Unidad (Litros, Kg, Unidades, etc.) |
| `cantidad_actual` | NUMERIC | Stock actual |
| `nivel_alerta` | NUMERIC | Nivel mínimo antes de alerta |
| `precio_unitario` | NUMERIC | Precio por unidad (opcional) |
| `empresa_id` | UUID | Empresa dueña (NULL = global) |
| `activo` | BOOLEAN | Producto activo/inactivo |

---

## 🚀 Cómo Usar

### 1️⃣ Acceder al Módulo

Desde el dashboard, haz clic en:
```
📦 Productos → Gestionar Inventario
```

### 2️⃣ Ver Inventario

La página principal muestra:
- **Estadísticas**: Resumen de bajo stock, total y valor
- **Filtros**: Buscar por nombre, filtrar por tipo o stock
- **Tabla**: Lista completa de productos

### 3️⃣ Añadir Producto

1. Clic en **"➕ Añadir Producto"**
2. Llenar formulario:
   - Nombre del producto *
   - Tipo (seleccionar) *
   - Descripción (opcional)
   - Cantidad actual *
   - Unidad de medida *
   - Nivel de alerta *
   - Precio unitario (opcional)
3. Clic en **"Guardar Producto"**

### 4️⃣ Editar Producto

1. En la tabla, clic en **✏️** (Editar)
2. Modificar campos necesarios
3. Clic en **"Actualizar Producto"**

### 5️⃣ Eliminar Producto

1. En la tabla, clic en **🗑️** (Eliminar)
2. Confirmar eliminación
3. El producto se marca como inactivo (soft delete)

### 6️⃣ Exportar Datos

- Clic en **"⬇️ Exportar a CSV"**
- Se descarga archivo con todos los productos

---

## 🎨 Interfaz

### Dashboard

```
┌─────────────────────────────────────────────┐
│ 📦 Gestión de Inventario                    │
│         [⬇️ CSV] [➕ Añadir] [← Dashboard] │
├─────────────────────────────────────────────┤
│ ⚠️ Bajo Stock    📋 Total      💰 Valor    │
│     5              87          $12,500      │
├─────────────────────────────────────────────┤
│ 🔍 Buscar...  [Tipo ▼]  [Stock ▼]         │
├─────────────────────────────────────────────┤
│ Tabla de productos...                       │
└─────────────────────────────────────────────┘
```

### Tabla

```
☑ | NOMBRE            | TIPO      | CANT | UNIDAD | ALERTA | ACCIONES
──┼───────────────────┼───────────┼──────┼────────┼────────┼──────────
☐ | Insecticida X     | Químico   | 10   | Litros | 15     | ✏️ 🔄 🗑️
☐ | Rodenticida       | Químico   | 50   | Unid.  | 20     | ✏️ 🔄 🗑️
☐ | Pulverizador 5L   | Herram.   | 2    | Unid.  | 5      | ✏️ 🔄 🗑️
```

---

## 🎯 Tipos de Productos

### Químico
- Insecticidas
- Rodenticidas
- Larvicidas
- Repelentes
- Desinfectantes

**Badge**: 🔵 Azul

### Herramienta
- Pulverizadores
- Nebulizadores
- Equipos de aplicación
- Herramientas manuales

**Badge**: 🟣 Púrpura

### Trampa
- Trampas mecánicas
- Trampas de luz UV
- Estaciones de cebo
- Trampas adhesivas

**Badge**: 🟠 Naranja

### Equipo
- EPP (Equipo de protección)
- Equipos de seguridad
- Dispositivos especializados

**Badge**: 🟢 Verde

---

## 🔔 Alertas de Stock

### Bajo Stock

Un producto entra en **bajo stock** cuando:
```
cantidad_actual <= nivel_alerta
```

**Indicadores visuales:**
- ⚠️ Badge amarillo en cantidad
- Texto rojo en la fila
- Contador en dashboard

**Ejemplo:**
```
Producto: Insecticida X
Cantidad actual: 10 litros
Nivel de alerta: 15 litros
Estado: ⚠️ BAJO STOCK
```

### Stock Normal

```
cantidad_actual > nivel_alerta
```

**Indicadores:**
- ✅ Badge verde en cantidad
- Texto normal

---

## 💰 Cálculo de Valor

El **Valor Estimado del Inventario** se calcula:

```javascript
valorTotal = Σ(cantidad_actual × precio_unitario)
```

**Ejemplo:**
```
Producto A: 10 litros × $120.50 = $1,205.00
Producto B: 50 unid. × $85.00  = $4,250.00
Producto C: 2 unid.  × $450.00 = $900.00
                        TOTAL = $6,355.00
```

---

## 🔍 Búsqueda y Filtros

### Búsqueda por Texto
- Busca en: nombre y descripción
- Case-insensitive
- Tiempo real (mientras escribes)

### Filtro por Tipo
- Químico
- Herramienta
- Trampa
- Equipo
- Otro

### Filtro por Stock
- **Bajo stock**: cantidad ≤ nivel_alerta
- **Stock normal**: cantidad > nivel_alerta && cantidad ≤ nivel_alerta × 2
- **Stock alto**: cantidad > nivel_alerta × 2

---

## 🔒 Seguridad y Permisos

### RLS (Row Level Security)

**SELECT** - Ver productos:
```sql
-- Workers pueden ver:
-- 1. Productos globales (empresa_id IS NULL)
-- 2. Productos de su empresa
WHERE activo = true AND (
  empresa_id IS NULL OR 
  empresa_id IN (SELECT empresa_id FROM worker WHERE user_id = auth.uid())
)
```

**INSERT** - Crear productos:
```sql
-- Solo Admin y Supervisor pueden crear
-- Los productos se crean para su empresa
WITH CHECK (
  empresa_id IN (
    SELECT empresa_id FROM worker 
    WHERE user_id = auth.uid() 
      AND rol IN ('admin', 'supervisor')
  )
)
```

**UPDATE** - Actualizar productos:
```sql
-- Solo Admin y Supervisor de la misma empresa
USING (
  empresa_id IN (
    SELECT empresa_id FROM worker 
    WHERE user_id = auth.uid() 
      AND rol IN ('admin', 'supervisor')
  )
)
```

**DELETE** - Eliminar productos:
```sql
-- Solo Admin
-- Soft delete (activo = false)
USING (
  empresa_id IN (
    SELECT empresa_id FROM worker 
    WHERE user_id = auth.uid() 
      AND rol = 'admin'
  )
)
```

---

## 📊 Vistas de Base de Datos

### `productos_bajo_stock`

Lista productos que requieren atención:

```sql
SELECT * FROM productos_bajo_stock;
```

**Retorna:**
- producto_id
- nombre
- tipo
- cantidad_actual
- nivel_alerta
- unidad_medida
- empresa_nombre
- unidades_faltantes

### `valor_inventario_empresa`

Resumen de valor por empresa:

```sql
SELECT * FROM valor_inventario_empresa;
```

**Retorna:**
- empresa_id
- total_productos
- valor_total
- productos_bajo_stock

---

## 🔄 Historial de Movimientos

### Próximamente

Función de historial que registrará:
- Entradas de stock
- Salidas (uso en controles)
- Ajustes manuales
- Quién realizó el cambio
- Fecha y hora

**Tabla futura:**
```sql
CREATE TABLE producto_movimientos (
  movimiento_id UUID PRIMARY KEY,
  producto_id UUID REFERENCES productos(producto_id),
  tipo_movimiento TEXT, -- 'entrada', 'salida', 'ajuste'
  cantidad NUMERIC,
  cantidad_anterior NUMERIC,
  cantidad_nueva NUMERIC,
  motivo TEXT,
  worker_id UUID REFERENCES worker(worker_id),
  control_id UUID REFERENCES controles(control_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 📤 Exportación CSV

El archivo CSV exportado incluye:

```csv
Nombre,Tipo,Cantidad,Unidad,Nivel Alerta,Precio,Valor Total
"Insecticida X",Químico,10,Litros,15,120.50,1205.00
"Rodenticida",Químico,50,Unidades,20,85.00,4250.00
```

**Formato:**
- UTF-8
- Separador: coma (,)
- Campos con comillas si contienen caracteres especiales

---

## 🐛 Solución de Problemas

### No veo productos globales
**Causa**: RLS bloqueando productos con empresa_id NULL
**Solución**: Verificar política SELECT en la tabla

### No puedo crear productos
**Causa**: No eres admin o supervisor
**Solución**: Pedir a un admin que cambie tu rol

### El valor del inventario es $0
**Causa**: Los productos no tienen precio_unitario
**Solución**: Editar productos y agregar precio

### Bajo stock no actualiza
**Causa**: Cache del navegador
**Solución**: Recargar página (Ctrl + Shift + R)

---

## ✅ Checklist de Setup

- [ ] Ejecutar `db/productos-schema-update.sql` en Supabase
- [ ] Verificar que productos table existe
- [ ] Confirmar políticas RLS activas
- [ ] Insertar productos de ejemplo (opcional)
- [ ] Probar desde dashboard → Productos
- [ ] Crear un producto de prueba
- [ ] Verificar filtros y búsqueda
- [ ] Exportar CSV para validar

---

## 🎯 Próximos Pasos

1. **Integración con Controles**: Vincular productos usados en cada control
2. **Historial de Movimientos**: Registrar entradas/salidas
3. **Alertas Automáticas**: Notificar cuando hay bajo stock
4. **Código de Barras**: Escanear productos con QR
5. **Proveedores**: Gestionar proveedores de productos
6. **Órdenes de Compra**: Generar órdenes cuando hay bajo stock

---

**Fecha de creación**: 2 de octubre de 2025  
**Versión**: 1.0  
**Autor**: Sistema PCP
