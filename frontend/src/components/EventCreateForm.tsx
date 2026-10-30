import type { SubmitEvent } from 'react'
import { useState } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../lib/api'
import { useNavigate } from 'react-router'
import SelectedTimes from './SelectedTimes'
import PasswordInput from './PasswordInput'
import EventCreateConfirmationModal from './EventCreateConfirmationModal'
import type { SelectedCity } from '../lib/worldClock'
import { useTranslation } from 'react-i18next'
import '../i18n/index.ts'

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
  const { t } = useTranslation('common')
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
      nextErrors.name = t('home.form.errors.nameRequired')
    }
    if (password && password.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = t('home.form.errors.passwordMin', { count: MIN_PASSWORD_LENGTH })
    } else if (password && password.length > MAX_PASSWORD_LENGTH) {
      nextErrors.password = t('home.form.errors.passwordMax', { count: MAX_PASSWORD_LENGTH })
    } else if (
      password &&
      password
        .split('')
        .some((character) => /\s/.test(character) || character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)
    ) {
      nextErrors.password = t('home.form.errors.passwordCharacters')
    }
    if (timeOptions.length === 0) {
      nextErrors.dateTimeOptions = t('home.form.errors.timeOptionRequired')
      setDateTimeErrorCandidates(candidateInstants)
    } else if (timeOptions.length > MAX_TIME_OPTIONS) {
      nextErrors.dateTimeOptions = t('home.form.errors.timeOptionLimit', { count: MAX_TIME_OPTIONS })
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
        `${API_BASE_URL}/api/v1/events`,
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
          setErrors({ submit: t('home.form.errors.timeout') })
          return
        }

        const messages = error.response?.data.errors
        setErrors({
          submit: messages?.length ? messages.join(' ') : t('home.form.errors.createFailed'),
        })
      } else {
        setErrors({ submit: t('home.form.errors.createFailed') })
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
              warning={hasPastCandidate ? t('home.form.pastTimeWarning') : undefined}
            />
          </div>
          <div className="w-full space-y-4 md:min-w-0 md:flex-1">
            <div>
              <div className="flex items-center gap-4">
                <label htmlFor="event-name" className="block text-sm font-bold text-content-primary">
                  {t('home.form.eventName')}
                </label>
                {errors.name && <p className="text-xs text-status-danger">{errors.name}</p>}
              </div>
              <input
                type="text"
                id="event-name"
                name="name"
                placeholder={t('home.form.eventNamePlaceholder')}
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
                className="mt-2 block w-full px-3 py-1.5 rounded-md border-default outline-1 outline-border-default placeholder:text-sm focus-visible:outline-2 focus-visible:outline-brand-primary"
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
                {t('home.form.description')}{' '}
                <span className="font-normal text-content-muted">({t('home.common.optional')})</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(limitCharacters(e.target.value, MAX_DESCRIPTION_LENGTH))}
                onFocus={() => setFocusedField('description')}
                onBlur={() => setFocusedField(null)}
                className="mt-2 block w-full rounded-md px-3 py-1.5 text-base outline-1 outline-border-default focus-visible:outline-2 focus-visible:outline-brand-primary sm:text-sm/6"
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
                {t('home.form.password')}{' '}
                <span className="font-normal text-content-muted">({t('home.common.optional')})</span>
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
                className="mt-2 block w-full rounded-md px-3 py-1.5 text-base outline-1 outline-border-default focus-visible:outline-2 focus-visible:outline-brand-primary sm:text-sm/6"
              />
              {errors.password && <p className="mt-1 text-xs text-status-danger">{errors.password}</p>}
              <p className="mt-1 text-xs text-content-muted">{t('home.form.passwordHelp')}</p>
            </div>
          </div>
        </div>
        {errors.submit && !isConfirmationOpen && <p className="text-xs text-status-danger">{errors.submit}</p>}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-w-28 rounded-full bg-brand-primary px-8 py-3 font-semibold text-white transition hover:bg-brand-primary-hover focus:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:ring-brand-primary md:w-auto"
          >
            {isSubmitting ? t('home.form.planning') : t('home.form.planEvent')}
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
