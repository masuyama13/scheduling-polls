import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PasswordInput from './PasswordInput'

describe('PasswordInput', () => {
  it('toggles password visibility', () => {
    render(<PasswordInput aria-label="Password" value="secret" readOnly onChange={() => undefined} />)

    const input = screen.getByLabelText('Password')
    expect(input).toHaveAttribute('type', 'password')

    fireEvent.click(screen.getByRole('button', { name: 'Show password' }))
    expect(input).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: 'Hide password' })).toBeInTheDocument()
  })
})
