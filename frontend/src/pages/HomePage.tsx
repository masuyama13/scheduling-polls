import { useState } from 'react'
import EventCreateForm from '../components/EventCreateForm'
import WorldClock from '../components/WorldClock'

export default function HomePage() {
  const [candidateInstants, setCandidateInstants] = useState<Date[]>([])
  const [primaryTimeZone, setPrimaryTimeZone] = useState('')

  return (
    <div className="home-page text-content-primary w-full">
      <WorldClock
        candidates={candidateInstants}
        onCandidatesChange={setCandidateInstants}
        onPrimaryTimeZoneChange={setPrimaryTimeZone}
      />
      <section>
        <div className="mx-auto max-w-4xl px-4 py-8">
          <EventCreateForm
            candidateInstants={candidateInstants}
            timeZone={primaryTimeZone || undefined}
            onCandidateRemove={instant => setCandidateInstants(current => current.filter(candidate => candidate.getTime() !== instant.getTime()))}
          />
        </div>
      </section>
    </div>
  )
}
