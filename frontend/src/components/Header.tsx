import { Moon, Sun } from 'lucide-react'
import { Link } from 'react-router'
import { useTheme } from '../hooks/useTheme.ts'

export default function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="w-full">
      <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3">
        <span className="font-serif text-lg font-semibold text-content-primary">
          <Link to="/">CrossTime</Link>
        </span>
        <span className="font-serif text-xs text-content-secondary">Schedule across time zones</span>
        <button
          type="button"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={toggleTheme}
          className="ml-auto flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border-default text-content-secondary transition hover:border-border-strong hover:bg-surface-muted hover:text-content-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
        >
          {theme === 'dark' ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
        </button>
      </div>
    </header>
  )
}
