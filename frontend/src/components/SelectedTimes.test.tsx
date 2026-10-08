import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SelectedTimes from './SelectedTimes'
import { TimeFormatProvider } from '../contexts/TimeFormatProvider.tsx'

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

  it('uses the selected 24-hour format', () => {
    localStorage.setItem('crosstimely.preferences', JSON.stringify({ timeFormat: '24-hour' }))
    render(
      <TimeFormatProvider>
        <SelectedTimes
          candidates={[new Date('2026-09-24T12:00:00.000Z')]}
          timeZone="America/Vancouver"
          onRemove={() => {}}
        />
      </TimeFormatProvider>,
    )

    expect(screen.getByText(/at 5:00$/)).toBeInTheDocument()
    expect(screen.queryByText(/AM|PM/)).not.toBeInTheDocument()
  })
})
