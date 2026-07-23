import { useState, useRef, useEffect } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { gateConfig } from '../theme';

interface GateNodeData extends Record<string, unknown> {
  type: string
  label: string
  onLabelChange?: (nodeId: string, newLabel: string) => void
}

export default function GateNode({ id, data }: NodeProps<Node<GateNodeData>>) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label);
  const inputRef = useRef<HTMLInputElement>(null);
  const cfg = gateConfig[data.type] || gateConfig.INPUT;

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleFinishEdit();
    if (e.key === 'Escape') setEditing(false);
  };

  const isNot = data.type === 'NOT';
  const isOutput = data.type === 'OUTPUT';
  const isInput = data.type === 'INPUT';

  const borderRadius = isInput
    ? 'rounded-tl-lg rounded-bl-lg rounded-tr-[4px] rounded-br-[4px]'
    : isOutput
    ? 'rounded-tr-lg rounded-br-lg rounded-tl-[4px] rounded-bl-[4px]'
    : 'rounded-[4px]'

  return (
    <div
      className={`${borderRadius} px-4.5 py-2.5 min-w-30 text-center cursor-grab shadow-md font-body relative`}
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
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)'
        e.currentTarget.style.borderColor = cfg.border
      }}
    >
      {!isInput && (
        <>
          <Handle
            type="target" position={Position.Left} id="a"
            className="size-2.5! rounded-full!"
            style={{
              top: isNot ? '50%' : '30%',
              background: 'var(--color-text-secondary)',
              border: '2px solid var(--color-panel)',
            }}
          />
          {!isNot && (
            <Handle
              type="target" position={Position.Left} id="b"
              className="size-2.5! rounded-full!"
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
        <span className="text-[10px] font-bold text-text-secondary font-mono tracking-[1px] opacity-70">
          {cfg.icon}
        </span>
        <span className="font-bold text-sm text-text-primary tracking-[0.3px]">
          {data.type}
        </span>
      </div>

      {editing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleFinishEdit}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          className="text-xs w-full mt-1.5 px-1.5 py-0.5 text-center bg-input border border-primary rounded text-text-primary outline-none font-body"
        />
      ) : (
        <div className="text-xs text-text-secondary mt-1 font-normal">
          {data.label}
        </div>
      )}

      {!isOutput && (
        <Handle
          type="source" position={Position.Right}
          className="size-2.5! rounded-full!"
          style={{
            background: 'var(--color-primary)',
            border: '2px solid var(--color-panel)',
          }}
        />
      )}
    </div>
  );
}
