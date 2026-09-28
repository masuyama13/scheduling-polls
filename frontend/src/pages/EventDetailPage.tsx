import { Check, Copy, EllipsisVertical, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import axios from 'axios'
import AvailabilityResponseForm from '../components/AvailabilityResponseForm.tsx'
import ResponseResults from '../components/ResponseResults.tsx'
import EventEditForm from '../components/EventEditForm.tsx'
import EventDeleteForm from '../components/EventDeleteForm.tsx'
import ResponseDeleteForm from '../components/ResponseDeleteForm.tsx'
import { getInitialTimeZone } from '../lib/timeZone.ts'
import type { EventDetail, Response as EventResponse } from '../types/event.ts'

type CopyStatus = 'idle' | 'copied' | 'error'

export default function EventDetailPage() {
  const { public_token } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [timeZone, setTimeZone] = useState('')
  const [cityKey, setCityKey] = useState<string | undefined>()
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle')
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [isDeleteFormOpen, setIsDeleteFormOpen] = useState(false)
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false)
  const [editingResponse, setEditingResponse] = useState<EventResponse | null>(null)
  const [responseToDelete, setResponseToDelete] = useState<EventResponse | null>(null)
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
        if (isActive) {
          setEvent(data)
          setTimeZone(getInitialTimeZone(data.time_zone))
        }
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

  const handleResponseSubmitted = (response: EventResponse) => {
    setEvent((currentEvent) =>
      currentEvent ? { ...currentEvent, responses: [...currentEvent.responses, response] } : currentEvent,
    )
  }

  const handleResponseUpdated = (updatedResponse: EventResponse) => {
    setEvent((currentEvent) =>
      currentEvent
        ? {
            ...currentEvent,
            responses: currentEvent.responses.map((response) =>
              response.id === updatedResponse.id ? updatedResponse : response,
            ),
          }
        : currentEvent,
    )
    setEditingResponse(null)
  }

  const handleResponseDeleted = () => {
    if (!responseToDelete) return

    setEvent((currentEvent) =>
      currentEvent
        ? {
            ...currentEvent,
            responses: currentEvent.responses.filter((response) => response.id !== responseToDelete.id),
          }
        : currentEvent,
    )
    setResponseToDelete(null)
    setEditingResponse(null)
  }

  const handleEventUpdated = (updatedEvent: Pick<EventDetail, 'name' | 'description'>) => {
    setEvent((currentEvent) => (currentEvent ? { ...currentEvent, ...updatedEvent } : currentEvent))
  }

  if (isLoading) {
    return <main className="mx-auto w-full max-w-4xl px-4 py-4 sm:py-8" />
  }

  if (loadError || !event) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-3 px-4 py-4 text-content-primary sm:py-8">
        <h1 className="text-xs font-bold">{loadError ?? 'Event not found.'}</h1>
        <p className="text-content-secondary">The event may have been deleted or the link may be incorrect.</p>
      </main>
    )
  }

  return (
    <main className="mx-auto grid min-w-0 w-full max-w-4xl grid-cols-[minmax(0,1fr)] gap-8 overflow-x-hidden px-4 py-4 text-content-primary sm:py-8">
      <section className="flex min-w-0 w-full items-start justify-between gap-4">
        <div className="grid min-w-0 gap-3">
          <h1 className="text-2xl font-bold sm:text-3xl">{event.name}</h1>
          {event.description && <p className="whitespace-pre-wrap text-content-secondary">{event.description}</p>}
        </div>
        <div className="shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void handleCopy()}
              aria-label="Copy URL"
              title="Copy URL"
              className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border border-border-default px-2 py-1.5 text-xs text-content-secondary transition hover:border-border-strong hover:bg-surface-muted hover:text-content-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong sm:px-3"
            >
              {copyStatus === 'copied' ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
              <span className="hidden sm:inline">Copy URL</span>
            </button>
            <div className="relative">
              <button
                type="button"
                aria-label="Event actions"
                aria-expanded={isActionsMenuOpen}
                title="Event actions"
                onClick={() => setIsActionsMenuOpen((isOpen) => !isOpen)}
                className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-content-muted transition hover:bg-surface-muted hover:text-content-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
              >
                <EllipsisVertical size={16} aria-hidden="true" />
              </button>
              {isActionsMenuOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Close event actions"
                    className="fixed inset-0 z-10 cursor-default"
                    onClick={() => setIsActionsMenuOpen(false)}
                  />
                  <div
                    role="menu"
                    aria-label="Event actions"
                    className="absolute right-0 top-full z-20 mt-2 w-36 rounded-lg border border-border-default bg-surface-panel p-1"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsActionsMenuOpen(false)
                        setIsEditFormOpen(true)
                      }}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-content-secondary hover:bg-surface-muted hover:text-content-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
                    >
                      <Pencil size={14} aria-hidden="true" />
                      Edit event
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsActionsMenuOpen(false)
                        setIsDeleteFormOpen(true)
                      }}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-status-danger hover:bg-surface-muted focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
                    >
                      <Trash2 size={14} aria-hidden="true" />
                      Delete event
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <AvailabilityResponseForm
        key={editingResponse?.id ?? 'new-response'}
        eventPublicToken={event.public_token}
        timeZone={timeZone || event.time_zone}
        onTimeZoneChange={(nextTimeZone, nextCityKey) => {
          if (!editingResponse) {
            setTimeZone(nextTimeZone)
            setCityKey(nextCityKey)
          }
        }}
        timeOptions={event.time_options}
        onSubmitted={handleResponseSubmitted}
        editingResponse={editingResponse ?? undefined}
        onUpdated={handleResponseUpdated}
        onClose={() => setEditingResponse(null)}
        onDeleteRequest={() => {
          if (editingResponse) setResponseToDelete(editingResponse)
        }}
      />

      <ResponseResults
        eventTimeZone={event.time_zone}
        timeZone={timeZone || event.time_zone}
        cityKey={cityKey}
        responses={event.responses}
        timeOptions={event.time_options}
        onEditResponse={(response) => setEditingResponse(response)}
      />

      <p className="min-w-0 break-words text-xs text-content-muted">
        This page and its responses may be deleted after one year.
      </p>

      {isEditFormOpen && (
        <EventEditForm event={event} onClose={() => setIsEditFormOpen(false)} onUpdated={handleEventUpdated} />
      )}
      {isDeleteFormOpen && (
        <EventDeleteForm
          event={event}
          onClose={() => setIsDeleteFormOpen(false)}
          onDeleted={() => void navigate('/', { state: { notice: 'Event deleted successfully.' } })}
        />
      )}
      {responseToDelete && (
        <ResponseDeleteForm
          eventPublicToken={event.public_token}
          response={responseToDelete}
          onClose={() => setResponseToDelete(null)}
          onDeleted={handleResponseDeleted}
        />
      )}
    </main>
  )
}
