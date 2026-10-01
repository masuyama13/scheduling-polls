import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router'
import Header from './Header'

describe('Header', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.dataset.theme = 'light'
  })

  it('toggles the color scheme and persists the preference', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    )

    const themeToggle = screen.getByRole('button', { name: 'Switch to dark mode' })

    fireEvent.click(themeToggle)
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(localStorage.getItem('app-theme')).toBe('dark')

    fireEvent.click(screen.getByRole('button', { name: 'Switch to light mode' }))
    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
    expect(localStorage.getItem('app-theme')).toBe('light')
  })
})
