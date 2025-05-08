const API_BASE = import.meta.env.DEV ? "http://127.0.0.1:5001/traderl-aff59/us-central1/api" : "https://us-central1-traderl-aff59.cloudfunctions.net/api";

export interface TrainRequest
{
    prices: number[];
    alpha: number;
    gamma: number;
    epsilon: number;
    episodes: number;
}

export interface TrainResponse
{
    episodeRewards: number[];
    qTable: number[][];
    finalReturn: number;
    buyHoldReturn: number;
}

export interface ExplainResponse
{
    explanation: string;
}

export async function trainAgent(config: TrainRequest): Promise<TrainResponse>
{
    const res = await fetch(`${API_BASE}/train`,
    {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(config),
    });
    if(!res.ok)
    {
        throw new Error("Training Faile");
    }
    return res.json();
}

export async function explainPolicy(
    qTable: number[][],
    ticker: string,
    agentReturn: number,
    buyHoldReturn: number
): Promise<ExplainResponse>
{
    const res = await fetch(`${API_BASE}/explain`,
    {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({qTable, ticker, agentReturn, buyHoldReturn}),
    });
    if(!res.ok)
    {
        throw new Error("Explanation Failed");
    }
    return res.json();
}