import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router'
import Header from './Header'
import { TimeFormatProvider } from '../contexts/TimeFormatProvider.tsx'

function getStoredPreferences(): Record<string, unknown> {
  const parsedValue: unknown = JSON.parse(localStorage.getItem('crosstimely.preferences') ?? '{}')
  return typeof parsedValue === 'object' && parsedValue !== null ? (parsedValue as Record<string, unknown>) : {}
}

describe('Header', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.dataset.theme = 'light'
  })

  it('toggles the color scheme and persists the preference', () => {
    render(
      <MemoryRouter>
        <TimeFormatProvider>
          <Header />
        </TimeFormatProvider>
      </MemoryRouter>,
    )

    const themeToggle = screen.getByRole('button', { name: 'Switch to dark mode' })
    expect(screen.getByRole('link')).toHaveTextContent('CrossTimely')
    expect(screen.getByRole('button', { name: 'Switch to 24-hour time' })).toHaveTextContent('24h')

    fireEvent.click(themeToggle)
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(getStoredPreferences().theme).toBe('dark')

    fireEvent.click(screen.getByRole('button', { name: 'Switch to light mode' }))
    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
    expect(getStoredPreferences().theme).toBe('light')
  })

  it('toggles the time format and persists the preference', () => {
    render(
      <MemoryRouter>
        <TimeFormatProvider>
          <Header />
        </TimeFormatProvider>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Switch to 24-hour time' }))
    expect(screen.getByRole('button', { name: 'Switch to 12-hour time' })).toHaveTextContent('12h')
    expect(getStoredPreferences().timeFormat).toBe('24-hour')

    fireEvent.click(screen.getByRole('button', { name: 'Switch to 12-hour time' }))
    expect(getStoredPreferences().timeFormat).toBe('12-hour')
  })

  it('opens the how-it-works guide from the help button', () => {
    render(
      <MemoryRouter>
        <TimeFormatProvider>
          <Header />
        </TimeFormatProvider>
      </MemoryRouter>,
    )

    const helpButton = screen.getByRole('button', { name: 'How it works' })
    expect(helpButton).toHaveAttribute('aria-haspopup', 'dialog')
    expect(helpButton).toHaveAttribute('title', 'How it works')

    fireEvent.click(helpButton)
    expect(screen.getByRole('dialog', { name: 'Compare local times' })).toBeInTheDocument()
  })
})
