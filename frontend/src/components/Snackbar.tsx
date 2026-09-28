import { X } from 'lucide-react'
import { useEffect } from 'react'

type SnackbarProps = {
  message: string
  onDismiss: () => void
  duration?: number
}

export default function Snackbar({ message, onDismiss, duration = 4_000 }: SnackbarProps) {
  useEffect(() => {
    const timeoutId = window.setTimeout(onDismiss, duration)
    return () => window.clearTimeout(timeoutId)
  }, [duration, onDismiss])

  return (
    <div
      className="fixed bottom-4 left-1/2 z-50 flex max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-3 whitespace-nowrap rounded-lg bg-surface-inverse px-4 py-3 text-sm text-content-inverse"
      role="status"
      aria-live="polite"
    >
      <span>{message}</span>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={onDismiss}
        className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-content-inverse/80 hover:text-content-inverse focus:outline-none focus-visible:ring-1 focus-visible:ring-content-inverse"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  )
}
