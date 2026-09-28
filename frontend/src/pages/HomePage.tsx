import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import EventCreateForm from '../components/EventCreateForm'
import WorldClock from '../components/WorldClock'
import type { SelectedCity } from '../lib/worldClock'
import Snackbar from '../components/Snackbar'

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
  const [notice, setNotice] = useState<string | null>(() =>
    typeof navigationState?.notice === 'string' ? navigationState.notice : null,
  )

  useEffect(() => {
    if (typeof navigationState?.notice !== 'string') return

    void navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, navigationState?.notice, navigate])

  return (
    <div className="home-page text-content-primary w-full">
      {notice && <Snackbar message={notice} onDismiss={() => setNotice(null)} />}
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
