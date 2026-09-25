import { CircleX } from 'lucide-react'
import {
  MAX_TIME_CANDIDATES,
  formatLocalTimePreview,
} from '../lib/worldClock'

type SelectedTimesProps = {
  candidates: Date[]
  timeZone: string
  onRemove: (instant: Date) => void
}

export default function SelectedTimes({ candidates, timeZone, onRemove }: SelectedTimesProps) {
  if (candidates.length === 0) return null

  return (
    <section className="mx-auto mt-6 max-w-4xl px-4" aria-label="Selected time candidates">
      <div className="rounded-xl border border-border-subtle bg-surface-panel p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-content-primary">Selected times</h2>
          <span className="text-xs text-content-muted">{candidates.length} of {MAX_TIME_CANDIDATES} times selected</span>
        </div>
        <div className="mt-2 grid gap-2">
          {candidates.map((instant, index) => (
            <div key={instant.toISOString()} className="flex items-center justify-start gap-3 border-b border-border-subtle py-2 last:border-b-0">
              <span className="w-44 shrink-0 whitespace-nowrap text-sm text-content-secondary">{formatLocalTimePreview(instant, timeZone)}</span>
              <button
                type="button"
                aria-label={`Remove selected time ${index + 1}`}
                onClick={() => onRemove(instant)}
                className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-lg p-0 text-content-muted hover:bg-surface-muted hover:text-status-danger focus:outline-none focus:ring-1 focus:ring-border-strong"
              >
                <CircleX size={14} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
