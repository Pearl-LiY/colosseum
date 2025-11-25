import React from 'react';

interface DashboardCardProps {
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ title, children, className = '', headerAction }) => {
  return (
    <div className={`bg-gray-900 border border-gray-800 rounded-lg shadow-lg flex flex-col ${className}`}>
      <div className="px-4 py-3 border-b border-gray-800 flex justify-between items-center bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wide flex items-center gap-2">
          {title}
        </h3>
        {headerAction && <div>{headerAction}</div>}
      </div>
      <div className="flex-1 overflow-hidden relative">
        {children}
      </div>
    </div>
  );
};