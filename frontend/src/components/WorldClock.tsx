import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronsLeft, ChevronsRight, ChevronRight, Home, Plus, Search, X } from 'lucide-react'
import type { City } from '../data/cityCatalog'
import {
  MAX_CITIES,
  buildHourlyTimeline,
  formatCurrentTime,
  formatDateInputLabel,
  formatTimelineCell,
  formatUtcOffset,
  getDateInputValue,
  loadSelectedCities,
  saveSelectedCities,
  searchCities,
  shiftDateInputValue,
  type SelectedCity,
} from '../lib/worldClock'

export default function WorldClock() {
  const [cities, setCities] = useState<SelectedCity[]>(() => loadSelectedCities())
  const [now, setNow] = useState(() => new Date())
  const [comparisonDate, setComparisonDate] = useState(() => {
    const initialCities = loadSelectedCities()
    const primaryCity = initialCities.find(city => city.primary)
    return getDateInputValue(new Date(), primaryCity?.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone)
  })
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

  const primaryCity = cities.find(city => city.primary)
  const timeline = primaryCity ? buildHourlyTimeline(comparisonDate, primaryCity.timeZone) : []

  const moveDate = (days: number) => {
    setComparisonDate(currentDate => shiftDateInputValue(currentDate, days))
  }

  const results = searchCities(query, cities, isReplacingCity)

  return (
    <section className="world-clock" aria-label="World Clock">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1">
            <button type="button" aria-label="Previous week" title="Previous week" onClick={() => moveDate(-7)} className="rounded-lg p-2 text-brand-primary hover:bg-brand-primary/10 focus:outline-none focus:ring-2 focus:ring-brand-primary">
              <ChevronsLeft size={20} aria-hidden="true" />
            </button>
            <button type="button" aria-label="Previous day" title="Previous day" onClick={() => moveDate(-1)} className="rounded-lg p-2 text-brand-primary hover:bg-brand-primary/10 focus:outline-none focus:ring-2 focus:ring-brand-primary">
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <label htmlFor="comparison-date" className="sr-only">Comparison date</label>
            <input
              id="comparison-date"
              type="date"
              value={comparisonDate}
              onChange={event => setComparisonDate(event.target.value)}
              className="rounded-lg border border-border-default bg-surface-panel px-3 py-2 text-content-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary"
            />
            <button type="button" aria-label="Next day" title="Next day" onClick={() => moveDate(1)} className="rounded-lg p-2 text-brand-primary hover:bg-brand-primary/10 focus:outline-none focus:ring-2 focus:ring-brand-primary">
              <ChevronRight size={20} aria-hidden="true" />
            </button>
            <button type="button" aria-label="Next week" title="Next week" onClick={() => moveDate(7)} className="rounded-lg p-2 text-brand-primary hover:bg-brand-primary/10 focus:outline-none focus:ring-2 focus:ring-brand-primary">
              <ChevronsRight size={20} aria-hidden="true" />
            </button>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              type="button"
              onClick={openAddCity}
              disabled={cities.length >= MAX_CITIES}
              className="inline-flex items-center gap-1 rounded-full bg-brand-primary px-4 py-2.5 font-semibold text-content-inverse shadow-panel transition hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={14} strokeWidth={4} aria-hidden="true" />
              Add city
            </button>
            <span className="shrink-0 text-sm text-content-muted">{cities.length} of {MAX_CITIES} cities</span>
          </div>
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
            <div className="min-w-0 max-w-full overflow-x-auto rounded-xl border border-border-subtle bg-surface-muted" role="table" aria-label={`World clock for ${formatDateInputLabel(comparisonDate)}`}>
              <p className="sr-only">Hourly local times for {formatDateInputLabel(comparisonDate)}</p>
              {cities.map(city => (
                <div
                  key={city.key}
                  className="world-clock-grid-row grid gap-px border-b border-border-subtle bg-surface-muted text-sm last:border-b-0"
                  style={{ '--world-clock-hour-count': timeline.length } as React.CSSProperties}
                  role="row"
                >
                  <div role="rowheader" className="sticky left-0 z-10 min-h-16 bg-surface-muted px-3 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="block break-words font-bold text-content-primary">{city.name}</span>
                        <span className="mt-1 block whitespace-normal break-words text-[0.65rem] font-normal leading-tight text-content-muted">{formatCurrentTime(now, city.timeZone)} · {formatUtcOffset(now, city.timeZone)}</span>
                      </div>
                      {city.primary ? (
                        <button type="button" aria-label="Change your city" onClick={openChangeCity} className="group shrink-0 rounded-lg p-1 text-brand-primary hover:bg-surface-panel focus:outline-none focus:ring-2 focus:ring-brand-primary">
                          <Home size={16} aria-hidden="true" />
                        </button>
                      ) : (
                        <button type="button" aria-label={`Remove ${city.name}`} onClick={() => handleRemoveCity(city.key)} className="shrink-0 rounded-lg p-1 text-content-muted hover:bg-surface-panel hover:text-status-danger focus:outline-none focus:ring-2 focus:ring-brand-primary">
                          <X size={16} aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </div>
                  {timeline.map((entry, index) => {
                    const cell = formatTimelineCell(entry.instant, city.timeZone)
                    const previousCell = index > 0 ? formatTimelineCell(timeline[index - 1].instant, city.timeZone) : undefined
                    const showDate = !previousCell || previousCell.dateKey !== cell.dateKey
                    return (
                      <div key={`${entry.instant.toISOString()}-${entry.occurrence}`} role="cell" className={`min-w-0 cursor-pointer bg-surface-panel ${showDate ? 'flex flex-col items-center justify-center px-0.5 py-3 text-center text-[0.65rem]' : 'flex flex-col items-center justify-center px-0.5 py-3 text-center text-content-secondary'}`}>
                        {showDate ? (
                          <span className="block leading-tight text-content-secondary">{cell.month}<br />{cell.day}</span>
                        ) : (
                          <>
                            <span className="block text-base font-bold leading-none text-content-secondary">{cell.hour}</span>
                            <span className="block text-[0.65rem] leading-none text-content-secondary">{cell.period}</span>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
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
