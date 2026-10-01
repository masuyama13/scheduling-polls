import { useContext } from 'react'
import { TimeFormatContext } from '../contexts/timeFormat.ts'

export function useTimeFormat() {
  return useContext(TimeFormatContext) ?? { timeFormat: '12-hour' as const, toggleTimeFormat: () => {} }
}
