import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import HowItWorksModal from './HowItWorksModal'

describe('HowItWorksModal', () => {
  it('moves between steps with the navigation buttons', () => {
    render(<HowItWorksModal onClose={vi.fn()} />)

    expect(screen.getByRole('dialog', { name: 'Compare local times' })).toBeInTheDocument()
    expect(
      screen.getByText('Compare local times across cities, then click or tap a time cell to add it as an option.'),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Next step' }))
    expect(screen.getByRole('dialog', { name: 'Create an event' })).toBeInTheDocument()
    expect(screen.getByText('Event name')).toBeInTheDocument()
    expect(screen.getByText('Description (optional)')).toBeInTheDocument()
    expect(screen.getByText('Add an event name and optional details, then create your event.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Next step' }))
    expect(screen.getByRole('dialog', { name: 'Share the link' })).toBeInTheDocument()
    expect(screen.getByText('Add your availability')).toBeInTheDocument()
    expect(screen.getByText('Oct 4, 4:00 PM')).toBeInTheDocument()
    expect(screen.getByText('Oct 5, 5:00 PM')).toBeInTheDocument()
    expect(screen.getByText('Share the event link so people can respond with their availability.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Next step' }))
    expect(screen.getByRole('dialog', { name: 'Choose a time that works' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Previous step' }))
    expect(screen.getByRole('dialog', { name: 'Share the link' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Go to step 4' }))
    expect(screen.getByRole('dialog', { name: 'Choose a time that works' })).toBeInTheDocument()
    expect(
      screen.getByText('Once everyone has responded, compare the results and choose the best time.'),
    ).toBeInTheDocument()
  })

  it('moves to the next step with a horizontal swipe', () => {
    render(<HowItWorksModal onClose={vi.fn()} />)

    const illustration = screen.getByRole('img', { name: 'Compare local times illustration' }).parentElement!
    fireEvent.touchStart(illustration, { touches: [{ clientX: 220, clientY: 80 }] })
    fireEvent.touchEnd(illustration, { changedTouches: [{ clientX: 140, clientY: 82 }] })

    expect(screen.getByRole('dialog', { name: 'Create an event' })).toBeInTheDocument()
  })

  it('moves between steps with arrow keys and stays within the first and last steps', () => {
    render(<HowItWorksModal onClose={vi.fn()} />)

    const dialog = screen.getByRole('dialog', { name: 'Compare local times' })
    fireEvent.keyDown(dialog, { key: 'ArrowLeft' })
    expect(screen.getByRole('dialog', { name: 'Compare local times' })).toBeInTheDocument()

    fireEvent.keyDown(dialog, { key: 'ArrowRight' })
    expect(screen.getByRole('dialog', { name: 'Create an event' })).toBeInTheDocument()
    fireEvent.keyDown(screen.getByRole('dialog', { name: 'Create an event' }), { key: 'ArrowLeft' })
    expect(screen.getByRole('dialog', { name: 'Compare local times' })).toBeInTheDocument()

    fireEvent.keyDown(screen.getByRole('dialog', { name: 'Compare local times' }), { key: 'ArrowRight' })
    fireEvent.keyDown(screen.getByRole('dialog', { name: 'Create an event' }), { key: 'ArrowRight' })
    fireEvent.keyDown(screen.getByRole('dialog', { name: 'Share the link' }), { key: 'ArrowRight' })
    fireEvent.keyDown(screen.getByRole('dialog', { name: 'Choose a time that works' }), { key: 'ArrowRight' })
    expect(screen.getByRole('dialog', { name: 'Choose a time that works' })).toBeInTheDocument()
  })

  it('closes with Escape and from the final step', () => {
    const onClose = vi.fn()
    render(<HowItWorksModal onClose={onClose} />)

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()

    fireEvent.click(screen.getByRole('button', { name: 'Next step' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next step' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next step' }))
    fireEvent.click(screen.getByRole('button', { name: 'Done' }))
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
