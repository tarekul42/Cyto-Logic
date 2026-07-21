import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactFlowProvider } from 'reactflow'
import GateNode from '../components/GateNode'

function renderInFlow(ui) {
  return render(<ReactFlowProvider>{ui}</ReactFlowProvider>)
}

describe('GateNode', () => {
  const baseProps = { id: 'n1', data: { type: 'AND', label: 'My AND', onLabelChange: vi.fn() } }

  it('renders the gate type and label', () => {
    renderInFlow(<GateNode {...baseProps} />)
    expect(screen.getByText('AND')).toBeInTheDocument()
    expect(screen.getByText('My AND')).toBeInTheDocument()
  })

  it('renders type icon from gateConfig (icon element)', () => {
    renderInFlow(<GateNode {...baseProps} />)
    expect(screen.getByText('AND')).toBeInTheDocument()
  })

  it('uses correct icon for INPUT type', () => {
    renderInFlow(<GateNode {...baseProps} data={{ type: 'INPUT', label: 'aTc', onLabelChange: vi.fn() }} />)
    expect(screen.getByText('INPUT')).toBeInTheDocument()
    expect(screen.getByText('aTc')).toBeInTheDocument()
  })

  it('uses correct icon for OUTPUT type', () => {
    renderInFlow(<GateNode {...baseProps} data={{ type: 'OUTPUT', label: 'GFP', onLabelChange: vi.fn() }} />)
    expect(screen.getByText('OUTPUT')).toBeInTheDocument()
    expect(screen.getByText('GFP')).toBeInTheDocument()
  })

  it('renders for NOT type', () => {
    renderInFlow(<GateNode {...baseProps} data={{ type: 'NOT', label: 'Inverter', onLabelChange: vi.fn() }} />)
    expect(screen.getByText('NOT')).toBeInTheDocument()
    expect(screen.getByText('Inverter')).toBeInTheDocument()
  })

  it('enters edit mode on double click and calls onLabelChange on save', async () => {
    const user = userEvent.setup()
    const onLabelChange = vi.fn()
    renderInFlow(<GateNode {...baseProps} data={{ type: 'AND', label: 'Old', onLabelChange }} />)

    await user.dblClick(screen.getByText('Old'))

    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
    expect(input).toHaveValue('Old')

    await user.clear(input)
    await user.type(input, 'NewLabel')
    await user.keyboard('{Enter}')

    expect(onLabelChange).toHaveBeenCalledWith('n1', 'NewLabel')
  })

  it('cancels editing on Escape', async () => {
    const user = userEvent.setup()
    const onLabelChange = vi.fn()
    renderInFlow(<GateNode {...baseProps} data={{ type: 'AND', label: 'Old', onLabelChange }} />)

    await user.dblClick(screen.getByText('Old'))
    const input = screen.getByRole('textbox')
    await user.clear(input)
    await user.type(input, 'NewLabel')
    await user.keyboard('{Escape}')

    expect(onLabelChange).not.toHaveBeenCalled()
    expect(screen.getByText('Old')).toBeInTheDocument()
  })

  it('does not call onLabelChange with empty trimmed label', async () => {
    const user = userEvent.setup()
    const onLabelChange = vi.fn()
    renderInFlow(<GateNode {...baseProps} data={{ type: 'AND', label: 'Old', onLabelChange }} />)

    await user.dblClick(screen.getByText('Old'))
    const input = screen.getByRole('textbox')
    await user.clear(input)
    await user.type(input, '   ')
    await user.keyboard('{Enter}')

    expect(onLabelChange).not.toHaveBeenCalled()
  })
})
