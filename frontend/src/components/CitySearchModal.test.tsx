import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CITY_CATALOG } from '../data/cityCatalog.ts'
import CitySearchModal from './CitySearchModal'

describe('CitySearchModal', () => {
  it("shows each city's current local time", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-30T20:05:00Z'))

    try {
      render(
        <CitySearchModal
          title="Search cities"
          inputLabel="Search cities"
          placeholder="Search by city or country"
          cities={CITY_CATALOG.filter((city) => ['vancouver', 'tokyo'].includes(city.key))}
          onSelect={vi.fn()}
          onClose={vi.fn()}
        />,
      )

      expect(screen.getByRole('button', { name: /Vancouver.*1:05 PM/s })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Tokyo.*5:05 AM/s })).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('selects a highlighted result with arrow keys and Enter', () => {
    const onSelect = vi.fn()

    render(
      <CitySearchModal
        title="Search cities"
        inputLabel="Search cities"
        placeholder="Search by city or country"
        cities={CITY_CATALOG}
        onSelect={onSelect}
        onClose={vi.fn()}
      />,
    )

    const search = screen.getByRole('searchbox', { name: 'Search cities' })
    fireEvent.change(search, { target: { value: 'Canada' } })
    fireEvent.keyDown(search, { key: 'ArrowDown' })
    fireEvent.keyDown(search, { key: 'Enter' })

    expect(onSelect).toHaveBeenCalledWith(CITY_CATALOG.find((city) => city.name === 'Toronto'))
  })

  it('selects a result by clicking it and closes from the backdrop', () => {
    const onSelect = vi.fn()
    const onClose = vi.fn()

    render(
      <CitySearchModal
        title="Search cities"
        inputLabel="City or country"
        placeholder="Tokyo or Canada"
        cities={CITY_CATALOG}
        onSelect={onSelect}
        onClose={onClose}
      />,
    )

    const dialog = screen.getByRole('dialog', { name: 'Search cities' })
    fireEvent.change(screen.getByRole('searchbox', { name: 'City or country' }), { target: { value: 'Tokyo' } })
    fireEvent.click(within(dialog).getByRole('button', { name: /Tokyo/ }))
    fireEvent.click(screen.getByRole('presentation').firstElementChild!)

    expect(onSelect).toHaveBeenCalledWith(CITY_CATALOG.find((city) => city.name === 'Tokyo'))
    expect(onClose).toHaveBeenCalled()
  })

  it('shows a message when no cities match the search', () => {
    render(
      <CitySearchModal
        title="Search cities"
        inputLabel="Search cities"
        placeholder="Search by city or country"
        cities={CITY_CATALOG}
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    )

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search cities' }), { target: { value: 'Atlantis' } })

    expect(screen.getByText('No cities found.')).toBeInTheDocument()
  })
})
