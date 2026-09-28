import { useState, type SubmitEvent } from 'react'
import axios from 'axios'
import { X } from 'lucide-react'
import type { EventDetail } from '../types/event.ts'
import PasswordInput from './PasswordInput'
import { useModalAccessibility } from '../hooks/useModalAccessibility.ts'

const MAX_EVENT_NAME_LENGTH = 100
const MAX_DESCRIPTION_LENGTH = 400
const MIN_PASSWORD_LENGTH = 4
const MAX_PASSWORD_LENGTH = 48

type FormErrors = {
  name?: string
  password?: string
  submit?: string
}

type EventEditFormProps = {
  event: EventDetail
  onClose: () => void
  onUpdated: (event: Pick<EventDetail, 'name' | 'description'>) => void
}

export default function EventEditForm({ event, onClose, onUpdated }: EventEditFormProps) {
  const [name, setName] = useState(event.name)
  const [description, setDescription] = useState(event.description ?? '')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const modalRef = useModalAccessibility(true, onClose)

  const handleSubmit = async (submitEvent: SubmitEvent<HTMLFormElement>) => {
    submitEvent.preventDefault()

    const nextErrors: FormErrors = {}
    if (!name.trim()) {
      nextErrors.name = 'Event name is required.'
    }
    if (event.password_protected && !password) {
      nextErrors.password = 'Password is required.'
    } else if (password && password.length < MIN_PASSWORD_LENGTH) {
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

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    try {
      setIsSubmitting(true)
      const { data } = await axios.patch<Pick<EventDetail, 'name' | 'description'>>(
        `http://localhost:3000/api/v1/events/${event.public_token}`,
        {
          event: {
            name: name.trim(),
            description: description.trim(),
          },
          ...(event.password_protected ? { password } : {}),
        },
      )
      onUpdated(data)
      onClose()
    } catch (error) {
      if (axios.isAxiosError<{ errors?: string[] }>(error)) {
        const messages = error.response?.data.errors
        setErrors({ submit: messages?.length ? messages.join(' ') : 'Failed to update the event. Please try again.' })
      } else {
        setErrors({ submit: 'Failed to update the event. Please try again.' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-inverse/50 p-4">
      <button
        type="button"
        aria-label="Close edit event"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div
        ref={modalRef}
        className="relative z-10 max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface-panel p-5 text-content-primary sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-event-heading"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id="edit-event-heading" className="text-xl font-bold">
            Edit event
          </h2>
          <button
            type="button"
            aria-label="Close edit event"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-content-muted hover:bg-surface-muted hover:text-content-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form className="mt-5 grid gap-4" noValidate onSubmit={(submitEvent) => void handleSubmit(submitEvent)}>
          <div>
            <div className="flex items-center gap-4">
              <label htmlFor="edit-event-name" className="text-sm font-bold">
                Event Name
              </label>
              {errors.name && <p className="text-xs text-status-danger">{errors.name}</p>}
            </div>
            <input
              id="edit-event-name"
              value={name}
              maxLength={MAX_EVENT_NAME_LENGTH}
              onChange={(inputEvent) => {
                setName(inputEvent.target.value)
                setErrors((currentErrors) => ({ ...currentErrors, name: undefined, submit: undefined }))
              }}
              className="mt-2 block w-full rounded-lg border border-border-default bg-surface-panel px-3 py-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
            />
          </div>

          <div>
            <label htmlFor="edit-event-description" className="text-sm font-bold">
              Description <span className="font-normal text-content-muted">(optional)</span>
            </label>
            <textarea
              id="edit-event-description"
              value={description}
              maxLength={MAX_DESCRIPTION_LENGTH}
              onChange={(inputEvent) => {
                setDescription(inputEvent.target.value)
                setErrors((currentErrors) => ({ ...currentErrors, submit: undefined }))
              }}
              rows={4}
              className="mt-2 block w-full rounded-lg border border-border-default bg-surface-panel px-3 py-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
            />
          </div>

          {event.password_protected && (
            <div>
              <div className="flex items-center gap-4">
                <label htmlFor="edit-event-password" className="text-sm font-bold">
                  Password
                </label>
                {errors.password && <p className="text-xs text-status-danger">{errors.password}</p>}
              </div>
              <PasswordInput
                id="edit-event-password"
                value={password}
                maxLength={MAX_PASSWORD_LENGTH}
                onChange={(inputEvent) => {
                  setPassword(inputEvent.target.value)
                  setErrors((currentErrors) => ({ ...currentErrors, password: undefined, submit: undefined }))
                }}
                className="mt-2 block w-full rounded-lg border border-border-default bg-surface-panel px-3 py-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
              />
            </div>
          )}

          {errors.submit && (
            <p className="text-xs text-status-danger" role="alert">
              {errors.submit}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-full border border-border-default px-4 py-2 text-sm font-semibold text-content-secondary hover:bg-surface-muted focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary-hover disabled:cursor-wait disabled:opacity-60 focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
            >
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
