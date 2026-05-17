export default function AppIntro() {
  return (
    <div className="app-intro">
      <section>
        <div className="mx-auto max-w-3xl">
          <div className="flex justify-between">
            <h1 className="w-1/2 text-3xl sm:text-4xl font-bold text-content-primary leading-tight">
              Simple schedule coordination
              <span className="block text-brand-primary">without logins or stress</span>
            </h1>

            <div className="mx-1">
              <div
                className="rounded-xl bg-surface-panel text-content-secondary px-5 py-4 font-semibold text-xs shadow-panel max-w-xs">
                <p>Multiple Time Zone Support</p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-base text-content-primary max-w-xl">
            Create an event, share the link, and let everyone mark their availability. Perfect for meetups,
            team events, or casual gatherings.
          </p>
        </div>
      </section>
    </div>
  )
}
