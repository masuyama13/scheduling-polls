import type { TimeFormat } from './timeFormatting.ts'

export const APP_PREFERENCES_STORAGE_KEY = 'crosstimely.preferences'

export type Theme = 'light' | 'dark'

export type AppPreferences = {
  theme?: Theme
  timeFormat?: TimeFormat
}

type PreferencesStorage = Pick<Storage, 'getItem' | 'setItem'>

function getStorage(storage?: PreferencesStorage): PreferencesStorage {
  return storage ?? window.localStorage
}

export function loadAppPreferences(storage?: Pick<Storage, 'getItem'>): AppPreferences {
  try {
    const storedValue = (storage ?? window.localStorage).getItem(APP_PREFERENCES_STORAGE_KEY)
    if (!storedValue) return {}

    const parsedValue: unknown = JSON.parse(storedValue)
    if (typeof parsedValue !== 'object' || parsedValue === null || Array.isArray(parsedValue)) return {}

    const record = parsedValue as Record<string, unknown>
    return {
      ...(record.theme === 'light' || record.theme === 'dark' ? { theme: record.theme } : {}),
      ...(record.timeFormat === '12-hour' || record.timeFormat === '24-hour' ? { timeFormat: record.timeFormat } : {}),
    }
  } catch {
    return {}
  }
}

export function updateAppPreferences(updates: AppPreferences, storage?: PreferencesStorage): boolean {
  try {
    const targetStorage = getStorage(storage)
    targetStorage.setItem(
      APP_PREFERENCES_STORAGE_KEY,
      JSON.stringify({ ...loadAppPreferences(targetStorage), ...updates }),
    )
    return true
  } catch {
    return false
  }
}
