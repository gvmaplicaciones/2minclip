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
- **Voltear y rotar clip**: dentro del panel desplegable del clip. Voltear horizontal (`hflip`) y vertical (`vflip`) para efecto espejo. Rotar 90° (`transpose`) para corregir orientación de vídeos grabados en horizontal. FFmpeg — una línea por opción, coste técnico mínimo.
- **Landing page como Tarea 0**: antes del editor hay una página de presentación optimizada para SEO. No se entra directamente al editor. La landing tiene el mensaje, captura del mockup y el botón de empezar. Es lo que Google indexa y lo que convierte visitas en usuarios. Diseño coherente con el mockup HTML existente (`clipflow_mockup_v5.html`).

---

## Features v1 (scope cerrado)

- [ ] Pantalla de selección de formato antes del editor: 9:16 (Reels/TikTok), 16:9 (YouTube), 1:1 (Instagram)
- [ ] Canvas fijo en el editor según el formato elegido — no cambia una vez dentro
- [ ] Zona de subida múltiple en landing — arrastra o selecciona varios clips a la vez (MP4, MOV, WebM)
- [ ] Una vez subido al menos un clip, se desbloquea el botón "Elegir formato y empezar a editar"
- [ ] Los clips de la landing se pasan al editor manteniendo el orden de subida
- [ ] En el editor se pueden añadir clips adicionales de uno en uno con el botón "+ Clip"
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
- [ ] Voltear horizontal (espejo) y vertical — dentro del panel desplegable
- [ ] Rotar 90° — dentro del panel desplegable
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

**Objetivo**: que Google entienda qué es 2minclip desde el primer día de indexación. La landing ES el producto — nada más entrar el usuario ya puede empezar a subir clips. Mismo concepto que ilovepdf.

**Flujo de la landing:**
1. Usuario llega a 2minclip.com
2. Ve directamente la zona de subida — sin pantallas intermedias
3. Sube uno o varios clips
4. Elige el formato con un selector de 3 botones debajo de la zona de subida: 9:16 (preseleccionado), 16:9, 1:1
5. Se desbloquea el botón "Empezar a editar"
6. Entra directamente al editor — sin pantalla intermedia de selector de formato

**El selector de formato en la landing:**
- 3 botones pequeños: 9:16 Vertical · 16:9 YouTube · 1:1 Instagram
- Por defecto 9:16 seleccionado (el más usado — TikTok/Reels)
- El seleccionado se marca en naranja, los otros en gris oscuro
- Se puede cambiar antes de entrar al editor pero no una vez dentro

**Aviso de sesión — siempre visible en todas las pantallas:**
- Una barra fina fija (no intrusiva) visible en landing y editor
- Mensaje: "Si cierras esta pestaña perderás tu progreso"
- Color naranja tenue — llama la atención sin molestar
- Es la información más importante que puede ver el usuario — debe estar siempre presente

**Sin pantallas de tutorial ni selector de formato intermedias** — el flujo es landing → editor directamente. El contenido SEO (Cómo funciona, FAQ, etc.) va debajo del fold.

#### 0a — Estructura HTML semántica
- HTML semántico estricto: `<main>`, `<section>`, `<article>`, `<nav>` — nunca divs genéricos donde hay semántica
- Texto real con keywords en párrafos — Google necesita leer contenido, no solo ver botones
- URLs separadas por idioma para que Google indexe versiones distintas:
  - `2minclip.com/` → detecta idioma automáticamente
  - `2minclip.com/es/` → versión española
  - `2minclip.com/en/` → versión inglesa

**Estructura de headings ES:**
```
H1: Editor de vídeo online gratis
H2: Cortar vídeo online gratis
H2: Unir vídeos online sin descargar
H2: Formatos para todas las redes (9:16, 16:9, 1:1)
H2: Sin complicaciones
H2: Cómo usar 2minclip paso a paso
H2: Preguntas frecuentes
```

**Estructura de headings EN:**
```
H1: Free Online Video Editor
H2: Cut video online free
H2: Merge videos online
H2: Trim video online
H2: Video speed changer online
H2: Add text to video online
H2: How to use 2minclip
H2: Frequently asked questions
```

#### 0b — Meta tags y head
```html
<!-- ES -->
<title>Editor vídeo online GRATIS - Sin instalar ni registrarse | 2minclip</title>
<meta name="description" content="Corta, une y edita vídeos online en 2 minutos. Sin registrarse, sin instalar nada. Editor de vídeo gratis para TikTok, Reels, YouTube."/>
<link rel="canonical" href="https://2minclip.com/es/"/>
<link rel="alternate" hreflang="es" href="https://2minclip.com/es/"/>
<link rel="alternate" hreflang="en" href="https://2minclip.com/en/"/>
<link rel="alternate" hreflang="x-default" href="https://2minclip.com/"/>

<!-- EN -->
<title>Free Online Video Editor - No Signup, No Download | 2minclip</title>
<meta name="description" content="Cut, merge and edit videos online in 2 minutes. No registration, no software. Free video editor for TikTok, Reels, YouTube."/>

<!-- Open Graph (igual para ambos) -->
<meta property="og:title" content="Editor de vídeo online gratis | 2minclip"/>
<meta property="og:description" content="Edita vídeos online en 2 minutos. Sin instalar. Sin registrarse."/>
<meta property="og:image" content="https://2minclip.com/og-image.png"/>
<meta property="og:url" content="https://2minclip.com"/>
<meta property="og:type" content="website"/>
<meta name="twitter:card" content="summary_large_image"/>
```

#### 0c — Schema markup (JSON-LD)
```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "2minclip",
  "url": "https://2minclip.com",
  "description": "Editor de vídeo online gratuito. Corta, une y exporta vídeos sin instalar nada.",
  "applicationCategory": "VideoEditor",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" }
}
```

#### 0d — Keywords objetivo por prioridad

**ES — Grupo 1 (alta intención, arrancar con estas):**
- editor video online gratis
- cortar video online
- unir videos online
- editar video online gratis
- recortar video online
- editor video movil online
- cambiar velocidad video online
- agregar texto video online
- editor video sin descargar
- cortar video para tiktok

**ES — Grupo 2 (cola larga, más fácil de rankear siendo nuevos):**
- editor de video online gratis sin registrarse
- cortar video online sin instalar nada
- unir videos online gratis sin cuenta
- editor video 9:16 online gratis
- hacer reels online sin app

**EN — Grupo 1 (alta intención):**
- online video editor free
- cut video online
- trim video online
- merge videos online
- video speed changer online
- add text to video online
- free video trimmer online
- cut video for tiktok online
- online video cutter free
- free online video merger

**EN — Grupo 2 (cola larga):**
- free online video editor no sign up
- cut video online free no watermark
- trim video online without account
- online video editor no download required

#### 0e — Contenido de la landing (secciones obligatorias para SEO)

**Hero** — H1 + subtítulo + zona de subida + selector formato
- H1 ES: "Editor de vídeo online gratis"
- H1 EN: "Free Online Video Editor"
- Subtítulo ES: "Corta, une y edita vídeos online en 2 minutos. Sin registrarse, sin instalar nada."
- Subtítulo EN: "Cut, merge and edit videos online in 2 minutes. No sign up, no software."
- Zona drag&drop de subida múltiple — esta es la H2: "Sube tus clips aquí"
- Selector de formato integrado (9:16 / 16:9 / 1:1)
- Botón "Empezar a editar"

**¿Qué puedes hacer?** — H3 con lista de funciones con keywords:
- Cortar vídeos con precisión
- Unir varios clips
- Cambiar velocidad (0.5x, 1x, 2x)
- Añadir audio y texto
- Overlay de imágenes y vídeos

**Formatos para todas las redes** — H2:
- 9:16 para TikTok y Reels
- 16:9 para YouTube
- 1:1 para Instagram

**Sin complicaciones** — H2 + checklist:
- ✅ Sin registro
- ✅ Sin instalar nada
- ✅ 100% gratis
- ✅ Funciona en móvil y PC

**Cómo usar 2minclip paso a paso** — H2 + pasos con keywords:
1. Sube tus clips (MP4, MOV, WebM)
2. Elige formato: 9:16 para TikTok/Reels, 16:9 para YouTube
3. Arrastra para reordenar, corta con precisión, cambia velocidad
4. Añade audio o texto si quieres
5. Exporta en MP4 H.264 — gratis, sin marca de agua

**FAQ** — H2 + preguntas reales:
- "¿Es realmente gratis?" → Sí, 100% gratis sin marca de agua
- "¿Necesito crear una cuenta?" → No, entras y usas directamente
- "¿En qué formato exporta?" → Siempre MP4 H.264, compatible con TikTok, Instagram y YouTube
- "¿Funciona en móvil?" → Sí, desde cualquier navegador móvil o de escritorio
- "¿Qué formatos acepta?" → MP4, MOV y WebM
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
- **Post-deploy inmediato**: Google Search Console + Bing Webmaster Tools — añadir propiedad, verificar dominio con DNS, enviar sitemap

### Tarea 9b — Landing hero con captura real
- Una vez el editor esté construido y funcionando, hacer captura real del editor con clips cargados, timeline visible y botones naranja
- Sustituir el hero actual por: texto a la izquierda + captura del editor a la derecha (desktop) / captura debajo del botón (móvil)
- La captura real convierte mucho mejor que cualquier mockup — hacerlo cuando el editor exista, no antes

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
