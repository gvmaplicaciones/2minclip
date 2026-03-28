import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import es from './locales/es.json'
import en from './locales/en.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
    },
    fallbackLng: 'es',
    supportedLngs: ['es', 'en'],
    detection: {
      // Orden: primero lo guardado en localStorage, luego el idioma del navegador
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: '2minclip_lang',
    },
    interpolation: {
      escapeValue: false, // React ya escapa por defecto
    },
  })

export default i18n
