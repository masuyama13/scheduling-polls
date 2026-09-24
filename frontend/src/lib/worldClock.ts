import { CITY_CATALOG, type City } from '../data/cityCatalog'

export const MAX_CITIES = 10
export const WORLD_CLOCK_STORAGE_KEY = 'timezone-scheduler.world-clock'

export type SelectedCity = City & { primary: boolean }

const cityByKey = (key: unknown) =>
  typeof key === 'string' ? CITY_CATALOG.find(city => city.key === key) : undefined

export function detectPrimaryCity(timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone) {
  return CITY_CATALOG.find(city => city.timeZone === timeZone)
}

export function getInitialCities(timeZone?: string): SelectedCity[] {
  const detectedCity = detectPrimaryCity(timeZone)
  return detectedCity ? [{ ...detectedCity, primary: true }] : []
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

export function formatUtcOffset(date: Date, timeZone: string) {
  const offsetPart = new Intl.DateTimeFormat('en-US', {
    timeZone,
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
    timeZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}
