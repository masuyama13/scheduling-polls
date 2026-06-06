import { Link } from 'react-router'

export default function Header() {
  return (
    <header className="w-full bg-brand-primary">
      <div className="mx-auto max-w-3xl px-4 py-3 flex justify-between">
        <div className="text-lg font-medium text-content-inverse">
          <Link to="/">Global Time Coord</Link>
        </div>
      </div>
    </header>
  )
}
