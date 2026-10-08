import { useRef, useState, type TouchEvent } from 'react'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { useModalAccessibility } from '../hooks/useModalAccessibility.ts'

type HowItWorksModalProps = {
  onClose: () => void
}

const steps = [
  {
    title: 'Compare local times',
    description: 'Compare local times across cities, then click or tap a time cell to add it as an option.',
  },
  {
    title: 'Create an event',
    description: 'Add an event name and optional details, then create your event.',
  },
  {
    title: 'Share the link',
    description: 'Share the event link so people can respond with their availability.',
  },
  {
    title: 'Choose a time that works',
    description: 'Once everyone has responded, compare the results and choose the best time.',
  },
]

function TimeGridIllustration({ highlight }: { highlight: boolean }) {
  return (
    <svg viewBox="0 0 320 160" className="h-auto w-full" aria-hidden="true">
      <rect x="10" y="10" width="300" height="140" rx="14" fill="var(--surface-panel)" />
      <path
        data-testid="city-label-background"
        d="M24 10H102V150H24A14 14 0 0 1 10 136V24A14 14 0 0 1 24 10Z"
        fill="var(--surface-muted)"
      />
      {highlight && (
        <rect data-testid="time-column-highlight" x="207" y="11" width="50" height="138" fill="var(--surface-subtle)" />
      )}
      <path
        data-testid="time-grid-borders"
        d={highlight ? 'M102 10v140M154 10v140' : 'M102 10v140M154 10v140M206 10v140M258 10v140'}
        stroke="var(--border-subtle)"
      />
      {highlight && (
        <path
          data-testid="time-column-highlight-border"
          d="M206 10v140M258 10v140M206 11h52M206 149h52"
          fill="none"
          stroke="var(--brand-outline)"
          strokeWidth="2"
        />
      )}
      <path d="M10 80h300" stroke="var(--border-subtle)" />
      <text x="24" y="50" fill="var(--content-primary)" fontSize="14" fontWeight="600">
        Vancouver
      </text>
      <text x="24" y="120" fill="var(--content-primary)" fontSize="14" fontWeight="600">
        Tokyo
      </text>
      <text x="114" y="55" fill="var(--content-secondary)" fontSize="12">
        2 PM
      </text>
      <text x="166" y="55" fill="var(--content-secondary)" fontSize="12">
        3 PM
      </text>
      <text x="218" y="55" fill="var(--content-secondary)" fontSize="12">
        4 PM
      </text>
      <text x="270" y="55" fill="var(--content-secondary)" fontSize="12">
        5 PM
      </text>
      <text x="114" y="125" fill="var(--content-secondary)" fontSize="12">
        6 AM
      </text>
      <text x="166" y="125" fill="var(--content-secondary)" fontSize="12">
        7 AM
      </text>
      <text x="218" y="125" fill="var(--content-secondary)" fontSize="12">
        8 AM
      </text>
      <text x="270" y="125" fill="var(--content-secondary)" fontSize="12">
        9 AM
      </text>
      {highlight && (
        <path
          d="M246 91 269 111 259 113 265 126 260 128 254 115 247 123Z"
          fill="var(--content-primary)"
          stroke="var(--surface-panel)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      )}
      <rect
        data-testid="time-grid-outline"
        x="10"
        y="10"
        width="300"
        height="140"
        rx="14"
        fill="none"
        stroke="var(--border-default)"
      />
    </svg>
  )
}

function StepIllustration({ step }: { step: number }) {
  if (step === 0) {
    return <TimeGridIllustration highlight />
  }

  if (step === 1) {
    return (
      <svg viewBox="0 0 320 160" className="h-auto w-full" aria-hidden="true">
        <rect x="30" y="12" width="260" height="136" rx="14" fill="var(--surface-panel)" />
        <text x="50" y="39" fill="var(--content-primary)" fontSize="12" fontWeight="600">
          Event name
        </text>
        <rect x="50" y="47" width="220" height="30" rx="6" fill="var(--surface-muted)" />
        <text x="62" y="67" fill="var(--content-primary)" fontSize="12">
          Team meeting
        </text>
        <text x="50" y="98" fill="var(--content-primary)" fontSize="12" fontWeight="600">
          Description (optional)
        </text>
        <rect x="50" y="106" width="220" height="28" rx="6" fill="var(--surface-muted)" />
        <path d="M62 117h118M62 124h86" stroke="var(--border-default)" strokeWidth="2" strokeLinecap="round" />
        <rect x="210" y="116" width="60" height="20" rx="10" fill="var(--brand-primary)" />
        <text x="240" y="129" textAnchor="middle" fill="white" fontSize="9" fontWeight="600">
          Create
        </text>
      </svg>
    )
  }

  if (step === 2) {
    return (
      <svg viewBox="0 0 320 160" className="h-auto w-full" aria-hidden="true">
        <rect x="30" y="8" width="260" height="144" rx="14" fill="var(--surface-panel)" />
        <text x="50" y="30" fill="var(--content-primary)" fontSize="14" fontWeight="600">
          Add your availability
        </text>
        <text x="50" y="57" fill="var(--content-secondary)" fontSize="10" fontWeight="600">
          Name
        </text>
        <rect x="100" y="44" width="170" height="20" rx="5" fill="var(--surface-muted)" />
        <text x="110" y="58" fill="var(--content-secondary)" fontSize="9">
          Your name
        </text>
        <text x="50" y="80" fill="var(--content-secondary)" fontSize="10" fontWeight="600">
          Availability
        </text>
        <rect x="50" y="86" width="220" height="27" rx="5" fill="var(--surface-muted)" />
        <text x="60" y="104" fill="var(--content-primary)" fontSize="10">
          Oct 4, 4:00 PM
        </text>
        <path
          d="m210 99 4 4 8-9"
          fill="none"
          stroke="var(--brand-content)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="m244 94 9 9m0-9-9 9" stroke="var(--content-muted)" strokeWidth="2" strokeLinecap="round" />
        <rect x="50" y="117" width="220" height="27" rx="5" fill="var(--surface-muted)" />
        <text x="60" y="135" fill="var(--content-primary)" fontSize="10">
          Oct 5, 5:00 PM
        </text>
        <path
          d="m210 130 4 4 8-9"
          fill="none"
          stroke="var(--brand-content)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="m244 125 9 9m0-9-9 9" stroke="var(--content-muted)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 320 160" className="h-auto w-full" aria-hidden="true">
      <rect x="10" y="10" width="300" height="140" rx="14" fill="var(--surface-panel)" stroke="var(--border-default)" />
      <path d="M10 50h300M10 83h300M10 116h300M112 10v140M211 10v140" stroke="var(--border-subtle)" />
      <rect data-testid="best-time-highlight" x="11" y="51" width="100" height="31" fill="var(--surface-subtle)" />
      <text x="24" y="36" fill="var(--content-secondary)" fontSize="11" fontWeight="600">
        DATE &amp; TIME
      </text>
      <text x="130" y="36" fill="var(--content-secondary)" fontSize="11" fontWeight="600">
        AVAILABLE
      </text>
      <text x="260.5" y="36" textAnchor="middle" fill="var(--content-secondary)" fontSize="11" fontWeight="600">
        UNAVAILABLE
      </text>
      <text x="24" y="72" fill="var(--content-primary)" fontSize="12">
        Sep 2, 4 PM
      </text>
      <text x="153" y="72" fill="var(--brand-content)" fontSize="13" fontWeight="600">
        ✓ 6
      </text>
      <text x="247" y="72" fill="var(--content-secondary)" fontSize="13">
        × 0
      </text>
      <text x="24" y="105" fill="var(--content-primary)" fontSize="12">
        Sep 4, 4 PM
      </text>
      <text x="153" y="105" fill="var(--brand-content)" fontSize="13" fontWeight="600">
        ✓ 3
      </text>
      <text x="247" y="105" fill="var(--content-secondary)" fontSize="13">
        × 3
      </text>
      <text x="24" y="138" fill="var(--content-primary)" fontSize="12">
        Sep 9, 4 PM
      </text>
      <text x="153" y="138" fill="var(--brand-content)" fontSize="13" fontWeight="600">
        ✓ 1
      </text>
      <text x="247" y="138" fill="var(--content-secondary)" fontSize="13">
        × 5
      </text>
    </svg>
  )
}

export default function HowItWorksModal({ onClose }: HowItWorksModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const modalRef = useModalAccessibility(true, onClose, { initialFocus: 'dialog' })
  const step = steps[currentStep]

  const moveStep = (direction: number) => {
    setCurrentStep((current) => Math.max(0, Math.min(steps.length - 1, current + direction)))
  }

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0]
    if (touch) touchStart.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStart.current
    const touch = event.changedTouches[0]
    touchStart.current = null
    if (!start || !touch) return

    const deltaX = touch.clientX - start.x
    const deltaY = touch.clientY - start.y
    if (Math.abs(deltaX) < 50 || Math.abs(deltaX) < Math.abs(deltaY)) return

    moveStep(deltaX < 0 ? 1 : -1)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-scrim/50 p-4" role="presentation">
      <button
        type="button"
        aria-label="Close How it works"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="how-it-works-title"
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') {
            event.preventDefault()
            moveStep(-1)
          } else if (event.key === 'ArrowRight') {
            event.preventDefault()
            moveStep(1)
          }
        }}
        className="relative z-10 w-full max-w-md rounded-2xl bg-surface-panel p-5 text-content-primary sm:p-6"
      >
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-content-muted">
            Step {currentStep + 1} of {steps.length}
          </p>
          <button
            type="button"
            aria-label="Close How it works"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-content-muted hover:bg-surface-muted hover:text-content-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} className="mt-2 touch-pan-y">
          <h2 id="how-it-works-title" className="text-xl font-bold">
            {step.title}
          </h2>
          <div className="mt-4 rounded-xl bg-surface-muted p-3" role="img" aria-label={`${step.title} illustration`}>
            <StepIllustration step={currentStep} />
          </div>
          <p className="mt-4 min-h-12 text-sm leading-relaxed text-content-secondary">{step.description}</p>
        </div>

        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center">
          <button
            type="button"
            aria-label="Previous step"
            onClick={() => moveStep(-1)}
            disabled={currentStep === 0}
            className="inline-flex h-9 w-9 items-center justify-center justify-self-start rounded-full text-content-secondary hover:bg-surface-muted focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong disabled:invisible"
          >
            <ArrowLeft size={16} aria-hidden="true" />
          </button>
          <div className="col-start-2 flex items-center gap-2 justify-self-center" aria-label="How it works steps">
            {steps.map((item, index) => (
              <button
                key={item.title}
                type="button"
                aria-label={`Go to step ${index + 1}`}
                aria-current={currentStep === index ? 'step' : undefined}
                onClick={() => setCurrentStep(index)}
                className={`h-2.5 w-2.5 cursor-pointer rounded-full focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong ${currentStep === index ? 'bg-brand-primary' : 'bg-border-default'}`}
              />
            ))}
          </div>
          {currentStep === steps.length - 1 ? (
            <button
              type="button"
              onClick={onClose}
              className="col-start-3 inline-flex h-9 items-center justify-center justify-self-end rounded-full px-3 text-sm font-semibold text-brand-content hover:bg-surface-muted focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
            >
              Done
            </button>
          ) : (
            <button
              type="button"
              aria-label="Next step"
              onClick={() => moveStep(1)}
              className="inline-flex h-9 w-9 items-center justify-center justify-self-end rounded-full text-brand-content hover:bg-surface-muted focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
            >
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
