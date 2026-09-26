import { Check, Copy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'

type CopyStatus = 'idle' | 'copied' | 'error'

export default function EventCreatedPage() {
  const { public_token } = useParams()
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle')
  const eventUrl = public_token ? `${window.location.origin}/events/${public_token}` : ''

  useEffect(() => {
    if (copyStatus !== 'copied') return

    const timeoutId = window.setTimeout(() => setCopyStatus('idle'), 2_000)
    return () => window.clearTimeout(timeoutId)
  }, [copyStatus])

  const handleCopy = async () => {
    if (!eventUrl || !navigator.clipboard) {
      setCopyStatus('error')
      return
    }

    try {
      await navigator.clipboard.writeText(eventUrl)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('error')
    }
  }

  return (
    <main className="w-full text-content-primary">
      <section className="mx-auto max-w-4xl px-4 py-4 sm:py-8">
        <div className="flex flex-col gap-6 rounded-xl border border-border-subtle bg-surface-panel p-6 sm:p-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Event created!</h1>
            <p className="text-content-secondary">Your event is ready to share.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="event-share-url" className="text-sm font-bold">
              Share link
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="event-share-url"
                type="text"
                value={eventUrl}
                readOnly
                aria-label="Event share link"
                className="block min-w-0 flex-1 rounded-md border-default px-3 py-2 text-sm outline-1 outline-border-default focus:outline-2 focus:outline-brand-primary"
              />
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => void handleCopy()}
                  disabled={!eventUrl}
                  aria-label="Copy event link"
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-border-default text-content-secondary transition hover:bg-surface-muted hover:text-content-primary disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-border-strong"
                >
                  {copyStatus === 'copied' ? (
                    <Check size={18} aria-hidden="true" />
                  ) : (
                    <Copy size={18} aria-hidden="true" />
                  )}
                </button>
                {copyStatus === 'copied' && (
                  <span
                    className="pointer-events-none absolute bottom-full right-0 mb-2 rounded-md bg-content-primary px-2 py-1 text-xs text-white"
                    role="status"
                  >
                    Copied
                  </span>
                )}
              </div>
            </div>
            {copyStatus === 'error' && (
              <p className="text-sm text-status-danger" role="alert">
                Copy failed. Select the link and copy it manually.
              </p>
            )}
          </div>

          <Link
            to={public_token ? `/events/${public_token}` : '/'}
            className="inline-flex w-full items-center justify-center rounded-full bg-brand-primary px-8 py-3 font-semibold text-white transition hover:bg-brand-primary-hover focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-brand-primary sm:w-fit"
          >
            View event
          </Link>
        </div>
      </section>
    </main>
  )
}
