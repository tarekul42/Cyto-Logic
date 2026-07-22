import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'

vi.mock('axios')

const { compileCircuit, compileFromGraph, simulateCircuit } = await import('../api/compilerApi')

describe('compilerApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('compileCircuit', () => {
    it('sends logic string to /api/compile', async () => {
      (axios.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { success: true } })
      const result = await compileCircuit('A AND B')
      expect(axios.post).toHaveBeenCalledWith('/api/compile', { logic: 'A AND B' }, { timeout: 30000 })
      expect(result.success).toBe(true)
    })
  })

  describe('compileFromGraph', () => {
    it('sends nodes and edges to /api/compile', async () => {
      const nodes = [{ id: '1' }]
      const edges = [{ id: 'e1' }]
      ;(axios.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { success: true } })
      const result = await compileFromGraph(nodes, edges)
      expect(axios.post).toHaveBeenCalledWith('/api/compile', { nodes, edges }, { timeout: 30000 })
      expect(result.success).toBe(true)
    })
  })

  describe('simulateCircuit', () => {
    it('sends logic, inputs, t_span, dt to /api/simulate', async () => {
      ;(axios.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { success: true, times: [] } })
      const result = await simulateCircuit('A AND B', {}, [0, 50], 0.5)
      expect(axios.post).toHaveBeenCalledWith('/api/simulate', {
        logic: 'A AND B', inputs: {}, t_span: [0, 50], dt: 0.5,
      }, { timeout: 60000 })
      expect(result.success).toBe(true)
    })

    it('uses default parameters when not provided', async () => {
      ;(axios.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { success: true, times: [] } })
      await simulateCircuit('A')
      expect(axios.post).toHaveBeenCalledWith('/api/simulate', {
        logic: 'A', inputs: {}, t_span: [0, 100], dt: 1.0,
      }, { timeout: 60000 })
    })
  })
})
