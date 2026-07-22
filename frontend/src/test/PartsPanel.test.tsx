import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PartsPanel from '../components/PartsPanel'

describe('PartsPanel', () => {
  it('renders all five gate types', () => {
    render(<PartsPanel />)
    expect(screen.getByText('Input')).toBeInTheDocument()
    expect(screen.getByText('AND')).toBeInTheDocument()
    expect(screen.getByText('OR')).toBeInTheDocument()
    expect(screen.getByText('NOT')).toBeInTheDocument()
    expect(screen.getByText('Output')).toBeInTheDocument()
  })

  it('renders gate section title', () => {
    render(<PartsPanel />)
    expect(screen.getByText('Gates')).toBeInTheDocument()
  })

  it('all items are draggable', () => {
    render(<PartsPanel />)
    const items = screen.getAllByText(/AND|OR|NOT/)
    for (const item of items) {
      expect(item.closest('[draggable="true"]') || item.parentElement?.closest('[draggable="true"]')).toBeTruthy()
    }
  })

  it('has drag handle icons', () => {
    render(<PartsPanel />)
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThanOrEqual(5)
  })
})
