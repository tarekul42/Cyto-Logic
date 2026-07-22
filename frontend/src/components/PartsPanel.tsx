import { theme, gateConfig } from '../theme';

export default function PartsPanel() {
  const onDragStart = (event: React.DragEvent, type: string) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
    const ghost = (event.target as HTMLElement).cloneNode(true) as HTMLElement;
    ghost.style.position = 'absolute';
    ghost.style.top = '-9999px';
    ghost.style.opacity = '0.6';
    document.body.appendChild(ghost);
    event.dataTransfer.setDragImage(ghost, 60, 20);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };

  return (
    <div style={{
      padding: theme.size.space.outer,
      background: theme.color.panel,
      flex: 1,
      overflowY: 'auto',
    }}>
      <div style={{
        fontSize: theme.size.font.section,
        fontWeight: 700,
        color: theme.color.textTertiary,
        marginBottom: theme.size.space.inner,
        textTransform: 'uppercase',
        letterSpacing: '6px',
      }}>
        Gates
      </div>

      {Object.entries(gateConfig).map(([type, cfg]) => (
        <div
          key={type}
          draggable
          onDragStart={(e) => onDragStart(e, type)}
          style={{
            padding: '12px 14px',
            marginBottom: theme.size.space.tight,
            borderRadius: theme.size.radius.card,
            background: cfg.bg,
            border: `1px solid ${cfg.border}`,
            cursor: 'grab',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            userSelect: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = theme.shadow.lift;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{
            width: 14, height: 14, display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'grab', flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="4" cy="3" r="1.5" fill={theme.color.textTertiary} opacity="0.6"/>
              <circle cx="10" cy="3" r="1.5" fill={theme.color.textTertiary} opacity="0.6"/>
              <circle cx="4" cy="7" r="1.5" fill={theme.color.textTertiary} opacity="0.6"/>
              <circle cx="10" cy="7" r="1.5" fill={theme.color.textTertiary} opacity="0.6"/>
              <circle cx="4" cy="11" r="1.5" fill={theme.color.textTertiary} opacity="0.6"/>
              <circle cx="10" cy="11" r="1.5" fill={theme.color.textTertiary} opacity="0.6"/>
            </svg>
          </div>
          <span style={{
            fontSize: theme.size.font.badge,
            fontWeight: 700,
            color: theme.color.textSecondary,
            fontFamily: theme.font.mono,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            width: 36,
          }}>
            {cfg.icon}
          </span>
          <span style={{
            fontSize: theme.size.font.body,
            fontWeight: 600,
            color: theme.color.textPrimary,
          }}>
            {cfg.label}
          </span>
        </div>
      ))}
    </div>
  );
}
