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

  const handleSimulate = async () => {
    if (!logic) return;
    setIsSimulating(true);
    setError(null);
    try {
      const result = await simulateCircuit(logic, {}, [0, 100], 1.0);
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

  return (
    <div>
      <button
        onClick={handleSimulate}
        disabled={isSimulating}
        style={{
          width: '100%',
          padding: '10px',
          marginBottom: 12,
          background: isSimulating ? '#666' : '#1D9E75',
          color: '#fff',
          border: '1px solid #444',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          cursor: isSimulating ? 'not-allowed' : 'pointer',
        }}
      >
        {isSimulating ? 'Simulating...' : 'Run Simulation'}
      </button>

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
