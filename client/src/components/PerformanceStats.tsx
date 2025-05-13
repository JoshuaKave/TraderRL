interface PerformanceStatsProps {
  finalReturn: number;
  buyHoldReturn: number;
  ticker: string;
}

export default function PerformanceStats({ finalReturn, buyHoldReturn, ticker }: PerformanceStatsProps) {
  const agentPct = (finalReturn * 100).toFixed(2);
  const holdPct = (buyHoldReturn * 100).toFixed(2);
  const agentWins = finalReturn > buyHoldReturn;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div
        className="rounded-xl p-5 flex flex-col justify-center"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
      >
        <span
          className="text-xs font-mono uppercase tracking-wider mb-1"
          style={{ color: "var(--text-muted)" }}
        >
          Ticker
        </span>
        <span
          className="text-3xl font-mono font-semibold"
          style={{ color: "var(--accent)" }}
        >
          {ticker}
        </span>
      </div>

      <div
        className="rounded-xl p-5"
        style={{
          background: agentWins ? "var(--positive-dim)" : "var(--negative-dim)",
          border: `1px solid ${agentWins ? "var(--positive)" : "var(--negative)"}20`,
        }}
      >
        <span
          className="text-xs font-mono uppercase tracking-wider mb-1 block"
          style={{ color: "var(--text-muted)" }}
        >
          Agent Return
        </span>
        <span
          className="text-3xl font-mono font-semibold"
          style={{ color: agentWins ? "var(--positive)" : "var(--negative)" }}
        >
          {agentPct}%
        </span>
      </div>

      <div
        className="rounded-xl p-5"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
      >
        <span
          className="text-xs font-mono uppercase tracking-wider mb-1 block"
          style={{ color: "var(--text-muted)" }}
        >
          Buy &amp; Hold
        </span>
        <span
          className="text-3xl font-mono font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          {holdPct}%
        </span>
      </div>
    </div>
  );
}