import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import EventCreatedPage from './EventCreatedPage'
import i18n from '../i18n/index.ts'

describe('EventCreatedPage', () => {
  afterEach(async () => {
    await i18n.changeLanguage('en')
  })

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

  it('shows Japanese creation and sharing copy', async () => {
    await i18n.changeLanguage('ja')

    render(
      <MemoryRouter initialEntries={['/events/example-token/created']}>
        <Routes>
          <Route path="/events/:public_token/created" element={<EventCreatedPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'イベントを作成しました！' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'イベントの共有リンク' })).toHaveValue(
      `${window.location.origin}/events/example-token`,
    )
    expect(screen.getByRole('button', { name: 'イベントのリンクをコピー' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'イベントページを見る' })).toHaveAttribute('href', '/events/example-token')
  })
})
