import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import axios from 'axios'
import EventDeleteForm from './EventDeleteForm'
import i18n from '../i18n/index.ts'

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

  afterEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('shows the Japanese deletion warning and controls', async () => {
    await i18n.changeLanguage('ja')
    render(<EventDeleteForm event={event} onClose={vi.fn()} onDeleted={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'イベントを削除しますか？' })).toBeInTheDocument()
    expect(screen.getByText(/イベントページ、すべての候補日時、回答を完全に削除します/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'イベントを削除' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument()
  })

  it('requires confirmation before deleting a passwordless event', async () => {
    const onDeleted = vi.fn()
    mockedDelete.mockResolvedValueOnce({})
    render(<EventDeleteForm event={event} onClose={vi.fn()} onDeleted={onDeleted} />)
    expect(screen.getByLabelText('Password')).toBeInTheDocument()

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

    expect(screen.getByText('Password is incorrect.')).toBeInTheDocument()
    expect(mockedDelete).not.toHaveBeenCalled()
  })
})
