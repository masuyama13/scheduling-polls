import { useState } from 'react'
import { X } from 'lucide-react'
import { formatLocalTimePreview } from '../lib/worldClock'
import type { SelectedCity } from '../lib/worldClock'

type EventCreateConfirmationModalProps = {
  name: string
  description: string
  password: string
  candidateInstants: Date[]
  cities: SelectedCity[]
  onBack: () => void
  onConfirm: (allowPasswordlessManagement: boolean) => void
  isSubmitting?: boolean
  submitError?: string
}

export default function EventCreateConfirmationModal({
  name,
  description,
  password,
  candidateInstants,
  cities,
  onBack,
  onConfirm,
  isSubmitting = false,
  submitError,
}: EventCreateConfirmationModalProps) {
  const [allowPasswordlessManagement, setAllowPasswordlessManagement] = useState(false)
  const [consentError, setConsentError] = useState('')

  const handleConfirm = () => {
    if (!password && !allowPasswordlessManagement) {
      setConsentError('Please confirm the checkbox to continue.')
      return
    }

    onConfirm(allowPasswordlessManagement)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-inverse/50 p-4">
      <button
        type="button"
        aria-label="Close event confirmation"
        className="absolute inset-0 cursor-default"
        onClick={onBack}
      />
      <div
        className="relative z-10 max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface-panel p-5 text-content-primary sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-confirmation-heading"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id="event-confirmation-heading" className="text-xl font-bold">
            Confirm event details
          </h2>
          <button
            type="button"
            aria-label="Close event confirmation"
            onClick={onBack}
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-content-muted hover:bg-surface-muted hover:text-content-primary focus:outline-none focus:ring-1 focus:ring-border-strong"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <dl className="mt-5 grid gap-4 text-sm">
          <div>
            <dt className="font-bold">Event name</dt>
            <dd className="mt-2 text-content-secondary">{name}</dd>
          </div>
          <div>
            <dt className="font-bold">Description</dt>
            <dd className="mt-2 whitespace-pre-wrap text-content-secondary">{description || 'None'}</dd>
          </div>
        </dl>

        <section className="mt-5" aria-labelledby="confirmation-times-heading">
          <h3 id="confirmation-times-heading" className="text-sm font-bold">
            Selected times
          </h3>
          <div className="mt-2 grid gap-3">
            {candidateInstants.map((instant) => (
              <div key={instant.toISOString()} className="border-b border-border-subtle pb-3">
                <div className="grid gap-2 text-sm text-content-secondary">
                  {cities.map((city) => (
                    <p key={`${instant.toISOString()}-${city.key}`}>
                      <span className="font-medium text-content-primary">{city.name}:</span>{' '}
                      {formatLocalTimePreview(instant, city.timeZone)}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-5">
          <div className="flex min-h-5 items-center gap-4">
            <p className="text-sm font-bold">Password</p>
            <p
              className={`text-xs text-status-danger ${consentError ? '' : 'invisible'}`}
              role={consentError ? 'alert' : undefined}
              aria-live="polite"
            >
              {consentError || ' '}
            </p>
          </div>
          <p className="mt-1 text-sm text-content-secondary">{password ? '•'.repeat(password.length) : 'None'}</p>
        </div>

        {!password && (
          <div className="mt-2">
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="confirmation-passwordless-management"
                checked={allowPasswordlessManagement}
                onChange={(event) => {
                  setAllowPasswordlessManagement(event.target.checked)
                  setConsentError('')
                }}
                className="custom-checkbox"
              />
              <label htmlFor="confirmation-passwordless-management" className="text-xs text-content-muted">
                If you don&apos;t set a password, anyone with the event link can edit or delete this event.
              </label>
            </div>
          </div>
        )}

        {submitError && (
          <p className="mt-4 text-xs text-status-danger" role="alert">
            {submitError}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onBack}
            className="cursor-pointer rounded-full border border-border-default px-4 py-2 text-sm font-semibold text-content-secondary hover:bg-surface-muted focus:outline-none focus:ring-1 focus:ring-border-strong"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="cursor-pointer rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary-hover disabled:cursor-wait disabled:opacity-60 focus:outline-none focus:ring-1 focus:ring-border-strong"
          >
            {isSubmitting ? 'Planning...' : 'Create event'}
          </button>
        </div>
      </div>
    </div>
  )
}
