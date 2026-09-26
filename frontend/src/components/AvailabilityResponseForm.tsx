import { Check, Pencil, X } from 'lucide-react'
import { useState } from 'react'
import { CITY_CATALOG, type City } from '../data/cityCatalog.ts'
import type { TimeOption } from '../types/event.ts'

type AvailabilityResponseFormProps = {
  eventTimeZone: string
  timeOptions: TimeOption[]
}

type AvailabilityStatus = 'available' | 'unavailable'

function getInitialTimeZone(eventTimeZone: string) {
  let browserTimeZone: string | undefined

  try {
    browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    browserTimeZone = undefined
  }

  return CITY_CATALOG.find((city) => city.timeZone === browserTimeZone)?.timeZone ?? eventTimeZone
}

function getCity(timeZone: string): City | undefined {
  return CITY_CATALOG.find((city) => city.timeZone === timeZone)
}

function formatTimeOption(timeOption: TimeOption, timeZone: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone,
  }).format(new Date(timeOption.starts_at))
}

export default function AvailabilityResponseForm({ eventTimeZone, timeOptions }: AvailabilityResponseFormProps) {
  const [isAvailabilityFormOpen, setIsAvailabilityFormOpen] = useState(false)
  const [isTimeZoneDialogOpen, setIsTimeZoneDialogOpen] = useState(false)
  const [timeZoneQuery, setTimeZoneQuery] = useState('')
  const [timeZone, setTimeZone] = useState(() => getInitialTimeZone(eventTimeZone))
  const [name, setName] = useState('')
  const [comment, setComment] = useState('')
  const [statuses, setStatuses] = useState<Record<number, AvailabilityStatus>>({})

  const selectedCity = getCity(timeZone)
  const timeZoneLabel = selectedCity ? `${selectedCity.name} (${selectedCity.timeZone})` : timeZone
  const normalizedQuery = timeZoneQuery.trim().toLocaleLowerCase()
  const timeZoneCities = CITY_CATALOG.filter((city) => {
    if (!normalizedQuery) return true
    return `${city.name} ${city.region} ${city.timeZone}`.toLocaleLowerCase().includes(normalizedQuery)
  }).slice(0, 8)

  const openAvailabilityForm = () => {
    setIsAvailabilityFormOpen(true)
    setIsTimeZoneDialogOpen(false)
  }

  const openTimeZoneSearch = () => {
    setIsAvailabilityFormOpen(false)
    setIsTimeZoneDialogOpen(true)
    setTimeZoneQuery('')
  }

  const closeTimeZoneSearch = () => {
    setIsTimeZoneDialogOpen(false)
    setTimeZoneQuery('')
  }

  const closeAvailabilityForm = () => {
    setIsAvailabilityFormOpen(false)
    setIsTimeZoneDialogOpen(false)
    setTimeZoneQuery('')
  }

  const selectTimeZone = (nextTimeZone: string) => {
    setTimeZone(nextTimeZone)
    closeTimeZoneSearch()
  }

  const updateStatus = (timeOptionId: number, status: AvailabilityStatus) => {
    setStatuses((currentStatuses) => ({ ...currentStatuses, [timeOptionId]: status }))
  }

  return (
    <section className="grid gap-3" aria-label="Add your availability">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col items-start gap-1 rounded-lg border border-dashed border-border-strong px-3 py-2 text-sm text-content-secondary sm:flex-row sm:items-center sm:gap-2">
          <span className="font-bold">Your time zone:</span>
          <div className="flex min-w-0 items-center gap-1">
            <span className="min-w-0 truncate">{timeZoneLabel}</span>
            <button
              type="button"
              aria-label="Change time zone"
              title="Change time zone"
              onClick={openTimeZoneSearch}
              className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-content-muted hover:bg-surface-muted hover:text-brand-primary focus:outline-none focus:ring-1 focus:ring-border-strong"
            >
              <Pencil size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={openAvailabilityForm}
          className="w-full cursor-pointer rounded-full bg-brand-primary px-4 py-2 text-sm font-bold text-white hover:bg-brand-primary-hover focus:outline-none focus:ring-1 focus:ring-border-strong sm:w-fit"
        >
          Add your availability
        </button>
      </div>

      {isAvailabilityFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="availability-form-heading"
        >
          <button
            type="button"
            aria-label="Close availability form"
            className="absolute inset-0 cursor-default bg-black/40"
            onClick={closeAvailabilityForm}
          />
          <div className="relative z-10 max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl bg-surface-panel p-5 text-content-primary sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <h3 id="availability-form-heading" className="text-xl font-bold">
                Add your availability
              </h3>
              <button
                type="button"
                aria-label="Close availability form"
                title="Close availability form"
                onClick={closeAvailabilityForm}
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-content-muted hover:bg-surface-muted hover:text-content-primary focus:outline-none focus:ring-1 focus:ring-border-strong"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <form className="mt-5 grid gap-4" onSubmit={(event) => event.preventDefault()}>
              <div className="grid gap-2">
                <label htmlFor="response-name" className="text-sm font-bold">
                  Name
                </label>
                <input
                  id="response-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={50}
                  required
                  className="rounded-lg border border-border-default bg-surface-panel px-3 py-2 focus:outline-none focus:ring-1 focus:ring-border-strong"
                />
              </div>

              <fieldset className="grid gap-3">
                <legend className="flex w-full items-baseline justify-between gap-3 text-sm font-bold">
                  <span>Availability</span>
                  <span className="text-right text-xs font-normal text-content-muted">
                    Times shown in {timeZoneLabel}
                  </span>
                </legend>
                {timeOptions.map((timeOption) => (
                  <div
                    key={timeOption.id}
                    className="grid grid-cols-[minmax(0,1fr)_9rem] items-center gap-3 border-t border-border-subtle pt-3"
                  >
                    <p className="min-w-0 text-sm font-bold">{formatTimeOption(timeOption, timeZone)}</p>
                    <div className="grid w-[6.5rem] grid-cols-2 justify-self-end gap-1.5">
                      {(['available', 'unavailable'] as const).map((status) => (
                        <label
                          key={status}
                          className={`group flex h-12 cursor-pointer items-center justify-center rounded-lg border bg-surface-panel text-xl font-bold transition-colors ${statuses[timeOption.id] === status ? 'border-brand-primary bg-surface-subtle text-brand-primary' : 'border-border-default text-content-secondary hover:border-brand-primary hover:bg-surface-subtle'}`}
                        >
                          <input
                            type="radio"
                            name={`availability-${timeOption.id}`}
                            value={status}
                            checked={statuses[timeOption.id] === status}
                            onChange={() => updateStatus(timeOption.id, status)}
                            className="sr-only"
                            required
                          />
                          {status === 'available' ? (
                            <Check size={18} strokeWidth={3} aria-hidden="true" />
                          ) : (
                            <X size={18} strokeWidth={3} aria-hidden="true" />
                          )}
                          <span className="sr-only">{status === 'available' ? 'Available' : 'Not available'}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </fieldset>

              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="response-comment" className="text-sm font-bold">
                    Comment <span className="font-normal text-content-muted">(optional)</span>
                  </label>
                  <span className="text-sm text-content-muted">{comment.length} / 100</span>
                </div>
                <textarea
                  id="response-comment"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  maxLength={100}
                  rows={2}
                  className="rounded-lg border border-border-default bg-surface-panel px-3 py-2 focus:outline-none focus:ring-1 focus:ring-border-strong"
                />
              </div>

              <button
                type="submit"
                className="w-full cursor-pointer rounded-full bg-brand-primary px-4 py-2 text-sm font-bold text-white hover:bg-brand-primary-hover focus:outline-none focus:ring-1 focus:ring-border-strong"
              >
                Add response
              </button>
            </form>
          </div>
        </div>
      )}

      {isTimeZoneDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="response-time-zone-heading"
        >
          <button
            type="button"
            aria-label="Close time zone search"
            className="absolute inset-0 cursor-default bg-black/40"
            onClick={closeTimeZoneSearch}
          />
          <div className="relative z-10 h-[28rem] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl bg-surface-panel p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <h4 id="response-time-zone-heading" className="text-lg font-bold">
                Search cities
              </h4>
              <button
                type="button"
                aria-label="Close time zone search"
                onClick={closeTimeZoneSearch}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-content-muted hover:bg-surface-muted focus:outline-none focus:ring-1 focus:ring-border-strong"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <label htmlFor="response-time-zone-search" className="mt-5 block text-sm font-bold">
              City or country
            </label>
            <input
              id="response-time-zone-search"
              type="search"
              value={timeZoneQuery}
              onChange={(event) => setTimeZoneQuery(event.target.value)}
              placeholder="Tokyo or Canada"
              autoFocus
              className="mt-2 w-full rounded-xl border border-border-default bg-surface-panel px-4 py-3 focus:outline-none focus:ring-1 focus:ring-border-strong"
            />
            <div className="mt-3 grid max-h-72 gap-2 overflow-y-auto" aria-live="polite">
              {timeZoneCities.length > 0 ? (
                timeZoneCities.map((city) => (
                  <button
                    key={city.key}
                    type="button"
                    onClick={() => selectTimeZone(city.timeZone)}
                    className="grid cursor-pointer justify-items-start rounded-lg bg-surface-muted px-3 py-3 text-left hover:bg-surface-subtle focus:outline-none focus:ring-1 focus:ring-border-strong"
                  >
                    <span className="font-semibold">{city.name}</span>
                    <span className="text-sm text-content-muted">
                      {city.region} · {city.timeZone}
                    </span>
                  </button>
                ))
              ) : (
                <p className="text-sm text-content-muted">No cities found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
