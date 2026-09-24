import { Link } from 'react-router'

export default function Header() {
  return (
    <header className="w-full">
      <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3">
        <span className="font-serif text-lg font-semibold text-content-primary">
          <Link to="/">CrossTime</Link>
        </span>
        <span className="font-serif text-xs text-content-secondary">Schedule across time zones</span>
      </div>
    </header>
  )
}
