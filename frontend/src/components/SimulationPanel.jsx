import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { simulateCircuit } from '../api/compilerApi';
import { theme } from '../theme';

const COLORS = ['#00d4aa', '#4a8fe7', '#f39c12', '#e74c5e', '#a78bfa', '#fb923c'];

export default function SimulationPanel({ logic }) {
  const [simResult, setSimResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState(null);
  const [tStart, setTStart] = useState(0);
  const [tEnd, setTEnd] = useState(100);
  const [dt, setDt] = useState(1.0);

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
    width: 56, padding: '4px 6px', fontSize: theme.size.font.small,
    background: theme.color.input, border: `1px solid ${theme.color.inputBorder}`,
    borderRadius: theme.size.radius.input, color: theme.color.textPrimary,
    textAlign: 'center', outline: 'none', fontFamily: theme.font.mono,
  };

  return (
    <div>
      <button
        onClick={handleSimulate}
        disabled={isSimulating || !logic}
        style={{
          width: '100%', padding: '10px', marginBottom: 12,
          background: isSimulating || !logic ? theme.color.surface : theme.color.primary,
          color: theme.color.textPrimary, border: 'none',
          borderRadius: theme.size.radius.button, fontSize: theme.size.font.body,
          fontWeight: 600,
          cursor: isSimulating || !logic ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: theme.shadow.button,
          transition: 'background 0.15s ease',
        }}
        onMouseEnter={(e) => {
          if (!isSimulating && logic) e.currentTarget.style.background = theme.color.primaryDim;
        }}
        onMouseLeave={(e) => {
          if (!isSimulating && logic) e.currentTarget.style.background = theme.color.primary;
        }}
      >
        {isSimulating && (
          <span style={{
            display: 'inline-block', width: 14, height: 14,
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: theme.color.textPrimary, borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }} />
        )}
        {isSimulating ? 'Simulating...' : 'Run Simulation'}
      </button>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ fontSize: theme.size.font.small, color: theme.color.textSecondary, display: 'flex', alignItems: 'center', gap: 4 }}>
          t:
          <input type="number" value={tStart} onChange={(e) => setTStart(e.target.value)} style={inputStyle} />
          <span style={{ color: theme.color.textTertiary }}>&ndash;</span>
          <input type="number" value={tEnd} onChange={(e) => setTEnd(e.target.value)} style={inputStyle} />
        </label>
        <label style={{ fontSize: theme.size.font.small, color: theme.color.textSecondary, display: 'flex', alignItems: 'center', gap: 4 }}>
          dt:
          <input type="number" step="0.1" value={dt} onChange={(e) => setDt(e.target.value)} style={{ ...inputStyle, width: 48 }} />
        </label>
      </div>

      {error && (
        <div style={{
          color: theme.color.error, fontSize: theme.size.font.small, marginBottom: 8,
          padding: '6px 10px', background: `${theme.color.error}11`,
          border: `1px solid ${theme.color.error}33`, borderRadius: theme.size.radius.input,
        }}>
          {error}
        </div>
      )}

      {chartData && chartData.length > 0 && (
        <div style={{ background: theme.color.surface, borderRadius: theme.size.radius.card, padding: 10 }}>
          <div style={{
            fontSize: theme.size.font.section, color: theme.color.textTertiary, marginBottom: 8,
            textTransform: 'uppercase', letterSpacing: '4px', fontWeight: 700,
          }}>
            Time-series ({simResult.num_points} points)
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.color.border} />
              <XAxis dataKey="time" stroke={theme.color.textTertiary} tick={{ fontSize: 10 }} />
              <YAxis stroke={theme.color.textTertiary} tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  background: theme.color.panel,
                  border: `1px solid ${theme.color.border}`,
                  borderRadius: theme.size.radius.input,
                  fontSize: theme.size.font.small,
                }}
                labelStyle={{ color: theme.color.textSecondary }}
              />
              <Legend wrapperStyle={{ fontSize: theme.size.font.small, color: theme.color.textSecondary }} />
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
          {simResult.species && (
            <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
              {simResult.species.map((sp, i) => (
                <div key={sp} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: COLORS[i % COLORS.length], display: 'inline-block',
                  }} />
                  <span style={{ fontSize: theme.size.font.small, color: theme.color.textSecondary, fontFamily: theme.font.mono }}>
                    {sp}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!simResult && !error && (
        <div style={{
          background: theme.color.surface,
          border: `1px dashed ${theme.color.border}`,
          borderRadius: theme.size.radius.card,
          padding: 24,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 28, marginBottom: 6, color: theme.color.textTertiary }}>
            &#x223F;
          </div>
          <div style={{ fontSize: theme.size.font.small, color: theme.color.textTertiary }}>
            Run a simulation to see time-series data
          </div>
        </div>
      )}
    </div>
  );
}
