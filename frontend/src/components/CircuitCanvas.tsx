import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Background,
  BackgroundVariant,
  MiniMap,
  type Node,
  type Edge,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import GateNode from './GateNode';
import Spinner from './Spinner';
import { compileFromGraph } from '../api/compilerApi';
import type { CompileResult } from '../api/compilerApi';
import { gateConfig } from '../theme';
import { useToast } from './Toast';
import { useCircuitHistory } from '../hooks/useCircuitHistory';
import { ICON } from '../constants';

export type { Node, Edge }

const nodeTypes = { gateNode: GateNode };

const initialNodes: Node[] = [
  { id: '1', type: 'gateNode', position: { x: 80,  y: 120 }, data: { type: 'INPUT',  label: 'aTc' } },
  { id: '2', type: 'gateNode', position: { x: 80,  y: 240 }, data: { type: 'INPUT',  label: 'AraC' } },
  { id: '3', type: 'gateNode', position: { x: 280, y: 180 }, data: { type: 'AND',    label: 'AND gate' } },
  { id: '4', type: 'gateNode', position: { x: 480, y: 180 }, data: { type: 'OUTPUT', label: 'GFP' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-3', source: '1', target: '3', targetHandle: 'a', animated: true },
  { id: 'e2-3', source: '2', target: '3', targetHandle: 'b', animated: true },
  { id: 'e3-4', source: '3', target: '4', animated: true },
];

function compileLabel(status: string, isCompiling: boolean): string {
  if (status === 'success') return `${ICON.CHECK} Compiled`
  if (status === 'error') return `${ICON.CROSS} Failed`
  return isCompiling ? 'Compiling...' : 'Compile'
}

interface CircuitCanvasProps {
  loadedCircuit: { nodes: Node[]; edges: Edge[] } | null
  onCircuitChange: (nodes: Node[], edges: Edge[]) => void
  onResult: (result: CompileResult) => void
}

export default function CircuitCanvas({ loadedCircuit, onCircuitChange, onResult }: CircuitCanvasProps) {
  const startNodes = loadedCircuit ? loadedCircuit.nodes : initialNodes;
  const startEdges = loadedCircuit ? loadedCircuit.edges : initialEdges;
  const [nodes, setNodes, onNodesChange] = useNodesState(startNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(startEdges);
  const [isCompiling, setIsCompiling] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [compileStatus, setCompileStatus] = useState<'idle' | 'compiling' | 'success' | 'error'>('idle');
  const toast = useToast();
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { pushHistory, undo: historyUndo, redo: historyRedo } = useCircuitHistory(nodes, edges);
  const compileTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    onCircuitChange?.(nodes, edges)
  }, [nodes, edges, onCircuitChange])

  useEffect(() => {
    return () => {
      if (compileTimer.current) clearTimeout(compileTimer.current)
    }
  }, [])

  const undo = useCallback(() => {
    const snapshot = historyUndo()
    if (!snapshot) return
    setNodes(snapshot.nodes)
    setEdges(snapshot.edges)
    toast('Undo', 'info', 1500)
  }, [setNodes, setEdges, historyUndo, toast])

  const redo = useCallback(() => {
    const snapshot = historyRedo()
    if (!snapshot) return
    setNodes(snapshot.nodes)
    setEdges(snapshot.edges)
    toast('Redo', 'info', 1500)
  }, [setNodes, setEdges, historyRedo, toast])

  const handleLabelChange = useCallback((nodeId: string, newLabel: string) => {
    pushHistory()
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, label: newLabel } }
          : n
      )
    );
  }, [setNodes, pushHistory]);

  const nodesWithCallbacks = useMemo(
    () => nodes.map((n) => ({
      ...n,
      data: { ...n.data, onLabelChange: handleLabelChange },
    })),
    [nodes, handleLabelChange]
  );

  const handleCompile = useCallback(async () => {
    setIsCompiling(true);
    setCompileStatus('compiling');
    try {
      const result = await compileFromGraph(nodes, edges);
      onResult(result);
      setCompileStatus('success');
      toast('Circuit compiled successfully', 'success');
      compileTimer.current = setTimeout(() => setCompileStatus('idle'), 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Compilation failed';
      onResult({ success: false, error: message });
      setCompileStatus('error');
      toast('Compilation failed', 'error');
      compileTimer.current = setTimeout(() => setCompileStatus('idle'), 2000);
    } finally {
      setIsCompiling(false);
    }
  }, [nodes, edges, onResult, toast]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        redo()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        handleCompile()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo, handleCompile])

  const onConnect = useCallback(
    (params: Connection) => {
      pushHistory()
      setEdges((eds) => addEdge({ ...params, animated: true }, eds))
    },
    [setEdges, pushHistory]
  );

  const handleClearConfirm = () => {
    pushHistory()
    setNodes([]);
    setEdges([]);
    setConfirmClear(false);
    toast('Circuit cleared', 'info');
  };

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type || !reactFlowInstance) return;

    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    pushHistory()
    setNodes((nds) => nds.concat({
      id: `node_${Date.now()}`,
      type: 'gateNode',
      position,
      data: {
        type,
        label: type === 'INPUT' ? 'Input' : type === 'OUTPUT' ? 'Output' : `${type} Gate`,
      },
    }));
  }, [setNodes, reactFlowInstance, pushHistory]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const btnColor = compileStatus === 'success'
    ? 'var(--color-success)'
    : compileStatus === 'error'
    ? 'var(--color-error)'
    : 'var(--color-primary)';

  return (
    <div className="w-full h-full relative bg-canvas" ref={reactFlowWrapper}>
      <div className="absolute top-3 left-3 z-10 flex gap-2 items-center">
        {confirmClear ? (
          <>
            <span className="text-small text-text-secondary">Clear all?</span>
            <button onClick={handleClearConfirm}
              className="text-text-primary border-none rounded-button cursor-pointer font-semibold shadow-button text-small px-3 py-1.5"
              style={{ background: 'var(--color-danger)' }}>
              Yes, clear
            </button>
            <button onClick={() => setConfirmClear(false)}
              className="text-text-primary border-none rounded-button cursor-pointer font-semibold shadow-button text-small px-3 py-1.5"
              style={{ background: 'var(--color-surface)' }}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setConfirmClear(true)}
              className="canvas-tool-btn bg-transparent border border-border-light rounded-button cursor-pointer font-semibold shadow-button text-small text-text-secondary px-3.5 py-1.5"
            >
              + New Circuit
            </button>
            <button onClick={undo} title="Undo (Ctrl+Z)"
              className="canvas-tool-btn bg-transparent border border-border-light rounded-button cursor-pointer font-semibold shadow-button text-badge text-text-tertiary font-mono px-2.5 py-1.5">
              {ICON.UNDO}
            </button>
            <button onClick={redo} title="Redo (Ctrl+Shift+Z)"
              className="canvas-tool-btn bg-transparent border border-border-light rounded-button cursor-pointer font-semibold shadow-button text-badge text-text-tertiary font-mono px-2.5 py-1.5">
              {ICON.REDO}
            </button>
          </>
        )}
      </div>

      <ReactFlow
        nodes={nodesWithCallbacks}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        deleteKeyCode={["Delete", "Backspace"]}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <MiniMap
          className="!bg-panel !border !border-border !rounded-card !shadow-card !overflow-hidden"
          nodeColor={(node) => {
            const data = node.data as { type?: string }
            const cfg = data.type ? gateConfig[data.type] : undefined;
            return cfg ? cfg.border : 'var(--color-text-tertiary)';
          }}
          nodeBorderRadius={4}
          maskColor="rgba(11, 25, 38, 0.8)"
          pannable zoomable
        />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} color="var(--color-border)" />
      </ReactFlow>

      <button
        onClick={handleCompile}
        disabled={isCompiling}
        className="compile-btn absolute top-3 right-3 z-10 text-text-primary border-none rounded-button cursor-pointer font-semibold flex items-center gap-2 px-5 py-2.5"
        style={{
          background: compileStatus === 'compiling' ? 'var(--color-surface)' : btnColor,
          boxShadow: compileStatus === 'idle' ? 'var(--shadow-glow)' : 'var(--shadow-button)',
        }}
      >
        {isCompiling && <Spinner />}
        {compileLabel(compileStatus, isCompiling)}
      </button>

      <style>{`
        .canvas-tool-btn { transition: border-color 0.15s ease; }
        .canvas-tool-btn:hover { border-color: var(--color-text-tertiary) !important; }
        .compile-btn { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .compile-btn:hover:not(:disabled) { transform: scale(1.03); box-shadow: var(--shadow-glow); }
      `}</style>
    </div>
  );
}
