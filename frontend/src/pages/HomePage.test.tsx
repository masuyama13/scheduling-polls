import { MemoryRouter } from 'react-router'
import { render, screen } from '@testing-library/react'
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
    expect(screen.getByRole('heading', { name: 'Create Your Event Page' })).toBeInTheDocument()
    expect(screen.queryByText('Simple schedule coordination')).not.toBeInTheDocument()
  })
})
