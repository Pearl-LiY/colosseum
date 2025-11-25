import React, { useState } from 'react';
import { CycleLog } from '../types';
import { ChevronDown, ChevronRight, Terminal, Brain, MessageSquare } from 'lucide-react';

interface ActivityLogProps {
  logs: CycleLog[];
}

const LogItem: React.FC<{ log: CycleLog }> = ({ log }) => {
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [isThoughtOpen, setIsThoughtOpen] = useState(false);

  return (
    <div className="border-b border-gray-800 last:border-0 p-4 hover:bg-gray-800/20 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="text-gray-500 text-xs font-mono">{log.timestamp}</span>
          <h4 className="text-gray-200 font-bold text-sm">Cycle #{log.id}</h4>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded border ${
          log.status === 'Success' 
            ? 'border-emerald-900 bg-emerald-900/20 text-emerald-400' 
            : 'border-yellow-900 bg-yellow-900/20 text-yellow-400'
        }`}>
          {log.status}
        </span>
      </div>

      {/* Accordions */}
      <div className="space-y-2 mt-3">
        {/* Input Prompt */}
        <div>
          <button 
            onClick={() => setIsPromptOpen(!isPromptOpen)}
            className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors w-full text-left"
          >
            {isPromptOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <Terminal size={12} />
            Input Prompt
          </button>
          {isPromptOpen && (
            <div className="mt-1 p-2 bg-black/50 rounded text-gray-400 text-xs font-mono whitespace-pre-wrap border-l-2 border-blue-500/50">
              {log.inputPrompt || "No prompt data recorded."}
            </div>
          )}
        </div>

        {/* Chain of Thought */}
        <div>
          <button 
            onClick={() => setIsThoughtOpen(!isThoughtOpen)}
            className="flex items-center gap-2 text-xs text-purple-400 hover:text-purple-300 transition-colors w-full text-left"
          >
            {isThoughtOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <Brain size={12} />
            Strategy Reasoning (Chain of Thought)
          </button>
          {isThoughtOpen && (
            <div className="mt-1 p-2 bg-black/50 rounded text-gray-400 text-xs font-mono whitespace-pre-wrap border-l-2 border-purple-500/50">
              {log.chainOfThought || "No reasoning data recorded."}
            </div>
          )}
        </div>
      </div>

      {/* Decisions List */}
      <div className="mt-3 space-y-1">
        {log.decisions.map((dec, idx) => (
          <div key={idx} className="flex items-center gap-2 bg-gray-800/40 p-2 rounded border border-gray-800">
            <span className="text-xs font-bold text-gray-200 w-16">{dec.ticker}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
              dec.action === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' :
              dec.action === 'SELL' ? 'bg-rose-500/20 text-rose-400' :
              'bg-gray-600/20 text-gray-400'
            }`}>
              {dec.action}
            </span>
            <span className="text-xs text-gray-500 truncate flex-1">{dec.reason}</span>
            <span className="text-emerald-500">
             {dec.action !== 'HOLD' && <span className="text-[10px]">✔</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ActivityLog: React.FC<ActivityLogProps> = ({ logs }) => {
  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      {logs.map((log) => (
        <LogItem key={log.id} log={log} />
      ))}
      {logs.length === 0 && (
         <div className="p-8 text-center text-gray-600 text-sm">
           Waiting for next trading cycle...
         </div>
      )}
    </div>
  );
};