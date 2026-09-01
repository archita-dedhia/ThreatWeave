import React from 'react';
import { useSOC } from '../../context/SOCContext';
import {
  Shield,
  LayoutDashboard,
  FileCode2,
  Cpu,
  AlertOctagon,
  FolderLock,
  FileCheck2,
  BarChart3,
  Sliders,
  CheckCircle2,
  Radio,
  Zap,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activePage,
    setActivePage,
    events,
    threats,
    incidents,
    reports,
    isProcessing,
  } = useSOC();

  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'log-analysis',
      label: 'Log Analysis',
      icon: FileCode2,
      badge: events.length > 0 ? events.length : null,
    },
    {
      id: 'ai-investigation',
      label: 'AI Investigation',
      icon: Cpu,
      badge: isProcessing ? 'ACTIVE' : null,
      highlight: true,
    },
    {
      id: 'threats',
      label: 'Threats',
      icon: AlertOctagon,
      badge: threats.filter((t) => t.status === 'active').length || null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    },
    {
      id: 'incidents',
      label: 'Incidents',
      icon: FolderLock,
      badge: incidents.filter((i) => i.status !== 'resolved').length || null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileCheck2,
      badge: reports.length > 0 ? reports.length : null,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Sliders,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-[#111217] border-r border-white/10 flex flex-col shrink-0 h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/10 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold shadow-md shadow-blue-900/30">
            U
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">UrbanSOC</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-600/10 text-blue-400 border border-blue-500/20">
                v2.6
              </span>
            </div>
            <span className="text-[10px] text-gray-500 font-mono tracking-tight uppercase">SIH 2026 • PS SIH26S01</span>
          </div>
        </div>
        <p className="text-[11px] text-gray-400 leading-tight italic font-sans">
          AI-Powered Threat Detection &amp; Response
        </p>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-4 py-3 space-y-1 overflow-y-auto custom-scrollbar text-sm">
        <div className="px-3 pb-2 text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
          Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all duration-150 group cursor-pointer ${
                isActive
                  ? 'bg-blue-600/10 text-blue-400 rounded-md border border-blue-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive
                      ? 'text-blue-400'
                      : 'text-gray-500 group-hover:text-gray-300'
                  }`}
                />
                <span className={isActive ? 'font-semibold text-white' : ''}>{item.label}</span>
              </div>

              {item.badge !== null && (
                <span
                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                    item.badgeColor || (isActive ? 'bg-blue-600/20 text-blue-300 border-blue-500/30' : 'bg-white/5 text-gray-400 border-white/10')
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Agent Activity Bar in Sidebar */}
      <div className="p-3 mx-4 mb-3 rounded-lg bg-[#1A1C23] border border-white/10 text-[11px]">
        <div className="flex items-center justify-between text-gray-400 mb-1.5 font-mono text-[10px]">
          <span className="flex items-center gap-1.5 text-blue-400">
            <Zap className="w-3 h-3 text-blue-400" />
            AI DUAL-ENGINE
          </span>
          <span className="text-green-500 font-bold">READY</span>
        </div>
        <div className="space-y-1 text-gray-400 text-[10px]">
          <div className="flex items-center justify-between">
            <span className="truncate">Log Agent:</span>
            <span className="font-mono text-blue-300">L1 Heuristics</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="truncate">Investigator:</span>
            <span className="font-mono text-blue-300">L2 Graph Reasoner</span>
          </div>
        </div>
      </div>

      {/* System Status Footer */}
      <div className="p-4 border-t border-white/10 mt-auto bg-[#111217] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-500">System Status</div>
            <span className="text-xs text-white font-medium">Operational</span>
          </div>
        </div>
        <div className="text-right font-mono text-[10px] text-gray-400">
          <div className="text-[9px] uppercase tracking-wider text-gray-500">SOC UTC</div>
          <div className="text-gray-300 font-semibold">{new Date().toISOString().slice(11, 16)}Z</div>
        </div>
      </div>
    </aside>
  );
};
