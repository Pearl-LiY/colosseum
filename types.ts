export enum Side {
  LONG = 'LONG',
  SHORT = 'SHORT'
}

export type AssetClass = 'SPOT' | 'OPTION';

export type ProductType = 'Call' | 'Put' | 'Straddle' | 'Strangle';

export interface Position {
  symbol: string;
  productType?: ProductType; // For Options
  side: Side;
  entryPrice: number; // For Spot
  strikePrice?: number; // For Options
  markPrice: number;
  quantity: number; // in Lots
  leverage: number;
  unrealizedPnlPips?: number; // Spot only
  unrealizedPnlUsd: number;
  // Greeks for Options
  delta?: number;
  gamma?: number;
  vega?: number;
}

export interface EquityPoint {
  time: string;
  value: number;
}

export interface StrategyMetric {
  id: string;
  name: string;
  totalPnlPips?: number; // Spot
  totalPnlUsd: number;   // Both (Primary for Option)
  dailyPnlPips?: number; // Spot
  dailyPnlUsd: number;   // Both
  sharpeRatio: number;
  winRate: number;
  maxDrawdown: number; // in %
  status: 'RUNNING' | 'STOPPED' | 'PAUSED';
  color: string;
  // History Data
  equityCurve: EquityPoint[]; // PnL Curve
  deltaCurve?: EquityPoint[]; // For Option
  gammaCurve?: EquityPoint[]; // For Option
  vegaCurve?: EquityPoint[];  // For Option
}

export interface CycleLog {
  id: number;
  timestamp: string;
  strategyId: string;
  status: 'Success' | 'Failed' | 'Processing';
  inputPrompt?: string;
  chainOfThought?: string;
  decisions: {
    ticker: string;
    action: 'BUY' | 'SELL' | 'HOLD';
    reason: string;
  }[];
}

export type ViewMode = 'DETAILS' | 'COMPETITION';
