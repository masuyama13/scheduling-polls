import { useMemo, useState, type ReactNode } from 'react'
import { TIME_FORMAT_STORAGE_KEY, TimeFormatContext, type TimeFormat } from './timeFormat.ts'

function getSavedTimeFormat(): TimeFormat {
  try {
    return window.localStorage.getItem(TIME_FORMAT_STORAGE_KEY) === '24-hour' ? '24-hour' : '12-hour'
  } catch {
    return '12-hour'
  }
}

export function TimeFormatProvider({ children }: { children: ReactNode }) {
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(getSavedTimeFormat)

  const toggleTimeFormat = () => {
    setTimeFormat((currentFormat) => {
      const nextFormat = currentFormat === '12-hour' ? '24-hour' : '12-hour'

      try {
        window.localStorage.setItem(TIME_FORMAT_STORAGE_KEY, nextFormat)
      } catch {
        // Keep the in-memory preference when storage is unavailable.
      }

      return nextFormat
    })
  }

  const value = useMemo(() => ({ timeFormat, toggleTimeFormat }), [timeFormat])

  return <TimeFormatContext.Provider value={value}>{children}</TimeFormatContext.Provider>
}
