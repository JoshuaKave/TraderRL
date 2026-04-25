export const LOOKBACK = 5;

export const NUM_STATES = 30;
export const NUM_ACTIONS = 3;

export interface EnvironmentState
{

	stateIndex: number;
	position: Position;
	entryPrice: number;
	dayIndex: number;

}

export interface StepResult
{
	nextState: EnvironmentState;
	reward: number;
	done: boolean;
}

const enum TrendValues
{

	StrongDown,
	Down,
	Flat,
	Up,
	StrongUp

}

const enum Volatility
{

	Low,
	Medium,
	High

}

export const enum Actions
{
	Buy,
	Hold,
	Sell
}

const enum Position
{
	Unowned,
	Owned
}


export function getState(prices: number[], dayIndex: number, position: Position): EnvironmentState
{
	const pctChange = (prices[dayIndex] - prices[dayIndex - LOOKBACK]) / prices[dayIndex - LOOKBACK];
	const trend = getTrendValue(pctChange);

	const dailyReturns: number[] = [];
	for(let i = dayIndex - LOOKBACK + 1; i <= dayIndex; i++)
	{
		dailyReturns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
	}
	const vol = getVolatilityValue(stddev(dailyReturns));

	return {
		stateIndex: computeStateIndex(trend, vol, position),
		position,
		entryPrice: 0,
		dayIndex,
	};
}

export function step(prices: number[], state: EnvironmentState, action: Actions): StepResult
{
	const currentPrice = prices[state.dayIndex];

	let reward = 0;
	let newPosition = state.position;
	let newEntryPrice = state.entryPrice;

	if(action === Actions.Buy)
	{
		if(state.position === Position.Unowned)
		{
			newPosition = Position.Owned;
			newEntryPrice = currentPrice;
			reward = 0;
		}
		else
		{
			reward = -0.01;
		}
	}
	else if(action === Actions.Sell)
	{
		if(state.position === Position.Owned)
		{
			newPosition = Position.Unowned;
			newEntryPrice = 0;
			reward = (currentPrice - state.entryPrice) / state.entryPrice;
		}	
		else
		{
			reward = -0.01;
		}
	}
	else
	{
		if(state.position === Position.Owned)
		{
			const nextPrice = prices[state.dayIndex + 1];
			reward = nextPrice > currentPrice ? 0.001 : 0;
		}
		else
		{
			reward = 0;
		}
	}

	const nextDayIndex = state.dayIndex + 1;
	const done = nextDayIndex >= prices.length - 1;

	const nextState = done ? { stateIndex: 0, position: newPosition, entryPrice: newEntryPrice, dayIndex: nextDayIndex } 
	: getState(prices, nextDayIndex, newPosition);

	nextState.entryPrice = newEntryPrice;

	return {nextState, reward, done};
}

function getTrendValue(pctChange: number): number
{

	if(pctChange < -0.03)
	{
		return TrendValues.StrongDown;
	}
	else if(pctChange < -0.01)
	{
		return TrendValues.Down;
	}
	else if(pctChange <= 0.01)
	{
		return TrendValues.Flat;
	}
	else if(pctChange <= 0.03)
	{
		return TrendValues.Up;
	}
	else
	{
		return TrendValues.StrongUp;
	}

}

function getVolatilityValue(stdDev: number): number
{

	if(stdDev < 0.01)
	{
		return Volatility.Low;
	}
	else if(stdDev <= 0.025)
	{
		return Volatility.Medium;
	}
	else
	{
		return Volatility.High;
	}

}

function stddev(values: number[]): number
{	

	const mean = values.reduce( (a,b) => a + b, 0) / values.length;
	const squaredDiffs = values.map( v => (v - mean) ** 2);
	
	return Math.sqrt(squaredDiffs.reduce( (a,b) => a + b, 0) / values.length);

}

function computeStateIndex(trend: number, vol: number, position: Position): number
{
	return trend * 6 + vol * 2 + position;
}


