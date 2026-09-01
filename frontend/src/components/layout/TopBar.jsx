import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSOC } from '../../context/SOCContext';
import { useAuth } from '../../AuthContext.jsx';
import {
  Play,
  Sparkles,
  Bot,
  Layers,
  Activity,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Clock,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export const TopBar = () => {
  const {
    activePage,
    logAgentState,
    investigationAgentState,
    loadDemoDataset,
    isProcessing,
    events,
    threats,
    incidents,
  } = useSOC();
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const pageTitles = {
    dashboard: 'Executive Security Operations Dashboard',
    overview: 'Executive Security Operations Dashboard',
    'log-analysis': 'Agent 1: Log Preprocessing & Anomaly Detection',
    'ai-investigation': 'Multi-Agent Orchestration & Communication Bus',
    threats: 'Detected Threat Dossiers',
    'threat-detail': 'Deep Forensic Threat Investigation',
    incidents: 'Security Incident Containment Queue',
    'incident-detail': 'Incident Response & Containment Workflow',
    reports: 'Forensic Incident Reports Generator',
    analytics: 'SOC Threat Analytics & MITRE Matrix',
    settings: 'Engine Thresholds & AI Parameters',
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setLoggingOut(false);
      setMenuOpen(false);
    }
  };

  const initials =
    (profile?.displayName || user?.displayName || user?.email || 'A')
      .split(/[.\s@]+/)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() || '')
      .join('')
      .slice(0, 2) || 'A';

  const email = user?.email || '';
  const displayName = profile?.displayName || user?.displayName || email.split('@')[0];
  const role = profile?.role || 'SOC Analyst';

  return (
    <header className="h-16 bg-[#111217] border-b border-white/10 px-6 flex items-center justify-between shrink-0">
      {/* Page Title & Breadcrumb */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase text-blue-400 font-semibold tracking-wider">
            ThreatWeave Platform
          </span>
          <span className="text-gray-600 text-xs">/</span>
          <span className="text-xs text-gray-400 font-mono capitalize">
            {(activePage || 'overview').replace(/-/g, ' ')}
          </span>
        </div>
        <h1 className="text-sm font-bold text-white tracking-wide">
          {pageTitles[activePage] || pageTitles.overview}
        </h1>
      </div>

      {/* AI Agents Live Status Pill & Quick Action + User Menu */}
      <div className="flex items-center gap-3">
        {/* Agent 1 Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-[#1A1C23] border border-white/10 rounded-md text-xs">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-gray-400 font-mono text-[11px]">Agent 1:</span>
          <span className="text-gray-200 font-semibold text-[11px]">Log Preprocessor</span>
          <StatusBadge status={logAgentState.status} size="sm" />
        </div>

        {/* Agent 2 Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-[#1A1C23] border border-white/10 rounded-md text-xs">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-gray-400 font-mono text-[11px]">Agent 2:</span>
          <span className="text-gray-200 font-semibold text-[11px]">Threat Reasoner</span>
          <StatusBadge status={investigationAgentState.status} size="sm" />
        </div>

        {/* Controlled Dataset Button */}
        <button
          onClick={loadDemoDataset}
          disabled={isProcessing}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-all shadow-sm cursor-pointer ${
            isProcessing
              ? 'bg-blue-600/50 text-white cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/10'
          }`}
          title="Reload the 3 SIH-26 test scenarios: Brute Force, PowerShell Staging, and Database Exfiltration"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Agents Running...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Run Test Dataset</span>
            </>
          )}
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-md bg-[#1A1C23] border border-white/10 hover:border-sky-500/40 hover:bg-sky-500/5 transition cursor-pointer"
            title={`Signed in as ${email}`}
          >
            <div
              className="w-7 h-7 rounded-md text-[11px] font-bold text-white grid place-items-center"
              style={{
                background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #8b5cf6 100%)',
                boxShadow: '0 4px 12px rgba(56,189,248,0.25)',
              }}
            >
              {initials}
            </div>
            <div className="hidden md:flex flex-col items-start leading-tight">
              <span className="text-[11px] font-semibold text-gray-200">{displayName}</span>
              <span className="text-[9px] font-mono text-gray-500">{role}</span>
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-64 z-40 rounded-xl border border-white/10 bg-[#111319] shadow-2xl shadow-black/60 p-1.5">
                <div className="p-3 border-b border-white/5 mb-1">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg text-sm font-bold text-white grid place-items-center"
                      style={{
                        background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #8b5cf6 100%)',
                      }}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-100 truncate">{displayName}</div>
                      <div className="text-[11px] font-mono text-gray-500 truncate">{email}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-gray-400">
                    <ShieldCheck size={12} className="text-emerald-400" />
                    Firebase Authenticated Session
                  </div>
                </div>

                <div className="flex flex-col">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/settings');
                    }}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-xs text-gray-300 hover:bg-white/5 hover:text-white transition"
                  >
                    <UserIcon size={14} />
                    Profile &amp; Settings
                  </button>
                </div>

                <div className="border-t border-white/5 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-xs text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 transition disabled:opacity-60"
                  >
                    {loggingOut ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
                    {loggingOut ? 'Signing out...' : 'Sign out'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
