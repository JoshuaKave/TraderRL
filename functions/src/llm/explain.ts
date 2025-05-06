import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates natural language explanation of the RL agent's learned Q-Table.
 * @param {number[][]} qTable The Q-Table values.
 * @param {string} ticker The stock ticker symbol.
 * @param {number} agentReturn The return of the agent.
 * @param {number} buyHoldReturn The return if holding.
 * @return {Promise<string>} The explanation in Markdown.
 */
export async function explainPolicy(
  qTable: number[][],
  ticker: string,
  agentReturn: number,
  buyHoldReturn: number
): Promise<string> {
  const formattedQ = qTable
    .map((row, i) => {
      const trends = ["StrongDown", "Down", "Flat", "Up", "StrongUp"];
      const trend = trends[Math.floor(i / 6)];
      const vol = ["Low", "Med", "High"][Math.floor((i % 6) / 2)];
      const pos = i % 2 === 0 ? "Empty" : "Holding";

      let best = "Hold";
      if (row[0] > row[1] && row[0] > row[2]) best = "Buy";
      else if (row[2] > row[1]) best = "Sell";

      const r0 = row[0].toFixed(4);
      const r1 = row[1].toFixed(4);
      const r2 = row[2].toFixed(4);

      return `State ${i} [${trend}, ${vol}, ${pos}]: ` +
        `Buy=${r0} Hold=${r1} Sell=${r2} → ${best}`;
    })
    .join("\n");

  const prompt = "You are analyzing the learned policy " +
    `of a Q-learning trading agent.

**Setup:**
- Ticker: ${ticker}
- State features: price trend (5 levels), volatility (3 levels), ` +
`position (holding/not)
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

Write for a technical audience. Be specific about ` +
"which states drive which actions.";

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{role: "user", content: prompt}],
  });

  return response.choices[0].message.content ?? "No explanation generated.";
}
