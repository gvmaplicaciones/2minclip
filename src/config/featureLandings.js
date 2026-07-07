// Long-tail feature landing pages (SEO fase 2).
// Cada entrada define el slug por idioma; el contenido (meta, H1, bullets, FAQ)
// vive en los locales bajo featureLandings.<key>.*
export const FEATURE_LANDINGS = [
  { key: 'cut',    slugEs: 'cortar-video',                     slugEn: 'trim-video' },
  { key: 'merge',  slugEs: 'unir-videos',                      slugEn: 'merge-videos' },
  { key: 'speed',  slugEs: 'cambiar-velocidad-video',          slugEn: 'video-speed-changer' },
  { key: 'music',  slugEs: 'anadir-musica-video',              slugEn: 'add-music-to-video' },
  { key: 'text',   slugEs: 'anadir-texto-video',               slugEn: 'add-text-to-video' },
  { key: 'social', slugEs: 'video-para-tiktok-reels-instagram', slugEn: 'video-for-tiktok-reels-instagram' },
]

export function pathFor(key, lang) {
  const f = FEATURE_LANDINGS.find((x) => x.key === key)
  if (!f) return lang === 'en' ? '/en' : '/'
  return lang === 'en' ? `/en/${f.slugEn}` : `/${f.slugEs}`
}
