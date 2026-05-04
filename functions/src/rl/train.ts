import {QAgent} from "./agent.js";
import {getState, step, LOOKBACK, Position} from "./environment.js";

export interface TrainConfig {
  prices: number[];
  alpha: number;
  gamma: number;
  epsilon: number;
  episodes: number;
}

export interface TrainResult {
  episodeRewards: number[];
  qTable: number[][];
  finalReturn: number;
  buyHoldReturn: number;
}

export function train(config: TrainConfig): TrainResult {
  const {prices, alpha, gamma, epsilon, episodes} = config;
  const agent = new QAgent(alpha, gamma, epsilon);
  const episodeRewards: number[] = [];

  let finalReturn = 0;

  for (let ep = 0; ep < episodes; ep++) {
    let state = getState(prices, LOOKBACK, Position.Unowned);
    state.entryPrice = 0;
    let totalReward = 0;

    agent.epsilon = Math.max(0.01, config.epsilon * (1 - ep / episodes));

    while (true) {
      const action = agent.selectAction(state.stateIndex);
      const result = step(prices, state, action);

      agent.update(state.stateIndex, action, result.reward, result.nextState.stateIndex);

      totalReward += result.reward;
      state = result.nextState;

      if (result.done) break;
    }

    episodeRewards.push(totalReward);

    if (ep === episodes - 1) {
      finalReturn = totalReward;
    }
  }

  const startPrice = prices[LOOKBACK];
  const endPrice = prices[prices.length - 1];
  const buyHoldReturn = (endPrice - startPrice) / startPrice;

  return {
    episodeRewards,
    qTable: agent.qTable,
    finalReturn,
    buyHoldReturn,
  };
}
