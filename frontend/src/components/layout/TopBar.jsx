import React from 'react';
import { useLocation } from 'react-router-dom';
import { Shield, Activity, RefreshCw } from 'lucide-react';

export const TopBar = ({ onRefresh, isRefreshing = false }) => {
  const location = useLocation();

  const getPageInfo = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard') || path === '/') {
      return {
        title: 'SOC Executive Overview',
        subtitle: 'Real-time telemetry, risk KPIs, and detected threat summaries',
      };
    }
    if (path.startsWith('/logs')) {
      return {
        title: 'Security Telemetry Logs',
        subtitle: 'Granular network, authentication, and execution log audit feed',
      };
    }
    if (path === '/threats') {
      return {
        title: 'Active Security Threats',
        subtitle: 'Prioritized attack incidents and evidence-based threat dossiers',
      };
    }
    if (path.startsWith('/threats/')) {
      return {
        title: 'Threat Forensic Details',
        subtitle: 'Deep-dive investigation, evidence logs, and detection reasoning',
      };
    }
    if (path.startsWith('/analytics')) {
      return {
        title: 'Security Analytics & Visuals',
        subtitle: 'Threat distribution matrices, log velocity, and attack vector trends',
      };
    }
    return {
      title: 'Security Console',
      subtitle: 'ThreatWeave SOC Management',
    };
  };

  const { title, subtitle } = getPageInfo();

  return (
    <header className="h-16 bg-[#111217] border-b border-white/10 px-6 flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-400" />
          <span>{title}</span>
        </h1>
        <p className="text-xs text-gray-400 font-mono mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#1A1C23] border border-white/10 rounded-md text-xs font-mono">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-gray-300">Live SOC Feed</span>
        </div>
      </div>
    </header>
  );
};
