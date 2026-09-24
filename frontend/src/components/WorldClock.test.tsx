import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import WorldClock from './WorldClock'
import { WORLD_CLOCK_STORAGE_KEY } from '../lib/worldClock'

const savedCities = (cities: Array<{ key: string; primary: boolean }>) => {
  localStorage.setItem(WORLD_CLOCK_STORAGE_KEY, JSON.stringify(cities))
}

describe('WorldClock', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows the detected city when no saved selection exists', () => {
    render(<WorldClock />)

    expect(screen.getByRole('region', { name: 'World Clock' })).toBeInTheDocument()
    expect(screen.queryByText('Find a time that works everywhere')).not.toBeInTheDocument()
    expect(screen.queryByText('World Clock')).not.toBeInTheDocument()
    expect(screen.queryByText('Compare local time across your selected cities.')).not.toBeInTheDocument()
    expect(screen.getByText(/of 10 cities/)).toBeInTheDocument()
  })

  it('adds a city and persists the selection', () => {
    savedCities([{ key: 'vancouver', primary: true }])
    render(<WorldClock />)

    fireEvent.click(screen.getByRole('button', { name: 'Add city' }))
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search cities' }), {
      target: { value: 'Tokyo' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Tokyo/ }))

    expect(screen.getByText('2 of 10 cities')).toBeInTheDocument()
    expect(screen.getByText('Tokyo')).toBeInTheDocument()
    expect(localStorage.getItem(WORLD_CLOCK_STORAGE_KEY)).toContain('tokyo')
  })

  it('does not offer the primary city for deletion and removes other cities', () => {
    savedCities([
      { key: 'vancouver', primary: true },
      { key: 'tokyo', primary: false },
    ])
    render(<WorldClock />)

    expect(screen.queryByRole('button', { name: 'Remove Vancouver' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Remove Tokyo' }))

    expect(screen.queryByText('Tokyo')).not.toBeInTheDocument()
    expect(screen.getByText('1 of 10 cities')).toBeInTheDocument()
  })

  it('changes the primary city without removing the other selected cities', () => {
    savedCities([
      { key: 'vancouver', primary: true },
      { key: 'tokyo', primary: false },
    ])
    render(<WorldClock />)

    fireEvent.click(screen.getByRole('button', { name: 'Change' }))
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search cities' }), {
      target: { value: 'Berlin' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Berlin/ }))

    expect(screen.getByText('Berlin')).toBeInTheDocument()
    expect(screen.getByText('Tokyo')).toBeInTheDocument()
    expect(screen.getByText('Berlin').parentElement).toHaveTextContent('Your city')
    expect(screen.getByText('2 of 10 cities')).toBeInTheDocument()
  })
})
