import AppIntro from '../components/AppIntro'
import EventCreateForm from '../components/EventCreateForm'

export default function HomePage() {
  return (
    <div className="home-page text-content-primary w-full">
      <main className="mx-auto flex max-w-3xl flex-col gap-10 p-8">
        <AppIntro />
        <EventCreateForm />
      </main>
    </div>
  )
}
