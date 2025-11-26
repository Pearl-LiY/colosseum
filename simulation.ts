import { StrategyMetric, Position, CycleLog, AssetClass, Side, ProductType } from './types';

// --- CONFIGURATION ---

const SPOT_STRATEGIES_CONFIG = [
  { id: 'news_v1', name: 'News_v1', color: '#10b981' },
  { id: 'news_v2', name: 'News_v2', color: '#3b82f6' },
  { id: 'news_v3', name: 'News_v3', color: '#8b5cf6' },
  { id: 'news_v4', name: 'News_v4', color: '#ec4899' },
  { id: 'sched_news', name: 'Scheduled News', color: '#f59e0b' },
  { id: 'carry', name: 'Carry Trade', color: '#6366f1' },
  { id: 'tech', name: 'Technical Analysis', color: '#14b8a6' },
];

const OPTION_STRATEGIES_CONFIG = [
  { id: 'opt_news_v1', name: 'News_v1', color: '#10b981' },
  { id: 'opt_news_v2', name: 'News_v2', color: '#3b82f6' },
  { id: 'opt_sched', name: 'Scheduled News', color: '#f59e0b' },
  { id: 'opt_carry', name: 'Carry Trade', color: '#6366f1' },
  { id: 'opt_flow', name: 'Flow', color: '#ec4899' },
  { id: 'opt_vol', name: 'Volatility', color: '#8b5cf6' }, // Added to make 6
];

const FX_PAIRS = ['EURUSD', 'USDJPY', 'GBPUSD', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD'];
const OPTION_PRODUCTS: ProductType[] = ['Call', 'Put', 'Straddle', 'Strangle'];

// --- STATE GENERATORS ---

const createStrategy = (config: { id: string, name: string, color: string }, isOption: boolean): StrategyMetric => ({
  id: config.id,
  name: config.name,
  color: config.color,
  totalPnlPips: isOption ? undefined : Math.floor(Math.random() * 2000) + 500,
  totalPnlUsd: Math.floor(Math.random() * 50000) + 10000,
  dailyPnlPips: isOption ? undefined : Math.floor(Math.random() * 50) - 10,
  dailyPnlUsd: Math.floor(Math.random() * 2000) - 500,
  sharpeRatio: 1.2 + Math.random(),
  winRate: 50 + Math.random() * 15,
  maxDrawdown: Math.random() * 15,
  status: 'RUNNING',
  equityCurve: Array.from({ length: 50 }, (_, i) => ({
    time: `10:${i < 10 ? '0' + i : i}`,
    value: 1000 + (i * 10) + (Math.random() * 100 - 50)
  })),
  // Option Greeks History
  deltaCurve: isOption ? Array.from({ length: 50 }, (_, i) => ({ time: `10:${i}`, value: (Math.random() - 0.5) * 100 })) : undefined,
  gammaCurve: isOption ? Array.from({ length: 50 }, (_, i) => ({ time: `10:${i}`, value: Math.random() * 50 })) : undefined,
  vegaCurve: isOption ? Array.from({ length: 50 }, (_, i) => ({ time: `10:${i}`, value: Math.random() * 200 })) : undefined,
});

// --- STATE STORAGE ---

interface MarketState {
  strategies: StrategyMetric[];
  positions: Position[];
  logs: CycleLog[];
}

let spotState: MarketState = {
  strategies: SPOT_STRATEGIES_CONFIG.map(c => createStrategy(c, false)),
  positions: [],
  logs: []
};

let optionState: MarketState = {
  strategies: OPTION_STRATEGIES_CONFIG.map(c => createStrategy(c, true)),
  positions: [],
  logs: []
};

// Initial Data Population
const populateInitialLogs = (state: MarketState, configs: any[], isOption: boolean) => {
  let logId = 1000;
  state.logs = [
    generateLog(configs[0].id, logId--, isOption),
    generateLog(configs[1].id, logId--, isOption)
  ];
};

function generateLog(strategyId: string, id: number, isOption: boolean): CycleLog {
  const pair = FX_PAIRS[Math.floor(Math.random() * FX_PAIRS.length)];
  const product = isOption ? OPTION_PRODUCTS[Math.floor(Math.random() * OPTION_PRODUCTS.length)] : '';
  const ticker = isOption ? `${pair} ${product}` : pair;
  
  return {
    id,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    strategyId,
    status: 'Success',
    inputPrompt: isOption 
      ? `Analyze implied volatility skew for ${pair}. Calculate Greeks for ${product}.`
      : `Analyze price action for ${pair}. Check macro calendar.`,
    chainOfThought: isOption
      ? `IV percentile at 85%. \nGamma exposure risk high. \nDelta hedging required.`
      : `RSI diverging on H1 timeframe. \nSupport level tested twice.`,
    decisions: [
      { ticker: ticker, action: Math.random() > 0.5 ? 'HOLD' : (Math.random() > 0.5 ? 'BUY' : 'SELL'), reason: 'Signal Threshold Met' }
    ]
  };
}

populateInitialLogs(spotState, SPOT_STRATEGIES_CONFIG, false);
populateInitialLogs(optionState, OPTION_STRATEGIES_CONFIG, true);

// --- SIMULATION LOGIC ---

export const SimulationService = {
  getInitialState: (assetClass: AssetClass) => {
    return assetClass === 'SPOT' ? spotState : optionState;
  },

  tick: () => {
    // Simulate both worlds regardless of view, to keep them alive
    spotState = simulateTick(spotState, 'SPOT');
    optionState = simulateTick(optionState, 'OPTION');

    return { spotState, optionState };
  }
};

function simulateTick(state: MarketState, type: AssetClass): MarketState {
  // 1. Update Positions
  const newPositions: Position[] = state.positions.map(pos => {
    const volatility = type === 'SPOT' ? 0.0002 : 0.0005;
    const change = (Math.random() - 0.5) * volatility;
    
    const newMark = pos.markPrice + change;
    let pnlUsd = pos.unrealizedPnlUsd + (Math.random() - 0.5) * 50; // Simple random walk for PnL USD
    
    // For Spot, calculate Pips
    let pnlPips = pos.unrealizedPnlPips;
    if (type === 'SPOT' && pnlPips !== undefined) {
      const diff = pos.side === Side.LONG ? (newMark - pos.entryPrice) : (pos.entryPrice - newMark);
      pnlPips = diff * 10000;
      pnlUsd = pnlPips * pos.quantity * 10;
    }

    // Greeks noise
    const delta = pos.delta ? Math.max(-100, Math.min(100, pos.delta + (Math.random() - 0.5) * 2)) : undefined;
    const gamma = pos.gamma ? Math.max(0, pos.gamma + (Math.random() - 0.5)) : undefined;
    const vega = pos.vega ? Math.max(0, pos.vega + (Math.random() - 0.5) * 5) : undefined;

    return {
      ...pos,
      markPrice: newMark,
      unrealizedPnlPips: pnlPips,
      unrealizedPnlUsd: pnlUsd,
      delta,
      gamma,
      vega
    };
  });

  // 2. Randomly Open/Close
  if (Math.random() > 0.85) {
    if (newPositions.length > 8) newPositions.shift();
    
    const pair = FX_PAIRS[Math.floor(Math.random() * FX_PAIRS.length)];
    const side = Math.random() > 0.5 ? Side.LONG : Side.SHORT;
    const price = 1.0500 + Math.random() * 0.1;

    if (type === 'SPOT') {
      newPositions.push({
        symbol: pair,
        side,
        entryPrice: price,
        markPrice: price,
        quantity: Math.floor(Math.random() * 5) + 1,
        leverage: 30,
        unrealizedPnlPips: 0,
        unrealizedPnlUsd: 0
      });
    } else {
      const product = OPTION_PRODUCTS[Math.floor(Math.random() * OPTION_PRODUCTS.length)];
      newPositions.push({
        symbol: pair,
        productType: product,
        side,
        entryPrice: 0, // Not used for visual much in options table, usually Strike
        strikePrice: price,
        markPrice: price,
        quantity: Math.floor(Math.random() * 10) + 1,
        leverage: 1,
        unrealizedPnlUsd: 0,
        delta: (Math.random() - 0.5) * 50,
        gamma: Math.random() * 10,
        vega: Math.random() * 50
      });
    }

    // Add Log
    const strategies = type === 'SPOT' ? SPOT_STRATEGIES_CONFIG : OPTION_STRATEGIES_CONFIG;
    const randStrat = strategies[Math.floor(Math.random() * strategies.length)];
    const newLog = generateLog(randStrat.id, Math.floor(Math.random() * 100000), type === 'OPTION');
    
    state.logs = [newLog, ...state.logs].slice(0, 20);
  }

  // 3. Update Strategies & Charts
  const newStrategies = state.strategies.map(s => {
    // PnL Walk
    const pnlChange = (Math.random() - 0.45) * (type === 'SPOT' ? 5 : 50);
    const newDaily = s.dailyPnlUsd + pnlChange;
    
    // Update Equity Curve
    const newEquityCurve = [...s.equityCurve];
    const lastEq = newEquityCurve[newEquityCurve.length - 1];
    if (Math.random() > 0.7) {
      const now = new Date();
      newEquityCurve.push({ time: `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`, value: lastEq.value + pnlChange });
      if (newEquityCurve.length > 60) newEquityCurve.shift();
    } else {
      newEquityCurve[newEquityCurve.length - 1] = { ...lastEq, value: lastEq.value + pnlChange };
    }

    // Update Greeks Curves (Option Only)
    let newDelta = s.deltaCurve ? [...s.deltaCurve] : undefined;
    let newGamma = s.gammaCurve ? [...s.gammaCurve] : undefined;
    let newVega = s.vegaCurve ? [...s.vegaCurve] : undefined;

    if (type === 'OPTION' && newDelta && newGamma && newVega) {
       updateCurve(newDelta, (Math.random() - 0.5) * 5);
       updateCurve(newGamma, (Math.random() - 0.5) * 1);
       updateCurve(newVega, (Math.random() - 0.5) * 3);
    }

    // Spot specifics
    let newTotalPips = s.totalPnlPips;
    let newDailyPips = s.dailyPnlPips;
    if (type === 'SPOT' && newTotalPips !== undefined && newDailyPips !== undefined) {
      const pipsChange = (Math.random() - 0.45) * 2;
      newTotalPips += pipsChange;
      newDailyPips += pipsChange;
    }

    return {
      ...s,
      equityCurve: newEquityCurve,
      deltaCurve: newDelta,
      gammaCurve: newGamma,
      vegaCurve: newVega,
      totalPnlPips: newTotalPips,
      dailyPnlPips: newDailyPips,
      totalPnlUsd: s.totalPnlUsd + pnlChange,
      dailyPnlUsd: newDaily
    };
  });

  return {
    ...state,
    strategies: newStrategies,
    positions: newPositions,
    logs: state.logs // logs updated in place above via slice
  };
}

function updateCurve(curve: any[], change: number) {
  const last = curve[curve.length - 1];
  if (Math.random() > 0.7) {
     const now = new Date();
     curve.push({ time: `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`, value: last.value + change });
     if (curve.length > 60) curve.shift();
  } else {
     curve[curve.length - 1] = { ...last, value: last.value + change };
  }
}