import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import EventCreateForm from '../components/EventCreateForm'
import WorldClock from '../components/WorldClock'
import HowItWorksModal from '../components/HowItWorksModal'
import type { SelectedCity } from '../lib/worldClock'
import Snackbar from '../components/Snackbar'
import SeoMetadata from '../components/SeoMetadata'

type HomeNavigationState = {
  notice?: unknown
}

export default function HomePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const navigationState = location.state as HomeNavigationState | null
  const [candidateInstants, setCandidateInstants] = useState<Date[]>([])
  const [primaryTimeZone, setPrimaryTimeZone] = useState('')
  const [selectedCities, setSelectedCities] = useState<SelectedCity[]>([])
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false)
  const [notice, setNotice] = useState<string | null>(() =>
    typeof navigationState?.notice === 'string' ? navigationState.notice : null,
  )

  useEffect(() => {
    if (typeof navigationState?.notice !== 'string') return

    void navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, navigationState?.notice, navigate])

  return (
    <div className="home-page text-content-primary w-full">
      <SeoMetadata
        title="Schedule across time zones"
        description="Find a time that works for everyone. Compare local times around the world and create a scheduling poll in minutes."
        path="/"
      />
      {notice && <Snackbar message={notice} onDismiss={() => setNotice(null)} />}
      <div className="mx-auto max-w-4xl px-4 pt-4 text-content-primary sm:pt-6">
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => setIsHowItWorksOpen(true)}
          className="cursor-pointer text-sm font-semibold text-brand-content underline decoration-border-default underline-offset-4 hover:text-brand-content-hover focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
        >
          How it works
        </button>
      </div>
      {isHowItWorksOpen && <HowItWorksModal onClose={() => setIsHowItWorksOpen(false)} />}
      <WorldClock
        candidates={candidateInstants}
        onCandidatesChange={setCandidateInstants}
        onPrimaryTimeZoneChange={setPrimaryTimeZone}
        onSelectedCitiesChange={setSelectedCities}
      />
      <section>
        <div className="mx-auto max-w-4xl px-4 py-4 sm:py-8">
          <EventCreateForm
            candidateInstants={candidateInstants}
            timeZone={primaryTimeZone || undefined}
            cities={selectedCities}
            onCandidateRemove={(instant) =>
              setCandidateInstants((current) =>
                current.filter((candidate) => candidate.getTime() !== instant.getTime()),
              )
            }
          />
        </div>
      </section>
    </div>
  )
}
