import { useState } from 'react'
import { useToast } from './Toast'
import { theme } from '../theme'
import type { Node, Edge } from '@xyflow/react'

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
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

  const toggle = (): Record<string, string | number> => ({
    fontSize: theme.size.font.section, fontWeight: 700, color: theme.color.textTertiary,
    textTransform: 'uppercase', letterSpacing: '5px', cursor: 'pointer', userSelect: 'none',
    padding: `8px ${theme.size.space.outer}px`, borderBottom: `1px solid ${theme.color.border}`,
    transition: 'color 0.15s',
  })

  const btn: Record<string, string | number> = {
    padding: '6px 10px', marginBottom: 4, background: theme.color.surface,
    border: `1px solid ${theme.color.border}`, borderRadius: theme.size.radius.input,
    cursor: 'pointer', fontSize: theme.size.font.small, color: theme.color.textSecondary,
    textAlign: 'left', transition: 'background 0.15s',
  }

  return (
    <div style={{ borderTop: `1px solid ${theme.color.border}`, marginTop: 'auto' }}>
      <div style={toggle(showTemplates)} onClick={() => setShowTemplates(!showTemplates)}>
        {showTemplates ? '\u25BE' : '\u25B8'} Templates
      </div>
      {showTemplates && (
        <div style={{ padding: `8px ${theme.size.space.outer}px` }}>
          {TEMPLATES.map((t) => (
            <button key={t.name} onClick={() => handleTemplate(t)} style={btn}
              onMouseEnter={(e) => e.currentTarget.style.background = theme.color.surfaceAlt}
              onMouseLeave={(e) => e.currentTarget.style.background = theme.color.surface}>
              {t.name}
            </button>
          ))}
        </div>
      )}

      <div style={toggle(showSaved)} onClick={() => setShowSaved(!showSaved)}>
        {showSaved ? '\u25BE' : '\u25B8'} Saved
      </div>
      {showSaved && (
        <div style={{ padding: `8px ${theme.size.space.outer}px`, maxHeight: 200, overflowY: 'auto' }}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
            <input value={saveName} onChange={(e) => setSaveName(e.target.value)}
              placeholder="Circuit name"
              style={{
                flex: 1, padding: '5px 8px', fontSize: theme.size.font.small,
                background: theme.color.input, border: `1px solid ${theme.color.inputBorder}`,
                borderRadius: theme.size.radius.input, color: theme.color.textPrimary,
                outline: 'none', fontFamily: theme.font.body,
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <button onClick={handleSave} style={{
              padding: '5px 10px', background: theme.color.primary, color: theme.color.textPrimary,
              border: 'none', borderRadius: theme.size.radius.input, cursor: 'pointer',
              fontSize: theme.size.font.small, fontWeight: 600, whiteSpace: 'nowrap',
            }}>
              Save
            </button>
          </div>
          {savedCircuits.length === 0 && (
            <div style={{ fontSize: theme.size.font.section, color: theme.color.textTertiary, textAlign: 'center', padding: 8 }}>
              No saved circuits
            </div>
          )}
          {savedCircuits.map((c) => (
            <div key={c.name} style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
              <button onClick={() => handleLoad(c)} style={{ ...btn, flex: 1, marginBottom: 0 }}
                onMouseEnter={(e) => e.currentTarget.style.background = theme.color.surfaceAlt}
                onMouseLeave={(e) => e.currentTarget.style.background = theme.color.surface}>
                {c.name}
              </button>
              <button onClick={() => handleDelete(c.name)} style={{
                padding: '6px 8px', background: 'transparent',
                border: `1px solid ${theme.color.border}`, borderRadius: theme.size.radius.input,
                cursor: 'pointer', fontSize: theme.size.font.section, color: theme.color.textTertiary,
              }}
                onMouseEnter={(e) => e.currentTarget.style.color = theme.color.danger}
                onMouseLeave={(e) => e.currentTarget.style.color = theme.color.textTertiary}>
                &#x2715;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
