import React from 'react';
import { ShieldAlert, ArrowRight } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-[#1A1C23] rounded-lg border border-white/10 my-4 max-w-2xl mx-auto shadow-xl">
      <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 mb-4 shadow-sm">
        {icon || <ShieldAlert className="w-6 h-6 text-blue-400" />}
      </div>
      <h3 className="text-lg font-bold text-white tracking-tight mb-2">{title}</h3>
      <p className="text-sm text-gray-400 max-w-md mb-6 leading-relaxed">{description}</p>
      <div className="flex items-center gap-3">
        {actionText && onAction && (
          <button
            onClick={onAction}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-md shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>{actionText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
        {secondaryActionText && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium rounded-md border border-white/10 transition-colors cursor-pointer"
          >
            {secondaryActionText}
          </button>
        )}
      </div>
    </div>
  );
};
