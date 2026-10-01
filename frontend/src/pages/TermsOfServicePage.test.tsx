import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import TermsOfServicePage from './TermsOfServicePage'

describe('TermsOfServicePage', () => {
  it('shows the terms of service page', () => {
    const { container } = render(<TermsOfServicePage />)

    expect(screen.getByRole('heading', { name: 'Terms of Service' })).toBeInTheDocument()
    expect(container).toHaveTextContent('CrossTime')
  })
})
