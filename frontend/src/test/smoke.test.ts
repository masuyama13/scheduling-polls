import { describe, expect, it } from 'vitest'

describe('frontend test environment', () => {
  it('provides a jsdom document and jest-dom matchers', () => {
    expect(document.body).toBeInTheDocument()
  })
})
