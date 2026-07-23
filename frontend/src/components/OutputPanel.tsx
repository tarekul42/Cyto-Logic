import { useState } from 'react';
import { exportSBOL, exportDNA, exportSVG } from '../api/compilerApi';
import type { CompileResult } from '../api/compilerApi';
import SectionHeader from './SectionHeader';
import ErrorBox from './ErrorBox';
import SimulationPanel from './SimulationPanel';
import { useToast } from './Toast';
import { ICON, PLURAL } from '../constants';

type Role = 'promoter' | 'rbs' | 'cds' | 'terminator' | 'reporter' | 'input' | 'output' | 'gate'

const roleColors: Record<Role, string> = {
  promoter:   '#00d4aa',
  rbs:        '#4a8fe7',
  cds:        '#f39c12',
  terminator: '#e74c5e',
  reporter:   '#a78bfa',
  input:      '#4a8fe7',
  output:     '#e74c5e',
  gate:       '#a78bfa',
};

const roleLookup: { key: string; color: string }[] = Object.entries(roleColors)
  .map(([key, color]) => ({ key, color }))

function getRoleColor(role?: string): string {
  if (!role) return 'var(--color-text-tertiary)';
  const r = role.toLowerCase();
  for (const { key, color } of roleLookup) {
    if (r.includes(key)) return color;
  }
  return 'var(--color-text-tertiary)';
}

interface OutputPanelProps {
  result: CompileResult | null
}

export default function OutputPanel({ result }: OutputPanelProps) {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'parts' | 'simulation'>('parts');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const toast = useToast();

  const r = result

  if (r === null) {
    return (
      <div className="p-outer text-text-tertiary text-small text-center flex-1 flex items-center justify-center">
        <div>
          <div className="text-[32px] mb-2 text-border-light">
            {ICON.EMPTY_BOX}
          </div>
          <div>Compile a circuit to see results</div>
        </div>
      </div>
    );
  }

  if (!r.success) {
    return (
      <div className="p-outer text-small flex-1">
        <div
          className="rounded-card px-3.5 py-2.5 font-bold"
          style={{
            color: 'var(--color-error)',
            background: 'color-mix(in srgb, var(--color-error) 7%, transparent)',
            border: '1px solid color-mix(in srgb, var(--color-error) 20%, transparent)',
          }}
        >
          Compilation Error
          <div className="mt-1 font-normal text-text-secondary">
            {r.error}
          </div>
        </div>
      </div>
    );
  }

  const handleExport = async (exportFn: () => Promise<void>, label: string) => {
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

  const exportOptions = [
    { label: 'SBOL', fn: () => exportSBOL(r.parts || [], r.logic || 'circuit'), icon: ICON.SBOL },
    { label: 'DNA',  fn: () => exportDNA(r.logic || '', r.logic || 'circuit'),  icon: ICON.DNA },
    { label: 'SVG',  fn: () => exportSVG(r.logic || '', r.logic || 'circuit'),  icon: ICON.SVG },
  ];

  const nodeCount = r.nodes?.length || 0;
  const edgeCount = r.edges?.length || 0;
  const inputCount = r.nodes?.filter((n) => n.type === 'INPUT').length;
  const outputCount = r.nodes?.filter((n) => n.type === 'OUTPUT').length;

  return (
    <div className="p-inner text-text-primary flex flex-col flex-1 overflow-hidden">
      <div className="flex gap-2 mb-3">
        <div className="flex-1 bg-surface rounded-card px-2.5 py-2">
          <SectionHeader className="!tracking-[3px] !mb-0.5">Output</SectionHeader>
          <div className="text-[15px] font-semibold mt-0.5 text-primary font-mono">
            {r.output_protein || 'N/A'}
          </div>
        </div>
        <div className="flex-1 bg-surface rounded-card px-2.5 py-2">
          <SectionHeader className="!tracking-[3px] !mb-0.5">Parts</SectionHeader>
          <div className="text-[15px] font-semibold mt-0.5 text-text-primary">
            {r.parts?.length || 0}
          </div>
        </div>
      </div>

      {(nodeCount > 0 || edgeCount > 0) && (
        <div className="text-small text-text-tertiary mb-3 px-2.5 py-1.5 bg-surface rounded-input flex gap-3">
          <span>{PLURAL(nodeCount, 'node')}</span>
          <span>{PLURAL(edgeCount, 'edge')}</span>
          {inputCount != null && <span>{PLURAL(inputCount, 'input')}</span>}
          {outputCount != null && <span>{ICON.ARROW_RIGHT} {PLURAL(outputCount, 'output')}</span>}
        </div>
      )}

      <div className="flex mb-3">
        <button
          onClick={() => setActiveTab('parts')}
          className="flex-1 py-2.5 text-center text-section font-bold uppercase tracking-[3px] cursor-pointer transition-[color,border-color] duration-200"
          style={{
            color: activeTab === 'parts' ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
            borderBottom: activeTab === 'parts' ? '2px solid var(--color-primary)' : '2px solid transparent',
          }}
        >
          Parts
        </button>
        <button
          onClick={() => setActiveTab('simulation')}
          className="flex-1 py-2.5 text-center text-section font-bold uppercase tracking-[3px] cursor-pointer transition-[color,border-color] duration-200"
          style={{
            color: activeTab === 'simulation' ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
            borderBottom: activeTab === 'simulation' ? '2px solid var(--color-primary)' : '2px solid transparent',
          }}
        >
          Simulation
        </button>
      </div>

      {activeTab === 'parts' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto pr-1">
            {r.parts?.map((part, index) => (
              <div key={index}
                className="flex justify-between items-center bg-surface-alt border border-border rounded-input px-2.5 py-1.5 mb-1 text-small">
                <span className="font-mono text-primary text-small">{part.id}</span>
                {part.role && (
                  <span className="text-[9px] font-bold uppercase tracking-[1px] rounded-sm px-1.5 py-0.5"
                    style={{
                      color: getRoleColor(part.role),
                      background: `${getRoleColor(part.role)}15`,
                      border: `1px solid ${getRoleColor(part.role)}30`,
                    }}>
                    {part.role}
                  </span>
                )}
              </div>
            ))}
            {(!r.parts || r.parts.length === 0) && (
              <div className="text-small text-text-tertiary text-center mt-2.5">
                No parts found in this circuit.
              </div>
            )}
          </div>

          {exportError && <ErrorBox>{exportError}</ErrorBox>}

          <div className="relative mt-2">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting !== null}
              className="w-full px-2.5 py-2.5 rounded-button text-small font-bold bg-primary text-text-primary border-none flex items-center justify-center gap-1.5 uppercase tracking-[3px] shadow-button"
              style={{ cursor: isExporting !== null ? 'not-allowed' : 'pointer' }}
            >
              {isExporting !== null ? `Exporting ${isExporting}...` : 'Export \u25BE'}
            </button>

            {showExportMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-panel border border-border rounded-card shadow-lift overflow-hidden z-20">
                {exportOptions.map(({ label, fn, icon }) => (
                  <button
                    key={label}
                    onClick={() => handleExport(fn, label)}
                    className="export-menu-btn w-full px-3.5 py-2 rounded-button text-small font-semibold bg-transparent text-text-secondary border border-border-light flex items-center gap-1.5 text-left transition-[background] duration-150"
                    style={{ cursor: isExporting !== null ? 'not-allowed' : 'pointer' }}
                  >
                    <span className="font-mono text-text-tertiary">{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'simulation' && (
        <div className="flex-1 overflow-hidden overflow-y-auto">
          <SimulationPanel logic={r.logic || undefined} />
        </div>
      )}
      <style>{`
        .export-menu-btn:hover { background: var(--color-surface) !important; }
      `}</style>
    </div>
  );
}
