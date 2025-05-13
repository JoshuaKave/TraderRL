import { useState } from "react";
import { explainPolicy, type TrainResponse } from "../api/client";

interface LLMExplanationProps {
  result: TrainResponse;
  ticker: string;
}

export default function LLMExplanation({ result, ticker }: LLMExplanationProps) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleExplain = async () => {
    setLoading(true);
    try {
      const res = await explainPolicy(
        result.qTable,
        ticker,
        result.finalReturn,
        result.buyHoldReturn
      );
      setExplanation(res.explanation);
    } catch (err) {
      console.error("Explanation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
    >
      <h3 className="text-lg mb-4" style={{ color: "var(--text-primary)" }}>
        Strategy Analysis
      </h3>

      {!explanation ? (
        <div className="flex flex-col items-center py-8">
          <p
            className="text-sm mb-4"
            style={{ color: "var(--text-secondary)" }}
          >
            Use GPT-4o-mini to analyze the learned Q-table and explain the agent's strategy
          </p>
          <button
            onClick={handleExplain}
            disabled={loading}
            className="px-6 py-2.5 rounded-lg font-mono text-sm transition-all duration-200"
            style={{
              background: loading ? "var(--border)" : "transparent",
              color: loading ? "var(--text-muted)" : "var(--accent)",
              border: `1px solid ${loading ? "var(--border)" : "var(--accent)"}`,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = "var(--accent-dim)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--text-muted)", borderTopColor: "transparent" }} />
                Analyzing…
              </span>
            ) : (
              "Explain Strategy"
            )}
          </button>
        </div>
      ) : (
        <div
          className="text-sm leading-relaxed space-y-3"
          style={{ color: "var(--text-secondary)" }}
        >
          {explanation.split("\n\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      )}
    </div>
  );
}