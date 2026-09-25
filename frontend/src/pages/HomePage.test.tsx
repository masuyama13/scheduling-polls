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
    expect(screen.getByRole('button', { name: 'Plan an event' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Selected time candidates' })).toBeInTheDocument()
    expect(screen.getByText(/No times selected yet/)).toBeInTheDocument()
    expect(screen.queryByText('Simple schedule coordination')).not.toBeInTheDocument()
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

    expect(screen.getByRole('region', { name: 'Selected time candidates' })).toBeInTheDocument()
    expect(screen.queryByText('Event Date & Time Options')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add date and time option' })).not.toBeInTheDocument()
  })
})
