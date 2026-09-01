import React from 'react';
import { useSOC } from '../../context/SOCContext';
import {
  ShieldAlert,
  LayoutDashboard,
  FileText,
  Bot,
  Flame,
  FolderLock,
  FileCheck2,
  BarChart3,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';

export const Sidebar = () => {
  const { activePage, setActivePage, threats, incidents } = useSOC();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'log-analysis',
      label: 'Log Analysis Agent',
      icon: FileText,
      badge: null,
      subtext: 'Agent 1: Ingestion & Rules',
    },
    {
      id: 'ai-investigation',
      label: 'Multi-Agent Telemetry',
      icon: Bot,
      badge: 'Dual-AI',
      badgeColor: 'bg-blue-600/10 text-blue-400 border-blue-500/20',
      subtext: 'Orchestration & Bus',
    },
    {
      id: 'threats',
      label: 'Detected Threats',
      icon: Flame,
      badge: threats.length > 0 ? String(threats.length) : null,
      badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20',
    },
    {
      id: 'threat-detail',
      label: 'Threat Investigation',
      icon: ShieldAlert,
      badge: null,
      subtext: 'Evidence & Playbooks',
    },
    {
      id: 'incidents',
      label: 'Incidents Queue',
      icon: FolderLock,
      badge: incidents.length > 0 ? String(incidents.length) : null,
      badgeColor: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    },
    {
      id: 'reports',
      label: 'Incident Reports',
      icon: FileCheck2,
      badge: null,
      subtext: 'SIH 2026 Formal Dossiers',
    },
    {
      id: 'analytics',
      label: 'Analytics & MITRE',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'settings',
      label: 'SOC & AI Settings',
      icon: Sliders,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-[#111217] border-r border-white/10 flex flex-col shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-white/10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
          <ShieldAlert className="w-5 h-5 text-blue-400" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-sm tracking-wider text-white font-mono uppercase">UrbanSOC</span>
            <span className="text-[9px] px-1 py-0.2 bg-blue-600/10 text-blue-400 border border-blue-500/20 font-bold rounded">
              SIH-26
            </span>
          </div>
          <p className="text-[10px] text-gray-500 font-mono truncate">Agentic AI Cyber Assistant</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-mono uppercase text-gray-400 px-3 pb-2 font-semibold tracking-wider">
          SOC Operations
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-gray-500'}`} />
                <div className="text-left truncate">
                  <div className="truncate">{item.label}</div>
                  {item.subtext && (
                    <div className="text-[9px] text-gray-400 font-mono truncate">{item.subtext}</div>
                  )}
                </div>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-semibold ${
                    item.badgeColor || 'bg-[#1A1C23] text-gray-400 border-white/10'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Problem Statement Badge */}
      <div className="p-3 m-3 bg-[#1A1C23] border border-white/10 rounded-lg">
        <div className="flex items-center gap-1.5 text-blue-400 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5" />
          <span>SIH 2026 Problem PS-01</span>
        </div>
        <p className="text-[10px] text-gray-400 mt-1 leading-tight font-mono">
          Agentic AI for Automated Threat Investigation &amp; Incident Response
        </p>
      </div>
    </aside>
  );
};
