import {NUM_STATES, NUM_ACTIONS, Actions} from './environment.js';

export class QAgent
{
	qTable: number[][];
	alpha: number;
	gamma: number;
	epsilon: number;

	constructor(alpha: number, gamma: number, epsilon: number)
	{
		this.alpha = alpha;
		this.gamma = gamma;
		this.epsilon = epsilon;

		this.qTable = new Array(NUM_STATES);
		for(let i = 0; i < NUM_STATES; i++)
		{
			this.qTable[i] = new Array(NUM_ACTIONS).fill(0);
		}
	}

	selectAction(stateIndex: number): Actions
	{
		if(Math.random() < this.epsilon)
		{
			return Math.floor(Math.random() * NUM_ACTIONS) as Actions;
		}

		const qValues = this.qTable[stateIndex];
		let bestAction = 0;
		let bestValue = qValues[0];

		for(let a = 0; a < NUM_ACTIONS; a++)
		{
			if(qValues[a] > bestValue){
				bestValue = qValues[a];
				bestAction = a;
			}
		}

		return bestAction as Actions;
	}

	update(state: number, action: Actions, reward: number, nextState: number): void
	{
		const maxNextQ = Math.max(...this.qTable[nextState]);
		this.qTable[state][action] += this.alpha * (reward + this.gamma * maxNextQ - this.qTable[state][action]);
	}
}
