import EventCreateForm from '../components/EventCreateForm'
import WorldClock from '../components/WorldClock'

export default function HomePage() {
  return (
    <div className="home-page text-content-primary w-full">
      <WorldClock />
      <section className="bg-surface-panel">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <EventCreateForm />
        </div>
      </section>
    </div>
  )
}
