import React from 'react';
import { RiskLevel, SeverityLevel } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel | SeverityLevel | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'md', showIcon = true }) => {
  const norm = (level || '').toUpperCase();

  let bg = 'bg-white/5 text-gray-300 border-white/10';
  let dot = 'bg-gray-400';

  if (norm === 'CRITICAL') {
    bg = 'bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.15)]';
    dot = 'bg-red-500 animate-pulse';
  } else if (norm === 'HIGH') {
    bg = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
    dot = 'bg-yellow-500';
  } else if (norm === 'MEDIUM') {
    bg = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    dot = 'bg-blue-400';
  } else if (norm === 'LOW' || norm === 'INFO') {
    bg = 'bg-green-500/10 text-green-400 border-green-500/30';
    dot = 'bg-green-500';
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-medium tracking-wide',
    md: 'text-xs px-2.5 py-1 font-semibold tracking-wider',
    lg: 'text-sm px-3.5 py-1.5 font-bold tracking-wider',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border uppercase font-mono ${bg} ${sizeClasses[size]}`}
    >
      {showIcon && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
      {norm}
    </span>
  );
};
