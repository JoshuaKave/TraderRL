import { useState } from "react";

const TICKERS = ["AAPL", "SPY", "TSLA", "INTC", "BA", "XOM", "GE", "PYPL", "META", "COIN"];

interface ConfigPanelProps {
  onTrain: (config: {
    ticker: string;
    alpha: number;
    gamma: number;
    epsilon: number;
    episodes: number;
  }) => void;
  isTraining: boolean;
}

export default function ConfigPanel({ onTrain, isTraining }: ConfigPanelProps) {
  const [ticker, setTicker] = useState("AAPL");
  const [alpha, setAlpha] = useState(0.1);
  const [gamma, setGamma] = useState(0.95);
  const [epsilon, setEpsilon] = useState(0.1);
  const [episodes, setEpisodes] = useState(500);

  return (
    <div
      className="rounded-xl p-5 space-y-5"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
    >
      <h2 className="text-xl" style={{ color: "var(--text-primary)" }}>
        Parameters
      </h2>

      <div>
        <label
          className="block text-xs font-mono uppercase tracking-wider mb-2"
          style={{ color: "var(--text-muted)" }}
        >
          Ticker
        </label>
        <select
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          className="w-full rounded-lg px-3 py-2.5 text-sm font-mono"
          style={{ background: "var(--bg-input)", border: "1px solid var(--border)" }}
        >
          {TICKERS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <SliderParam
        label="Learning Rate"
        symbol="α"
        value={alpha}
        onChange={setAlpha}
        min={0.01}
        max={0.5}
        step={0.01}
      />
      <SliderParam
        label="Discount Factor"
        symbol="γ"
        value={gamma}
        onChange={setGamma}
        min={0.5}
        max={1.0}
        step={0.01}
      />
      <SliderParam
        label="Exploration Rate"
        symbol="ε"
        value={epsilon}
        onChange={setEpsilon}
        min={0.01}
        max={1.0}
        step={0.01}
      />
      <SliderParam
        label="Episodes"
        symbol="#"
        value={episodes}
        onChange={setEpisodes}
        min={50}
        max={2000}
        step={50}
        isInt
      />
      <button
        onClick={() => onTrain({ ticker, alpha, gamma, epsilon, episodes })}
        disabled={isTraining}
        className="w-full py-3 rounded-lg font-mono text-sm uppercase tracking-wider transition-all duration-200"
        style={{
          background: isTraining ? "var(--border)" : "var(--accent)",
          color: isTraining ? "var(--text-muted)" : "var(--bg-primary)",
          cursor: isTraining ? "not-allowed" : "pointer",
        }}
        onMouseEnter={(e) => {
          if (!isTraining) e.currentTarget.style.opacity = "0.85";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "1";
        }}
      >
        {isTraining ? "Training…" : "Train Agent"}
      </button>
    </div>
  );
}

function SliderParam({
  label,
  symbol,
  value,
  onChange,
  min,
  max,
  step,
  isInt = false,
}: {
  label: string;
  symbol: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  isInt?: boolean;
}) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <label
          className="text-xs font-mono uppercase tracking-wider"
          style={{ color: "var(--text-muted)" }}
        >
          {label} <span style={{ color: "var(--text-secondary)" }}>({symbol})</span>
        </label>
        <span
          className="font-mono text-sm"
          style={{ color: "var(--accent)" }}
        >
          {isInt ? value : value.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(isInt ? parseInt(e.target.value) : parseFloat(e.target.value))}
      />
    </div>
  );
}