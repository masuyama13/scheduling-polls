import { createContext } from 'react'

export type TimeFormat = '12-hour' | '24-hour'

export const TIME_FORMAT_STORAGE_KEY = 'app-time-format'

export type TimeFormatContextValue = {
  timeFormat: TimeFormat
  toggleTimeFormat: () => void
}

export const TimeFormatContext = createContext<TimeFormatContextValue | null>(null)
