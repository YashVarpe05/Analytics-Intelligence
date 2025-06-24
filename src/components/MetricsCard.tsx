import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: LucideIcon;
  trend: 'up' | 'down' | 'neutral';
  description?: string;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  trend,
  description
}) => {
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-yellow-400';
  const trendBg = trend === 'up' ? 'bg-green-500/10' : trend === 'down' ? 'bg-red-500/10' : 'bg-yellow-500/10';

  return (
    <div className="group relative p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-500 hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <div className="text-gray-400 text-sm font-medium">{title}</div>
        <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 group-hover:scale-110 transition-transform">
          <Icon className="w-5 h-5 text-purple-400" />
        </div>
      </div>
      
      <div className="text-3xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      
      <div className="flex items-center space-x-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${trendBg} ${trendColor}`}>
          {change}
        </span>
        <span className="text-xs text-gray-500">vs last period</span>
      </div>
      
      {description && (
        <div className="mt-3 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
          {description}
        </div>
      )}
    </div>
  );
};