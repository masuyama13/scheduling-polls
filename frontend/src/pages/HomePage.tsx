import AppIntro from '../components/AppIntro'

export default function HomePage() {
  return (
    <div className="home-page text-content-primary">
      <main className="mx-auto flex max-w-3xl flex-col gap-10 p-8">
        <AppIntro />
      </main>
    </div>
  )
}
