import * as functions from "firebase-functions";
import "dotenv/config";
import express from "express";
import cors from "cors";
import {train} from "./rl/train.js";
import {explainPolicy} from "./llm/explain.js";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/health", (req, res) => {
  res.json({status: "ok"});
});

app.post("/train", (req, res) => {
  const {prices, alpha, gamma, epsilon, episodes} = req.body;

  if (!prices || !Array.isArray(prices)) {
    res.status(400).json({error: "price array is required"});
    return;
  }

  const result = train({
    prices,
    alpha: alpha ?? 0.1,
    gamma: gamma ?? 0.95,
    epsilon: epsilon ?? 0.1,
    episodes: episodes ?? 500,
  });

  res.json(result);
});

app.post("/explain", async (req, res) => {
  const {qTable, ticker, agentReturn, buyHoldReturn} = req.body;

  if (!qTable || !ticker) {
    res.status(400).json({error: "qTable and ticker are required"});
    return;
  }

  try {
    const explanation =
      await explainPolicy(qTable, ticker, agentReturn, buyHoldReturn);
    res.json({explanation});
  } catch (err) {
    res.status(500).json({error: "Failed to generate explanation"});
  }
});

exports.api = functions.https.onRequest(app);
