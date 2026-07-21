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

export default function CircuitCanvas({ onResult }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isCompiling, setIsCompiling] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
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
    try {
      const result = await compileFromGraph(nodes, edges);
      onResult(result);
    } catch (err) {
      onResult({ success: false, error: err.message || 'Compilation failed' });
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
        label: type === 'INPUT' ? 'Input' : type === 'OUTPUT' ? 'Output' : `${type} Gate`
      }
    };

    setNodes((nds) => nds.concat(newNode));
  }, [setNodes, reactFlowInstance]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const btnBase = {
    color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer',
    fontSize: 13, fontWeight: 600, boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#0e2439' }} ref={reactFlowWrapper}>
      <div style={{ position: 'absolute', top: 15, left: 15, zIndex: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
        {confirmClear ? (
          <>
            <span style={{ fontSize: 13, color: '#ccc' }}>Clear all?</span>
            <button onClick={handleClearConfirm} style={{ ...btnBase, background: '#ff4d4d', padding: '6px 12px' }}>
              Yes, clear
            </button>
            <button onClick={() => setConfirmClear(false)} style={{ ...btnBase, background: '#555', padding: '6px 12px' }}>
              Cancel
            </button>
          </>
        ) : (
          <button onClick={() => setConfirmClear(true)} style={{ ...btnBase, background: '#ff4d4d', padding: '8px 16px', fontSize: 15 }}>
            Create New Logic
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
            background: '#1A202C', border: '1px solid #3B5B75',
            borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', overflow: 'hidden',
          }}
          nodeColor={(node) => {
            switch (node.data.type) {
              case 'INPUT':  return '#3B5B75';
              case 'OUTPUT': return '#ca2f57';
              case 'AND':    return '#8A5B73';
              case 'OR':     return '#b8864e';
              case 'NOT':    return '#6b5b8a';
              default:       return '#4B5563';
            }
          }}
          nodeBorderRadius={6}
          maskColor="rgba(15, 20, 30, 0.75)"
          pannable zoomable
        />
        <Background variant="dots" gap={20} size={2} />
      </ReactFlow>

      <button
        onClick={handleCompile}
        disabled={isCompiling}
        style={{
          position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 10,
          padding: '12px 24px', borderRadius: 8, cursor: isCompiling ? 'not-allowed' : 'pointer',
          background: isCompiling ? '#555' : '#1D9E75', color: 'white', border: 'none',
          fontWeight: 'bold', fontSize: 14, boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}
      >
        {isCompiling && (
          <span style={{
            display: 'inline-block', width: 14, height: 14,
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: '#fff', borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }} />
        )}
        {isCompiling ? 'Compiling...' : 'Compile Circuit (Ctrl+Enter)'}
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
