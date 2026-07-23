import { useState } from 'react'
import { useToast } from './Toast'
import type { Node, Edge } from '@xyflow/react'
import { ICON } from '../constants'
import { StorageError } from '../errors'

const STORAGE_KEY = 'cyto-logic-circuits'

interface SavedCircuit {
  name: string
  nodes: Node[]
  edges: Edge[]
  savedAt: number
}

interface Template {
  name: string
  nodes: Node[]
  edges: Edge[]
}

const TEMPLATES: Template[] = [
  { name: 'AND Gate', nodes: [
    { id: 't1', type: 'gateNode', position: { x: 80, y: 160 }, data: { type: 'INPUT', label: 'aTc' } },
    { id: 't2', type: 'gateNode', position: { x: 80, y: 280 }, data: { type: 'INPUT', label: 'AraC' } },
    { id: 't3', type: 'gateNode', position: { x: 300, y: 220 }, data: { type: 'AND', label: 'AND gate' } },
    { id: 't4', type: 'gateNode', position: { x: 520, y: 220 }, data: { type: 'OUTPUT', label: 'GFP' } },
  ], edges: [
    { id: 'te1', source: 't1', target: 't3', targetHandle: 'a', animated: true },
    { id: 'te2', source: 't2', target: 't3', targetHandle: 'b', animated: true },
    { id: 'te3', source: 't3', target: 't4', animated: true },
  ]},
  { name: 'NOT Gate', nodes: [
    { id: 'tn1', type: 'gateNode', position: { x: 80, y: 200 }, data: { type: 'INPUT', label: 'Input' } },
    { id: 'tn2', type: 'gateNode', position: { x: 300, y: 200 }, data: { type: 'NOT', label: 'Inverter' } },
    { id: 'tn3', type: 'gateNode', position: { x: 520, y: 200 }, data: { type: 'OUTPUT', label: 'Output' } },
  ], edges: [
    { id: 'tne1', source: 'tn1', target: 'tn2', animated: true },
    { id: 'tne2', source: 'tn2', target: 'tn3', animated: true },
  ]},
  { name: 'OR Gate', nodes: [
    { id: 'to1', type: 'gateNode', position: { x: 80, y: 160 }, data: { type: 'INPUT', label: 'A' } },
    { id: 'to2', type: 'gateNode', position: { x: 80, y: 280 }, data: { type: 'INPUT', label: 'B' } },
    { id: 'to3', type: 'gateNode', position: { x: 300, y: 220 }, data: { type: 'OR', label: 'OR gate' } },
    { id: 'to4', type: 'gateNode', position: { x: 520, y: 220 }, data: { type: 'OUTPUT', label: 'Output' } },
  ], edges: [
    { id: 'toe1', source: 'to1', target: 'to3', targetHandle: 'a', animated: true },
    { id: 'toe2', source: 'to2', target: 'to3', targetHandle: 'b', animated: true },
    { id: 'toe3', source: 'to3', target: 'to4', animated: true },
  ]},
]

interface CircuitsPanelProps {
  nodes: Node[]
  edges: Edge[]
  onLoad: (nodes: Node[], edges: Edge[]) => void
}

export default function CircuitsPanel({ nodes, edges, onLoad }: CircuitsPanelProps) {
  const toast = useToast()
  const [showSaved, setShowSaved] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [savedCircuits, setSavedCircuits] = useState<SavedCircuit[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as SavedCircuit[] }
    catch { return [] }
  })

  const persistSaved = (list: SavedCircuit[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    } catch (e) {
      const err = e instanceof StorageError ? e : new StorageError('Could not save circuit (storage may be full)')
      toast(err.message, 'error')
      return
    }
    setSavedCircuits(list)
  }

  const handleSave = () => {
    const name = saveName.trim()
    if (!name) { toast('Enter a circuit name', 'warning'); return }
    const data: SavedCircuit = { name, nodes, edges, savedAt: Date.now() }
    const existing = savedCircuits.findIndex((c) => c.name === name)
    let updated: SavedCircuit[]
    if (existing >= 0) {
      updated = [...savedCircuits]
      updated[existing] = data
    } else {
      updated = [...savedCircuits, data]
    }
    persistSaved(updated)
    setSaveName('')
    toast(`Saved "${name}"`, 'success')
  }

  const handleLoad = (circuit: SavedCircuit) => {
    onLoad(circuit.nodes, circuit.edges)
    toast(`Loaded "${circuit.name}"`, 'info')
  }

  const handleDelete = (name: string) => {
    persistSaved(savedCircuits.filter((c) => c.name !== name))
    toast(`Deleted "${name}"`, 'info')
  }

  const handleTemplate = (t: Template) => {
    onLoad(t.nodes, t.edges)
    toast(`Loaded "${t.name}" template`, 'info')
  }

  const sectionHeaderClass = 'text-section font-bold text-text-tertiary uppercase cursor-pointer select-none px-outer py-2 border-b border-border transition-[color] duration-150 hover:text-text-secondary tracking-[5px]'

  return (
    <div className="border-t border-border mt-auto">
      <div className={sectionHeaderClass} onClick={() => setShowTemplates(!showTemplates)}>
        {showTemplates ? ICON.EXPAND_DOWN : ICON.EXPAND_RIGHT} Templates
      </div>
      {showTemplates && (
        <div className="px-outer py-2">
          {TEMPLATES.map((t) => (
            <button key={t.name} onClick={() => handleTemplate(t)}
              className="circuit-btn w-full text-left px-2.5 py-1.5 mb-1 bg-surface border border-border rounded-input text-small text-text-secondary cursor-pointer transition-[background] duration-150">
              {t.name}
            </button>
          ))}
        </div>
      )}

      <div className={sectionHeaderClass} onClick={() => setShowSaved(!showSaved)}>
        {showSaved ? ICON.EXPAND_DOWN : ICON.EXPAND_RIGHT} Saved
      </div>
      {showSaved && (
        <div className="px-outer py-2 max-h-[200px] overflow-y-auto">
          <div className="flex gap-1 mb-2">
            <input value={saveName} onChange={(e) => setSaveName(e.target.value)}
              placeholder="Circuit name"
              className="flex-1 px-2 py-1.5 text-small bg-input border border-input-border rounded-input text-text-primary outline-none font-body"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <button onClick={handleSave}
              className="px-2.5 py-1.5 bg-primary text-text-primary border-none rounded-input cursor-pointer text-small font-semibold whitespace-nowrap">
              Save
            </button>
          </div>
          {savedCircuits.length === 0 && (
            <div className="text-section text-text-tertiary text-center py-2">
              No saved circuits
            </div>
          )}
          {savedCircuits.map((c) => (
            <div key={c.name} className="flex gap-1 mb-1">
              <button onClick={() => handleLoad(c)}
                className="circuit-btn flex-1 text-left px-2.5 py-1.5 bg-surface border border-border rounded-input text-small text-text-secondary cursor-pointer transition-[background] duration-150">
                {c.name}
              </button>
              <button onClick={() => handleDelete(c.name)}
                className="delete-btn px-2 py-1.5 bg-transparent border border-border rounded-input cursor-pointer text-section text-text-tertiary">
                {ICON.DELETE}
              </button>
            </div>
          ))}
        </div>
      )}
      <style>{`
        .circuit-btn:hover { background: var(--color-surface-alt) !important; }
        .delete-btn:hover { color: var(--color-danger) !important; }
      `}</style>
    </div>
  )
}
