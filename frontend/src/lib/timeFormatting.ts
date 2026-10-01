export type TimeFormat = '12-hour' | '24-hour'

export type ZonedDateTimeOptions = Omit<Intl.DateTimeFormatOptions, 'timeZone' | 'hour12' | 'hourCycle'>

function createFormatter(timeZone: string, timeFormat: TimeFormat, options: ZonedDateTimeOptions) {
  return new Intl.DateTimeFormat('en-US', {
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
  const parts = createFormatter(timeZone, timeFormat, options).formatToParts(date)

  return parts.map((part) =>
    timeFormat === '24-hour' && part.type === 'hour'
      ? { ...part, value: part.value.replace(/^0([1-9])$/, '$1') }
      : part,
  )
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
