import React from 'react';
import { ShieldCheck, ArrowRight, Play } from 'lucide-react';

export const EmptyState = ({
  title = 'No data available',
  description = 'No security events or anomalies have been recorded in this category yet.',
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  icon: Icon = ShieldCheck,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-[#1A1C23] border border-white/10 rounded-lg max-w-2xl mx-auto my-8 shadow-sm">
      <div className="w-14 h-14 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-white mb-2">{title}</h3>
      <p className="text-xs text-gray-400 max-w-md mb-6 leading-relaxed">{description}</p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionText && onAction && (
          <button
            onClick={onAction}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-md shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{actionText}</span>
          </button>
        )}
        {secondaryActionText && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="px-4 py-2 bg-[#111217] hover:bg-white/5 text-gray-300 hover:text-white border border-white/10 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>{secondaryActionText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
