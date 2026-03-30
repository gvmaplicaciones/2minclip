import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import es from './locales/es.json'
import en from './locales/en.json'

// La URL es la única fuente de verdad del idioma.
// /en → inglés, cualquier otra ruta → español.
const lng = window.location.pathname.startsWith('/en') ? 'en' : 'es'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
    },
    lng,
    fallbackLng: 'es',
    supportedLngs: ['es', 'en'],
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
