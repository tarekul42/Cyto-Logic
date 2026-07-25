import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { MockedFunction } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { ReactFlowProvider } from '@xyflow/react'
import CircuitCanvas from '../components/CircuitCanvas'
import { ToastProvider } from '../components/Toast'
import type { ReactNode } from 'react'
import { compileFromGraph } from '../api/compilerApi'
import type { CompileResult } from '../api/compilerApi'

vi.mock('../api/compilerApi', () => ({
  compileFromGraph: vi.fn(),
}))

const mockCompile = compileFromGraph as MockedFunction<typeof compileFromGraph>

function renderInFlow(ui: ReactNode) {
  return render(<ReactFlowProvider><ToastProvider>{ui}</ToastProvider></ReactFlowProvider>)
}

function renderCanvas() {
  const onResult = vi.fn()
  const onCircuitChange = vi.fn()
  renderInFlow(<CircuitCanvas onResult={onResult} onCircuitChange={onCircuitChange} loadedCircuit={null} />)
  return { onResult, onCircuitChange }
}

const successResult: CompileResult = { success: true, output_protein: 'GFP', parts: [] }

describe('CircuitCanvas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders compile button', () => {
    renderCanvas()
    expect(screen.getByText('Compile')).toBeInTheDocument()
  })

  it('renders new circuit button', () => {
    renderCanvas()
    expect(screen.getByText('+ New Circuit')).toBeInTheDocument()
  })

  it('shows compile status text while compiling', async () => {
    mockCompile.mockImplementation(() => new Promise(() => {}))
    renderCanvas()

    await userEvent.click(screen.getByText('Compile'))

    expect(screen.getByText('Compiling...')).toBeInTheDocument()
  })

  it('calls compileFromGraph and onResult on compile', async () => {
    mockCompile.mockResolvedValue(successResult)
    const { onResult } = renderCanvas()

    await userEvent.click(screen.getByText('Compile'))

    expect(compileFromGraph).toHaveBeenCalled()
    expect(onResult).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
  })

  it('handles compilation error', async () => {
    mockCompile.mockRejectedValue(new Error('Server error'))
    const { onResult } = renderCanvas()

    await userEvent.click(screen.getByText('Compile'))

    expect(onResult).toHaveBeenCalledWith({ success: false, error: 'Server error' })
  })

  it('shows success status after compile', async () => {
    mockCompile.mockResolvedValue(successResult)
    renderCanvas()

    await userEvent.click(screen.getByText('Compile'))

    expect(await screen.findByText('\u2713 Compiled')).toBeInTheDocument()
  })

  it('shows confirmation when clicking + New Circuit', async () => {
    renderCanvas()

    await userEvent.click(screen.getByText('+ New Circuit'))

    expect(screen.getByText('Clear all?')).toBeInTheDocument()
    expect(screen.getByText('Yes, clear')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('cancels clear circuit', async () => {
    renderCanvas()

    await userEvent.click(screen.getByText('+ New Circuit'))
    await userEvent.click(screen.getByText('Cancel'))

    expect(screen.queryByText('Clear all?')).not.toBeInTheDocument()
  })

  it('renders the React Flow background', () => {
    renderCanvas()
    const container = document.querySelector('.react-flow')
    expect(container).toBeInTheDocument()
  })
})
