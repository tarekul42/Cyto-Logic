import { useRef, useCallback } from 'react'
import type { Node, Edge } from '@xyflow/react'

const MAX_HISTORY = 50

interface Snapshot {
  nodes: Node[]
  edges: Edge[]
}

interface History {
  past: Snapshot[]
  future: Snapshot[]
}

export function useCircuitHistory(nodes: Node[], edges: Edge[]) {
  const history = useRef<History>({ past: [], future: [] })

  const pushHistory = useCallback(() => {
    const h = history.current
    h.past.push({ nodes: structuredClone(nodes), edges: structuredClone(edges) })
    if (h.past.length > MAX_HISTORY) h.past.shift()
    h.future = []
  }, [nodes, edges])

  const undo = useCallback((): Snapshot | null => {
    const h = history.current
    if (h.past.length === 0) return null
    h.future.push({ nodes: structuredClone(nodes), edges: structuredClone(edges) })
    return h.past.pop()!
  }, [nodes, edges])

  const redo = useCallback((): Snapshot | null => {
    const h = history.current
    if (h.future.length === 0) return null
    h.past.push({ nodes: structuredClone(nodes), edges: structuredClone(edges) })
    return h.future.pop()!
  }, [nodes, edges])

  return { pushHistory, undo, redo }
}
