import { fireEvent, render, screen, within } from '@testing-library/react'
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
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /Tokyo/ }))

    expect(screen.getByText('2 of 10 cities')).toBeInTheDocument()
    expect(screen.getByText('Tokyo')).toBeInTheDocument()
    expect(localStorage.getItem(WORLD_CLOCK_STORAGE_KEY)).toContain('tokyo')
  })

  it('selects a search result with arrow keys and Enter', () => {
    savedCities([{ key: 'vancouver', primary: true }])
    render(<WorldClock />)

    fireEvent.click(screen.getByRole('button', { name: 'Add city' }))
    const search = screen.getByRole('searchbox', { name: 'Search cities' })
    fireEvent.change(search, { target: { value: 'Canada' } })
    fireEvent.keyDown(search, { key: 'ArrowDown' })
    fireEvent.keyDown(search, { key: 'Enter' })

    expect(screen.getByText('Montreal')).toBeInTheDocument()
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

    fireEvent.click(screen.getByRole('button', { name: 'Change your city' }))
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search cities' }), {
      target: { value: 'Berlin' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Berlin/ }))

    expect(screen.getByText('Berlin')).toBeInTheDocument()
    expect(screen.getByText('Tokyo')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change your city' })).toBeInTheDocument()
    expect(screen.getByText('2 of 10 cities')).toBeInTheDocument()
  })

  it('keeps an existing city change at the top of the list', () => {
    savedCities([
      { key: 'vancouver', primary: true },
      { key: 'tokyo', primary: false },
    ])
    render(<WorldClock />)

    fireEvent.click(screen.getByRole('button', { name: 'Change your city' }))
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search cities' }), {
      target: { value: 'Tokyo' },
    })
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /Tokyo/ }))

    const rows = screen.getAllByRole('row')
    expect(within(rows[0]).getByRole('rowheader')).toHaveTextContent('Tokyo')
    expect(within(rows[1]).getByRole('rowheader')).toHaveTextContent('Vancouver')
  })

  it('moves the comparison date by one day', () => {
    savedCities([{ key: 'vancouver', primary: true }])
    render(<WorldClock />)

    const dateInput = screen.getByLabelText('Comparison date') as HTMLInputElement
    const initialDate = dateInput.value
    fireEvent.click(screen.getByRole('button', { name: 'Next day' }))

    expect(dateInput.value).not.toBe(initialDate)
  })

  it('shows only the local date in the first time cell of each row', () => {
    savedCities([{ key: 'vancouver', primary: true }])
    render(<WorldClock />)

    const firstTimeCell = screen.getAllByRole('cell')[0]

    expect(firstTimeCell).toHaveTextContent(/Sep/)
    expect(firstTimeCell).not.toHaveTextContent('12 AM')
  })
})
