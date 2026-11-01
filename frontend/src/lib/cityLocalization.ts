import i18n from '../i18n/index.ts'
import type { City } from '../data/cityCatalog.ts'

function translatedCityValue(kind: 'cities' | 'regions', value: string, fallback: string) {
  return i18n.t(`${kind}.${value}`, { ns: 'cities', defaultValue: fallback })
}

export function getCityName(city: City) {
  return translatedCityValue('cities', city.key, city.name)
}

export function getCityRegion(city: City) {
  return translatedCityValue('regions', city.region, city.region)
}

export function matchesCitySearch(city: City, query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase()
  if (!normalizedQuery) return true

  return [city.name, city.region, city.timeZone, getCityName(city), getCityRegion(city)]
    .join(' ')
    .toLocaleLowerCase()
    .includes(normalizedQuery)
}
