import { useState, useRef, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { simulateCircuit } from "../api/compilerApi";
import type { SimResult } from "../api/compilerApi";
import Spinner from "./Spinner";
import SectionHeader from "./SectionHeader";
import ErrorBox from "./ErrorBox";
import { useToast } from "./Toast";
import { ICON } from "../constants";

const CHART_COLORS = [
  "#00d4aa",
  "#4a8fe7",
  "#f39c12",
  "#e74c5e",
  "#a78bfa",
  "#fb923c",
];

interface SimulationPanelProps {
  logic?: string;
}

export default function SimulationPanel({ logic }: SimulationPanelProps) {
  const [simResult, setSimResult] = useState<SimResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tStart, setTStart] = useState(0);
  const [tEnd, setTEnd] = useState(100);
  const [dt, setDt] = useState(1.0);
  const [hillN, setHillN] = useState(2.0);
  const [kd, setKd] = useState(0.01);
  const [vmax, setVmax] = useState(10.0);
  const [delta, setDelta] = useState(0.5);
  const toast = useToast();
  const isFirstRender = useRef(true);

  const runSimulation = useCallback(
    async (params?: Record<string, number>) => {
      if (!logic) return;
      const t0 = Number(tStart);
      const t1 = Number(tEnd);
      const dtVal = Number(dt);

      if (isNaN(t0) || isNaN(t1) || isNaN(dtVal)) {
        setError("Invalid simulation parameters");
        toast("Invalid simulation parameters", "error");
        return;
      }
      if (t0 >= t1) {
        setError("tEnd must be greater than tStart");
        toast("tEnd must be greater than tStart", "error");
        return;
      }
      if (dtVal <= 0) {
        setError("dt must be positive");
        toast("dt must be positive", "error");
        return;
      }

      setIsSimulating(true);
      setError(null);
      try {
        const simParams = params ?? {
          hill_n: hillN,
          kd: kd,
          vmax: vmax,
          delta: delta,
        };
        const result = await simulateCircuit(
          logic,
          {},
          [t0, t1],
          dtVal,
          simParams,
        );
        if (result.success === false) {
          setError(result.error || "Simulation failed");
          toast("Simulation failed", "error");
        } else {
          setSimResult(result);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Simulation request failed";
        setError(message);
        toast("Simulation request failed", "error");
      } finally {
        setIsSimulating(false);
      }
    },
    [logic, tStart, tEnd, dt, hillN, kd, vmax, delta, toast],
  );

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      runSimulation({ hill_n: hillN, kd, vmax, delta });
    }, 300);
    return () => clearTimeout(timer);
  }, [hillN, kd, vmax, delta, runSimulation]);

  const handleHillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHillN(Number(e.target.value));
  };

  const handleKdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKd(Number(e.target.value));
  };

  const handleVmaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVmax(Number(e.target.value));
  };

  const handleDeltaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDelta(Number(e.target.value));
  };

  const chartData = simResult?.times?.map((t, i) => {
    const point: Record<string, number> = { time: t };
    if (simResult.trajectories) {
      for (const [species, values] of Object.entries(simResult.trajectories)) {
        point[species] = values[i];
      }
    }
    return point;
  });

  const handleSimulate = () => runSimulation();

  const paramSlider = (
    label: string,
    value: number,
    min: number,
    max: number,
    step: number,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  ) => (
    <div className="flex items-center gap-2 text-[11px] text-text-secondary">
      <span className="w-6 shrink-0 text-right">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
        style={{
          accentColor: "var(--color-primary)",
          background: "var(--color-border)",
        }}
      />
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (!isNaN(v) && v >= min && v <= max) {
            if (label === "n") setHillN(v);
            else if (label === "Kd") setKd(v);
            else if (label === "α") setVmax(v);
            else if (label === "γ") setDelta(v);
          }
        }}
        className="text-[11px] font-mono bg-input border border-input-border rounded text-text-primary text-center outline-none w-14 px-1 py-0.5"
      />
    </div>
  );

  return (
    <div>
      <button
        onClick={handleSimulate}
        disabled={isSimulating || !logic}
        className="simulate-btn w-full px-2.5 py-2.5 mb-3 text-[13px] font-semibold text-text-primary border-none rounded-md flex items-center justify-center gap-2 shadow-lg"
        style={{
          background:
            isSimulating || !logic
              ? "var(--color-surface)"
              : "var(--color-primary)",
          cursor: isSimulating || !logic ? "not-allowed" : "pointer",
        }}
      >
        {isSimulating && <Spinner />}
        {isSimulating ? "Simulating..." : "Run Simulation"}
      </button>

      <div className="flex gap-2 mb-3 items-center flex-wrap">
        <label className="text-[11px] text-text-secondary flex items-center gap-1">
          t:
          <input
            type="number"
            value={tStart}
            onChange={(e) => setTStart(Number(e.target.value))}
            className="text-[11px] font-mono bg-input border border-input-border rounded text-text-primary text-center outline-none w-14 px-1.5 py-1"
          />
          <span className="text-text-tertiary">&ndash;</span>
          <input
            type="number"
            value={tEnd}
            onChange={(e) => setTEnd(Number(e.target.value))}
            className="text-[11px] font-mono bg-input border border-input-border rounded text-text-primary text-center outline-none w-14 px-1.5 py-1"
          />
        </label>
        <label className="text-[11px] text-text-secondary flex items-center gap-1">
          dt:
          <input
            type="number"
            step="0.1"
            value={dt}
            onChange={(e) => setDt(Number(e.target.value))}
            className="text-[11px] font-mono bg-input border border-input-border rounded text-text-primary text-center outline-none w-[48px] px-1.5 py-1"
          />
        </label>
      </div>

      <div className="mb-3 space-y-1.5 bg-surface rounded-lg p-2.5">
        <SectionHeader className="!tracking-[4px] !mb-1.5">
          ODE Parameters
        </SectionHeader>
        {paramSlider("n", hillN, 1.0, 4.0, 0.1, handleHillChange)}
        {paramSlider("Kd", kd, 0.001, 1.0, 0.001, handleKdChange)}
        {paramSlider("α", vmax, 1.0, 20.0, 0.5, handleVmaxChange)}
        {paramSlider("γ", delta, 0.1, 1.0, 0.1, handleDeltaChange)}
      </div>

      {error && <ErrorBox>{error}</ErrorBox>}

      {chartData && chartData.length > 0 && (
        <div className="bg-surface rounded-lg p-2.5">
          <SectionHeader className="!tracking-[4px]">
            Time-series ({simResult?.num_points} points)
          </SectionHeader>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
              />
              <XAxis
                dataKey="time"
                stroke="var(--color-text-tertiary)"
                tick={{ fontSize: 10 }}
              />
              <YAxis
                stroke="var(--color-text-tertiary)"
                tick={{ fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-panel)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "4px",
                  fontSize: 11,
                }}
                labelStyle={{ color: "var(--color-text-secondary)" }}
              />
              <Legend
                wrapperStyle={{
                  fontSize: 11,
                  color: "var(--color-text-secondary)",
                }}
              />
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
                  <span
                    className="size-2 rounded-full inline-block"
                    style={{
                      background: CHART_COLORS[i % CHART_COLORS.length],
                    }}
                  />
                  <span className="text-[11px] text-text-secondary font-mono">
                    {sp}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!simResult && !error && (
        <div className="bg-surface border border-dashed border-border rounded-lg p-6 text-center">
          <div className="text-[28px] mb-1.5 text-text-tertiary">
            {ICON.SPINNER}
          </div>
          <div className="text-[11px] text-text-tertiary">
            Run a simulation to see time-series data
          </div>
        </div>
      )}
    </div>
  );
}
