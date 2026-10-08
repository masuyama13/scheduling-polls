import { createContext } from 'react'
import type { TimeFormat } from '../lib/timeFormatting.ts'

export type { TimeFormat } from '../lib/timeFormatting.ts'

export type TimeFormatContextValue = {
  timeFormat: TimeFormat
  toggleTimeFormat: () => void
}

export const TimeFormatContext = createContext<TimeFormatContextValue | null>(null)
