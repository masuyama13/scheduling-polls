import { CITY_CATALOG } from '../data/cityCatalog.ts'

export function getInitialTimeZone(fallbackTimeZone: string) {
  let browserTimeZone: string | undefined

  try {
    browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    browserTimeZone = undefined
  }

  return CITY_CATALOG.find((city) => city.timeZone === browserTimeZone)?.timeZone ?? fallbackTimeZone
}
