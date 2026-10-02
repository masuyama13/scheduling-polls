import { useState } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../lib/api'
import type { EventDetail } from '../types/event.ts'
import PasswordInput from './PasswordInput'
import { useModalAccessibility } from '../hooks/useModalAccessibility.ts'

type EventDeleteFormProps = {
  event: EventDetail
  onClose: () => void
  onDeleted: () => void
}

export default function EventDeleteForm({ event, onClose, onDeleted }: EventDeleteFormProps) {
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const modalRef = useModalAccessibility(true, onClose)

  const handleDelete = async () => {
    if (event.password_protected && !password) {
      setPasswordError('Password is required.')
      return
    }

    try {
      setIsDeleting(true)
      await axios.delete(`${API_BASE_URL}/api/v1/events/${event.public_token}`, {
        ...(event.password_protected ? { data: { password } } : {}),
      })
      onDeleted()
    } catch (requestError) {
      if (axios.isAxiosError<{ errors?: string[] }>(requestError)) {
        const messages = requestError.response?.data.errors
        setError(messages?.length ? messages.join(' ') : 'Failed to delete the event. Please try again.')
      } else {
        setError('Failed to delete the event. Please try again.')
      }
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-inverse/50 p-4">
      <button
        type="button"
        aria-label="Close delete event"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-md rounded-2xl bg-surface-panel p-5 text-content-primary sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-event-heading"
      >
        <h2 id="delete-event-heading" className="text-xl font-bold">
          Delete event?
        </h2>
        <p className="mt-3 text-sm text-content-secondary">
          This will permanently delete the event, all its time options, and all responses.
        </p>
        <div className="mt-4">
          <div className="flex items-center gap-4">
            <label htmlFor="delete-event-password" className="text-sm font-bold text-content-primary">
              Password
            </label>
            {passwordError && <p className="text-xs text-status-danger">{passwordError}</p>}
          </div>
          <PasswordInput
            id="delete-event-password"
            value={password}
            onChange={(inputEvent) => {
              setPassword(inputEvent.target.value)
              setPasswordError(null)
              setError(null)
            }}
            className="mt-2 block w-full rounded-lg border border-border-default bg-surface-panel px-3 py-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
          />
        </div>
        {error && (
          <p className="mt-2 text-xs text-status-danger" role="alert">
            {error}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full border border-border-default px-4 py-2 text-sm font-semibold text-content-secondary hover:bg-surface-muted focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={isDeleting}
            className="cursor-pointer rounded-full bg-status-danger px-4 py-2 text-sm font-semibold text-white hover:bg-status-danger-hover disabled:cursor-wait disabled:opacity-60 focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
          >
            {isDeleting ? 'Deleting...' : 'Delete event'}
          </button>
        </div>
      </div>
    </div>
  )
}
