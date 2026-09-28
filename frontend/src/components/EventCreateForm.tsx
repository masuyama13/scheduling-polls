import type { SubmitEvent } from 'react'
import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router'
import SelectedTimes from './SelectedTimes'
import PasswordInput from './PasswordInput'
import EventCreateConfirmationModal from './EventCreateConfirmationModal'
import type { SelectedCity } from '../lib/worldClock'

type FormErrors = {
  name?: string
  password?: string
  dateTimeOptions?: string
  submit?: string
}

const MAX_EVENT_NAME_LENGTH = 100
const MAX_DESCRIPTION_LENGTH = 400
const MAX_TIME_OPTIONS = 10
const MIN_PASSWORD_LENGTH = 4
const MAX_PASSWORD_LENGTH = 48
const EVENT_CREATE_TIMEOUT_MS = 10_000

type CreateEventResponse = {
  public_token: string
}

type EventCreateFormProps = {
  candidateInstants: Date[]
  timeZone?: string
  cities?: SelectedCity[]
  onCandidateRemove: (instant: Date) => void
}

export default function EventCreateForm({
  candidateInstants,
  timeZone,
  cities = [],
  onCandidateRemove,
}: EventCreateFormProps) {
  const navigate = useNavigate()
  const currentTimeZone = timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [password, setPassword] = useState('')
  const [focusedField, setFocusedField] = useState<'name' | 'description' | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
  const [currentTime] = useState(() => Date.now())
  const [dateTimeErrorCandidates, setDateTimeErrorCandidates] = useState<Date[] | null>(null)

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

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()

    const timeOptions = candidateInstants.map((instant) => ({
      starts_at: instant.toISOString(),
    }))

    const nextErrors: FormErrors = {}
    if (!name.trim()) {
      nextErrors.name = 'Event name is required.'
    }
    if (password && password.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
    } else if (password && password.length > MAX_PASSWORD_LENGTH) {
      nextErrors.password = `Password must be at most ${MAX_PASSWORD_LENGTH} characters.`
    } else if (
      password &&
      password
        .split('')
        .some((character) => /\s/.test(character) || character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)
    ) {
      nextErrors.password = 'Password must not contain spaces or control characters.'
    }
    if (timeOptions.length === 0) {
      nextErrors.dateTimeOptions = 'At least one date and time option is required.'
      setDateTimeErrorCandidates(candidateInstants)
    } else if (timeOptions.length > MAX_TIME_OPTIONS) {
      nextErrors.dateTimeOptions = `You can select up to ${MAX_TIME_OPTIONS} date and time options.`
      setDateTimeErrorCandidates(candidateInstants)
    } else {
      setDateTimeErrorCandidates(null)
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setErrors((currentErrors) => ({ ...currentErrors, submit: undefined }))
    setIsConfirmationOpen(true)
  }

  const handleCreate = async (allowPasswordlessManagement: boolean) => {
    const timeOptions = candidateInstants.map((instant) => ({
      starts_at: instant.toISOString(),
    }))

    try {
      setIsSubmitting(true)
      const { data } = await axios.post<CreateEventResponse>(
        'http://localhost:3000/api/v1/events',
        {
          event: {
            name: name.trim(),
            description: description.trim(),
            ...(password ? { password } : {}),
            allow_passwordless_management: allowPasswordlessManagement,
            time_zone: currentTimeZone,
            time_options_attributes: timeOptions,
          },
        },
        { timeout: EVENT_CREATE_TIMEOUT_MS },
      )
      void navigate(`/events/${data.public_token}/created`)
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
              error={dateTimeErrorCandidates === candidateInstants ? errors.dateTimeOptions : undefined}
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
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                className="mt-2 block w-full px-3 py-1.5 rounded-md border-default outline-1 outline-border-default placeholder:text-sm focus:outline-2 focus:outline-brand-primary"
              />
              <p
                className={`mt-1 text-right text-xs text-content-muted ${focusedField === 'name' ? '' : 'invisible'}`}
                aria-live="polite"
              >
                {countCharacters(name)} / {MAX_EVENT_NAME_LENGTH}
              </p>
            </div>
            <div>
              <label htmlFor="description" className="text-sm/6 font-bold text-content-primary">
                Description <span className="font-normal text-content-muted">(optional)</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(limitCharacters(e.target.value, MAX_DESCRIPTION_LENGTH))}
                onFocus={() => setFocusedField('description')}
                onBlur={() => setFocusedField(null)}
                className="mt-2 block w-full rounded-md px-3 py-1.5 text-base outline-1 outline-border-default focus:outline-2 focus:outline-brand-primary sm:text-sm/6"
              />
              <p
                className={`mt-1 text-right text-xs text-content-muted ${focusedField === 'description' ? '' : 'invisible'}`}
                aria-live="polite"
              >
                {countCharacters(description)} / {MAX_DESCRIPTION_LENGTH}
              </p>
            </div>
            <div>
              <label htmlFor="event-password" className="text-sm/6 font-bold text-content-primary">
                Password <span className="font-normal text-content-muted">(optional)</span>
              </label>
              <PasswordInput
                id="event-password"
                name="password"
                maxLength={MAX_PASSWORD_LENGTH}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setErrors((prev) => ({
                    ...prev,
                    password: undefined,
                    submit: undefined,
                  }))
                }}
                aria-invalid={Boolean(errors.password)}
                className="mt-2 block w-full rounded-md px-3 py-1.5 text-base outline-1 outline-border-default focus:outline-2 focus:outline-brand-primary sm:text-sm/6"
              />
              {errors.password && <p className="mt-1 text-sm text-status-danger">{errors.password}</p>}
              <p className="mt-1 text-xs text-content-muted">
                If you don&apos;t set a password, anyone with the event link can edit or delete this event.
              </p>
            </div>
          </div>
        </div>
        {errors.submit && !isConfirmationOpen && <p className="text-sm text-status-danger">{errors.submit}</p>}
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
      {isConfirmationOpen && (
        <EventCreateConfirmationModal
          name={name.trim()}
          description={description.trim()}
          password={password}
          candidateInstants={candidateInstants}
          cities={cities}
          onBack={() => {
            setIsConfirmationOpen(false)
            setErrors((currentErrors) => ({ ...currentErrors, submit: undefined }))
          }}
          onConfirm={(allowPasswordlessManagement) => void handleCreate(allowPasswordlessManagement)}
          isSubmitting={isSubmitting}
          submitError={errors.submit}
        />
      )}
    </div>
  )
}
