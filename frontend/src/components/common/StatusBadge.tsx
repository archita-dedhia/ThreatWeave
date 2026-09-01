import React from 'react';
import { IncidentStatus, ThreatStatus, AgentStatus } from '../../types';

interface StatusBadgeProps {
  status: IncidentStatus | ThreatStatus | AgentStatus | 'SUCCESS' | 'FAILURE' | 'BLOCKED' | 'DETECTED' | 'NORMAL' | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const norm = (status || '').toLowerCase();

  let colorClasses = 'bg-white/5 text-gray-300 border-white/10';

  if (norm === 'active' || norm === 'open' || norm === 'failure' || norm === 'detected') {
    colorClasses = 'bg-red-500/10 text-red-400 border-red-500/30';
  } else if (norm === 'investigating' || norm === 'analyzing') {
    colorClasses = 'bg-blue-500/10 text-blue-400 border-blue-500/30 animate-pulse';
  } else if (norm === 'contained' || norm === 'blocked' || norm === 'needs_review') {
    colorClasses = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
  } else if (norm === 'resolved' || norm === 'completed' || norm === 'success' || norm === 'normal') {
    colorClasses = 'bg-green-500/10 text-green-400 border-green-500/30';
  } else if (norm === 'idle') {
    colorClasses = 'bg-white/5 text-gray-400 border-white/10';
  }

  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5 font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border uppercase tracking-wider font-mono ${colorClasses} ${sizeClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
};
