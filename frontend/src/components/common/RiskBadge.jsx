import React from 'react';
import { AlertCircle, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

export const RiskBadge = ({
  level,
  showIcon = true,
  size = 'md',
}) => {
  const normLevel = (level || 'LOW').toUpperCase();

  const config = {
    CRITICAL: {
      bg: 'bg-red-500/15',
      text: 'text-red-400',
      border: 'border-red-500/40',
      icon: ShieldAlert,
    },
    HIGH: {
      bg: 'bg-orange-500/15',
      text: 'text-orange-400',
      border: 'border-orange-500/40',
      icon: AlertTriangle,
    },
    MEDIUM: {
      bg: 'bg-yellow-500/15',
      text: 'text-yellow-400',
      border: 'border-yellow-500/40',
      icon: AlertCircle,
    },
    LOW: {
      bg: 'bg-green-500/15',
      text: 'text-green-400',
      border: 'border-green-500/40',
      icon: Info,
    },
    INFO: {
      bg: 'bg-gray-500/10',
      text: 'text-gray-400',
      border: 'border-gray-500/20',
      icon: Info,
    },
  }[normLevel] || {
    bg: 'bg-gray-500/10',
    text: 'text-gray-400',
    border: 'border-gray-500/20',
    icon: Info,
  };

  const IconComponent = config.icon;
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2 font-bold',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-mono font-semibold rounded uppercase tracking-wider border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      {showIcon && <IconComponent className={iconSizes} />}
      <span>{normLevel}</span>
    </span>
  );
};
