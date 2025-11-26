import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { EquityPoint, AssetClass } from '../types';

interface EquityChartProps {
  data: EquityPoint[];
  deltaData?: EquityPoint[];
  gammaData?: EquityPoint[];
  vegaData?: EquityPoint[];
  currentVal: number;
  dailyVal: number;
  color?: string;
  assetClass: AssetClass;
  strategyName?: string;
}

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-700 p-2 rounded shadow-xl text-xs z-50">
        <p className="text-gray-400 mb-1">{label}</p>
        <p className="text-white font-mono font-bold">
          {payload[0].value.toFixed(1)} {unit}
        </p>
      </div>
    );
  }
  return null;
};

const MiniChart = ({ data, color, title, unit }: { data: EquityPoint[], color: string, title: string, unit: string }) => (
  <div className="flex-1 flex flex-col min-h-0">
    <div className="text-[10px] uppercase text-gray-500 font-bold mb-1 ml-1">{title}</div>
    <div className="flex-1 w-full min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`grad${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} vertical={false} />
          <XAxis dataKey="time" hide />
          <YAxis domain={['auto', 'auto']} hide />
          <Tooltip content={<CustomTooltip unit={unit} />} cursor={{ stroke: '#4b5563', strokeWidth: 1 }} />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={2}
            fillOpacity={1} 
            fill={`url(#grad${title})`}
            isAnimationActive={false} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const EquityChart: React.FC<EquityChartProps> = ({ 
  data, deltaData, gammaData, vegaData, 
  currentVal, dailyVal, 
  color = '#3b82f6', assetClass, strategyName 
}) => {
  const isPositive = dailyVal >= 0;
  const unit = assetClass === 'SPOT' ? 'Pips' : 'USD';

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header Stat */}
      <div className="flex justify-between items-end mb-4 flex-none">
        <div>
          <div className="text-3xl font-bold font-mono text-white transition-all duration-300">
            {assetClass === 'OPTION' ? '$' : ''}{currentVal.toLocaleString('en-US', { minimumFractionDigits: 1 })}
          </div>
          <div className="text-xs text-gray-500 mt-1">
             {assetClass === 'SPOT' ? 'Cumulative PnL (Pips)' : 'Total Net PnL (USD)'}
          </div>
        </div>
        <div className={`px-2 py-1 rounded text-sm font-bold flex items-center gap-1 ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
          {isPositive ? '▲' : '▼'} {assetClass === 'OPTION' ? '$' : ''}{Math.abs(dailyVal).toFixed(1)} {assetClass === 'SPOT' ? 'Pips' : ''} (24h)
        </div>
      </div>
      
      {/* Chart Area */}
      <div className="flex-1 w-full min-h-0 flex flex-col gap-2">
        {assetClass === 'SPOT' ? (
          // SPOT: Single PnL Chart
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
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
                width={40}
              />
              <Tooltip content={<CustomTooltip unit={unit} />} cursor={{ stroke: '#4b5563', strokeWidth: 1 }} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorMain)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          // OPTION: 3 Greeks Charts
          <div className="flex-1 grid grid-cols-3 gap-4 h-full">
            <MiniChart data={deltaData || []} color="#3b82f6" title="Delta Exposure" unit="Δ" />
            <MiniChart data={vegaData || []} color="#8b5cf6" title="Vega Exposure" unit="ν" />
            <MiniChart data={gammaData || []} color="#f59e0b" title="Gamma Exposure" unit="Γ" />
          </div>
        )}
      </div>
    </div>
  );
};
