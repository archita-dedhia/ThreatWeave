import React from 'react';
import { useSOC } from '../../context/SOCContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useSOC();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const iconConfig = {
          success: { icon: CheckCircle2, color: 'text-green-400', border: 'border-green-500/30', bg: 'bg-[#1A1C23]' },
          warning: { icon: AlertTriangle, color: 'text-yellow-400', border: 'border-yellow-500/30', bg: 'bg-[#1A1C23]' },
          error: { icon: AlertCircle, color: 'text-red-400', border: 'border-red-500/30', bg: 'bg-[#1A1C23]' },
          info: { icon: Info, color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-[#1A1C23]' },
        }[toast.type] || { icon: Info, color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-[#1A1C23]' };

        const Icon = iconConfig.icon;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-lg border ${iconConfig.border} ${iconConfig.bg} shadow-xl flex items-start gap-3 transition-all animate-in slide-in-from-right duration-200`}
          >
            <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${iconConfig.color}`} />
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-bold text-white">{toast.title}</h5>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-500 hover:text-gray-300 p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
