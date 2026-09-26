import { beforeEach, describe, expect, it } from 'vitest'
import {
  MAX_CITIES,
  WORLD_CLOCK_STORAGE_KEY,
  detectPrimaryCity,
  buildHourlyTimeline,
  formatTimelineCell,
  formatUtcOffset,
  getInstantsForLocalDateTime,
  getInitialCities,
  groupTimelineEntriesByHour,
  loadSelectedCities,
  normalizeSelectedCities,
  saveSelectedCities,
  searchCities,
  shiftDateInputValue,
} from './worldClock'

describe('world clock city state', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('detects a representative city from the browser time zone', () => {
    expect(detectPrimaryCity('Asia/Tokyo')?.key).toBe('tokyo')
    expect(getInitialCities('Asia/Tokyo')).toEqual([
      expect.objectContaining({ key: 'tokyo', primary: true }),
      expect.objectContaining({ key: 'toronto', primary: false }),
    ])

    expect(getInitialCities('America/Toronto')).toEqual([
      expect.objectContaining({ key: 'toronto', primary: true }),
      expect.objectContaining({ key: 'vancouver', primary: false }),
    ])
  })

  it('falls back to Vancouver and Toronto for an unsupported time zone', () => {
    expect(getInitialCities('Etc/Unknown')).toEqual([
      expect.objectContaining({ key: 'vancouver', primary: true }),
      expect.objectContaining({ key: 'toronto', primary: false }),
    ])
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

  it('ignores stored cities with invalid field types', () => {
    expect(
      normalizeSelectedCities([
        { key: 'vancouver', primary: true },
        { key: 123, primary: false },
        { key: 'tokyo', primary: 'yes' },
        null,
      ]),
    ).toEqual([expect.objectContaining({ key: 'vancouver', primary: true })])
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
      expect.objectContaining({ key: 'toronto', primary: false }),
    ])
  })

  it('searches by city or region and excludes selected cities', () => {
    const selected = getInitialCities('America/Vancouver')

    expect(searchCities('canada', selected).map((city) => city.key)).toContain('montreal')
    expect(searchCities('vancouver', selected)).toEqual([])
  })

  it("builds a 24-hour timeline from the primary city's local date", () => {
    const timeline = buildHourlyTimeline('2026-09-24', 'America/Vancouver')

    expect(timeline).toHaveLength(24)
    expect(formatTimelineCell(timeline[timeline.length - 1].instant, 'Asia/Tokyo').dateKey).toBe('2026-09-25')
  })

  it('moves the selected date without changing the time zone', () => {
    expect(shiftDateInputValue('2026-09-24', -7)).toBe('2026-09-17')
    expect(shiftDateInputValue('2026-09-24', 1)).toBe('2026-09-25')
  })

  it('handles a daylight-saving skipped local time in Seattle', () => {
    expect(getInstantsForLocalDateTime({ date: '2026-03-08', hour: 2, minute: 0 }, 'America/Los_Angeles')).toHaveLength(
      0,
    )

    const timeline = buildHourlyTimeline('2026-03-08', 'America/Los_Angeles')
    const columns = groupTimelineEntriesByHour(timeline)

    expect(columns).toHaveLength(24)
    expect(formatTimelineCell(columns[columns.length - 1][0].instant, 'America/Los_Angeles')).toMatchObject({
      dateKey: '2026-03-09',
      hour: '12',
      period: 'AM',
    })
  })

  it('handles a daylight-saving repeated local time in Seattle', () => {
    const timeline = buildHourlyTimeline('2026-11-01', 'America/Los_Angeles')
    const columns = groupTimelineEntriesByHour(timeline)

    expect(getInstantsForLocalDateTime({ date: '2026-11-01', hour: 1, minute: 0 }, 'America/Los_Angeles')).toHaveLength(
      2,
    )
    expect(columns).toHaveLength(24)
    expect(columns[1]).toHaveLength(1)
    expect(columns[2]).toHaveLength(1)
    expect(formatUtcOffset(columns[1][0].instant, 'America/Los_Angeles')).toBe('UTC-7')
    expect(formatUtcOffset(columns[2][0].instant, 'America/Los_Angeles')).toBe('UTC-8')
  })

  it('keeps Vancouver local times unique after the daylight-saving change', () => {
    expect(getInstantsForLocalDateTime({ date: '2026-11-01', hour: 1, minute: 0 }, 'America/Vancouver')).toHaveLength(1)
    expect(formatUtcOffset(new Date('2026-11-01T08:00:00.000Z'), 'America/Vancouver')).toBe('UTC-7')
  })
})
