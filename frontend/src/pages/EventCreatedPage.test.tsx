import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import EventCreatedPage from './EventCreatedPage'

describe('EventCreatedPage', () => {
  it('shows the share link and copies it', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })

    render(
      <MemoryRouter initialEntries={['/events/example-token/created']}>
        <Routes>
          <Route path="/events/:public_token/created" element={<EventCreatedPage />} />
        </Routes>
      </MemoryRouter>,
    )

    const shareLink = screen.getByRole('textbox', { name: 'Event share link' })
    expect(shareLink).toHaveValue(`${window.location.origin}/events/example-token`)

    fireEvent.click(screen.getByRole('button', { name: 'Copy event link' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Copied')
    expect(writeText).toHaveBeenCalledWith(shareLink.getAttribute('value'))
  })
})
