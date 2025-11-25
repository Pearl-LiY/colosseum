export enum Side {
  LONG = 'LONG',
  SHORT = 'SHORT'
}

export interface Position {
  symbol: string;
  side: Side;
  entryPrice: number;
  markPrice: number;
  quantity: number; // in Lots
  leverage: number;
  unrealizedPnlPips: number;
  unrealizedPnlUsd: number;
}

export interface StrategyMetric {
  id: string;
  name: string;
  totalPnlPips: number; // Changed from totalPnl USD
  dailyPnlPips: number;
  sharpeRatio: number;
  winRate: number;
  maxDrawdown: number; // in %
  status: 'RUNNING' | 'STOPPED' | 'PAUSED';
  color: string; // For chart identification
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

export interface EquityPoint {
  time: string;
  value: number; // In Pips
}

export type ViewMode = 'DETAILS' | 'COMPETITION';
