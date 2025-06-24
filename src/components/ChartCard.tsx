import React from 'react';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, children, className = "" }) => {
  return (
    <div className={`p-6 rounded-2xl bg-black/40 backdrop-blur-sm border border-white/10 hover:border-purple-500/30 transition-all duration-500 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3"></div>
        {title}
      </h3>
      {children}
    </div>
  );
};