import React from 'react';
import { CheckCircle2, Clock, Play, AlertOctagon, HelpCircle } from 'lucide-react';

export const StatusBadge = ({
  status,
  size = 'md',
}) => {
  const normStatus = (status || 'UNKNOWN').toLowerCase();

  const config = {
    // Incident statuses
    open: {
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-400',
      border: 'border-yellow-500/20',
      label: 'Open',
      icon: Clock,
    },
    investigating: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/20',
      label: 'Investigating',
      icon: Play,
    },
    contained: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/20',
      label: 'Contained',
      icon: AlertOctagon,
    },
    resolved: {
      bg: 'bg-green-500/10',
      text: 'text-green-400',
      border: 'border-green-500/20',
      label: 'Resolved',
      icon: CheckCircle2,
    },

    // Agent statuses
    idle: {
      bg: 'bg-gray-500/10',
      text: 'text-gray-400',
      border: 'border-gray-500/20',
      label: 'Idle',
      icon: Clock,
    },
    analyzing: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/20',
      label: 'Analyzing',
      icon: Play,
    },
    completed: {
      bg: 'bg-green-500/10',
      text: 'text-green-400',
      border: 'border-green-500/20',
      label: 'Completed',
      icon: CheckCircle2,
    },
    needs_review: {
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-400',
      border: 'border-yellow-500/20',
      label: 'Review Required',
      icon: AlertOctagon,
    },

    // Security event status
    success: {
      bg: 'bg-green-500/10',
      text: 'text-green-400',
      border: 'border-green-500/20',
      label: 'Success',
      icon: CheckCircle2,
    },
    failure: {
      bg: 'bg-red-500/10',
      text: 'text-red-400',
      border: 'border-red-500/20',
      label: 'Failure',
      icon: AlertOctagon,
    },

    // Threat status
    active: {
      bg: 'bg-red-500/10',
      text: 'text-red-400',
      border: 'border-red-500/20',
      label: 'Active Threat',
      icon: AlertOctagon,
    },
  }[normStatus] || {
    bg: 'bg-gray-500/10',
    text: 'text-gray-400',
    border: 'border-gray-500/20',
    label: normStatus.toUpperCase(),
    icon: HelpCircle,
  };

  const IconComponent = config.icon;
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-0.5 gap-1.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      <IconComponent className="w-3 h-3" />
      <span>{config.label}</span>
    </span>
  );
};
