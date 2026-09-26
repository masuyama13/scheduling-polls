export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-border-subtle">
      <div className="mx-auto max-w-3xl px-4 py-4 flex flex-col items-center">
        <div className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-10 gap-y-2 text-xs text-content-muted">
          <p className="basis-full text-center sm:basis-auto">&copy; {currentYear} CrossTime All rights reserved.</p>
          <a href="/privacy" className="block">
            Privacy Policy
          </a>
          <a href="/terms" className="block">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  )
}
