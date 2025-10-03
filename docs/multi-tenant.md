# Sistema Multi-Tenant - Plagas V3

## 🏢 Descripción General

Este sistema implementa un modelo multi-tenant donde cada empresa tiene sus propios datos aislados. Los usuarios (workers) solo pueden acceder a los datos de su empresa correspondiente.

## 🗄️ Estructura de Base de Datos

### Tablas Principales:
- **empresa**: Datos de las empresas
- **worker**: Trabajadores asociados a empresas
- **clientes**: Clientes de cada empresa
- **plantas**: Plantas/ubicaciones de los clientes
- **controles**: Controles de plagas realizados
- **control_productos**: Productos utilizados en cada control
- **productos**: Catálogo de productos disponibles

### Relaciones Clave:
```
empresa (1) -> (N) worker
worker (1) -> (N) controles
clientes (1) -> (N) plantas
plantas (1) -> (N) controles
controles (1) -> (N) control_productos
productos (1) -> (N) control_productos
```

## 🔐 Seguridad Multi-Tenant

### Row Level Security (RLS)
Se implementó RLS en todas las tablas para asegurar que cada usuario solo acceda a los datos de su empresa.

### Políticas Implementadas:
1. **Workers**: Solo pueden ver y editar su propio registro
2. **Empresas**: Los workers solo ven su empresa
3. **Clientes/Plantas/Controles**: Filtrados por empresa del worker
4. **Productos**: Acceso global (configurable por empresa si se requiere)

## 🚀 Funcionalidades Implementadas

### Autenticación
- ✅ Registro con selección de empresa
- ✅ Login con validación
- ✅ Creación automática de worker al registrarse
- ✅ Gestión de sesiones

### Multi-Tenancy
- ✅ Aislamiento de datos por empresa
- ✅ Políticas RLS configuradas
- ✅ Funciones auxiliares para operaciones
- ✅ Dashboard específico por empresa

### Gestión de Datos
- ✅ CRUD de clientes (ejemplo implementado)
- 🔄 CRUD de plantas (estructura lista)
- 🔄 CRUD de controles (estructura lista)
- 🔄 Gestión de productos (estructura lista)

## 📋 Pasos para Configurar

### 1. Configurar Base de Datos
```sql
-- Ejecutar en Supabase SQL Editor
-- Ver archivo: db/rls-setup.sql
```

### 2. Crear Empresas de Prueba
```sql
INSERT INTO empresa (nombre) VALUES 
('Fumigaciones ABC'),
('Control Plagas XYZ'),
('Servicios Sanitarios 123');
```

### 3. Probar el Sistema
1. Registrar usuario nuevo
2. Seleccionar empresa
3. Verificar que se cree el worker
4. Probar acceso restringido

## 🛠️ Uso del Sistema

### Para Desarrolladores

#### Obtener información del worker actual:
```javascript
const workerInfo = await window.authUtils.getWorkerProfile()
console.log(workerInfo.empresa.nombre) // Nombre de la empresa
```

#### Obtener datos filtrados por empresa:
```javascript
const clientes = await window.multiTenant.getClients()
const plantas = await window.multiTenant.getPlantas()
const controles = await window.multiTenant.getControles()
```

#### Crear nuevos registros:
```javascript
const result = await window.multiTenant.createClient({
  nombre: 'Cliente Nuevo',
  mail: 'cliente@email.com',
  telefono: '123456789'
})
```

#### Verificar acceso a empresa:
```javascript
const hasAccess = await window.multiTenant.verifyAccess(empresaId)
```

### Para Usuarios Finales

#### Registro:
1. Ir a `/pages/register.html`
2. Completar datos personales
3. Seleccionar empresa
4. Confirmar email
5. Iniciar sesión

#### Dashboard:
- Información personalizada por empresa
- Estadísticas específicas
- Acceso a funcionalidades restringidas

## 🔧 Configuración Avanzada

### Personalización por Empresa

#### 1. Agregar campos específicos:
```sql
ALTER TABLE empresa ADD COLUMN configuracion JSONB;
```

#### 2. Configurar límites por empresa:
```sql
ALTER TABLE empresa ADD COLUMN max_usuarios INTEGER DEFAULT 10;
ALTER TABLE empresa ADD COLUMN max_clientes INTEGER DEFAULT 100;
```

#### 3. Implementar validaciones:
```javascript
// En el código de registro
const empresa = await getEmpresaConfig(empresaId)
if (empresa.usuarios_actuales >= empresa.max_usuarios) {
  throw new Error('Límite de usuarios alcanzado')
}
```

### Roles y Permisos

#### 1. Agregar roles a workers:
```sql
ALTER TABLE worker ADD COLUMN rol VARCHAR(50) DEFAULT 'operador';
-- Roles: 'admin', 'supervisor', 'operador'
```

#### 2. Políticas basadas en roles:
```sql
CREATE POLICY "Admins can manage all company data" ON clientes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM worker 
      WHERE worker_id = auth.uid() 
      AND rol = 'admin'
      AND empresa_id = get_client_empresa_id(clientes.cliente_id)
    )
  );
```

## 📊 Monitoreo y Analytics

### Métricas por Empresa:
```javascript
const stats = await window.multiTenant.getStats()
console.log({
  totalClientes: stats.totalClientes,
  controlesEsteMes: stats.controlesEsteMes,
  tendencias: stats.tendencias
})
```

### Auditoria:
```sql
-- Crear tabla de auditoria
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES worker(worker_id),
  accion VARCHAR(100),
  tabla VARCHAR(50),
  datos JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

## 🚨 Troubleshooting

### Problemas Comunes:

#### 1. Usuario no puede ver datos:
- Verificar que existe en tabla `worker`
- Revisar políticas RLS
- Confirmar relación con empresa

#### 2. Error al registrar usuario:
- Verificar que la empresa existe
- Confirmar permisos de inserción en `worker`
- Revisar configuración de Supabase Auth

#### 3. Datos mezclados entre empresas:
- Revisar políticas RLS
- Confirmar filtros en consultas
- Verificar función `get_user_empresa_id()`

### Debugging:
```sql
-- Deshabilitar RLS temporalmente para debug
ALTER TABLE worker DISABLE ROW LEVEL SECURITY;

-- Ver políticas activas
SELECT * FROM pg_policies WHERE tablename = 'worker';

-- Verificar datos del usuario actual
SELECT * FROM current_worker_info;
```

## 🔮 Próximas Funcionalidades

- [ ] Panel de administración por empresa
- [ ] Reportes personalizados
- [ ] Notificaciones por empresa
- [ ] API REST multi-tenant
- [ ] Migración de datos entre empresas
- [ ] Backup automático por empresa
- [ ] Integración con sistemas externos

## 📞 Soporte

Para soporte técnico o consultas sobre la implementación multi-tenant, revisar:

1. Logs de Supabase Dashboard
2. Consola del navegador (errores JavaScript)
3. Políticas RLS en SQL Editor
4. Documentación de Supabase Auth

---

**Nota**: Este sistema está diseñado para escalar y soportar múltiples empresas con total aislamiento de datos.