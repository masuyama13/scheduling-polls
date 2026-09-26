import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SelectedTimes from './SelectedTimes'

describe('SelectedTimes', () => {
  it('hides the count before reaching the limit', () => {
    render(
      <SelectedTimes
        candidates={[new Date('2026-09-24T12:00:00.000Z')]}
        timeZone="America/Vancouver"
        onRemove={() => {}}
      />,
    )

    expect(screen.queryByText(/times selected/)).not.toBeInTheDocument()
  })
})
