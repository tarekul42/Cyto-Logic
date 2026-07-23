import { useState, useCallback } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import CircuitCanvas from './components/CircuitCanvas';
import PartsPanel from './components/PartsPanel';
import CircuitsPanel from './components/CircuitsPanel';
import OutputPanel from './components/OutputPanel';
import SectionHeader from './components/SectionHeader';
import { ToastProvider } from './components/Toast';
import type { Node, Edge } from '@xyflow/react';
import type { CompileResult } from './api/compilerApi';

export default function App() {
  const [result, setResult] = useState<CompileResult | null>(null);
  const [circuitKey, setCircuitKey] = useState(0);
  const [loadedCircuit, setLoadedCircuit] = useState<{ nodes: Node[]; edges: Edge[] } | null>(null);
  const [currentCircuit, setCurrentCircuit] = useState<{ nodes: Node[]; edges: Edge[] }>({ nodes: [], edges: [] });

  const handleCircuitChange = useCallback((nodes: Node[], edges: Edge[]) => {
    setCurrentCircuit({ nodes, edges })
  }, []);

  const handleLoadCircuit = useCallback((nodes: Node[], edges: Edge[]) => {
    setLoadedCircuit({ nodes, edges })
    setCurrentCircuit({ nodes, edges })
    setCircuitKey((k) => k + 1)
  }, []);

  return (
    <ToastProvider>
    <div className="h-screen flex font-body bg-canvas text-text-primary">
      <div className="w-55 shrink-0 border-r border-border bg-panel flex flex-col">
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border"
          style={{ background: 'linear-gradient(135deg, var(--color-panel) 0%, #0d1a2a 100%)' }}>
          <img src="/cyto_logic.png" alt="Cyto Logic" className="size-logo" />
          <span className="text-xl font-semibold text-text-primary font-brand tracking-wide">
            cyto logic
          </span>
        </div>
        <PartsPanel />
        <CircuitsPanel
          nodes={currentCircuit.nodes}
          edges={currentCircuit.edges}
          onLoad={handleLoadCircuit}
        />
      </div>

      <div className="flex-1 relative bg-canvas">
        <ReactFlowProvider>
          <CircuitCanvas
            key={circuitKey}
            loadedCircuit={loadedCircuit}
            onCircuitChange={handleCircuitChange}
            onResult={setResult}
          />
        </ReactFlowProvider>
      </div>

      <div className="w-[320px] shrink-0 border-l border-border bg-panel flex flex-col">
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border">
          <SectionHeader className="mb-0">Results</SectionHeader>
        </div>
        <OutputPanel result={result} />
      </div>
    </div>
    </ToastProvider>
  );
}
