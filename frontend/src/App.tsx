import { useState, useCallback } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import CircuitCanvas from './components/CircuitCanvas';
import PartsPanel from './components/PartsPanel';
import CircuitsPanel from './components/CircuitsPanel';
import OutputPanel from './components/OutputPanel';
import { ToastProvider } from './components/Toast';
import { theme } from './theme';
import type { Node, Edge } from '@xyflow/react';

export default function App() {
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
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
    <div style={{
      display: 'flex',
      height: '100vh',
      fontFamily: theme.font.body,
      background: theme.color.canvas,
      color: theme.color.textPrimary,
    }}>
      <div style={{
        width: theme.size.sidebar,
        flexShrink: 0,
        borderRight: `1px solid ${theme.color.border}`,
        background: theme.color.panel,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          padding: `${theme.size.space.inner}px ${theme.size.space.outer}px`,
          borderBottom: `1px solid ${theme.color.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: theme.size.space.gap,
          background: `linear-gradient(135deg, ${theme.color.panel} 0%, #0d1a2a 100%)`,
        }}>
          <img src="/cyto_logic.png" alt="Cyto Logic" style={{ width: 30, height: 30 }} />
          <span style={{
            fontSize: theme.size.font.brand,
            fontWeight: 600,
            color: theme.color.textPrimary,
            fontFamily: theme.font.brand,
            letterSpacing: '0.5px',
          }}>
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

      <div style={{ flex: 1, position: 'relative', background: theme.color.canvas }}>
        <ReactFlowProvider>
          <CircuitCanvas
            key={circuitKey}
            loadedCircuit={loadedCircuit}
            onCircuitChange={handleCircuitChange}
            onResult={setResult}
          />
        </ReactFlowProvider>
      </div>

      <div style={{
        width: theme.size.results,
        flexShrink: 0,
        borderLeft: `1px solid ${theme.color.border}`,
        background: theme.color.panel,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          padding: `${theme.size.space.inner}px ${theme.size.space.outer}px`,
          borderBottom: `1px solid ${theme.color.border}`,
          fontSize: theme.size.font.section,
          fontWeight: 700,
          color: theme.color.textTertiary,
          textTransform: 'uppercase',
          letterSpacing: '6px',
        }}>
          Results
        </div>
        <OutputPanel result={result} />
      </div>
    </div>
    </ToastProvider>
  );
}
