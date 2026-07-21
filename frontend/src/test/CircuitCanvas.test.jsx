import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactFlowProvider } from 'reactflow'
import CircuitCanvas from '../components/CircuitCanvas'
import * as api from '../api/compilerApi'

vi.mock('../api/compilerApi', () => ({
  compileFromGraph: vi.fn(),
}))

function renderInFlow(ui) {
  return render(<ReactFlowProvider>{ui}</ReactFlowProvider>)
}

describe('CircuitCanvas', () => {
  const onResult = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders compile button', () => {
    renderInFlow(<CircuitCanvas onResult={onResult} />)
    expect(screen.getByText('Compile')).toBeInTheDocument()
  })

  it('renders new circuit button', () => {
    renderInFlow(<CircuitCanvas onResult={onResult} />)
    expect(screen.getByText('+ New Circuit')).toBeInTheDocument()
  })

  it('shows compile status text while compiling', async () => {
    const user = userEvent.setup()
    api.compileFromGraph.mockImplementation(() => new Promise(() => {}))

    renderInFlow(<CircuitCanvas onResult={onResult} />)
    await user.click(screen.getByText('Compile'))

    expect(screen.getByText('Compiling...')).toBeInTheDocument()
  })

  it('calls compileFromGraph and onResult on compile', async () => {
    const user = userEvent.setup()
    api.compileFromGraph.mockResolvedValue({ success: true, output_protein: 'GFP', parts: [] })

    renderInFlow(<CircuitCanvas onResult={onResult} />)
    await user.click(screen.getByText('Compile'))

    expect(api.compileFromGraph).toHaveBeenCalled()
    expect(onResult).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
  })

  it('handles compilation error', async () => {
    const user = userEvent.setup()
    api.compileFromGraph.mockRejectedValue(new Error('Server error'))

    renderInFlow(<CircuitCanvas onResult={onResult} />)
    await user.click(screen.getByText('Compile'))

    expect(onResult).toHaveBeenCalledWith({ success: false, error: 'Server error' })
  })

  it('shows success status after compile', async () => {
    const user = userEvent.setup()
    api.compileFromGraph.mockResolvedValue({ success: true, output_protein: 'GFP', parts: [] })

    renderInFlow(<CircuitCanvas onResult={onResult} />)
    await user.click(screen.getByText('Compile'))

    expect(await screen.findByText('\u2713 Compiled')).toBeInTheDocument()
  })

  it('shows confirmation when clicking + New Circuit', async () => {
    const user = userEvent.setup()
    renderInFlow(<CircuitCanvas onResult={onResult} />)
    await user.click(screen.getByText('+ New Circuit'))

    expect(screen.getByText('Clear all?')).toBeInTheDocument()
    expect(screen.getByText('Yes, clear')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('cancels clear circuit', async () => {
    const user = userEvent.setup()
    renderInFlow(<CircuitCanvas onResult={onResult} />)
    await user.click(screen.getByText('+ New Circuit'))
    await user.click(screen.getByText('Cancel'))

    expect(screen.queryByText('Clear all?')).not.toBeInTheDocument()
  })

  it('renders the React Flow background', () => {
    renderInFlow(<CircuitCanvas onResult={onResult} />)
    const container = document.querySelector('.react-flow')
    expect(container).toBeInTheDocument()
  })
})
