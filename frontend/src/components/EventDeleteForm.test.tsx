import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import axios from 'axios'
import EventDeleteForm from './EventDeleteForm'

vi.mock('axios')

const mockedAxios = axios as unknown as { delete: Mock }
const mockedDelete = mockedAxios.delete

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

describe('EventDeleteForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('requires confirmation before deleting a passwordless event', async () => {
    const onDeleted = vi.fn()
    mockedDelete.mockResolvedValueOnce({})
    render(<EventDeleteForm event={event} onClose={vi.fn()} onDeleted={onDeleted} />)

    fireEvent.click(screen.getByRole('button', { name: 'Delete event' }))

    await waitFor(() => expect(mockedDelete).toHaveBeenCalled())
    expect(mockedDelete).toHaveBeenCalledWith('http://localhost:3000/api/v1/events/example-token', {})
    expect(onDeleted).toHaveBeenCalled()
  })

  it('sends the password when deleting a protected event', async () => {
    mockedDelete.mockResolvedValueOnce({})
    render(<EventDeleteForm event={{ ...event, password_protected: true }} onClose={vi.fn()} onDeleted={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'safe-password' } })
    fireEvent.click(screen.getByRole('button', { name: 'Delete event' }))

    await waitFor(() => expect(mockedDelete).toHaveBeenCalled())
    expect(mockedDelete).toHaveBeenCalledWith('http://localhost:3000/api/v1/events/example-token', {
      data: { password: 'safe-password' },
    })
  })

  it('requires a password before deleting a protected event', () => {
    render(<EventDeleteForm event={{ ...event, password_protected: true }} onClose={vi.fn()} onDeleted={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Delete event' }))

    expect(screen.getByText('Password is required.')).toBeInTheDocument()
    expect(mockedDelete).not.toHaveBeenCalled()
  })
})
