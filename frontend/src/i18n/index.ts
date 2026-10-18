import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { loadAppPreferences, updateAppPreferences } from '../lib/appPreferences.ts'
import { setApiLanguage } from '../lib/api.ts'
import { LANGUAGES, resolveLanguage } from './languages.ts'
import enCommon from './locales/en/common.json'
import jaCommon from './locales/ja/common.json'

const savedLanguage = loadAppPreferences().language ?? 'en'

void i18n.use(initReactI18next).init({
  resources: {
    en: { common: enCommon },
    ja: { common: jaCommon },
  },
  lng: savedLanguage,
  fallbackLng: 'en',
  supportedLngs: Object.keys(LANGUAGES),
  defaultNS: 'common',
  interpolation: { escapeValue: false },
})

function syncLanguage(language: string) {
  const resolvedLanguage = resolveLanguage(language)
  updateAppPreferences({ language: resolvedLanguage })
  document.documentElement.lang = resolvedLanguage
  setApiLanguage(resolvedLanguage)
}

i18n.on('languageChanged', syncLanguage)
syncLanguage(i18n.resolvedLanguage ?? i18n.language)

export function getActiveIntlLocale() {
  return LANGUAGES[resolveLanguage(i18n.resolvedLanguage ?? i18n.language)].locale
}

export default i18n
