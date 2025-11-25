import React from 'react';
import { Position, Side } from '../types';
import { LiveTicker } from './LiveTicker';

interface PositionsTableProps {
  positions: Position[];
}

export const PositionsTable: React.FC<PositionsTableProps> = ({ positions }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="text-gray-500 bg-gray-900 border-b border-gray-800 sticky top-0">
          <tr>
            <th className="px-4 py-3 font-medium">Pair</th>
            <th className="px-4 py-3 font-medium">Side</th>
            <th className="px-4 py-3 font-medium text-right">Size (Lots)</th>
            <th className="px-4 py-3 font-medium text-right">Entry</th>
            <th className="px-4 py-3 font-medium text-right">Mark</th>
            <th className="px-4 py-3 font-medium text-right">PnL (Pips)</th>
            <th className="px-4 py-3 font-medium text-right">PnL (USD)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/50">
          {positions.map((pos, idx) => {
             
             return (
              <tr key={`${pos.symbol}-${idx}`} className="hover:bg-gray-800/30 transition-colors">
                <td className="px-4 py-3 font-bold text-gray-200">
                  <div className="flex items-center gap-2">
                    <div className={`w-1 h-4 rounded-full ${pos.side === Side.LONG ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                    {pos.symbol}
                  </div>
                </td>
                <td className={`px-4 py-3 font-semibold ${pos.side === Side.LONG ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {pos.side}
                </td>
                <td className="px-4 py-3 text-right text-gray-300 font-mono">
                  {pos.quantity.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right text-gray-400 font-mono">
                  {pos.entryPrice.toFixed(5)}
                </td>
                <td className="px-4 py-3 text-right text-gray-200 font-mono">
                  <LiveTicker value={pos.markPrice} format={(v) => v.toFixed(5)} />
                </td>
                <td className={`px-4 py-3 text-right font-mono font-bold`}>
                  <LiveTicker 
                    value={pos.unrealizedPnlPips} 
                    format={(v) => `${v > 0 ? '+' : ''}${v.toFixed(1)}`} 
                    colored 
                  />
                </td>
                 <td className={`px-4 py-3 text-right font-mono opacity-80`}>
                  <LiveTicker 
                    value={pos.unrealizedPnlUsd} 
                    format={(v) => `${v > 0 ? '+' : ''}$${v.toFixed(2)}`} 
                    colored 
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {positions.length === 0 && (
        <div className="p-8 text-center text-gray-600 text-sm">
          No active FX positions.
        </div>
      )}
    </div>
  );
};