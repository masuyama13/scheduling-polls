import axios from 'axios'
import { useState } from 'react'
import type { Response } from '../types/event.ts'

type ResponseDeleteFormProps = {
  eventPublicToken: string
  response: Response
  onClose: () => void
  onDeleted: () => void
}

export default function ResponseDeleteForm({
  eventPublicToken,
  response,
  onClose,
  onDeleted,
}: ResponseDeleteFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setError(null)
    setIsDeleting(true)

    try {
      await axios.delete(`http://localhost:3000/api/v1/events/${eventPublicToken}/responses/${response.id}`)
      onDeleted()
    } catch {
      setError('Failed to delete the response. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-inverse/50 p-4">
      <button
        type="button"
        aria-label="Close delete response"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-md rounded-2xl bg-surface-panel p-5 text-content-primary sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-response-heading"
      >
        <h2 id="delete-response-heading" className="text-xl font-bold">
          Delete response?
        </h2>
        <p className="mt-3 text-sm text-content-secondary">
          This will permanently delete {response.name}&apos;s response.
        </p>
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
            {isDeleting ? 'Deleting...' : 'Delete response'}
          </button>
        </div>
      </div>
    </div>
  )
}
