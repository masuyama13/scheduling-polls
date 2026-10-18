import { afterEach, describe, expect, it } from 'vitest'
import { formatDateTimeInZone } from './timeFormatting'
import i18n from '../i18n/index.ts'

describe('time formatting', () => {
  afterEach(async () => {
    await i18n.changeLanguage('en')
  })

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

  it('localizes dates while keeping 24-hour times in Japanese', async () => {
    await i18n.changeLanguage('ja')

    expect(formatDateTimeInZone(date, 'Asia/Tokyo', '24-hour', options)).toContain('9月')
    expect(formatDateTimeInZone(date, 'Asia/Tokyo', '24-hour', options)).toContain('1:05')
  })

  it('keeps AM and PM in English when the selected locale is Japanese', async () => {
    await i18n.changeLanguage('ja')

    expect(formatDateTimeInZone(date, 'Asia/Tokyo', '12-hour', options)).toBe('9月25日(金), 1:05 AM')
    expect(formatDateTimeInZone(date, 'Asia/Tokyo', '12-hour', { hour: 'numeric', minute: '2-digit' })).toBe('1:05 AM')
  })
})
