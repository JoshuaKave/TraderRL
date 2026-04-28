import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function explainPolicy(
  qTable: number[][],
  ticker: string,
  agentReturn: number,
  buyHoldReturn: number
): Promise<string> {
  const formattedQ = qTable
    .map((row, i) => {
      const trend = ["StrongDown", "Down", "Flat", "Up", "StrongUp"][Math.floor(i / 6)];
      const vol = ["Low", "Med", "High"][Math.floor((i % 6) / 2)];
      const pos = i % 2 === 0 ? "Empty" : "Holding";
      const best = row[0] > row[1] && row[0] > row[2] ? "Buy" : row[2] > row[1] ? "Sell" : "Hold";
      return `State ${i} [${trend}, ${vol}, ${pos}]: Buy=${row[0].toFixed(4)} Hold=${row[1].toFixed(4)} Sell=${row[2].toFixed(4)} → ${best}`;
    })
    .join("\n");

  const prompt = `You are analyzing the learned policy of a Q-learning trading agent.

**Setup:**
- Ticker: ${ticker}
- State features: price trend (5 levels), volatility (3 levels), position (holding/not)
- Actions: Buy, Hold, Sell

**Performance:**
- Agent return: ${(agentReturn * 100).toFixed(2)}%
- Buy-and-hold return: ${(buyHoldReturn * 100).toFixed(2)}%

**Learned Q-Table:**
${formattedQ}

Explain in 2-3 paragraphs:
1. What strategy did the agent learn? When does it prefer to buy vs sell?
2. What market patterns is it exploiting?
3. What are the limitations of this strategy?

Write for a technical audience. Be specific about which states drive which actions.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0].message.content ?? "No explanation generated.";
}