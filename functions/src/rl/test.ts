import { train } from "./train.js";
import { getState, step, LOOKBACK, NUM_STATES, NUM_ACTIONS, Position, Actions } from "./environment.js";
import { QAgent } from "./agent.js";

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.log(`  ✗ ${label}`);
    failed++;
  }
}

function generatePrices(length: number, trend: "up" | "down" | "flat"): number[] {
  const prices: number[] = [100];
  for (let i = 1; i < length; i++) {
    const noise = (Math.random() - 0.5) * 1.5;
    const drift = trend === "up" ? 0.2 : trend === "down" ? -0.2 : 0;
    prices.push(prices[i - 1] + drift + noise);
  }
  return prices;
}

// ── Test Suite ──

console.log("\n═══ Environment Tests ═══\n");

// State computation
console.log("getState:");
const testPrices = generatePrices(200, "up");
const state = getState(testPrices, LOOKBACK, Position.Unowned);
assert(state.stateIndex >= 0 && state.stateIndex < NUM_STATES, `stateIndex in range: ${state.stateIndex}`);
assert(state.position === Position.Unowned, `position is Unowned`);
assert(state.dayIndex === LOOKBACK, `dayIndex equals LOOKBACK`);

// State changes with position
const stateOwned = getState(testPrices, LOOKBACK, Position.Owned);
assert(state.stateIndex !== stateOwned.stateIndex, `different position → different stateIndex`);

console.log("\nBoundary checks:");
let threwError = false;
try {
  getState(testPrices, 2, Position.Unowned);
} catch {
  threwError = true;
}
assert(threwError, `getState throws when dayIndex < LOOKBACK`);

console.log("\nstep (Buy from Unowned):");
const buyState = getState(testPrices, 10, Position.Unowned);
buyState.entryPrice = 0;
const buyResult = step(testPrices, buyState, Actions.Buy);
assert(buyResult.nextState.position === Position.Owned, `position changes to Owned`);
assert(buyResult.nextState.entryPrice === testPrices[10], `entryPrice set to current price`);
assert(buyResult.reward === 0, `reward is 0`);

console.log("\nstep (Sell from Owned):");
const sellState = getState(testPrices, 50, Position.Owned);
sellState.entryPrice = testPrices[40];
const sellResult = step(testPrices, sellState, Actions.Sell);
assert(sellResult.nextState.position === Position.Unowned, `position changes to Unowned`);
assert(sellResult.nextState.entryPrice === 0, `entryPrice reset to 0`);
assert(sellResult.reward !== 0, `reward is non-zero: ${sellResult.reward.toFixed(4)}`);

console.log("\nstep (Invalid actions):");
const invalidBuy = getState(testPrices, 10, Position.Owned);
invalidBuy.entryPrice = 100;
const invalidBuyResult = step(testPrices, invalidBuy, Actions.Buy);
assert(invalidBuyResult.reward === -0.01, `buy while holding → penalty`);

const invalidSell = getState(testPrices, 10, Position.Unowned);
invalidSell.entryPrice = 0;
const invalidSellResult = step(testPrices, invalidSell, Actions.Sell);
assert(invalidSellResult.reward === -0.01, `sell while not holding → penalty`);

console.log("\nDone detection:");
const lateState = getState(testPrices, testPrices.length - 2, Position.Unowned);
lateState.entryPrice = 0;
const lateResult = step(testPrices, lateState, Actions.Hold);
assert(lateResult.done === true, `done=true at end of price data`);


console.log("\n═══ Agent Tests ═══\n");

const agent = new QAgent(0.1, 0.95, 0.1);

console.log("Q-table initialization:");
assert(agent.qTable.length === NUM_STATES, `Q-table has ${NUM_STATES} rows`);
assert(agent.qTable[0].length === NUM_ACTIONS, `Q-table has ${NUM_ACTIONS} columns`);
assert(agent.qTable.every(row => row.every(v => v === 0)), `all Q-values start at 0`);

console.log("\nQ-update:");
const oldValue = agent.qTable[5][1];
agent.update(5, 1, 0.5, 10);
assert(agent.qTable[5][1] !== oldValue, `Q-value changed after update`);
assert(agent.qTable[5][1] > oldValue, `Q-value increased with positive reward`);

console.log("\nExploration (epsilon=1.0):");
const explorerAgent = new QAgent(0.1, 0.95, 1.0);
explorerAgent.qTable[0] = [999, 0, 0];
const exploreCounts = [0, 0, 0];
for (let i = 0; i < 1000; i++) {
  exploreCounts[explorerAgent.selectAction(0)]++;
}
assert(exploreCounts.every(c => c > 200), `epsilon=1.0 picks all actions roughly equally: [${exploreCounts}]`);

console.log("\nExploitation (epsilon=0.0):");
const greedyAgent = new QAgent(0.1, 0.95, 0.0);
greedyAgent.qTable[0] = [0.1, 0.9, 0.3];
const greedyActions = new Set<number>();
for (let i = 0; i < 100; i++) {
  greedyActions.add(greedyAgent.selectAction(0));
}
assert(greedyActions.size === 1 && greedyActions.has(1), `epsilon=0 always picks best action`);


console.log("\n═══ Training Tests ═══\n");

console.log("Training on uptrend data:");
const upPrices = generatePrices(250, "up");
const upResult = train({ prices: upPrices, alpha: 0.1, gamma: 0.95, epsilon: 0.1, episodes: 200 });
assert(upResult.episodeRewards.length === 200, `got 200 episode rewards`);
assert(upResult.qTable.length === NUM_STATES, `Q-table shape correct`);
assert(upResult.buyHoldReturn > 0, `buy-and-hold positive in uptrend: ${(upResult.buyHoldReturn * 100).toFixed(1)}%`);

const earlyAvg = upResult.episodeRewards.slice(0, 20).reduce((a, b) => a + b, 0) / 20;
const lateAvg = upResult.episodeRewards.slice(-20).reduce((a, b) => a + b, 0) / 20;
assert(lateAvg > earlyAvg, `agent improves: early avg=${earlyAvg.toFixed(4)}, late avg=${lateAvg.toFixed(4)}`);

const hasLearned = upResult.qTable.some(row => row.some(v => v !== 0));
assert(hasLearned, `Q-table has non-zero values after training`);

console.log("\nTraining on downtrend data:");
const downPrices = generatePrices(250, "down");
const downResult = train({ prices: downPrices, alpha: 0.1, gamma: 0.95, epsilon: 0.1, episodes: 200 });
assert(downResult.buyHoldReturn < 0, `buy-and-hold negative in downtrend: ${(downResult.buyHoldReturn * 100).toFixed(1)}%`);



console.log(`\n═══ Results: ${passed} passed, ${failed} failed ═══\n`);
process.exit(failed > 0 ? 1 : 0);