import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import axios from 'axios'
import EventEditForm from './EventEditForm'

vi.mock('axios')

const mockedAxios = axios as unknown as { patch: Mock; isAxiosError: Mock }
const mockedPatch = mockedAxios.patch

const event = {
  id: 1,
  name: 'Year-End Party',
  description: 'Celebrate together.',
  time_zone: 'America/Vancouver',
  public_token: 'example-token',
  password_protected: false,
  time_options: [],
  responses: [],
}

describe('EventEditForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates a passwordless event', async () => {
    const onClose = vi.fn()
    const onUpdated = vi.fn()
    mockedPatch.mockResolvedValueOnce({ data: { name: 'Updated Event', description: 'Updated description.' } })

    render(<EventEditForm event={event} onClose={onClose} onUpdated={onUpdated} />)
    expect(screen.getByLabelText('Password')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Event Name'), { target: { value: 'Updated Event' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => expect(mockedPatch).toHaveBeenCalled())
    expect(mockedPatch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/events/example-token',
      expect.objectContaining({ event: { name: 'Updated Event', description: 'Celebrate together.' } }),
    )
    expect(onUpdated).toHaveBeenCalledWith({ name: 'Updated Event', description: 'Updated description.' })
    expect(onClose).toHaveBeenCalled()
  })

  it('requires the password for a protected event', () => {
    render(<EventEditForm event={{ ...event, password_protected: true }} onClose={vi.fn()} onUpdated={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(screen.getByText('Password is required.')).toBeInTheDocument()
    expect(mockedPatch).not.toHaveBeenCalled()
  })
})
