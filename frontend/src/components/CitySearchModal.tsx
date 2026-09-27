import { Search, X } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import type { City } from '../data/cityCatalog.ts'

type CitySearchModalProps = {
  title: string
  inputLabel: string
  placeholder: string
  cities: City[]
  helperText?: ReactNode
  onSelect: (city: City) => void
  onClose: () => void
}

export default function CitySearchModal({
  title,
  inputLabel,
  placeholder,
  cities,
  helperText,
  onSelect,
  onClose,
}: CitySearchModalProps) {
  const headingId = useId()
  const inputId = useId()
  const [query, setQuery] = useState('')
  const [highlightedResultIndex, setHighlightedResultIndex] = useState(0)
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const results = cities
    .filter((city) => {
      if (!normalizedQuery) return true
      return `${city.name} ${city.region} ${city.timeZone}`.toLocaleLowerCase().includes(normalizedQuery)
    })
    .slice(0, 8)

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlightedResultIndex((index) => (index + 1) % results.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlightedResultIndex((index) => (index - 1 + results.length) % results.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      onSelect(results[highlightedResultIndex] ?? results[0])
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-inverse/50 p-4" role="presentation">
      <div aria-hidden="true" className="absolute inset-0" onClick={onClose} />
      <div
        className="relative z-10 h-[28rem] max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface-panel p-5 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id={headingId} className="text-xl font-bold text-content-primary">
            {title}
          </h2>
          <button
            type="button"
            aria-label="Close city search"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-2 text-content-muted hover:bg-surface-muted hover:text-content-primary focus:outline-none focus:ring-1 focus:ring-border-strong"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <label htmlFor={inputId} className="sr-only">
          {inputLabel}
        </label>
        <div className="relative mt-5">
          <Search
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-content-muted"
          />
          <input
            id={inputId}
            type="search"
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setHighlightedResultIndex(0)
            }}
            onKeyDown={handleSearchKeyDown}
            aria-activedescendant={
              results[highlightedResultIndex] ? `city-search-result-${results[highlightedResultIndex].key}` : undefined
            }
            placeholder={placeholder}
            className="w-full rounded-lg border border-border-default bg-surface-panel py-2.5 pl-10 pr-3 text-content-primary outline-none focus:border-brand-primary focus:ring-1 focus:ring-border-strong"
          />
        </div>
        {helperText}
        <div className="mt-4 grid gap-2" aria-live="polite">
          {results.length > 0 ? (
            results.map((city, index) => (
              <button
                type="button"
                key={city.key}
                id={`city-search-result-${city.key}`}
                onClick={() => onSelect(city)}
                aria-selected={index === highlightedResultIndex}
                className={`cursor-pointer rounded-lg border px-4 py-3 text-left focus:outline-none focus:ring-1 focus:ring-border-strong ${index === highlightedResultIndex ? 'border-brand-primary bg-brand-primary/5' : 'border-border-subtle hover:border-brand-primary hover:bg-brand-primary/5'}`}
              >
                <span className="block font-semibold text-content-primary">{city.name}</span>
                <span className="mt-1 block text-sm text-content-muted">
                  {city.region} · {city.timeZone}
                </span>
              </button>
            ))
          ) : (
            <p className="py-4 text-sm text-content-muted">No cities found.</p>
          )}
        </div>
      </div>
    </div>
  )
}
