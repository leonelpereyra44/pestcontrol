# Propuesta de mejoras (pestcontrol)

Fecha: 10/10/2025

## Resumen ejecutivo

- Objetivo: pulir la UX móvil, unificar componentes, endurecer validaciones, mejorar mantenibilidad y preparar el proyecto para escalar (calidad, CI/CD, testing).
- Enfoque: quick wins de alto impacto en UX/consistencia, luego refactors seguros en frontend (componentes/estilos compartidos) y hardening en Supabase (RLS/índices/flow de uploads), cerrando con calidad (lint, tests) y performance.

## Prioridades y quick wins (1–3 días)

- Header móvil unificado:
  - Extraer el header móvil (flecha back + título + opcional hamburguesa) a un componente compartido para todas las páginas (p. ej., `components/mobileHeader.js`) que inyecte markup en un contenedor estándar.
  - Beneficios: consistencia visual, menos duplicación y menos bugs.
- Íconos consistentes:
  - Reemplazar emojis por SVG inline en botones/acciones principales (ver, editar, PDF, borrar, back, hamburguesa, plus). Mejora legibilidad y consistencia cross-platform.
- Inputs numéricos:
  - Crear utilidad `onlyDigits(el, { normalizeLeadingZeros: true })` y aplicarla por data-atributo (`data-only-digits`) a todos los campos que deban ser numéricos. Estandariza el comportamiento (teclado numérico + sanitización + normalización).
- Validación de formularios:
  - Micro-validación inline (estado de error, ayuda, deshabilitar botones si hay campos requeridos vacíos).
- Eliminar claves Supabase hardcoded:
  - Centralizar siempre el cliente de Supabase en `auth.js` y eliminar fallbacks. Reduce riesgo de inconsistencias y exposición de configs.
- Bottom sheet del wizard (accesibilidad):
  - Añadir foco inicial dentro del sheet, cierre con Escape, `role="dialog"`, `aria-modal="true"` y focus trap.
- PDFs:
  - Guardar el último estado de “Generar PDF” con feedback de progreso y modo reducido para móviles (ocultando elementos que no deben renderizarse).

## Mejora UX/UI

- Diseño tokens y sistema de estilos:
  - Consolidar variables de diseño en `css/tokens.css` (colores, spacing, tipografía, radios). Reutilizar en `controles.css`, `nuevo-control.css`, `ver-control.css`, `empresa-info.css`.
- Componentes reutilizables:
  - Header móvil, toolbar de acciones (ver/editar/pdf/borrar), tarjetas “card” y “alertas” como helpers CSS/snippets.
  - Unificar badges (estados) con una única escala de colores.
- Accesibilidad:
  - Roles ARIA en tabs de “Puntos de Control” (role=tablist, role=tab, role=tabpanel) + navegación por teclado.
  - Estados focus visibles en botones e inputs; contrastes verificados.
  - Botones ícono con `aria-label`.
- Responsive:
  - Tipografías fluidas con `clamp()`; considerar safe-area-inset en iOS para bottom sheets.

## Arquitectura Frontend

- Modularización JS:
  - Mantener managers (Productos/Puntos/Wizard/Control) y añadir `utils/` (fecha, validaciones, fetch wrappers, supabase helpers).
  - EventBus simple para comunicar cambios (ej.: al guardar un punto actualizar listados/stats).
- TypeScript gradual o JSDoc types:
  - Migración gradual o anotar tipos con JSDoc. Beneficios: autocompletado, tipos, menos bugs.
- Empaquetado:
  - Cargar scripts con `type=module`, dividir por páginas, extraer utilidades comunes. `defer`/`async` para no bloquear render.

## Supabase y datos

- RLS y restricciones:
  - Verificar que todos los selects/deletes/updates estén filtrados por `empresa_id` y que RLS lo exija (aplicar políticas a tablas nuevas también).
  - Añadir índices sobre `empresa_id`, `fecha_control`, `cliente_id`, `tecnico_id` para mejorar listados/filtros.
  - Constraints:
    - Uniques y FKs ON DELETE CASCADE donde aplique (confirmar en productos/puntos asociados a controles).
- Storage:
  - Patrón único para URLs firmadas y expiración; si expiran, refrescarlas en background.
  - Validar tipo/tamaño de uploads previo al llamado a Storage.
- Normalización:
  - Unificar formato de fechas y zona horaria (`utils/date.ts`).

## IndexedDB y offline

- Offline-first para crear controles:
  - Borradores existen; añadir “background sync” para subir cuando haya conexión.
  - Versionar el schema de IndexedDB y añadir migraciones (si se agregan campos nuevos).
- Manejo de conflictos:
  - Si dos dispositivos editan el mismo control, resolver con “última edición gana” + pista visual.

## Calidad y productividad

- Lint y formato:
  - ESLint + Prettier + Stylelint. Scripts en package.json.
- Testing:
  - Unit tests (Jest/Vitest) para utilidades y managers (Puntos/Productos).
  - E2E (Playwright) para flujos clave: crear control, agregar productos/puntos, generar PDF.
- CI/CD:
  - GitHub Actions: lint + tests; deploy a Vercel si todo pasa. Opcional: preview por PR.
- Monitoreo:
  - Sentry para errores de frontend (opcional). Log levels y desactivar verbose en producción.

## Seguridad

- Cabeceras y CSP:
  - Content-Security-Policy adecuada y orígenes permitidos de CDNs.
- Sanitización:
  - Escapar/sanitizar contenido dinámico antes de insertarlo con `innerHTML`.
- Secretos:
  - No exponer service role keys (solo anon). Centralizar Supabase client.

## Performance

- Carga diferida:
  - `defer`/`async` para scripts no críticos. Lazy-load de imágenes y previews (empresa-info).
- PDFs:
  - Opción “PDF simple” en móviles con jsPDF directo (sin html2canvas) para listados; alternativa: generación serverless en Vercel si se requiere alta fidelidad.
- Render eficiente:
  - Minimizar re-renders de tablas; usar fragmentos o actualizaciones puntuales.

## Documentación y DX

- README:
  - Setup local, variables de entorno, esquema Supabase, comandos de lint/test/build, explicación de RLS y Storage.
- Diagramas:
  - Pequeño diagrama de arquitectura (Frontend ↔ Supabase/Storage/RLS).
- Guías:
  - Guía de estilos (tokens/nomenclatura CSS), guía de componentes compartidos y convención de nombres en managers.

## Roadmap propuesto

- Semana 1:
  - Quick wins: header móvil componente, svg icons, validaciones numéricas genéricas, accesibilidad básica, remover fallbacks Supabase, mejorar bottom sheet (focus/escape).
  - Lint/Format configurado.
- Semana 2:
  - Utils compartidos (fecha/validación/supabase), tokens CSS, unificación de botones y alertas.
  - Tests unitarios base para managers.
- Semana 3–4:
  - TS gradual o JSDoc types + Vite.
  - E2E básicos (crear/editar control, PDF).
  - IndexedDB versioning + sync básico.
- Opcional posterior:
  - Serverless PDF, PWA/offline avanzado, Sentry, CI/CD completo.

## Checklist de implementación

- [ ] Componente `mobileHeader.js` + estilos reutilizables
- [ ] Reemplazo progresivo de emojis por SVG inline
- [ ] `utils/onlyDigits` + data-attributes para inputs numéricos
- [ ] Accesibilidad: roles ARIA en tabs; focus trap + Escape en bottom sheet
- [ ] Centralizar supabase client (remover fallbacks locales)
- [ ] `css/tokens.css` + normalización de botones, badges y cards
- [ ] Lint/Prettier/Stylelint + scripts en package.json
- [ ] Pruebas unitarias mínimas + 1–2 flujos E2E
- [ ] README ampliado y guía de estilos
