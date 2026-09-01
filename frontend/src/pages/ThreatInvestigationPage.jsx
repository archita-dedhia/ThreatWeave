import React, { useState } from 'react';
import { useSOC } from '../context/SOCContext';
import {
  ShieldAlert,
  Clock,
  Activity,
  Layers,
  FileText,
  CheckCircle2,
  FolderPlus,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Play,
  Check,
  Shield,
  Zap,
  Info,
} from 'lucide-react';
import { RiskBadge } from '../components/common/RiskBadge';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';

export const ThreatInvestigationPage = () => {
  const {
    threats,
    events,
    selectedThreatId,
    setActivePage,
    navigateToThreat,
    createIncidentFromThreat,
    executeResponseAction,
  } = useSOC();

  const [activeEvidenceModal, setActiveEvidenceModal] = useState(null);
  const [activeEventModal, setActiveEventModal] = useState(null);
  const [expandedTimelineId, setExpandedTimelineId] = useState(null);

  // Get active threat or fallback to first available
  const activeThreat = threats.find((t) => t.id === selectedThreatId) || threats[0];

  if (!activeThreat) {
    return (
      <EmptyState
        title="No threat selected"
        description="Select a threat from the Detected Threats catalog or load the test dataset to begin deep forensic investigation."
        actionText="View Threats"
        onAction={() => setActivePage('threats')}
      />
    );
  }

  // Correlated telemetry events
  const correlatedEvents = events.filter((e) => activeThreat.correlated_event_ids.includes(e.id));

  return (
    <div className="space-y-6">
      {/* Top Header & Threat Selector Bar */}
      <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => setActivePage('threats')}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1.5 font-mono mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Detected Threats</span>
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-gray-400">{activeThreat.id}</span>
            <RiskBadge level={activeThreat.risk_level} size="sm" />
            <span className="text-xs font-mono text-blue-400 bg-blue-600/10 px-2 py-0.5 rounded border border-blue-500/20">
              Confidence: {activeThreat.confidence}%
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">{activeThreat.title}</h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Threat Switcher Dropdown */}
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
            <span>Investigating:</span>
            <select
              value={activeThreat.id}
              onChange={(e) => navigateToThreat(e.target.value)}
              className="bg-[#111217] border border-white/10 text-gray-200 text-xs rounded px-3 py-1.5 focus:border-blue-500 focus:outline-none"
            >
              {threats.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id}: {t.title.slice(0, 35)}...
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => createIncidentFromThreat(activeThreat.id)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-md shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Create Incident Dossier</span>
          </button>
        </div>
      </div>

      {/* Grid: 3 Major Forensic Investigation Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Deep AI Explainable Reasoning & Risk Score Breakdown (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Natural Language AI Explanation & Reasoning */}
          <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">AI-Generated Threat Explanation &amp; Attack Vector</h3>
              </div>
              <span className="text-[10px] font-mono uppercase bg-blue-600/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-semibold">
                Synthesized by Agent 2
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-[#111217] rounded-lg border border-white/10 space-y-1.5">
                <h4 className="font-semibold text-blue-400 font-mono flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  What Happened:
                </h4>
                <p className="text-gray-300 leading-relaxed font-sans">{activeThreat.explanation.what_happened}</p>
              </div>

              <div className="p-3.5 bg-[#111217] rounded-lg border border-white/10 space-y-1.5">
                <h4 className="font-semibold text-yellow-400 font-mono flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Why It Is Suspicious:
                </h4>
                <p className="text-gray-300 leading-relaxed font-sans">{activeThreat.explanation.why_suspicious}</p>
              </div>

              <div className="p-3.5 bg-[#111217] rounded-lg border border-white/10 space-y-1.5">
                <h4 className="font-semibold text-red-400 font-mono flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Correlated Telemetry Chain:
                </h4>
                <p className="text-gray-300 leading-relaxed font-sans">{activeThreat.explanation.connected_events}</p>
              </div>

              <div className="p-3.5 bg-blue-900/10 border border-blue-500/20 rounded-lg space-y-1.5 text-blue-200">
                <h4 className="font-semibold text-blue-300 font-mono flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  Risk Justification &amp; Impact Rating:
                </h4>
                <p className="leading-relaxed font-sans">{activeThreat.explanation.risk_rationale}</p>
              </div>
            </div>
          </div>

          {/* 2. Structured Risk Breakdown */}
          <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-sm font-bold text-white">Calculated Risk Score Breakdown</h3>
                <p className="text-xs text-gray-400">Deterministic and contextual weighted evaluation</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-red-400 font-mono">{activeThreat.risk_score}/100</div>
                <div className="text-[10px] uppercase font-mono text-gray-400">{activeThreat.risk_level} SEVERITY</div>
              </div>
            </div>

            <div className="space-y-3">
              {activeThreat.risk_breakdown.factors.map((factor, idx) => (
                <div key={idx} className="p-3 bg-[#111217] rounded-lg border border-white/10 space-y-1 text-xs">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-white font-semibold">{factor.name}</span>
                    <span className="text-blue-400 font-bold">
                      +{factor.score} pts ({factor.weight})
                    </span>
                  </div>
                  <p className="text-gray-400 text-[11px] leading-relaxed">{factor.description}</p>
                </div>
              ))}

              <div className="p-3 bg-black/40 rounded border border-white/5 text-[11px] font-mono text-gray-400">
                <span className="text-gray-200 font-semibold block mb-0.5">Scoring Engine Justification:</span>
                {activeThreat.risk_breakdown.justification}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Evidence Items & Actionable Response Playbook (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 3. Correlated Evidence Items */}
          <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-sm font-bold text-white">Correlated Evidence Chain</h3>
                <p className="text-xs text-gray-400">Extracted telemetry artifacts linked to this attack vector</p>
              </div>
              <span className="text-xs font-mono text-blue-400 bg-blue-600/10 px-2 py-0.5 rounded border border-blue-500/20">
                {activeThreat.evidence.length} Items
              </span>
            </div>

            <div className="space-y-2.5">
              {activeThreat.evidence.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveEvidenceModal(item)}
                  className="p-3 bg-[#111217] hover:bg-white/5 border border-white/10 rounded-lg transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-gray-500">{item.id}</span>
                    <RiskBadge level={item.severity} size="sm" />
                  </div>
                  <h4 className="text-xs font-bold text-white mt-1 group-hover:text-blue-300 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                  <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-gray-500">
                    <span>{item.timestamp}</span>
                    <span className="text-blue-400 group-hover:underline">View Forensic Raw Snippet →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Actionable Response Recommendations Playbook */}
          <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-sm font-bold text-white">Recommended Response Playbook</h3>
                <p className="text-xs text-gray-400">Mitigation actions categorized by containment phases</p>
              </div>
              <span className="text-xs font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                {activeThreat.recommendations.length} Steps
              </span>
            </div>

            <div className="space-y-3">
              {activeThreat.recommendations.map((rec) => {
                const isExecuted = rec.status === 'executed';

                return (
                  <div
                    key={rec.id}
                    className={`p-3.5 rounded-lg border transition-all ${
                      isExecuted
                        ? 'bg-green-500/5 border-green-500/30'
                        : 'bg-[#111217] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase bg-white/5 text-gray-400 px-1.5 py-0.5 rounded border border-white/10">
                            {rec.category}
                          </span>
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              rec.priority === 'CRITICAL'
                                ? 'bg-red-500/20 text-red-400'
                                : rec.priority === 'HIGH'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-blue-500/20 text-blue-400'
                            }`}
                          >
                            {rec.priority}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white mt-1.5">{rec.action}</h4>
                        <p className="text-[11px] text-gray-400 mt-1">{rec.reason}</p>
                      </div>

                      {/* Execute Button */}
                      <button
                        onClick={() => executeResponseAction(activeThreat.id, rec.id)}
                        disabled={isExecuted}
                        className={`px-3 py-1.5 rounded text-xs font-semibold shrink-0 flex items-center gap-1 transition-all cursor-pointer ${
                          isExecuted
                            ? 'bg-green-500/20 text-green-400 cursor-default'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                        }`}
                      >
                        {isExecuted ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Executed</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-current" />
                            <span>Execute</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-gray-500">
                      <span>Target: {rec.target}</span>
                      {rec.is_automated_eligible && (
                        <span className="text-blue-400 flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Auto-containment eligible
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Correlated Events Timeline Table */}
      <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-sm font-bold text-white">Correlated Attack Sequence Timeline</h3>
            <p className="text-xs text-gray-400">
              Chronological log progression reconstructed by the AI Threat Reasoner
            </p>
          </div>
          <span className="text-xs font-mono text-gray-400">{correlatedEvents.length} Sequential Events</span>
        </div>

        <div className="space-y-3">
          {correlatedEvents.map((evt, idx) => {
            const isExpanded = expandedTimelineId === evt.id;

            return (
              <div
                key={evt.id}
                className="p-3.5 bg-[#111217] border border-white/10 rounded-lg hover:border-white/20 transition-all font-mono text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-xs shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{evt.event_type}</span>
                        <span className="text-gray-500">|</span>
                        <span className="text-gray-300 font-semibold">{evt.action}</span>
                        <RiskBadge level={evt.severity} size="sm" />
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        <span className="text-gray-500">Actor:</span>{' '}
                        <span className="text-white font-semibold">{evt.user}</span> &bull;{' '}
                        <span className="text-gray-500">Source:</span>{' '}
                        <span className="text-blue-400">{evt.source_ip}</span> &bull;{' '}
                        <span className="text-gray-500">Target:</span> {evt.destination_ip}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-gray-400 text-[11px]">{evt.timestamp}</span>
                    <button
                      onClick={() => setExpandedTimelineId(isExpanded ? null : evt.id)}
                      className="p-1 text-gray-400 hover:text-white rounded transition-colors cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-2 text-[11px]">
                    {evt.command && (
                      <div>
                        <span className="text-gray-500 block">Command / Args:</span>
                        <code className="text-yellow-400 break-all">{evt.command}</code>
                      </div>
                    )}
                    {evt.file && (
                      <div>
                        <span className="text-gray-500 block">File Target:</span>
                        <code className="text-blue-300 break-all">{evt.file}</code>
                      </div>
                    )}
                    {evt.raw_log && (
                      <div>
                        <span className="text-gray-500 block">Raw Telemetry Log:</span>
                        <pre className="text-[10px] text-gray-300 bg-black/50 p-2 rounded whitespace-pre-wrap break-all">
                          {evt.raw_log}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Evidence Forensic Modal */}
      {activeEvidenceModal && (
        <Modal
          isOpen={!!activeEvidenceModal}
          onClose={() => setActiveEvidenceModal(null)}
          title={`Forensic Evidence Item: ${activeEvidenceModal.id}`}
          subtitle={activeEvidenceModal.title}
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3 bg-[#111217] rounded border border-white/10 space-y-1">
              <span className="text-gray-500 block text-[10px] uppercase">Telemetry Artifact</span>
              <span className="text-white font-semibold">{activeEvidenceModal.extracted_value}</span>
            </div>

            <div className="p-3 bg-[#111217] rounded border border-white/10 space-y-1">
              <span className="text-gray-500 block text-[10px] uppercase">Reasoning Analysis</span>
              <p className="text-gray-300 leading-relaxed font-sans">{activeEvidenceModal.description}</p>
            </div>

            <div className="p-3 bg-[#111217] rounded border border-white/10 space-y-1">
              <span className="text-gray-500 block text-[10px] uppercase">Raw Log Snippet</span>
              <pre className="text-[11px] text-gray-300 bg-black/40 p-2 rounded whitespace-pre-wrap break-all">
                {activeEvidenceModal.raw_snippet}
              </pre>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
