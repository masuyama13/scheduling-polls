import { useEffect, useState } from 'react'
import { Plus, Search, X } from 'lucide-react'
import type { City } from '../data/cityCatalog'
import {
  MAX_CITIES,
  formatCurrentTime,
  formatUtcOffset,
  loadSelectedCities,
  saveSelectedCities,
  searchCities,
  type SelectedCity,
} from '../lib/worldClock'

export default function WorldClock() {
  const [cities, setCities] = useState<SelectedCity[]>(() => loadSelectedCities())
  const [now, setNow] = useState(() => new Date())
  const [isCityDialogOpen, setIsCityDialogOpen] = useState(false)
  const [isReplacingCity, setIsReplacingCity] = useState(false)
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(intervalId)
  }, [])

  const updateCities = (nextCities: SelectedCity[]) => {
    setCities(nextCities)
    if (!saveSelectedCities(nextCities)) {
      setMessage('Your browser could not save this city list, but you can keep using it for now.')
    } else {
      setMessage('')
    }
  }

  const openAddCity = () => {
    setIsReplacingCity(false)
    setQuery('')
    setMessage('')
    setIsCityDialogOpen(true)
  }

  const openChangeCity = () => {
    setIsReplacingCity(true)
    setQuery('')
    setMessage('')
    setIsCityDialogOpen(true)
  }

  const handleCitySelection = (city: City) => {
    if (isReplacingCity) {
      const primaryIndex = cities.findIndex(selectedCity => selectedCity.primary)
      const existingIndex = cities.findIndex(selectedCity => selectedCity.key === city.key)
      const nextCities = existingIndex >= 0
        ? cities
          .filter((_, index) => index !== primaryIndex)
          .map(selectedCity => ({ ...selectedCity, primary: selectedCity.key === city.key }))
        : cities.map((selectedCity, index) => index === primaryIndex
          ? { ...city, primary: true }
          : selectedCity)

      updateCities(nextCities)
    } else {
      if (cities.length >= MAX_CITIES) {
        setMessage(`You can add up to ${MAX_CITIES} cities.`)
        return
      }
      updateCities([...cities, { ...city, primary: cities.length === 0 }])
    }

    setIsCityDialogOpen(false)
  }

  const handleRemoveCity = (key: string) => {
    const city = cities.find(selectedCity => selectedCity.key === key)
    if (!city || city.primary) return
    updateCities(cities.filter(selectedCity => selectedCity.key !== key))
  }

  const results = searchCities(query, cities, isReplacingCity)

  return (
    <section className="world-clock" aria-label="World Clock">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={openAddCity}
            disabled={cities.length >= MAX_CITIES}
            className="inline-flex items-center gap-1 rounded-full bg-brand-primary px-4 py-2.5 font-semibold text-content-inverse shadow-panel transition hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={14} strokeWidth={4} aria-hidden="true" />
            Add city
          </button>
        </div>

        <div className="mt-2 flex justify-end">
          <span className="shrink-0 text-sm text-content-muted">{cities.length} of {MAX_CITIES} cities</span>
        </div>

        {message && (
          <p className="mt-4 text-sm text-status-warning" role="status">{message}</p>
        )}

        <div className="mt-6 overflow-hidden rounded-2xl border border-border-subtle bg-surface-panel shadow-panel">
          {cities.length === 0 ? (
            <div className="px-5 py-10 text-center sm:px-8">
              <h2 className="text-lg font-semibold text-content-primary">Choose your city</h2>
              <p className="mt-2 text-sm text-content-muted">
                We could not match your browser time zone to a city. Choose one to get started.
              </p>
              <button
                type="button"
                onClick={openChangeCity}
                className="mt-5 rounded-lg bg-brand-primary px-4 py-2 font-semibold text-content-inverse hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                Choose city
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border-subtle">
              {cities.map(city => (
                <article key={city.key} className="flex items-center justify-between gap-4 px-5 py-5 sm:px-8">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <h2 className="text-lg font-bold text-content-primary">{city.name}</h2>
                      {city.primary && (
                        <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-xs font-semibold text-brand-primary">
                          Your city
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-content-muted">{city.region} · {formatUtcOffset(now, city.timeZone)}</p>
                    <time className="mt-2 block text-base font-medium text-content-secondary" dateTime={now.toISOString()}>
                      {formatCurrentTime(now, city.timeZone)}
                    </time>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {city.primary ? (
                      <button
                        type="button"
                        onClick={openChangeCity}
                        className="rounded-lg px-3 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-primary/10 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      >
                        Change
                      </button>
                    ) : (
                      <button
                        type="button"
                        aria-label={`Remove ${city.name}`}
                        onClick={() => handleRemoveCity(city.key)}
                        className="rounded-lg p-2 text-content-muted hover:bg-surface-muted hover:text-status-danger focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      >
                        <X size={18} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {isCityDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-inverse/50 p-4" role="presentation">
          <div
            className="w-full max-w-lg rounded-2xl bg-surface-panel p-5 shadow-panel sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="city-dialog-heading"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 id="city-dialog-heading" className="text-xl font-bold text-content-primary">
                {isReplacingCity ? 'Change your city' : 'Add a city'}
              </h2>
              <button
                type="button"
                aria-label="Close city search"
                onClick={() => setIsCityDialogOpen(false)}
                className="rounded-lg p-2 text-content-muted hover:bg-surface-muted hover:text-content-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <label htmlFor="city-search" className="sr-only">Search cities</label>
            <div className="relative mt-5">
              <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
              <input
                id="city-search"
                type="search"
                autoFocus
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Search by city or country"
                className="w-full rounded-lg border border-border-default bg-surface-panel py-2.5 pl-10 pr-3 text-content-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary"
              />
            </div>
            <div className="mt-4 grid max-h-80 gap-2 overflow-y-auto" aria-live="polite">
              {results.length > 0 ? results.map(city => (
                <button
                  type="button"
                  key={city.key}
                  onClick={() => handleCitySelection(city)}
                  className="rounded-lg border border-border-subtle px-4 py-3 text-left hover:border-brand-primary hover:bg-brand-primary/5 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <span className="block font-semibold text-content-primary">{city.name}</span>
                  <span className="mt-1 block text-sm text-content-muted">{city.region} · {city.timeZone}</span>
                </button>
              )) : (
                <p className="py-4 text-sm text-content-muted">No cities found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
