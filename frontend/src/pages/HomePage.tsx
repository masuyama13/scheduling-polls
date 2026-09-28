import { useState } from 'react'
import EventCreateForm from '../components/EventCreateForm'
import WorldClock from '../components/WorldClock'
import type { SelectedCity } from '../lib/worldClock'

export default function HomePage() {
  const [candidateInstants, setCandidateInstants] = useState<Date[]>([])
  const [primaryTimeZone, setPrimaryTimeZone] = useState('')
  const [selectedCities, setSelectedCities] = useState<SelectedCity[]>([])

  return (
    <div className="home-page text-content-primary w-full">
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
