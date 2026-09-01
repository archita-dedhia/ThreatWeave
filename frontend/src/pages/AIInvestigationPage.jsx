import React from 'react';
import { useSOC } from '../context/SOCContext';
import {
  Bot,
  Layers,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';

export const AIInvestigationPage = () => {
  const {
    events,
    threats,
    logAgentState,
    investigationAgentState,
    agentLogs,
    agentMessages,
    loadDemoDataset,
    isProcessing,
    setActivePage,
    navigateToThreat,
  } = useSOC();

  const hasData = events.length > 0;
  const suspiciousCount = events.filter((e) => e.is_suspicious).length;

  return (
    <div className="space-y-6">
      {/* Top Header & Pipeline Controls */}
      <div className="p-6 bg-[#1A1C23] border border-white/10 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase bg-blue-600/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-semibold">
              Detection Architecture
            </span>
            <span className="text-xs text-gray-400 font-mono">SOC Analysis Pipeline</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">Threat Analysis Pipeline</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Two specialized analysis engines work synchronously: L1 Log Preprocessor &amp; L2 Attack Chain Reasoner.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDemoDataset}
            disabled={isProcessing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Re-execute Agent Pipeline</span>
          </button>
        </div>
      </div>

      {!hasData ? (
        <EmptyState
          title="No multi-agent runs active"
          description="Load the SIH 2026 test dataset to observe real-time agent handoffs, message bus telemetry, and attack chain reasoning."
          actionText="Execute Multi-Agent Pipeline"
          onAction={loadDemoDataset}
        />
      ) : (
        <>
          {/* Section A: Active AI Agents Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Agent 1 Card */}
            <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg space-y-4 relative">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-blue-400 tracking-wider">
                      Agent 1: L1 Preprocessor
                    </span>
                    <h3 className="text-sm font-bold text-white">{logAgentState.name}</h3>
                  </div>
                </div>
                <StatusBadge status={logAgentState.status} />
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">{logAgentState.role}</p>

              <div className="space-y-2 pt-2 border-t border-white/10 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-gray-400">Cognitive Model:</span>
                  <span className="text-gray-200">CrewAI L1 Pipeline (Stream Parser)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-gray-400">Ingested Stream:</span>
                  <span className="text-white font-bold">{events.length} logs</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-gray-400">Suspicious Flagged:</span>
                  <span className="text-yellow-400 font-bold">{suspiciousCount} anomalies</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-400">Current Status:</span>
                  <span className="text-blue-400 font-semibold truncate max-w-[200px]">
                    {logAgentState.output_summary}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setActivePage('log-analysis')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Ingestion Console</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Agent 2 Card */}
            <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg space-y-4 relative">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-blue-400 tracking-wider">
                      Agent 2: L2 Reasoner
                    </span>
                    <h3 className="text-sm font-bold text-white">{investigationAgentState.name}</h3>
                  </div>
                </div>
                <StatusBadge status={investigationAgentState.status} />
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">{investigationAgentState.role}</p>

              <div className="space-y-2 pt-2 border-t border-white/10 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-gray-400">Cognitive Model:</span>
                  <span className="text-gray-200">CrewAI L2 Pipeline (Graph Reasoner)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-gray-400">Correlated Threats:</span>
                  <span className="text-red-400 font-bold">{threats.length} verified dossiers</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-gray-400">Response Playbooks:</span>
                  <span className="text-green-400 font-bold">
                    {threats.reduce((acc, t) => acc + t.recommendations.length, 0)} actionable steps
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-400">Current Status:</span>
                  <span className="text-blue-400 font-semibold truncate max-w-[200px]">
                    {investigationAgentState.output_summary}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setActivePage('threats')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Explore Detected Threats</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Section B: Agent Execution & Reasoning Log */}
          <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Agent Execution &amp; Reasoning Log</h3>
              </div>
              <span className="text-xs font-mono text-gray-400">{agentLogs.length} Events</span>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {agentLogs.length === 0 ? (
                <p className="text-xs text-gray-500 font-mono py-6 text-center">
                  No execution logs recorded yet.
                </p>
              ) : (
                agentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 bg-[#111217] rounded border border-white/10 text-xs font-mono space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-blue-400 font-semibold">{log.agent_name}</span>
                      <span className="text-gray-500">{log.timestamp.slice(11, 19)} UTC</span>
                    </div>
                    <p className="text-gray-300 text-[11px] leading-relaxed">{log.message}</p>
                    {log.payload && (
                      <pre className="text-[9px] text-gray-500 overflow-x-auto bg-black/30 p-1 rounded">
                        {JSON.stringify(log.payload)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section C: Synthesized Threats Generated by Threat Investigation Agent */}
          <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Synthesized Attack Chains &amp; Explanations from Threat Investigation Agent
                </h3>
                <p className="text-xs text-gray-400">
                  Correlation of normalized events into contextual security threats
                </p>
              </div>
              <button
                onClick={() => setActivePage('threats')}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Threat Catalog</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {threats.map((t) => (
                <div
                  key={t.id}
                  className="p-4 bg-[#111217] border border-white/10 hover:border-blue-500/40 rounded-lg flex flex-col justify-between space-y-3 group transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-gray-400">{t.id}</span>
                      <span className="text-red-400 font-bold">{t.risk_score}/100 Risk</span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1 group-hover:text-blue-300 transition-colors">
                      {t.title}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-3 leading-relaxed">
                      {t.explanation.what_happened}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/10 space-y-2 text-xs font-mono">
                    <div className="text-[11px] text-gray-400">
                      Target: <span className="text-white">{t.affected_user}</span> @ {t.affected_system}
                    </div>
                    <button
                      onClick={() => navigateToThreat(t.id)}
                      className="w-full py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      <span>Investigate Evidence &amp; Playbooks</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
