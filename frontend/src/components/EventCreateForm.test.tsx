import { fireEvent, render, screen, waitFor } from '@testing-library/react'
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
    const nameCounter = screen.getByText('0 / 100')
    const descriptionCounter = screen.getByText('0 / 400')

    expect(nameCounter).toHaveClass('invisible')
    expect(descriptionCounter).toHaveClass('invisible')
    fireEvent.focus(nameInput)
    expect(nameCounter).not.toHaveClass('invisible')
    expect(descriptionCounter).toHaveClass('invisible')
    fireEvent.focus(descriptionInput)
    expect(nameCounter).toHaveClass('invisible')
    expect(descriptionCounter).not.toHaveClass('invisible')

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
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: 'Create event' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Name is too long (maximum is 100 characters)')
    expect(nameInput).toHaveValue('Year-End Party')
  })

  it('includes an optional event password when creating an event', async () => {
    mockedPost.mockResolvedValueOnce({ data: { public_token: 'example-token' } })
    renderForm()

    fireEvent.change(screen.getByLabelText('Event Name'), { target: { value: 'Year-End Party' } })
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: 'safe-password' } })
    fireEvent.click(screen.getByRole('button', { name: 'Plan an event' }))
    fireEvent.click(screen.getByRole('button', { name: 'Create event' }))

    await waitFor(() => expect(mockedPost).toHaveBeenCalled())
    expect(mockedPost.mock.calls[0]?.[0]).toBe('http://localhost:3000/api/v1/events')
    expect(mockedPost.mock.calls[0]?.[1]).toMatchObject({ event: { password: 'safe-password' } })
  })

  it('requires consent when no password is set', () => {
    renderForm()

    fireEvent.change(screen.getByLabelText('Event Name'), { target: { value: 'Year-End Party' } })
    fireEvent.click(screen.getByRole('button', { name: 'Plan an event' }))

    expect(screen.getByRole('checkbox', { name: /anyone with the event link/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Create event' }))
    expect(
      screen.getByText('Please confirm that anyone with the event link can edit or delete it.'),
    ).toBeInTheDocument()
    expect(mockedPost).not.toHaveBeenCalled()
  })

  it('rejects an event password longer than 48 characters', () => {
    renderForm()

    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: 'a'.repeat(49) } })
    fireEvent.click(screen.getByRole('button', { name: 'Plan an event' }))

    expect(screen.getByText('Password must be at most 48 characters.')).toBeInTheDocument()
    expect(mockedPost).not.toHaveBeenCalled()
  })

  it('shows a timeout error and re-enables submission', async () => {
    mockedIsAxiosError.mockReturnValueOnce(true)
    mockedPost.mockRejectedValueOnce({ code: 'ECONNABORTED' })
    renderForm()

    fireEvent.change(screen.getByLabelText('Event Name'), { target: { value: 'Year-End Party' } })
    fireEvent.click(screen.getByRole('button', { name: 'Plan an event' }))
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: 'Create event' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The request timed out. Please check your connection and try again.',
    )
    expect(screen.getByRole('button', { name: 'Create event' })).not.toBeDisabled()
  })
})
