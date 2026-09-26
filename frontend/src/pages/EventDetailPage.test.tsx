import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, type Mock, vi } from 'vitest'
import axios from 'axios'
import EventDetailPage from './EventDetailPage'

vi.mock('axios')

const mockedAxios = axios as unknown as { get: Mock; isAxiosError: Mock }
const mockedGet = mockedAxios.get
const mockedIsAxiosError = mockedAxios.isAxiosError

const event = {
  id: 1,
  name: 'Year-End Party',
  description: 'Celebrate together.',
  time_zone: 'America/Vancouver',
  public_token: 'example-token',
  time_options: [
    { id: 1, event_id: 1, starts_at: '2026-09-24T20:00:00.000Z' },
    { id: 2, event_id: 1, starts_at: '2026-09-25T01:00:00.000Z' },
  ],
  responses: [],
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/events/example-token']}>
      <Routes>
        <Route path="/events/:public_token" element={<EventDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('EventDetailPage', () => {
  it('shows the Event details and candidate times', async () => {
    mockedGet.mockResolvedValueOnce({ data: event })
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Year-End Party' })).toBeInTheDocument()
    expect(screen.getByText('Celebrate together.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Available dates and times' })).toBeInTheDocument()
    expect(screen.getByText('Thu, Sep 24, 2026, 1:00 PM')).toBeInTheDocument()
    expect(screen.getByText('Thu, Sep 24, 2026, 6:00 PM')).toBeInTheDocument()
    expect(screen.getByText('No responses yet.')).toBeInTheDocument()
    expect(screen.getByText('This page and its responses may be deleted after one year.')).toBeInTheDocument()
  })

  it('shows a not found message when the Event does not exist', async () => {
    mockedIsAxiosError.mockReturnValueOnce(true)
    mockedGet.mockRejectedValueOnce({ response: { status: 404 } })
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Event not found.' })).toBeInTheDocument()
    expect(screen.getByText('The event may have been deleted or the link may be incorrect.')).toBeInTheDocument()
  })

  it('opens the availability form and lets the respondent choose a time zone and answers', async () => {
    mockedGet.mockResolvedValueOnce({ data: event })
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Add your availability' }))

    expect(screen.getByRole('heading', { name: 'Add your availability' })).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByText('Vancouver (America/Vancouver)')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Change time zone' }))
    fireEvent.change(screen.getByLabelText('City or country'), { target: { value: 'Tokyo' } })
    fireEvent.click(screen.getByRole('button', { name: /Tokyo/ }))

    expect(screen.getByText('Tokyo (Asia/Tokyo)')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Add your availability' }))
    fireEvent.click(screen.getAllByRole('radio', { name: 'Available' })[0])
    fireEvent.click(screen.getAllByRole('radio', { name: 'Not available' })[1])
    expect(screen.getAllByRole('radio', { name: 'Available' })[0]).toBeChecked()
    expect(screen.getAllByRole('radio', { name: 'Not available' })[1]).toBeChecked()
  })
})
