import { useRef, useState, useCallback } from 'react'
import i18next from 'i18next'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'

// Output canvas sizes per ratio
const CANVAS_SIZES = {
  '9:16': { w: 720,  h: 1280 },
  '16:9': { w: 1280, h: 720  },
  '1:1':  { w: 720,  h: 720  },
}

const CORE_JS   = `${location.origin}/ffmpeg-core.js`
const CORE_WASM = `${location.origin}/ffmpeg-core.wasm`

// ── Canvas helpers ─────────────────────────────────────────────────────────────

function canvasToPng(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png')
  })
}

async function renderTextLayerToPng(text, CW, CH) {
  const canvas = document.createElement('canvas')
  canvas.width = CW
  canvas.height = CH
  const ctx = canvas.getContext('2d')
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
  ctx.globalAlpha  = text.opacity ?? 1
  ctx.fillStyle    = text.color || '#ffffff'
  ctx.shadowColor  = 'rgba(0,0,0,0.85)'
  ctx.shadowBlur   = Math.max(3, fontSize * 0.08)
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text.content, Math.round(text.x * CW), Math.round(text.y * CH))
  return canvasToPng(canvas)
}

async function renderImageLayerToPng(overlay, CW, CH) {
  const canvas = document.createElement('canvas')
  canvas.width  = CW
  canvas.height = CH
  const ctx = canvas.getContext('2d')
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

// ── Filter builder ─────────────────────────────────────────────────────────────
// clipAudioPresence: boolean[] — true if clip[j] actually has an audio stream

function buildFilterComplex({ clipInputs, clipAudioPresence, audioInputs, imgInputs, vidOvInputs, textInputs, CW, CH }) {
  const fc      = []
  const vStream = []
  const aStream = []

  for (let j = 0; j < clipInputs.length; j++) {
    const { clip, idx: i } = clipInputs[j]
    const speed  = clip.speed    || 1
    const vol    = clip.muted    ? 0 : (clip.volume ?? 1)
    const ts     = clip.trimStart || 0
    const srcDur = clip.duration

    // Video
    let vf = `[${i}:v]`
    vf += `trim=start=${ts.toFixed(4)}:duration=${srcDur.toFixed(4)},setpts=PTS-STARTPTS`
    if (speed !== 1) vf += `,setpts=PTS/${speed.toFixed(4)}`
    vf += `,scale=${CW}:${CH}:force_original_aspect_ratio=decrease`
    vf += `,pad=${CW}:${CH}:(ow-iw)/2:(oh-ih)/2:black,fps=30`
    vf += `[cv${i}]`
    fc.push(vf)
    vStream.push(`[cv${i}]`)

    // Audio — use anullsrc when clip has no audio stream, is muted, or vol=0
    if (clipAudioPresence[j] && !clip.muted && vol > 0) {
      let af = `[${i}:a]`
      af += `atrim=start=${ts.toFixed(4)}:duration=${srcDur.toFixed(4)},asetpts=PTS-STARTPTS`
      if      (speed === 0.5) af += ',atempo=0.5'
      else if (speed === 2)   af += ',atempo=2.0'
      af += `,volume=${vol.toFixed(4)}`
      af += `[ca${i}]`
      fc.push(af)
    } else {
      fc.push(`anullsrc=r=44100:cl=stereo,atrim=duration=${srcDur.toFixed(4)},asetpts=PTS-STARTPTS[ca${i}]`)
    }
    aStream.push(`[ca${i}]`)
  }

  let compositeV, compositeA
  if (clipInputs.length === 1) {
    compositeV = vStream[0]
    compositeA = aStream[0]
  } else {
    fc.push(`${vStream.join('')}concat=n=${clipInputs.length}:v=1:a=0[concatv]`)
    fc.push(`${aStream.join('')}concat=n=${clipInputs.length}:v=0:a=1[concata]`)
    compositeV = '[concatv]'
    compositeA = '[concata]'
  }

  const mixSources = [compositeA]
  for (const { seg, track, idx: i } of audioInputs) {
    const vol     = seg.volume ?? 1
    const startMs = Math.round((track.startOffset || 0) * 1000)
    const ts      = seg.trimStart || 0
    const dur     = seg.duration
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

  for (const { ov, idx: i } of imgInputs) {
    const start = (ov.startTime || 0).toFixed(4)
    const end   = ((ov.startTime || 0) + (ov.duration || 5)).toFixed(4)
    const next  = `[imgv${i}]`
    fc.push(`${compositeV}[${i}:v]overlay=0:0:enable='between(t,${start},${end})'${next}`)
    compositeV = next
  }

  for (const { ov, idx: i } of vidOvInputs) {
    const speed  = ov.speed || 1
    const ts     = ov.trimStart || 0
    const srcDur = ov.duration
    const w      = Math.round((ov.widthPct ?? 0.35) * CW)
    const x      = Math.round(ov.x * CW - w / 2)
    const y      = Math.round(ov.y * CH - w / 2)
    const start  = (ov.startTime || 0).toFixed(4)
    const end    = ((ov.startTime || 0) + srcDur / speed).toFixed(4)
    let ovf = `[${i}:v]`
    ovf += `trim=start=${ts.toFixed(4)}:duration=${srcDur.toFixed(4)},setpts=PTS-STARTPTS`
    if (speed !== 1) ovf += `,setpts=PTS/${speed.toFixed(4)}`
    ovf += `,scale=${w}:-2[ovscaled${i}]`
    fc.push(ovf)
    const next = `[vidovv${i}]`
    fc.push(`${compositeV}[ovscaled${i}]overlay=${x}:${y}:enable='between(t,${start},${end})'${next}`)
    compositeV = next
  }

  for (const { t: txt, idx: i } of textInputs) {
    const start = (txt.startTime || 0).toFixed(4)
    const end   = ((txt.startTime || 0) + (txt.duration || 5)).toFixed(4)
    const next  = `[textv${i}]`
    fc.push(`${compositeV}[${i}:v]overlay=0:0:enable='between(t,${start},${end})'${next}`)
    compositeV = next
  }

  return { fcStr: fc.join(';'), compositeV, compositeA }
}

function buildCmd(ffArgs, fcStr, compositeV, compositeA) {
  return [
    ...ffArgs,
    '-filter_complex', fcStr,
    '-map', compositeV,
    '-map', compositeA,
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-crf', '23',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-movflags', '+faststart',
    '-y', 'output.mp4',
  ]
}

// ── Hook ──────────────────────────────────────────────────────────────────────

function easedProgress(p) {
  return 15 + Math.pow(p, 0.55) * 77
}

const tr = (key, opts) => i18next.t(key, opts)

export function useExport() {
  const ffmpegRef    = useRef(null)
  const tickerRef    = useRef(null)
  const [status,      setStatus]      = useState('idle')
  const [phase,       setPhase]       = useState('')
  const [progress,    setProgress]    = useState(0)
  const [errorMsg,    setErrorMsg]    = useState('')
  const [downloadUrl, setDownloadUrl] = useState(null)

  function startTicker(fromPct) {
    stopTicker()
    let current = fromPct
    tickerRef.current = setInterval(() => {
      const ceiling = 93
      if (current >= ceiling) return
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
    if (ffmpegRef.current) {
      try { ffmpegRef.current.terminate() } catch (_) {}
      ffmpegRef.current = null
    }
    reset()
  }, [reset])

  const loadFFmpeg = useCallback(async () => {
    if (ffmpegRef.current?.loaded) return ffmpegRef.current
    const ffmpeg = new FFmpeg()
    ffmpeg.on('progress', ({ progress: p }) => {
      setProgress((prev) => Math.max(prev, Math.round(easedProgress(p))))
    })
    await ffmpeg.load({ coreURL: CORE_JS, wasmURL: CORE_WASM })
    ffmpegRef.current = ffmpeg
    return ffmpeg
  }, [])

  const exportVideo = useCallback(async ({ clips, audioTracks, overlays, texts, ratio }) => {
    setStatus('loading')
    setProgress(2)
    setErrorMsg('')
    setDownloadUrl(null)

    let ffmpeg     = null
    let logHandler = null
    const ffmpegLogs = []

    try {
      setPhase(tr('export.phase_loading'))
      ffmpeg = await loadFFmpeg()

      logHandler = ({ message }) => { console.debug('[FFmpeg]', message); ffmpegLogs.push(message) }
      ffmpeg.on('log', logHandler)

      setStatus('processing')
      setPhase(tr('export.phase_preparing'))
      setProgress(10)

      const { w: CW, h: CH } = CANVAS_SIZES[ratio] ?? { w: 1280, h: 720 }
      const ffArgs = []
      let   idx    = 0

      // ── Write input files ────────────────────────────────────────────────────
      const clipInputs = []
      for (let i = 0; i < clips.length; i++) {
        const clip  = clips[i]
        const ext   = clip.name.split('.').pop().toLowerCase() || 'mp4'
        const fname = `clip${idx}.${ext}`
        setPhase(tr('export.phase_clip', { n: i + 1, total: clips.length }))
        await ffmpeg.writeFile(fname, await fetchFile(clip.file))
        ffArgs.push('-i', fname)
        clipInputs.push({ clip, fname, idx: idx++ })
      }

      const audioInputs = []
      for (const track of audioTracks) {
        for (const seg of track.segments) {
          const ext   = seg.name.split('.').pop().toLowerCase() || 'mp3'
          const fname = `audio${idx}.${ext}`
          await ffmpeg.writeFile(fname, await fetchFile(seg.file))
          ffArgs.push('-i', fname)
          audioInputs.push({ seg, track, fname, idx: idx++ })
        }
      }

      const imgInputs = []
      for (const ov of overlays.filter((o) => o.type === 'image')) {
        const fname = `imgov${idx}.png`
        setPhase(tr('export.phase_image'))
        const blob = await renderImageLayerToPng(ov, CW, CH)
        await ffmpeg.writeFile(fname, await fetchFile(blob))
        ffArgs.push('-i', fname)
        imgInputs.push({ ov, fname, idx: idx++ })
      }

      const vidOvInputs = []
      for (const ov of overlays.filter((o) => o.type === 'video')) {
        const ext   = ov.name.split('.').pop().toLowerCase() || 'mp4'
        const fname = `vidov${idx}.${ext}`
        await ffmpeg.writeFile(fname, await fetchFile(ov.objectUrl))
        ffArgs.push('-i', fname)
        vidOvInputs.push({ ov, fname, idx: idx++ })
      }

      const textInputs = []
      for (const txt of texts.filter((tx) => tx.content?.trim())) {
        const fname = `text${idx}.png`
        setPhase(tr('export.phase_text_prep'))
        const blob = await renderTextLayerToPng(txt, CW, CH)
        await ffmpeg.writeFile(fname, await fetchFile(blob))
        ffArgs.push('-i', fname)
        textInputs.push({ t: txt, fname, idx: idx++ })
      }

      setPhase(tr('export.phase_exporting'))
      setProgress(15)
      startTicker(15)

      // ── First exec attempt: assume all non-muted clips have audio ────────────
      // clipAudioPresence starts optimistic; corrected on retry if needed
      let clipAudioPresence = clipInputs.map(({ clip }) => !clip.muted && (clip.volume ?? 1) > 0)

      let { fcStr, compositeV, compositeA } = buildFilterComplex({
        clipInputs, clipAudioPresence, audioInputs, imgInputs, vidOvInputs, textInputs, CW, CH,
      })
      let cmd = buildCmd(ffArgs, fcStr, compositeV, compositeA)
      console.debug('[FFmpeg] cmd:', cmd.join(' '))

      let execError = null
      try {
        await ffmpeg.exec(cmd)
      } catch (e) {
        execError = e
      }

      // ── Retry if clips had no audio stream (FFmpeg aborted with FS error) ───
      if (execError) {
        const isNoStream = ffmpegLogs.some((l) => l.includes('matches no streams'))
        if (!isNoStream) throw execError

        setPhase(tr('export.phase_preparing'))
        stopTicker()

        // Parse which clips actually had audio from the logs of the failed run
        clipAudioPresence = clipInputs.map((_, j) =>
          ffmpegLogs.some((l) => l.includes(`Stream #${j}:`) && l.includes(' Audio:'))
        )
        console.debug('[FFmpeg] retry — clip audio presence:', clipAudioPresence)

        // WASM was aborted — terminate and reload a fresh instance
        if (ffmpegRef.current) { try { ffmpegRef.current.terminate() } catch (_) {} ffmpegRef.current = null }
        ffmpeg = await loadFFmpeg()
        ffmpeg.on('log', logHandler)

        // Re-upload all files into the fresh WASM FS
        for (const { clip, fname } of clipInputs) {
          await ffmpeg.writeFile(fname, await fetchFile(clip.file))
        }
        for (const { seg, fname } of audioInputs) {
          await ffmpeg.writeFile(fname, await fetchFile(seg.file))
        }
        for (const { ov, fname } of imgInputs) {
          const blob = await renderImageLayerToPng(ov, CW, CH)
          await ffmpeg.writeFile(fname, await fetchFile(blob))
        }
        for (const { ov, fname } of vidOvInputs) {
          await ffmpeg.writeFile(fname, await fetchFile(ov.objectUrl))
        }
        for (const { t: txt, fname } of textInputs) {
          const blob = await renderTextLayerToPng(txt, CW, CH)
          await ffmpeg.writeFile(fname, await fetchFile(blob))
        }

        // Rebuild filter with corrected audio presence and re-run
        ;({ fcStr, compositeV, compositeA } = buildFilterComplex({
          clipInputs, clipAudioPresence, audioInputs, imgInputs, vidOvInputs, textInputs, CW, CH,
        }))
        cmd = buildCmd(ffArgs, fcStr, compositeV, compositeA)
        console.debug('[FFmpeg] retry cmd:', cmd.join(' '))

        setProgress(15)
        startTicker(15)
        await ffmpeg.exec(cmd)
      }

      // ── Done ─────────────────────────────────────────────────────────────────
      stopTicker()
      setPhase(tr('export.phase_download'))
      setProgress(97)

      const data = await ffmpeg.readFile('output.mp4')
      const blob = new Blob([data.buffer], { type: 'video/mp4' })
      setDownloadUrl(URL.createObjectURL(blob))
      setStatus('done')
      setProgress(100)

      if (logHandler) ffmpeg.off('log', logHandler)
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
      if (ffmpeg && logHandler) { try { ffmpeg.off('log', logHandler) } catch (_) {} }

      // Terminate so retries start clean
      if (ffmpegRef.current) {
        try { ffmpegRef.current.terminate() } catch (_) {}
        ffmpegRef.current = null
      }

      const msg = err instanceof Error
        ? err.message
        : (typeof err === 'string' ? err : JSON.stringify(err))

      if (msg && (msg.includes(':a') || msg.includes('audio') || msg.includes('stream'))) {
        setErrorMsg(tr('export.error_audio'))
      } else {
        setErrorMsg(msg || tr('export.error_unknown'))
      }
      stopTicker()
      setStatus('error')
    }
  }, [loadFFmpeg])

  return { exportVideo, cancel, status, phase, progress, errorMsg, downloadUrl, reset }
}
