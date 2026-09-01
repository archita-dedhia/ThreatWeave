import React from 'react';
import { useSOC } from '../../context/SOCContext';
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

  const pageTitles = {
    dashboard: 'Executive Security Operations Dashboard',
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
            {activePage.replace('-', ' ')}
          </span>
        </div>
        <h1 className="text-sm font-bold text-white tracking-wide">
          {pageTitles[activePage] || 'Security Console'}
        </h1>
      </div>

      {/* AI Agents Live Status Pill & Quick Action */}
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
      </div>
    </header>
  );
};
