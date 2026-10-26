import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import ptBR from './locales/pt_BR.json'

i18n.use(initReactI18next).init({
    resources: {
        pt_BR: { translation: ptBR },
        en: { translation: en },
    },
    lng: 'pt_BR',
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false,
    },
})
