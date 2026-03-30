# CONTEXT.md — 2minclip
> Este archivo se actualiza al final de cada sesión de desarrollo.
> Al retomar, lee PROJECT.md y este archivo antes de escribir una sola línea de código.

---

## Estado actual

- **Tarea en curso**: ninguna — todas las tareas principales completadas
- **Última sesión**: 2026-03-30
- **Próximo paso exacto**: revisar con el usuario qué mejoras o funciones nuevas quiere abordar a continuación.

---

## Tareas completadas

- [x] **Tarea 0 — Landing page + SEO completo**
  - Landing bilingüe ES/EN en `src/pages/Landing.jsx`
  - Meta tags, JSON-LD, hreflang, sitemap, robots.txt
  - Diseño fiel al mockup v6
  - **Adaptación 2026-03-28**: zona de subida múltiple (drag&drop + click) integrada directamente en el hero de la landing. Selector de formato (3 botones 9:16/16:9/1:1, naranja el activo) integrado debajo de la zona de subida. Botón "Empezar a editar" bloqueado (opacity-40, cursor-not-allowed) hasta que haya ≥1 clip subido. `beforeunload` activo desde el primer clip subido en la landing.
  - **Layout desktop 2026-03-28**: hero en dos columnas `md:grid-cols-2` — texto/H1/pills/features-list a la izquierda, upload+formato+CTA a la derecha. Todo el contenido dentro de `max-w-6xl mx-auto` — nunca ocupa todo el ancho. Secciones "Cómo funciona" y FAQ en grid de 3/2 columnas en desktop.

- [x] **Tarea 1 — Setup del proyecto**
  - `package.json` con todas las dependencias: React, Router, Tailwind, dnd-kit, FFmpeg.wasm, i18next
  - `vite.config.js` con headers COOP/COEP para SharedArrayBuffer
  - `tailwind.config.js` + `postcss.config.js`

- [x] **Tarea 1b — Internacionalización (i18n)**
  - `src/i18n.js` — configuración i18next con LanguageDetector (localStorage → navigator), fallback ES
  - `src/locales/es.json` — todos los textos en español (landing, editor, export, errors)
  - `src/locales/en.json` — todos los textos en inglés
  - `src/components/LanguageSwitcher.jsx` — selector ES/EN reutilizable, cambia idioma + URL
  - i18n importado en `src/main.jsx` antes de App
  - **Claves añadidas 2026-03-28**: `landing.upload_title`, `landing.upload_desc`, `landing.upload_add_more`, `landing.format_label`, `landing.format_9_16`, `landing.format_16_9`, `landing.format_1_1`, `landing.format_warning`, `landing.start_editing`; `landing.session_warning` actualizado al texto de la barra fija

- [x] **Tarea 1c — Feature flags y AdSlot**
  - `src/config/features.js` — todos los flags apagados (MAX_CLIPS, MAX_DURATION, WATERMARK, EXPORT_LIMIT, ADS_ENABLED)
  - `src/components/AdSlot.jsx` — render null si ADS_ENABLED=false; dos variantes: 'banner' y 'pre-download'

- [x] **Tarea 2 — Selector de formato** *(integrado en landing — adaptación 2026-03-28)*
  - `src/context/EditorContext.jsx` — contexto global con `ratio` y `clips`, wrappea toda la app
  - `src/pages/FormatSelector.jsx` — archivo conservado pero sin ruta activa (obsoleto); la selección de formato ocurre ahora en la landing
  - `src/App.jsx` — rutas `/` `/en` `/editor`; ruta `/formato` eliminada; `SessionWarningBar` renderizado encima de todas las rutas
  - Flujo actual: Landing (upload + selección formato) → `/editor` directamente (sin pantalla intermedia)
  - Guard del editor: si no hay `ratio` en contexto → redirige a `/` (antes era `/formato`)

- [x] **Tarea 3 — Canvas y editor shell**
  - `src/hooks/useCanvas.js` — calcula `canvasStyle` y `wrapperClass` según el ratio (9:16 portrait-first, 16:9 landscape-fill, 1:1 square)
  - `src/pages/Editor.jsx` — editor completo: nav con pill ratio + botón exportar, canvas con play button, timeline, AdSlot, barra de acción (+ Clip, Dividir, + Audio, + Texto)
  - Canvas con `max-h-full max-w-full` dentro de contenedor de altura fija (`clamp(180px,35vh,300px)`). Toggle chevron para expandir preview a `65vh`.
  - Guard contra acceso directo a `/editor` sin ratio → redirige a `/`

- [x] **Tarea 4a — Subida de clips**
  - Input file oculto, validación de formato MP4/MOV/WebM, `readVideoMeta` (duración + thumbnail vía canvas)
  - `addClip` al contexto, `beforeunload` cuando hay ≥1 clip, ClipTile con thumbnail + badge de duración
  - **Adaptación 2026-03-28**: la subida inicial de clips ocurre en la landing, no en el editor. El editor tiene "+ Clip" solo para añadir clips adicionales. Los clips de la landing se pasan al editor vía `EditorContext.setClips()`.

- [x] **Tarea 4b — Timeline básico con drag & drop + filmstrip + zoom**
  - Clips con ancho proporcional a su duración (`PX_PER_SEC = 60`, mínimo `64px`)
  - Drag & drop para reordenar con `@dnd-kit/sortable` + `horizontalListSortingStrategy`
  - `PointerSensor` (desktop) + `TouchSensor` con delay 250ms (móvil)
  - Pinch zoom móvil, Ctrl+rueda desktop
  - Thumbnail generado al ratio real del vídeo

- [x] **Tarea 5a — Cabezal y zoom**
  - Cabezal naranja (`#e87040`) absolutamente posicionado dentro del inner div del timeline
  - Handle circular arrastrable con pointer capture (funciona en desktop y móvil)
  - Click en el timeline mueve el cabezal al punto pulsado
  - `buildClipPositions` / `timeToPixel` / `pixelToTime` — conversión entre píxeles y segundos
  - `previewVideoRef` + `useEffect` — el canvas muestra el frame exacto en la posición del cabezal
  - `data-no-seek` en clip tiles y botón `+` para no mover el cabezal al interactuar con ellos

- [x] **Tarea 5b — Corte de clips (DIVIDIR)**
  - `handleSplit()` — busca el clip activo bajo el cabezal, lo parte en clipA + clipB; clipB recibe `trimStart` correcto y thumbnail nuevo
  - Clips tienen propiedad `trimStart` (offset en el vídeo fuente para FFmpeg al exportar)
  - `handleDeleteClip(id)` — elimina clip y ajusta `playheadTime`
  - Selección de clip: click → borde blanco + botón × en esquina; click fuera → deselecciona

- [x] **Tarea 5c — Velocidad y audio por clip (panel desplegable)**
  - `effectiveDuration(clip)` = `clip.duration / (clip.speed || 1)`
  - `ClipPanel` — aparece bajo el row de clips al seleccionar un clip: 3 botones de velocidad (0.5×/1×/2×), slider de volumen, toggle silenciar, **botón "eliminar" clip** (añadido 2026-03-28)
  - Badge de velocidad y icono de silencio en el clip tile cuando aplica

- [x] **Tarea 6 — Pista de audio**
  - `ALLOWED_AUDIO_TYPES` + `readAudioMeta` (lee duración con `<audio>`)
  - `audioTracks` state: array de `{ trackId, startOffset, segments[] }` donde cada segmento tiene `{ id, name, file, objectUrl, duration, trimStart, volume, fadeOut }`
  - `startOffset` (segundos) — posición de la pista en el timeline; arrastrable con `AudioTrackHandle` (grip de 6 puntos, cursor ew-resize, pointer capture)
  - `handleAudioFileSelect` — valida MP3/AAC/WAV (MIME + extensión), crea nueva pista con `startOffset: 0`
  - `handleSplitAudioTrack(trackId)` — divide el segmento bajo el cabezal en 2 segmentos
  - `handleSplit` modificado: si hay `selectedAudioSegId`, divide la pista de audio; si no, divide clip de vídeo
  - `updateAudioSeg` / `handleDeleteAudioSeg` / `updateAudioTrack` — actualizan propiedades de segmentos y pistas
  - Timeline: pistas de audio renderizadas con `position: absolute; left: startOffset * PX_PER_SEC * zoom` — el inner div tiene `minWidth` calculado para incluir el ancho de las pistas desplazadas
  - `AudioSegTile` — tile verde con icono de nota musical, ancho proporcional, badge de fade out
  - `AudioSegPanel` — panel expandible al seleccionar: slider volumen 0–100%, botón fade out, botón eliminar
  - **Playback de audio**: elemento `<audio>` oculto por cada pista (ref en `audioElemsRef`). El vídeo es el master clock. `stopPlayback` pausa todos los `<audio>`.
  - **Preload (fix 2026-03-28)**: `useEffect` sobre `audioTracks` precarga el `src` del audio en cuanto se añade la pista (`audio.src = firstSeg.objectUrl; audio.load()`), sin esperar a dar play. Así `startAudioTracks` solo hace seek + play sin bloquear en carga.
  - **Sync en playTick (fix 2026-03-28)**: el RAF comprueba cada frame si alguna pista en pausa debería estar reproduciéndose (`localT >= 0 && localT < totalDur && audio.paused`) y la arranca. Resuelve el bug donde pistas con `startOffset > 0` no sonaban hasta hacer pausa/reanuda.
  - **Fade out en tiempo real (fix 2026-03-28)**: `audio.volume` se actualiza cada frame del RAF. Si `seg.fadeOut = true`, aplica curva lineal `vol * (timeUntilEnd / fadeOutDur)` en los últimos `min(2s, 30% duración)` del segmento. Antes solo se fijaba el volumen al arrancar, por eso el fade no hacía nada.
  - **Split con startOffset correcto (fix 2026-03-28)**: `handleSplitAudioTrack` calcula `localT = clampedPlayhead - startOffset` antes de llamar a `getAudioSegAt`. Antes usaba `clampedPlayhead` directo y dividía en la posición equivocada.
  - **Drag de pista (fix 2026-03-28)**: `AudioTrackHandle` eliminado del render (causaba desplazamiento visual). El propio `AudioSegTile` gestiona el drag con pointer capture y umbral 5px: movimiento < 5px = click (selección), movimiento ≥ 5px = drag (mueve `startOffset` de toda la pista). El tile empieza exactamente en el pixel que corresponde a su tiempo en el timeline.
  - `totalDuration` = `Math.max(videoDuration, audioDuration)` — las pistas de audio que superen el fin del vídeo extienden la duración total del timeline

- [x] **Undo / Redo — editor (2026-03-28)**
  - `historyRef` (array de snapshots `{ clips, audioTracks, overlays }`), `historyIdxRef` (índice actual), hasta 50 entradas
  - `pushHistory()` — llamado antes de cada operación destructiva: añadir clip, reordenar (drag), dividir, eliminar clip, añadir/eliminar audio, añadir/eliminar/dividir overlay
  - `undo()` / `redo()` — restauran el snapshot correspondiente vía `setClips` + `setAudioTracks` + `setOverlays`, llaman `stopPlayback`, limpian selección (clip, audio seg, overlay)
  - `canUndo` / `canRedo` — state booleano para activar/desactivar botones
  - Botones ⟲ ⟳ en la nav del editor (entre "← volver" y el pill del ratio), desactivados en gris cuando no hay historia

---

## Árbol de archivos relevantes (actualizado)

```
package.json                        — todas las dependencias del proyecto
vite.config.js                      — Vite + headers COOP/COEP + optimizeDeps.exclude FFmpeg
vercel.json                         — headers COOP/COEP para producción en Vercel
tailwind.config.js                  — sistema de colores (#0f0f0f, #e87040, etc.)
postcss.config.js                   — PostCSS para Tailwind
index.html                          — meta SEO, OG, Twitter Card, JSON-LD, hreflang
src/main.jsx                        — entry point: importa i18n antes que App
src/App.jsx                         — router: / → Landing, /en → Landing(en), /editor → Editor + SessionWarningBar global
src/i18n.js                         — config i18next: detección navegador, fallback ES
src/index.css                       — Tailwind + clases reutilizables (btn-primary, pill)
src/locales/es.json                 — todos los textos en español (incluye tutorial.*)
src/locales/en.json                 — todos los textos en inglés (incluye tutorial.*)
src/config/features.js              — feature flags (todo apagado en v1)
src/context/EditorContext.jsx       — contexto global: ratio (9:16/16:9/1:1), clips, setClips
src/hooks/useCanvas.js              — calcula canvasStyle/wrapperClass según ratio
src/hooks/useExport.js              — exportación FFmpeg.wasm: filter_complex, progreso, cancel
src/utils/videoMeta.js              — readVideoMeta() y generateThumbnail() compartidos entre Landing y Editor
src/pages/Landing.jsx               — landing: upload zone múltiple + selector formato + CTA bloqueado; layout desktop 2 columnas max-w-6xl
src/pages/Editor.jsx                — editor completo: canvas + timeline + audio + undo/redo + zoom +/- + tutorial + exportar
src/components/LanguageSwitcher.jsx — selector ES/EN, cambia idioma + sincroniza URL
src/components/AdSlot.jsx           — placeholder AdSense (invisible hasta ADS_ENABLED=true)
src/components/SessionWarningBar.jsx — barra fina fija naranja en todas las pantallas (en App.jsx, fuera de Routes)
src/components/ExportModal.jsx      — modal de exportación: progreso, descarga, error, cancelar
src/components/TutorialModal.jsx    — modal tutorial 6 slides: welcome, clips, zoom, edición, capas, exportar
public/sitemap.xml                  — URLs ES y EN con hreflang
public/robots.txt                   — allow all + referencia sitemap
public/favicon.svg                  — favicon SVG del logo
public/ffmpeg-core.js               — FFmpeg ESM core (copiado de node_modules/@ffmpeg/core/dist/esm/)
public/ffmpeg-core.wasm             — FFmpeg WASM binary
```

---

## Decisiones tomadas en sesión

- 2026-03-28 — Audio playback usa elementos `<audio>` ocultos por pista (uno por `trackId`), referenciados en `audioElemsRef`. El vídeo es el master clock. Audio arranca en `startPlayback` con el seek calculado desde `startOffset + trimStart + localTime`.
- 2026-03-28 — `startOffset` de audio usa píxeles lineales (`startOffset * PX_PER_SEC * zoom`) en lugar de `timeToPixel()` para no depender de los clips de vídeo. La pequeña imprecisión con clips a velocidad ≠1x es aceptable en v1.
- 2026-03-28 — Undo/redo usa refs (`historyRef`, `historyIdxRef`) para no provocar re-renders en cada `pushHistory`. Solo `canUndo`/`canRedo` son state (para activar/desactivar botones).
- 2026-03-28 — Adaptación de flujo: el selector de formato y la zona de subida se integraron en la landing. Ruta `/formato` eliminada. `readVideoMeta` y `generateThumbnail` movidos a `src/utils/videoMeta.js`. `SessionWarningBar` añadido como barra fija en todas las pantallas vía `App.jsx`.
- 2026-03-28 — Layout desktop landing: `max-w-6xl mx-auto` en todas las secciones. Hero en `md:grid-cols-2`: texto a la izquierda, upload+formato+CTA a la derecha.
- 2026-03-26 — i18n detecta por `localStorage` primero, luego `navigator`. Clave: `2minclip_lang`.
- 2026-03-26 — `LanguageSwitcher` cambia idioma + navega a `/` o `/en` en paralelo para mantener URL y estado i18n sincronizados.

- [x] **Tarea 7a — Overlay (imagen/vídeo)**
  - **Modelo de datos**: `{ id, name, objectUrl, type: 'image'|'video', duration, startTime, trimStart, trackIndex, x, y, widthPct, opacity, volume, muted, speed }`
  - `ALLOWED_IMAGE_TYPES` + `OVERLAY_DEFAULT_DURATION` (5 s para imágenes)
  - `handleOverlayFileSelect` — valida imagen (JPG/PNG/GIF/WebP) o vídeo corto; crea overlay en posición del cabezal; centrado (x:0.5, y:0.5); `trackIndex` = max existente + 1 (cada nueva capa va a su propia fila por defecto)
  - **Canvas**: `overflow: hidden` — las capas se recortan al borde del canvas exactamente
  - `canvasContainerRef` + `ResizeObserver` → `canvasDims { w, h }` — dimensiones reales del canvas en px para calcular el ancho de cada overlay en píxeles absolutos
  - `OverlayElement` — ancho fijo en px (`widthPct × canvasDims.w`), `transform: translate(-50%,-50%)` sin scale; arrastrable (pointer capture, umbral 4px); **pinch con dos dedos** para escalar (móvil); **handle de esquina** (cuadradito blanco 14×14 en esquina inferior derecha, dentro del elemento para no ser cortado por `overflow:hidden`) para redimensionar arrastrando en desktop/móvil; sin límite de tamaño máximo
  - `OverlayTile` — **tile lila** (`#1a0f2e` / `#7c5a9e`) para imágenes, **tile azul** (`#0f1a2e` / `#5a7c9e`) para vídeos; icono diferente imagen/vídeo; arrastrable horizontalmente (cambia `startTime`) y verticalmente (cambia `trackIndex`, snap por filas de 42px = 36+6); **handle de redimensión** en borde derecho (dos barras verticales) arrastrando cambia `duration` directamente, sin slider
  - **Filas agrupadas por `trackIndex`**: overlay rows renderizadas ENCIMA de la fila de clips; capas con el mismo `trackIndex` comparten fila; cada nuevo overlay va a fila nueva
  - `OverlayPanel` — **imágenes**: slider tamaño (5%–300% del canvas), slider opacidad, botón eliminar. **Vídeos**: además velocidad (0.5×/1×/2×), slider volumen, toggle silenciar
  - **Dividir overlay**: `handleSplit()` comprueba `selectedOverlayId` primero; parte el overlay en dos con `trimStart` correcto en el segundo fragmento (para vídeos: la segunda parte reproduce desde el punto de corte)
  - Video overlay sync: `overlayVideoElemsRef`, `startOverlayVideos()` (aplica `playbackRate` y `volume`), sync completo en `playTick` cada frame (volume + paused state), seek en `useEffect` al scrubbar
  - `overlaysRef` — ref actualizado por `useEffect` para acceso en RAF
  - `stopPlayback` pausa los `<video>` overlay
  - Undo/Redo incluye `overlays` en cada snapshot (`{ clips, audioTracks, overlays }`)
  - `totalDuration` = `Math.max(videoDuration, audioDuration, overlayDuration)`
  - `timelineMinWidth` incluye el overlay más a la derecha en el cálculo de `minWidth`
  - Botón `+ capa` en la barra de acción; deselección de overlay al hacer click en fondo del timeline o canvas

- [x] **Tarea 7b — Texto sobre canvas**
  - **Modelo de datos**: `{ id, content, startTime, duration, trackIndex, x, y, fontSize, fontFamily, color, bold, italic, opacity }`
  - `FONT_FAMILIES` — map `{ sans, serif, mono, impact }` → CSS font-family string
  - `TEXT_PRESET_COLORS` — 8 colores predefinidos + input nativo de color personalizado
  - `TEXT_ROW_HEIGHT = 42` / `OVERLAY_ROW_HEIGHT = 42` — altura de fila para snap vertical en drag
  - `texts` state + `textsRef` (sincronizado por useEffect para acceso en RAF sin closures obsoletas)
  - `handleAddText()` — crea texto en posición del cabezal, `trackIndex = max(overlays+texts) + 1`, auto-entra en modo edición (`setEditingTextId`)
  - `updateText(id, patch)` / `handleDeleteText(id)` — actualizan/eliminan capas de texto
  - **`TextElement`** — posición absoluta en canvas (`x*canvasW`, `y*canvasH`), `transform: translate(-50%,-50%)`; `fontSize = text.fontSize * canvasDims.h` en px; doble clic → modo textarea editable (mismo estilo visual); sombra de texto para legibilidad; arrastrable con pointer capture (umbral 4px); `overflow: hidden` del canvas recorta el texto en los bordes
  - **`TextTile`** — tile amarillo/ámbar (`#1e1a05`/`#8c7a20`/`#c8b040`); icono "T"; drag horizontal = `startTime`; drag vertical = `trackIndex` (snap 42px); handle de redimensión en borde derecho (cambia `duration`)
  - **`TextPanel`** — muestra contenido (clic → enfoca textarea en canvas), botones de fuente (Sans/Serif/Mono/Impact), toggles B/I, slider tamaño (2%–40% altura canvas), paleta de colores + color picker, slider opacidad, botón eliminar
  - **Filas unificadas**: overlays y texts comparten el mismo espacio de `trackIndex`; el timeline renderiza filas unificadas `[...new Set([...overlays.map(trackIndex), ...texts.map(trackIndex)])]` ordenadas, encima de la fila de clips
  - **Dividir texto**: `handleSplit()` comprueba `selectedTextId` primero (antes que overlay y audio)
  - `pushHistory` incluye `texts` en cada snapshot (`{ clips, audioTracks, overlays, texts }`)
  - `undo`/`redo` restauran `setTexts(snap.texts ?? [])` y limpian `selectedTextId` + `editingTextId`
  - `totalDuration` = `Math.max(videoDuration, audioDuration, overlayDuration, textsDuration)`
  - `timelineMinWidth` incluye el texto más a la derecha en el cálculo de `minWidth`
  - Textos visibles/ocultos en `playTick` cada frame según `startTime`/`duration` del cabezal
  - Botón `+ Texto` en la barra de acción; deselección de texto al hacer click en fondo del canvas o timeline

- [x] **Feedback button en el editor (2026-03-30)**
  - `src/components/FeedbackButton.jsx` — botón fijo `bottom-4 left-4 z-40`, modal centrado con selector de tipo (bug/idea/other), textarea libre, envío a Formspree `mykbwewd`
  - Al enviar: campos `tipo` + `mensaje` via POST JSON a Formspree; estado `sending` durante la petición
  - Confirmación `feedback_success` durante 2 s y cierre automático del modal
  - Claves i18n añadidas en `editor.*`: `feedback_btn`, `feedback_title`, `feedback_type_bug`, `feedback_type_idea`, `feedback_type_other`, `feedback_placeholder`, `feedback_send`, `feedback_sending`, `feedback_success` (ES + EN)
  - Montado en `Editor.jsx` justo antes del `TutorialModal`

- [x] **Tarea 8 — Exportar vídeo con FFmpeg.wasm**
  - `src/hooks/useExport.js` — hook completo: carga FFmpeg ESM desde `/public/ffmpeg-core.js` + `/ffmpeg-core.wasm` (archivos copiados de `node_modules/@ffmpeg/core/dist/esm/`); escribe todos los inputs al FS virtual; construye `filter_complex` con trim, setpts, scale/pad letterbox, concat, atrim, atempo, adelay, afade, amix, overlay; descarga MP4 H.264
  - `src/components/ExportModal.jsx` — modal con estados: loading (spinner + barra progreso), done (botón descarga + auto-click), error (mensaje + reintentar). Botón "Cancelar y volver" llama a `cancel()` que hace `ffmpeg.terminate()` para parar el worker inmediatamente
  - `vercel.json` — headers COOP/COEP para producción
  - `vite.config.js` — `optimizeDeps.exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']` para evitar error de worker en dev
  - Progreso falso con ticker exponencial (`startTicker`): sube despacio cerca del techo 93%, sin decimales (siempre `Math.round`)
  - Canvas helpers: `renderTextLayerToPng`, `renderImageLayerToPng` para convertir capas a PNG antes de pasarlas a FFmpeg

- [x] **UX del editor — mejoras sesión 2026-03-28**
  - **Play/Pause en barra timecode**: botón circular naranja entre el indicador de zoom y el timecode
  - **Diálogo de confirmación al salir**: botón "← Volver" abre modal de aviso antes de navegar a `/`
  - **Zoom mínimo ampliado**: `ZOOM_MIN = 0.05` (antes 0.3) para ver el timeline de un vistazo
  - **Pinch zoom móvil arreglado**: handler `capture: true` a nivel `window` que despacha un `touchcancel` sintético al primer dedo para cancelar dnd-kit antes de que procese el segundo toque
  - **Botones Zoom + / Zoom −** en la barra timecode: cada clic multiplica/divide el zoom por 1.35; i18n en `editor.zoom_in` / `editor.zoom_out`
  - **Botón Tutorial** en la nav (junto a Exportar): abre `TutorialModal` con 6 diapositivas visuales
  - `src/components/TutorialModal.jsx` — modal de tutorial con 6 slides (bienvenida, clips, timeline, edición, capas, exportar), navegación anterior/siguiente, dots indicadores, bilingüe ES/EN via i18n
  - Claves i18n añadidas: `editor.zoom_in`, `editor.zoom_out`, `editor.tutorial_btn`, sección `tutorial.*` completa (ES + EN)

---

## Árbol de archivos relevantes (actualizado)
