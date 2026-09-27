import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ResponseResults from './ResponseResults'

const timeOptions = [
  { id: 1, event_id: 1, starts_at: '2026-09-24T20:00:00.000Z' },
  { id: 2, event_id: 1, starts_at: '2026-09-25T01:00:00.000Z' },
]

describe('ResponseResults', () => {
  it('summarizes available and unavailable responses for each candidate time', () => {
    render(
      <ResponseResults
        eventTimeZone="America/Vancouver"
        timeZone="America/Vancouver"
        timeOptions={timeOptions}
        responses={[
          {
            id: 1,
            event_id: 1,
            name: 'John',
            comment: null,
            time_zone: 'America/Vancouver',
            availabilities: [
              { id: 1, response_id: 1, time_option_id: 1, status: 'available' },
              { id: 2, response_id: 1, time_option_id: 2, status: 'unavailable' },
            ],
          },
          {
            id: 2,
            event_id: 1,
            name: 'Jane',
            comment: null,
            time_zone: 'Asia/Tokyo',
            availabilities: [
              { id: 3, response_id: 2, time_option_id: 1, status: 'available' },
              { id: 4, response_id: 2, time_option_id: 2, status: 'available' },
            ],
          },
        ]}
      />,
    )

    expect(screen.getByRole('cell', { name: '2 available: Sep 24, 2026, 1:00 PM' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: '0 unavailable: Sep 24, 2026, 1:00 PM' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: '1 available: Sep 24, 2026, 6:00 PM' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: '1 unavailable: Sep 24, 2026, 6:00 PM' })).toBeInTheDocument()
  })

  it('shows the summary table when there are no responses', () => {
    render(
      <ResponseResults
        eventTimeZone="America/Vancouver"
        timeZone="America/Vancouver"
        timeOptions={timeOptions}
        responses={[]}
      />,
    )

    expect(screen.getByText('No responses yet.')).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: '0 available: Sep 24, 2026, 1:00 PM' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: '0 unavailable: Sep 24, 2026, 6:00 PM' })).toBeInTheDocument()
    expect(screen.getByText('No respondents yet.')).toBeInTheDocument()
  })

  it('lists respondents and marks responses with comments', () => {
    render(
      <ResponseResults
        eventTimeZone="America/Vancouver"
        timeZone="America/Vancouver"
        timeOptions={[]}
        responses={[
          {
            id: 2,
            event_id: 1,
            name: 'Later response',
            comment: null,
            time_zone: 'America/Vancouver',
            availabilities: [],
          },
          {
            id: 1,
            event_id: 1,
            name: 'Earlier response',
            comment: 'See you there.',
            time_zone: 'America/Vancouver',
            availabilities: [],
          },
        ]}
      />,
    )

    const respondentList = screen.getByRole('list')
    expect(respondentList).toHaveTextContent('Earlier response')
    expect(respondentList).toHaveTextContent('Later response')
    expect(screen.getByRole('img', { name: 'Has comment from Earlier response' })).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: 'Has comment from Later response' })).not.toBeInTheDocument()
  })

  it('shows response details in the respondent time zone', () => {
    render(
      <ResponseResults
        eventTimeZone="America/Vancouver"
        timeZone="America/Vancouver"
        timeOptions={timeOptions}
        responses={[
          {
            id: 1,
            event_id: 1,
            name: 'John',
            comment: 'See you there.',
            time_zone: 'Asia/Tokyo',
            availabilities: [
              { id: 1, response_id: 1, time_option_id: 1, status: 'available' },
              { id: 2, response_id: 1, time_option_id: 2, status: 'unavailable' },
            ],
          },
        ]}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'View response from John' }))

    expect(screen.getByRole('heading', { name: 'Response details' })).toBeInTheDocument()
    expect(screen.getByText('See you there.')).toBeInTheDocument()
    expect(screen.getByText('Tokyo (Asia/Tokyo)')).toBeInTheDocument()
    expect(screen.getByRole('listitem', { name: 'Available: Sep 25, 2026, 5:00 AM' })).toBeInTheDocument()
    expect(screen.getByRole('listitem', { name: 'Unavailable: Sep 25, 2026, 10:00 AM' })).toBeInTheDocument()

    fireEvent.click(screen.getAllByRole('button', { name: 'Close response details' })[1])
    expect(screen.queryByRole('heading', { name: 'Response details' })).not.toBeInTheDocument()
  })
})
