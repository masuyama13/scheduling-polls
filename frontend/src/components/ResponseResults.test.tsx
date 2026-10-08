import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ResponseResults from './ResponseResults'
import { TimeFormatProvider } from '../contexts/TimeFormatProvider.tsx'

const timeOptions = [
  { id: 1, event_id: 1, starts_at: '2026-09-24T20:00:00.000Z' },
  { id: 2, event_id: 1, starts_at: '2026-09-25T01:00:00.000Z' },
]

describe('ResponseResults', () => {
  it('uses the selected 24-hour format in results, response details, and shared times', () => {
    localStorage.setItem('crosstimely.preferences', JSON.stringify({ timeFormat: '24-hour' }))
    const responses = [
      {
        id: 1,
        event_id: 1,
        name: 'John',
        comment: null,
        time_zone: 'Asia/Tokyo',
        availabilities: [
          { id: 1, response_id: 1, time_option_id: 1, status: 'available' as const },
          { id: 2, response_id: 1, time_option_id: 2, status: 'unavailable' as const },
        ],
      },
    ]

    render(
      <TimeFormatProvider>
        <ResponseResults
          eventTimeZone="America/Vancouver"
          timeZone="America/Vancouver"
          responses={responses}
          timeOptions={timeOptions}
        />
      </TimeFormatProvider>,
    )

    const firstTime = 'Sep 24, 2026, 13:00'
    expect(screen.getByRole('cell', { name: `1 available: ${firstTime}` })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'View response from John' }))
    const responseDialog = screen.getByRole('dialog', { name: 'Response details' })
    expect(within(responseDialog).getByRole('listitem', { name: 'Available: Sep 25, 2026, 5:00' })).toBeInTheDocument()
    fireEvent.click(within(responseDialog).getAllByRole('button', { name: 'Close response details' })[1])

    fireEvent.click(screen.getByRole('button', { name: `Select ${firstTime}` }))
    const shareDialog = screen.getByRole('dialog', { name: 'Share Thu, Sep 24, 2026 at 13:00' })
    expect(within(shareDialog).getByLabelText('Times to share')).toHaveValue(
      'Vancouver: Thu, Sep 24, 2026 at 13:00\nTokyo: Fri, Sep 25, 2026 at 5:00',
    )
  })

  it('shows date copying instructions when the info button is activated', () => {
    render(
      <ResponseResults
        eventTimeZone="America/Vancouver"
        timeZone="America/Vancouver"
        timeOptions={timeOptions}
        responses={[]}
      />,
    )

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Show copy instructions' }))

    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'Click or tap a date & time to view and copy its local times.',
    )
    fireEvent.click(screen.getByRole('heading', { name: 'Responses' }))
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Show copy instructions' }))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('shows a copied confirmation in the selected time dialog', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })

    render(
      <ResponseResults
        eventTimeZone="America/Vancouver"
        timeZone="America/Vancouver"
        timeOptions={timeOptions}
        responses={[]}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Select Sep 24, 2026, 1:00 PM' }))
    const copyButton = screen.getByRole('button', { name: 'Copy as text' })
    fireEvent.click(copyButton)

    const copiedButton = await screen.findByRole('button', { name: 'Copied' })
    expect(copiedButton.querySelector('svg')).toHaveClass('lucide-check')
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('Vancouver: Thu, Sep 24, 2026 at 1:00 PM'))
  })

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

    fireEvent.click(screen.getByRole('button', { name: '0 available: Sep 24, 2026, 1:00 PM' }))
    const availabilityDialog = screen.getByRole('dialog', { name: 'Sep 24, 2026, 1:00 PM' })
    expect(within(availabilityDialog).getByText('No responses yet.')).toBeInTheDocument()
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
            time_zone: 'America/Los_Angeles',
            city_key: 'san-francisco',
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
    expect(screen.getByText('San Francisco (America/Los_Angeles)')).toBeInTheDocument()
    const responseDialog = screen.getByRole('dialog', { name: 'Response details' })
    expect(
      within(responseDialog).getByRole('listitem', { name: 'Available: Sep 24, 2026, 1:00 PM' }),
    ).toBeInTheDocument()
    expect(within(responseDialog).getByRole('listitem', { name: 'Unavailable: Sep 24, 2026, 6:00 PM' })).toHaveClass(
      'grid-cols-subgrid',
    )

    fireEvent.click(screen.getAllByRole('button', { name: 'Close response details' })[1])
    expect(screen.queryByRole('heading', { name: 'Response details' })).not.toBeInTheDocument()
  })

  it('shows respondent availability for a selected time', () => {
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
              { id: 3, response_id: 2, time_option_id: 1, status: 'unavailable' },
              { id: 4, response_id: 2, time_option_id: 2, status: 'available' },
            ],
          },
        ]}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '1 available: Sep 24, 2026, 1:00 PM' }))

    const availabilityDialog = screen.getByRole('dialog', { name: 'Sep 24, 2026, 1:00 PM' })
    expect(availabilityDialog).toBeInTheDocument()
    expect(within(availabilityDialog).getByText('2 responses')).toBeInTheDocument()
    expect(within(availabilityDialog).getByText('John')).toBeInTheDocument()
    expect(within(availabilityDialog).getByText('Jane')).toBeInTheDocument()
    expect(within(availabilityDialog).getAllByLabelText('Available')).toHaveLength(1)
    expect(within(availabilityDialog).getAllByLabelText('Unavailable')).toHaveLength(1)
    expect(within(availabilityDialog).getAllByRole('listitem')).toHaveLength(2)
    expect(within(availabilityDialog).getAllByRole('listitem')[0]).toHaveClass('grid-cols-subgrid')

    fireEvent.click(screen.getAllByRole('button', { name: 'Close availability summary' })[1])
    expect(screen.queryByRole('heading', { name: 'Sep 24, 2026, 1:00 PM' })).not.toBeInTheDocument()
  })
})
