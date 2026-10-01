import { describe, expect, it } from 'vitest'
import { formatDateTimeInZone } from './timeFormatting'

describe('time formatting', () => {
  const date = new Date('2026-09-24T16:05:00.000Z')
  const options = { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' } as const

  it('formats zoned times using 12-hour notation with AM/PM', () => {
    expect(formatDateTimeInZone(date, 'America/Vancouver', '12-hour', options)).toBe('Thu, Sep 24, 9:05 AM')
  })

  it('formats zoned times using 24-hour notation without padding single-digit hours', () => {
    expect(formatDateTimeInZone(date, 'America/Vancouver', '24-hour', options)).toBe('Thu, Sep 24, 9:05')
  })

  it('keeps midnight at 00 in 24-hour notation', () => {
    const midnight = new Date('2026-09-24T07:00:00.000Z')

    expect(formatDateTimeInZone(midnight, 'America/Vancouver', '24-hour', { hour: 'numeric', minute: '2-digit' })).toBe(
      '00:00',
    )
  })
})
