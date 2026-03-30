import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'

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

  const flags = { es: '🇪🇸', en: '🇬🇧' }
  const labels = { es: 'ES', en: 'EN' }

  return (
    <button
      onClick={switchLanguage}
      className="flex items-center gap-1.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md px-3 py-1.5 text-xs font-medium hover:border-[#444] transition-colors"
      aria-label="Cambiar idioma / Switch language"
    >
      <span className="text-base leading-none">{flags[currentLang]}</span>
      <span className="text-[#e87040] font-bold">{labels[currentLang]}</span>
      <span className="text-[#333]">→</span>
      <span className="text-base leading-none">{flags[otherLang]}</span>
      <span className="text-[#555]">{labels[otherLang]}</span>
    </button>
  )
}
