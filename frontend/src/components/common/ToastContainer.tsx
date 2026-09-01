import React from 'react';
import { useSOC } from '../../context/SOCContext';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { notifications, dismissNotification } = useSOC();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map((n) => {
        let Icon = Info;
        let border = 'border-blue-500/30 bg-[#1A1C23] text-blue-400';

        if (n.type === 'success') {
          Icon = CheckCircle;
          border = 'border-green-500/30 bg-[#1A1C23] text-green-400';
        } else if (n.type === 'danger') {
          Icon = AlertCircle;
          border = 'border-red-500/30 bg-[#1A1C23] text-red-400';
        } else if (n.type === 'warning') {
          Icon = AlertTriangle;
          border = 'border-yellow-500/30 bg-[#1A1C23] text-yellow-400';
        }

        return (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-2xl backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${border}`}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">{n.title}</h4>
                <span className="text-[10px] text-gray-500 font-mono">{n.timestamp}</span>
              </div>
              <p className="text-xs text-gray-300 mt-1 leading-snug break-words">{n.message}</p>
            </div>
            <button
              onClick={() => dismissNotification(n.id)}
              className="text-gray-400 hover:text-white p-1 shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
