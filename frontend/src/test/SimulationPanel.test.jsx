import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as api from '../api/compilerApi'
import SimulationPanel from '../components/SimulationPanel'

vi.mock('../api/compilerApi', () => ({
  simulateCircuit: vi.fn(),
}))

describe('SimulationPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Run Simulation button', () => {
    render(<SimulationPanel logic="A AND B" />)
    expect(screen.getByText('Run Simulation')).toBeInTheDocument()
  })

  it('disables button when no logic provided', () => {
    render(<SimulationPanel logic={null} />)
    expect(screen.getByText('Run Simulation')).toBeDisabled()
  })

  it('shows empty state when no result', () => {
    render(<SimulationPanel logic="A AND B" />)
    expect(screen.getByText('Run a simulation to see time-series data')).toBeInTheDocument()
  })

  it('renders t_span and dt inputs', () => {
    render(<SimulationPanel logic="A AND B" />)
    const inputs = document.querySelectorAll('input[type="number"]')
    expect(inputs.length).toBeGreaterThanOrEqual(3)
  })

  it('calls simulateCircuit on button click', async () => {
    const user = userEvent.setup()
    api.simulateCircuit.mockResolvedValue({
      success: true, times: [0, 1, 2],
      trajectories: { GFP: [0, 1, 0] },
      species: ['GFP'], num_points: 3,
    })

    render(<SimulationPanel logic="A AND B" />)
    await user.click(screen.getByText('Run Simulation'))

    expect(api.simulateCircuit).toHaveBeenCalledWith(
      'A AND B', {}, [0, 100], 1.0
    )
  })

  it('displays error when simulation fails', async () => {
    const user = userEvent.setup()
    api.simulateCircuit.mockRejectedValue(new Error('Network error'))

    render(<SimulationPanel logic="A AND B" />)
    await user.click(screen.getByText('Run Simulation'))

    expect(await screen.findByText(/Network error/)).toBeInTheDocument()
  })

  it('displays backend error result', async () => {
    const user = userEvent.setup()
    api.simulateCircuit.mockResolvedValue({
      success: false, error: 'Simulation diverged',
    })

    render(<SimulationPanel logic="A AND B" />)
    await user.click(screen.getByText('Run Simulation'))

    expect(await screen.findByText('Simulation diverged')).toBeInTheDocument()
  })

  it('renders chart after successful simulation', async () => {
    const user = userEvent.setup()
    api.simulateCircuit.mockResolvedValue({
      success: true, times: [0, 1, 2],
      trajectories: { GFP: [0, 1, 0] },
      species: ['GFP'], num_points: 3,
    })

    render(<SimulationPanel logic="A AND B" />)
    await user.click(screen.getByText('Run Simulation'))

    expect(await screen.findByText(/Time-series/)).toBeInTheDocument()
    expect(screen.getByText('GFP')).toBeInTheDocument()
  })

  it('uses custom t_span and dt values', async () => {
    const user = userEvent.setup()
    api.simulateCircuit.mockResolvedValue({
      success: true, times: [0, 1],
      trajectories: { GFP: [0, 1] },
      species: ['GFP'], num_points: 2,
    })

    render(<SimulationPanel logic="A AND B" />)

    const inputs = document.querySelectorAll('input[type="number"]')
    const tStart = inputs[0]
    const tEnd = inputs[1]
    const dt = inputs[2]

    await user.clear(tStart)
    await user.type(tStart, '10')
    await user.clear(tEnd)
    await user.type(tEnd, '200')
    await user.clear(dt)
    await user.type(dt, '0.5')

    await user.click(screen.getByText('Run Simulation'))

    expect(api.simulateCircuit).toHaveBeenCalledWith(
      'A AND B', {}, [10, 200], 0.5
    )
  })
})
