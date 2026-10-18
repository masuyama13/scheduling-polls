import { beforeEach, describe, expect, it } from 'vitest'
import { APP_PREFERENCES_STORAGE_KEY, loadAppPreferences, updateAppPreferences } from './appPreferences'

describe('app preferences storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('loads only recognized preference values', () => {
    localStorage.setItem(
      APP_PREFERENCES_STORAGE_KEY,
      JSON.stringify({ theme: 'dark', timeFormat: 'invalid', language: 'zh', extra: true }),
    )

    expect(loadAppPreferences()).toEqual({ theme: 'dark' })
  })

  it('loads a supported language preference', () => {
    localStorage.setItem(APP_PREFERENCES_STORAGE_KEY, JSON.stringify({ language: 'ja' }))

    expect(loadAppPreferences()).toEqual({ language: 'ja' })
  })

  it('preserves other preferences when updating one setting', () => {
    expect(updateAppPreferences({ theme: 'dark' })).toBe(true)
    expect(updateAppPreferences({ timeFormat: '24-hour' })).toBe(true)

    expect(JSON.parse(localStorage.getItem(APP_PREFERENCES_STORAGE_KEY) ?? '{}')).toEqual({
      theme: 'dark',
      timeFormat: '24-hour',
    })
  })

  it('returns empty preferences when stored data is invalid', () => {
    localStorage.setItem(APP_PREFERENCES_STORAGE_KEY, '{invalid')

    expect(loadAppPreferences()).toEqual({})
  })
})
