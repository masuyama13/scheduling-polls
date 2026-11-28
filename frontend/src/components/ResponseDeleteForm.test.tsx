import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import axios from 'axios'
import ResponseDeleteForm from './ResponseDeleteForm'
import type { Response } from '../types/event.ts'
import i18n from '../i18n/index.ts'

vi.mock('axios')

const mockedAxios = axios as unknown as { delete: Mock }
const mockedDelete = mockedAxios.delete

const response: Response = {
  id: 7,
  event_id: 1,
  name: 'John',
  comment: null,
  time_zone: 'America/Vancouver',
  city_key: 'vancouver',
  availabilities: [],
}

describe('ResponseDeleteForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('shows Japanese confirmation copy and deletes the response', async () => {
    await i18n.changeLanguage('ja')
    const onDeleted = vi.fn()
    mockedDelete.mockResolvedValueOnce({})
    render(
      <ResponseDeleteForm eventPublicToken="event-token" response={response} onClose={vi.fn()} onDeleted={onDeleted} />,
    )

    expect(screen.getByRole('heading', { name: '回答を削除しますか？' })).toBeInTheDocument()
    expect(screen.getByText('Johnさんの回答を完全に削除します。この操作は取り消せません。')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '回答を削除' }))

    await waitFor(() =>
      expect(mockedDelete).toHaveBeenCalledWith('http://localhost:3000/api/v1/events/event-token/responses/7'),
    )
    expect(onDeleted).toHaveBeenCalled()
  })
})
