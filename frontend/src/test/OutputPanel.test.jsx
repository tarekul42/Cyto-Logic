import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OutputPanel from '../components/OutputPanel'
import { ToastProvider } from '../components/Toast'

const mockResult = {
  success: true,
  output_protein: 'GFP',
  parts: [
    { id: 'BBa_R0010', role: 'promoter' },
    { id: 'BBa_B0034', role: 'rbs' },
    { id: 'BBa_E0040', role: 'cds' },
    { id: 'BBa_B0015', role: 'terminator' },
  ],
  logic: 'A AND B',
  nodes: [{ type: 'INPUT' }, { type: 'INPUT' }, { type: 'AND' }, { type: 'OUTPUT' }],
  edges: [{}, {}, {}],
}

describe('OutputPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function renderWithToast(ui) {
    return render(<ToastProvider>{ui}</ToastProvider>)
  }

  it('shows empty state when no result', () => {
    renderWithToast(<OutputPanel result={null} />)
    expect(screen.getByText('Compile a circuit to see results')).toBeInTheDocument()
  })

  it('shows compilation error', () => {
    renderWithToast(<OutputPanel result={{ success: false, error: 'Syntax error' }} />)
    expect(screen.getByText('Compilation Error')).toBeInTheDocument()
    expect(screen.getByText('Syntax error')).toBeInTheDocument()
  })

  it('displays output protein and parts count', () => {
    renderWithToast(<OutputPanel result={mockResult} />)
    expect(screen.getByText('GFP')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('displays circuit summary (nodes, edges)', () => {
    renderWithToast(<OutputPanel result={mockResult} />)
    expect(screen.getByText(/4.*node/)).toBeInTheDocument()
    expect(screen.getByText(/3.*edge/)).toBeInTheDocument()
    expect(screen.getByText(/2.*input/)).toBeInTheDocument()
    expect(screen.getByText(/output/)).toBeInTheDocument()
  })

  it('renders parts list with IDs and role badges', () => {
    renderWithToast(<OutputPanel result={mockResult} />)
    expect(screen.getByText('BBa_R0010')).toBeInTheDocument()
    expect(screen.getByText('BBa_B0034')).toBeInTheDocument()
    expect(screen.getByText('BBa_E0040')).toBeInTheDocument()
    expect(screen.getByText('BBa_B0015')).toBeInTheDocument()

    const badges = document.querySelectorAll('[style*="text-transform: uppercase"]')
    const badgeTexts = Array.from(badges).map((b) => b.textContent)
    expect(badgeTexts).toContain('promoter')
    expect(badgeTexts).toContain('rbs')
    expect(badgeTexts).toContain('cds')
    expect(badgeTexts).toContain('terminator')
  })

  it('shows parts tab by default with part IDs', () => {
    renderWithToast(<OutputPanel result={mockResult} />)
    expect(screen.getByText('BBa_R0010')).toBeInTheDocument()
    expect(screen.getByText('BBa_B0034')).toBeInTheDocument()
  })

  it('switches to simulation tab', async () => {
    const user = userEvent.setup()
    renderWithToast(<OutputPanel result={mockResult} />)
    await user.click(screen.getByText('Simulation'))
    expect(screen.getByText('Run Simulation')).toBeInTheDocument()
  })

  it('opens export dropdown on click', async () => {
    const user = userEvent.setup()
    renderWithToast(<OutputPanel result={mockResult} />)
    const exportBtn = screen.getByText(/Export/)
    await user.click(exportBtn)
    expect(screen.getByText('SBOL')).toBeInTheDocument()
    expect(screen.getByText('DNA')).toBeInTheDocument()
    expect(screen.getByText('SVG')).toBeInTheDocument()
  })

  it('shows empty parts message when no parts', () => {
    renderWithToast(<OutputPanel result={{
      ...mockResult, parts: [],
    }} />)
    expect(screen.getByText('No parts found in this circuit.')).toBeInTheDocument()
  })
})
