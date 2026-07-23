import { useState } from 'react'
import { useToast } from './Toast'
import type { Node, Edge } from '@xyflow/react'
import { ICON } from '../constants'
import { StorageError } from '../errors'
import { TEMPLATES } from '../lib/circuitTemplates'
import type { CircuitTemplate } from '../lib/circuitTemplates'

const STORAGE_KEY = 'cyto-logic-circuits'

interface SavedCircuit {
  name: string
  nodes: Node[]
  edges: Edge[]
  savedAt: number
}

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
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as SavedCircuit[]
    } catch {
      return []
    }
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

  const handleTemplate = (t: CircuitTemplate) => {
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
              className="w-full text-left px-2.5 py-1.5 mb-1 bg-surface border border-border rounded-input text-small text-text-secondary cursor-pointer hover:bg-surface-alt">
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
                className="flex-1 text-left px-2.5 py-1.5 bg-surface border border-border rounded-input text-small text-text-secondary cursor-pointer hover:bg-surface-alt">
                {c.name}
              </button>
              <button onClick={() => handleDelete(c.name)}
                className="px-2 py-1.5 bg-transparent border border-border rounded-input cursor-pointer text-section text-text-tertiary hover:text-danger">
                {ICON.DELETE}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
