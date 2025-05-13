import { useState } from "react";
import ConfigPanel from "./components/ConfigPanel";
import TrainingChart from "./components/TrainingChart";
import PerformanceStats from "./components/PerformanceStats";
import PolicyHeatmap from "./components/PolicyHeatmap";
import LLMExplanation from "./components/LLMExplanation";
import { trainAgent, type TrainResponse } from "./api/client";
import { loadPrices } from "./data/loadPrices";

function App() {
  const [result, setResult] = useState<TrainResponse | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [ticker, setTicker] = useState("");

  const handleTrain = async (config: {
    ticker: string;
    alpha: number;
    gamma: number;
    epsilon: number;
    episodes: number;
  }) => {
    setIsTraining(true);
    setTicker(config.ticker);
    try {
      const prices = await loadPrices(config.ticker);
      const response = await trainAgent({
        prices,
        alpha: config.alpha,
        gamma: config.gamma,
        epsilon: config.epsilon,
        episodes: config.episodes,
      });
      setResult(response);
    } catch (err) {
      console.error("Training failed:", err);
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-10 max-w-[1400px] mx-auto">
      {/* Header */}
      <header className="mb-10 animate-in">
        <div className="flex items-baseline gap-3 mb-2">
          <h1 className="text-4xl tracking-tight" style={{ color: "var(--accent)" }}>
            TradeRL
          </h1>
          <span
            className="font-mono text-xs tracking-widest uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            Q-Learning Trading Agent
          </span>
        </div>
        <div
          className="h-px w-full"
          style={{ background: "linear-gradient(to right, var(--accent), transparent)" }}
        />
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-3 animate-in animate-in-delay-1">
          <ConfigPanel onTrain={handleTrain} isTraining={isTraining} />
        </aside>
        <main className="lg:col-span-9 space-y-6">
          {result ? (
            <>
              <div className="animate-in animate-in-delay-1">
                <PerformanceStats
                  finalReturn={result.finalReturn}
                  buyHoldReturn={result.buyHoldReturn}
                  ticker={ticker}
                />
              </div>
              <div className="animate-in animate-in-delay-2">
                <TrainingChart episodeRewards={result.episodeRewards} />
              </div>
              <div className="animate-in animate-in-delay-3">
                <PolicyHeatmap qTable={result.qTable} />
              </div>
              <div className="animate-in animate-in-delay-4">
                <LLMExplanation result={result} ticker={ticker} />
              </div>
            </>
          ) : (
            <div
              className="rounded-xl p-16 flex flex-col items-center justify-center text-center"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
            >
              <div
                className="text-5xl mb-4"
                style={{ color: "var(--text-muted)" }}
              >
              </div>
              <p style={{ color: "var(--text-secondary)" }} className="text-lg mb-1">
                Configure parameters and train an agent
              </p>
              <p style={{ color: "var(--text-muted)" }} className="text-sm">
                Select a ticker, adjust hyperparameters, then click Train Agent
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;