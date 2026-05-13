export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-content-muted">
      <div className="mx-auto max-w-3xl px-4 py-4 flex flex-col items-center">
        <p className="text-xs text-content-muted">
          &copy;
          {' '}
          {currentYear}
          {' '}
          Global Time Coord All rights reserved.
        </p>
      </div>
    </footer>
  )
}
