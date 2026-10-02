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
    const previousTitle = document.title
    mockedGet.mockResolvedValueOnce({ data: event })
    const { unmount } = renderPage()

    expect(await screen.findByRole('heading', { name: 'Year-End Party' })).toBeInTheDocument()
    expect(document.title).toBe('Year-End Party | CrossTimely')
    expect(screen.getByText('Celebrate together.')).toBeInTheDocument()
    expect(screen.getByText('No responses yet.')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /Date & time/ })).toHaveTextContent('(in Vancouver)')
    expect(screen.getByRole('columnheader', { name: 'Available' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Unavailable' })).toBeInTheDocument()

    unmount()
    expect(document.title).toBe(previousTitle)
  })

  it('shows a not found message when the Event does not exist', async () => {
    mockedIsAxiosError.mockReturnValueOnce(true)
    mockedGet.mockRejectedValueOnce({ response: { status: 404 } })
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Event not found.' })).toBeInTheDocument()
    expect(screen.getByText('The event may have been deleted or the link may be incorrect.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Go to home' })).toHaveAttribute('href', '/')
  })

  it('shows a copied confirmation in the link button', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
    mockedGet.mockResolvedValueOnce({ data: event })
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Copy link' }))

    const copiedButton = await screen.findByRole('button', { name: 'Copied' })
    expect(within(copiedButton).getByText('Copied')).toBeInTheDocument()
    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/events/example-token`)
  })

  it('opens event management actions separately', async () => {
    mockedGet.mockResolvedValueOnce({ data: event })
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Event actions' }))
    expect(screen.getByRole('menuitem', { name: 'Edit event' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Delete event' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('menuitem', { name: 'Delete event' }))
    expect(screen.getByRole('dialog', { name: 'Delete event?' })).toBeInTheDocument()
  })

  it('shows the availability summary', async () => {
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
    expect(screen.getByRole('cell', { name: '2 available: Sep 24, 2026, 1:00 PM' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: '0 unavailable: Sep 24, 2026, 1:00 PM' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: '1 available: Sep 24, 2026, 6:00 PM' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: '1 unavailable: Sep 24, 2026, 6:00 PM' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Select Sep 24, 2026, 1:00 PM' }))

    expect(screen.getByRole('dialog', { name: 'Share Thu, Sep 24, 2026 at 1:00 PM' })).toBeInTheDocument()
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
    expect(nameInput).toHaveFocus()
    expect(nameCounter).not.toHaveClass('invisible')
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
    fireEvent.change(timeZoneSearch, { target: { value: 'San Francisco' } })
    fireEvent.click(screen.getByRole('button', { name: /San Francisco/ }))

    expect(screen.getByText('San Francisco (America/Los_Angeles)')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /San Francisco/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Select Sep 24, 2026, 6:00 PM' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Add your availability' }))
    const availabilityModal = screen.getByRole('dialog', { name: 'Add your availability' })
    expect(
      within(availabilityModal).getByText('Times shown in San Francisco (America/Los_Angeles)'),
    ).toBeInTheDocument()
    expect(within(availabilityModal).getByText('Thu, Sep 24, 2026, 6:00 PM')).toBeInTheDocument()
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
          city_key: 'vancouver',
          availabilities_attributes: [
            { time_option_id: 1, status: 'available' },
            { time_option_id: 2, status: 'unavailable' },
          ],
        },
      },
      { timeout: 10_000 },
    )
    expect(await screen.findByText('1 response')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Add your availability' }))
    expect(screen.getByLabelText('Name')).toHaveValue('')
    expect(screen.getByLabelText('Comment (optional)')).toHaveValue('')
    screen.getAllByRole('radio', { name: 'Available' }).forEach((radio) => expect(radio).not.toBeChecked())
    screen.getAllByRole('radio', { name: 'Not available' }).forEach((radio) => expect(radio).toBeChecked())
  })
})
