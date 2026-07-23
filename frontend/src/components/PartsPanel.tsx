import { gateConfig } from '../theme';
import SectionHeader from './SectionHeader';

export default function PartsPanel() {
  const onDragStart = (event: React.DragEvent, type: string) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
    const el = event.currentTarget as HTMLElement
    const ghost = el.cloneNode(true) as HTMLElement;
    ghost.style.position = 'absolute';
    ghost.style.top = '-9999px';
    ghost.style.opacity = '0.6';
    document.body.appendChild(ghost);
    event.dataTransfer.setDragImage(ghost, 60, 20);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };

  return (
    <div className="p-4 bg-panel flex-1 overflow-y-auto">
      <SectionHeader>Gates</SectionHeader>

      {Object.entries(gateConfig).map(([type, cfg]) => (
        <div
          key={type}
          draggable
          onDragStart={(e) => onDragStart(e, type)}
          className="parts-gate flex items-center gap-3 select-none cursor-grab px-3.5 py-3 mb-2 rounded-lg"
          style={{
            background: cfg.bg,
            border: `1px solid ${cfg.border}`,
          }}
        >
          <div className="size-3.5 flex items-center justify-center cursor-grab flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="4" cy="3" r="1.5" fill="var(--color-text-tertiary)" opacity="0.6"/>
              <circle cx="10" cy="3" r="1.5" fill="var(--color-text-tertiary)" opacity="0.6"/>
              <circle cx="4" cy="7" r="1.5" fill="var(--color-text-tertiary)" opacity="0.6"/>
              <circle cx="10" cy="7" r="1.5" fill="var(--color-text-tertiary)" opacity="0.6"/>
              <circle cx="4" cy="11" r="1.5" fill="var(--color-text-tertiary)" opacity="0.6"/>
              <circle cx="10" cy="11" r="1.5" fill="var(--color-text-tertiary)" opacity="0.6"/>
            </svg>
          </div>
          <span className="text-[10px] font-bold text-text-secondary font-mono uppercase tracking-[1px] w-9">
            {cfg.icon}
          </span>
          <span className="text-[13px] font-semibold text-text-primary">
            {cfg.label}
          </span>
        </div>
      ))}
      <style>{`
        .parts-gate { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .parts-gate:hover { transform: translateY(-2px); box-shadow: var(--shadow-lift); }
      `}</style>
    </div>
  );
}
