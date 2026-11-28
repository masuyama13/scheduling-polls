import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import axios from 'axios'
import EventEditForm from './EventEditForm'
import i18n from '../i18n/index.ts'

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

  afterEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('shows Japanese labels and validation messages', async () => {
    await i18n.changeLanguage('ja')
    render(<EventEditForm event={event} onClose={vi.fn()} onUpdated={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'イベントを編集' })).toBeInTheDocument()
    expect(screen.getByLabelText('イベント名')).toHaveValue('Year-End Party')
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('イベント名'), { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: '変更を保存' }))
    expect(screen.getByText('イベント名を入力してください。')).toBeInTheDocument()
  })

  it('updates a passwordless event', async () => {
    const onClose = vi.fn()
    const onUpdated = vi.fn()
    mockedPatch.mockResolvedValueOnce({ data: { name: 'Updated Event', description: 'Updated description.' } })

    render(<EventEditForm event={event} onClose={onClose} onUpdated={onUpdated} />)
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    const nameCounter = screen.getByText('14 / 100')
    const descriptionCounter = screen.getByText('19 / 400')
    expect(nameCounter).not.toHaveClass('invisible')
    expect(descriptionCounter).toHaveClass('invisible')

    fireEvent.focus(screen.getByLabelText('Event Name'))
    expect(nameCounter).not.toHaveClass('invisible')
    expect(descriptionCounter).toHaveClass('invisible')
    fireEvent.focus(screen.getByLabelText('Description (optional)'))
    expect(nameCounter).toHaveClass('invisible')
    expect(descriptionCounter).not.toHaveClass('invisible')

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

    expect(screen.getByText('Password is incorrect.')).toBeInTheDocument()
    expect(mockedPatch).not.toHaveBeenCalled()
  })
})
