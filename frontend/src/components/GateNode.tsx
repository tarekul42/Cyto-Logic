import { useState, useRef, useEffect } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { theme, gateConfig } from '../theme';

interface GateNodeData {
  type: string
  label: string
  onLabelChange?: (id: string, label: string) => void
}

export default function GateNode({ id, data }: NodeProps<GateNodeData>) {
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
    ? '8px 4px 4px 8px'
    : isOutput
    ? '4px 8px 8px 4px'
    : '4px';

  return (
    <div
      style={{
        background: `linear-gradient(145deg, ${cfg.bg}, ${cfg.bg}dd)`,
        border: `1.5px solid ${cfg.border}`,
        borderRadius,
        padding: '10px 18px',
        minWidth: 120,
        textAlign: 'center',
        cursor: 'grab',
        boxShadow: theme.shadow.node,
        fontFamily: theme.font.body,
        position: 'relative',
        transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
      }}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = theme.shadow.lift;
        e.currentTarget.style.borderColor = theme.color.primary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = theme.shadow.node;
        e.currentTarget.style.borderColor = cfg.border;
      }}
    >
      {!isInput && (
        <>
          <Handle
            type="target" position={Position.Left} id="a"
            style={{
              top: isNot ? '50%' : '30%',
              background: theme.color.textSecondary,
              border: `2px solid ${theme.color.panel}`,
              width: 10, height: 10, borderRadius: '50%',
            }}
          />
          {!isNot && (
            <Handle
              type="target" position={Position.Left} id="b"
              style={{
                top: '70%',
                background: theme.color.textSecondary,
                border: `2px solid ${theme.color.panel}`,
                width: 10, height: 10, borderRadius: '50%',
              }}
            />
          )}
        </>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
      }}>
        <span style={{
          fontSize: theme.size.font.badge,
          fontWeight: 700,
          color: theme.color.textSecondary,
          fontFamily: theme.font.mono,
          letterSpacing: '1px',
          opacity: 0.7,
        }}>
          {cfg.icon}
        </span>
        <span style={{
          fontWeight: 700,
          fontSize: theme.size.font.nodeType,
          color: theme.color.textPrimary,
          letterSpacing: '0.3px',
        }}>
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
          style={{
            width: '100%', marginTop: 6, padding: '3px 6px',
            fontSize: theme.size.font.nodeLabel,
            textAlign: 'center',
            background: theme.color.input,
            border: `1px solid ${theme.color.primary}`,
            borderRadius: theme.size.radius.input,
            color: theme.color.textPrimary,
            outline: 'none',
            boxSizing: 'border-box',
            fontFamily: theme.font.body,
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div style={{
          fontSize: theme.size.font.nodeLabel,
          color: theme.color.textSecondary,
          marginTop: 4,
          fontWeight: 400,
        }}>
          {data.label}
        </div>
      )}

      {!isOutput && (
        <Handle
          type="source" position={Position.Right}
          style={{
            background: theme.color.primary,
            border: `2px solid ${theme.color.panel}`,
            width: 10, height: 10, borderRadius: '50%',
          }}
        />
      )}
    </div>
  );
}
