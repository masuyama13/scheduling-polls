import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import axios from 'axios'
import EventCreateForm from './EventCreateForm'

vi.mock('axios')

const mockedAxios = axios as unknown as { post: Mock; isAxiosError: Mock }
const mockedPost = mockedAxios.post
const mockedIsAxiosError = mockedAxios.isAxiosError

function renderForm(candidateInstants: Date[] = [new Date('2026-10-01T18:00:00.000Z')]) {
  return render(
    <MemoryRouter>
      <EventCreateForm candidateInstants={candidateInstants} onCandidateRemove={vi.fn()} />
    </MemoryRouter>,
  )
}

describe('EventCreateForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows character counters and truncates input at the configured limits', () => {
    renderForm()

    const nameInput = screen.getByLabelText('Event Name')
    const descriptionInput = screen.getByLabelText(/Description/)

    fireEvent.change(nameInput, { target: { value: 'a'.repeat(101) } })
    fireEvent.change(descriptionInput, { target: { value: 'b'.repeat(401) } })

    expect(nameInput).toHaveValue('a'.repeat(100))
    expect(descriptionInput).toHaveValue('b'.repeat(400))
    expect(screen.getByText('100 / 100')).toBeInTheDocument()
    expect(screen.getByText('400 / 400')).toBeInTheDocument()
  })

  it('warns when a selected time is in the past', () => {
    renderForm([new Date('2020-01-01T00:00:00.000Z')])

    expect(screen.getByRole('status')).toHaveTextContent('You can still create this event.')
  })

  it('requires an event name and at least one time option before submitting', () => {
    renderForm([])

    fireEvent.click(screen.getByRole('button', { name: 'Plan an event' }))

    expect(screen.getByText('Event name is required.')).toBeInTheDocument()
    expect(screen.getByText('At least one date and time option is required.')).toBeInTheDocument()
    expect(screen.queryByText('No times selected yet.')).not.toBeInTheDocument()
    expect(mockedPost).not.toHaveBeenCalled()
  })

  it('shows API validation errors without losing input', async () => {
    mockedIsAxiosError.mockReturnValueOnce(true)
    mockedPost.mockRejectedValueOnce({
      response: { data: { errors: ['Name is too long (maximum is 100 characters)'] } },
    })
    renderForm()

    const nameInput = screen.getByLabelText('Event Name')
    fireEvent.change(nameInput, { target: { value: 'Year-End Party' } })
    fireEvent.click(screen.getByRole('button', { name: 'Plan an event' }))

    expect(await screen.findByText('Name is too long (maximum is 100 characters)')).toBeInTheDocument()
    expect(nameInput).toHaveValue('Year-End Party')
  })
})
