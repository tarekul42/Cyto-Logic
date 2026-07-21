import { useState, useCallback, useRef, useEffect } from 'react'

export function useUndoRedo(initialNodes, initialEdges) {
  const past = useRef([])
  const future = useRef([])
  const [nodes, setNodes] = useState(initialNodes)
  const [edges, setEdges] = useState(initialEdges)
  const ignoreNext = useRef(false)

  const pushState = useCallback((nextNodes, nextEdges) => {
    if (ignoreNext.current) {
      ignoreNext.current = false
      return
    }
    past.current.push({ nodes: structuredClone(nodes), edges: structuredClone(edges) })
    if (past.current.length > 50) past.current.shift()
    future.current = []
  }, [nodes, edges])

  const setNodesWithHistory = useCallback((updater) => {
    setNodes((prev) => {
      if (typeof updater === 'function') {
        const next = updater(prev)
        return next
      }
      return updater
    })
  }, [])

  const setEdgesWithHistory = useCallback((updater) => {
    setEdges((prev) => {
      if (typeof updater === 'function') {
        return updater(prev)
      }
      return updater
    })
  }, [])

  const undo = useCallback(() => {
    if (past.current.length === 0) return false
    const prev = past.current.pop()
    future.current.push({ nodes: structuredClone(nodes), edges: structuredClone(edges) })
    ignoreNext.current = true
    setNodes(prev.nodes)
    setEdges(prev.edges)
    return true
  }, [nodes, edges])

  const redo = useCallback(() => {
    if (future.current.length === 0) return false
    const next = future.current.pop()
    past.current.push({ nodes: structuredClone(nodes), edges: structuredClone(edges) })
    ignoreNext.current = true
    setNodes(next.nodes)
    setEdges(next.edges)
    return true
  }, [nodes, edges])

  const canUndo = past.current.length > 0
  const canRedo = future.current.length > 0

  return {
    nodes,
    setNodes: setNodesWithHistory,
    edges,
    setEdges: setEdgesWithHistory,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    rawSetNodes: setNodes,
    rawSetEdges: setEdges,
  }
}
