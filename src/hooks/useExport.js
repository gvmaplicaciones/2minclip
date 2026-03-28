import { useRef, useState, useCallback } from 'react'
import i18n from '../i18n'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'

// Output canvas sizes per ratio
const CANVAS_SIZES = {
  '9:16': { w: 720,  h: 1280 },
  '16:9': { w: 1280, h: 720  },
  '1:1':  { w: 720,  h: 720  },
}

// FFmpeg ESM core files served locally from /public
// Using direct same-origin URLs — no blob wrapper needed with COOP/COEP same-origin
const CORE_JS   = `${location.origin}/ffmpeg-core.js`
const CORE_WASM = `${location.origin}/ffmpeg-core.wasm`

// ── Canvas helpers ─────────────────────────────────────────────────────────────

function canvasToPng(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png')
  })
}

async function renderTextLayerToPng(text, CW, CH) {
  const canvas = document.createElemeni18n.t('canvas')
  canvas.width = CW
  canvas.height = CH
  const ctx = canvas.getContexi18n.t('2d')

  const fontSize = Math.max(8, Math.round(text.fontSize * CH))
  const families = {
    sans:   'Inter, Arial, sans-serif',
    serif:  'Georgia, serif',
    mono:   '"Courier New", monospace',
    impact: 'Impact, sans-serif',
  }
  const family = families[text.fontFamily] || 'Arial, sans-serif'
  const weight = text.bold   ? 'bold '   : ''
  const style  = text.italic ? 'italic ' : ''
  ctx.font = `${style}${weight}${fontSize}px ${family}`
  ctx.globalAlpha   = text.opacity ?? 1
  ctx.fillStyle     = text.color || '#ffffff'
  ctx.shadowColor   = 'rgba(0,0,0,0.85)'
  ctx.shadowBlur    = Math.max(3, fontSize * 0.08)
  ctx.textAlign     = 'center'
  ctx.textBaseline  = 'middle'
  ctx.fillText(text.content, Math.round(text.x * CW), Math.round(text.y * CH))

  return canvasToPng(canvas)
}

async function renderImageLayerToPng(overlay, CW, CH) {
  const canvas = document.createElemeni18n.t('canvas')
  canvas.width  = CW
  canvas.height = CH
  const ctx = canvas.getContexi18n.t('2d')

  const img = await new Promise((res, rej) => {
    const el = new Image()
    el.onload  = () => res(el)
    el.onerror = rej
    el.src = overlay.objectUrl
  })

  const w = Math.round((overlay.widthPct ?? 0.35) * CW)
  const h = Math.round(w * (img.naturalHeight / img.naturalWidth))
  const x = Math.round(overlay.x * CW - w / 2)
  const y = Math.round(overlay.y * CH - h / 2)

  ctx.globalAlpha = overlay.opacity ?? 1
  ctx.drawImage(img, x, y, w, h)

  return canvasToPng(canvas)
}

// ── Main hook ──────────────────────────────────────────────────────────────────

// Easing: fast start, slows heavily above 80%
// p: 0-1 real FFmpeg progress → returns display % (15-92)
function easedProgress(p) {
  // power < 1 = fast rise then slow tail
  return 15 + Math.pow(p, 0.55) * 77
}

export function useExport() {
  const ffmpegRef    = useRef(null)
  const tickerRef    = useRef(null)   // setInterval id for fake progress
  const [status,      setStatus]      = useState('idle')   // idle | loading | processing | done | error
  const [phase,       setPhase]       = useState('')
  const [progress,    setProgress]    = useState(0)
  const [errorMsg,    setErrorMsg]    = useState('')
  const [downloadUrl, setDownloadUrl] = useState(null)

  // Fake progress ticker: moves the bar slowly on its own so it never looks frozen.
  // Rate halves every 10 points above 70 → asymptotically approaches 93% ceiling.
  function startTicker(fromPct) {
    stopTicker()
    let current = fromPct
    tickerRef.current = setInterval(() => {
      const ceiling = 93
      if (current >= ceiling) return
      // Step shrinks as we approach the ceiling (exponential slowdown)
      const remaining = ceiling - current
      const step = Math.max(0.05, remaining * 0.012)
      current = Math.min(ceiling, current + step)
      setProgress(Math.round(current))
    }, 400)
  }

  function stopTicker() {
    if (tickerRef.current) { clearInterval(tickerRef.current); tickerRef.current = null }
  }

  const reset = useCallback(() => {
    stopTicker()
    setStatus('idle')
    setPhase('')
    setProgress(0)
    setErrorMsg('')
    setDownloadUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
  }, [])

  const cancel = useCallback(() => {
    // Terminate the FFmpeg worker immediately
    if (ffmpegRef.current) {
      try { ffmpegRef.current.terminate() } catch (_) {}
      ffmpegRef.current = null  // force reload next time
    }
    reset()
  }, [reset])

  // ── FFmpeg loader (lazy, cached) ──
  const loadFFmpeg = useCallback(async () => {
    if (ffmpegRef.current?.loaded) return ffmpegRef.current

    const ffmpeg = new FFmpeg()
    ffmpeg.on('progress', ({ progress: p }) => {
      // Real FFmpeg progress with easing — only advance forward, never go back
      setProgress((prev) => Math.max(prev, Math.round(easedProgress(p))))
    })

    await ffmpeg.load({
      coreURL: CORE_JS,
      wasmURL: CORE_WASM,
    })

    ffmpegRef.current = ffmpeg
    return ffmpeg
  }, [])

  // ── Export ──
  const exportVideo = useCallback(async ({ clips, audioTracks, overlays, texts, ratio }) => {
    setStatus('loading')
    setProgress(2)
    setErrorMsg('')
    setDownloadUrl(null)

    try {
      setPhase(i18n.t('export.phase_loading'))
      const ffmpeg = await loadFFmpeg()

      setStatus('processing')
      setPhase(i18n.t('export.phase_preparing'))
      setProgress(10)

      const { w: CW, h: CH } = CANVAS_SIZES[ratio] ?? { w: 1280, h: 720 }

      // ── Write inputs to FFmpeg FS ──────────────────────────────────────────
      const ffArgs = []          // -i flags
      let   idx    = 0

      // Video clips
      const clipInputs = []
      for (let i = 0; i < clips.length; i++) {
        const clip = clips[i]
        const ext  = clip.name.splii18n.t('.').pop().toLowerCase() || 'mp4'
        const fname = `clip${idx}.${ext}`
        setPhase(i18n.t('export.phase_clip', { n: i + 1, total: clips.length }))
        await ffmpeg.writeFile(fname, await fetchFile(clip.file))
        ffArgs.push('-i', fname)
        clipInputs.push({ clip, fname, idx: idx++ })
      }

      // Audio track segments
      const audioInputs = []
      for (const track of audioTracks) {
        for (const seg of track.segments) {
          const ext   = seg.name.splii18n.t('.').pop().toLowerCase() || 'mp3'
          const fname = `audio${idx}.${ext}`
          await ffmpeg.writeFile(fname, await fetchFile(seg.file))
          ffArgs.push('-i', fname)
          audioInputs.push({ seg, track, fname, idx: idx++ })
        }
      }

      // Image overlays → render to full-canvas PNG
      const imgInputs = []
      for (const ov of overlays.filter((o) => o.type === 'image')) {
        const fname = `imgov${idx}.png`
        setPhase(i18n.t('export.phase_image'))
        const blob = await renderImageLayerToPng(ov, CW, CH)
        await ffmpeg.writeFile(fname, await fetchFile(blob))
        ffArgs.push('-i', fname)
        imgInputs.push({ ov, fname, idx: idx++ })
      }

      // Video overlays
      const vidOvInputs = []
      for (const ov of overlays.filter((o) => o.type === 'video')) {
        const ext   = ov.name.splii18n.t('.').pop().toLowerCase() || 'mp4'
        const fname = `vidov${idx}.${ext}`
        await ffmpeg.writeFile(fname, await fetchFile(ov.objectUrl))
        ffArgs.push('-i', fname)
        vidOvInputs.push({ ov, fname, idx: idx++ })
      }

      // Text layers → render to full-canvas PNG
      const textInputs = []
      for (const t of texts.filter((t) => t.content?.trim())) {
        const fname = `text${idx}.png`
        setPhase(i18n.t('export.phase_text_prep'))
        const blob = await renderTextLayerToPng(t, CW, CH)
        await ffmpeg.writeFile(fname, await fetchFile(blob))
        ffArgs.push('-i', fname)
        textInputs.push({ t, fname, idx: idx++ })
      }

      setPhase(i18n.t('export.phase_exporting'))
      setProgress(15)
      startTicker(15)

      // ── Build filter_complex ───────────────────────────────────────────────
      const fc      = []  // filter_complex parts
      const vStream = []  // per-clip video labels
      const aStream = []  // per-clip audio labels

      for (const { clip, idx: i } of clipInputs) {
        const speed   = clip.speed    || 1
        const vol     = clip.muted    ? 0 : (clip.volume ?? 1)
        const ts      = clip.trimStart || 0
        const srcDur  = clip.duration          // duration in source file (seconds)


        // ── Video ──
        let vf = `[${i}:v]`
        vf += `trim=start=${ts.toFixed(4)}:duration=${srcDur.toFixed(4)},setpts=PTS-STARTPTS`
        if (speed !== 1) vf += `,setpts=PTS/${speed.toFixed(4)}`
        vf += `,scale=${CW}:${CH}:force_original_aspect_ratio=decrease`
        vf += `,pad=${CW}:${CH}:(ow-iw)/2:(oh-ih)/2:black`
        vf += `,fps=30`
        vf += `[cv${i}]`
        fc.push(vf)
        vStream.push(`[cv${i}]`)

        // ── Audio ──
        let af = `[${i}:a]`
        af += `atrim=start=${ts.toFixed(4)}:duration=${srcDur.toFixed(4)},asetpts=PTS-STARTPTS`
        if      (speed === 0.5) af += ',atempo=0.5'
        else if (speed === 2)   af += ',atempo=2.0'
        af += `,volume=${vol.toFixed(4)}`
        af += `[ca${i}]`
        fc.push(af)
        aStream.push(`[ca${i}]`)
      }

      // Concat clips
      let compositeV, compositeA
      if (clips.length === 1) {
        compositeV = vStream[0]
        compositeA = aStream[0]
      } else {
        fc.push(`${vStream.join('')}concat=n=${clips.length}:v=1:a=0[concatv]`)
        fc.push(`${aStream.join('')}concat=n=${clips.length}:v=0:a=1[concata]`)
        compositeV = '[concatv]'
        compositeA = '[concata]'
      }

      // External audio tracks
      const mixSources = [compositeA]
      for (const { seg, track, idx: i } of audioInputs) {
        const vol       = seg.volume ?? 1
        const startMs   = Math.round((track.startOffset || 0) * 1000)
        const ts        = seg.trimStart || 0
        const dur       = seg.duration

        let af = `[${i}:a]`
        af += `atrim=start=${ts.toFixed(4)}:duration=${dur.toFixed(4)},asetpts=PTS-STARTPTS`
        af += `,volume=${vol.toFixed(4)}`
        if (seg.fadeOut) {
          const fadeDur   = Math.min(2, dur * 0.3)
          const fadeStart = (dur - fadeDur).toFixed(4)
          af += `,afade=t=out:st=${fadeStart}:d=${fadeDur.toFixed(4)}`
        }
        if (startMs > 0) af += `,adelay=${startMs}|${startMs}`
        af += `[ta${i}]`
        fc.push(af)
        mixSources.push(`[ta${i}]`)
      }

      if (mixSources.length > 1) {
        fc.push(`${mixSources.join('')}amix=inputs=${mixSources.length}:duration=first:normalize=0[mixaudio]`)
        compositeA = '[mixaudio]'
      }

      // Image overlays (full-canvas transparent PNGs → overlay at 0,0)
      for (const { ov, idx: i } of imgInputs) {
        const start = (ov.startTime || 0).toFixed(4)
        const end   = ((ov.startTime || 0) + (ov.duration || 5)).toFixed(4)
        const next  = `[imgv${i}]`
        fc.push(`${compositeV}[${i}:v]overlay=0:0:enable='between(t,${start},${end})'${next}`)
        compositeV = next
      }

      // Video overlays
      for (const { ov, idx: i } of vidOvInputs) {
        const speed   = ov.speed || 1
        const ts      = ov.trimStart || 0
        const srcDur  = ov.duration
        const w       = Math.round((ov.widthPct ?? 0.35) * CW)
        const x       = Math.round(ov.x * CW - w / 2)
        const y       = Math.round(ov.y * CH - w / 2)  // approximate; aspect handled by scale
        const start   = (ov.startTime || 0).toFixed(4)
        const end     = ((ov.startTime || 0) + srcDur / speed).toFixed(4)

        let ovf = `[${i}:v]`
        ovf += `trim=start=${ts.toFixed(4)}:duration=${srcDur.toFixed(4)},setpts=PTS-STARTPTS`
        if (speed !== 1) ovf += `,setpts=PTS/${speed.toFixed(4)}`
        ovf += `,scale=${w}:-2`
        ovf += `[ovscaled${i}]`
        fc.push(ovf)

        const next = `[vidovv${i}]`
        fc.push(`${compositeV}[ovscaled${i}]overlay=${x}:${y}:enable='between(t,${start},${end})'${next}`)
        compositeV = next
      }

      // Text overlays (full-canvas transparent PNGs)
      for (const { t, idx: i } of textInputs) {
        const start = (t.startTime || 0).toFixed(4)
        const end   = ((t.startTime || 0) + (t.duration || 5)).toFixed(4)
        const next  = `[textv${i}]`
        fc.push(`${compositeV}[${i}:v]overlay=0:0:enable='between(t,${start},${end})'${next}`)
        compositeV = next
      }

      // ── Assemble full ffmpeg command ───────────────────────────────────────
      const cmd = [...ffArgs]

      if (fc.length > 0) {
        cmd.push('-filter_complex', fc.join(';'))
        cmd.push('-map', compositeV)
        cmd.push('-map', compositeA)
      } else {
        cmd.push('-map', '0:v')
        cmd.push('-map', '0:a')
      }

      cmd.push(
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-crf', '23',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart',
        '-y', 'output.mp4',
      )

      await ffmpeg.exec(cmd)

      // ── Read result and trigger download ────────────────────────────────────
      stopTicker()
      setPhase(i18n.t('export.phase_download'))
      setProgress(97)

      const data = await ffmpeg.readFile('output.mp4')
      const blob = new Blob([data.buffer], { type: 'video/mp4' })
      setDownloadUrl(URL.createObjectURL(blob))
      setStatus('done')
      setProgress(100)

      // Cleanup FS
      const allFiles = [
        ...clipInputs.map((x) => x.fname),
        ...audioInputs.map((x) => x.fname),
        ...imgInputs.map((x) => x.fname),
        ...vidOvInputs.map((x) => x.fname),
        ...textInputs.map((x) => x.fname),
      ]
      for (const f of allFiles) { try { await ffmpeg.deleteFile(f) } catch (_) {} }
      try { await ffmpeg.deleteFile('output.mp4') } catch (_) {}

    } catch (err) {
      console.error('[Export error]', err)
      // Stringify err regardless of its shape (Error, string, object, etc.)
      const msg = err instanceof Error
        ? err.message
        : (typeof err === 'string' ? err : JSON.stringify(err))
      if (msg && (msg.includes(':a') || msg.includes('audio') || msg.includes('stream'))) {
        setErrorMsg(i18n.t('export.error_audio'))
      } else {
        setErrorMsg(msg || i18n.t('export.error_unknown'))
      }
      stopTicker()
      setStatus('error')
    }
  }, [loadFFmpeg])

  return { exportVideo, cancel, status, phase, progress, errorMsg, downloadUrl, reset }
}
