import { Check, Copy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import axios from 'axios'
import type { EventDetail, TimeOption } from '../types/event.ts'

type CopyStatus = 'idle' | 'copied' | 'error'

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

export default function EventDetailPage() {
  const { public_token } = useParams()
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle')
  const eventUrl = public_token ? `${window.location.origin}/events/${public_token}` : ''

  useEffect(() => {
    if (copyStatus !== 'copied') return

    const timeoutId = window.setTimeout(() => setCopyStatus('idle'), 2_000)
    return () => window.clearTimeout(timeoutId)
  }, [copyStatus])

  useEffect(() => {
    let isActive = true

    const getEventDetail = async () => {
      if (!public_token) {
        setLoadError('Event not found.')
        setIsLoading(false)
        return
      }

      try {
        const { data } = await axios.get<EventDetail>(`http://localhost:3000/api/v1/events/${public_token}`)
        if (isActive) setEvent(data)
      } catch (error) {
        if (!isActive) return

        setLoadError(
          axios.isAxiosError(error) && error.response?.status === 404
            ? 'Event not found.'
            : 'Failed to load the event.',
        )
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    void getEventDetail()
    return () => {
      isActive = false
    }
  }, [public_token])

  const handleCopy = async () => {
    if (!eventUrl || !navigator.clipboard) {
      setCopyStatus('error')
      return
    }

    try {
      await navigator.clipboard.writeText(eventUrl)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('error')
    }
  }

  if (isLoading) {
    return <main className="mx-auto w-full max-w-4xl px-4 py-4 sm:py-8" />
  }

  if (loadError || !event) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-3 px-4 py-4 text-content-primary sm:py-8">
        <h1 className="text-2xl font-bold">{loadError ?? 'Event not found.'}</h1>
        <p className="text-content-secondary">The event may have been deleted or the link may be incorrect.</p>
      </main>
    )
  }

  return (
    <main className="mx-auto grid w-full max-w-4xl gap-8 px-4 py-4 text-content-primary sm:py-8">
      <section className="flex items-start justify-between gap-4">
        <div className="grid gap-3">
          <h1 className="text-2xl font-bold sm:text-3xl">{event.name}</h1>
          {event.description && <p className="whitespace-pre-wrap text-content-secondary">{event.description}</p>}
        </div>
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => void handleCopy()}
            aria-label="Copy event link"
            title="Copy event link"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-border-default text-content-secondary transition hover:bg-surface-muted hover:text-content-primary focus:outline-none focus:ring-1 focus:ring-border-strong"
          >
            {copyStatus === 'copied' ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
          </button>
          {copyStatus === 'copied' && (
            <span
              className="pointer-events-none absolute bottom-full right-0 mb-2 rounded-md bg-content-primary px-2 py-1 text-xs text-white"
              role="status"
            >
              Copied
            </span>
          )}
        </div>
      </section>

      <section className="grid gap-4" aria-labelledby="time-options-heading">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="time-options-heading" className="text-lg font-bold">
            Available dates and times
          </h2>
          <span className="text-sm text-content-muted">{event.time_options.length} options</span>
        </div>
        <div className="grid gap-3">
          {event.time_options.length > 0 ? (
            event.time_options.map((timeOption) => (
              <div
                key={timeOption.id}
                className="rounded-lg border border-border-subtle bg-surface-panel px-4 py-3 text-sm font-semibold"
              >
                {formatTimeOption(timeOption, event.time_zone)}
              </div>
            ))
          ) : (
            <p className="text-sm text-content-muted">No dates and times available.</p>
          )}
        </div>
      </section>

      <section className="grid gap-4" aria-labelledby="responses-heading">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="responses-heading" className="text-lg font-bold">
            Responses
          </h2>
          <span className="text-sm text-content-muted">{event.responses.length} responses</span>
        </div>
        {event.responses.length === 0 && <p className="text-sm text-content-secondary">No responses yet.</p>}
      </section>

      <p className="text-xs text-content-muted">This page and its responses may be deleted after one year.</p>
    </main>
  )
}
