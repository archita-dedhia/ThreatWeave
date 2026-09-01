import React from 'react';
import { useSOC } from '../context/SOCContext';
import {
  Bot,
  Cpu,
  Zap,
  ArrowDown,
  Layers,
  Sparkles,
  ShieldAlert,
  Activity,
  CheckCircle2,
  Clock,
  Send,
  MessageSquare,
  FileCode2,
  Terminal,
  ExternalLink,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { RiskBadge } from '../components/common/RiskBadge';
import { EmptyState } from '../components/common/EmptyState';

export const AIInvestigationPage: React.FC = () => {
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
              Multi-Agent Architecture
            </span>
            <span className="text-xs text-gray-400 font-mono">Autonomous SOC Assistants</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">Multi-Agent Orchestration & Communication Bus</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Two specialized AI agents work synchronously: L1 Log Preprocessor &amp; L2 Attack Chain Reasoner.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDemoDataset}
            disabled={isProcessing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-md shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{hasData ? 'Re-Run Multi-Agent Pipeline' : 'Run Demo Pipeline'}</span>
          </button>
        </div>
      </div>

      {/* Visual Multi-Agent Workflow Diagram */}
      <div className="p-6 bg-[#1A1C23] border border-white/10 rounded-lg relative">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            Active Multi-Agent Orchestration Graph
          </h3>
          <span className="text-xs font-mono text-gray-400">Deterministic + Cognitive Architecture</span>
        </div>

        {/* Vertical / Horizontal Flow Graph */}
        <div className="flex flex-col lg:flex-row items-stretch justify-between gap-4 relative">
          {/* Step 1: Orchestrator */}
          <div className="flex-1 p-4 bg-[#111217] border border-white/10 rounded-lg flex flex-col justify-between shadow-sm relative group hover:border-white/20">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono text-gray-400">Master Controller</span>
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              </div>
              <h4 className="text-sm font-bold text-white mt-1">ORCHESTRATOR</h4>
              <p className="text-xs text-gray-400 mt-1">
                Coordinates lifecycle, routes telemetry envelopes, and schedules execution cycles.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-white/10 text-[11px] font-mono text-blue-400">
              Pipeline: {hasData ? 'Operational (Online)' : 'Idle'}
            </div>
          </div>

          <div className="flex items-center justify-center text-gray-600 font-bold text-lg self-center rotate-90 lg:rotate-0">
            →
          </div>

          {/* Step 2: Log Analysis Agent */}
          <div className="flex-1 p-4 bg-[#111217] border border-blue-500/30 rounded-lg flex flex-col justify-between shadow-sm relative group hover:border-blue-500 transition-all">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono text-blue-400 font-semibold">Agent 1</span>
                <StatusBadge status={logAgentState.status} size="sm" />
              </div>
              <h4 className="text-sm font-bold text-white mt-1">LOG ANALYSIS AGENT</h4>
              <p className="text-xs text-gray-400 mt-1">
                Ingests raw logs, normalizes schemas, computes anomaly heuristics &amp; flags indicators.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-white/10 text-[11px] font-mono flex items-center justify-between text-gray-400">
              <span>Suspicious Out:</span>
              <span className="text-yellow-400 font-bold">{suspiciousCount} Events</span>
            </div>
          </div>

          <div className="flex items-center justify-center text-gray-600 font-bold text-lg self-center rotate-90 lg:rotate-0">
            →
          </div>

          {/* Step 3: Threat Investigation Agent */}
          <div className="flex-1 p-4 bg-[#111217] border border-blue-500/30 rounded-lg flex flex-col justify-between shadow-sm relative group hover:border-blue-500 transition-all">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono text-blue-400 font-semibold">Agent 2</span>
                <StatusBadge status={investigationAgentState.status} size="sm" />
              </div>
              <h4 className="text-sm font-bold text-white mt-1">THREAT INVESTIGATION AGENT</h4>
              <p className="text-xs text-gray-400 mt-1">
                Correlates multi-event attack chains, reconstructs timelines, and produces evidence reasoning.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-white/10 text-[11px] font-mono flex items-center justify-between text-gray-400">
              <span>Correlated Chains:</span>
              <span className="text-blue-400 font-bold">{threats.length} Threats</span>
            </div>
          </div>

          <div className="flex items-center justify-center text-gray-600 font-bold text-lg self-center rotate-90 lg:rotate-0">
            →
          </div>

          {/* Step 4: Risk Assessment & Response Engine */}
          <div className="flex-1 p-4 bg-[#111217] border border-white/10 rounded-lg flex flex-col justify-between shadow-sm relative group hover:border-white/20">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono text-red-400">Action Engine</span>
                <span className="text-xs font-mono text-green-400">Ready</span>
              </div>
              <h4 className="text-sm font-bold text-white mt-1">RESPONSE &amp; REPORTING</h4>
              <p className="text-xs text-gray-400 mt-1">
                Computes mathematical risk score and generates defensive containment playbooks &amp; formal reports.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-white/10 text-[11px] font-mono flex items-center justify-between text-gray-400">
              <span>Playbooks:</span>
              <span className="text-green-400 font-bold">
                {threats.reduce((acc, t) => acc + t.recommendations.length, 0)} Actions
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Deep-Dive Agent Profile Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LOG ANALYSIS AGENT DEEP CARD */}
        <div className="p-6 bg-[#1A1C23] border border-white/10 rounded-lg space-y-4">
          <div className="flex items-start justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <FileCode2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-blue-400 tracking-wider">Primary Agent 1</span>
                <h4 className="text-base font-bold text-white">{logAgentState.name}</h4>
              </div>
            </div>
            <StatusBadge status={logAgentState.status} />
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="text-[10px] uppercase font-mono text-gray-400 font-semibold">Core Purpose</div>
              <p className="text-gray-300 mt-0.5 leading-relaxed">
                Ingest unstructured &amp; structured security telemetry, normalize multi-source formats, identify
                anomalous event signatures, extract indicators of compromise (IOCs), and emit suspicious event envelopes.
              </p>
            </div>

            <div>
              <div className="text-[10px] uppercase font-mono text-gray-400 font-semibold mb-1.5">
                Assigned Responsibilities
              </div>
              <ul className="space-y-1.5 text-gray-300 font-mono text-[11px]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Detect brute-force authentication sprays &amp; rate bursts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Flag obfuscated PowerShell, EncodedCommand &amp; IEX download cradles</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Identify off-hours access anomalies &amp; geo-velocity deviations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Tag unauthorized root/sudo privilege escalation commands</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Stream structured evidence payload to Threat Investigation Agent</span>
                </li>
              </ul>
            </div>

            <div className="p-3 bg-[#111217] rounded-lg border border-white/10 space-y-2 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-gray-500">Input:</span>
                <span className="text-gray-300 text-right truncate max-w-xs">{logAgentState.input_summary}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Output:</span>
                <span className="text-blue-400 text-right font-semibold truncate max-w-xs">
                  {logAgentState.output_summary}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Processing Time:</span>
                <span className="text-gray-300">{logAgentState.processing_time_ms} ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Model/Engine:</span>
                <span className="text-gray-300">{logAgentState.model_provider}</span>
              </div>
            </div>
          </div>
        </div>

        {/* THREAT INVESTIGATION AGENT DEEP CARD */}
        <div className="p-6 bg-[#1A1C23] border border-white/10 rounded-lg space-y-4">
          <div className="flex items-start justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-blue-400 tracking-wider">Primary Agent 2</span>
                <h4 className="text-base font-bold text-white">{investigationAgentState.name}</h4>
              </div>
            </div>
            <StatusBadge status={investigationAgentState.status} />
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="text-[10px] uppercase font-mono text-gray-400 font-semibold">Core Purpose</div>
              <p className="text-gray-300 mt-0.5 leading-relaxed">
                Investigate correlated suspicious event clusters, determine whether isolated alerts represent a
                coordinated cyber attack chain, evaluate evidence against MITRE ATT&amp;CK tactics, score risk, and
                synthesize explainable reasoning.
              </p>
            </div>

            <div>
              <div className="text-[10px] uppercase font-mono text-gray-400 font-semibold mb-1.5">
                Assigned Responsibilities
              </div>
              <ul className="space-y-1.5 text-gray-300 font-mono text-[11px]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Correlate disparate events across time, users, and IP endpoints</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Reconstruct chronological attack timeline and progression stages</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Evaluate exact log evidence items and map to MITRE ATT&amp;CK tactics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Calculate transparent multi-factor risk score (0-100)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Formulate evidence-backed explanation &amp; tiered response recommendations</span>
                </li>
              </ul>
            </div>

            <div className="p-3 bg-[#111217] rounded-lg border border-white/10 space-y-2 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-gray-500">Input:</span>
                <span className="text-gray-300 text-right truncate max-w-xs">{investigationAgentState.input_summary}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Output:</span>
                <span className="text-blue-400 text-right font-semibold truncate max-w-xs">
                  {investigationAgentState.output_summary}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Processing Time:</span>
                <span className="text-gray-300">{investigationAgentState.processing_time_ms} ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Model/Engine:</span>
                <span className="text-gray-300">{investigationAgentState.model_provider}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agent-to-Agent Communication Message Bus Stream */}
      <div className="p-6 bg-[#1A1C23] border border-white/10 rounded-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              Inter-Agent Communication Message Bus
            </h3>
            <p className="text-xs text-gray-400">Structured telemetry envelopes exchanged between agents</p>
          </div>
          <span className="text-[11px] font-mono text-gray-400">
            {agentMessages.length} Messages • {agentLogs.length} Execution Logs
          </span>
        </div>

        {!hasData ? (
          <div className="p-8 text-center text-xs text-gray-500 font-mono">
            No active agent communication envelopes. Load demo dataset or ingest logs to initiate inter-agent message
            bus.
          </div>
        ) : (
          <div className="space-y-3">
            {agentMessages.map((msg) => (
              <div key={msg.id} className="p-4 bg-[#111217] rounded-lg border border-white/10 font-mono text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 font-bold">{msg.from_agent}</span>
                    <span className="text-gray-600">→</span>
                    <span className="text-blue-300 font-bold">{msg.to_agent}</span>
                  </div>
                  <span className="text-gray-500">{msg.timestamp}</span>
                </div>
                <div className="mt-2 text-white font-semibold">{msg.stage}</div>
                <p className="text-gray-400 font-sans mt-0.5 text-xs">{msg.payload_summary}</p>
              </div>
            ))}

            {/* Execution Logs Terminal */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <div className="text-xs font-semibold text-gray-300 mb-2 font-mono flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-gray-400" />
                Raw Agent Execution Journal
              </div>
              <div className="p-3 bg-[#111217] rounded-lg border border-white/10 font-mono text-[11px] space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                {agentLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2">
                    <span className="text-gray-500 shrink-0">[{log.timestamp.slice(11, 19)}]</span>
                    <span
                      className={`font-semibold shrink-0 ${
                        log.level === 'detection'
                          ? 'text-yellow-400'
                          : log.level === 'correlation'
                          ? 'text-blue-400'
                          : log.level === 'success'
                          ? 'text-green-400'
                          : 'text-blue-400'
                      }`}
                    >
                      {log.agent_name}:
                    </span>
                    <span className="text-gray-300">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Correlated Threats Quick Access */}
      {threats.length > 0 && (
        <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              Generated Threat Dossiers Ready for Investigation
            </h3>
            <span className="text-xs font-mono text-blue-400">{threats.length} Actionable Threats</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {threats.map((t) => (
              <div
                key={t.id}
                onClick={() => navigateToThreat(t.id)}
                className="p-3.5 bg-[#111217] hover:bg-white/5 border border-white/10 hover:border-blue-500/40 rounded-lg cursor-pointer transition-all flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-gray-500">{t.id}</span>
                    <RiskBadge level={t.risk_level} size="sm" />
                  </div>
                  <h4 className="text-xs font-bold text-white mt-1 line-clamp-1">{t.title}</h4>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 pt-2 border-t border-white/10">
                  <span>{t.affected_user}</span>
                  <span className="text-blue-400 flex items-center gap-1 font-semibold">
                    Investigate →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
