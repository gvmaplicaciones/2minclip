import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'

const FLAG_STYLE = { width: '1.2em', height: '0.9em', display: 'inline-block', borderRadius: '2px' }

function FlagES() {
  return (
    <svg viewBox="0 0 4 3" style={FLAG_STYLE} aria-hidden="true">
      <rect width="4" height="3" fill="#c60b1e" />
      <rect y="0.75" width="4" height="1.5" fill="#ffc400" />
    </svg>
  )
}

function FlagGB() {
  return (
    <svg viewBox="0 0 60 30" style={FLAG_STYLE} aria-hidden="true">
      <rect width="60" height="30" fill="#00247d" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#cf142b" strokeWidth="2" />
      <path d="M30,0 V30 M0,15 H60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 V30 M0,15 H60" stroke="#cf142b" strokeWidth="6" />
    </svg>
  )
}

const FLAGS = { es: FlagES, en: FlagGB }

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const currentLang = i18n.language?.startsWith('en') ? 'en' : 'es'
  const otherLang = currentLang === 'es' ? 'en' : 'es'

  function switchLanguage() {
    i18n.changeLanguage(otherLang)
    // Actualizar URL si estamos en una ruta de idioma conocida
    if (otherLang === 'en' && location.pathname === '/') {
      navigate('/en')
    } else if (otherLang === 'es' && location.pathname === '/en') {
      navigate('/')
    }
  }

  const labels = { es: 'ES', en: 'EN' }
  const CurrentFlag = FLAGS[currentLang]
  const OtherFlag = FLAGS[otherLang]

  return (
    <button
      onClick={switchLanguage}
      className="flex items-center gap-1.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md px-3 py-1.5 text-xs font-medium hover:border-[#444] transition-colors"
      aria-label="Cambiar idioma / Switch language"
    >
      <CurrentFlag />
      <span className="text-[#e87040] font-bold">{labels[currentLang]}</span>
      <span className="text-[#333]">→</span>
      <OtherFlag />
      <span className="text-[#555]">{labels[otherLang]}</span>
    </button>
  )
}
