# Sistema de Guardado Local con IndexedDB

## 📋 Descripción

Este sistema implementa guardado local de controles de plagas usando **IndexedDB**, permitiendo que los usuarios trabajen offline y continúen controles sin perder datos.

## 🎯 Funcionalidades Principales

### 1. Guardado Local Automático
- Los controles se guardan en IndexedDB en el navegador
- No requiere conexión a internet para trabajar
- Los datos persisten incluso si se cierra el navegador

### 2. Flujo de Trabajo

```
┌─────────────────────────────────────────────────────────────┐
│ Paso 1: Información General                                │
│  • Usuario completa datos básicos del control              │
│  • Presiona "🚀 Comenzar Control"                          │
│  • Se crea registro en IndexedDB                           │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ Pasos 2-4: Productos, Puntos, Observaciones                │
│  • Auto-guardado en IndexedDB al agregar/modificar          │
│  • Los datos se sincronizan automáticamente                 │
│  • Usuario puede cerrar el navegador sin perder datos       │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ Paso 5: Sello                                               │
│  • Usuario presiona "✅ Completar Control"                 │
│  • Datos se suben a Supabase                                │
│  • Borrador se elimina de IndexedDB                         │
│  • Redirige a lista de controles                            │
└─────────────────────────────────────────────────────────────┘
```

### 3. Gestión de Borradores

#### Ver Borradores
- Página dedicada: `controles-borradores.html`
- Muestra todos los controles guardados localmente
- Contador visible en página principal de controles

#### Continuar Borrador
- Click en "▶️ Continuar" carga el control con todos sus datos
- URL: `nuevo-control.html?draft={local_id}`
- Carga automática de productos, puntos y observaciones

#### Eliminar Borrador
- Opción de eliminar borradores no necesarios
- Confirmación antes de eliminar
- Elimina control, productos y puntos asociados

## 🗄️ Estructura de IndexedDB

### Object Stores

#### 1. `controles_draft`
```javascript
{
    local_id: number (auto-increment),
    empresa_id: string,
    cliente_id: string,
    planta_id: string | null,
    tecnico_id: string,
    fecha_control: string,
    tipo_control: string,
    observaciones: string | null,
    estado: 'borrador',
    created_at: string,
    updated_at: string
}
```

#### 2. `productos_draft`
```javascript
{
    id: number (auto-increment),
    local_control_id: number,
    producto_id: string,
    nombre: string,
    cantidad: number,
    unidad: string
}
```

#### 3. `puntos_draft`
```javascript
{
    id: number (auto-increment),
    local_control_id: number,
    numero: number,
    tipo_plaga: string,
    tipo_dispositivo: string | null,
    ubicacion: string | null,
    estado: string,
    accion_realizada: string | null
}
```

## 📁 Archivos Modificados/Creados

### Nuevos Archivos

1. **`js/controles/indexeddb-manager.js`**
   - Manejo completo de IndexedDB
   - CRUD de controles, productos y puntos
   - Sincronización de datos

2. **`pages/controles-borradores.html`**
   - Página de gestión de borradores
   - Lista de controles en progreso
   - Opciones de continuar/eliminar

### Archivos Modificados

1. **`pages/nuevo-control.html`**
   - Paso 1: Botón "Comenzar Control" en lugar de "Siguiente"
   - Paso 5: Botón "Completar Control" en lugar de "Guardar Control"
   - Funciones `agregarProducto()` y `agregarPunto()` ahora guardan en IndexedDB
   - Nueva función `comenzarControl()` crea registro local
   - Nueva función `completarControl()` sube a Supabase y elimina draft
   - Nueva función `cargarControlDraft()` carga desde IndexedDB
   - Detección de modos: `editMode` (Supabase), `draftMode` (IndexedDB)

2. **`pages/controles.html`**
   - Botón "📄 Borradores" con contador
   - Inicialización de IndexedDB
   - Función `actualizarContadorBorradores()`

## 🚀 Uso del Sistema

### Para Usuarios

#### Crear Nuevo Control
1. Click en "➕ Nuevo Control"
2. Completar información básica (Paso 1)
3. Click en "🚀 Comenzar Control"
4. Agregar productos y puntos (se guardan automáticamente)
5. Finalizar con "✅ Completar Control"

#### Continuar Control en Progreso
1. Click en "📄 Borradores (X)" en página de controles
2. Ver lista de controles en progreso
3. Click en "▶️ Continuar" en el control deseado
4. Continuar desde donde quedó

#### Trabajar Offline
- Los controles en progreso se guardan localmente
- Puedes cerrar el navegador sin perder datos
- Al volver, continúa desde donde lo dejaste
- Solo necesitas conexión para completar el control

### Para Desarrolladores

#### Inicializar IndexedDB
```javascript
const dbManager = new IndexedDBManager();
await dbManager.init();
```

#### Guardar Control
```javascript
const localId = await dbManager.guardarControl({
    empresa_id: '...',
    cliente_id: '...',
    // ... más datos
});
```

#### Obtener Control
```javascript
const control = await dbManager.obtenerControl(localId);
```

#### Sincronizar Productos
```javascript
await dbManager.sincronizarProductos(localId, productos);
```

#### Sincronizar Puntos
```javascript
await dbManager.sincronizarPuntos(localId, puntos);
```

#### Eliminar Control Completo
```javascript
await dbManager.eliminarControl(localId);
```

## ⚠️ Consideraciones

### Ventajas
✅ Trabajo offline completo
✅ No se pierden datos si se cierra el navegador
✅ Auto-guardado transparente
✅ Múltiples borradores simultáneos
✅ Sincronización solo al completar

### Limitaciones
⚠️ Los datos están en el navegador local (no sincronizados entre dispositivos)
⚠️ Si se limpia la caché del navegador, se pierden los borradores
⚠️ El sello del técnico se sube al completar (requiere conexión)

### Recomendaciones
💡 Completar los controles lo antes posible
💡 No limpiar la caché del navegador si hay borradores pendientes
💡 Usar siempre el mismo navegador/dispositivo para continuar un control
💡 Verificar conexión antes de "Completar Control"

## 🔐 Seguridad

- Los datos se almacenan solo en el navegador del usuario
- IndexedDB es específica por dominio (no accesible desde otros sitios)
- Los datos solo se suben a Supabase al completar el control
- Se verifica la empresa_id para mostrar solo borradores propios

## 🐛 Debugging

### Ver Borradores en Consola
```javascript
// En la consola del navegador
const db = new IndexedDBManager();
await db.init();
const borradores = await db.obtenerTodosControles();
console.log(borradores);
```

### Ver IndexedDB en DevTools
1. Abrir DevTools (F12)
2. Tab "Application" / "Almacenamiento"
3. Sección "IndexedDB"
4. Expandir "ControlPlagasDB"

### Logs Importantes
```javascript
console.log('✅ Control creado en IndexedDB con ID:', localId);
console.log('✅ Productos guardados en IndexedDB');
console.log('✅ Puntos guardados en IndexedDB');
console.log('✅ Control completado y subido a Supabase');
console.log('✅ Borrador eliminado de IndexedDB');
```

## 📊 Métricas

El sistema registra:
- Número de borradores activos
- Fecha de creación de cada borrador
- Última modificación (updated_at)
- Estado del control (siempre 'borrador' en IndexedDB)

## 🔄 Migración y Actualización

Si se necesita actualizar la estructura de IndexedDB:

1. Incrementar `dbVersion` en `IndexedDBManager`
2. Agregar lógica en `onupgradeneeded`
3. Los usuarios verán la migración automáticamente

```javascript
constructor() {
    this.dbVersion = 2; // Incrementar versión
}
```

## 📝 Notas Adicionales

- El sistema es compatible con el flujo existente de edición de controles
- No interfiere con controles ya completados en Supabase
- Los borradores son independientes de los controles finales
- Se puede tener un control en Supabase y varios borradores simultáneamente

---

**Autor:** Sistema de Control de Plagas
**Fecha:** Octubre 2025
**Versión:** 1.0.0
