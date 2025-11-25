import { StrategyMetric, Position, CycleLog, EquityPoint, Side } from './types';

// Initial Configuration
const STRATEGY_CONFIGS = [
  { id: 'news_v1', name: 'News_v1', color: '#10b981' },
  { id: 'news_v2', name: 'News_v2', color: '#3b82f6' },
  { id: 'news_v3', name: 'News_v3', color: '#8b5cf6' },
  { id: 'news_v4', name: 'News_v4', color: '#ec4899' },
  { id: 'sched_news', name: 'Scheduled News', color: '#f59e0b' },
  { id: 'carry', name: 'Carry Trade', color: '#6366f1' },
  { id: 'tech', name: 'Technical Analysis', color: '#14b8a6' },
];

const FX_PAIRS = ['EURUSD', 'USDJPY', 'GBPUSD', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD'];

// State Containers (Acting as Database)
let strategies: StrategyMetric[] = STRATEGY_CONFIGS.map(s => ({
  id: s.id,
  name: s.name,
  color: s.color,
  totalPnlPips: Math.floor(Math.random() * 2000) + 500,
  dailyPnlPips: Math.floor(Math.random() * 50) - 10,
  sharpeRatio: 1.5 + Math.random(),
  winRate: 55 + Math.random() * 15,
  maxDrawdown: Math.random() * 10,
  status: 'RUNNING'
}));

let positions: Position[] = [];
let logs: CycleLog[] = [];
let equityHistory: Record<string, EquityPoint[]> = {};

// Initialize History
STRATEGY_CONFIGS.forEach(s => {
  equityHistory[s.id] = Array.from({ length: 50 }, (_, i) => ({
    time: `10:${i < 10 ? '0' + i : i}`,
    value: 1000 + (i * 10) + (Math.random() * 100 - 50)
  }));
});

// Helper to generate log
const generateLog = (strategyId: string, id: number) => {
  const pair = FX_PAIRS[Math.floor(Math.random() * FX_PAIRS.length)];
  return {
    id,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    strategyId,
    status: 'Success' as const,
    inputPrompt: `Analyze volatility surface for ${pair}. Check macro calendar for high impact events.`,
    chainOfThought: `Processing ${pair} spread. VIX is stable. \nImplied probability of hike is 20%. \nTechnical support level detected at recent swing low.`,
    decisions: [
      { ticker: pair, action: Math.random() > 0.5 ? 'HOLD' : (Math.random() > 0.5 ? 'BUY' : 'SELL') as any, reason: 'Alpha signal threshold met' },
      { ticker: FX_PAIRS[0], action: 'HOLD' as const, reason: 'Correlation check negative' }
    ]
  };
};

// Initialize some logs
let logCounter = 1000;
logs = [generateLog('news_v1', logCounter--), generateLog('carry', logCounter--)];

export const SimulationService = {
  // The "Tick" function called by polling
  tick: () => {
    // 1. Update Market Prices (Simulation) 
    // .map returns a new array with new objects, so we are safe from mutation errors here.
    positions = positions.map(pos => {
      // Create market noise
      const volatility = 2.5; // pips
      const noise = (Math.random() - 0.5) * volatility; 
      
      const newMarkPrice = pos.markPrice + (noise * 0.0001);
      const diff = pos.side === Side.LONG ? (newMarkPrice - pos.entryPrice) : (pos.entryPrice - newMarkPrice);
      const newPips = diff * 10000;

      return {
        ...pos,
        markPrice: newMarkPrice,
        unrealizedPnlPips: newPips,
        unrealizedPnlUsd: newPips * pos.quantity * 10, 
      };
    });

    // 2. Randomly Open/Close Positions (Less frequent)
    if (Math.random() > 0.85) {
      // Copy positions if we are going to modify length, though map above already gave us a new array.
      if (positions.length > 8) {
         positions = positions.slice(1);
      }
      
      const pair = FX_PAIRS[Math.floor(Math.random() * FX_PAIRS.length)];
      const side = Math.random() > 0.5 ? Side.LONG : Side.SHORT;
      const price = 1.0500 + Math.random() * 0.1;

      positions.push({
        symbol: pair,
        side,
        entryPrice: price,
        markPrice: price, // Start flat
        quantity: Math.floor(Math.random() * 5) + 1,
        leverage: 30,
        unrealizedPnlPips: 0,
        unrealizedPnlUsd: 0
      });
      
      // Add Log - CRITICAL: Must copy logs array before unshifting as the old array is frozen by React
      logs = [...logs];
      logs.unshift(generateLog(STRATEGY_CONFIGS[Math.floor(Math.random() * STRATEGY_CONFIGS.length)].id, ++logCounter));
      if (logs.length > 20) logs.pop();
    }

    // 3. Update Strategy PnL & Charts (Always drift slightly)
    strategies = strategies.map(s => {
      const volatility = 3;
      const change = (Math.random() - 0.48) * volatility; // Slight upward bias
      
      // Update history
      // CRITICAL: Create deep copy of the array we want to modify
      const oldHist = equityHistory[s.id];
      const newHist = [...oldHist]; 
      
      const lastVal = newHist[newHist.length - 1].value;
      const newVal = lastVal + change;
      
      // Only add new point every 5 ticks to keep chart smooth but update current value
      if (Math.random() > 0.8) {
         const now = new Date();
         const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
         // Safe to push to newHist (the copy)
         newHist.push({ time: timeStr, value: newVal });
         if (newHist.length > 60) newHist.shift();
      } else {
         // Update last point in place
         // CRITICAL: Must copy the object at the specific index before modifying it
         const lastPoint = { ...newHist[newHist.length - 1] };
         lastPoint.value = newVal;
         newHist[newHist.length - 1] = lastPoint;
      }

      // Update the global reference to the new array
      equityHistory[s.id] = newHist;

      return {
        ...s,
        totalPnlPips: newVal,
        dailyPnlPips: s.dailyPnlPips + change
      };
    });

    return {
      strategies,
      positions,
      logs,
      equityHistory: { ...equityHistory } // Return a shallow copy of the container
    };
  },

  getInitialState: () => ({
    strategies,
    positions,
    logs,
    equityHistory: { ...equityHistory }
  })
};