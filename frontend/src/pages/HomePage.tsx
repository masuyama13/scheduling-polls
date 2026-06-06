import AppIntro from '../components/AppIntro'
import EventCreateForm from '../components/EventCreateForm'

export default function HomePage() {
  return (
    <div className="home-page text-content-primary w-full">
      <section className="bg-surface-subtle">
        <div className="mx-auto max-w-3xl p-8">
          <AppIntro />
        </div>
      </section>
      <section className="bg-surface-panel">
        <div className="mx-auto max-w-3xl p-8">
          <EventCreateForm />
        </div>
      </section>
    </div>
  )
}
