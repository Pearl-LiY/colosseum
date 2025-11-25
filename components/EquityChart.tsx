import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { EquityPoint } from '../types';

interface EquityChartProps {
  data: EquityPoint[];
  currentPips: number;
  dailyPips: number;
  color?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-700 p-2 rounded shadow-xl text-xs">
        <p className="text-gray-400 mb-1">{label}</p>
        <p className="text-white font-mono font-bold">
          {payload[0].value.toFixed(1)} Pips
        </p>
      </div>
    );
  }
  return null;
};

export const EquityChart: React.FC<EquityChartProps> = ({ data, currentPips, dailyPips, color = '#3b82f6' }) => {
  const isPositive = dailyPips >= 0;

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex justify-between items-end mb-4">
        <div>
          <div className="text-3xl font-bold font-mono text-white transition-all duration-300">
            {currentPips.toLocaleString('en-US', { minimumFractionDigits: 1 })}
          </div>
          <div className="text-xs text-gray-500 mt-1">Cumulative PnL (Pips)</div>
        </div>
        <div className={`px-2 py-1 rounded text-sm font-bold flex items-center gap-1 ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
          {isPositive ? '▲' : '▼'} {Math.abs(dailyPips).toFixed(1)} Pips (24h)
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#6b7280" 
              tick={{fontSize: 10}} 
              tickLine={false}
              axisLine={false}
              minTickGap={30}
            />
            <YAxis 
              domain={['auto', 'auto']} 
              stroke="#6b7280" 
              tick={{fontSize: 10}} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#4b5563', strokeWidth: 1 }} />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorValue)"
              isAnimationActive={false} // Disable animation for smoother polling updates
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};