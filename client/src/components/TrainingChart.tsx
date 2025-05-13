import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface TrainingChartProps {
  episodeRewards: number[];
}

export default function TrainingChart({ episodeRewards }: TrainingChartProps) {
  const data = episodeRewards.map((reward, i) => ({
    episode: i + 1,
    reward: parseFloat(reward.toFixed(6)),
  }));

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
    >
      <h3 className="text-lg mb-4" style={{ color: "var(--text-primary)" }}>
        Training Progress
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
          <CartesianGrid stroke="#1e1e28" strokeDasharray="3 3" />
          <XAxis
            dataKey="episode"
            stroke="#55556a"
            tick={{ fill: "#55556a", fontSize: 11, fontFamily: "JetBrains Mono" }}
            label={{
              value: "Episode",
              position: "insideBottom",
              offset: -10,
              fill: "#55556a",
              fontSize: 11,
              fontFamily: "JetBrains Mono",
            }}
          />
          <YAxis
            stroke="#55556a"
            tick={{ fill: "#55556a", fontSize: 11, fontFamily: "JetBrains Mono" }}
            label={{
              value: "Reward",
              angle: -90,
              position: "insideLeft",
              offset: 10,
              fill: "#55556a",
              fontSize: 11,
              fontFamily: "JetBrains Mono",
            }}
          />
          <Tooltip
            contentStyle={{
              background: "#131318",
              border: "1px solid #2a2a35",
              borderRadius: "8px",
              fontFamily: "JetBrains Mono",
              fontSize: "12px",
              color: "#e8e8ec",
            }}
            labelStyle={{ color: "#8888a0" }}
          />
          <Line
            type="monotone"
            dataKey="reward"
            stroke="#d4a843"
            dot={false}
            strokeWidth={1.5}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}