function AppIntro() {
  return (
    <div className="app-intro">
      <section>
        <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16 lg:py-20">
          <div className="flex justify-between">
            <h1 className="w-1/2 text-3xl sm:text-4xl lg:text-5xl font-bold text-content-primary leading-tight">
              Simple schedule coordination
              <span className="block text-brand-primary">without logins or stress</span>
            </h1>

            <div className="mx-1">
              <div
                className="rounded-xl bg-surface-panel text-content-secondary px-5 py-4 text-xs shadow-panel max-w-xs">
                <p>No more endless group chats.</p>
                <p>Everyone answers in one place.</p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-base text-content-primary max-w-xl">
            Create an event, share the link, and let everyone mark their availability. Perfect for meetups,
            team events, or casual gatherings.
          </p>
          <p className="mt-4 text-base text-content-primary max-w-xl">
            No account required. Just share the URL with your participants.
          </p>

          <div className="mt-16 flex flex-col items-center text-center gap-3">
            <button
              className="w-full rounded-full bg-brand-primary px-6 py-4 text-base font-semibold text-content-inverse shadow-sm hover:bg-brand-primary-hover transition"
            >
              Create your event
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AppIntro
