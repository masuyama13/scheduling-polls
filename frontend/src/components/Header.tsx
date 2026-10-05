import { Moon, Sun } from 'lucide-react'
import { Link } from 'react-router'
import { SERVICE_NAME } from '../config/appConfig.ts'
import { useTheme } from '../hooks/useTheme.ts'
import { useTimeFormat } from '../hooks/useTimeFormat.ts'

export default function Header() {
  const { theme, toggleTheme } = useTheme()
  const { timeFormat, toggleTimeFormat } = useTimeFormat()

  return (
    <header className="w-full">
      <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3">
        <div className="flex min-w-0 flex-col-reverse items-start sm:flex-row sm:items-center sm:gap-4">
          <span className="font-serif text-lg font-semibold text-content-primary">
            <Link to="/">{SERVICE_NAME}</Link>
          </span>
          <span className="font-serif text-xs text-content-secondary">Schedule across time zones</span>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label={timeFormat === '12-hour' ? 'Switch to 24-hour time' : 'Switch to 12-hour time'}
            title={timeFormat === '12-hour' ? 'Switch to 24-hour time' : 'Switch to 12-hour time'}
            onClick={toggleTimeFormat}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border-subtle text-content-secondary transition hover:border-border-strong hover:bg-surface-muted hover:text-content-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
          >
            <span aria-hidden="true" className="text-[0.65rem] font-bold leading-none">
              {timeFormat === '12-hour' ? '24h' : '12h'}
            </span>
          </button>
          <button
            type="button"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={toggleTheme}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border-subtle text-content-secondary transition hover:border-border-strong hover:bg-surface-muted hover:text-content-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
          >
            {theme === 'dark' ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  )
}
