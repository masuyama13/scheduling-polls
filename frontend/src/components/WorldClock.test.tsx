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

  it('highlights the same time column across all city rows on hover', () => {
    savedCities([
      { key: 'vancouver', primary: true },
      { key: 'tokyo', primary: false },
    ])
    render(<WorldClock />)

    const table = screen.getByRole('table')
    const rows = screen.getAllByRole('row')
    const firstTimeCell = within(rows[0]).getAllByRole('cell')[1]

    fireEvent.mouseOver(firstTimeCell)

    expect(within(rows[0]).getAllByRole('cell')[1]).toHaveClass('bg-brand-primary/10')
    expect(within(rows[1]).getAllByRole('cell')[1]).toHaveClass('bg-brand-primary/10')
    expect(within(rows[0]).getAllByRole('cell')[1]).toHaveStyle('background-color: color-mix(in oklab, var(--color-brand-primary) 10%, transparent)')
    expect(within(rows[1]).getAllByRole('cell')[1]).toHaveStyle('background-color: color-mix(in oklab, var(--color-brand-primary) 10%, transparent)')

    fireEvent.mouseLeave(table)

    expect(within(rows[0]).getAllByRole('cell')[1]).not.toHaveClass('bg-brand-primary/10')
    expect(within(rows[1]).getAllByRole('cell')[1]).not.toHaveClass('bg-brand-primary/10')
  })

  it('keeps a daylight-saving repeated hour within one table column', () => {
    savedCities([{ key: 'los-angeles', primary: true }])
    render(<WorldClock />)

    fireEvent.change(screen.getByLabelText('Comparison date'), {
      target: { value: '2026-11-01' },
    })

    const row = screen.getAllByRole('row')[0]
    const cells = within(row).getAllByRole('cell')
    expect(cells).toHaveLength(24)
    expect(cells[1]).toHaveTextContent('1AM')
    expect(cells[2]).toHaveTextContent('1AM')
    expect(cells[1]).toHaveTextContent('UTC-7')
    expect(cells[2]).toHaveTextContent('UTC-8')
  })

  it('keeps Vancouver on permanent Pacific Time after the transition', () => {
    savedCities([{ key: 'vancouver', primary: true }])
    render(<WorldClock />)

    fireEvent.change(screen.getByLabelText('Comparison date'), {
      target: { value: '2026-11-01' },
    })

    const row = screen.getAllByRole('row')[0]
    expect(within(row).getAllByRole('cell')).toHaveLength(24)
  })

  it('opens the time selection modal from a time cell', () => {
    savedCities([
      {key: 'vancouver', primary: true},
      {key: 'tokyo', primary: false},
    ])
    render(<WorldClock />)

    const firstTimeCell = within(screen.getAllByRole('row')[0]).getAllByRole('cell')[1]
    fireEvent.click(firstTimeCell)

    expect(screen.getByRole('dialog', {name: 'Choose a time'})).toBeInTheDocument()
    expect((screen.getByLabelText('Date') as HTMLInputElement).value).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect((screen.getByLabelText('Time') as HTMLInputElement).value).toMatch(/^\d{2}:\d{2}$/)
    const dialog = screen.getByRole('dialog', {name: 'Choose a time'})
    expect(within(dialog).getByText('Tokyo')).toBeInTheDocument()
    expect(within(dialog).getAllByText(/^[A-Z][a-z]{2}, [A-Z][a-z]{2} \d{1,2} at \d{1,2}:\d{2} [AP]M$/)).toHaveLength(2)
  })

  it('adds, sorts, and removes selected time candidates', () => {
    savedCities([{key: 'vancouver', primary: true}])
    render(<WorldClock />)

    const cells = within(screen.getAllByRole('row')[0]).getAllByRole('cell')

    fireEvent.click(cells[3])
    fireEvent.click(screen.getByRole('button', {name: 'Add this time'}))
    fireEvent.click(screen.getByRole('button', {name: 'Close time selection'}))

    fireEvent.click(cells[1])
    fireEvent.click(screen.getByRole('button', {name: 'Add this time'}))

    expect(screen.getByRole('button', {name: 'Already selected'})).toBeInTheDocument()
  })
})
