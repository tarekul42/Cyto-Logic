import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Background,
  MiniMap,
} from 'reactflow';
import '@reactflow/core/dist/style.css';
import GateNode from './GateNode';
import { compileFromGraph } from '../api/compilerApi';
import { theme, gateConfig } from '../theme';

const nodeTypes = { gateNode: GateNode };

const initialNodes = [
  { id: '1', type: 'gateNode', position: { x: 80,  y: 120 }, data: { type: 'INPUT',  label: 'aTc' } },
  { id: '2', type: 'gateNode', position: { x: 80,  y: 240 }, data: { type: 'INPUT',  label: 'AraC' } },
  { id: '3', type: 'gateNode', position: { x: 280, y: 180 }, data: { type: 'AND',    label: 'AND gate' } },
  { id: '4', type: 'gateNode', position: { x: 480, y: 180 }, data: { type: 'OUTPUT', label: 'GFP' } },
];

const initialEdges = [
  { id: 'e1-3', source: '1', target: '3', targetHandle: 'a', animated: true },
  { id: 'e2-3', source: '2', target: '3', targetHandle: 'b', animated: true },
  { id: 'e3-4', source: '3', target: '4', animated: true },
];

const btnBase = {
  color: theme.color.textPrimary,
  border: 'none',
  borderRadius: theme.size.radius.button,
  cursor: 'pointer',
  fontSize: theme.size.font.body,
  fontWeight: 600,
  boxShadow: theme.shadow.button,
  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
};

export default function CircuitCanvas({ onResult }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isCompiling, setIsCompiling] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [compileStatus, setCompileStatus] = useState('idle');
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef(null);

  const handleLabelChange = useCallback((nodeId, newLabel) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, label: newLabel } }
          : n
      )
    );
  }, [setNodes]);

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
      setTimeout(() => setCompileStatus('idle'), 1500);
    } catch (err) {
      onResult({ success: false, error: err.message || 'Compilation failed' });
      setCompileStatus('error');
      setTimeout(() => setCompileStatus('idle'), 2000);
    } finally {
      setIsCompiling(false);
    }
  }, [nodes, edges, onResult]);

  const compileRef = useRef(handleCompile);
  compileRef.current = handleCompile;

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        compileRef.current();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const handleClearConfirm = () => {
    setNodes([]);
    setEdges([]);
    setConfirmClear(false);
  };

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type || !reactFlowInstance) return;

    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const newNode = {
      id: `node_${Date.now()}`,
      type: 'gateNode',
      position,
      data: {
        type,
        label: type === 'INPUT' ? 'Input' : type === 'OUTPUT' ? 'Output' : `${type} Gate`,
      },
    };

    setNodes((nds) => nds.concat(newNode));
  }, [setNodes, reactFlowInstance]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const compileColor = compileStatus === 'success'
    ? theme.color.success
    : compileStatus === 'error'
    ? theme.color.error
    : theme.color.primary;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: theme.color.canvas }} ref={reactFlowWrapper}>
      <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
        {confirmClear ? (
          <>
            <span style={{ fontSize: theme.size.font.small, color: theme.color.textSecondary }}>Clear all?</span>
            <button onClick={handleClearConfirm} style={{ ...btnBase, background: theme.color.danger, padding: '6px 12px', fontSize: theme.size.font.small }}>
              Yes, clear
            </button>
            <button onClick={() => setConfirmClear(false)} style={{ ...btnBase, background: theme.color.surface, padding: '6px 12px', fontSize: theme.size.font.small }}>
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setConfirmClear(true)}
            style={{
              ...btnBase,
              background: 'transparent',
              border: `1px solid ${theme.color.borderLight}`,
              padding: '6px 14px',
              fontSize: theme.size.font.small,
              color: theme.color.textSecondary,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.color.textTertiary }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.color.borderLight }}
          >
            + New Circuit
          </button>
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
          style={{
            background: theme.color.panel,
            border: `1px solid ${theme.color.border}`,
            borderRadius: theme.size.radius.card,
            boxShadow: theme.shadow.card,
            overflow: 'hidden',
          }}
          nodeColor={(node) => {
            const cfg = gateConfig[node.data.type];
            return cfg ? cfg.border : theme.color.textTertiary;
          }}
          nodeBorderRadius={4}
          maskColor="rgba(11, 25, 38, 0.8)"
          pannable zoomable
        />
        <Background variant="dots" gap={20} size={1.5} color={theme.color.border} />
      </ReactFlow>

      <button
        onClick={handleCompile}
        disabled={isCompiling}
        style={{
          ...btnBase,
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 10,
          padding: '10px 22px',
          background: compileStatus === 'compiling' ? theme.color.surface : compileColor,
          color: theme.color.textPrimary,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: compileStatus === 'idle' ? theme.shadow.glow : theme.shadow.button,
        }}
        onMouseEnter={(e) => {
          if (!isCompiling) {
            e.currentTarget.style.transform = 'scale(1.03)';
            e.currentTarget.style.boxShadow = theme.shadow.glow;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = compileStatus === 'idle' ? theme.shadow.glow : theme.shadow.button;
        }}
      >
        {isCompiling && (
          <span style={{
            display: 'inline-block', width: 14, height: 14,
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: theme.color.textPrimary,
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }} />
        )}
        {compileStatus === 'success' ? '\u2713 Compiled'
          : compileStatus === 'error' ? '\u2717 Failed'
          : isCompiling ? 'Compiling...'
          : 'Compile'}
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
