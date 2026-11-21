import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import EventCreateConfirmationModal from './EventCreateConfirmationModal'
import type { SelectedCity } from '../lib/worldClock'
import { TimeFormatProvider } from '../contexts/TimeFormatProvider.tsx'
import i18n from '../i18n/index.ts'

const cities: SelectedCity[] = [
  { key: 'vancouver', name: 'Vancouver', region: 'Canada', timeZone: 'America/Vancouver', primary: true },
  { key: 'tokyo', name: 'Tokyo', region: 'Japan', timeZone: 'Asia/Tokyo', primary: false },
]

const defaultProps = {
  name: 'Year-End Party',
  description: 'Celebrate together.',
  password: '',
  candidateInstants: [new Date('2026-10-01T18:00:00.000Z')],
  cities,
  onBack: vi.fn(),
  onConfirm: vi.fn(),
}

describe('EventCreateConfirmationModal', () => {
  afterEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('shows event details and local times for each selected city', () => {
    render(<EventCreateConfirmationModal {...defaultProps} />)

    expect(screen.getByRole('heading', { name: 'Confirm event details' })).toBeInTheDocument()
    expect(screen.getByText('Year-End Party')).toBeInTheDocument()
    expect(screen.getByText('Celebrate together.')).toBeInTheDocument()
    expect(screen.getByText(/Vancouver:/)).toBeInTheDocument()
    expect(screen.getByText(/Tokyo:/)).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', {
        name: 'I understand that anyone with the event link can edit or delete this event.',
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'terms of service' })).toHaveAttribute('href', '/terms')
    expect(screen.getByRole('link', { name: 'privacy policy' })).toHaveAttribute('href', '/privacy')
  })

  it('shows the Japanese consent sentence with linked policy names', async () => {
    await i18n.changeLanguage('ja')
    render(<EventCreateConfirmationModal {...defaultProps} />)

    expect(screen.getByText(/バンクーバー:/)).toBeInTheDocument()
    expect(screen.getByText(/東京:/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '利用規約' }).closest('p')?.textContent).toContain(
      'イベントを作成すると利用規約・プライバシーポリシーに同意したものとみなされます。',
    )
  })

  it('shows each city time in the selected 24-hour format', () => {
    localStorage.setItem('crosstimely.preferences', JSON.stringify({ timeFormat: '24-hour' }))
    render(
      <TimeFormatProvider>
        <EventCreateConfirmationModal {...defaultProps} />
      </TimeFormatProvider>,
    )

    expect(screen.getByText(/Thu, Oct 1 at 11:00$/)).toBeInTheDocument()
    expect(screen.getByText(/Fri, Oct 2 at 3:00$/)).toBeInTheDocument()
    expect(screen.queryByText(/AM|PM/)).not.toBeInTheDocument()
  })

  it('hides the consent checkbox when a password is set and requires consent otherwise', () => {
    const onConfirm = vi.fn()
    const { rerender } = render(<EventCreateConfirmationModal {...defaultProps} onConfirm={onConfirm} />)

    fireEvent.click(screen.getByRole('button', { name: 'Create event' }))
    expect(screen.getByText('Please confirm the checkbox to continue.')).toBeInTheDocument()
    expect(onConfirm).not.toHaveBeenCalled()

    rerender(<EventCreateConfirmationModal {...defaultProps} password="safe-password" onConfirm={onConfirm} />)

    expect(screen.queryByRole('checkbox', { name: /anyone with the event link/i })).not.toBeInTheDocument()
    expect(screen.getByText('•'.repeat('safe-password'.length))).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Create event' }))
    expect(onConfirm).toHaveBeenCalledWith(false)
  })
})
