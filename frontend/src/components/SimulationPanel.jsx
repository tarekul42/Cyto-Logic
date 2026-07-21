import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { simulateCircuit } from '../api/compilerApi';

const COLORS = ['#00ffcc', '#ff6b6b', '#4ecdc4', '#ffe66d', '#a78bfa', '#fb923c'];

export default function SimulationPanel({ logic }) {
  const [simResult, setSimResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState(null);
  const [tStart, setTStart] = useState(0);
  const [tEnd, setTEnd] = useState(100);
  const [dt, setDt] = useState(1.0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSimulate = async () => {
    if (!logic) return;
    setIsSimulating(true);
    setError(null);
    try {
      const result = await simulateCircuit(logic, {}, [Number(tStart), Number(tEnd)], Number(dt));
      if (result.success === false) {
        setError(result.error || 'Simulation failed');
      } else {
        setSimResult(result);
      }
    } catch (err) {
      setError(err.message || 'Simulation request failed');
    } finally {
      setIsSimulating(false);
    }
  };

  const chartData = simResult?.times?.map((t, i) => {
    const point = { time: t };
    if (simResult.trajectories) {
      Object.entries(simResult.trajectories).forEach(([sp, vals]) => {
        point[sp] = vals[i];
      });
    }
    return point;
  });

  const inputStyle = {
    width: 60, padding: '4px 6px', fontSize: 11, background: '#1c222e',
    border: '1px solid #444', borderRadius: 4, color: '#fff',
    textAlign: 'center', outline: 'none',
  };

  return (
    <div>
      <button
        onClick={handleSimulate}
        disabled={isSimulating || !logic}
        style={{
          width: '100%', padding: '10px', marginBottom: 8,
          background: isSimulating || !logic ? '#555' : '#1D9E75', color: '#fff',
          border: '1px solid #444', borderRadius: 8, fontSize: 13, fontWeight: 600,
          cursor: isSimulating || !logic ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        {isSimulating && (
          <span style={{
            display: 'inline-block', width: 14, height: 14,
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: '#fff', borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }} />
        )}
        {isSimulating ? 'Simulating...' : 'Run Simulation'}
      </button>

      <div style={{ marginBottom: 8 }}>
        <div
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{ fontSize: 11, color: '#888', cursor: 'pointer', userSelect: 'none' }}
        >
          {showAdvanced ? '▾' : '▸'} Advanced Settings
        </div>
        {showAdvanced && (
          <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ fontSize: 11, color: '#aaa', display: 'flex', alignItems: 'center', gap: 4 }}>
              t_start:
              <input type="number" value={tStart} onChange={(e) => setTStart(e.target.value)} style={inputStyle} />
            </label>
            <label style={{ fontSize: 11, color: '#aaa', display: 'flex', alignItems: 'center', gap: 4 }}>
              t_end:
              <input type="number" value={tEnd} onChange={(e) => setTEnd(e.target.value)} style={inputStyle} />
            </label>
            <label style={{ fontSize: 11, color: '#aaa', display: 'flex', alignItems: 'center', gap: 4 }}>
              dt:
              <input type="number" step="0.1" value={dt} onChange={(e) => setDt(e.target.value)} style={{ ...inputStyle, width: 50 }} />
            </label>
          </div>
        )}
      </div>

      {error && (
        <div style={{ color: '#ff5f5f', fontSize: 12, marginBottom: 8 }}>{error}</div>
      )}

      {chartData && chartData.length > 0 && (
        <div style={{ background: '#1a1a2e', borderRadius: 8, padding: 8 }}>
          <div style={{ fontSize: 11, color: '#aaa', marginBottom: 8 }}>
            Time-series ({simResult.num_points} points)
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="time" stroke="#888" tick={{ fontSize: 10 }} />
              <YAxis stroke="#888" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#222', border: '1px solid #444', fontSize: 12 }}
                labelStyle={{ color: '#aaa' }}
              />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              {simResult.species?.map((sp, i) => (
                <Line
                  key={sp}
                  type="monotone"
                  dataKey={sp}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {!simResult && !error && (
        <div style={{ color: '#888', fontSize: 12, textAlign: 'center', marginTop: 16 }}>
          Run a simulation to see time-series data
        </div>
      )}
    </div>
  );
}
