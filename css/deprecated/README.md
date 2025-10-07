# Archivos CSS Deprecated

## ⚠️ Esta carpeta contiene archivos CSS antiguos

**Fecha de deprecación:** 7 de Octubre, 2025

---

## 📋 Archivos Movidos

Estos archivos fueron reemplazados por el sistema de componentes unificado (`main.css`):

1. **admin.css** (3.1 KB)
2. **auth.css** (5.4 KB) 
3. **clientes.css** (8.6 KB)
4. **controles.css** (21.7 KB)
5. **empresa-info.css** (10.5 KB)
6. **invitacion.css** (1.6 KB)
7. **productos.css** (9.5 KB)
8. **registro-invitacion.css** (5.2 KB)
9. **super-admin.css** (10.7 KB)

**Total:** ~76 KB de código CSS antiguo

---

## 🎯 Motivo de Deprecación

Estos archivos contenían:
- Estilos duplicados entre sí
- Código CSS redundante
- Inconsistencias de diseño
- Dificultad de mantenimiento

Fueron reemplazados por un sistema de componentes modular ubicado en:
- `css/main.css` (entrada principal)
- `css/components/` (componentes individuales)

---

## ⚠️ NO Eliminar Todavía

Estos archivos se mantienen temporalmente como respaldo mientras se verifica que:
1. Todas las páginas funcionen correctamente
2. No haya regresiones visuales
3. El sistema de componentes cubra todos los casos

---

## 🗑️ Plan de Eliminación

**Después de 1-2 semanas de testing en producción:**

```bash
# Eliminar esta carpeta completa
cd /home/leonel/Documents/plagas-v3/css
rm -rf deprecated/
```

**Nota:** Los archivos quedarán en el historial de git si se necesitan en el futuro.

---

## 📊 Estadísticas

- **Archivos deprecated:** 9
- **Páginas afectadas:** 13
- **Reducción de código:** ~60 KB (después de eliminar duplicados)
- **Archivos CSS activos ahora:** 1 (main.css + 9 componentes)

---

**Preservado para respaldo temporal** ✅
