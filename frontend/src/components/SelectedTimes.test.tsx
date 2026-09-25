import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SelectedTimes from './SelectedTimes'
import { MAX_TIME_CANDIDATES } from '../lib/worldClock'

describe('SelectedTimes', () => {
  it('hides the count before reaching the limit', () => {
    render(
      <SelectedTimes
        candidates={[new Date('2026-09-24T12:00:00.000Z')]}
        timeZone="America/Vancouver"
        onRemove={() => {
        }}
      />,
    )

    expect(screen.queryByText(/times selected/)).not.toBeInTheDocument()
  })

  it('shows a warning when the candidate limit is reached', () => {
    const candidates = Array.from(
      {length: MAX_TIME_CANDIDATES},
      (_, index) => new Date(Date.UTC(2026, 8, 24, index)),
    )

    render(
      <SelectedTimes
        candidates={candidates}
        timeZone="America/Vancouver"
        onRemove={() => {
        }}
      />,
    )

    const warning = screen.getByText('10/10 times selected')
    expect(warning).toHaveClass('text-status-danger')
  })
})
