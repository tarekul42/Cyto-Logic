import { useState, useRef, useEffect, type CSSProperties } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { gateConfig } from '../theme';

interface GateNodeData {
  type: string
  label: string
  onLabelChange?: (id: string, label: string) => void
}

const INPUT_STYLE: CSSProperties = {
  width: '100%', marginTop: 6, padding: '3px 6px',
  textAlign: 'center',
  background: 'var(--color-input)',
  border: '1px solid var(--color-primary)',
  borderRadius: 'var(--radius-input)',
  color: 'var(--color-text-primary)',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'var(--font-body)',
}

export default function GateNode({ id, data }: NodeProps) {
  const typed = data as unknown as GateNodeData
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(typed.label);
  const inputRef = useRef<HTMLInputElement>(null);
  const cfg = gateConfig[typed.type] || gateConfig.INPUT;

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditValue(typed.label);
    setEditing(true);
  };

  const handleFinishEdit = () => {
    setEditing(false);
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== typed.label) {
      typed.onLabelChange?.(id, trimmed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleFinishEdit();
    if (e.key === 'Escape') setEditing(false);
  };

  const isNot = typed.type === 'NOT';
  const isOutput = typed.type === 'OUTPUT';
  const isInput = typed.type === 'INPUT';

  const br = isInput
    ? 'rounded-tl-lg rounded-bl-lg rounded-tr-[4px] rounded-br-[4px]'
    : isOutput
    ? 'rounded-tr-lg rounded-br-lg rounded-tl-[4px] rounded-bl-[4px]'
    : 'rounded-[4px]'

  return (
    <div
      className={`${br} px-[18px] py-2.5 min-w-[120px] text-center cursor-grab shadow-node font-body relative transition-all duration-150`}
      style={{
        background: `linear-gradient(145deg, ${cfg.bg}, ${cfg.bg}dd)`,
        border: `1.5px solid ${cfg.border}`,
      }}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-lift)'
        e.currentTarget.style.borderColor = 'var(--color-primary)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-node)'
        e.currentTarget.style.borderColor = cfg.border
      }}
    >
      {!isInput && (
        <>
          <Handle
            type="target" position={Position.Left} id="a"
            className="!size-2.5 !rounded-full"
            style={{
              top: isNot ? '50%' : '30%',
              background: 'var(--color-text-secondary)',
              border: '2px solid var(--color-panel)',
            }}
          />
          {!isNot && (
            <Handle
              type="target" position={Position.Left} id="b"
              className="!size-2.5 !rounded-full"
              style={{
                top: '70%',
                background: 'var(--color-text-secondary)',
                border: '2px solid var(--color-panel)',
              }}
            />
          )}
        </>
      )}

      <div className="flex items-center justify-center gap-1.5">
        <span className="text-badge font-bold text-text-secondary font-mono tracking-[1px] opacity-70">
          {cfg.icon}
        </span>
        <span className="font-bold text-node-type text-text-primary tracking-[0.3px]">
          {typed.type}
        </span>
      </div>

      {editing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleFinishEdit}
          onKeyDown={handleKeyDown}
          className="text-node-label"
          style={INPUT_STYLE}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div className="text-node-label text-text-secondary mt-1 font-normal">
          {typed.label}
        </div>
      )}

      {!isOutput && (
        <Handle
          type="source" position={Position.Right}
          className="!size-2.5 !rounded-full"
          style={{
            background: 'var(--color-primary)',
            border: '2px solid var(--color-panel)',
          }}
        />
      )}
    </div>
  );
}
