# Entrenador Personal — instrucciones para Claude

App web personal de Martin (Resistencia, Chaco, Argentina). Publicada con GitHub Pages:
https://iturraldemartin-art.github.io/entrenador/ — se publica desde la rama `main`.

## Cómo hablarle a Martin
- Castellano rioplatense informal (voseo), corto y en pasos. Suele dictar por voz: interpretá errores de tipeo.
- Respuestas escaneables: títulos, viñetas, negritas. Nada de relleno.

## Estructura
- Todo está en **`index.html`** (un solo archivo: HTML + CSS + JS clásico, sin build).
- `sw.js`: service worker (red primero para index.html). `manifest.webmanifest`, `icons/`, `lib/` (Firebase), `vid/`, `img/`, `imgpack.js`.
- Datos en Firebase/Firestore (proyecto `entrenador-mmi`). NUNCA borrar ni modificar datos del usuario desde código salvo que lo pida.
- Pestañas: Hoy, Calendario, Semana, Ejercicios, Progreso, Alimentación, Ideas y pedidos.

## Al hacer un cambio
1. Editá `index.html` con cambios quirúrgicos (no reescribas secciones enteras).
2. Subí `APP_BUILD` (ej. `"2026-10-14a"`) → la app muestra "🔄 Hay una versión nueva".
3. Verificá sintaxis de los `<script>` (node) y probá con Playwright (Chromium preinstalado) si podés.
4. Commit en castellano y push a `main` (para que se publique).
5. Respondé en el issue qué cambió, en castellano simple, y cerralo.

## Pedidos desde la app (GitHub Issues)
- La app crea issues con título `[Claude] …` (label `claude`).
- `↩️ DESHACER` → revertí el último commit que tocó `index.html` (git revert), sin tocar datos.
- `↩️ VOLVER A VERSIÓN … (commit SHA)` → dejá `index.html` como en ese commit.
- Si un pedido es ambiguo o riesgoso, preguntá en el issue antes de cambiar.

## Reglas fijas
- Links de videos/recetas: **verificar que existan** antes de ponerlos (YouTube oEmbed, etc.).
- Gym: no tocar reglas de entrenamiento, ciclos ni sesiones guardadas salvo pedido explícito.
- Alimentación: el "Cierre de ciclo" solo afecta Alimentación.
- Corrimientos de semana: usar `PLAN_CORRIDO` (fecha → día de rutina), no editar `weekPlan`.
- Videos por ejercicio: `EX_VIDEO_LINKS` (+ miniatura en `EX_VID_THUMBS`); pasos en `EX_STEPS`; datos de ejercicios propios en `EX_META_FIX`.
- Nunca pedir ni guardar contraseñas o tokens.
