import { useState } from 'react'
import EventCreateForm from '../components/EventCreateForm'
import SelectedTimes from '../components/SelectedTimes'
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
      <SelectedTimes
        candidates={candidateInstants}
        timeZone={primaryTimeZone}
        onRemove={instant => setCandidateInstants(current => current.filter(candidate => candidate.getTime() !== instant.getTime()))}
      />
      <section className="bg-surface-panel">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <EventCreateForm />
        </div>
      </section>
    </div>
  )
}
