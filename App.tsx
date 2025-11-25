import React, { useState, useEffect } from 'react';
import { Activity, Wallet, RefreshCcw, Database, Brain, Trophy, ArrowLeft } from 'lucide-react';
import { DashboardCard } from './components/DashboardCard';
import { EquityChart } from './components/EquityChart';
import { PositionsTable } from './components/PositionsTable';
import { ActivityLog } from './components/ActivityLog';
import { CompetitionBoard } from './components/CompetitionBoard';
import { SimulationService } from './simulation';
import { StrategyMetric, ViewMode } from './types';
import { LiveTicker } from './components/LiveTicker';

// Custom Gladiator Helmet Icon
const GladiatorIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2a4 4 0 0 0-4 4v1a4 4 0 0 0-4 4v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a4 4 0 0 0-4-4V6a4 4 0 0 0-4-4z" />
    <path d="M12 2v4" />
    <path d="M12 19v-6" />
    <path d="M8 19v-6" />
    <path d="M16 19v-6" />
    <path d="M4 11h16" />
    <path d="M3 11l2-5" />
    <path d="M21 11l-2-5" />
  </svg>
);

const StatPill = ({ label, value, subValue, highlight = false, isLive = false }: { label: string, value: string | number, subValue?: string, highlight?: boolean, isLive?: boolean }) => (
  <div className="bg-gray-800/50 rounded-lg px-4 py-2 border border-gray-700/50 flex flex-col min-w-[120px] transition-all duration-300 hover:bg-gray-800">
    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{label}</span>
    <div className={`text-lg font-mono font-bold ${highlight ? 'text-trade-up' : 'text-gray-200'}`}>
      {isLive && typeof value === 'number' ? (
        <LiveTicker value={value} format={(v) => v.toFixed(0)} colored={highlight} />
      ) : (
        value
      )}
      {typeof value === 'number' && !isLive && value.toFixed(0)}
    </div>
    {subValue && <span className="text-[10px] text-gray-400">{subValue}</span>}
  </div>
);

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('DETAILS');
  const [strategies, setStrategies] = useState<StrategyMetric[]>([]);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('news_v1');
  const [positions, setPositions] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [equityHistory, setEquityHistory] = useState<Record<string, any[]>>({});
  const [currentTime, setCurrentTime] = useState(new Date());

  // Initialize Data
  useEffect(() => {
    const initial = SimulationService.getInitialState();
    setStrategies(initial.strategies);
    setPositions(initial.positions);
    setLogs(initial.logs);
    setEquityHistory(initial.equityHistory);
  }, []);

  // Polling Mechanism (0.5s)
  useEffect(() => {
    const timer = setInterval(() => {
      const data = SimulationService.tick();
      setStrategies(data.strategies);
      setPositions(data.positions);
      setLogs(data.logs);
      setEquityHistory(data.equityHistory);
      setCurrentTime(new Date());
    }, 500);

    return () => clearInterval(timer);
  }, []);

  const currentStrategy = strategies.find(s => s.id === selectedStrategyId) || strategies[0];
  const currentEquityData = equityHistory[selectedStrategyId] || [];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-sans selection:bg-trade-accent selection:text-white pb-6">
      
      {/* Navbar / Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <GladiatorIcon className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-gray-100 leading-none tracking-wide">COLOSSEUM</h1>
              <span className="text-[10px] text-gray-500 font-mono">SystematicTrade AI</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-full border border-gray-700">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-mono text-emerald-400">SYSTEM ONLINE</span>
            </div>
            <div className="text-xs font-mono text-gray-500 flex items-center gap-2">
               <Database size={14} />
               <span>SIM_ENGINE: ACTIVE (500ms)</span>
            </div>
             <div className="text-xs font-mono text-gray-500 w-48 text-right">
              {currentTime.toUTCString().replace('GMT', 'UTC')}
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button 
               onClick={() => setViewMode(viewMode === 'DETAILS' ? 'COMPETITION' : 'DETAILS')}
               className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded text-xs transition-colors border border-gray-700 flex items-center gap-2"
             >
               {viewMode === 'COMPETITION' ? <ArrowLeft size={14}/> : <Activity size={14} />}
               <span>{viewMode === 'COMPETITION' ? 'Strategy Details' : 'Details'}</span>
             </button>

             <button 
               onClick={() => setViewMode('COMPETITION')}
               className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-colors shadow-lg ${
                 viewMode === 'COMPETITION' 
                 ? 'bg-amber-600 text-white shadow-amber-500/20' 
                 : 'bg-trade-accent hover:bg-blue-600 text-white shadow-blue-500/20'
               }`}
             >
               <Trophy size={14} />
               Competition Mode
             </button>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="max-w-[1920px] mx-auto p-4 flex flex-col gap-4">
        
        {/* Top Bar: Stats & Strategy Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Global Stats - Context Sensitive */}
          <div className="col-span-12 lg:col-span-6 flex gap-3 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
             {viewMode === 'DETAILS' ? (
               <>
                <StatPill label="Current PnL" value={currentStrategy?.totalPnlPips} subValue={`${currentStrategy?.name}`} highlight isLive />
                <StatPill label="Sharpe Ratio" value={currentStrategy?.sharpeRatio.toFixed(2)} />
                <StatPill label="Win Rate" value={`${currentStrategy?.winRate.toFixed(1)}%`} subValue="Last 100 cycles" />
                <StatPill label="Daily PnL" value={currentStrategy?.dailyPnlPips} isLive highlight />
               </>
             ) : (
               <>
                <StatPill label="Top Performer" value={strategies.sort((a,b) => b.totalPnlPips - a.totalPnlPips)[0]?.name || '-'} highlight />
                <StatPill label="Active Strategies" value={strategies.length.toString()} />
                <StatPill label="Total Volume" value="$42.5M" subValue="24h Notional" />
               </>
             )}
          </div>

          {/* Strategy Selector - Always visible but highlights selection */}
          <div className="col-span-12 lg:col-span-6 flex justify-end">
            <div className="bg-gray-900 border border-gray-800 p-1 rounded-lg flex w-full overflow-x-auto custom-scrollbar gap-1">
              {strategies.map(strat => (
                <button
                  key={strat.id}
                  onClick={() => {
                    setSelectedStrategyId(strat.id);
                    setViewMode('DETAILS');
                  }}
                  className={`flex-none min-w-[100px] py-1.5 px-3 rounded text-xs font-medium transition-all group relative ${
                    selectedStrategyId === strat.id && viewMode === 'DETAILS'
                      ? 'bg-gray-800 text-white shadow-sm ring-1 ring-gray-700' 
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="truncate max-w-[90px]">{strat.name}</span>
                    <span className={`text-[10px] font-mono flex items-center gap-1 ${strat.dailyPnlPips >= 0 ? 'text-trade-up' : 'text-trade-down'}`}>
                       {strat.dailyPnlPips > 0 ? '+' : ''}
                       <LiveTicker value={strat.dailyPnlPips} format={(v) => v.toFixed(0)} />
                    </span>
                  </div>
                  {/* Active Indicator Dot */}
                  {selectedStrategyId === strat.id && viewMode === 'DETAILS' && (
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-trade-accent"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* View Content */}
        {viewMode === 'COMPETITION' ? (
          <div className="h-[calc(100vh-180px)]">
            <CompetitionBoard strategies={strategies} historyData={equityHistory} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column: Charts & Tables */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
              
              {/* PnL Curve */}
              <DashboardCard 
                title={
                  <div className="flex items-center gap-2">
                    <Activity size={16} style={{color: currentStrategy?.color}} />
                    <span>PnL Curve: {currentStrategy?.name}</span>
                  </div>
                } 
                className="h-[400px]"
                headerAction={
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-gray-800 text-gray-400 text-[10px] rounded border border-gray-700 font-mono">Pips</span>
                    <span className="px-2 py-1 bg-gray-800 text-gray-400 text-[10px] rounded border border-gray-700 font-mono">1M View</span>
                  </div>
                }
              >
                <EquityChart 
                  data={currentEquityData} 
                  currentPips={currentStrategy?.totalPnlPips || 0}
                  dailyPips={currentStrategy?.dailyPnlPips || 0}
                  color={currentStrategy?.color}
                />
              </DashboardCard>

              {/* Current Positions */}
              <DashboardCard 
                title={
                  <div className="flex items-center gap-2">
                    <Wallet size={16} className="text-gray-400" />
                    <span>Active FX Exposures</span>
                    <span className="bg-gray-800 text-gray-400 text-[10px] px-1.5 rounded-full ml-2 border border-gray-700">
                      {positions.length}
                    </span>
                  </div>
                }
                className="min-h-[300px]"
              >
                <PositionsTable positions={positions} />
              </DashboardCard>

            </div>

            {/* Right Column: Decisions Log */}
            <div className="col-span-12 lg:col-span-4 h-full">
              <DashboardCard 
                title={
                  <div className="flex items-center gap-2">
                    <Brain size={16} className="text-purple-500" />
                    <span>Strategy Logic Stream</span>
                  </div>
                }
                className="h-[calc(100vh-160px)] min-h-[600px] sticky top-20"
                headerAction={
                   <div className="flex items-center gap-2 text-[10px] text-gray-500">
                     <RefreshCcw size={12} className="animate-spin" />
                     Live
                   </div>
                }
              >
                <ActivityLog logs={logs.filter(l => selectedStrategyId === l.strategyId || l.strategyId === 'Global')} />
              </DashboardCard>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;