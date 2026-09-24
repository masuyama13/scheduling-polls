import { beforeEach, describe, expect, it } from 'vitest'
import {
  MAX_CITIES,
  WORLD_CLOCK_STORAGE_KEY,
  detectPrimaryCity,
  getInitialCities,
  loadSelectedCities,
  normalizeSelectedCities,
  saveSelectedCities,
  searchCities,
} from './worldClock'

describe('world clock city state', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('detects a representative city from the browser time zone', () => {
    expect(detectPrimaryCity('Asia/Tokyo')?.key).toBe('tokyo')
    expect(getInitialCities('Asia/Tokyo')).toEqual([
      expect.objectContaining({ key: 'tokyo', primary: true }),
    ])
  })

  it('does not guess a city for an unsupported time zone', () => {
    expect(getInitialCities('Etc/Unknown')).toEqual([])
  })

  it('normalizes duplicates, invalid entries, and the city limit', () => {
    const value = Array.from({ length: MAX_CITIES + 2 }, (_, index) => ({
      key: index === 1 ? 'tokyo' : index === 0 ? 'vancouver' : `unknown-${index}`,
      primary: index === 1,
    }))

    expect(normalizeSelectedCities(value)).toEqual([
      expect.objectContaining({ key: 'vancouver', primary: false }),
      expect.objectContaining({ key: 'tokyo', primary: true }),
    ])
  })

  it('saves and restores selected cities', () => {
    const cities = getInitialCities('America/Vancouver')
    saveSelectedCities(cities)

    expect(localStorage.getItem(WORLD_CLOCK_STORAGE_KEY)).toBeTruthy()
    expect(loadSelectedCities()).toEqual(cities)
  })

  it('falls back to detected city when saved data is invalid', () => {
    localStorage.setItem(WORLD_CLOCK_STORAGE_KEY, '{invalid')

    expect(loadSelectedCities(localStorage, 'Europe/Berlin')).toEqual([
      expect.objectContaining({ key: 'berlin', primary: true }),
    ])
  })

  it('searches by city or region and excludes selected cities', () => {
    const selected = getInitialCities('America/Vancouver')

    expect(searchCities('canada', selected).map(city => city.key)).toContain('toronto')
    expect(searchCities('vancouver', selected)).toEqual([])
  })
})
