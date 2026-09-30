import { Check, Copy, Info, MessageCircle, Pencil, X } from 'lucide-react'
import { CITY_CATALOG } from '../data/cityCatalog.ts'
import { useEffect, useState } from 'react'
import type { Response, TimeOption } from '../types/event.ts'
import { useModalAccessibility } from '../hooks/useModalAccessibility.ts'

type ResponseResultsProps = {
  eventTimeZone: string
  timeZone: string
  cityKey?: string
  responses: Response[]
  timeOptions: TimeOption[]
  onEditResponse?: (response: Response) => void
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

function formatShareLocation(timeZone: string, cityKey?: string) {
  return (
    CITY_CATALOG.find((item) => item.key === cityKey)?.name ??
    CITY_CATALOG.find((item) => item.timeZone === timeZone)?.name ??
    timeZone
  )
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

export default function ResponseResults({
  eventTimeZone,
  timeZone,
  cityKey,
  responses,
  timeOptions,
  onEditResponse,
}: ResponseResultsProps) {
  const availableCounts = timeOptions.map((timeOption) =>
    responses.reduce((count, response) => {
      const availability = response.availabilities.find((item) => item.time_option_id === timeOption.id)
      return count + (availability?.status === 'available' ? 1 : 0)
    }, 0),
  )
  const unavailableCounts = timeOptions.map((timeOption) =>
    responses.reduce((count, response) => {
      const availability = response.availabilities.find((item) => item.time_option_id === timeOption.id)
      return count + (availability?.status === 'unavailable' ? 1 : 0)
    }, 0),
  )
  const [selectedTimeOption, setSelectedTimeOption] = useState<TimeOption | null>(null)
  const [selectedAvailabilityTimeOption, setSelectedAvailabilityTimeOption] = useState<TimeOption | null>(null)
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null)
  const [isCopyHintOpen, setIsCopyHintOpen] = useState(false)
  const [shareText, setShareText] = useState('')
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle')

  const openShareDialog = (timeOption: TimeOption) => {
    const locations: { timeZone: string; cityKey?: string }[] = [
      { timeZone, cityKey },
      { timeZone: eventTimeZone },
      ...responses.map((response) => ({ timeZone: response.time_zone, cityKey: response.city_key })),
    ].filter(
      (location, index, allLocations) =>
        location.timeZone && allLocations.findIndex((candidate) => candidate.timeZone === location.timeZone) === index,
    )

    setSelectedTimeOption(timeOption)
    setShareText(
      locations
        .map(
          ({ timeZone, cityKey }) =>
            `${formatShareLocation(timeZone, cityKey)}: ${formatShareTime(timeOption.starts_at, timeZone)}`,
        )
        .join('\n'),
    )
    setCopyStatus('idle')
  }

  const closeShareDialog = () => {
    setSelectedTimeOption(null)
    setShareText('')
    setCopyStatus('idle')
  }

  const closeResponseDialog = () => {
    setSelectedResponse(null)
  }

  const openResponseDetails = (response: Response) => {
    setSelectedResponse(response)
  }

  const closeAvailabilityDialog = () => {
    setSelectedAvailabilityTimeOption(null)
  }

  const responseDetailsRef = useModalAccessibility(Boolean(selectedResponse), closeResponseDialog)
  const availabilitySummaryRef = useModalAccessibility(Boolean(selectedAvailabilityTimeOption), closeAvailabilityDialog)
  const selectedTimeRef = useModalAccessibility(Boolean(selectedTimeOption), closeShareDialog)

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
    <section
      className="grid min-w-0 w-full grid-cols-[minmax(0,1fr)] gap-4 sm:gap-6"
      aria-labelledby="responses-heading"
    >
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
        <div className="relative min-w-0">
          <div className="flex items-center gap-2">
            <h2 id="responses-heading" className="min-w-0 text-lg font-bold">
              Responses
            </h2>
            <button
              type="button"
              aria-label={isCopyHintOpen ? 'Hide copy instructions' : 'Show copy instructions'}
              aria-expanded={isCopyHintOpen}
              aria-controls="copy-times-hint"
              aria-describedby={isCopyHintOpen ? 'copy-times-hint' : undefined}
              onClick={() => setIsCopyHintOpen((isOpen) => !isOpen)}
              className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-content-muted transition hover:bg-surface-muted hover:text-content-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
            >
              <Info size={16} aria-hidden="true" />
            </button>
          </div>
          {isCopyHintOpen && (
            <div
              id="copy-times-hint"
              role="tooltip"
              className="absolute bottom-full left-0 z-30 mb-2 w-64 max-w-[calc(100vw-2rem)] rounded-lg border border-border-strong bg-surface-inverse p-3 text-sm font-normal text-content-inverse"
            >
              Tap a date &amp; time to view and copy its local times.
            </div>
          )}
        </div>
        <span className="shrink-0 text-sm text-content-muted">
          {responses.length} {responses.length === 1 ? 'response' : 'responses'}
        </span>
      </div>

      {responses.length === 0 && <p className="text-sm text-content-secondary">No responses yet.</p>}

      <div className="min-w-0 w-full overflow-hidden rounded-xl border border-border-subtle bg-surface-panel">
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <colgroup>
            <col className="w-1/2" />
            <col className="w-1/4" />
            <col className="w-1/4" />
          </colgroup>
          <thead>
            <tr className="border-b border-border-subtle text-content-secondary">
              <th scope="col" className="px-1 py-4 text-center text-xs font-bold leading-tight sm:px-3 sm:text-sm">
                <span className="flex flex-wrap items-baseline justify-center gap-x-2">
                  <span className="whitespace-nowrap">Date &amp; time</span>
                  <span className="whitespace-nowrap text-[0.65rem] font-normal text-content-muted sm:text-xs">
                    (in {formatShareLocation(timeZone, cityKey)})
                  </span>
                </span>
              </th>
              <th
                scope="col"
                className="border-l border-border-subtle px-1 py-4 text-center text-xs font-bold leading-tight break-all sm:px-3 sm:text-sm"
              >
                Available
              </th>
              <th
                scope="col"
                className="border-l border-border-subtle px-1 py-4 text-center text-xs font-bold leading-tight break-all sm:px-3 sm:text-sm"
              >
                Unavailable
              </th>
            </tr>
          </thead>
          <tbody>
            {timeOptions.map((timeOption, index) => {
              const formattedTime = formatTimeOption(timeOption, timeZone)

              return (
                <tr key={timeOption.id} className="results-row border-b border-border-subtle last:border-b-0">
                  <th scope="row" className="relative h-full p-0 text-left font-semibold">
                    <button
                      type="button"
                      aria-label={`Select ${formattedTime}`}
                      onClick={() => openShareDialog(timeOption)}
                      className="group/date absolute inset-0 flex cursor-pointer items-center break-words px-3 py-4 text-left leading-snug hover:bg-surface-muted"
                    >
                      <span className="min-w-0">{formattedTime}</span>
                      <span className="ml-2 hidden items-center text-content-subtle group-hover/date:inline-flex group-focus-visible/date:inline-flex">
                        <Copy size={12} aria-hidden="true" />
                      </span>
                    </button>
                  </th>
                  <td
                    aria-label={`${availableCounts[index]} available: ${formattedTime}`}
                    className="border-l border-border-subtle p-0 text-center text-lg font-semibold text-brand-primary"
                  >
                    <button
                      type="button"
                      aria-label={`${availableCounts[index]} available: ${formattedTime}`}
                      onClick={() => setSelectedAvailabilityTimeOption(timeOption)}
                      className="results-availability-cell flex h-full w-full cursor-pointer items-center justify-center gap-1 px-3 py-4 hover:bg-surface-muted"
                    >
                      <Check size={18} strokeWidth={3} aria-hidden="true" />
                      {availableCounts[index]}
                    </button>
                  </td>
                  <td
                    aria-label={`${unavailableCounts[index]} unavailable: ${formattedTime}`}
                    className="border-l border-border-subtle p-0 text-center text-lg font-semibold text-content-muted"
                  >
                    <button
                      type="button"
                      aria-label={`${unavailableCounts[index]} unavailable: ${formattedTime}`}
                      onClick={() => setSelectedAvailabilityTimeOption(timeOption)}
                      className="results-availability-cell flex h-full w-full cursor-pointer items-center justify-center gap-1 px-3 py-4 hover:bg-surface-muted"
                    >
                      <X size={18} strokeWidth={3} aria-hidden="true" />
                      {unavailableCounts[index]}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div
        className="rounded-xl border border-border-subtle bg-surface-panel px-4 py-4"
        aria-labelledby="respondents-heading"
      >
        <h3 id="respondents-heading" className="mb-3 text-sm font-bold">
          Respondents
        </h3>
        {responses.length === 0 ? (
          <p className="text-sm text-content-secondary">No respondents yet.</p>
        ) : (
          <ul className="grid gap-2">
            {responses.map((response) => (
              <li key={response.id} className="flex items-center gap-2 text-sm">
                <button
                  type="button"
                  aria-label={`View response from ${response.name}`}
                  onClick={() => openResponseDetails(response)}
                  className="flex min-w-0 cursor-pointer items-center gap-2 text-left hover:text-brand-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
                >
                  <span className="break-all">{response.name}</span>
                  {response.comment && (
                    <span role="img" aria-label={`Has comment from ${response.name}`} className="text-content-subtle">
                      <MessageCircle size={12} aria-hidden="true" />
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedResponse && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="response-detail-heading"
        >
          <button
            type="button"
            aria-label="Close response details"
            className="absolute inset-0 cursor-default bg-black/40"
            onClick={closeResponseDialog}
          />
          <div
            ref={responseDetailsRef}
            tabIndex={-1}
            className="relative z-10 max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl bg-surface-panel p-5 sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-1">
                <h3 id="response-detail-heading" className="text-xl font-bold">
                  Response details
                </h3>
                <button
                  type="button"
                  aria-label="Edit response"
                  title="Edit response"
                  onClick={() => {
                    setSelectedResponse(null)
                    onEditResponse?.(selectedResponse)
                  }}
                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-content-muted hover:bg-surface-muted hover:text-content-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
                >
                  <Pencil size={14} aria-hidden="true" />
                </button>
              </div>
              <div className="shrink-0">
                <button
                  type="button"
                  aria-label="Close response details"
                  title="Close response details"
                  onClick={closeResponseDialog}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-content-muted hover:bg-surface-muted focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              <div>
                <p className="font-bold break-all">{selectedResponse.name}</p>
                <p className="mt-1 text-sm text-content-secondary">
                  {formatShareLocation(selectedResponse.time_zone, selectedResponse.city_key)} (
                  {selectedResponse.time_zone})
                </p>
              </div>
              <div>
                <h4 className="text-sm font-bold">Comment</h4>
                <p className="mt-1 whitespace-pre-wrap text-sm text-content-secondary">
                  {selectedResponse.comment || 'No comment.'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-bold">Availability</h4>
                <ul className="mt-2 grid min-w-0 grid-cols-[minmax(8rem,fit-content(100%))_2rem_2rem] gap-x-4 gap-y-2 sm:gap-x-16">
                  {timeOptions.map((timeOption) => {
                    const availability = selectedResponse.availabilities.find(
                      (item) => item.time_option_id === timeOption.id,
                    )
                    const isAvailable = availability?.status === 'available'
                    const formattedTime = formatTimeOption(timeOption, selectedResponse.time_zone)

                    return (
                      <li
                        key={timeOption.id}
                        aria-label={`${isAvailable ? 'Available' : 'Unavailable'}: ${formattedTime}`}
                        className="col-span-3 grid grid-cols-subgrid items-center border-b border-border-subtle py-2 text-sm text-content-secondary sm:pe-8"
                      >
                        <span>{formattedTime}</span>
                        {isAvailable ? (
                          <Check className="mx-auto text-brand-primary" size={16} strokeWidth={3} aria-hidden="true" />
                        ) : (
                          <span aria-hidden="true" />
                        )}
                        {isAvailable ? (
                          <span aria-hidden="true" />
                        ) : (
                          <X className="mx-auto text-content-muted" size={16} strokeWidth={3} aria-hidden="true" />
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedAvailabilityTimeOption && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="availability-summary-heading"
        >
          <button
            type="button"
            aria-label="Close availability summary"
            className="absolute inset-0 cursor-default bg-black/40"
            onClick={closeAvailabilityDialog}
          />
          <div
            ref={availabilitySummaryRef}
            tabIndex={-1}
            className="relative z-10 max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl bg-surface-panel p-5 sm:p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <h3 id="availability-summary-heading" className="text-xl font-bold">
                {formatTimeOption(selectedAvailabilityTimeOption, timeZone)}
              </h3>
              <button
                type="button"
                aria-label="Close availability summary"
                title="Close availability summary"
                onClick={closeAvailabilityDialog}
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-content-muted hover:bg-surface-muted focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <p className="mt-2 text-right text-xs text-content-muted">
              {responses.length === 0
                ? 'No responses yet.'
                : `${responses.length} ${responses.length === 1 ? 'response' : 'responses'}`}
            </p>
            <ul className="mt-5 grid min-w-0 grid-cols-[minmax(8rem,fit-content(100%))_2rem_2rem] gap-x-2 gap-y-2 sm:gap-x-8">
              {responses.map((response) => {
                const availability = response.availabilities.find(
                  (item) => item.time_option_id === selectedAvailabilityTimeOption.id,
                )
                const isAvailable = availability?.status === 'available'

                return (
                  <li
                    key={response.id}
                    className="col-span-3 grid grid-cols-subgrid items-center border-b border-border-subtle py-2 sm:pe-8"
                  >
                    <span className="min-w-0 break-words text-sm text-content-secondary">{response.name}</span>
                    {isAvailable ? (
                      <Check className="mx-auto text-brand-primary" size={16} strokeWidth={3} aria-label="Available" />
                    ) : (
                      <span aria-hidden="true" />
                    )}
                    {isAvailable ? (
                      <span aria-hidden="true" />
                    ) : (
                      <X className="mx-auto text-content-muted" size={16} strokeWidth={3} aria-label="Unavailable" />
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}

      {selectedTimeOption && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Share ${formatShareTime(selectedTimeOption.starts_at, timeZone)}`}
        >
          <button
            type="button"
            aria-label="Close selected time"
            className="absolute inset-0 cursor-default bg-black/40"
            onClick={closeShareDialog}
          />
          <div
            ref={selectedTimeRef}
            tabIndex={-1}
            className="relative z-10 max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl bg-surface-panel p-5 sm:p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-lg font-bold">{formatShareTime(selectedTimeOption.starts_at, timeZone)}</p>
              <button
                type="button"
                aria-label="Close selected time"
                title="Close selected time"
                onClick={closeShareDialog}
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-content-muted hover:bg-surface-muted focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <label htmlFor="candidate-share-text" className="sr-only">
              Times to share
            </label>
            <textarea
              id="candidate-share-text"
              value={shareText}
              onChange={(event) => setShareText(event.target.value)}
              rows={4}
              className="mt-4 w-full resize-none rounded-lg border border-border-default bg-surface-panel px-3 py-2 text-sm text-content-secondary focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
            />
            <div className="mt-6">
              <button
                type="button"
                onClick={() => void handleCopy()}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary-hover focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
              >
                <span className="flex w-4 shrink-0 justify-center">
                  {copyStatus === 'copied' ? (
                    <Check size={16} aria-hidden="true" />
                  ) : (
                    <Copy size={16} aria-hidden="true" />
                  )}
                </span>
                <span className="w-24 shrink-0 text-center">{copyStatus === 'copied' ? 'Copied' : 'Copy as text'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
