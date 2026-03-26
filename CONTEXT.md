# CONTEXT.md — 2minclip
> Este archivo se actualiza al final de cada sesión de desarrollo.
> Al retomar, lee PROJECT.md y este archivo antes de escribir una sola línea de código.

---

## Estado actual

- **Tarea en curso**: ninguna — proyecto no iniciado
- **Última sesión**: —
- **Próximo paso exacto**: instalar Node.js desde nodejs.org (versión LTS), verificar con `node --version` y `npm --version` en la terminal de VSCode, luego arrancar Tarea 1

---

## Tareas completadas

ninguna

---

## Tareas en progreso

ninguna

---

## Árbol de archivos relevantes

> Se irá rellenando conforme se creen archivos. Formato:
> `ruta/al/archivo` — qué hace y por qué es importante

ninguno todavía

---

## Decisiones tomadas en sesión

> Decisiones técnicas concretas que surgieron al programar (no las de diseño, esas están en PROJECT.md).
> Formato: fecha — decisión — por qué

ninguna todavía

---

## Cómo usar este archivo

### Al iniciar sesión
1. Leer PROJECT.md completo
2. Leer este archivo — detectar automáticamente la última tarea completada y el próximo paso exacto
3. Ir directamente al "Próximo paso exacto" sin preguntar — está aquí
4. Si no hay tareas completadas, empezar por Tarea 0

### Al terminar sesión
Actualizar este archivo con:
1. **Estado actual** — tarea y punto exacto donde se paró
2. **Tareas completadas** — añadir las que se terminaron con resumen de implementación
3. **Árbol de archivos** — añadir archivos nuevos creados con descripción
4. **Decisiones tomadas** — cualquier decisión técnica que surgió
5. **Próximo paso exacto** — la acción concreta con la que arrancar la siguiente sesión

### Al terminar cada tarea — protocolo de verificación obligatorio
Antes de pasar a la siguiente tarea, indicar siempre al usuario cómo verificar:

**Si la tarea es visible en el navegador:**
- Comando exacto a ejecutar (`npm run dev`)
- URL exacta a abrir
- 2-3 pruebas concretas: *"Deberías ver X, si haces Y debería pasar Z"*

**Si la tarea no es visible (configuración, flags, i18n):**
- Archivo exacto a abrir y línea a buscar
- Test mínimo verificable: *"Abre la consola del navegador y ejecuta X, deberías ver Y"*

No continuar con la siguiente tarea hasta que el usuario confirme que las pruebas han pasado.

---

## Plantilla para actualizar al terminar sesión

```
## Estado actual
- Tarea en curso: Tarea X — [nombre]
- Última sesión: [fecha]
- Próximo paso exacto: abrir [archivo], [qué hacer exactamente]

## Tareas completadas
- [x] Tarea 0 — Landing page
  - Implementada en `src/pages/Landing.jsx`
  - Estilos en `src/styles/landing.css`
  - SEO meta tags en `index.html`
  - Botón "Empezar" navega a `/formato`

## Árbol de archivos relevantes
`src/pages/Landing.jsx` — página de inicio con SEO y botón Empezar
`src/pages/FormatSelector.jsx` — selector de ratio 9:16 / 16:9 / 1:1
`src/hooks/useCanvas.js` — guarda el ratio elegido en estado global
`src/utils/ffmpegCommands.js` — comandos FFmpeg reutilizables (vacío hasta Tarea 8)

## Decisiones tomadas en sesión
2025-XX-XX — usar React Router para la navegación entre Landing, FormatSelector y Editor — más limpio que gestionar vistas con estado
```
