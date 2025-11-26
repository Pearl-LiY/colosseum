import React from 'react';
import { StrategyMetric, AssetClass } from '../types';
import { Trophy } from 'lucide-react';
import { DashboardCard } from './DashboardCard';
import { AreaChart, Area, ResponsiveContainer, LineChart, Line } from 'recharts';
import { LiveTicker } from './LiveTicker';

interface CompetitionBoardProps {
  strategies: StrategyMetric[];
  assetClass: AssetClass;
}

export const CompetitionBoard: React.FC<CompetitionBoardProps> = ({ strategies, assetClass }) => {
  // Sort strategies by Total PnL (Pips for Spot, USD for Option)
  const sortedStrategies = [...strategies].sort((a, b) => {
    if (assetClass === 'SPOT') return (b.totalPnlPips || 0) - (a.totalPnlPips || 0);
    return b.totalPnlUsd - a.totalPnlUsd;
  });

  const getPnlValue = (s: StrategyMetric) => assetClass === 'SPOT' ? s.totalPnlPips : s.totalPnlUsd;
  const pnlLabel = assetClass === 'SPOT' ? 'Pips' : 'USD';

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="grid grid-cols-12 gap-4">
        {sortedStrategies.slice(0, 3).map((strat, index) => (
          <div key={strat.id} className="col-span-12 md:col-span-4">
            <div className={`relative overflow-hidden rounded-lg p-6 border ${
              index === 0 ? 'bg-yellow-900/10 border-yellow-500/50' : 
              index === 1 ? 'bg-gray-800/50 border-gray-400/50' : 
              'bg-orange-900/10 border-orange-700/50'
            }`}>
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Trophy size={64} />
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                   index === 0 ? 'bg-yellow-500 text-black' : 
                   index === 1 ? 'bg-gray-400 text-black' : 
                   'bg-orange-700 text-white'
                }`}>
                  #{index + 1}
                </div>
                <h3 className="font-bold text-gray-200">{strat.name}</h3>
              </div>
              <div className="mt-4">
                 <div className="text-xs text-gray-500 uppercase">Total PnL</div>
                 <div className="text-2xl font-mono font-bold text-white">
                   {assetClass === 'OPTION' && '$'}
                   <LiveTicker value={getPnlValue(strat) || 0} format={(v) => v.toLocaleString(undefined, {maximumFractionDigits: 0})} />
                   <span className="text-sm text-gray-500 ml-1">{pnlLabel}</span>
                 </div>
              </div>
              <div className="mt-2 flex gap-4 text-xs">
                <span className="text-emerald-400">SR: {strat.sharpeRatio.toFixed(2)}</span>
                <span className="text-blue-400">WR: {strat.winRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <DashboardCard title="Real-time Leaderboard" className="flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-900 border-b border-gray-800 text-gray-500">
              <tr>
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Strategy</th>
                <th className="px-6 py-4 text-right">Total PnL ({pnlLabel})</th>
                <th className="px-6 py-4 text-right">Sharpe Ratio</th>
                <th className="px-6 py-4 text-right">Max DD</th>
                <th className="px-6 py-4 text-right">Status</th>
                <th className="px-6 py-4 w-48">Mini Chart ({assetClass === 'SPOT' ? 'Equity' : 'Greeks'})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {sortedStrategies.map((strat, idx) => (
                <tr key={strat.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-gray-400">#{idx + 1}</td>
                  <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: strat.color}}></div>
                    {strat.name}
                  </td>
                  <td className={`px-6 py-4 text-right font-mono font-bold`}>
                     {assetClass === 'OPTION' && '$'}
                    <LiveTicker value={getPnlValue(strat) || 0} format={(v) => `${v > 0 ? '+' : ''}${v.toLocaleString(undefined, {maximumFractionDigits: 1})}`} colored />
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-gray-300">{strat.sharpeRatio.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right font-mono text-rose-400">-{strat.maxDrawdown.toFixed(2)}%</td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-[10px] bg-emerald-900/30 text-emerald-400 px-2 py-1 rounded border border-emerald-900">
                      LIVE
                    </span>
                  </td>
                  <td className="px-6 py-2">
                     <div className="h-10 w-32 ml-auto">
                        <ResponsiveContainer width="100%" height="100%">
                          {assetClass === 'SPOT' ? (
                            <AreaChart data={strat.equityCurve}>
                              <Area type="monotone" dataKey="value" stroke={strat.color} fill="none" strokeWidth={2} isAnimationActive={false} />
                            </AreaChart>
                          ) : (
                             // Option: 3 lines for Greeks
                            <LineChart data={strat.deltaCurve}>
                              <Line type="monotone" dataKey="value" stroke="#3b82f6" dot={false} strokeWidth={1} isAnimationActive={false} />
                              <Line type="monotone" dataKey="value" stroke="#f59e0b" dot={false} strokeWidth={1} strokeDasharray="2 2" isAnimationActive={false} />
                              <Line type="monotone" dataKey="value" stroke="#ec4899" dot={false} strokeWidth={1} strokeOpacity={0.5} isAnimationActive={false} />
                            </LineChart>
                          )}
                        </ResponsiveContainer>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </div>
  );
};
