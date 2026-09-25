import { CITY_CATALOG, type City } from '../data/cityCatalog'

export const MAX_CITIES = 10
export const MAX_TIME_CANDIDATES = 10
export const WORLD_CLOCK_STORAGE_KEY = 'timezone-scheduler.world-clock'

export type SelectedCity = City & { primary: boolean }

export type HourlyTimelineEntry = {
  instant: Date
  primaryHour: number
  occurrence: number
}

const DEFAULT_PRIMARY_CITY_KEY = 'vancouver'
const DEFAULT_SECONDARY_CITY_KEY = 'toronto'
const VANCOUVER_TIME_ZONE = 'America/Vancouver'
const VANCOUVER_PERMANENT_TIME_ZONE = 'Etc/GMT+7'
const VANCOUVER_PERMANENT_TIME_ZONE_START = Date.UTC(2026, 10, 1)

const cityByKey = (key: unknown) =>
  typeof key === 'string' ? CITY_CATALOG.find(city => city.key === key) : undefined

export function detectPrimaryCity(timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone) {
  return CITY_CATALOG.find(city => city.timeZone === timeZone)
}

export function getInitialCities(timeZone?: string): SelectedCity[] {
  const defaultPrimaryCity = cityByKey(DEFAULT_PRIMARY_CITY_KEY)
  const defaultSecondaryCity = cityByKey(DEFAULT_SECONDARY_CITY_KEY)
  const primaryCity = detectPrimaryCity(timeZone) ?? defaultPrimaryCity

  if (!primaryCity || !defaultPrimaryCity || !defaultSecondaryCity) return []

  const secondaryCity = primaryCity.key === defaultSecondaryCity.key
    ? defaultPrimaryCity
    : defaultSecondaryCity
  return [
    { ...primaryCity, primary: true },
    { ...secondaryCity, primary: false },
  ]
}

export function normalizeSelectedCities(value: unknown): SelectedCity[] {
  if (!Array.isArray(value)) return []

  const cities = value
    .map(item => cityByKey(typeof item === 'object' && item !== null ? item.key : undefined))
    .filter((city): city is City => city !== undefined)
    .filter((city, index, all) => all.findIndex(item => item.key === city.key) === index)
    .slice(0, MAX_CITIES)

  if (cities.length === 0) return []

  const storedPrimaryKey = value.find(
    item => typeof item === 'object' && item !== null && item.primary === true,
  )?.key
  const primaryKey = cities.some(city => city.key === storedPrimaryKey)
    ? storedPrimaryKey
    : cities[0].key

  return cities.map(city => ({ ...city, primary: city.key === primaryKey }))
}

export function loadSelectedCities(
  storage: Pick<Storage, 'getItem'> | undefined = window.localStorage,
  timeZone?: string,
): SelectedCity[] {
  try {
    const storedValue = storage?.getItem(WORLD_CLOCK_STORAGE_KEY)
    if (storedValue) {
      const restoredCities = normalizeSelectedCities(JSON.parse(storedValue))
      if (restoredCities.length > 0) return restoredCities
    }
  } catch {
    // Invalid storage values and unavailable storage should not block the page.
  }

  return getInitialCities(timeZone)
}

export function saveSelectedCities(
  cities: SelectedCity[],
  storage: Pick<Storage, 'setItem'> | undefined = window.localStorage,
) {
  try {
    storage?.setItem(WORLD_CLOCK_STORAGE_KEY, JSON.stringify(cities))
    return true
  } catch {
    return false
  }
}

export function searchCities(query: string, selectedCities: SelectedCity[], replacing = false) {
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const selectedKeys = new Set(selectedCities.map(city => city.key))

  return CITY_CATALOG.filter(city => {
    const searchableText = `${city.name} ${city.region}`.toLocaleLowerCase()
    return searchableText.includes(normalizedQuery) && (replacing || !selectedKeys.has(city.key))
  }).slice(0, 8)
}

function effectiveTimeZone(date: Date, timeZone: string) {
  if (timeZone === VANCOUVER_TIME_ZONE && date.getTime() >= VANCOUVER_PERMANENT_TIME_ZONE_START) {
    return VANCOUVER_PERMANENT_TIME_ZONE
  }

  return timeZone
}

export function formatUtcOffset(date: Date, timeZone: string) {
  const offsetPart = new Intl.DateTimeFormat('en-US', {
    timeZone: effectiveTimeZone(date, timeZone),
    timeZoneName: 'longOffset',
  })
    .formatToParts(date)
    .find(part => part.type === 'timeZoneName')?.value ?? 'GMT'

  if (offsetPart === 'GMT' || offsetPart === 'GMT+00:00') return 'UTC+0'

  const match = offsetPart.match(/^GMT([+-])(\d{2}):(\d{2})$/)
  if (!match) return offsetPart.replace('GMT', 'UTC')

  const [, sign, hours, minutes] = match
  const numericHours = Number(hours)
  return `UTC${sign}${numericHours}${minutes === '00' ? '' : `:${minutes}`}`
}

export function formatCurrentTime(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: effectiveTimeZone(date, timeZone),
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function formatLocalTimePreview(date: Date, timeZone: string) {
  const effectiveZone = effectiveTimeZone(date, timeZone)
  const datePart = new Intl.DateTimeFormat('en-US', {
    timeZone: effectiveZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date)
  const timePart = new Intl.DateTimeFormat('en-US', {
    timeZone: effectiveZone,
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)

  return `${datePart} at ${timePart}`
}

type LocalDateTime = {
  date: string
  hour: number
  minute: number
}

function dateTimeParts(date: Date, timeZone: string): LocalDateTime {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: effectiveTimeZone(date, timeZone),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value ?? '0'

  return {
    date: `${value('year')}-${value('month')}-${value('day')}`,
    hour: Number(value('hour')),
    minute: Number(value('minute')),
  }
}

function localDateTimeToNaiveUtc({ date, hour, minute }: LocalDateTime) {
  const [year, month, day] = date.split('-').map(Number)
  return Date.UTC(year, month - 1, day, hour, minute)
}

export function getLocalDate(date: Date, timeZone: string) {
  return dateTimeParts(date, timeZone).date
}

export function getDateInputValue(date: Date, timeZone: string) {
  return getLocalDate(date, timeZone)
}

export function formatLocalDateTimeInput(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: effectiveTimeZone(date, timeZone),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value ?? '0'

  return {
    date: `${value('year')}-${value('month')}-${value('day')}`,
    time: `${value('hour')}:${value('minute')}`,
  }
}

export function formatDateInputLabel(dateValue: string) {
  const [year, month, day] = dateValue.split('-').map(Number)
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(Date.UTC(year, month - 1, day)))
}

export function shiftDateInputValue(dateValue: string, days: number) {
  const [year, month, day] = dateValue.split('-').map(Number)
  const shifted = new Date(Date.UTC(year, month - 1, day + days))
  return shifted.toISOString().slice(0, 10)
}

export function getInstantsForLocalDateTime(localDateTime: LocalDateTime, timeZone: string) {
  const naiveUtc = localDateTimeToNaiveUtc(localDateTime)
  const instants: Date[] = []

  // Checking quarter-hour offsets covers current whole-, half-, and quarter-hour zones.
  for (let offsetMinutes = -14 * 60; offsetMinutes <= 14 * 60; offsetMinutes += 15) {
    const candidate = new Date(naiveUtc - offsetMinutes * 60_000)
    const actual = dateTimeParts(candidate, timeZone)
    if (
      actual.date === localDateTime.date &&
      actual.hour === localDateTime.hour &&
      actual.minute === localDateTime.minute &&
      !instants.some(instant => instant.getTime() === candidate.getTime())
    ) {
      instants.push(candidate)
    }
  }

  return instants.sort((left, right) => left.getTime() - right.getTime())
}

export function buildHourlyTimeline(date: string, timeZone: string): HourlyTimelineEntry[] {
  const entries: HourlyTimelineEntry[] = []
  const occurrences = new Map<number, number>()

  for (let hour = 0; hour < 24; hour += 1) {
    const instants = getInstantsForLocalDateTime({ date, hour, minute: 0 }, timeZone)
    for (const instant of instants) {
      const occurrence = occurrences.get(hour) ?? 0
      occurrences.set(hour, occurrence + 1)
      entries.push({ instant, primaryHour: hour, occurrence })
    }
  }

  if (entries.length === 23) {
    const nextDate = shiftDateInputValue(date, 1)
    const nextMidnight = getInstantsForLocalDateTime({ date: nextDate, hour: 0, minute: 0 }, timeZone)[0]

    if (nextMidnight) {
      entries.push({ instant: nextMidnight, primaryHour: 24, occurrence: 0 })
    }
  }

  return entries.sort((left, right) => left.instant.getTime() - right.instant.getTime())
}

export function groupTimelineEntriesByHour(entries: HourlyTimelineEntry[]) {
  return entries.slice(0, 24).map(entry => [entry])
}

export function formatTimelineCell(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: effectiveTimeZone(date, timeZone),
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(date)
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value ?? ''

  return {
    date: `${value('month')} ${value('day')}`,
    month: value('month'),
    day: value('day'),
    dateKey: getLocalDate(date, timeZone),
    hour: value('hour'),
    minute: value('minute'),
    period: value('dayPeriod'),
  }
}
