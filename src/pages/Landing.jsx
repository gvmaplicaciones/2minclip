import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useEditor } from '../context/EditorContext'
import { readVideoMeta } from '../utils/videoMeta'

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm']
const ALLOWED_EXTS = ['.mp4', '.mov', '.webm']

const RATIOS = [
  { value: '9:16', labelKey: 'landing.format_9_16' },
  { value: '16:9', labelKey: 'landing.format_16_9' },
  { value: '1:1',  labelKey: 'landing.format_1_1'  },
]

export default function Landing({ lang }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { setRatio, setClips } = useEditor()

  const [pendingClips, setPendingClips] = useState([])
  const [selectedRatio, setSelectedRatio] = useState('9:16')
  const [uploadError, setUploadError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (lang && lang !== i18n.language) i18n.changeLanguage(lang)
  }, [lang, i18n])

  useEffect(() => {
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  useEffect(() => {
    if (pendingClips.length === 0) return
    const handler = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [pendingClips.length])

  async function processFiles(files) {
    setUploadError('')
    const toProcess = []
    for (const f of files) {
      const ext = '.' + f.name.split('.').pop().toLowerCase()
      if (!ALLOWED_VIDEO_TYPES.includes(f.type) && !ALLOWED_EXTS.includes(ext)) {
        setUploadError(t('errors.invalid_format'))
        continue
      }
      const MAX_CLIP_MB = 200
      if (f.size > MAX_CLIP_MB * 1024 * 1024) {
        setUploadError(t('errors.file_too_large', { mb: Math.round(f.size / 1024 / 1024), max: MAX_CLIP_MB }))
        continue
      }
      toProcess.push(f)
    }
    if (toProcess.length === 0) return

    const newClips = await Promise.all(
      toProcess.map(async (f) => {
        const objectUrl = URL.createObjectURL(f)
        const { duration, thumbnail, videoWidth, videoHeight } = await readVideoMeta(f)
        return {
          id: crypto.randomUUID(),
          name: f.name,
          file: f,
          objectUrl,
          duration,
          thumbnail,
          videoWidth,
          videoHeight,
          trimStart: 0,
          speed: 1,
          volume: 1,
          muted: false,
        }
      })
    )
    setPendingClips((prev) => [...prev, ...newClips])
  }

  function handleInputChange(e) {
    processFiles(Array.from(e.target.files))
    e.target.value = ''
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    processFiles(Array.from(e.dataTransfer.files))
  }

  function handleStart() {
    if (pendingClips.length === 0) return
    setRatio(selectedRatio)
    setClips(pendingClips)
    navigate('/editor')
  }

  const isEn = i18n.language === 'en'

  return (
    <>
      <Helmet>
        {isEn ? (
          <title>Free Online Video Editor | 2minclip — No install, no signup</title>
        ) : (
          <title>Editor de vídeo online gratis | 2minclip — Sin instalar, sin registrarse</title>
        )}
        {isEn ? (
          <meta name="description" content="Edit your videos online for free in 2 minutes. Cut, merge, add music and export to MP4 with no install and no account required." />
        ) : (
          <meta name="description" content="Edita tus vídeos online gratis en 2 minutos. Corta, une, añade música y exporta en MP4 sin instalar nada ni crear cuenta." />
        )}
        <link rel="canonical" href={isEn ? 'https://2minclip.com/en' : 'https://2minclip.com'} />
        <link rel="alternate" hreflang="es" href="https://2minclip.com" />
        <link rel="alternate" hreflang="en" href="https://2minclip.com/en" />
        <link rel="alternate" hreflang="x-default" href="https://2minclip.com" />
      </Helmet>

    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans">

      {/* ── NAV ── */}
      <nav className="border-b border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 md:px-10 py-4">
          <span className="text-xl font-bold tracking-tight select-none">
            <span className="text-white">2min</span>
            <span className="text-[#e87040]">clip</span>
          </span>
          <LanguageSwitcher />
        </div>
      </nav>

      <main>

        {/* ── HERO ── */}
        <section className="max-w-6xl mx-auto px-5 md:px-10 pt-10 pb-16 md:pt-16 md:pb-20">
          <div className="md:grid md:grid-cols-2 md:gap-16 md:items-start">

            {/* ── LEFT: texto ── */}
            <div className="mb-10 md:mb-0 md:pt-2">
              <p className="text-sm text-[#555] mb-2">{t('landing.sub_tagline')}</p>
              <div className="w-10 h-0.5 bg-[#e87040] rounded mb-6" />

              <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight text-white mb-4">
                {t('landing.h1')}
              </h1>
              <p className="text-sm md:text-base text-[#888] leading-relaxed mb-8">
                {t('landing.tagline')}
              </p>

              {/* Pills */}
              <div className="flex flex-wrap gap-2 mb-8">
                <span className="pill">{t('landing.pill_no_signup')}</span>
                <span className="pill">{t('landing.pill_no_install')}</span>
                <span className="pill">{t('landing.pill_free')}</span>
              </div>

              {/* Features list — solo desktop */}
              <ul className="hidden md:block space-y-3 text-sm text-[#666]">
                <li className="flex items-center gap-2"><span className="text-[#e87040]">✓</span> Corta, une y reordena clips</li>
                <li className="flex items-center gap-2"><span className="text-[#e87040]">✓</span> Añade audio, texto e imágenes</li>
                <li className="flex items-center gap-2"><span className="text-[#e87040]">✓</span> Exporta en MP4 H.264 sin marca de agua</li>
                <li className="flex items-center gap-2"><span className="text-[#e87040]">✓</span> 100% en tu navegador — tus vídeos no salen de tu dispositivo</li>
              </ul>
            </div>

            {/* ── RIGHT: upload + formato + CTA ── */}
            <div>
              {/* Upload zone */}
              <div
                className={`relative border-2 border-dashed rounded-xl transition-colors cursor-pointer mb-4
                  ${isDragging
                    ? 'border-[#e87040] bg-[#1f1008]'
                    : 'border-[#2a2a2a] bg-[#141414] hover:border-[#444]'
                  }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm"
                  multiple
                  className="hidden"
                  onChange={handleInputChange}
                />

                {pendingClips.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-12 px-6 select-none">
                    <IconUpload />
                    <p className="text-sm font-medium text-[#ccc]">{t('landing.upload_title')}</p>
                    <p className="text-xs text-[#555] text-center">{t('landing.upload_desc')}</p>
                  </div>
                ) : (
                  <div className="p-4 space-y-2" onClick={(e) => e.stopPropagation()}>
                    {pendingClips.map((clip) => (
                      <div key={clip.id} className="flex items-center gap-3 bg-[#1a1a1a] rounded-lg px-3 py-2">
                        {clip.thumbnail && (
                          <img
                            src={clip.thumbnail}
                            alt=""
                            className="w-10 h-7 object-cover rounded flex-shrink-0"
                            style={{ background: '#000' }}
                          />
                        )}
                        <span className="text-xs text-[#ccc] truncate flex-1 min-w-0">{clip.name}</span>
                        <span className="text-xs text-[#555] flex-shrink-0">{(clip.file.size / 1024 / 1024).toFixed(1)} MB</span>
                        <span className="text-xs text-[#555] flex-shrink-0">{formatDuration(clip.duration)}</span>
                        <button
                          className="text-[#555] hover:text-[#e87040] flex-shrink-0 text-lg leading-none ml-1"
                          onClick={() => setPendingClips((prev) => prev.filter((c) => c.id !== clip.id))}
                          aria-label="Eliminar clip"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      className="flex items-center gap-2 text-xs text-[#555] hover:text-[#888] transition-colors pt-1"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <span className="text-base leading-none">+</span>
                      {t('landing.upload_add_more')}
                    </button>
                  </div>
                )}
              </div>

              {uploadError && (
                <p className="text-[#e87040] text-xs mb-3">{uploadError}</p>
              )}

              {/* Format selector */}
              <div className="mb-4">
                <p className="text-xs text-[#555] mb-2">{t('landing.format_label')}</p>
                <div className="flex gap-2">
                  {RATIOS.map(({ value, labelKey }) => (
                    <button
                      key={value}
                      onClick={() => setSelectedRatio(value)}
                      className={`flex-1 py-2 px-1 rounded-lg text-xs font-medium border transition-colors
                        ${selectedRatio === value
                          ? 'border-[#e87040] bg-[#1f1008] text-[#e87040]'
                          : 'border-[#2a2a2a] bg-[#141414] text-[#666] hover:border-[#444]'
                        }`}
                    >
                      {t(labelKey)}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-[#444] mt-1.5">{t('landing.format_warning')}</p>
              </div>

              {/* CTA */}
              <button
                onClick={handleStart}
                disabled={pendingClips.length === 0}
                className={`btn-primary w-full transition-opacity
                  ${pendingClips.length === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                {t('landing.start_editing')} →
              </button>
            </div>

          </div>
        </section>

        {/* ── CÓMO FUNCIONA ── */}
        <section className="border-t border-[#1a1a1a]" aria-labelledby="how-heading">
          <div className="max-w-6xl mx-auto px-5 md:px-10 py-14">
            <h2 id="how-heading" className="text-base font-semibold text-white mb-8">
              {t('landing.how_title')}
            </h2>
            <ol className="grid md:grid-cols-3 gap-8">
              <Step icon={<IconFormat />} title={t('landing.step1_title')} desc={t('landing.step1_desc')} />
              <Step icon={<IconScissors />} title={t('landing.step2_title')} desc={t('landing.step2_desc')} />
              <Step icon={<IconDownload />} title={t('landing.step3_title')} desc={t('landing.step3_desc')} />
            </ol>
          </div>
        </section>

        {/* ── PARA QUÉ SIRVE ── */}
        <section className="border-t border-[#1a1a1a]" aria-labelledby="why-heading">
          <div className="max-w-6xl mx-auto px-5 md:px-10 py-14">
            <h2 id="why-heading" className="text-base font-semibold text-white mb-4">
              {t('landing.why_title')}
            </h2>
            <p className="text-sm text-[#666] leading-relaxed max-w-2xl">{t('landing.why_text')}</p>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="border-t border-[#1a1a1a]" aria-labelledby="faq-heading">
          <div className="max-w-6xl mx-auto px-5 md:px-10 py-14">
            <h2 id="faq-heading" className="text-base font-semibold text-white mb-6">
              {t('landing.faq_title')}
            </h2>
            <dl className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <article key={n} className="bg-[#161616] border border-[#2a2a2a] rounded-xl px-4 py-4">
                  <dt className="text-sm font-medium text-[#ddd] mb-1.5">{t(`landing.faq_${n}_q`)}</dt>
                  <dd className="text-sm text-[#666] leading-relaxed">{t(`landing.faq_${n}_a`)}</dd>
                </article>
              ))}
            </dl>
          </div>
        </section>

        {/* ── SEGUNDO CTA ── */}
        <section className="border-t border-[#1a1a1a]">
          <div className="max-w-6xl mx-auto px-5 md:px-10 py-14">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="btn-primary"
            >
              {t('landing.start_editing')} →
            </button>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto px-5 md:px-10 py-6 text-center">
          <p className="text-xs text-[#333]">{t('landing.footer')}</p>
        </div>
      </footer>

    </div>
    </>
  )
}

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function Step({ icon, title, desc }) {
  return (
    <li className="flex gap-4 items-start">
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#1c1c1c] border border-[#2a2a2a] flex items-center justify-center mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-[#ddd] mb-1">{title}</p>
        <p className="text-sm text-[#666] leading-relaxed">{desc}</p>
      </div>
    </li>
  )
}

function IconUpload() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M16 22V10" stroke="#555" strokeWidth="2" strokeLinecap="round"/>
      <path d="M11 15l5-5 5 5" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 24h20" stroke="#555" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function IconFormat() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="1.5" y="4" width="6" height="10" rx="1" stroke="#e87040" strokeWidth="1.5"/>
      <rect x="10" y="6" width="6.5" height="6" rx="1" stroke="#e87040" strokeWidth="1.5"/>
    </svg>
  )
}

function IconScissors() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="4.5" cy="4.5" r="2" stroke="#e87040" strokeWidth="1.4"/>
      <circle cx="4.5" cy="13.5" r="2" stroke="#e87040" strokeWidth="1.4"/>
      <line x1="6.2" y1="5.8" x2="15" y2="13.5" stroke="#e87040" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="6.2" y1="12.2" x2="15" y2="4.5" stroke="#e87040" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

function IconDownload() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 2v10" stroke="#e87040" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5.5 8.5L9 12l3.5-3.5" stroke="#e87040" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.5 14.5h13" stroke="#e87040" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
