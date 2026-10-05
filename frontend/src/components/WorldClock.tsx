import { type DragEvent, useEffect, useState } from 'react'
import { ChevronLeft, ChevronsLeft, ChevronsRight, ChevronRight, CircleX, Home, Pencil, Plus, X } from 'lucide-react'
import CitySearchModal from './CitySearchModal.tsx'
import { useModalAccessibility } from '../hooks/useModalAccessibility.ts'
import { CITY_CATALOG } from '../data/cityCatalog'
import type { City } from '../data/cityCatalog'
import { useTimeFormat } from '../hooks/useTimeFormat.ts'
import {
  MAX_CITIES,
  MAX_TIME_CANDIDATES,
  buildHourlyTimeline,
  formatCurrentTime,
  formatDateInputLabel,
  formatLocalTimePreview,
  formatLocalDateTimeInput,
  formatTimelineCell,
  formatUtcOffset,
  getDateInputValue,
  getInstantsForLocalDateTime,
  groupTimelineEntriesByHour,
  loadSelectedCities,
  saveSelectedCities,
  shiftDateInputValue,
  type SelectedCity,
} from '../lib/worldClock'

type WorldClockProps = {
  candidates?: Date[]
  onCandidatesChange?: (candidates: Date[]) => void
  onPrimaryTimeZoneChange?: (timeZone: string) => void
  onSelectedCitiesChange?: (cities: SelectedCity[]) => void
}

export default function WorldClock({
  candidates,
  onCandidatesChange,
  onPrimaryTimeZoneChange,
  onSelectedCitiesChange,
}: WorldClockProps) {
  const { timeFormat } = useTimeFormat()
  const [cities, setCities] = useState<SelectedCity[]>(() => loadSelectedCities())
  const [now, setNow] = useState(() => new Date())
  const [comparisonDate, setComparisonDate] = useState(() => {
    const initialCities = loadSelectedCities()
    const primaryCity = initialCities.find((city) => city.primary)
    return getDateInputValue(new Date(), primaryCity?.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone)
  })
  const [isCityDialogOpen, setIsCityDialogOpen] = useState(false)
  const [isReplacingCity, setIsReplacingCity] = useState(false)
  const [message, setMessage] = useState('')
  const [isTimeDialogOpen, setIsTimeDialogOpen] = useState(false)
  const [timeInput, setTimeInput] = useState({ date: '', time: '' })
  const [resolvedInstants, setResolvedInstants] = useState<Date[]>([])
  const [selectedInstant, setSelectedInstant] = useState<Date | null>(null)
  const [timeDialogStatus, setTimeDialogStatus] = useState('')
  const [internalCandidateInstants, setInternalCandidateInstants] = useState<Date[]>([])
  const [draggedCityKey, setDraggedCityKey] = useState<string | null>(null)
  const [dragOverCityKey, setDragOverCityKey] = useState<string | null>(null)
  const candidateInstants = candidates ?? internalCandidateInstants

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    if (!isTimeDialogOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsTimeDialogOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isTimeDialogOpen])

  const updateCities = (nextCities: SelectedCity[]) => {
    setCities(nextCities)
    if (!saveSelectedCities(nextCities)) {
      setMessage('Your browser could not save this city list, but you can keep using it for now.')
    } else {
      setMessage('')
    }
  }

  const handleCityDragStart = (event: DragEvent<HTMLDivElement>, key: string) => {
    if (cities.find((city) => city.key === key)?.primary) {
      event.preventDefault()
      return
    }

    setDraggedCityKey(key)
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', key)
    }
  }

  const handleCityDragOver = (event: DragEvent<HTMLDivElement>, key: string) => {
    if (!draggedCityKey || cities.find((city) => city.key === key)?.primary) return

    event.preventDefault()
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
    setDragOverCityKey(key)
  }

  const handleCityDrop = (event: DragEvent<HTMLDivElement>, targetKey: string) => {
    event.preventDefault()
    const sourceKey = draggedCityKey ?? event.dataTransfer?.getData('text/plain') ?? ''
    const sourceIndex = cities.findIndex((city) => city.key === sourceKey)
    const targetIndex = cities.findIndex((city) => city.key === targetKey)

    if (sourceIndex < 0 || targetIndex < 0 || cities[targetIndex].primary || sourceIndex === targetIndex) {
      setDraggedCityKey(null)
      setDragOverCityKey(null)
      return
    }

    const nextCities = [...cities]
    const [movedCity] = nextCities.splice(sourceIndex, 1)
    const adjustedTargetIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex
    nextCities.splice(adjustedTargetIndex, 0, movedCity)
    updateCities(nextCities)
    setDraggedCityKey(null)
    setDragOverCityKey(null)
  }

  const handleCityDragEnd = () => {
    setDraggedCityKey(null)
    setDragOverCityKey(null)
  }

  const openAddCity = () => {
    setIsReplacingCity(false)
    setMessage('')
    setIsCityDialogOpen(true)
  }

  const openChangeCity = () => {
    setIsReplacingCity(true)
    setMessage('')
    setIsCityDialogOpen(true)
  }

  const handleCitySelection = (city: City) => {
    if (isReplacingCity) {
      const primaryIndex = cities.findIndex((selectedCity) => selectedCity.primary)
      const existingIndex = cities.findIndex((selectedCity) => selectedCity.key === city.key)
      const nextCities =
        existingIndex >= 0
          ? cities.map((selectedCity) => ({
              ...selectedCity,
              primary: selectedCity.key === city.key,
            }))
          : cities.map((selectedCity, index) => (index === primaryIndex ? { ...city, primary: true } : selectedCity))

      updateCities(nextCities.sort((left, right) => Number(right.primary) - Number(left.primary)))
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
    const city = cities.find((selectedCity) => selectedCity.key === key)
    if (!city || city.primary) return
    updateCities(cities.filter((selectedCity) => selectedCity.key !== key))
  }

  const primaryCity = cities.find((city) => city.primary)
  const timeline = primaryCity ? buildHourlyTimeline(comparisonDate, primaryCity.timeZone) : []
  const timelineColumns = groupTimelineEntriesByHour(timeline)

  useEffect(() => {
    onPrimaryTimeZoneChange?.(primaryCity?.timeZone ?? '')
  }, [onPrimaryTimeZoneChange, primaryCity?.timeZone])

  useEffect(() => {
    onSelectedCitiesChange?.(cities)
  }, [cities, onSelectedCitiesChange])

  const moveDate = (days: number) => {
    setComparisonDate((currentDate) => shiftDateInputValue(currentDate, days))
  }

  const updateTimePreview = (date: string, time: string, preferredInstant?: Date) => {
    setTimeInput({ date, time })
    if (date) setComparisonDate(date)
    setTimeDialogStatus('')
    if (!primaryCity || !date || !time) {
      setResolvedInstants([])
      setSelectedInstant(null)
      return
    }

    const [hour, minute] = time.split(':').map(Number)
    const instants = getInstantsForLocalDateTime({ date, hour, minute }, primaryCity.timeZone)
    setResolvedInstants(instants)

    if (instants.length === 0) {
      setSelectedInstant(null)
      setTimeDialogStatus('This local time does not exist on the selected date.')
    } else if (preferredInstant && instants.some((instant) => instant.getTime() === preferredInstant.getTime())) {
      setSelectedInstant(preferredInstant)
    } else if (instants.length === 1) {
      setSelectedInstant(instants[0])
    } else {
      setSelectedInstant(null)
      setTimeDialogStatus('This local time occurs twice. Choose an occurrence.')
    }
  }

  const moveTimeDialogDate = (days: number) => {
    if (!timeInput.date) return
    updateTimePreview(shiftDateInputValue(timeInput.date, days), timeInput.time)
  }

  const openTimeSelection = (instant: Date) => {
    if (!primaryCity) return
    const input = formatLocalDateTimeInput(instant, primaryCity.timeZone)
    setIsTimeDialogOpen(true)
    setSelectedInstant(instant)
    updateTimePreview(input.date, input.time, instant)
  }

  const closeTimeSelection = () => {
    setIsTimeDialogOpen(false)
    setSelectedInstant(null)
    setResolvedInstants([])
    setTimeDialogStatus('')
  }

  const timeDialogRef = useModalAccessibility(isTimeDialogOpen, closeTimeSelection, { initialFocus: 'dialog' })

  const candidateAlreadySelected = selectedInstant
    ? candidateInstants.some((candidate) => candidate.getTime() === selectedInstant.getTime())
    : false

  const addCandidate = () => {
    if (!selectedInstant || candidateAlreadySelected || candidateInstants.length >= MAX_TIME_CANDIDATES) return

    const nextCandidates = [...candidateInstants, selectedInstant].sort(
      (left, right) => left.getTime() - right.getTime(),
    )
    if (onCandidatesChange) {
      onCandidatesChange(nextCandidates)
    } else {
      setInternalCandidateInstants(nextCandidates)
    }
  }

  const clearColumnHighlight = (table: HTMLDivElement) => {
    table.querySelectorAll<HTMLElement>('[data-column-index]').forEach((cell) => {
      cell.style.removeProperty('background-color')
    })
    delete table.dataset.hoveredColumnIndex
  }

  const highlightColumn = (table: HTMLDivElement, columnIndex: string) => {
    if (table.dataset.hoveredColumnIndex === columnIndex) return

    clearColumnHighlight(table)
    table.querySelectorAll<HTMLElement>(`[data-column-index="${columnIndex}"]`).forEach((cell) => {
      cell.style.backgroundColor = 'var(--surface-hover)'
    })
    table.dataset.hoveredColumnIndex = columnIndex
  }

  const handleTableMouseOver = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target
    if (!(target instanceof HTMLElement)) return

    const cell = target.closest<HTMLElement>('[data-column-index]')
    if (!cell || !event.currentTarget.contains(cell)) return

    const columnIndex = cell.dataset.columnIndex
    if (columnIndex) {
      highlightColumn(event.currentTarget, columnIndex)
    }
  }

  return (
    <section className="world-clock" aria-label="World Clock">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-0">
            <button
              type="button"
              aria-label="Previous week"
              title="Previous week"
              onClick={() => moveDate(-7)}
              className="cursor-pointer rounded-full p-1.5 text-brand-content hover:text-brand-content-hover focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
            >
              <ChevronsLeft size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Previous day"
              title="Previous day"
              onClick={() => moveDate(-1)}
              className="cursor-pointer rounded-full p-1.5 text-brand-content hover:text-brand-content-hover focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <label htmlFor="comparison-date" className="sr-only">
              Comparison date
            </label>
            <input
              id="comparison-date"
              type="date"
              value={comparisonDate}
              onChange={(event) => setComparisonDate(event.target.value)}
              className="rounded-lg border border-border-default bg-surface-panel px-2.5 py-1.5 text-sm text-content-primary outline-none focus:border-brand-outline focus-visible:ring-1 focus-visible:ring-border-strong"
            />
            <button
              type="button"
              aria-label="Next day"
              title="Next day"
              onClick={() => moveDate(1)}
              className="cursor-pointer rounded-full p-1.5 text-brand-content hover:text-brand-content-hover focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
            >
              <ChevronRight size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Next week"
              title="Next week"
              onClick={() => moveDate(7)}
              className="cursor-pointer rounded-full p-1.5 text-brand-content hover:text-brand-content-hover focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
            >
              <ChevronsRight size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="ml-auto flex flex-col items-end gap-2">
            <button
              type="button"
              onClick={openAddCity}
              disabled={cities.length >= MAX_CITIES}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-brand-outline px-4 py-2.5 font-semibold text-brand-content transition hover:border-brand-content-hover hover:bg-brand-primary/5 hover:text-brand-content-hover focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={14} strokeWidth={4} aria-hidden="true" />
              Add city
            </button>
          </div>
        </div>
        {message && (
          <p className="mt-4 text-xs text-status-warning" role="status">
            {message}
          </p>
        )}

        <div className="mt-6 overflow-hidden rounded-xl border border-border-subtle bg-surface-panel">
          {cities.length === 0 ? (
            <div className="px-5 py-10 text-center sm:px-8">
              <h2 className="text-lg font-semibold text-content-primary">Choose your city</h2>
              <p className="mt-2 text-sm text-content-muted">
                We could not match your browser time zone to a city. Choose one to get started.
              </p>
              <button
                type="button"
                onClick={openChangeCity}
                className="mt-5 cursor-pointer rounded-lg bg-brand-primary px-4 py-2 font-semibold text-white hover:bg-brand-primary-hover focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
              >
                Choose city
              </button>
            </div>
          ) : (
            <div
              className="min-w-0 max-w-full overflow-x-auto bg-surface-muted"
              role="table"
              onMouseOver={handleTableMouseOver}
              onMouseLeave={(event) => clearColumnHighlight(event.currentTarget)}
              aria-label={`World clock for ${formatDateInputLabel(comparisonDate)}`}
            >
              <p className="sr-only">Hourly local times for {formatDateInputLabel(comparisonDate)}</p>
              {cities.map((city) => {
                let previousDateKey: string | undefined

                return (
                  <div
                    key={city.key}
                    draggable={!city.primary}
                    onDragStart={(event) => handleCityDragStart(event, city.key)}
                    onDragOver={(event) => handleCityDragOver(event, city.key)}
                    onDrop={(event) => handleCityDrop(event, city.key)}
                    onDragEnd={handleCityDragEnd}
                    className={`world-clock-grid-row grid gap-px border-b border-border-subtle bg-surface-muted text-sm last:border-b-0 ${!city.primary ? 'cursor-move' : ''} ${draggedCityKey === city.key ? 'opacity-50' : ''} ${dragOverCityKey === city.key ? 'bg-brand-primary/10' : ''}`}
                    style={
                      {
                        '--world-clock-hour-count': timelineColumns.length,
                      } as React.CSSProperties
                    }
                    role="row"
                  >
                    <div role="rowheader" className="sticky left-0 z-10 min-h-16 bg-surface-muted px-3 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="min-w-0 break-words font-bold text-content-primary">{city.name}</span>
                        {city.primary ? (
                          <button
                            type="button"
                            aria-label="Change your city"
                            onClick={openChangeCity}
                            className="group shrink-0 cursor-pointer rounded-full p-1 text-brand-content hover:bg-surface-panel focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
                          >
                            <Home size={12} aria-hidden="true" className="group-hover:hidden" />
                            <Pencil size={12} aria-hidden="true" className="hidden group-hover:block" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            aria-label={`Remove ${city.name}`}
                            onClick={() => handleRemoveCity(city.key)}
                            className="shrink-0 cursor-pointer rounded-full p-1 text-content-muted hover:bg-surface-panel hover:text-status-danger focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
                          >
                            <CircleX size={12} aria-hidden="true" />
                          </button>
                        )}
                      </div>
                      <span className="mt-1 block whitespace-normal break-words text-[0.65rem] font-medium leading-tight text-content-secondary">
                        {formatCurrentTime(now, city.timeZone, timeFormat)}
                        <span className="block font-normal text-content-muted">
                          ({formatUtcOffset(now, city.timeZone)})
                        </span>
                      </span>
                    </div>
                    {timelineColumns.map((entries, index) => {
                      const entry = entries[0]
                      const cell = entry ? formatTimelineCell(entry.instant, city.timeZone, timeFormat) : undefined
                      const offset = entry ? formatUtcOffset(entry.instant, city.timeZone) : undefined
                      const previousEntry = timelineColumns
                        .slice(0, index)
                        .reverse()
                        .find((column) => column[0])?.[0]
                      const nextEntry = timelineColumns.slice(index + 1).find((column) => column[0])?.[0]
                      const previousOffset = previousEntry
                        ? formatUtcOffset(previousEntry.instant, city.timeZone)
                        : undefined
                      const nextOffset = nextEntry ? formatUtcOffset(nextEntry.instant, city.timeZone) : undefined
                      const showOffset = Boolean(
                        offset &&
                        ((previousOffset && previousOffset !== offset) || (nextOffset && nextOffset !== offset)),
                      )
                      const showDate = cell !== undefined && previousDateKey !== cell.dateKey
                      const isEarlyMorning = cell !== undefined && cell.hour24 <= 5

                      if (cell) {
                        previousDateKey = cell.dateKey
                      }

                      const cellBackground = isEarlyMorning ? 'bg-surface-early-morning' : 'bg-surface-panel'
                      const cellTextColor = isEarlyMorning ? 'text-content-early-morning' : 'text-content-secondary'
                      const cellLabel = cell
                        ? `${city.name}, ${cell.dateKey}, ${cell.hour}${cell.period ? ` ${cell.period}` : ''}, ${offset ?? ''}`
                        : `${city.name}, unavailable time`

                      return (
                        <div
                          key={`hour-${index}`}
                          role="cell"
                          data-column-index={index}
                          aria-label={cellLabel}
                          tabIndex={cell ? 0 : -1}
                          onClick={() => entry && openTimeSelection(entry.instant)}
                          onKeyDown={(event) => {
                            if (entry && (event.key === 'Enter' || event.key === ' ')) {
                              event.preventDefault()
                              openTimeSelection(entry.instant)
                            }
                          }}
                          className={`min-w-0 cursor-pointer ${cellBackground} flex flex-col items-center justify-center px-0.5 py-1.5 text-center ${showDate ? 'text-[0.65rem]' : cellTextColor}`}
                        >
                          {showDate && cell ? (
                            <span className={`block leading-tight ${cellTextColor}`}>
                              <span className="block">{cell.month}</span>
                              <span className="block text-xs font-semibold">{cell.day}</span>
                            </span>
                          ) : null}
                          {!showDate && cell && (
                            <span className="block leading-tight">
                              <span className={`block text-base font-bold ${cellTextColor}`}>{cell.hour}</span>
                              {cell.period && (
                                <span className={`block text-[0.65rem] ${cellTextColor}`}>{cell.period}</span>
                              )}
                              {showOffset && offset && (
                                <span className="block text-[0.5rem] text-status-warning font-semibold">{offset}</span>
                              )}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {isTimeDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-surface-scrim/50 p-4"
          role="presentation"
        >
          <div className="absolute inset-0" onClick={closeTimeSelection} />
          <div
            ref={timeDialogRef}
            tabIndex={-1}
            className="relative z-10 max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-surface-panel p-5 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="time-dialog-heading"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 id="time-dialog-heading" className="text-lg font-bold text-content-primary">
                Choose a time
              </h2>
              <button
                type="button"
                aria-label="Close time selection"
                onClick={closeTimeSelection}
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-content-muted hover:bg-surface-muted hover:text-content-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            <p
              className={`mt-3 text-xs ${candidateInstants.length >= MAX_TIME_CANDIDATES ? 'text-status-danger' : 'text-content-muted'}`}
              role={candidateInstants.length >= MAX_TIME_CANDIDATES ? 'status' : undefined}
            >
              {candidateInstants.length >= MAX_TIME_CANDIDATES
                ? 'You have selected the maximum number of times.'
                : `You can select up to ${MAX_TIME_CANDIDATES} times.`}
            </p>
            <div className="mt-5 grid gap-3">
              <div>
                <label htmlFor="candidate-date" className="block text-sm font-semibold text-content-primary">
                  Date
                </label>
                <input
                  id="candidate-date"
                  type="date"
                  value={timeInput.date}
                  onChange={(event) => updateTimePreview(event.target.value, timeInput.time)}
                  className="mt-2 w-full rounded-lg border border-border-default bg-surface-panel px-3 py-2 text-content-primary outline-none focus:border-brand-outline focus-visible:ring-1 focus-visible:ring-border-strong"
                />
                <div className="mt-1 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="Previous week"
                      title="Previous week"
                      onClick={() => moveTimeDialogDate(-7)}
                      className="inline-flex cursor-pointer items-center rounded-full px-1 py-1 text-xs text-brand-content hover:text-brand-content-hover focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
                    >
                      <ChevronsLeft size={16} aria-hidden="true" />
                      <span>Previous week</span>
                    </button>
                    <button
                      type="button"
                      aria-label="Previous day"
                      title="Previous day"
                      onClick={() => moveTimeDialogDate(-1)}
                      className="inline-flex cursor-pointer items-center rounded-full px-1 py-1 text-xs text-brand-content hover:text-brand-content-hover focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
                    >
                      <ChevronLeft size={14} aria-hidden="true" />
                      <span>Previous day</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="Next day"
                      title="Next day"
                      onClick={() => moveTimeDialogDate(1)}
                      className="inline-flex cursor-pointer items-center rounded-full px-1 py-1 text-xs text-brand-content hover:text-brand-content-hover focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
                    >
                      <span>Next day</span>
                      <ChevronRight size={14} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next week"
                      title="Next week"
                      onClick={() => moveTimeDialogDate(7)}
                      className="inline-flex cursor-pointer items-center rounded-full px-1 py-1 text-xs text-brand-content hover:text-brand-content-hover focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
                    >
                      <span>Next week</span>
                      <ChevronsRight size={16} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="candidate-time" className="block text-sm font-semibold text-content-primary">
                  Time
                </label>
                <input
                  id="candidate-time"
                  type="time"
                  step="60"
                  value={timeInput.time}
                  onChange={(event) => updateTimePreview(timeInput.date, event.target.value)}
                  className="mt-2 w-full rounded-lg border border-border-default bg-surface-panel px-3 py-2 text-content-primary outline-none focus:border-brand-outline focus-visible:ring-1 focus-visible:ring-border-strong"
                />
              </div>
            </div>
            {timeDialogStatus && (
              <p className="mt-3 text-xs text-status-warning" role="status">
                {timeDialogStatus}
              </p>
            )}
            {resolvedInstants.length > 1 && (
              <div className="mt-3 grid gap-2" aria-label="Choose an occurrence">
                {resolvedInstants.map((instant, index) => (
                  <button
                    key={instant.toISOString()}
                    type="button"
                    onClick={() => {
                      setSelectedInstant(instant)
                      setTimeDialogStatus('')
                    }}
                    className={`cursor-pointer rounded-lg border px-3 py-2 text-left text-sm ${selectedInstant?.getTime() === instant.getTime() ? 'border-brand-outline bg-surface-subtle' : 'border-border-subtle hover:border-brand-outline'}`}
                  >
                    Occurrence {index + 1} ({formatUtcOffset(instant, primaryCity?.timeZone ?? '')})
                  </button>
                ))}
              </div>
            )}
            {selectedInstant && (
              <div className="mt-4 grid gap-2" aria-label="Local time previews">
                {cities.map((city) => (
                  <div
                    key={city.key}
                    className="flex items-baseline justify-between gap-3 border-b border-border-subtle py-2 last:border-b-0"
                  >
                    <span className="font-semibold text-content-primary">{city.name}</span>
                    <span className="text-right text-sm text-content-secondary">
                      {formatLocalTimePreview(selectedInstant, city.timeZone, timeFormat)}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={addCandidate}
              disabled={!selectedInstant || candidateAlreadySelected || candidateInstants.length >= MAX_TIME_CANDIDATES}
              className="mt-4 w-full cursor-pointer rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary-hover focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong disabled:cursor-not-allowed disabled:opacity-50"
            >
              {candidateAlreadySelected ? 'Already selected' : 'Add this time'}
            </button>
          </div>
        </div>
      )}

      {isCityDialogOpen && (
        <CitySearchModal
          title={isReplacingCity ? 'Change your city' : 'Add a city'}
          inputLabel="Search cities"
          placeholder="Search by city or country"
          cities={CITY_CATALOG.filter(
            (city) => isReplacingCity || !cities.some((selectedCity) => selectedCity.key === city.key),
          )}
          helperText={<p className="mt-3 text-sm text-content-muted">You can select up to {MAX_CITIES} cities.</p>}
          onSelect={handleCitySelection}
          onClose={() => setIsCityDialogOpen(false)}
        />
      )}
    </section>
  )
}
