import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { ReactFlowProvider, type NodeProps, type Node } from '@xyflow/react'
import GateNode from '../components/GateNode'
import type { ReactNode } from 'react'

function renderInFlow(ui: ReactNode) {
  return render(<ReactFlowProvider>{ui}</ReactFlowProvider>)
}

function nodeProps(overrides: Partial<Record<string, unknown>> = {}): NodeProps<Node> {
  return {
    id: 'n1',
    type: 'gateNode',
    data: { type: 'AND', label: 'My AND', onLabelChange: vi.fn() },
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    isConnectable: true,
    selected: false,
    dragging: false,
    zIndex: 0,
    draggable: false,
    selectable: true,
    deletable: true,
    ...overrides,
  } as NodeProps<Node>
}

describe('GateNode', () => {
  it('renders the gate type and label', () => {
    renderInFlow(<GateNode {...nodeProps()} />)
    expect(screen.getByText('AND')).toBeInTheDocument()
    expect(screen.getByText('My AND')).toBeInTheDocument()
  })

  it('renders type icon from gateConfig', () => {
    renderInFlow(<GateNode {...nodeProps()} />)
    expect(screen.getByText('AND')).toBeInTheDocument()
  })

  it('uses correct icon for INPUT type', () => {
    renderInFlow(<GateNode {...nodeProps({ data: { type: 'INPUT', label: 'aTc', onLabelChange: vi.fn() } })} />)
    expect(screen.getByText('INPUT')).toBeInTheDocument()
    expect(screen.getByText('aTc')).toBeInTheDocument()
  })

  it('uses correct icon for OUTPUT type', () => {
    renderInFlow(<GateNode {...nodeProps({ data: { type: 'OUTPUT', label: 'GFP', onLabelChange: vi.fn() } })} />)
    expect(screen.getByText('OUTPUT')).toBeInTheDocument()
    expect(screen.getByText('GFP')).toBeInTheDocument()
  })

  it('renders for NOT type', () => {
    renderInFlow(<GateNode {...nodeProps({ data: { type: 'NOT', label: 'Inverter', onLabelChange: vi.fn() } })} />)
    expect(screen.getByText('NOT')).toBeInTheDocument()
    expect(screen.getByText('Inverter')).toBeInTheDocument()
  })

  it('enters edit mode on double click and calls onLabelChange on save', async () => {
    const onLabelChange = vi.fn()
    renderInFlow(<GateNode {...nodeProps({ data: { type: 'AND', label: 'Old', onLabelChange } })} />)

    await userEvent.dblClick(screen.getByText('Old'))

    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
    expect(input).toHaveValue('Old')

    await userEvent.clear(input)
    await userEvent.type(input, 'NewLabel')
    await userEvent.keyboard('{Enter}')

    expect(onLabelChange).toHaveBeenCalledWith('n1', 'NewLabel')
  })

  it('cancels editing on Escape', async () => {
    const onLabelChange = vi.fn()
    renderInFlow(<GateNode {...nodeProps({ data: { type: 'AND', label: 'Old', onLabelChange } })} />)

    await userEvent.dblClick(screen.getByText('Old'))
    const input = screen.getByRole('textbox')
    await userEvent.clear(input)
    await userEvent.type(input, 'NewLabel')
    await userEvent.keyboard('{Escape}')

    expect(onLabelChange).not.toHaveBeenCalled()
    expect(screen.getByText('Old')).toBeInTheDocument()
  })

  it('does not call onLabelChange with empty trimmed label', async () => {
    const onLabelChange = vi.fn()
    renderInFlow(<GateNode {...nodeProps({ data: { type: 'AND', label: 'Old', onLabelChange } })} />)

    await userEvent.dblClick(screen.getByText('Old'))
    const input = screen.getByRole('textbox')
    await userEvent.clear(input)
    await userEvent.type(input, '   ')
    await userEvent.keyboard('{Enter}')

    expect(onLabelChange).not.toHaveBeenCalled()
  })
})
