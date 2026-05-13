import AppIntro from '../components/AppIntro.tsx';

function HomePage() {
  return (
    <div className="home-page min-h-screen bg-surface-page text-content-primary">
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-10 px-6 py-12">
        <AppIntro />
      </main>
    </div>
  )
}

export default HomePage
