import React, { useEffect, useState, useRef } from 'react';

interface LiveTickerProps {
  value: number;
  format?: (val: number) => string;
  className?: string;
  colored?: boolean; // If true, stays green/red based on polarity. If false, only flashes.
}

export const LiveTicker: React.FC<LiveTickerProps> = ({ 
  value, 
  format = (v) => v.toFixed(2), 
  className = '',
  colored = false 
}) => {
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);
  const prevValue = useRef(value);

  useEffect(() => {
    if (value > prevValue.current) {
      setFlash('up');
    } else if (value < prevValue.current) {
      setFlash('down');
    }
    
    prevValue.current = value;

    const timer = setTimeout(() => {
      setFlash(null);
    }, 400); // 400ms flash duration

    return () => clearTimeout(timer);
  }, [value]);

  // Base color logic
  let textColor = 'text-gray-200'; // Default
  if (colored) {
    textColor = value > 0 ? 'text-trade-up' : value < 0 ? 'text-trade-down' : 'text-gray-200';
  }

  // Flash override logic
  if (flash === 'up') textColor = 'text-emerald-300 bg-emerald-500/20';
  if (flash === 'down') textColor = 'text-rose-300 bg-rose-500/20';

  return (
    <span className={`transition-all duration-300 rounded px-1 -mx-1 inline-block ${textColor} ${className}`}>
      {format(value)}
    </span>
  );
};