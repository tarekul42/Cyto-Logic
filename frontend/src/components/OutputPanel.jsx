import { useState } from 'react';
import { exportSBOL, exportDNA, exportSVG } from '../api/compilerApi';
import SimulationPanel from './SimulationPanel';
import { useToast } from './Toast';
import { theme } from '../theme';

const roleColors = {
  promoter:   '#00d4aa',
  rbs:        '#4a8fe7',
  cds:        '#f39c12',
  terminator: '#e74c5e',
  reporter:   '#a78bfa',
  input:      '#4a8fe7',
  output:     '#e74c5e',
  gate:       '#a78bfa',
};

function getRoleColor(role) {
  if (!role) return theme.color.textTertiary;
  const r = role.toLowerCase();
  for (const [key, color] of Object.entries(roleColors)) {
    if (r.includes(key)) return color;
  }
  return theme.color.textTertiary;
}

export default function OutputPanel({ result }) {
  const [isExporting, setIsExporting] = useState(null);
  const [exportError, setExportError] = useState(null);
  const [activeTab, setActiveTab] = useState('parts');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const toast = useToast();

  if (!result) {
    return (
      <div style={{
        padding: theme.size.space.outer, color: theme.color.textTertiary,
        fontSize: theme.size.font.small, textAlign: 'center', flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div>
          <div style={{ fontSize: 32, marginBottom: 8, color: theme.color.borderLight }}>
            &#x22A1;
          </div>
          <div>Compile a circuit to see results</div>
        </div>
      </div>
    );
  }

  if (!result.success) {
    return (
      <div style={{
        padding: theme.size.space.outer, fontSize: theme.size.font.small, flex: 1,
      }}>
        <div style={{
          color: theme.color.error, padding: '10px 14px',
          background: `${theme.color.error}11`,
          border: `1px solid ${theme.color.error}33`,
          borderRadius: theme.size.radius.card,
        }}>
          <strong>Compilation Error</strong>
          <div style={{ marginTop: 4, color: theme.color.textSecondary }}>
            {result.error}
          </div>
        </div>
      </div>
    );
  }

  const handleExport = async (exportFn, label) => {
    setIsExporting(label);
    setExportError(null);
    setShowExportMenu(false);
    try {
      await exportFn();
      toast(`${label} exported`, 'success');
    } catch (error) {
      console.error(`${label} export failed:`, error);
      setExportError(`${label} export failed. Check if backend is running.`);
      toast(`${label} export failed`, 'error');
    } finally {
      setIsExporting(null);
    }
  };

  const tabStyle = (tab) => ({
    flex: 1,
    padding: '10px 0',
    textAlign: 'center',
    fontSize: theme.size.font.small,
    fontWeight: 700,
    cursor: 'pointer',
    color: activeTab === tab ? theme.color.textPrimary : theme.color.textTertiary,
    borderBottom: activeTab === tab ? `2px solid ${theme.color.primary}` : '2px solid transparent',
    textTransform: 'uppercase',
    letterSpacing: '3px',
    transition: 'color 0.2s, border-color 0.2s',
  });

  const exportBtnStyle = (label) => ({
    padding: '8px 14px', borderRadius: theme.size.radius.button,
    fontSize: theme.size.font.small, fontWeight: 600,
    background: isExporting === label ? theme.color.surface : 'transparent',
    color: theme.color.textSecondary,
    border: `1px solid ${theme.color.borderLight}`,
    cursor: isExporting === label ? 'not-allowed' : 'pointer',
    display: 'flex', alignItems: 'center', gap: 6,
    transition: 'background 0.15s, border-color 0.15s',
    textAlign: 'left',
    width: '100%',
  });

  const exportOptions = [
    { label: 'SBOL', fn: () => exportSBOL(result.parts, result.logic || 'circuit'), icon: '\u29C9' },
    { label: 'DNA',  fn: () => exportDNA(result.logic, result.logic || 'circuit'),  icon: '\u2240' },
    { label: 'SVG',  fn: () => exportSVG(result.logic, result.logic || 'circuit'),  icon: '\u25A2' },
  ];

  const nodeCount = result.nodes?.length || 0;
  const edgeCount = result.edges?.length || 0;
  const inputCount = result.nodes?.filter((n) => n.type === 'INPUT').length;
  const outputCount = result.nodes?.filter((n) => n.type === 'OUTPUT').length;

  return (
    <div style={{
      padding: theme.size.space.inner,
      color: theme.color.textPrimary,
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: theme.size.space.inner }}>
        <div style={{
          flex: 1, background: theme.color.surface, borderRadius: theme.size.radius.card,
          padding: '8px 10px',
        }}>
          <div style={{ fontSize: theme.size.font.section, color: theme.color.textTertiary, textTransform: 'uppercase', letterSpacing: '3px', fontWeight: 700 }}>
            Output
          </div>
          <div style={{
            fontSize: 15, fontWeight: 600, marginTop: 2,
            color: theme.color.primary, fontFamily: theme.font.mono,
          }}>
            {result.output_protein || 'N/A'}
          </div>
        </div>
        <div style={{
          flex: 1, background: theme.color.surface, borderRadius: theme.size.radius.card,
          padding: '8px 10px',
        }}>
          <div style={{ fontSize: theme.size.font.section, color: theme.color.textTertiary, textTransform: 'uppercase', letterSpacing: '3px', fontWeight: 700 }}>
            Parts
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2, color: theme.color.textPrimary }}>
            {result.parts?.length || 0}
          </div>
        </div>
      </div>

      {(nodeCount > 0 || edgeCount > 0) && (
        <div style={{
          fontSize: theme.size.font.small, color: theme.color.textTertiary,
          marginBottom: theme.size.space.inner, padding: '6px 10px',
          background: theme.color.surface, borderRadius: theme.size.radius.input,
          display: 'flex', gap: 12,
        }}>
          <span>{nodeCount} node{nodeCount !== 1 ? 's' : ''}</span>
          <span>{edgeCount} edge{edgeCount !== 1 ? 's' : ''}</span>
          {inputCount != null && <span>{inputCount} input{inputCount !== 1 ? 's' : ''}</span>}
          {outputCount != null && <span>\u2192 {outputCount} output{outputCount !== 1 ? 's' : ''}</span>}
        </div>
      )}

      <div style={{ display: 'flex', marginBottom: theme.size.space.inner }}>
        <div style={tabStyle('parts')} onClick={() => setActiveTab('parts')} role="button" aria-label="Parts tab">Parts</div>
        <div style={tabStyle('simulation')} onClick={() => setActiveTab('simulation')} role="button" aria-label="Simulation tab">Simulation</div>
      </div>

      {activeTab === 'parts' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
            {result.parts?.map((part, index) => (
              <div
                key={index}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: theme.color.surfaceAlt, border: `1px solid ${theme.color.border}`,
                  borderRadius: theme.size.radius.input, padding: '6px 10px',
                  marginBottom: 4, fontSize: theme.size.font.small,
                }}
              >
                <span style={{ fontFamily: theme.font.mono, color: theme.color.primary, fontSize: theme.size.font.small }}>
                  {part.id}
                </span>
                {part.role && (
                  <span style={{
                    fontSize: '9px', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '1px', color: getRoleColor(part.role),
                    background: `${getRoleColor(part.role)}15`,
                    border: `1px solid ${getRoleColor(part.role)}30`,
                    borderRadius: '3px', padding: '1px 6px',
                  }}>
                    {part.role}
                  </span>
                )}
              </div>
            ))}
            {(!result.parts || result.parts.length === 0) && (
              <div style={{ fontSize: theme.size.font.small, color: theme.color.textTertiary, textAlign: 'center', marginTop: 10 }}>
                No parts found in this circuit.
              </div>
            )}
          </div>

          {exportError && (
            <div style={{
              color: theme.color.error, fontSize: theme.size.font.section,
              marginBottom: 6, marginTop: 4,
              padding: '4px 8px', background: `${theme.color.error}11`,
              borderRadius: theme.size.radius.input,
            }}>
              {exportError}
            </div>
          )}

          <div style={{ position: 'relative', marginTop: 8 }}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting !== null}
              style={{
                width: '100%', padding: '10px', borderRadius: theme.size.radius.button,
                fontSize: theme.size.font.small, fontWeight: 700,
                background: theme.color.primary, color: theme.color.textPrimary,
                border: 'none', cursor: isExporting !== null ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                textTransform: 'uppercase', letterSpacing: '3px',
                boxShadow: theme.shadow.button,
              }}
            >
              {isExporting !== null ? `Exporting ${isExporting}...` : 'Export \u25BE'}
            </button>

            {showExportMenu && (
              <div style={{
                position: 'absolute', bottom: '100%', left: 0, right: 0,
                marginBottom: 4, background: theme.color.panel,
                border: `1px solid ${theme.color.border}`,
                borderRadius: theme.size.radius.card,
                boxShadow: theme.shadow.lift,
                overflow: 'hidden', zIndex: 20,
              }}>
                {exportOptions.map(({ label, fn, icon }) => (
                  <button
                    key={label}
                    onClick={() => handleExport(fn, label)}
                    onMouseEnter={(e) => { e.currentTarget.style.background = theme.color.surface }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                    style={exportBtnStyle(label)}
                  >
                    <span style={{ fontFamily: theme.font.mono, color: theme.color.textTertiary }}>{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'simulation' && (
        <div style={{ flex: 1, overflow: 'hidden', overflowY: 'auto' }}>
          <SimulationPanel logic={result.logic} />
        </div>
      )}
    </div>
  );
}
