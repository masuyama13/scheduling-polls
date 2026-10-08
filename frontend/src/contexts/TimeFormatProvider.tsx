import { useMemo, useState, type ReactNode } from 'react'
import { loadAppPreferences, updateAppPreferences } from '../lib/appPreferences.ts'
import { TimeFormatContext, type TimeFormat } from './timeFormat.ts'

function getSavedTimeFormat(): TimeFormat {
  return loadAppPreferences().timeFormat ?? '12-hour'
}

export function TimeFormatProvider({ children }: { children: ReactNode }) {
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(getSavedTimeFormat)

  const toggleTimeFormat = () => {
    setTimeFormat((currentFormat) => {
      const nextFormat = currentFormat === '12-hour' ? '24-hour' : '12-hour'

      updateAppPreferences({ timeFormat: nextFormat })

      return nextFormat
    })
  }

  const value = useMemo(() => ({ timeFormat, toggleTimeFormat }), [timeFormat])

  return <TimeFormatContext.Provider value={value}>{children}</TimeFormatContext.Provider>
}
