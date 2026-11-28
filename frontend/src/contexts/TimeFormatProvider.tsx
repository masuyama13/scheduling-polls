import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { loadAppPreferences, updateAppPreferences } from '../lib/appPreferences.ts'
import { TimeFormatContext, type TimeFormat } from './timeFormat.ts'
import { LANGUAGES, resolveLanguage } from '../i18n/languages.ts'

export function TimeFormatProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation()
  const language = resolveLanguage(i18n.resolvedLanguage ?? i18n.language)
  const [timeFormatPreference, setTimeFormatPreference] = useState<TimeFormat | undefined>(
    () => loadAppPreferences().timeFormat,
  )
  const timeFormat = timeFormatPreference ?? LANGUAGES[language].defaultTimeFormat

  const toggleTimeFormat = useCallback(() => {
    const nextFormat = timeFormat === '12-hour' ? '24-hour' : '12-hour'
    setTimeFormatPreference(nextFormat)
    updateAppPreferences({ timeFormat: nextFormat })
  }, [timeFormat])

  const value = useMemo(() => ({ timeFormat, toggleTimeFormat }), [timeFormat, toggleTimeFormat])

  return <TimeFormatContext.Provider value={value}>{children}</TimeFormatContext.Provider>
}
