import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useEditor } from '../context/EditorContext'
import { FEATURE_LANDINGS, pathFor } from '../config/featureLandings'

// Reusable long-tail landing for a single editor feature (cut, merge, speed...).
// Content lives in the locales under featureLandings.<featureKey>.*
export default function LandingFeature({ featureKey, lang }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { setRatio } = useEditor()
  const isEn = lang === 'en'
  const base = `featureLandings.${featureKey}`

  useEffect(() => {
    if (lang && lang !== i18n.language) i18n.changeLanguage(lang)
  }, [lang, i18n])

  useEffect(() => {
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  const urlEs = `https://www.2minclip.com${pathFor(featureKey, 'es')}`
  const urlEn = `https://www.2minclip.com${pathFor(featureKey, 'en')}`
  const canonical = isEn ? urlEn : urlEs

  const faqs = [1, 2, 3].map((n) => ({
    q: t(`${base}.faq_${n}_q`),
    a: t(`${base}.faq_${n}_a`),
  }))

  const jsonLdWebApp = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: '2minclip',
    url: canonical,
    description: t(`${base}.meta_description`),
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    browserRequirements: 'Requires JavaScript',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  }

  const jsonLdFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }

  // Drop straight into an empty editor — no upload/format step on these pages.
  function handleCta() {
    setRatio('9:16')
    navigate('/editor')
  }

  const otherFeatures = FEATURE_LANDINGS.filter((f) => f.key !== featureKey)

  return (
    <>
      <Helmet>
        <title>{t(`${base}.meta_title`)}</title>
        <meta name="description" content={t(`${base}.meta_description`)} />
        <link rel="canonical" href={canonical} />
        <link rel="alternate" hreflang="es" href={urlEs} />
        <link rel="alternate" hreflang="en" href={urlEn} />
        <link rel="alternate" hreflang="x-default" href={urlEs} />
        <script type="application/ld+json">{JSON.stringify(jsonLdWebApp)}</script>
        <script type="application/ld+json">{JSON.stringify(jsonLdFaq)}</script>
      </Helmet>

      <div className="min-h-screen bg-[#0f0f0f] text-white font-sans">

        {/* ── NAV ── */}
        <nav className="border-b border-[#1a1a1a]">
          <div className="max-w-6xl mx-auto flex items-center justify-between px-5 md:px-10 py-4">
            <Link to={isEn ? '/en' : '/'} className="text-xl font-bold tracking-tight select-none">
              <span className="text-white">2min</span>
              <span className="text-[#e87040]">clip</span>
            </Link>
            <div className="flex items-center gap-4">
              <a
                href="https://2minedit.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#8a8a8a] hover:text-[#e87040] transition-colors"
              >
                {isEn ? 'More tools →' : 'Más herramientas →'}
              </a>
              <LanguageSwitcher />
            </div>
          </div>
        </nav>

        <main>

          {/* ── HERO ── */}
          <section className="max-w-6xl mx-auto px-5 md:px-10 pt-10 pb-16 md:pt-16 md:pb-20">
            <div className="max-w-2xl">
              <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight text-white mb-4">
                {t(`${base}.h1`)}
              </h1>
              <p className="text-sm md:text-base text-[#888] leading-relaxed mb-8">
                {t(`${base}.subtitle`)}
              </p>

              <ul className="space-y-3 text-sm text-[#999999] mb-8">
                {[1, 2, 3].map((n) => (
                  <li key={n} className="flex items-start gap-2">
                    <span className="text-[#e87040] mt-0.5">✓</span>
                    <span>{t(`${base}.bullet${n}`)}</span>
                  </li>
                ))}
              </ul>

              <button onClick={handleCta} className="btn-primary w-full sm:w-auto sm:px-10">
                {t(`${base}.cta`)} →
              </button>
            </div>
          </section>

          {/* ── FAQ ── */}
          <section className="border-t border-[#1a1a1a]" aria-labelledby="faq-heading">
            <div className="max-w-6xl mx-auto px-5 md:px-10 py-14">
              <h2 id="faq-heading" className="text-base font-semibold text-white mb-6">
                {t(`${base}.faq_title`)}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {faqs.map(({ q, a }, i) => (
                  <details key={i} className="group bg-[#161616] border border-[#2a2a2a] rounded-xl px-4 py-4">
                    <summary className="flex items-center justify-between gap-3 cursor-pointer text-sm font-medium text-[#ddd] marker:content-none [&::-webkit-details-marker]:hidden">
                      <span>{q}</span>
                      <svg
                        className="shrink-0 w-3 h-3 text-[#8a8a8a] transition-transform group-open:rotate-180"
                        viewBox="0 0 12 12" fill="none" aria-hidden="true"
                      >
                        <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </summary>
                    <p className="text-sm text-[#999999] leading-relaxed mt-2">{a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* ── SEGUNDO CTA ── */}
          <section className="border-t border-[#1a1a1a]">
            <div className="max-w-6xl mx-auto px-5 md:px-10 py-14">
              <button onClick={handleCta} className="btn-primary">
                {t(`${base}.cta`)} →
              </button>
            </div>
          </section>

          {/* ── OTRAS HERRAMIENTAS ── */}
          <section className="border-t border-[#1a1a1a]">
            <div className="max-w-6xl mx-auto px-5 md:px-10 py-14">
              <h2 className="text-base font-semibold text-white mb-6">{t('landing.other_tools_title')}</h2>
              <div className="flex flex-wrap gap-2">
                <Link to={isEn ? '/en' : '/'} className="pill hover:border-[#e87040] transition-colors">
                  {t('landing.other_tools_home')}
                </Link>
                {otherFeatures.map((f) => (
                  <Link key={f.key} to={pathFor(f.key, lang)} className="pill hover:border-[#e87040] transition-colors">
                    {t(`featureLandings.${f.key}.nav_title`)}
                  </Link>
                ))}
              </div>
            </div>
          </section>

        </main>

        {/* ── FOOTER ── */}
        <footer className="border-t border-[#1a1a1a]">
          <div className="max-w-6xl mx-auto px-5 md:px-10 py-6 text-center">
            <p className="text-xs text-[#8a8a8a]">{t('landing.footer')}</p>
          </div>
        </footer>

      </div>
    </>
  )
}
