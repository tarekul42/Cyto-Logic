import { useState } from 'react';
import { exportSBOL, exportDNA, exportSVG } from '../api/compilerApi';
import SimulationPanel from './SimulationPanel';

export default function OutputPanel({ result }) {
  const [isExportingSBOL, setIsExportingSBOL] = useState(false);
  const [isExportingDNA, setIsExportingDNA] = useState(false);
  const [isExportingSVG, setIsExportingSVG] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [activeTab, setActiveTab] = useState('parts');

  if (!result) {
    return (
      <div style={{ padding: 20, color: '#888', fontSize: 13, textAlign: 'center' }}>
        Compile a circuit to see the results here!
      </div>
    );
  }

  if (!result.success) {
    return (
      <div style={{ padding: 20, color: '#ff5f5f', fontSize: 13 }}>
        <strong>Compilation Error:</strong> <br/>
        {result.error}
      </div>
    );
  }

  const handleExport = async (exportFn, setter, label) => {
    setter(true);
    setExportError(null);
    try {
      await exportFn();
    } catch (error) {
      console.error(`${label} failed:`, error);
      setExportError(`${label} export failed. Check if backend is running.`);
    } finally {
      setter(false);
    }
  };

  const tabStyle = (tab) => ({
    flex: 1,
    padding: '8px 0',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    background: activeTab === tab ? '#2c2c2c' : 'transparent',
    color: activeTab === tab ? '#fff' : '#888',
    borderBottom: activeTab === tab ? '2px solid #1D9E75' : '2px solid transparent',
    transition: 'all 0.2s',
  });

  return (
    <div style={{ padding: 12, color: '#fff', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1, background: '#2c2c2c', borderRadius: 8, padding: '10px' }}>
          <div style={{ fontSize: 11, color: '#aaa' }}>Output Protein</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>
            {result.output_protein || 'N/A'}
          </div>
        </div>
        <div style={{ flex: 1, background: '#2c2c2c', borderRadius: 8, padding: '10px' }}>
          <div style={{ fontSize: 11, color: '#aaa' }}>Total Parts</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>
            {result.parts?.length || 0}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', marginBottom: 10 }}>
        <div style={tabStyle('parts')} onClick={() => setActiveTab('parts')}>Parts</div>
        <div style={tabStyle('simulation')} onClick={() => setActiveTab('simulation')}>Simulation</div>
      </div>

      {activeTab === 'parts' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ fontSize: 12, color: '#aaa', marginBottom: 8 }}>Required BioBricks:</div>

          <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
            {result.parts?.map((part, index) => (
              <div
                key={index}
                style={{
                  display: 'flex', justifyContent: 'space-between',
                  background: '#252525', border: '1px solid #333',
                  borderRadius: 6, padding: '7px', marginBottom: 5, fontSize: 12,
                }}
              >
                <span style={{ fontFamily: 'monospace', color: '#00ffcc' }}>{part.id}</span>
                <span style={{ color: '#888' }}>{part.role}</span>
              </div>
            ))}
            {(!result.parts || result.parts.length === 0) && (
              <div style={{ fontSize: 12, color: '#666', textAlign: 'center', marginTop: 10 }}>
                No parts found in this circuit.
              </div>
            )}
          </div>

          {exportError && (
            <div style={{ color: '#ff5f5f', fontSize: 11, marginBottom: 6, marginTop: 4 }}>{exportError}</div>
          )}

          <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button
              onClick={() => handleExport(
                () => exportSBOL(result.parts, result.logic || 'circuit'),
                setIsExportingSBOL, 'SBOL'
              )}
              disabled={isExportingSBOL}
              style={{
                padding: '8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                background: isExportingSBOL ? '#666' : '#c9656d', color: '#fff',
                border: '1px solid #444', cursor: isExportingSBOL ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              {isExportingSBOL && <Spinner />}
              {isExportingSBOL ? 'Exporting...' : 'Export SBOL (.xml)'}
            </button>

            <button
              onClick={() => handleExport(
                () => exportDNA(result.logic, result.logic || 'circuit'),
                setIsExportingDNA, 'DNA'
              )}
              disabled={isExportingDNA}
              style={{
                padding: '8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                background: isExportingDNA ? '#666' : '#2980b9', color: '#fff',
                border: '1px solid #444', cursor: isExportingDNA ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              {isExportingDNA && <Spinner />}
              {isExportingDNA ? 'Exporting...' : 'Export DNA (.fa)'}
            </button>

            <button
              onClick={() => handleExport(
                () => exportSVG(result.logic, result.logic || 'circuit'),
                setIsExportingSVG, 'SVG'
              )}
              disabled={isExportingSVG}
              style={{
                padding: '8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                background: isExportingSVG ? '#666' : '#e67e22', color: '#fff',
                border: '1px solid #444', cursor: isExportingSVG ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              {isExportingSVG && <Spinner />}
              {isExportingSVG ? 'Exporting...' : 'Export SVG Diagram'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'simulation' && (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <SimulationPanel logic={result.logic} />
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <span style={{
      display: 'inline-block', width: 12, height: 12,
      border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: '#fff', borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
    }} />
  );
}
