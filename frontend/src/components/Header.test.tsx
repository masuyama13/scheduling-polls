import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router'
import Header from './Header'
import { TimeFormatProvider } from '../contexts/TimeFormatProvider.tsx'

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
    expect(screen.getByRole('button', { name: 'Switch to 24-hour time' })).toHaveTextContent('24h')

    fireEvent.click(themeToggle)
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(localStorage.getItem('app-theme')).toBe('dark')

    fireEvent.click(screen.getByRole('button', { name: 'Switch to light mode' }))
    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
    expect(localStorage.getItem('app-theme')).toBe('light')
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
    expect(localStorage.getItem('app-time-format')).toBe('24-hour')

    fireEvent.click(screen.getByRole('button', { name: 'Switch to 12-hour time' }))
    expect(localStorage.getItem('app-time-format')).toBe('12-hour')
  })
})
