import { Link } from 'react-router'

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-4 text-content-primary sm:py-8">
      <section className="rounded-xl border border-border-subtle bg-surface-panel p-6 sm:p-8">
        <h1 className="text-2xl font-bold">Page not found.</h1>
        <p className="mt-2 text-content-secondary">The page you’re looking for doesn’t exist.</p>
        <Link
          to="/"
          className="mt-6 inline-block text-brand-primary underline hover:text-brand-primary-hover focus:outline-none focus-visible:rounded-sm focus-visible:ring-1 focus-visible:ring-brand-primary"
        >
          Go to home
        </Link>
      </section>
    </main>
  )
}
