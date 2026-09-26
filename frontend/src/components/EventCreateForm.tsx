import type { SubmitEvent } from 'react'
import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router'
import SelectedTimes from './SelectedTimes'

type FormErrors = {
  name?: string
  dateTimeOptions?: string
  submit?: string
}

const MAX_EVENT_NAME_LENGTH = 100
const MAX_DESCRIPTION_LENGTH = 400
const MAX_TIME_OPTIONS = 10
const EVENT_CREATE_TIMEOUT_MS = 10_000

type CreateEventResponse = {
  public_token: string
}

type EventCreateFormProps = {
  candidateInstants: Date[]
  timeZone?: string
  onCandidateRemove: (instant: Date) => void
}

export default function EventCreateForm({ candidateInstants, timeZone, onCandidateRemove }: EventCreateFormProps) {
  const navigate = useNavigate()
  const currentTimeZone = timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentTime] = useState(() => Date.now())

  const countCharacters = (value: string) => {
    if (typeof Intl.Segmenter === 'function') {
      return Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(value)).length
    }

    return Array.from(value).length
  }

  const limitCharacters = (value: string, limit: number) => {
    if (countCharacters(value) <= limit) return value

    if (typeof Intl.Segmenter === 'function') {
      return Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(value))
        .slice(0, limit)
        .map(({ segment }) => segment)
        .join('')
    }

    return Array.from(value).slice(0, limit).join('')
  }

  const hasPastCandidate = candidateInstants.some((instant) => instant.getTime() < currentTime)

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()

    const timeOptions = candidateInstants.map((instant) => ({
      starts_at: instant.toISOString(),
    }))

    const nextErrors: FormErrors = {}
    if (!name.trim()) {
      nextErrors.name = 'Event name is required.'
    }
    if (timeOptions.length === 0) {
      nextErrors.dateTimeOptions = 'At least one date and time option is required.'
    } else if (timeOptions.length > MAX_TIME_OPTIONS) {
      nextErrors.dateTimeOptions = `You can select up to ${MAX_TIME_OPTIONS} date and time options.`
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    try {
      setIsSubmitting(true)
      const { data } = await axios.post<CreateEventResponse>(
        'http://localhost:3000/api/v1/events',
        {
          event: {
            name: name.trim(),
            description: description.trim(),
            time_zone: currentTimeZone,
            time_options_attributes: timeOptions,
          },
        },
        { timeout: EVENT_CREATE_TIMEOUT_MS },
      )
      void navigate(`/events/${data.public_token}`)
    } catch (error) {
      console.error('Error creating event:', error)
      if (axios.isAxiosError<{ errors?: string[] }>(error)) {
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          setErrors({ submit: 'The request timed out. Please check your connection and try again.' })
          return
        }

        const messages = error.response?.data.errors
        setErrors({
          submit: messages?.length ? messages.join(' ') : 'Failed to create the event. Please try again.',
        })
      } else {
        setErrors({ submit: 'Failed to create the event. Please try again.' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="event-create-form">
      <form
        onSubmit={(event) => {
          void handleSubmit(event)
        }}
        className="space-y-6 rounded-xl border border-border-subtle bg-surface-panel p-5 sm:py-6 sm:px-8"
      >
        <div className="flex flex-col gap-12 md:flex-row-reverse">
          <div className="h-fit md:min-w-0 md:flex-1">
            <SelectedTimes
              candidates={candidateInstants}
              timeZone={currentTimeZone}
              onRemove={(instant) => onCandidateRemove(instant)}
              error={errors.dateTimeOptions}
              warning={
                hasPastCandidate
                  ? 'One or more selected times are in the past. You can still create this event.'
                  : undefined
              }
            />
          </div>
          <div className="w-full space-y-4 md:min-w-0 md:flex-1">
            <div>
              <div className="flex items-center gap-4">
                <label htmlFor="event-name" className="block text-sm font-bold text-content-primary">
                  Event Name
                </label>
                {errors.name && <p className="text-sm text-status-danger">{errors.name}</p>}
              </div>
              <input
                type="text"
                id="event-name"
                name="name"
                placeholder="Year-End Party"
                value={name}
                onChange={(e) => {
                  setName(limitCharacters(e.target.value, MAX_EVENT_NAME_LENGTH))
                  setErrors((prev) => ({
                    ...prev,
                    name: undefined,
                    submit: undefined,
                  }))
                }}
                className="mt-2 block w-full px-3 py-1.5 rounded-md border-default outline-1 outline-border-default placeholder:text-sm focus:outline-2 focus:outline-brand-primary"
              />
              <p className="mt-1 text-right text-xs text-content-muted" aria-live="polite">
                {countCharacters(name)} / {MAX_EVENT_NAME_LENGTH}
              </p>
            </div>
            <div>
              <label htmlFor="description" className="text-sm/6 font-bold text-content-primary">
                Description <span className="font-normal">(optional)</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(limitCharacters(e.target.value, MAX_DESCRIPTION_LENGTH))}
                className="mt-2 block w-full rounded-md px-3 py-1.5 text-base outline-1 outline-border-default focus:outline-2 focus:outline-brand-primary sm:text-sm/6"
              />
              <p className="mt-1 text-right text-xs text-content-muted" aria-live="polite">
                {countCharacters(description)} / {MAX_DESCRIPTION_LENGTH}
              </p>
            </div>
          </div>
        </div>
        {errors.submit && <p className="text-sm text-status-danger">{errors.submit}</p>}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-w-28 rounded-full bg-brand-primary px-8 py-3 font-semibold text-white transition hover:bg-brand-primary-hover focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-brand-primary md:w-auto"
          >
            {isSubmitting ? 'Planning...' : 'Plan an event'}
          </button>
        </div>
      </form>
    </div>
  )
}
