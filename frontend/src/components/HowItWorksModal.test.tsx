import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import HowItWorksModal from './HowItWorksModal'

describe('HowItWorksModal', () => {
  it('moves between steps with the navigation buttons', () => {
    render(<HowItWorksModal onClose={vi.fn()} />)

    expect(screen.getByRole('dialog', { name: 'Compare local times' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Next step' }))
    expect(screen.getByRole('dialog', { name: 'Choose possible times' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Next step' }))
    expect(screen.getByRole('dialog', { name: 'Create and share an event' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Previous step' }))
    expect(screen.getByRole('dialog', { name: 'Choose possible times' })).toBeInTheDocument()

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

    expect(screen.getByRole('dialog', { name: 'Choose possible times' })).toBeInTheDocument()
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
