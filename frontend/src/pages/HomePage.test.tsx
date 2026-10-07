import { MemoryRouter } from 'react-router'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import HomePage from './HomePage'

describe('HomePage', () => {
  it('shows the World Clock and keeps the event form without showing AppIntro', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('region', { name: 'World Clock' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'How it works' })).toHaveAttribute('aria-haspopup', 'dialog')
    expect(screen.getByRole('button', { name: 'Plan an event' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Selected times' })).toBeInTheDocument()
    expect(screen.getByText(/No times selected yet/)).toBeInTheDocument()
    expect(screen.queryByText('Simple schedule coordination')).not.toBeInTheDocument()
  })

  it('opens the how-it-works guide from its link', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'How it works' }))

    expect(screen.getByRole('dialog', { name: 'Compare local times' })).toBeInTheDocument()
    expect(
      screen.getByText('Compare local times across cities, then click or tap a time cell to add it as an option.'),
    ).toBeInTheDocument()
  })

  it('shows and consumes a navigation notice', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/', state: { notice: 'Event deleted successfully.' } }]}>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('status')).toHaveTextContent('Event deleted successfully.')
  })

  it('passes selected World Clock candidates to the event form', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    const firstTimeCell = within(screen.getAllByRole('row')[0]).getAllByRole('cell')[1]
    fireEvent.click(firstTimeCell)
    fireEvent.click(screen.getByRole('button', { name: 'Add this time' }))

    expect(screen.getByRole('region', { name: 'Selected times' })).toBeInTheDocument()
    expect(screen.queryByText('Event Date & Time Options')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add date and time option' })).not.toBeInTheDocument()
  })
})
