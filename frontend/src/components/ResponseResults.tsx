import { Check, Copy, X } from 'lucide-react'
import { CITY_CATALOG } from '../data/cityCatalog.ts'
import { useEffect, useState, type KeyboardEvent } from 'react'
import type { Response, TimeOption } from '../types/event.ts'

type ResponseResultsProps = {
  eventTimeZone: string
  responses: Response[]
  timeOptions: TimeOption[]
}

function formatTimeOption(timeOption: TimeOption, timeZone: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone,
  }).format(new Date(timeOption.starts_at))
}

function formatShareLocation(timeZone: string) {
  return CITY_CATALOG.find((item) => item.timeZone === timeZone)?.name ?? timeZone
}

function formatShareTime(startsAt: string, timeZone: string) {
  const formatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone,
  }).format(new Date(startsAt))

  return formatted.replace(/, (?=\d{1,2}:)/, ' at ')
}

function getViewerTimeZone(fallbackTimeZone: string) {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || fallbackTimeZone
  } catch {
    return fallbackTimeZone
  }
}

export default function ResponseResults({ eventTimeZone, responses, timeOptions }: ResponseResultsProps) {
  const availableCounts = timeOptions.map((timeOption) =>
    responses.reduce((count, response) => {
      const availability = response.availabilities.find((item) => item.time_option_id === timeOption.id)
      return count + (availability?.status === 'available' ? 1 : 0)
    }, 0),
  )
  const maximumAvailable = Math.max(0, ...availableCounts)
  const isCompactResponseTable = timeOptions.length > 6
  const responseTableColumnClasses = isCompactResponseTable
    ? {
        name: 'w-20',
        time: 'w-16 max-w-16',
        comment: 'w-28 lg:w-28',
      }
    : {
        name: 'w-20 lg:w-28',
        time: 'w-16 max-w-16 lg:w-20 lg:max-w-20',
        comment: 'w-28 lg:w-64 lg:max-w-64',
      }
  const [hoveredColumnIndex, setHoveredColumnIndex] = useState<number | null>(null)
  const [selectedTimeOption, setSelectedTimeOption] = useState<TimeOption | null>(null)
  const [shareText, setShareText] = useState('')
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle')
  const viewerTimeZone = getViewerTimeZone(eventTimeZone)

  const columnClassName = (index: number) => (hoveredColumnIndex === index ? 'bg-surface-subtle' : '')

  const openShareDialog = (timeOption: TimeOption) => {
    const timeZones = [viewerTimeZone, eventTimeZone, ...responses.map((response) => response.time_zone)].filter(
      (timeZone, index, zones) => timeZone && zones.indexOf(timeZone) === index,
    )

    setSelectedTimeOption(timeOption)
    setShareText(
      timeZones
        .map((timeZone) => `${formatShareLocation(timeZone)}: ${formatShareTime(timeOption.starts_at, timeZone)}`)
        .join('\n'),
    )
    setCopyStatus('idle')
  }

  const closeShareDialog = () => {
    setSelectedTimeOption(null)
    setShareText('')
    setCopyStatus('idle')
  }

  const handleColumnKeyDown = (event: KeyboardEvent, timeOption: TimeOption) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    openShareDialog(timeOption)
  }

  const handleCopy = async () => {
    if (!navigator.clipboard) {
      setCopyStatus('error')
      return
    }

    try {
      await navigator.clipboard.writeText(shareText)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('error')
    }
  }

  useEffect(() => {
    if (copyStatus === 'idle') return

    const timeoutId = window.setTimeout(() => setCopyStatus('idle'), 2_500)
    return () => window.clearTimeout(timeoutId)
  }, [copyStatus])

  return (
    <section className="grid min-w-0 w-full grid-cols-[minmax(0,1fr)] gap-4" aria-labelledby="responses-heading">
      <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-2">
        <h2 id="responses-heading" className="min-w-0 text-lg font-bold">
          Responses
        </h2>
        <span className="shrink-0 text-sm text-content-muted">
          {responses.length} {responses.length === 1 ? 'response' : 'responses'}
        </span>
      </div>
      {responses.length === 0 && <p className="text-sm text-content-secondary">No responses yet.</p>}
      <div className="min-w-0 w-full overflow-x-auto rounded-xl border border-border-subtle bg-surface-panel">
        <table className="w-max min-w-full table-fixed border-collapse text-left text-sm lg:w-full">
          <thead>
            <tr className="border-b border-border-subtle text-content-secondary">
              <th
                scope="col"
                className={`${responseTableColumnClasses.name} sticky left-0 z-20 relative break-words bg-surface-panel px-3 py-4 text-center text-sm font-bold after:pointer-events-none after:absolute after:inset-y-0 after:-right-px after:w-px after:bg-border-subtle after:content-['']`}
              >
                Name
              </th>
              {timeOptions.map((timeOption, index) => (
                <th
                  key={timeOption.id}
                  scope="col"
                  tabIndex={0}
                  aria-label={`Select ${formatTimeOption(timeOption, eventTimeZone)}`}
                  onMouseEnter={() => setHoveredColumnIndex(index)}
                  onMouseLeave={() => setHoveredColumnIndex(null)}
                  onFocus={() => setHoveredColumnIndex(index)}
                  onBlur={() => setHoveredColumnIndex(null)}
                  onClick={() => openShareDialog(timeOption)}
                  onKeyDown={(event) => handleColumnKeyDown(event, timeOption)}
                  className={`${responseTableColumnClasses.time} cursor-pointer border-l border-border-subtle px-1 py-3 text-center text-xs font-bold transition-colors focus:outline-none ${columnClassName(index)}`}
                >
                  {formatTimeOption(timeOption, eventTimeZone)}
                </th>
              ))}
              <th
                scope="col"
                className={`${responseTableColumnClasses.comment} border-l border-border-subtle px-2 py-4 text-center text-sm font-bold`}
              >
                Comment
              </th>
            </tr>
          </thead>
          <tbody>
            {responses.map((response) => (
              <tr key={response.id} className="border-b border-border-subtle last:border-b-0">
                <th
                  scope="row"
                  className={`${responseTableColumnClasses.name} sticky left-0 z-10 relative break-words bg-surface-panel px-2 py-4 text-center align-middle text-sm font-bold after:pointer-events-none after:absolute after:inset-y-0 after:-right-px after:w-px after:bg-border-subtle after:content-['']`}
                >
                  <span className="block">{response.name}</span>
                </th>
                {timeOptions.map((timeOption, index) => {
                  const availability = response.availabilities.find((item) => item.time_option_id === timeOption.id)
                  const isAvailable = availability?.status === 'available'

                  return (
                    <td
                      key={timeOption.id}
                      tabIndex={0}
                      aria-label={`${isAvailable ? 'Available' : 'Not available'}: ${formatTimeOption(timeOption, eventTimeZone)}`}
                      onMouseEnter={() => setHoveredColumnIndex(index)}
                      onMouseLeave={() => setHoveredColumnIndex(null)}
                      onFocus={() => setHoveredColumnIndex(index)}
                      onBlur={() => setHoveredColumnIndex(null)}
                      onClick={() => openShareDialog(timeOption)}
                      onKeyDown={(event) => handleColumnKeyDown(event, timeOption)}
                      className={`${responseTableColumnClasses.time} cursor-pointer border-l border-border-subtle px-1 py-4 text-center text-xl font-bold transition-colors focus:outline-none ${columnClassName(index)}`}
                    >
                      {isAvailable ? (
                        <Check className="mx-auto text-brand-primary" size={20} strokeWidth={5} aria-hidden="true" />
                      ) : (
                        <X className="mx-auto text-content-muted" size={16} strokeWidth={2.5} aria-hidden="true" />
                      )}
                    </td>
                  )
                })}
                <td
                  className={`${responseTableColumnClasses.comment} break-words border-l border-border-subtle px-2 py-4 align-top text-sm text-content-secondary`}
                >
                  {response.comment || '—'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border-subtle text-content-secondary">
              <th
                scope="row"
                className={`${responseTableColumnClasses.name} sticky left-0 z-10 relative whitespace-nowrap bg-surface-panel px-2 py-4 text-center text-sm text-brand-primary font-bold after:pointer-events-none after:absolute after:inset-y-0 after:-right-px after:w-px after:bg-border-subtle after:content-['']`}
              >
                Available
              </th>
              {availableCounts.map((count, index) => {
                const isMostAvailable = maximumAvailable > 0 && count === maximumAvailable

                return (
                  <td
                    key={timeOptions[index].id}
                    tabIndex={0}
                    aria-label={`${count} available: ${formatTimeOption(timeOptions[index], eventTimeZone)}`}
                    onMouseEnter={() => setHoveredColumnIndex(index)}
                    onMouseLeave={() => setHoveredColumnIndex(null)}
                    onFocus={() => setHoveredColumnIndex(index)}
                    onBlur={() => setHoveredColumnIndex(null)}
                    onClick={() => openShareDialog(timeOptions[index])}
                    onKeyDown={(event) => handleColumnKeyDown(event, timeOptions[index])}
                    className={`${responseTableColumnClasses.time} cursor-pointer border-l border-border-subtle px-1 py-4 text-center text-lg transition-colors focus:outline-none ${isMostAvailable ? 'font-bold text-brand-primary' : 'font-normal'} ${columnClassName(index)}`}
                  >
                    {count}
                  </td>
                )
              })}
              <td className="border-l border-border-subtle" />
            </tr>
          </tfoot>
        </table>
      </div>

      {selectedTimeOption && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="candidate-share-heading"
        >
          <button
            type="button"
            aria-label="Close selected time"
            className="absolute inset-0 cursor-default bg-black/40"
            onClick={closeShareDialog}
          />
          <div className="relative z-10 max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl bg-surface-panel p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <h3 id="candidate-share-heading" className="text-xl font-bold">
                Selected time
              </h3>
              <button
                type="button"
                aria-label="Close selected time"
                title="Close selected time"
                onClick={closeShareDialog}
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-content-muted hover:bg-surface-muted focus:outline-none focus:ring-1 focus:ring-border-strong"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <p className="mt-5 text-lg font-bold">{formatShareTime(selectedTimeOption.starts_at, viewerTimeZone)}</p>
            <label htmlFor="candidate-share-text" className="sr-only">
              Times to share
            </label>
            <textarea
              id="candidate-share-text"
              value={shareText}
              onChange={(event) => setShareText(event.target.value)}
              rows={4}
              className="mt-4 w-full resize-none rounded-lg border border-border-default bg-surface-panel px-3 py-2 text-sm text-content-secondary focus:outline-none focus:ring-1 focus:ring-border-strong"
            />
            <div className="mt-6">
              <button
                type="button"
                onClick={() => void handleCopy()}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-brand-primary px-4 py-2 text-sm font-bold text-white hover:bg-brand-primary-hover focus:outline-none focus:ring-1 focus:ring-border-strong"
              >
                {copyStatus === 'copied' ? (
                  <Check size={16} aria-hidden="true" />
                ) : (
                  <Copy size={16} aria-hidden="true" />
                )}
                Copy as text
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
