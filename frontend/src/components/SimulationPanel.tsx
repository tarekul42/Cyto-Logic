import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { simulateCircuit } from '../api/compilerApi';
import type { SimResult } from '../api/compilerApi';
import Spinner from './Spinner';
import SectionHeader from './SectionHeader';
import ErrorBox from './ErrorBox';
import { useToast } from './Toast';
import { ICON } from '../constants';

const CHART_COLORS = ['#00d4aa', '#4a8fe7', '#f39c12', '#e74c5e', '#a78bfa', '#fb923c'];

interface SimulationPanelProps {
  logic?: string
}

export default function SimulationPanel({ logic }: SimulationPanelProps) {
  const [simResult, setSimResult] = useState<SimResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tStart, setTStart] = useState(0);
  const [tEnd, setTEnd] = useState(100);
  const [dt, setDt] = useState(1.0);
  const toast = useToast();

  const handleSimulate = async () => {
    if (!logic) return;
    const t0 = Number(tStart)
    const t1 = Number(tEnd)
    const dtVal = Number(dt)
    if (isNaN(t0) || isNaN(t1) || isNaN(dtVal)) {
      setError('Invalid simulation parameters');
      toast('Invalid simulation parameters', 'error');
      return
    }
    if (t0 >= t1) {
      setError('tEnd must be greater than tStart');
      toast('tEnd must be greater than tStart', 'error');
      return
    }
    if (dtVal <= 0) {
      setError('dt must be positive');
      toast('dt must be positive', 'error');
      return
    }
    setIsSimulating(true);
    setError(null);
    try {
      const result = await simulateCircuit(logic, {}, [t0, t1], dtVal);
      if (result.success === false) {
        setError(result.error || 'Simulation failed');
        toast('Simulation failed', 'error');
      } else {
        setSimResult(result);
        toast('Simulation complete', 'success');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Simulation request failed';
      setError(message);
      toast('Simulation request failed', 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  const chartData: { time: number; [species: string]: number }[] | undefined = simResult?.times?.map((t, i) => {
    const point: { time: number; [species: string]: number } = { time: t };
    if (simResult.trajectories) {
      Object.entries(simResult.trajectories).forEach(([sp, vals]) => {
        point[sp] = vals[i];
      });
    }
    return point;
  });

  const inputFieldClass = 'text-small font-mono bg-input border border-input-border rounded-input text-text-primary text-center outline-none font-mono'

  return (
    <div>
      <button
        onClick={handleSimulate}
        disabled={isSimulating || !logic}
        className="simulate-btn w-full px-2.5 py-2.5 mb-3 text-body font-semibold text-text-primary border-none rounded-button flex items-center justify-center gap-2 shadow-button"
        style={{
          background: isSimulating || !logic ? 'var(--color-surface)' : 'var(--color-primary)',
          cursor: isSimulating || !logic ? 'not-allowed' : 'pointer',
        }}
      >
        {isSimulating && <Spinner />}
        {isSimulating ? 'Simulating...' : 'Run Simulation'}
      </button>

      <div className="flex gap-2 mb-3 items-center flex-wrap">
        <label className="text-small text-text-secondary flex items-center gap-1">
          t:
          <input type="number" value={tStart} onChange={(e) => setTStart(Number(e.target.value))}
            className={`${inputFieldClass} w-14 px-1.5 py-1`} />
          <span className="text-text-tertiary">&ndash;</span>
          <input type="number" value={tEnd} onChange={(e) => setTEnd(Number(e.target.value))}
            className={`${inputFieldClass} w-14 px-1.5 py-1`} />
        </label>
        <label className="text-small text-text-secondary flex items-center gap-1">
          dt:
          <input type="number" step="0.1" value={dt} onChange={(e) => setDt(Number(e.target.value))}
            className={`${inputFieldClass} w-[48px] px-1.5 py-1`} />
        </label>
      </div>

      {error && <ErrorBox>{error}</ErrorBox>}

      {chartData && chartData.length > 0 && (
        <div className="bg-surface rounded-card p-2.5">
          <SectionHeader className="!tracking-[4px]">
            Time-series ({simResult?.num_points} points)
          </SectionHeader>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="time" stroke="var(--color-text-tertiary)" tick={{ fontSize: 10 }} />
              <YAxis stroke="var(--color-text-tertiary)" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-panel)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-input)',
                  fontSize: 11,
                }}
                labelStyle={{ color: 'var(--color-text-secondary)' }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: 'var(--color-text-secondary)' }} />
              {simResult?.species?.map((sp, i) => (
                <Line
                  key={sp}
                  type="monotone"
                  dataKey={sp}
                  stroke={CHART_COLORS[i % CHART_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
          {simResult?.species && (
            <div className="flex gap-2.5 mt-2 flex-wrap">
              {simResult.species.map((sp, i) => (
                <div key={sp} className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full inline-block" style={{
                    background: CHART_COLORS[i % CHART_COLORS.length],
                  }} />
                  <span className="text-small text-text-secondary font-mono">{sp}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!simResult && !error && (
        <div className="bg-surface border border-dashed border-border rounded-card p-6 text-center">
          <div className="text-[28px] mb-1.5 text-text-tertiary">{ICON.SPINNER}</div>
          <div className="text-small text-text-tertiary">Run a simulation to see time-series data</div>
        </div>
      )}
      <style>{`
        .simulate-btn { transition: background 0.15s ease; }
        .simulate-btn:hover:not(:disabled) { background: var(--color-primary-dim) !important; }
      `}</style>
    </div>
  );
}
