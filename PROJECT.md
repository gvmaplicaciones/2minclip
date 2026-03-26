# 2minclip — Editor de vídeo PWA minimalista

## Visión del producto

Un editor de vídeo móvil brutalmente simple. La referencia es **ilovepdf pero para vídeo**: entras, haces lo que necesitas en 2 minutos, exportas y listo. Sin funciones innecesarias, sin perderte en menús, sin curva de aprendizaje.

El problema que resuelve: CapCut, InShot y similares se han vuelto demasiado complejos. Hay un hueco real para algo que haga las 5 cosas esenciales y nada más.

---

## Stack técnico

| Capa | Tecnología | Por qué |
|---|---|---|
| UI | React + Vite | Rápido de arrancar en Windows, ecosistema amplio |
| Estilos | Tailwind CSS | Mobile-first sin sufrir |
| Timeline drag & drop | dnd-kit | Librería moderna, bien mantenida |
| Procesamiento de vídeo | FFmpeg.wasm | Motor real de corte/merge/audio en el navegador, sin servidor |
| Internacionalización | i18next + react-i18next | Detección automática de idioma del navegador, textos en JSON por idioma |
| Deploy | Vercel (gratuito) | Deploy en segundos desde Git, dominio 2minclip.com |

---

## Decisiones técnicas tomadas (y por qué)

- **PWA en lugar de app nativa**: menos tiempo de desarrollo, no requiere Mac para publicar, válido para validar la idea. Flutter nativo sería el siguiente paso si la app engancha.
- **FFmpeg.wasm**: el export tarda 20-60s en móvil. Se asume — el usuario ya invirtió tiempo editando, esperar el render es normal (como cualquier editor).
- **Sin persistencia de sesión (v1)**: para clips cortos de 30-40s la gente lo hace en una sentada. Se añade en v2 si los usuarios lo piden. Evita la complejidad de backend/auth en v1.
- **Aviso al cerrar pestaña (beforeunload)**: si el usuario tiene al menos un clip subido, se activa un listener `beforeunload` que muestra el aviso nativo del navegador ("¿Seguro que quieres salir? Los cambios no se guardarán"). Si no ha subido nada, no se muestra — no tiene sentido interrumpir. El texto del aviso no es personalizable (los navegadores lo bloquean por seguridad) pero el mensaje por defecto es suficientemente claro.
- **DIVIDIR en lugar de trim arrastrando handles**: en pantalla móvil pequeña, arrastrar los extremos de un clip es impreciso y frustrante. El flujo correcto es: mover el cabezal al punto exacto → pulsar DIVIDIR → borrar la parte no deseada. Es más natural con el dedo y más preciso. Los handles de trim quedan como ajuste fino opcional.
- **Zoom en el timeline con pinch**: sin zoom, un clip de 30s ocupa 2cm en pantalla y es imposible dividir con precisión. El pinch con dos dedos (como Google Maps) expande el timeline para poder ver frame a frame. Es imprescindible para que DIVIDIR funcione bien.
- **Texto: 3 fuentes + 10 colores fijos + borde opcional**: se permiten superposiciones de texto sobre el vídeo. Solo 3 fuentes (Inter, Playfair Display, Space Grotesk). Color limitado a 10 opciones fijas. Check de borde (stroke) para legibilidad — texto blanco genera borde negro automáticamente, texto negro genera borde blanco, resto de colores borde negro por defecto. En FFmpeg es un parámetro adicional en el filtro `drawtext` (`borderw` y `bordercolor`), coste técnico mínimo.
- **Formatos de entrada permitidos**: solo formatos comunes y bien soportados por FFmpeg.wasm en móvil. Vídeo: MP4, MOV, WebM. Audio: MP3, AAC, WAV. Imagen (overlay): JPG, PNG. Cualquier otro formato muestra un error claro al usuario antes de intentar procesarlo. Evita problemas de compatibilidad y tiempos de procesamiento impredecibles.
- **Formato de salida siempre MP4 H.264**: universal, compatible con TikTok, Instagram, WhatsApp y cualquier plataforma. El usuario no elige códec — siempre es el mismo.
- **Canvas fijo elegido antes de editar (paradigma PowerPoint)**: el usuario elige el ratio (9:16, 16:9, 1:1) antes de entrar al editor, no al exportar. El editor es un lienzo de tamaño fijo y los clips se distribuyen dentro de él. Un clip vertical en canvas 16:9 no distorsiona — ocupa su espacio y el resto es negro. Esto evita el problema de CapCut donde el canvas se adapta al primer clip y luego todo se rompe si mezclas orientaciones. El ratio no se puede cambiar una vez dentro del editor.
- **Internacionalización con i18next**: todos los textos de la app van en archivos JSON por idioma (`es.json`, `en.json`). En los componentes se usa `t('clave')` en lugar de texto directo. i18next detecta automáticamente el idioma del navegador del usuario — si el móvil está en inglés ve inglés, si está en español ve español. Selector manual disponible para cambiarlo. Se configura en la Tarea 1b antes de crear ningún componente para no tener que tocar nada después.
- **Feature flags para monetización futura**: todas las limitaciones de la app (máx clips, máx duración, marca de agua, límite de exports) se controlan desde un único archivo `src/config/features.js`. En v1 todo está a `null` o `false` — sin límites, sin marca de agua. Cuando se quiera monetizar se cambian los valores para usuarios free sin tocar ningún componente. Esto permite activar el modelo freemium en cualquier momento sin refactorizar.
- **Anuncios con Google AdSense**: en v1 `ADS_ENABLED` está en `false` — el componente `AdSlot` no renderiza nada, ni el espacio ni el hueco. La app queda completamente limpia hasta tener AdSense aprobado. Cuando se active, aparecen los dos placements automáticamente: banner fijo encima de los botones de acción (320×50px, tira fina) y anuncio obligatorio pre-descarga en la pantalla de exportar. Sin popups ni intersticiales que bloqueen la edición.
- **Velocidad de clip (0.5x / 1x / 2x)**: al seleccionar un clip se despliega un panel debajo con las opciones. Panel oculto por defecto — se expande al pulsar el clip. FFmpeg lo resuelve con el filtro `setpts`.
- **Control de volumen por pista**: slider de volumen por cada pista de audio y por el audio original de cada clip. FFmpeg filtro `volume`. Panel desplegable al pulsar el clip o la pista.
- **Silenciar clip**: botón dentro del panel desplegable del clip.
- **Dividir pista de audio**: misma lógica que dividir clips de vídeo — cabezal + DIVIDIR. Permite bajar música en el tramo final cortando la pista y ajustando volumen por tramo.
- **Fade out de audio**: botón en cada pista de audio para aplicar fundido de salida (FFmpeg: filtro `afade`). Caso de uso principal: bajar suavemente la música al final del vídeo sin tener que cortar manualmente.
- **Landing page como Tarea 0**: antes del editor hay una página de presentación optimizada para SEO. No se entra directamente al editor. La landing tiene el mensaje, captura del mockup y el botón de empezar. Es lo que Google indexa y lo que convierte visitas en usuarios. Diseño coherente con el mockup HTML existente (`clipflow_mockup_v5.html`).

---

## Features v1 (scope cerrado)

- [ ] Pantalla de selección de formato antes del editor: 9:16 (Reels/TikTok), 16:9 (YouTube), 1:1 (Instagram)
- [ ] Canvas fijo en el editor según el formato elegido — no cambia una vez dentro
- [ ] Subir clips de vídeo desde la galería del móvil (MP4, MOV, WebM únicamente)
- [ ] Validación de formato al subir — error claro si el archivo no es compatible
- [ ] Los clips se distribuyen dentro del canvas — si no llenan el espacio el resto es negro
- [ ] Timeline horizontal con los clips en orden
- [ ] Reordenar clips arrastrando (mantener pulsado + arrastrar)
- [ ] Zoom del timeline con pinch de dos dedos para precisión
- [ ] Cabezal de reproducción desplazable
- [ ] Botón DIVIDIR — parte el clip en el punto del cabezal
- [ ] Eliminar fragmento seleccionado
- [ ] Añadir una pista de audio propia (MP3, AAC, WAV)
- [ ] Cortar el audio con el mismo sistema (cabezal + DIVIDIR)
- [ ] Velocidad por clip: 0.5x (cámara lenta), 1x (normal), 2x (cámara rápida) — panel desplegable al pulsar el clip
- [ ] Silenciar clip — dentro del panel desplegable
- [ ] Control de volumen por clip (slider 0-100%) — dentro del panel desplegable
- [ ] Control de volumen por pista de audio (slider 0-100%)
- [ ] Dividir pista de audio con cabezal + DIVIDIR
- [ ] Fade out de audio por pista (fundido de salida suave)
- [ ] Overlay: superponer una imagen (JPG, PNG) o vídeo encima, arrastrable dentro del canvas
- [ ] Texto: añadir texto sobre el vídeo con 3 fuentes (Inter, Playfair Display, Space Grotesk), 10 colores fijos y opción de borde (stroke) para legibilidad
- [ ] Exportar siempre en MP4 H.264 con FFmpeg.wasm
- [ ] Aviso nativo al cerrar pestaña si hay clips subidos (beforeunload)
- [ ] Web app responsive — funciona en cualquier navegador móvil o escritorio sin instalar nada
- [ ] Soporte multiidioma: español e inglés con detección automática del navegador y selector manual (ES / EN)
- [ ] Feature flags preparados y apagados en `src/config/features.js`
- [ ] Banner AdSense encima de los botones de acción (oculto hasta activar con ADS_ENABLED)
- [ ] Anuncio AdSense pre-descarga en pantalla de exportar (oculto hasta activar con ADS_ENABLED)

## Features v2 (post-validación)

- Guardar y continuar sesión (proyecto en la nube)
- Cuentas de usuario
- Biblioteca de música sin copyright
- Subtítulos automáticos
- Publicar directo a TikTok/Instagram

## Features v3 (monetización)

- Activar Google AdSense: banner debajo de botones + anuncio obligatorio pre-descarga
- Modelo freemium vía feature flags (sin refactorizar):
  - Free: máx 5 clips, máx 60s, marca de agua, anuncios
  - Pro (~3-5€/mes): sin límites, sin marca de agua, sin anuncios
- Sistema de pagos (Stripe o similar)

---

## Estructura de carpetas objetivo

```
2minclip/
├── public/
│   ├── sitemap.xml          # URLs ES y EN para indexación
│   ├── robots.txt           # Allow all + referencia al sitemap
│   └── og-image.png         # 1200x630px para Open Graph y Twitter Card
├── src/
│   ├── locales/
│   │   ├── es.json          # Todos los textos en español
│   │   └── en.json          # Todos los textos en inglés
│   ├── components/
│   │   ├── CanvasSelector/  # Pantalla inicial: elegir 9:16 / 16:9 / 1:1
│   │   ├── Canvas/          # El lienzo fijo donde viven los clips
│   │   ├── Timeline/        # El timeline principal
│   │   ├── Clip/            # Componente de cada clip dentro del canvas
│   │   ├── AudioTrack/      # Pista de audio
│   │   ├── Overlay/         # Superposición imagen/vídeo arrastrable
│   │   ├── TextLayer/       # Texto sobre vídeo (fuente + color)
│   │   ├── Preview/         # Previsualización del canvas completo
│   │   └── ExportButton/    # Botón de exportar + progreso
│   ├── hooks/
│   │   ├── useFFmpeg.js     # Inicialización y uso de FFmpeg.wasm
│   │   ├── useCanvas.js     # Estado del canvas (ratio, dimensiones)
│   │   ├── useTimeline.js   # Estado del timeline
│   │   └── useExport.js     # Lógica de exportación
│   ├── i18n.js              # Configuración de i18next (detección de idioma, carga de JSONs)
│   ├── config/
│   │   └── features.js      # Feature flags: límites, marca de agua, anuncios (todo apagado en v1)
│   ├── utils/
│   │   └── ffmpegCommands.js # Comandos FFmpeg reutilizables
│   ├── App.jsx
│   └── main.jsx
├── PROJECT.md               # Este archivo
├── package.json
└── vite.config.js
```

---

## Plan de tareas (orden de ejecución)

### Tarea 0 — Landing page + SEO completo

**Objetivo**: que Google entienda qué es 2minclip desde el primer día de indexación. El SEO no se añade después — se construye en el código desde el primer commit.

#### 0a — Estructura HTML semántica
- `<h1>` único y claro: "Editor de vídeo online gratis — sin instalar, sin registrarse"
- `<h2>` para cada sección: "Cómo funciona", "Para qué sirve", "Preguntas frecuentes"
- Texto real con keywords en párrafos — Google necesita leer contenido, no solo ver botones
- No usar divs genéricos donde hay semántica disponible (`<main>`, `<section>`, `<article>`, `<nav>`)

#### 0b — Meta tags y head
```html
<!-- ES -->
<title>Editor de vídeo online gratis | 2minclip — Sin instalar, sin registrarse</title>
<meta name="description" content="Edita tus vídeos online gratis en 2 minutos. Corta, une, añade música y exporta en MP4 sin instalar nada ni crear cuenta. El editor de vídeo más sencillo de la web."/>
<link rel="canonical" href="https://2minclip.com"/>
<link rel="alternate" hreflang="es" href="https://2minclip.com"/>
<link rel="alternate" hreflang="en" href="https://2minclip.com/en"/>
<link rel="alternate" hreflang="x-default" href="https://2minclip.com"/>

<!-- Open Graph -->
<meta property="og:title" content="Editor de vídeo online gratis | 2minclip"/>
<meta property="og:description" content="Edita vídeos online en 2 minutos. Sin instalar. Sin registrarse."/>
<meta property="og:image" content="https://2minclip.com/og-image.png"/>
<meta property="og:url" content="https://2minclip.com"/>
<meta property="og:type" content="website"/>

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="Editor de vídeo online gratis | 2minclip"/>
<meta name="twitter:image" content="https://2minclip.com/og-image.png"/>
```

#### 0c — Schema markup (JSON-LD)
Añadir en el `<head>` para que Google entienda que es una aplicación web:
```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "2minclip",
  "url": "https://2minclip.com",
  "description": "Editor de vídeo online gratuito. Corta, une y exporta vídeos sin instalar nada.",
  "applicationCategory": "MultimediaApplication",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" }
}
```

#### 0d — Keywords objetivo por prioridad

**Grupo 1 — Alta intención, cola larga (arrancar con estas)**
- "editor de video online gratis sin registrarse"
- "cortar video online sin instalar nada"
- "unir videos online gratis"
- "recortar video online gratis"
- "editor de video online sin descargar"
- "free online video editor no sign up" (EN)
- "cut video online free no watermark" (EN)
- "trim video online without account" (EN)

**Grupo 2 — Mayor volumen, más competencia (a medio plazo)**
- "editor de video online gratis"
- "cortar video online"
- "editar video online"
- "online video editor free" (EN)
- "cut video online" (EN)

**Grupo 3 — Keywords de plataforma (TikTok/Reels/YouTube)**
- "editor video tiktok online gratis"
- "hacer reels online sin app"
- "editor video 9:16 online"
- "make tiktok video online free" (EN)

#### 0e — Contenido de la landing (secciones obligatorias para SEO)

**Hero** — H1 + subtítulo + botón CTA + captura del editor
- H1: "Editor de vídeo online gratis"
- Subtítulo con keywords: "Corta, une y exporta tus vídeos en MP4 sin instalar nada y sin crear cuenta. Listo en 2 minutos."
- Botón: "Empezar ahora — es gratis"

**Cómo funciona** — H2 + 3 pasos con texto real
- Paso 1: "Elige el formato de tu vídeo — 9:16 para TikTok y Reels, 16:9 para YouTube, 1:1 para Instagram"
- Paso 2: "Sube tus clips y edítalos — corta, ordena, añade música, texto y overlays"
- Paso 3: "Exporta en MP4 — sin marca de agua, sin registrarte, sin pagar"

**Para qué sirve** — H2 + párrafo con keywords
- Texto que mencione: editar vídeos para redes sociales, recortar clips, unir vídeos, añadir música, exportar MP4, sin instalar, navegador, gratis

**FAQ** — H2 + preguntas reales que la gente busca
- "¿Es gratis 2minclip?" → Sí, completamente gratis sin marca de agua
- "¿Necesito crear una cuenta?" → No, entras y usas directamente
- "¿En qué formato exporta?" → Siempre MP4 H.264, compatible con TikTok, Instagram y YouTube
- "¿Funciona en móvil?" → Sí, desde cualquier navegador móvil o de escritorio
- "¿Qué formatos de vídeo acepta?" → MP4, MOV y WebM
- "¿Es seguro subir mis vídeos?" → Tus vídeos nunca salen de tu dispositivo — todo se procesa en tu propio navegador

#### 0f — Archivos técnicos SEO
- `public/sitemap.xml` — con URL de la landing en ES y EN
- `public/robots.txt` — allow all, sitemap reference
- `public/og-image.png` — captura del editor 1200×630px para Open Graph

#### 0g — Core Web Vitals
- La landing debe cargar sin bloquear con FFmpeg.wasm — FFmpeg se carga lazy (solo cuando el usuario entra al editor, nunca en la landing)
- Imágenes en formato WebP
- Sin CSS ni JS bloqueante en el head

### Tarea 1 — Setup del proyecto
- Crear proyecto con Vite + React
- Instalar dependencias (Tailwind, dnd-kit, FFmpeg.wasm)
- Configurar Vite para los headers necesarios (FFmpeg requiere SharedArrayBuffer)
- Verificar que arranca en local

### Tarea 1b — Internacionalización (i18n)
- Instalar `i18next`, `react-i18next` e `i18next-browser-languagedetector`
- Crear `src/i18n.js` con la configuración: detección automática de idioma del navegador, fallback a español
- Crear `src/locales/es.json` con todos los textos de la app en español
- Crear `src/locales/en.json` con todos los textos en inglés
- A partir de esta tarea, TODOS los textos nuevos van en los JSON — nunca texto directo en los componentes
- Añadir selector de idioma (ES / EN) visible en la landing y en el editor

### Tarea 1c — Feature flags y espacios publicitarios
- Crear `src/config/features.js` con todos los flags apagados:
  ```javascript
  export const FEATURES = {
    MAX_CLIPS: null,      // null = sin límite
    MAX_DURATION: null,   // null = sin límite (segundos)
    WATERMARK: false,     // true = marca de agua al exportar
    EXPORT_LIMIT: null,   // null = sin límite de exports/día
    ADS_ENABLED: false,   // true = mostrar anuncios AdSense
  }
  ```
- Crear componente `AdSlot` — div con dimensiones reservadas que muestra vacío si `ADS_ENABLED: false`, y el código AdSense cuando se active
- Colocar `AdSlot` en dos posiciones: debajo de los botones de acción (banner) y en la pantalla post-export pre-descarga

### Tarea 2 — Selector de formato (pantalla previa al editor)
- Pantalla con 3 opciones de canvas: 9:16 (Reels/TikTok), 16:9 (YouTube), 1:1 (Instagram)
- Mostrar preview visual de cada ratio para que el usuario entienda la diferencia
- Al elegir, guardar el ratio en estado global y navegar al editor
- El ratio no se puede cambiar una vez dentro — si quieres cambiarlo, vuelves a empezar

### Tarea 3 — Canvas y preview
- Renderizar el canvas con las dimensiones correctas según el ratio elegido
- El canvas es el área de previsualización del vídeo final
- Los clips se muestran dentro del canvas respetando sus dimensiones
- Si un clip no llena el canvas, el resto es negro (letterbox/pillarbox automático)

### Tarea 4a — Subida de clips
- UI para subir vídeos desde la galería
- Formatos permitidos: MP4, MOV, WebM — rechazar cualquier otro con mensaje claro
- Leer los archivos y guardarlos en estado (React)
- Generar thumbnail de cada clip
- Activar listener `beforeunload` en cuanto se sube el primer clip

### Tarea 4b — Timeline básico
- Mostrar los clips subidos en orden horizontal debajo del canvas
- Cada clip ocupa un ancho proporcional a su duración
- Drag & drop para reordenar con dnd-kit

### Tarea 5a — Cabezal y zoom
- Cabezal de reproducción desplazable sobre el timeline
- Zoom del timeline con pinch de dos dedos (gesture de pellizco)
- El canvas muestra el frame correspondiente a la posición del cabezal

### Tarea 5b — Corte de clips (DIVIDIR)
- Botón DIVIDIR: parte el clip activo en dos en el punto del cabezal
- Seleccionar un fragmento y eliminarlo
- (Opcional v1) Handles de trim en los extremos como ajuste fino

### Tarea 5c — Velocidad y audio por clip (panel desplegable)
- Al pulsar un clip se despliega un panel debajo con sus opciones
- Velocidad: 3 botones — 0.5x, 1x, 2x (FFmpeg: filtro `setpts`)
- Botón silenciar: elimina el audio original del clip
- Slider de volumen del clip: 0-100% (FFmpeg: filtro `volume`)
- Pulsar fuera del clip cierra el panel

### Tarea 6 — Pista de audio
- Subir archivo de audio (MP3, AAC, WAV)
- Mostrarlo como pista debajo de los clips en el timeline
- Cortar la pista con el mismo sistema (cabezal + DIVIDIR) — permite bajar música en tramos
- Slider de volumen por pista: 0-100%
- Botón fade out: fundido de salida suave (FFmpeg: filtro `afade`)
- Botón "+ pista" para añadir más de una pista de audio

### Tarea 7a — Overlay (imagen/vídeo)
- Subir imagen (JPG, PNG) o vídeo para superponer
- Aparece como capa encima del canvas, arrastrable
- Se muestra en el timeline como capa separada encima de los clips base
- Botón "+ capa" para añadir más overlays

### Tarea 7b — Texto
- Botón "+ Texto" en la barra de acción
- Campo de escritura libre
- Selector de fuente: 3 opciones (Inter, Playfair Display, Space Grotesk)
- Paleta de 10 colores fijos: blanco, negro, amarillo, rojo, naranja, morado, azul, verde, rosa, gris
- Check "Borde" — activa stroke alrededor del texto para legibilidad (blanco → borde negro, negro → borde blanco, resto → borde negro)
- El texto aparece como capa arrastrable sobre el canvas
- Se renderiza en el vídeo final vía FFmpeg (filtro `drawtext` con `borderw` y `bordercolor`)

### Tarea 8a — Export: construcción del comando FFmpeg
- Inicializar FFmpeg.wasm
- Construir el comando con todos los clips en orden, respetando el canvas (ratio + letterbox)
- Añadir audio, overlay y texto al comando
- Salida siempre en MP4 H.264

### Tarea 8b — Export: UX del proceso
- Barra de progreso durante el procesamiento
- Mensaje de estado ("Procesando...", "Casi listo...")
- Botón de descarga al terminar
- Gestión de errores clara si algo falla

### Tarea 9 — Deploy
- Subir a GitHub
- Conectar con Vercel y dominio 2minclip.com
- Deploy automático en cada push
- Verificar que funciona correctamente en móvil y escritorio desde el navegador

---

## Cómo usar este archivo en cada sesión

### Al iniciar sesión
1. Leer PROJECT.md completo
2. Leer CONTEXT.md — detectar automáticamente la última tarea realizada y el próximo paso exacto
3. Ir directamente al próximo paso sin preguntar qué hay que hacer — está en CONTEXT.md
4. Si CONTEXT.md no tiene tareas completadas, empezar por Tarea 0

### Al terminar cada tarea
1. Marcar el checkbox correspondiente en Features v1
2. Actualizar CONTEXT.md con estado actual, archivos creados y próximo paso exacto
3. Indicar siempre al usuario cómo verificar que la tarea funciona:

**Si la tarea es visible en el navegador:**
- Decir exactamente qué comando ejecutar (`npm run dev`)
- Decir exactamente qué URL abrir
- Dar 2-3 pruebas concretas: *"Deberías ver X, si haces Y debería pasar Z"*

**Si la tarea no es visible (configuración, flags, i18n):**
- Decir qué archivo abrir y qué línea buscar para confirmar que está bien
- Dar un test mínimo: *"Abre la consola del navegador y ejecuta X, deberías ver Y"*

4. No pasar a la siguiente tarea hasta que el usuario confirme que las pruebas han pasado

### Decisiones nuevas
Si durante el desarrollo surge alguna decisión técnica importante, añadirla a la sección de decisiones técnicas del PROJECT.md antes de continuar.

---

## Notas de contexto

- Desarrollador: Windows, VSCode, Git instalado, Node.js por instalar
- Flujo de trabajo: Claude escribe el código directamente en VSCode, el usuario ejecuta y reporta errores
- Objetivo: validar la idea rápido con poco tiempo disponible
- Prioridad: que funcione en móvil y escritorio desde el navegador
- Nombre del proyecto: **2minclip**
- Dominio: **2minclip.com** ✓ — registrar en Namecheap
- Referencia de diseño: `2minclip_mockup_v6.html` — toda la app debe seguir esta estética
