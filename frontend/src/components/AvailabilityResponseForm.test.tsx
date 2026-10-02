import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import axios from 'axios'
import AvailabilityResponseForm from './AvailabilityResponseForm'
import { TimeFormatProvider } from '../contexts/TimeFormatProvider.tsx'

vi.mock('axios')

const mockedAxios = axios as unknown as { patch: Mock }
const mockedPatch = mockedAxios.patch

const timeOptions = [
  { id: 1, event_id: 1, starts_at: '2026-10-01T18:00:00.000Z' },
  { id: 2, event_id: 1, starts_at: '2026-10-02T18:00:00.000Z' },
]

const response = {
  id: 7,
  event_id: 1,
  name: 'John',
  comment: 'Looking forward to it.',
  time_zone: 'America/Vancouver',
  city_key: 'vancouver',
  availabilities: [
    { id: 11, response_id: 7, time_option_id: 1, status: 'available' as const },
    { id: 12, response_id: 7, time_option_id: 2, status: 'unavailable' as const },
  ],
}

describe('AvailabilityResponseForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads and updates an existing response', async () => {
    mockedPatch.mockResolvedValueOnce({ data: response })
    const onUpdated = vi.fn()

    render(
      <AvailabilityResponseForm
        eventPublicToken="event-token"
        timeZone="America/Vancouver"
        onTimeZoneChange={vi.fn()}
        timeOptions={timeOptions}
        onSubmitted={vi.fn()}
        editingResponse={response}
        onUpdated={onUpdated}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Edit your availability' })).toBeInTheDocument()
    expect(screen.getByText('Your time zone:')).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toHaveValue('John')
    expect(screen.getByLabelText('Comment (optional)')).toHaveValue('Looking forward to it.')
    expect(screen.getAllByRole('radio', { name: 'Available' })[0]).toBeChecked()
    expect(screen.getAllByRole('radio', { name: 'Not available' })[1]).toBeChecked()
    expect(screen.queryByRole('link', { name: 'terms of service' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'privacy policy' })).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Updated John' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save response' }))

    await waitFor(() => expect(mockedPatch).toHaveBeenCalled())
    const patchCall = mockedPatch.mock.calls[0] as [
      string,
      { response: { name: string; availabilities_attributes: Array<Record<string, unknown>> } },
      { timeout: number },
    ]
    expect(patchCall[0]).toBe('http://localhost:3000/api/v1/events/event-token/responses/7')
    expect(patchCall[1].response.name).toBe('Updated John')
    expect(patchCall[1].response.availabilities_attributes).toEqual([
      { id: 11, time_option_id: 1, status: 'available' },
      { id: 12, time_option_id: 2, status: 'unavailable' },
    ])
    expect(patchCall[2]).toEqual({ timeout: 10_000 })
    expect(onUpdated).toHaveBeenCalledWith(response)
  })

  it('shows response time options in the selected 24-hour format', () => {
    localStorage.setItem('app-time-format', '24-hour')

    render(
      <TimeFormatProvider>
        <AvailabilityResponseForm
          eventPublicToken="event-token"
          timeZone="America/Vancouver"
          onTimeZoneChange={vi.fn()}
          timeOptions={timeOptions}
          onSubmitted={vi.fn()}
          editingResponse={response}
        />
      </TimeFormatProvider>,
    )

    expect(screen.getAllByText(/11:00/)).toHaveLength(2)
    expect(screen.queryByText(/AM|PM/)).not.toBeInTheDocument()
  })

  it('links to the terms and privacy policy before a response is submitted', () => {
    render(
      <AvailabilityResponseForm
        eventPublicToken="event-token"
        timeZone="America/Vancouver"
        onTimeZoneChange={vi.fn()}
        timeOptions={timeOptions}
        onSubmitted={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Add your availability' }))

    expect(screen.getByRole('link', { name: 'terms of service' })).toHaveAttribute('href', '/terms')
    expect(screen.getByRole('link', { name: 'privacy policy' })).toHaveAttribute('href', '/privacy')
  })
})
