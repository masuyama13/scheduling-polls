import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, type Mock, vi } from 'vitest'
import axios from 'axios'
import EventDetailPage from './EventDetailPage'

vi.mock('axios')

const mockedAxios = axios as unknown as { get: Mock; post: Mock; isAxiosError: Mock }
const mockedGet = mockedAxios.get
const mockedPost = mockedAxios.post
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
  it('shows the Event details', async () => {
    mockedGet.mockResolvedValueOnce({ data: event })
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Year-End Party' })).toBeInTheDocument()
    expect(screen.getByText('Celebrate together.')).toBeInTheDocument()
    expect(screen.getByText('No responses yet.')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Comment' })).toBeInTheDocument()
    expect(screen.getByRole('rowheader', { name: 'Available' })).toBeInTheDocument()
    expect(screen.getByText('This page and its responses may be deleted after one year.')).toBeInTheDocument()
  })

  it('shows a not found message when the Event does not exist', async () => {
    mockedIsAxiosError.mockReturnValueOnce(true)
    mockedGet.mockRejectedValueOnce({ response: { status: 404 } })
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Event not found.' })).toBeInTheDocument()
    expect(screen.getByText('The event may have been deleted or the link may be incorrect.')).toBeInTheDocument()
  })

  it('shows response availability and highlights the most available time', async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        ...event,
        responses: [
          {
            id: 1,
            event_id: 1,
            name: 'John',
            comment: 'Looking forward to it.',
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
        ],
      },
    })
    renderPage()

    expect(await screen.findByText('2 responses')).toBeInTheDocument()
    expect(screen.getByText('John')).toBeInTheDocument()
    expect(screen.getByText('Jane')).toBeInTheDocument()
    expect(screen.getByText('Looking forward to it.')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveClass('text-center', 'lg:w-28', 'sticky', 'left-0')
    expect(screen.getByRole('columnheader', { name: 'Comment' })).toHaveClass('text-center', 'lg:w-64')
    expect(screen.getByRole('columnheader', { name: 'Select Sep 24, 2026, 1:00 PM' })).toHaveClass('lg:w-20')
    expect(screen.getByRole('rowheader', { name: 'Available' })).toHaveClass('text-center')
    expect(screen.getByRole('rowheader', { name: 'John' })).toHaveClass('sticky', 'left-0')
    expect(screen.getByRole('rowheader', { name: 'Available' })).toHaveClass('sticky', 'left-0')
    expect(screen.getByRole('cell', { name: '2 available: Sep 24, 2026, 1:00 PM' })).toHaveClass('font-bold')
    expect(screen.getByRole('cell', { name: '1 available: Sep 24, 2026, 6:00 PM' })).not.toHaveClass('font-bold')

    const firstTimeHeader = screen.getByRole('columnheader', { name: 'Select Sep 24, 2026, 1:00 PM' })
    fireEvent.mouseEnter(firstTimeHeader)
    expect(firstTimeHeader).toHaveClass('bg-surface-subtle')
    fireEvent.mouseLeave(firstTimeHeader)
    expect(firstTimeHeader).not.toHaveClass('bg-surface-subtle')
    fireEvent.click(firstTimeHeader)

    expect(screen.getByRole('heading', { name: 'Selected time' })).toBeInTheDocument()
    expect(screen.getByDisplayValue(/Vancouver: Thu, Sep 24, 2026 at 1:00 PM/)).toBeInTheDocument()
  })

  it('opens the availability form and lets the respondent choose a time zone and answers', async () => {
    mockedGet.mockResolvedValueOnce({ data: event })
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Add your availability' }))

    expect(screen.getByRole('heading', { name: 'Add your availability' })).toBeInTheDocument()
    screen.getAllByRole('radio', { name: 'Not available' }).forEach((radio) => expect(radio).toBeChecked())
    const nameInput = screen.getByLabelText('Name')
    const commentInput = screen.getByLabelText('Comment (optional)')
    const nameCounter = screen.getByText('0 / 50')
    const commentCounter = screen.getByText('0 / 100')
    expect(nameCounter).toHaveClass('invisible')
    expect(commentCounter).toHaveClass('invisible')
    fireEvent.focus(nameInput)
    expect(nameCounter).not.toHaveClass('invisible')
    expect(commentCounter).toHaveClass('invisible')
    fireEvent.focus(commentInput)
    expect(nameCounter).toHaveClass('invisible')
    expect(commentCounter).not.toHaveClass('invisible')
    expect(screen.getByText('Vancouver (America/Vancouver)')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Change time zone' }))
    const timeZoneSearch = screen.getByLabelText('City or country')
    fireEvent.change(timeZoneSearch, { target: { value: 'Tokyo' } })
    fireEvent.click(screen.getByRole('button', { name: /Tokyo/ }))

    expect(screen.getByText('Tokyo (Asia/Tokyo)')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Select Sep 25, 2026, 5:00 AM' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Add your availability' }))
    const availabilityModal = screen.getByRole('dialog', { name: 'Add your availability' })
    expect(within(availabilityModal).getByText('Fri, Sep 25, 2026, 5:00 AM')).toBeInTheDocument()
    const scrollContainer = availabilityModal.querySelector('.overflow-y-auto')
    const scrollTo = vi.fn()
    Object.defineProperty(scrollContainer!, 'scrollTo', { configurable: true, value: scrollTo })
    fireEvent.click(screen.getByRole('button', { name: 'Add response' }))
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
    expect(screen.getByText('Name is required.')).toBeInTheDocument()
    expect(screen.queryByText('Please select an availability for every time option.')).not.toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Draft response' } })
    fireEvent.change(screen.getByLabelText('Comment (optional)'), { target: { value: 'Draft comment' } })
    fireEvent.click(screen.getAllByRole('radio', { name: 'Available' })[0])
    fireEvent.click(screen.getAllByRole('button', { name: 'Close availability form' }).at(-1)!)
    fireEvent.click(screen.getByRole('button', { name: 'Add your availability' }))
    expect(screen.queryByText('Name is required.')).not.toBeInTheDocument()
    expect(screen.queryByText('Please select an availability for every time option.')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toHaveValue('Draft response')
    expect(screen.getByLabelText('Comment (optional)')).toHaveValue('Draft comment')
    expect(screen.getAllByRole('radio', { name: 'Available' })[0]).toBeChecked()
    fireEvent.click(screen.getAllByRole('radio', { name: 'Not available' })[1])
    expect(screen.getAllByRole('radio', { name: 'Available' })[0]).toBeChecked()
    expect(screen.getAllByRole('radio', { name: 'Not available' })[1]).toBeChecked()
  })

  it('submits a response and adds it to the results', async () => {
    mockedGet.mockResolvedValueOnce({ data: event })
    mockedPost.mockResolvedValueOnce({
      data: {
        id: 1,
        event_id: 1,
        name: 'John',
        comment: 'Looking forward to it.',
        time_zone: 'America/Vancouver',
        availabilities: [
          { id: 1, response_id: 1, time_option_id: 1, status: 'available' },
          { id: 2, response_id: 1, time_option_id: 2, status: 'unavailable' },
        ],
      },
    })
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Add your availability' }))
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'John' } })
    fireEvent.click(screen.getAllByRole('radio', { name: 'Available' })[0])
    fireEvent.click(screen.getAllByRole('radio', { name: 'Not available' })[1])
    fireEvent.change(screen.getByLabelText(/Comment/), { target: { value: 'Looking forward to it.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add response' }))

    await waitFor(() => expect(mockedPost).toHaveBeenCalled())
    expect(mockedPost).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/events/example-token/responses',
      {
        response: {
          name: 'John',
          comment: 'Looking forward to it.',
          time_zone: 'America/Vancouver',
          availabilities_attributes: [
            { time_option_id: 1, status: 'available' },
            { time_option_id: 2, status: 'unavailable' },
          ],
        },
      },
      { timeout: 10_000 },
    )
    expect(await screen.findByText('1 response')).toBeInTheDocument()
    expect(screen.getByText('John')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Add your availability' }))
    expect(screen.getByLabelText('Name')).toHaveValue('')
    expect(screen.getByLabelText('Comment (optional)')).toHaveValue('')
    screen.getAllByRole('radio', { name: 'Available' }).forEach((radio) => expect(radio).not.toBeChecked())
    screen.getAllByRole('radio', { name: 'Not available' }).forEach((radio) => expect(radio).toBeChecked())
  })
})
