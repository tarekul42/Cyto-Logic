/*
Core responsibility
------------------------------------------------------------
Render a single logic gate inside the visual circuit editor.
Each node provides the connection points needed to build
a circuit while keeping the visual appearance independent
from the compiler itself.

Design note
----------------------------------------------------------------
I kept rendering separate from circuit logic. This component
only draws a node based on the data it receives. It does not
know anything about compilation or biological mapping.
*/
import { useState } from 'react';
import { Handle, Position } from 'reactflow';

const gateColors = {
  AND:    { bg: '#8a5b73', border: '#c49db8', text: '#FFFFFF' },
  OR:     { bg: '#b8864e', border: '#e8c99b', text: '#FFFFFF' },
  NOT:    { bg: '#6b5b8a', border: '#b49dc4', text: '#FFFFFF' },
  INPUT:  { bg: '#365571', border: '#5992c6', text: '#FFFFFF' }, 
  OUTPUT: { bg: '#ca2f57', border: '#f4819f', text: '#FFFFFF' },
}; 

export default function GateNode({ id, data }) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label);
  const style = gateColors[data.type] || gateColors.INPUT;
  
  const isNot = data.type === 'NOT';
  const isOutput = data.type === 'OUTPUT';
  const isInput = data.type === 'INPUT';

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setEditValue(data.label);
    setEditing(true);
  };

  const handleFinishEdit = () => {
    setEditing(false);
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== data.label) {
      data.onLabelChange?.(id, trimmed);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleFinishEdit();
    if (e.key === 'Escape') setEditing(false);
  };

  return (
    <div style={{
      background: style.bg,
      border: `2px solid ${style.border}`,
      borderRadius: '8px',
      padding: '12px 20px',
      minWidth: 130,
      textAlign: 'center',
      cursor: 'grab',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      fontFamily: '"Segoe UI", sans-serif'
    }} onDoubleClick={handleDoubleClick}>
      {!isInput && (
        <>
          <Handle type="target" position={Position.Left} id="a" 
            style={{ top: isNot ? '50%' : '30%', background: '#E5E7EB', border: 'none', width: 8, height: 8 }} />
          {!isNot && (
            <Handle type="target" position={Position.Left} id="b" 
              style={{ top: '70%', background: '#E5E7EB', border: 'none', width: 8, height: 8 }} />
          )}
        </>
      )}

      <div style={{ fontWeight: 600, fontSize: 14, color: style.text, letterSpacing: '0.5px' }}>
        {data.type}
      </div>

      {editing ? (
        <input
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleFinishEdit}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%', marginTop: 4, padding: '2px 4px',
            fontSize: 11, textAlign: 'center', background: '#1a1a2e',
            border: '1px solid #5992c6', borderRadius: 4,
            color: '#fff', outline: 'none', boxSizing: 'border-box',
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div style={{ fontSize: 11, color: style.text, opacity: 0.8, marginTop: 4 }}>
          {data.label}
        </div>
      )}

      {!isOutput && (
        <Handle type="source" position={Position.Right} 
          style={{ background: '#E5E7EB', border: 'none', width: 8, height: 8 }} />
      )}
    </div>
  );
}
