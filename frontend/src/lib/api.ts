import axios from 'axios'
import type { Language } from '../i18n/languages.ts'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export function setApiLanguage(language: Language) {
  axios.defaults.headers.common['Accept-Language'] = language
}
