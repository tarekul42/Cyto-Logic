import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CircuitsPanel from '../components/CircuitsPanel'
import { ToastProvider } from '../components/Toast'
import type { ReactNode } from 'react'
import type { Node, Edge } from '@xyflow/react'

function renderWithToast(ui: ReactNode) {
  return render(<ToastProvider>{ui}</ToastProvider>)
}

const mockNodes: Node[] = [{ id: '1', type: 'gateNode', position: { x: 0, y: 0 }, data: { type: 'INPUT', label: 'A' } }]
const mockEdges: Edge[] = []

describe('CircuitsPanel', () => {
  const onLoad = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  function templatesHeader() { return screen.getByText((c: string) => c.includes('Templates')) }
  function savedHeader() { return screen.getByText((c: string) => c.includes('Saved')) }

  it('renders Templates and Saved sections', () => {
    renderWithToast(<CircuitsPanel nodes={mockNodes} edges={mockEdges} onLoad={onLoad} />)
    expect(templatesHeader()).toBeInTheDocument()
    expect(savedHeader()).toBeInTheDocument()
  })

  it('shows template list when clicking Templates', async () => {
    const user = userEvent.setup()
    renderWithToast(<CircuitsPanel nodes={mockNodes} edges={mockEdges} onLoad={onLoad} />)

    await user.click(templatesHeader())
    expect(screen.getByText('AND Gate')).toBeInTheDocument()
    expect(screen.getByText('NOT Gate')).toBeInTheDocument()
    expect(screen.getByText('OR Gate')).toBeInTheDocument()
  })

  it('loads a template on click', async () => {
    const user = userEvent.setup()
    renderWithToast(<CircuitsPanel nodes={mockNodes} edges={mockEdges} onLoad={onLoad} />)

    await user.click(templatesHeader())
    await user.click(screen.getByText('AND Gate'))

    expect(onLoad).toHaveBeenCalled()
    const loadedNodes: Node[] = onLoad.mock.calls[0][0]
    const loadedEdges: Edge[] = onLoad.mock.calls[0][1]
    expect(loadedNodes.length).toBeGreaterThan(0)
    expect(loadedEdges.length).toBeGreaterThan(0)
  })

  it('saves a circuit to localStorage', async () => {
    const user = userEvent.setup()
    renderWithToast(<CircuitsPanel nodes={mockNodes} edges={mockEdges} onLoad={onLoad} />)

    await user.click(savedHeader())
    const input = screen.getByPlaceholderText('Circuit name')
    await user.type(input, 'My Circuit')
    await user.click(screen.getByText('Save'))

    const saved = JSON.parse(localStorage.getItem('cyto-logic-circuits')!)
    expect(saved).toHaveLength(1)
    expect(saved[0].name).toBe('My Circuit')
    expect(saved[0].nodes).toEqual(mockNodes)
  })

  it('shows saved circuits and loads them', async () => {
    const user = userEvent.setup()

    localStorage.setItem('cyto-logic-circuits', JSON.stringify([
      { name: 'Test Circuit', nodes: mockNodes, edges: mockEdges, savedAt: Date.now() },
    ]))

    renderWithToast(<CircuitsPanel nodes={mockNodes} edges={mockEdges} onLoad={onLoad} />)

    await user.click(savedHeader())
    expect(screen.getByText('Test Circuit')).toBeInTheDocument()

    await user.click(screen.getByText('Test Circuit'))
    expect(onLoad).toHaveBeenCalledWith(mockNodes, mockEdges)
  })

  it('deletes a saved circuit', async () => {
    const user = userEvent.setup()

    localStorage.setItem('cyto-logic-circuits', JSON.stringify([
      { name: 'Delete Me', nodes: mockNodes, edges: mockEdges, savedAt: Date.now() },
    ]))

    renderWithToast(<CircuitsPanel nodes={mockNodes} edges={mockEdges} onLoad={onLoad} />)

    await user.click(savedHeader())

    const deleteBtn = screen.getByText('\u2715')
    await user.click(deleteBtn)

    const saved = JSON.parse(localStorage.getItem('cyto-logic-circuits')!)
    expect(saved).toHaveLength(0)
    expect(screen.queryByText('Delete Me')).not.toBeInTheDocument()
  })

  it('shows empty state when no saved circuits', async () => {
    const user = userEvent.setup()
    renderWithToast(<CircuitsPanel nodes={mockNodes} edges={mockEdges} onLoad={onLoad} />)

    await user.click(savedHeader())
    expect(screen.getByText('No saved circuits')).toBeInTheDocument()
  })

  it('overwrites existing circuit with same name', async () => {
    const user = userEvent.setup()

    localStorage.setItem('cyto-logic-circuits', JSON.stringify([
      { name: 'Duplicate', nodes: [], edges: [], savedAt: Date.now() },
    ]))

    renderWithToast(<CircuitsPanel nodes={mockNodes} edges={mockEdges} onLoad={onLoad} />)

    await user.click(savedHeader())
    const input = screen.getByPlaceholderText('Circuit name')
    await user.type(input, 'Duplicate')
    await user.click(screen.getByText('Save'))

    const saved = JSON.parse(localStorage.getItem('cyto-logic-circuits')!)
    expect(saved).toHaveLength(1)
    expect(saved[0].nodes).toEqual(mockNodes)
  })

  it('shows warning when saving with empty name', async () => {
    const user = userEvent.setup()
    renderWithToast(<CircuitsPanel nodes={mockNodes} edges={mockEdges} onLoad={onLoad} />)

    await user.click(savedHeader())
    await user.click(screen.getByText('Save'))

    const saved = JSON.parse(localStorage.getItem('cyto-logic-circuits') || '[]')
    expect(saved).toHaveLength(0)
  })

  it('saves on Enter key', async () => {
    const user = userEvent.setup()
    renderWithToast(<CircuitsPanel nodes={mockNodes} edges={mockEdges} onLoad={onLoad} />)

    await user.click(savedHeader())
    const input = screen.getByPlaceholderText('Circuit name')
    await user.type(input, 'Enter Save{Enter}')

    const saved = JSON.parse(localStorage.getItem('cyto-logic-circuits')!)
    expect(saved).toHaveLength(1)
    expect(saved[0].name).toBe('Enter Save')
  })
})
