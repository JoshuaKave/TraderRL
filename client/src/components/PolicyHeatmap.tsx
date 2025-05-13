const TRENDS = ["Strong↓", "Down", "Flat", "Up", "Strong↑"];
const VOLS = ["Low", "Med", "High"];
const POSITIONS = ["Empty", "Holding"];
const ACTIONS = ["Buy", "Hold", "Sell"];

interface PolicyHeatmapProps {
  qTable: number[][];
}

export default function PolicyHeatmap({ qTable }: PolicyHeatmapProps) {
  const allValues = qTable.flat();
  const maxQ = Math.max(...allValues);
  const minQ = Math.min(...allValues);
  const range = maxQ - minQ || 1;

  function getCellStyle(value: number, isBest: boolean): React.CSSProperties {
    const normalized = (value - minQ) / range;

    let bg: string;
    let color: string;

    if (normalized > 0.7) {
      bg = "rgba(52, 211, 153, 0.25)";
      color = "#34d399";
    } else if (normalized > 0.4) {
      bg = "rgba(52, 211, 153, 0.10)";
      color = "#34d399";
    } else if (normalized > 0.15) {
      bg = "rgba(212, 168, 67, 0.10)";
      color = "#d4a843";
    } else {
      bg = "rgba(248, 113, 113, 0.08)";
      color = "#f87171";
    }

    return {
      background: bg,
      color: color,
      fontWeight: isBest ? 600 : 400,
      boxShadow: isBest ? `inset 0 0 0 1.5px ${color}` : "none",
    };
  }

  function getBestAction(row: number[]): number {
    return row.indexOf(Math.max(...row));
  }

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
    >
      <h3 className="text-lg mb-4" style={{ color: "var(--text-primary)" }}>
        Learned Policy
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse font-mono text-xs">
          <thead>
            <tr>
              {["Trend", "Vol", "Position", "Buy", "Hold", "Sell", "Best"].map((h) => (
                <th
                  key={h}
                  className="px-3 py-2.5 text-left uppercase tracking-wider"
                  style={{
                    color: "var(--text-muted)",
                    borderBottom: "1px solid var(--border)",
                    fontSize: "10px",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {qTable.map((row, i) => {
              const trend = TRENDS[Math.floor(i / 6)];
              const vol = VOLS[Math.floor((i % 6) / 2)];
              const pos = POSITIONS[i % 2];
              const best = getBestAction(row);

              return (
                <tr
                  key={i}
                  style={{ borderBottom: "1px solid var(--border-subtle)" }}
                  className="transition-colors duration-150"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--bg-card-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <td className="px-3 py-2" style={{ color: "var(--text-secondary)" }}>{trend}</td>
                  <td className="px-3 py-2" style={{ color: "var(--text-secondary)" }}>{vol}</td>
                  <td className="px-3 py-2" style={{ color: pos === "Holding" ? "var(--accent)" : "var(--text-muted)" }}>
                    {pos}
                  </td>
                  {row.map((val, j) => (
                    <td
                      key={j}
                      className="px-3 py-2 text-right rounded"
                      style={getCellStyle(val, j === best)}
                    >
                      {val.toFixed(4)}
                    </td>
                  ))}
                  <td
                    className="px-3 py-2 font-semibold"
                    style={{ color: "var(--accent)" }}
                  >
                    {ACTIONS[best]}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}