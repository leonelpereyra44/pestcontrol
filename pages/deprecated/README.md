# 📦 Archivos Deprecados

Esta carpeta contiene páginas que ya no se usan en el sistema pero se mantienen como referencia histórica.

## Archivos

### `register.html`
- **Fecha de deprecación:** Octubre 2025
- **Razón:** El sistema usa exclusivamente registro por invitación (`registro-invitacion.html`)
- **Flujo actual:** Admin/SuperAdmin genera invitación → Usuario recibe link → `registro-invitacion.html`
- **Problema de seguridad:** Permitía registro manual con "código de empresa" que cualquiera podría adivinar
- **Estado:** No tiene links desde ninguna página, no está en uso

## ¿Por qué no eliminarlas completamente?

- Pueden servir como referencia para futuros features
- Documentan decisiones de arquitectura
- Fácil recuperar si se necesita algo específico

## Si necesitas restaurar algún archivo

```bash
# Desde la raíz del proyecto:
mv pages/deprecated/register.html pages/
```
