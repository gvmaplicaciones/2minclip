111111111111# PROJECT_2MINEDIT.md
> Especificación completa del proyecto 2minedit.com
> Ecosistema de microherramientas de edición online — modelo ilovepdf para vídeo e imagen
> Stack: React + Vite + Tailwind CSS + FFmpeg.wasm + Canvas API + Vercel
> Versión: 1.0 — todas las herramientas desde el principio

---

## Concepto

2minedit.com es un ecosistema de herramientas de edición online gratuitas que funcionan directamente en el navegador. Sin instalar nada, sin registrarse, sin marca de agua. Cada herramienta resuelve un problema concreto en menos de 2 minutos.

Modelo de referencia: ilovepdf.com — una home con todas las herramientas, cada una en su propia URL con SEO independiente, todo bajo un mismo dominio para acumular autoridad.

**2minclip.com redirige a 2minedit.com/video-editor desde el día 1.** La autoridad SEO acumulada en 2minclip.com se transfiere al nuevo dominio.

---

## Dominio y URLs

```
2minedit.com/                    → Home con todas las herramientas
2minedit.com/video-editor        → Editor de vídeo (migrado desde 2minclip.com)1
2minedit.com/compress-video      → Comprimir vídeo online
2minedit.com/extract-audio       → Extraer audio de vídeo
2minedit.com/video-to-gif        → Convertir vídeo a GIF
2minedit.com/gif-to-video        → Convertir GIF a vídeo
2minedit.com/compress-images     → Comprimir imágenes en lote
2minedit.com/resize-images       → Redimensionar imágenes en lote
2minedit.com/convert-to-webp     → Convertir imágenes a WebP

2minedit.com/en/                 → Home EN
2minedit.com/en/video-editor     → Video editor EN
2minedit.com/en/compress-video   → Compress video online EN
... (misma estructura en /en/)
```

---

## Redirección de 2minclip.com

Configurar en Vercel (vercel.json) o en Namecheap:
```
https://2minclip.com → 301 → https://2minedit.com/video-editor
https://www.2minclip.com → 301 → https://2minedit.com/video-editor
```

Mantener el dominio 2minclip.com activo y pagado — los enlaces entrantes (Product Hunt, GitHub, dev.to, Medium, Alternativeto) siguen transfiriendo autoridad via redirección 301.

---

## Stack técnico

- **React + Vite** — mismo que 2minclip
- **FFmpeg.wasm** — herramientas de vídeo y audio
- **Canvas API / browser-image-compression** — herramientas de imagen
- **Tailwind CSS** — estilos
- **i18next** — internacionalización ES/EN
- **React Router** — navegación entre herramientas
- **React Helmet Async** — meta tags dinámicos por ruta
- **Formspree** — feedback de usuarios (mismo endpoint que 2minclip)
- **Google Analytics GA4** — tracking de eventos por herramienta
- **Vercel** — deploy gratuito con deploy automático en cada push

---

## Diseño

**Mismo sistema visual que 2minclip:**
- Fondo: `#0f0f0f`
- Naranja principal: `#e87040`
- Naranja oscuro (hover/activo): `#2a1508`
- Bordes: `#2a2a2a`
- Texto secundario: `#555` / `#888`
- Fuente: Inter

**Navbar fija en todas las páginas:**
- Logo: `2min` blanco + `edit` naranja
- Enlace "Todas las herramientas" → vuelve a la home
- Selector ES/EN

**Aviso de sesión** (barra fina naranja) en todas las herramientas excepto la home.

**Botón de feedback** (💬) fijo en esquina inferior izquierda en todas las herramientas.

---

## Página Home — 2minedit.com

### Propósito
Mostrar todas las herramientas disponibles. Página de entrada para SEO general y para usuarios que vuelven.

### Estructura

**Hero:**
- H1 ES: "Herramientas de edición online gratis"
- H1 EN: "Free online editing tools"
- Subtítulo ES: "Edita vídeos e imágenes directamente desde el navegador. Sin instalar nada, sin registrarse, 100% gratis."
- Subtítulo EN: "Edit videos and images directly from your browser. No install, no signup, 100% free."

**Grid de herramientas** (2 columnas móvil, 4 columnas desktop):
Cada tarjeta tiene: icono SVG, nombre de la herramienta, descripción de una línea, enlace a la herramienta. Al pulsar la tarjeta va directamente a la herramienta. Hover: borde naranja.

Las 8 tarjetas en orden:

| # | Icono | Nombre ES | Nombre EN | Descripción ES | Descripción EN | URL |
|---|---|---|---|---|---|---|
| 1 | ✂ tijeras | Editor de vídeo | Video editor | Corta, une y exporta en MP4 | Trim, merge and export to MP4 | /video-editor |
| 2 | 🗜 comprimir | Comprimir vídeo | Compress video | Reduce el tamaño de tus vídeos | Reduce your video file size | /compress-video |
| 3 | 🎵 nota musical | Extraer audio | Extract audio | Saca el audio de cualquier vídeo | Get the audio from any video | /extract-audio |
| 4 | 🎬 película | Vídeo a GIF | Video to GIF | Convierte clips a GIF animado | Convert clips to animated GIF | /video-to-gif |
| 5 | 🔄 flechas | GIF a vídeo | GIF to video | Convierte GIFs a MP4 | Convert GIFs to MP4 | /gif-to-video |
| 6 | 🖼 imagen | Comprimir imágenes | Compress images | Reduce el peso de tus fotos | Reduce your image file size | /compress-images |
| 7 | ↔ flechas | Redimensionar imágenes | Resize images | Cambia el tamaño en lote | Bulk resize your images | /resize-images |
| 8 | ⚡ rayo | Convertir a WebP | Convert to WebP | Optimiza imágenes para la web | Optimize images for the web | /convert-to-webp |

**Nota de diseño:** los iconos deben ser SVGs propios del mismo estilo que 2minclip — trazo fino, color naranja `#e87040`, sin relleno. No usar emojis.

**Sección SEO debajo del fold:**

H2 ES: "Herramientas de edición online gratuitas para vídeo e imagen"
H2 EN: "Free online editing tools for video and image"

Texto ES (200 palabras):
"2minedit es una colección de herramientas de edición online gratuitas que funcionan directamente desde el navegador. Sin instalar nada, sin crear cuenta, sin marca de agua.

Puedes comprimir vídeos online para reducir su tamaño, extraer el audio de cualquier vídeo en MP3, convertir vídeos a GIF animado o GIFs a MP4, editar y unir clips con el editor de vídeo, comprimir imágenes en lote, redimensionar fotos para redes sociales o convertir imágenes al formato WebP para optimizar tu web.

Todas las herramientas procesan los archivos en tu propio dispositivo — tus vídeos e imágenes nunca se suben a ningún servidor. Es completamente privado, completamente gratis y funciona en móvil y ordenador desde cualquier navegador moderno."

Texto EN (200 palabras, misma estructura en inglés)

H2 ES: "Preguntas frecuentes sobre las herramientas de edición online"
H2 EN: "Frequently asked questions about the online editing tools"

FAQ (5 preguntas):
- ES: "¿Son gratuitas todas las herramientas?" / EN: "Are all tools free?"
- ES: "¿Necesito registrarme?" / EN: "Do I need to sign up?"
- ES: "¿Son seguras? ¿Mis archivos se suben a algún servidor?" / EN: "Are they safe? Are my files uploaded to a server?"
- ES: "¿Funcionan en móvil?" / EN: "Do they work on mobile?"
- ES: "¿Qué formatos aceptan?" / EN: "What formats do they accept?"

### Meta tags Home ES
```html
<title>Herramientas de edición online gratis | 2minedit</title>
<meta name="description" content="Edita vídeos e imágenes online gratis. Comprime vídeos, extrae audio, convierte a GIF, redimensiona imágenes. Sin instalar nada, sin registrarse."/>
<link rel="canonical" href="https://2minedit.com/"/>
```

### Meta tags Home EN
```html
<title>Free Online Editing Tools | 2minedit</title>
<meta name="description" content="Edit videos and images online for free. Compress videos, extract audio, convert to GIF, resize images. No install, no signup required."/>
<link rel="canonical" href="https://2minedit.com/en/"/>
```

---

## Las 8 herramientas — especificación completa

---

### 1. Editor de vídeo — /video-editor

**Descripción:** Migración completa de 2minclip.com. Mismo código, mismas features.

**Meta ES:**
```
Title: Editor de vídeo online gratis | 2minedit — Sin instalar, sin registrarse
Description: Corta, une y edita vídeos online en 2 minutos. Sin registrarse, sin instalar nada. Editor de vídeo gratis para TikTok, Reels, YouTube.
```

**Meta EN:**
```
Title: Free Online Video Editor | 2minedit — No install, no signup
Description: Cut, merge and edit videos online in 2 minutes. No registration, no software. Free video editor for TikTok, Reels, YouTube.
```

**Keywords ES:** editor de vídeo online gratis, cortar vídeo online, unir vídeos online, editor vídeo sin descargar, editor vídeo TikTok
**Keywords EN:** free online video editor, cut video online, merge videos online, online video editor no signup

**H2s ES:**
- "Cómo cortar y unir vídeos online gratis"
- "Editor de vídeo online para TikTok, Reels e Instagram"
- "Preguntas frecuentes sobre el editor de vídeo online gratis"

**H2s EN:**
- "How to cut and merge videos online for free"
- "Free online video editor for TikTok, Reels and Instagram"
- "Frequently asked questions about the free online video editor"

---

### 2. Comprimir vídeo — /compress-video

**Descripción:** Reduce el tamaño de un vídeo MP4 sin perder calidad visible. El usuario elige el nivel de compresión con un slider (Alta calidad / Equilibrado / Máxima compresión). Muestra tamaño original vs tamaño resultante estimado antes de exportar.

**Flujo UX:**
1. Subir vídeo (MP4, MOV, WebM)
2. Slider de calidad: Alta / Equilibrado / Máxima compresión
3. Botón "Comprimir vídeo"
4. Barra de progreso
5. Comparativa: "Antes: 45MB → Después: 12MB (-73%)"
6. Botón descargar

**FFmpeg:** `-crf 23` (alta) / `-crf 28` (equilibrado) / `-crf 35` (máxima)

**Meta ES:**
```
Title: Comprimir vídeo online gratis | 2minedit — Sin instalar
Description: Reduce el tamaño de tus vídeos online gratis. Sin registrarte, sin marca de agua. Comprime MP4, MOV y WebM directamente desde el navegador.
```

**Meta EN:**
```
Title: Compress Video Online Free | 2minedit — No install
Description: Reduce your video file size online for free. No signup, no watermark. Compress MP4, MOV and WebM directly from your browser.
```

**Keywords ES:** comprimir vídeo online gratis, reducir tamaño vídeo online, comprimir mp4 online, comprimir vídeo sin instalar
**Keywords EN:** compress video online free, reduce video file size online, compress mp4 online free, video compressor online

**H2s ES:**
- "Cómo comprimir un vídeo online gratis"
- "Reduce el tamaño de tus vídeos sin perder calidad"
- "Preguntas frecuentes sobre comprimir vídeos online"

**H2s EN:**
- "How to compress a video online for free"
- "Reduce your video file size without losing quality"
- "Frequently asked questions about compressing videos online"

**Texto cuerpo ES (200 palabras):**
"Comprimir un vídeo online gratis es posible sin instalar ninguna aplicación. Con 2minedit puedes reducir el tamaño de tus vídeos MP4, MOV o WebM directamente desde el navegador, eligiendo el nivel de compresión que necesitas.

Tres modos disponibles: alta calidad para conservar la mayor nitidez posible, equilibrado para un buen balance entre calidad y tamaño, y máxima compresión para reducir el archivo al mínimo. Antes de descargar verás la comparativa de tamaño: original vs resultado.

Todo el procesamiento ocurre en tu propio dispositivo — tus vídeos nunca salen de tu navegador. Sin marca de agua, sin límites, completamente gratis."

**Texto cuerpo EN (200 palabras):**
"Compressing a video online for free is possible without installing any app. With 2minedit you can reduce the size of your MP4, MOV or WebM videos directly from your browser, choosing the compression level you need.

Three modes available: high quality to preserve as much sharpness as possible, balanced for a good trade-off between quality and size, and maximum compression to reduce the file to a minimum. Before downloading you'll see the size comparison: original vs result.

All processing happens on your own device — your videos never leave your browser. No watermark, no limits, completely free."

**FAQ ES:**
- "¿Cuánto se puede reducir el tamaño de un vídeo?" → Depende del vídeo original, pero en modo máxima compresión puedes reducir hasta un 60-80% del tamaño.
- "¿Se pierde calidad al comprimir?" → En modo alta calidad la pérdida es imperceptible. En máxima compresión hay algo de pérdida visible.
- "¿Qué formatos acepta?" → MP4, MOV y WebM.
- "¿Es gratis?" → Sí, completamente gratis sin marca de agua.
- "¿Funciona en móvil?" → Sí, desde cualquier navegador móvil o de escritorio.

**FAQ EN:**
- "How much can I reduce a video's file size?" → Depending on the original, maximum compression can reduce size by 60-80%.
- "Does quality suffer when compressing?" → In high quality mode the loss is imperceptible. In maximum compression there is some visible loss.
- "What formats does it accept?" → MP4, MOV and WebM.
- "Is it free?" → Yes, completely free with no watermark.
- "Does it work on mobile?" → Yes, from any mobile or desktop browser.

---

### 3. Extraer audio de vídeo — /extract-audio

**Descripción:** Extrae el audio de cualquier vídeo y lo descarga como MP3. Una sola pantalla, sin opciones complejas.

**Flujo UX:**
1. Subir vídeo (MP4, MOV, WebM)
2. Selector de formato de salida: MP3 / AAC / WAV
3. Botón "Extraer audio"
4. Barra de progreso
5. Botón descargar

**FFmpeg:** `-vn -acodec libmp3lame` para MP3

**Meta ES:**
```
Title: Extraer audio de vídeo online gratis | 2minedit
Description: Extrae el audio de cualquier vídeo y descárgalo como MP3 gratis. Sin registrarte, sin instalar nada. Funciona con MP4, MOV y WebM.
```

**Meta EN:**
```
Title: Extract Audio from Video Online Free | 2minedit
Description: Extract audio from any video and download it as MP3 for free. No signup, no install. Works with MP4, MOV and WebM.
```

**Keywords ES:** extraer audio de vídeo online, convertir vídeo a mp3 online gratis, sacar audio de vídeo online, descargar audio de vídeo
**Keywords EN:** extract audio from video online free, convert video to mp3 online, get audio from video online, video to mp3 converter free

**H2s ES:**
- "Cómo extraer el audio de un vídeo online gratis"
- "Convierte cualquier vídeo a MP3 sin instalar nada"
- "Preguntas frecuentes sobre extraer audio de vídeos"

**H2s EN:**
- "How to extract audio from a video online for free"
- "Convert any video to MP3 without installing anything"
- "Frequently asked questions about extracting audio from videos"

**Texto cuerpo ES (200 palabras):**
"Extraer el audio de un vídeo online es una de las tareas más buscadas en internet y una de las más complicadas de hacer sin instalar nada. Con 2minedit puedes sacar el audio de cualquier vídeo MP4, MOV o WebM y descargarlo como MP3, AAC o WAV en segundos, directamente desde el navegador.

Sin registrarte, sin marca de agua, sin límites. Simplemente sube tu vídeo, elige el formato de audio que prefieres y pulsa extraer. El proceso tarda unos segundos y el archivo se descarga directamente a tu dispositivo.

Es perfecto para extraer la música de un vídeo, guardar el audio de una conferencia o podcast en vídeo, o conseguir la banda sonora de un clip. Todo el procesamiento ocurre en tu dispositivo — tus vídeos nunca se suben a ningún servidor."

**Texto cuerpo EN (200 palabras):**
"Extracting audio from a video online is one of the most searched tasks on the internet and one of the hardest to do without installing anything. With 2minedit you can extract the audio from any MP4, MOV or WebM video and download it as MP3, AAC or WAV in seconds, directly from your browser.

No signup, no watermark, no limits. Simply upload your video, choose your preferred audio format and click extract. The process takes a few seconds and the file downloads directly to your device.

It's perfect for extracting music from a video, saving the audio from a conference or video podcast, or getting the soundtrack from a clip. All processing happens on your device — your videos are never uploaded to any server."

**FAQ ES:**
- "¿En qué formatos puedo descargar el audio?" → MP3, AAC y WAV.
- "¿Se pierde calidad al extraer el audio?" → No, el audio se extrae directamente del vídeo sin recodificación cuando es posible.
- "¿Qué formatos de vídeo acepta?" → MP4, MOV y WebM.
- "¿Es gratis?" → Sí, completamente gratis.
- "¿Funciona en iPhone?" → Sí, desde Safari o Chrome en cualquier iPhone.

---

### 4. Vídeo a GIF — /video-to-gif

**Descripción:** Convierte un fragmento de vídeo en un GIF animado. El usuario puede seleccionar el punto de inicio y duración (máximo 10 segundos recomendado), y elegir el tamaño de salida.

**Flujo UX:**
1. Subir vídeo (MP4, MOV, WebM)
2. Selector de inicio (segundos) y duración (máx 15s)
3. Selector de tamaño: 320px / 480px / 640px de ancho
4. Botón "Convertir a GIF"
5. Preview del GIF generado
6. Botón descargar

**FFmpeg:** paleta en dos pasos para calidad óptima

**Meta ES:**
```
Title: Convertir vídeo a GIF online gratis | 2minedit
Description: Convierte cualquier vídeo a GIF animado online gratis. Sin registrarte, sin marca de agua. Crea GIFs desde MP4, MOV o WebM en segundos.
```

**Meta EN:**
```
Title: Convert Video to GIF Online Free | 2minedit
Description: Convert any video to animated GIF online for free. No signup, no watermark. Create GIFs from MP4, MOV or WebM in seconds.
```

**Keywords ES:** convertir vídeo a gif online gratis, hacer gif de vídeo online, mp4 a gif online gratis, crear gif animado online
**Keywords EN:** convert video to gif online free, make gif from video online, mp4 to gif online free, create animated gif online

**H2s ES:**
- "Cómo convertir un vídeo a GIF online gratis"
- "Crea GIFs animados desde cualquier vídeo sin instalar nada"
- "Preguntas frecuentes sobre convertir vídeos a GIF"

**H2s EN:**
- "How to convert a video to GIF online for free"
- "Create animated GIFs from any video without installing anything"
- "Frequently asked questions about converting videos to GIF"

**Texto cuerpo ES (200 palabras):**
"Convertir un vídeo a GIF online nunca había sido tan sencillo. Con 2minedit puedes crear GIFs animados desde cualquier vídeo MP4, MOV o WebM directamente desde el navegador, sin instalar ninguna aplicación y sin registrarte.

Simplemente sube tu vídeo, selecciona el momento de inicio y la duración del GIF (hasta 15 segundos), elige el tamaño de salida y pulsa convertir. En segundos tendrás tu GIF listo para descargar.

Es perfecto para crear GIFs para redes sociales, presentaciones, memes o para compartir momentos concretos de un vídeo. Todo el procesamiento ocurre en tu propio dispositivo — tus vídeos nunca se suben a ningún servidor. Gratis, privado y sin límites."

**Texto cuerpo EN (200 palabras):**
"Converting a video to GIF online has never been easier. With 2minedit you can create animated GIFs from any MP4, MOV or WebM video directly from your browser, with no app to install and no account required.

Simply upload your video, select the start point and duration of the GIF (up to 15 seconds), choose the output size and click convert. In seconds your GIF will be ready to download.

It's perfect for creating GIFs for social media, presentations, memes or for sharing specific moments from a video. All processing happens on your own device — your videos are never uploaded to any server. Free, private and unlimited."

**FAQ ES:**
- "¿Cuánto puede durar el GIF?" → Recomendamos un máximo de 15 segundos para que el archivo no sea demasiado grande.
- "¿Qué tamaño tiene el GIF resultante?" → Depende de la duración y el tamaño elegido. Un GIF de 5 segundos a 480px pesa aproximadamente 2-5MB.
- "¿Puedo convertir cualquier vídeo a GIF?" → Sí, acepta MP4, MOV y WebM.
- "¿Es gratis?" → Sí, completamente gratis sin marca de agua ni límites.
- "¿Funciona en móvil?" → Sí, desde cualquier navegador móvil.

**FAQ EN:**
- "How long can the GIF be?" → We recommend a maximum of 15 seconds to keep the file size manageable.
- "How big will the GIF file be?" → It depends on duration and size. A 5-second GIF at 480px is approximately 2-5MB.
- "Can I convert any video to GIF?" → Yes, it accepts MP4, MOV and WebM.
- "Is it free?" → Yes, completely free with no watermark or limits.
- "Does it work on mobile?" → Yes, from any mobile browser.

---

### 5. GIF a vídeo — /gif-to-video

**Descripción:** Convierte un GIF animado a vídeo MP4. Útil para subir GIFs a plataformas que no soportan GIF (Instagram, TikTok).

**Flujo UX:**
1. Subir GIF
2. Botón "Convertir a MP4"
3. Barra de progreso
4. Botón descargar

**FFmpeg:** `-f gif -i input.gif output.mp4`

**Meta ES:**
```
Title: Convertir GIF a vídeo MP4 online gratis | 2minedit
Description: Convierte cualquier GIF animado a vídeo MP4 online gratis. Sin registrarte, sin instalar nada. Perfecto para subir GIFs a Instagram y TikTok.
```

**Meta EN:**
```
Title: Convert GIF to MP4 Video Online Free | 2minedit
Description: Convert any animated GIF to MP4 video online for free. No signup, no install. Perfect for uploading GIFs to Instagram and TikTok.
```

**Keywords ES:** convertir gif a mp4 online gratis, gif a vídeo online, pasar gif a mp4 gratis
**Keywords EN:** convert gif to mp4 online free, gif to video online, gif to mp4 converter free

**H2s ES:**
- "Cómo convertir un GIF a vídeo MP4 online gratis"
- "Sube tus GIFs a Instagram y TikTok convirtiéndolos a MP4"
- "Preguntas frecuentes sobre convertir GIFs a vídeo"

**H2s EN:**
- "How to convert a GIF to MP4 video online for free"
- "Upload your GIFs to Instagram and TikTok by converting them to MP4"
- "Frequently asked questions about converting GIFs to video"

**Texto cuerpo ES (200 palabras):**
"Instagram, TikTok y la mayoría de redes sociales no aceptan GIFs directamente — necesitas convertirlos a vídeo MP4 antes de subirlos. Con 2minedit puedes convertir cualquier GIF animado a MP4 online gratis, sin instalar nada y sin registrarte.

El proceso es inmediato: sube tu GIF, pulsa convertir y descarga el MP4 resultante. El vídeo mantiene la animación original del GIF con la misma duración y fotogramas.

Todo el procesamiento ocurre en tu propio navegador — tus archivos nunca se suben a ningún servidor. Gratis, privado y sin límites."

**Texto cuerpo EN (200 palabras):**
"Instagram, TikTok and most social networks don't accept GIFs directly — you need to convert them to MP4 video before uploading. With 2minedit you can convert any animated GIF to MP4 online for free, with nothing to install and no account required.

The process is instant: upload your GIF, click convert and download the resulting MP4. The video preserves the original GIF animation with the same duration and frames.

All processing happens in your own browser — your files are never uploaded to any server. Free, private and unlimited."

**FAQ ES:**
- "¿Por qué necesito convertir un GIF a MP4?" → Instagram, TikTok y WhatsApp no aceptan GIFs — necesitas subirlos como vídeo MP4.
- "¿Se mantiene la animación?" → Sí, el vídeo resultante reproduce exactamente la misma animación que el GIF original.
- "¿Cuánto tarda?" → Unos pocos segundos independientemente del tamaño del GIF.
- "¿Es gratis?" → Sí, completamente gratis sin marca de agua.
- "¿Funciona en móvil?" → Sí, desde cualquier navegador móvil.

**FAQ EN:**
- "Why do I need to convert a GIF to MP4?" → Instagram, TikTok and WhatsApp don't accept GIFs — you need to upload them as MP4 video.
- "Is the animation preserved?" → Yes, the resulting video plays exactly the same animation as the original GIF.
- "How long does it take?" → A few seconds regardless of the GIF size.
- "Is it free?" → Yes, completely free with no watermark.
- "Does it work on mobile?" → Yes, from any mobile browser.

---

### 6. Comprimir imágenes — /compress-images

**Descripción:** Comprime múltiples imágenes a la vez reduciendo su peso sin pérdida visible de calidad. Útil para webs, blogs y redes sociales.

**Flujo UX:**
1. Subir múltiples imágenes (JPG, PNG, WebP)
2. Slider de calidad (50% - 95%)
3. Botón "Comprimir todas"
4. Lista de resultados con antes/después por imagen
5. Botón "Descargar todas" (ZIP)

**Librería:** `browser-image-compression` (no necesita FFmpeg)

**Meta ES:**
```
Title: Comprimir imágenes online gratis | 2minedit — Sin instalar
Description: Comprime tus imágenes online gratis sin perder calidad. Sube varias a la vez, reduce el peso de JPG, PNG y WebP. Sin registrarte.
```

**Meta EN:**
```
Title: Compress Images Online Free | 2minedit — No install
Description: Compress your images online for free without losing quality. Upload multiple at once, reduce JPG, PNG and WebP file size. No signup.
```

**Keywords ES:** comprimir imágenes online gratis, reducir peso imagen online, comprimir jpg online gratis, comprimir png online
**Keywords EN:** compress images online free, reduce image file size online, compress jpg online free, image compressor online

**H2s ES:**
- "Cómo comprimir imágenes online gratis"
- "Reduce el peso de tus fotos sin perder calidad visible"
- "Preguntas frecuentes sobre comprimir imágenes online"

**H2s EN:**
- "How to compress images online for free"
- "Reduce your photo file size without visible quality loss"
- "Frequently asked questions about compressing images online"

**Texto cuerpo ES (200 palabras):**
"Comprimir imágenes online gratis y en lote es posible sin instalar Photoshop ni ninguna otra aplicación. Con 2minedit puedes subir varias imágenes JPG, PNG o WebP a la vez, ajustar el nivel de calidad con un slider y descargar todas las imágenes comprimidas en un ZIP.

Es perfecto para optimizar imágenes antes de subirlas a tu web, blog o tienda online, reducir el peso de fotos para enviar por email o WhatsApp, o preparar imágenes para redes sociales.

La herramienta muestra para cada imagen el tamaño original y el tamaño resultante, para que puedas ver exactamente cuánto has reducido. Todo ocurre en tu navegador — tus imágenes nunca se suben a ningún servidor. Sin marca de agua, sin límites, completamente gratis."

**Texto cuerpo EN (200 palabras):**
"Compressing images online for free and in bulk is possible without installing Photoshop or any other app. With 2minedit you can upload multiple JPG, PNG or WebP images at once, adjust the quality level with a slider and download all compressed images in a ZIP file.

It's perfect for optimizing images before uploading them to your website, blog or online store, reducing photo size for sending by email or WhatsApp, or preparing images for social media.

The tool shows you the original and resulting file size for each image, so you can see exactly how much you've reduced. Everything happens in your browser — your images are never uploaded to any server. No watermark, no limits, completely free."

**FAQ ES:**
- "¿Puedo comprimir varias imágenes a la vez?" → Sí, puedes subir todas las que quieras y se comprimen en lote.
- "¿Se pierde calidad?" → Con el slider en valores altos (80-95%) la pérdida es imperceptible.
- "¿Qué formatos acepta?" → JPG, PNG y WebP.
- "¿Cómo descargo las imágenes comprimidas?" → Puedes descargarlas individualmente o todas juntas en un archivo ZIP.
- "¿Es gratis?" → Sí, completamente gratis sin límites.

**FAQ EN:**
- "Can I compress multiple images at once?" → Yes, you can upload as many as you want and they're compressed in bulk.
- "Is quality affected?" → At high slider values (80-95%) the quality loss is imperceptible.
- "What formats does it accept?" → JPG, PNG and WebP.
- "How do I download the compressed images?" → You can download them individually or all together in a ZIP file.
- "Is it free?" → Yes, completely free with no limits.

---

### 7. Redimensionar imágenes — /resize-images

**Descripción:** Cambia el tamaño de múltiples imágenes a la vez. El usuario puede especificar ancho y alto en píxeles o elegir un preset (Instagram, TikTok, YouTube thumbnail, etc.).

**Flujo UX:**
1. Subir múltiples imágenes (JPG, PNG, WebP)
2. Opciones: píxeles personalizados O preset de red social
3. Opción mantener proporción (activado por defecto)
4. Botón "Redimensionar todas"
5. Descarga individual o ZIP

**Presets:**
- Instagram post: 1080x1080
- Instagram story: 1080x1920
- TikTok: 1080x1920
- YouTube thumbnail: 1280x720
- Twitter header: 1500x500

**Librería:** Canvas API nativa del navegador

**Meta ES:**
```
Title: Redimensionar imágenes online gratis | 2minedit
Description: Cambia el tamaño de tus imágenes online gratis. Redimensiona varias a la vez para Instagram, TikTok, YouTube. Sin instalar nada.
```

**Meta EN:**
```
Title: Resize Images Online Free | 2minedit
Description: Resize your images online for free. Resize multiple at once for Instagram, TikTok, YouTube. No install, no signup required.
```

**Keywords ES:** redimensionar imágenes online gratis, cambiar tamaño imagen online, redimensionar foto online, resize imagen online
**Keywords EN:** resize images online free, change image size online, bulk image resizer online, resize photo online free

**H2s ES:**
- "Cómo redimensionar imágenes online gratis"
- "Cambia el tamaño de tus fotos para Instagram, TikTok y YouTube"
- "Preguntas frecuentes sobre redimensionar imágenes online"

**H2s EN:**
- "How to resize images online for free"
- "Resize your photos for Instagram, TikTok and YouTube"
- "Frequently asked questions about resizing images online"

**Texto cuerpo ES (200 palabras):**
"Redimensionar imágenes online gratis y en lote es posible sin Photoshop ni ninguna app. Con 2minedit puedes cambiar el tamaño de varias fotos a la vez, ya sea introduciendo las dimensiones exactas en píxeles o eligiendo un preset de red social predefinido.

Presets disponibles: Instagram post (1080x1080), Instagram story (1080x1920), TikTok (1080x1920), YouTube thumbnail (1280x720) y Twitter header (1500x500). La opción de mantener proporción está activada por defecto para evitar distorsiones.

Descarga las imágenes redimensionadas individualmente o todas en un ZIP. Todo ocurre en tu navegador, sin subir nada a ningún servidor. Sin marca de agua, sin límites, completamente gratis."

**Texto cuerpo EN (200 palabras):**
"Resizing images online for free and in bulk is possible without Photoshop or any app. With 2minedit you can change the size of multiple photos at once, either by entering exact pixel dimensions or choosing a predefined social media preset.

Available presets: Instagram post (1080x1080), Instagram story (1080x1920), TikTok (1080x1920), YouTube thumbnail (1280x720) and Twitter header (1500x500). The maintain aspect ratio option is enabled by default to avoid distortion.

Download the resized images individually or all together in a ZIP. Everything happens in your browser, nothing is uploaded to any server. No watermark, no limits, completely free."

**FAQ ES:**
- "¿Puedo redimensionar varias imágenes a la vez?" → Sí, sube todas las que quieras y se redimensionan en lote con las mismas dimensiones.
- "¿Se mantiene la proporción?" → Sí, por defecto está activada la opción de mantener proporción. Puedes desactivarla si quieres.
- "¿Qué formatos acepta?" → JPG, PNG y WebP.
- "¿Puedo usar medidas personalizadas?" → Sí, puedes introducir el ancho y alto exactos en píxeles.
- "¿Es gratis?" → Sí, completamente gratis sin límites.

**FAQ EN:**
- "Can I resize multiple images at once?" → Yes, upload as many as you want and they're all resized with the same dimensions.
- "Is the aspect ratio preserved?" → Yes, maintain aspect ratio is enabled by default. You can disable it if needed.
- "What formats does it accept?" → JPG, PNG and WebP.
- "Can I use custom dimensions?" → Yes, you can enter the exact width and height in pixels.
- "Is it free?" → Yes, completely free with no limits.

---

### 8. Convertir imágenes a WebP — /convert-to-webp

**Descripción:** Convierte imágenes JPG y PNG al formato WebP para optimizar el peso en webs. Acepta múltiples imágenes a la vez.

**Flujo UX:**
1. Subir múltiples imágenes (JPG, PNG)
2. Slider de calidad (70% - 100%)
3. Botón "Convertir a WebP"
4. Lista de resultados con tamaño antes/después
5. Descarga individual o ZIP

**Librería:** Canvas API con `canvas.toBlob('image/webp', quality)`

**Meta ES:**
```
Title: Convertir imágenes a WebP online gratis | 2minedit
Description: Convierte tus imágenes JPG y PNG a formato WebP online gratis. Reduce el peso hasta un 30%. Sin instalar nada, sin registrarte.
```

**Meta EN:**
```
Title: Convert Images to WebP Online Free | 2minedit
Description: Convert your JPG and PNG images to WebP format online for free. Reduce file size by up to 30%. No install, no signup.
```

**Keywords ES:** convertir imagen a webp online gratis, jpg a webp online, png a webp online gratis, convertir a webp sin instalar
**Keywords EN:** convert image to webp online free, jpg to webp online, png to webp converter free, convert to webp online

**H2s ES:**
- "Cómo convertir imágenes a WebP online gratis"
- "Optimiza el peso de tus imágenes para la web con formato WebP"
- "Preguntas frecuentes sobre convertir imágenes a WebP"

**H2s EN:**
- "How to convert images to WebP online for free"
- "Optimize your image file size for the web with WebP format"
- "Frequently asked questions about converting images to WebP"

**Texto cuerpo ES (200 palabras):**
"El formato WebP es el estándar recomendado por Google para imágenes en webs — pesa hasta un 30% menos que JPG y PNG con la misma calidad visual. Con 2minedit puedes convertir tus imágenes JPG y PNG a WebP online gratis, en lote, directamente desde el navegador.

Sube varias imágenes a la vez, ajusta el nivel de calidad y descarga los archivos WebP resultantes individualmente o en un ZIP. La herramienta muestra el tamaño original y el tamaño en WebP para que veas exactamente cuánto has optimizado.

Es perfecto para desarrolladores web, bloggers y cualquiera que quiera mejorar la velocidad de carga de su web. Todo ocurre en tu navegador — sin subir nada a ningún servidor. Sin marca de agua, completamente gratis."

**Texto cuerpo EN (200 palabras):**
"WebP is Google's recommended format for web images — it weighs up to 30% less than JPG and PNG with the same visual quality. With 2minedit you can convert your JPG and PNG images to WebP online for free, in bulk, directly from your browser.

Upload multiple images at once, adjust the quality level and download the resulting WebP files individually or in a ZIP. The tool shows you the original size and the WebP size so you can see exactly how much you've optimized.

It's perfect for web developers, bloggers and anyone who wants to improve their website's loading speed. Everything happens in your browser — nothing is uploaded to any server. No watermark, completely free."

**FAQ ES:**
- "¿Qué ventaja tiene WebP sobre JPG?" → WebP pesa hasta un 30% menos con la misma calidad visual, lo que mejora la velocidad de carga de las webs.
- "¿Todos los navegadores soportan WebP?" → Sí, todos los navegadores modernos (Chrome, Firefox, Safari, Edge) soportan WebP.
- "¿Puedo convertir varias imágenes a la vez?" → Sí, puedes subir todas las que quieras en lote.
- "¿Qué formatos acepta?" → JPG y PNG.
- "¿Es gratis?" → Sí, completamente gratis sin límites.

**FAQ EN:**
- "What advantage does WebP have over JPG?" → WebP weighs up to 30% less with the same visual quality, improving website loading speed.
- "Do all browsers support WebP?" → Yes, all modern browsers (Chrome, Firefox, Safari, Edge) support WebP.
- "Can I convert multiple images at once?" → Yes, you can upload as many as you want in bulk.
- "What formats does it accept?" → JPG and PNG.
- "Is it free?" → Yes, completely free with no limits.

---

## Corrección pendiente — canonical de 2minclip.com

Antes de migrar, corregir este bug en 2minclip.com:

El canonical de la ruta `/en` apunta a `https://2minclip.com/en` (sin www) pero Vercel sirve todo con www. Esto hace que Google vea `https://www.2minclip.com/en` como "página alternativa con etiqueta canónica adecuada" y no la indexa.

**Fix en VSCode antes de la migración:**
- En el componente que gestiona los meta tags de `/en`, cambiar:
  ```
  <link rel="canonical" href="https://2minclip.com/en" />
  ```
  por:
  ```
  <link rel="canonical" href="https://www.2minclip.com/en" />
  ```
- Hacer push y solicitar reindexación de `https://www.2minclip.com/en` en Google Search Console.

---

## SEO global — instrucciones para todas las herramientas

### Schema markup por herramienta
Cada herramienta debe tener su propio JSON-LD:
```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "[Nombre de la herramienta]",
  "url": "https://2minedit.com/[ruta]",
  "applicationCategory": "MultimediaApplication",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" }
}
```

### hreflang en todas las páginas
```html
<link rel="alternate" hreflang="es" href="https://2minedit.com/[ruta]"/>
<link rel="alternate" hreflang="en" href="https://2minedit.com/en/[ruta]"/>
<link rel="alternate" hreflang="x-default" href="https://2minedit.com/[ruta]"/>
```

### Sitemap
Generar sitemap.xml con todas las URLs en ES y EN.

### Breadcrumbs
Todas las herramientas deben mostrar: Inicio > [Nombre herramienta]

### Enlazado interno
Cada herramienta debe enlazar a 2-3 herramientas relacionadas al final de la página. Esto distribuye la autoridad interna y reduce la tasa de rebote.

---

## Feature flags

Mismo sistema que 2minclip — archivo `src/config/features.js`:
```js
export const FEATURES = {
  ADS_ENABLED: false,
  MAX_FILE_SIZE_MB: null, // null = sin límite en v1
  WATERMARK: false,
}
```

---

## Analytics — eventos a trackear por herramienta

Además de las páginas vistas, trackear estos eventos en GA4:
- `file_uploaded` — usuario sube un archivo
- `tool_started` — usuario pulsa el botón de procesar
- `tool_completed` — exportación completada con éxito
- `tool_error` — error durante el procesamiento
- `file_downloaded` — usuario descarga el resultado

---

## Plan de tareas

### Fase 0 — Infraestructura (1-2 días)
- [ ] Crear repo GitHub 2minedit
- [ ] Configurar proyecto React + Vite + Tailwind + i18next
- [ ] Montar navbar con logo y selector ES/EN
- [ ] Montar home con grid de herramientas
- [ ] Configurar React Router con todas las rutas
- [ ] Configurar React Helmet Async para meta tags dinámicos
- [ ] Deploy en Vercel con dominio 2minedit.com
- [ ] Configurar redirección 301 de 2minclip.com → 2minedit.com/video-editor
- [ ] Google Search Console para 2minedit.com
- [ ] Google Analytics GA4

### Fase 1 — Herramientas de vídeo (3-4 días)
- [ ] Migrar editor de vídeo de 2minclip a /video-editor
- [ ] Comprimir vídeo (/compress-video)
- [ ] Extraer audio (/extract-audio)
- [ ] Vídeo a GIF (/video-to-gif)
- [ ] GIF a vídeo (/gif-to-video)

### Fase 2 — Herramientas de imagen (2-3 días)
- [ ] Comprimir imágenes (/compress-images)
- [ ] Redimensionar imágenes (/resize-images)
- [ ] Convertir a WebP (/convert-to-webp)

### Fase 3 — SEO y pulido (1-2 días)
- [ ] Textos SEO completos en ES y EN para cada herramienta
- [ ] FAQ por herramienta (mínimo 5 preguntas)
- [ ] Enlazado interno entre herramientas relacionadas
- [ ] Sitemap completo con todas las URLs
- [ ] Solicitar indexación en Search Console
- [ ] Botón de feedback en todas las herramientas

---

## Archivos del proyecto

- `PROJECT_2MINEDIT.md` — este archivo, especificación completa
- `CONTEXT_2MINEDIT.md` — diario de obra, estado de tareas (crear al empezar)
