import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ShieldAlert,
  LayoutDashboard,
  FileText,
  Flame,
  BarChart3,
  Terminal,
  Activity,
} from 'lucide-react';

export const Sidebar = () => {
  const navItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'SOC Overview & Metrics',
    },
    {
      path: '/logs',
      label: 'Security Logs',
      icon: FileText,
      description: 'Raw Logs & Telemetry',
    },
    {
      path: '/threats',
      label: 'Threats',
      icon: Flame,
      description: 'Detected Threat Dossiers',
    },
    {
      path: '/analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Threat Matrix & Visuals',
    },
  ];

  return (
    <aside className="w-64 bg-[#111217] border-r border-white/10 flex flex-col shrink-0 select-none min-h-screen">
      {/* Brand Header */}
      <div className="p-4 border-b border-white/10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
          <ShieldAlert className="w-5 h-5 text-blue-400" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-sm tracking-wider text-white font-mono uppercase">
              THREATWEAVE
            </span>
          </div>
          <p className="text-[10px] text-gray-400 font-mono truncate">
            SOC Threat Intelligence
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="text-[10px] font-mono uppercase text-gray-500 px-3 pb-2 font-semibold tracking-wider">
          SOC Operations
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/5 font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`
              }
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className="w-4 h-4 shrink-0" />
                <div className="text-left truncate">
                  <div className="truncate">{item.label}</div>
                  <div className="text-[10px] text-gray-500 font-mono truncate">
                    {item.description}
                  </div>
                </div>
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div className="p-3 m-3 bg-[#1A1C23] border border-white/10 rounded-lg">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[11px]">Engine Connected</span>
        </div>
        <p className="text-[10px] text-gray-400 mt-1 font-mono">
          FastAPI &bull; Port 8000
        </p>
      </div>
    </aside>
  );
};
