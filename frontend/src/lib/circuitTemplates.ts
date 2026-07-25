import type { Node, Edge } from '@xyflow/react'

export interface CircuitTemplate {
  name: string
  nodes: Node[]
  edges: Edge[]
}

export const TEMPLATES: CircuitTemplate[] = [
  {
    name: 'AND Gate',
    nodes: [
      { id: 't1', type: 'gateNode', position: { x: 80, y: 160 }, data: { type: 'INPUT', label: 'aTc' } },
      { id: 't2', type: 'gateNode', position: { x: 80, y: 280 }, data: { type: 'INPUT', label: 'AraC' } },
      { id: 't3', type: 'gateNode', position: { x: 300, y: 220 }, data: { type: 'AND', label: 'AND gate' } },
      { id: 't4', type: 'gateNode', position: { x: 520, y: 220 }, data: { type: 'OUTPUT', label: 'GFP' } },
    ],
    edges: [
      { id: 'te1', source: 't1', target: 't3', targetHandle: 'a', animated: true },
      { id: 'te2', source: 't2', target: 't3', targetHandle: 'b', animated: true },
      { id: 'te3', source: 't3', target: 't4', animated: true },
    ],
  },
  {
    name: 'NOT Gate',
    nodes: [
      { id: 'tn1', type: 'gateNode', position: { x: 80, y: 200 }, data: { type: 'INPUT', label: 'Input' } },
      { id: 'tn2', type: 'gateNode', position: { x: 300, y: 200 }, data: { type: 'NOT', label: 'Inverter' } },
      { id: 'tn3', type: 'gateNode', position: { x: 520, y: 200 }, data: { type: 'OUTPUT', label: 'Output' } },
    ],
    edges: [
      { id: 'tne1', source: 'tn1', target: 'tn2', animated: true },
      { id: 'tne2', source: 'tn2', target: 'tn3', animated: true },
    ],
  },
  {
    name: 'OR Gate',
    nodes: [
      { id: 'to1', type: 'gateNode', position: { x: 80, y: 160 }, data: { type: 'INPUT', label: 'A' } },
      { id: 'to2', type: 'gateNode', position: { x: 80, y: 280 }, data: { type: 'INPUT', label: 'B' } },
      { id: 'to3', type: 'gateNode', position: { x: 300, y: 220 }, data: { type: 'OR', label: 'OR gate' } },
      { id: 'to4', type: 'gateNode', position: { x: 520, y: 220 }, data: { type: 'OUTPUT', label: 'Output' } },
    ],
    edges: [
      { id: 'toe1', source: 'to1', target: 'to3', targetHandle: 'a', animated: true },
      { id: 'toe2', source: 'to2', target: 'to3', targetHandle: 'b', animated: true },
      { id: 'toe3', source: 'to3', target: 'to4', animated: true },
    ],
  },
]
