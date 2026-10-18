export type TimeFormat = '12-hour' | '24-hour'
import { getActiveIntlLocale } from '../i18n/index.ts'

export type ZonedDateTimeOptions = Omit<Intl.DateTimeFormatOptions, 'timeZone' | 'hour12' | 'hourCycle'>

function createFormatter(locale: string, timeZone: string, timeFormat: TimeFormat, options: ZonedDateTimeOptions) {
  return new Intl.DateTimeFormat(locale, {
    ...options,
    timeZone,
    ...(options.hour === undefined ? {} : timeFormat === '24-hour' ? { hourCycle: 'h23' } : { hour12: true }),
  })
}

export function formatDateTimePartsInZone(
  date: Date,
  timeZone: string,
  timeFormat: TimeFormat,
  options: ZonedDateTimeOptions,
) {
  const locale = getActiveIntlLocale()
  const dateOptionKeys = new Set(['weekday', 'era', 'year', 'month', 'day'])
  const timeOptionKeys = new Set(['hour', 'minute', 'second', 'fractionalSecondDigits', 'dayPeriod', 'timeZoneName'])
  const hasDateOptions = Object.keys(options).some((key) => dateOptionKeys.has(key))
  const hasTimeOptions = Object.keys(options).some((key) => timeOptionKeys.has(key))
  let parts: Intl.DateTimeFormatPart[]

  if (hasDateOptions && hasTimeOptions) {
    const dateOptions = Object.fromEntries(
      Object.entries(options).filter(([key]) => dateOptionKeys.has(key)),
    ) as ZonedDateTimeOptions
    const timeOptions = Object.fromEntries(
      Object.entries(options).filter(([key]) => timeOptionKeys.has(key)),
    ) as ZonedDateTimeOptions
    const dateParts = createFormatter(locale, timeZone, timeFormat, dateOptions).formatToParts(date)
    const timeParts = createFormatter('en-US', timeZone, timeFormat, timeOptions).formatToParts(date)
    parts = [...dateParts, { type: 'literal', value: ', ' }, ...timeParts]
  } else {
    parts = createFormatter(hasTimeOptions ? 'en-US' : locale, timeZone, timeFormat, options).formatToParts(date)
  }

  return parts.map((part) => {
    if (timeFormat === '24-hour' && part.type === 'hour')
      return { ...part, value: part.value.replace(/^0([1-9])$/, '$1') }
    return part
  })
}

export function formatDateTimeInZone(
  date: Date,
  timeZone: string,
  timeFormat: TimeFormat,
  options: ZonedDateTimeOptions,
) {
  return formatDateTimePartsInZone(date, timeZone, timeFormat, options)
    .map((part) => part.value)
    .join('')
}
