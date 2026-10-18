export const LANGUAGES = {
  en: { label: 'English', locale: 'en-US', defaultTimeFormat: '12-hour' },
  ja: { label: '日本語', locale: 'ja-JP', defaultTimeFormat: '24-hour' },
} as const

export type Language = keyof typeof LANGUAGES

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && Object.hasOwn(LANGUAGES, value)
}

export function resolveLanguage(value: string | undefined): Language {
  if (isLanguage(value)) return value
  if (value?.toLowerCase().startsWith('ja')) return 'ja'
  return 'en'
}
