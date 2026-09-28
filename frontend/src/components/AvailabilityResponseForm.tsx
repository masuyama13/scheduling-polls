import { Check, Pencil, X } from 'lucide-react'
import axios from 'axios'
import { useRef, useState } from 'react'
import { CITY_CATALOG, type City } from '../data/cityCatalog.ts'
import CitySearchModal from './CitySearchModal.tsx'
import type { Response, TimeOption } from '../types/event.ts'

type AvailabilityResponseFormProps = {
  eventPublicToken: string
  timeZone: string
  onTimeZoneChange: (timeZone: string, cityKey: string) => void
  timeOptions: TimeOption[]
  onSubmitted: (response: Response) => void
  editingResponse?: Response
  onUpdated?: (response: Response) => void
  onClose?: () => void
  onDeleteRequest?: () => void
}

type AvailabilityStatus = 'available' | 'unavailable'
type ResponseFormErrors = {
  name?: string
  availability?: string
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

function getDefaultStatuses(timeOptions: TimeOption[]): Record<number, AvailabilityStatus> {
  return Object.fromEntries(timeOptions.map((timeOption) => [timeOption.id, 'unavailable']))
}

function getResponseStatuses(response: Response, timeOptions: TimeOption[]): Record<number, AvailabilityStatus> {
  return {
    ...getDefaultStatuses(timeOptions),
    ...Object.fromEntries(
      response.availabilities.map((availability) => [availability.time_option_id, availability.status]),
    ),
  }
}

const RESPONSE_SUBMIT_TIMEOUT_MS = 10_000

export default function AvailabilityResponseForm({
  eventPublicToken,
  timeZone,
  onTimeZoneChange,
  timeOptions,
  onSubmitted,
  editingResponse,
  onUpdated,
  onClose,
  onDeleteRequest,
}: AvailabilityResponseFormProps) {
  const isEditing = Boolean(editingResponse)
  const [isAvailabilityFormOpen, setIsAvailabilityFormOpen] = useState(false)
  const [isTimeZoneDialogOpen, setIsTimeZoneDialogOpen] = useState(false)
  const [responseTimeZone, setResponseTimeZone] = useState(editingResponse?.time_zone ?? timeZone)
  const [name, setName] = useState(editingResponse?.name ?? '')
  const [comment, setComment] = useState(editingResponse?.comment ?? '')
  const [focusedField, setFocusedField] = useState<'name' | 'comment' | null>(null)
  const [selectedCity, setSelectedCity] = useState<City | undefined>(() =>
    editingResponse?.city_key ? CITY_CATALOG.find((city) => city.key === editingResponse.city_key) : getCity(timeZone),
  )
  const [statuses, setStatuses] = useState<Record<number, AvailabilityStatus>>(() =>
    editingResponse ? getResponseStatuses(editingResponse, timeOptions) : getDefaultStatuses(timeOptions),
  )
  const [errors, setErrors] = useState<ResponseFormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const availabilityModalRef = useRef<HTMLDivElement>(null)

  const effectiveTimeZone = isEditing ? responseTimeZone : timeZone
  const timeZoneLabel = selectedCity ? `${selectedCity.name} (${selectedCity.timeZone})` : effectiveTimeZone

  const openAvailabilityForm = () => {
    setIsAvailabilityFormOpen(true)
    setIsTimeZoneDialogOpen(false)
  }

  const openTimeZoneSearch = () => {
    setIsAvailabilityFormOpen(false)
    setIsTimeZoneDialogOpen(true)
  }

  const closeTimeZoneSearch = () => {
    setIsTimeZoneDialogOpen(false)
  }

  const resetFormValues = () => {
    setName('')
    setComment('')
    setFocusedField(null)
    setStatuses(getDefaultStatuses(timeOptions))
  }

  const closeAvailabilityForm = () => {
    setIsAvailabilityFormOpen(false)
    setIsTimeZoneDialogOpen(false)
    setFocusedField(null)
    setErrors({})
    setSubmitError(null)
    onClose?.()
  }

  const selectTimeZone = (city: City) => {
    setSelectedCity(city)
    if (isEditing) setResponseTimeZone(city.timeZone)
    onTimeZoneChange(city.timeZone, city.key)
    closeTimeZoneSearch()
  }

  const updateStatus = (timeOptionId: number, status: AvailabilityStatus) => {
    setStatuses((currentStatuses) => ({ ...currentStatuses, [timeOptionId]: status }))
    setErrors((currentErrors) => ({ ...currentErrors, availability: undefined }))
    setSubmitError(null)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError(null)

    const nextErrors: ResponseFormErrors = {}
    if (!name.trim()) {
      nextErrors.name = 'Name is required.'
    }
    if (timeOptions.some((timeOption) => !statuses[timeOption.id])) {
      nextErrors.availability = 'Please select an availability for every time option.'
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      availabilityModalRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setIsSubmitting(true)

    try {
      const responsePayload = {
        name: name.trim(),
        comment: comment.trim(),
        time_zone: effectiveTimeZone,
        city_key: selectedCity?.key,
        availabilities_attributes: timeOptions.map((timeOption) => ({
          ...(editingResponse
            ? {
                id: editingResponse.availabilities.find((availability) => availability.time_option_id === timeOption.id)
                  ?.id,
              }
            : {}),
          time_option_id: timeOption.id,
          status: statuses[timeOption.id],
        })),
      }
      const { data } = editingResponse
        ? await axios.patch<Response>(
            `http://localhost:3000/api/v1/events/${eventPublicToken}/responses/${editingResponse.id}`,
            { response: responsePayload },
            { timeout: RESPONSE_SUBMIT_TIMEOUT_MS },
          )
        : await axios.post<Response>(
            `http://localhost:3000/api/v1/events/${eventPublicToken}/responses`,
            { response: responsePayload },
            { timeout: RESPONSE_SUBMIT_TIMEOUT_MS },
          )
      if (editingResponse) onUpdated?.(data)
      else onSubmitted(data)
      resetFormValues()
      closeAvailabilityForm()
    } catch (error) {
      if (axios.isAxiosError<{ errors?: string[] }>(error)) {
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          setSubmitError('The request timed out. Please check your connection and try again.')
        } else {
          const messages = error.response?.data.errors
          setSubmitError(
            messages?.length
              ? messages.join(' ')
              : `Failed to ${isEditing ? 'update' : 'add'} your response. Please try again.`,
          )
        }
      } else {
        setSubmitError(`Failed to ${isEditing ? 'update' : 'add'} your response. Please try again.`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="grid min-w-0 w-full grid-cols-[minmax(0,1fr)] gap-3" aria-label="Add your availability">
      {!isEditing && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 w-full flex-col items-start rounded-xl bg-surface-panel border border-border-subtle px-4 py-3 text-sm text-content-secondary sm:w-auto sm:flex-row sm:items-center sm:gap-2">
            <span className="font-bold">Your time zone:</span>
            <div className="flex min-w-0 w-full items-center gap-1 sm:gap-2 sm:w-auto">
              <span className="min-w-0 truncate">{timeZoneLabel}</span>
              <button
                type="button"
                aria-label="Change time zone"
                title="Change time zone"
                onClick={openTimeZoneSearch}
                className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-content-muted hover:bg-surface-muted hover:text-brand-primary focus:outline-none focus:ring-1 focus:ring-border-strong"
              >
                <Pencil size={14} aria-hidden="true" />
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={openAvailabilityForm}
            className="w-full cursor-pointer rounded-full bg-brand-primary px-8 py-3 font-semibold text-white hover:bg-brand-primary-hover focus:outline-none focus:ring-1 focus:ring-border-strong sm:w-fit"
          >
            Add your availability
          </button>
        </div>
      )}

      {(isEditing || isAvailabilityFormOpen) && (
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
          <div
            ref={availabilityModalRef}
            className="relative z-10 max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl bg-surface-panel p-5 text-content-primary sm:p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <h3 id="availability-form-heading" className="text-xl font-bold">
                {isEditing ? 'Edit your availability' : 'Add your availability'}
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

            <form className="mt-5 grid gap-4" noValidate onSubmit={(event) => void handleSubmit(event)}>
              <div>
                <div className="flex items-center gap-4">
                  <label htmlFor="response-name" className="text-sm font-bold">
                    Name
                  </label>
                  {errors.name && <p className="text-sm text-status-danger">{errors.name}</p>}
                </div>
                <input
                  id="response-name"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value)
                    setErrors((currentErrors) => ({ ...currentErrors, name: undefined }))
                  }}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  maxLength={50}
                  className="mt-2 block w-full rounded-lg border border-border-default bg-surface-panel px-3 py-2 focus:outline-none focus:ring-1 focus:ring-border-strong"
                />
                <p
                  className={`mt-1 text-right text-xs text-content-muted ${focusedField === 'name' ? '' : 'invisible'}`}
                  aria-live="polite"
                >
                  {name.length} / 50
                </p>
              </div>

              <fieldset>
                <legend className="flex w-full items-baseline justify-between gap-3 text-sm font-bold">
                  <span>Availability</span>
                  <span className="text-right text-xs font-normal text-content-muted">
                    Times shown in {timeZoneLabel}
                  </span>
                </legend>
                {errors.availability && <p className="mt-2 text-sm text-status-danger">{errors.availability}</p>}
                <div className="mt-2 grid gap-3">
                  {timeOptions.map((timeOption) => (
                    <div
                      key={timeOption.id}
                      className="grid grid-cols-[minmax(0,1fr)_9rem] items-center gap-3 border-b border-border-subtle pb-3"
                    >
                      <p className="min-w-0 text-sm font-semibold">{formatTimeOption(timeOption, effectiveTimeZone)}</p>
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
                </div>
              </fieldset>

              <div>
                <label htmlFor="response-comment" className="text-sm font-bold">
                  Comment <span className="font-normal text-content-muted">(optional)</span>
                </label>
                <textarea
                  id="response-comment"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  onFocus={() => setFocusedField('comment')}
                  onBlur={() => setFocusedField(null)}
                  maxLength={100}
                  rows={2}
                  className="mt-2 block w-full rounded-lg border border-border-default bg-surface-panel px-3 py-2 focus:outline-none focus:ring-1 focus:ring-border-strong"
                />
                <p
                  className={`mt-1 text-right text-xs text-content-muted ${focusedField === 'comment' ? '' : 'invisible'}`}
                  aria-live="polite"
                >
                  {comment.length} / 100
                </p>
              </div>

              <div className={isEditing ? 'flex items-center justify-between gap-3' : ''}>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => onDeleteRequest?.()}
                    className="cursor-pointer px-0 py-2 text-sm text-content-muted hover:text-content-secondary focus:outline-none focus-visible:underline"
                  >
                    Delete
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`${isEditing ? 'w-auto px-5' : 'w-full px-4'} cursor-pointer rounded-full bg-brand-primary py-2 text-sm font-semibold text-white hover:bg-brand-primary-hover disabled:cursor-wait disabled:opacity-60 focus:outline-none focus:ring-1 focus:ring-border-strong`}
                >
                  {isSubmitting
                    ? isEditing
                      ? 'Saving...'
                      : 'Adding...'
                    : isEditing
                      ? 'Save response'
                      : 'Add response'}
                </button>
              </div>
              {submitError && (
                <p className="text-sm text-status-danger" role="alert">
                  {submitError}
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      {isTimeZoneDialogOpen && (
        <CitySearchModal
          title="Search cities"
          inputLabel="City or country"
          placeholder="Tokyo or Canada"
          cities={CITY_CATALOG}
          onSelect={selectTimeZone}
          onClose={closeTimeZoneSearch}
        />
      )}
    </section>
  )
}
