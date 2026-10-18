import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router'
import Header from './Header'
import { TimeFormatProvider } from '../contexts/TimeFormatProvider.tsx'
import i18n from '../i18n/index.ts'

function getStoredPreferences(): Record<string, unknown> {
  const parsedValue: unknown = JSON.parse(localStorage.getItem('crosstimely.preferences') ?? '{}')
  return typeof parsedValue === 'object' && parsedValue !== null ? (parsedValue as Record<string, unknown>) : {}
}

describe('Header', () => {
  beforeEach(async () => {
    localStorage.clear()
    document.documentElement.dataset.theme = 'light'
    await i18n.changeLanguage('en')
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

  it('uses the language default for time formatting and saves the language', async () => {
    render(
      <MemoryRouter>
        <TimeFormatProvider>
          <Header />
        </TimeFormatProvider>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Language' }))
    expect(screen.getByRole('group', { name: 'Language' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '日本語' }))

    await waitFor(() => expect(screen.getByRole('button', { name: '12時間表示に切り替え' })).toHaveTextContent('12h'))
    expect(getStoredPreferences().language).toBe('ja')
    expect(screen.queryByRole('group', { name: '言語' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '言語' }))
    fireEvent.click(screen.getByRole('button', { name: 'English' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Switch to 24-hour time' })).toHaveTextContent('24h'))
  })

  it('keeps a manually selected time format when the language changes', async () => {
    render(
      <MemoryRouter>
        <TimeFormatProvider>
          <Header />
        </TimeFormatProvider>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Switch to 24-hour time' }))
    fireEvent.click(screen.getByRole('button', { name: 'Language' }))
    fireEvent.click(screen.getByRole('button', { name: '日本語' }))

    await waitFor(() => expect(screen.getByRole('button', { name: '12時間表示に切り替え' })).toHaveTextContent('12h'))
    expect(getStoredPreferences().timeFormat).toBe('24-hour')
  })
})
