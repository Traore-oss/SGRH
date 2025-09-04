import React from 'react';
import { DivideIcon as LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange';
}

const colorClasses = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500'
};

const trendColors = {
  up: 'text-green-600',
  down: 'text-red-600',
  neutral: 'text-gray-600'
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color
}) => {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 ${colorClasses[color]} rounded-full flex items-center justify-center`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className={`flex items-center space-x-1 ${trendColors[trend]}`}>
          <TrendIcon className="h-3 w-3" />
          <span className="text-xs font-medium">{change}</span>
        </div>
      </div>
      
      <div>
        <p className="text-xl font-bold text-gray-800 mb-1">{value}</p>
        <p className="text-sm text-gray-500">{title}</p>
      </div>
    </div>
  );
};