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
  FileCheck2,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Play,
  Check,
  Shield,
  Zap,
  Info,
  Key,
  Flame,
  CornerDownRight,
} from 'lucide-react';
import { Threat, SecurityEvent, EvidenceItem, ResponseAction } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';

export const ThreatInvestigationPage: React.FC = () => {
  const {
    threats,
    events,
    selectedThreatId,
    setActivePage,
    navigateToThreat,
    createIncidentFromThreat,
    executeResponseAction,
    generateReportForIncident,
    navigateToReport,
    addToast,
  } = useSOC();

  const [activeEvidenceModal, setActiveEvidenceModal] = useState<EvidenceItem | null>(null);
  const [activeEventModal, setActiveEventModal] = useState<SecurityEvent | null>(null);
  const [expandedTimelineId, setExpandedTimelineId] = useState<string | null>(null);

  // Get active threat or fallback to first available
  const activeThreat: Threat | undefined =
    threats.find((t) => t.id === selectedThreatId) || threats[0];

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

  // Get correlated security events in chronological order
  const correlatedEvents: SecurityEvent[] = events.filter((e) =>
    activeThreat.correlated_event_ids.includes(e.id)
  );

  const handleCreateIncident = () => {
    const inc = createIncidentFromThreat(activeThreat.id);
    if (inc) {
      setActivePage('incident-detail');
    }
  };

  const handleGenerateReport = () => {
    // Check if incident exists, if not create one first
    let inc = useSOC().incidents.find((i) => i.threat_id === activeThreat.id);
    if (!inc) {
      inc = createIncidentFromThreat(activeThreat.id) || undefined;
    }
    if (inc) {
      const rpt = generateReportForIncident(inc.id);
      if (rpt) {
        navigateToReport(rpt.id);
      }
    }
  };

  // Group recommendations by category
  const groupedRecommendations = {
    'Immediate Actions': activeThreat.recommendations.filter((r) => r.category === 'Immediate Actions'),
    'Containment Actions': activeThreat.recommendations.filter((r) => r.category === 'Containment Actions'),
    'Investigation Actions': activeThreat.recommendations.filter((r) => r.category === 'Investigation Actions'),
    'Recovery Actions': activeThreat.recommendations.filter((r) => r.category === 'Recovery Actions'),
  };

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="space-y-1">
          <button
            onClick={() => setActivePage('threats')}
            className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 font-mono cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Detected Threats
          </button>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-mono font-bold text-slate-400">{activeThreat.id}</span>
            <RiskBadge level={activeThreat.risk_level} size="md" />
            <StatusBadge status={activeThreat.status} size="md" />
            <span className="text-xs font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              Confidence: {activeThreat.confidence}%
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-100">{activeThreat.title}</h2>
        </div>

        {/* Global Case Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => addToast('info', 'Case Reviewed', `Threat ${activeThreat.id} marked as analyst-reviewed.`)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            Mark as Reviewed
          </button>

          <button
            onClick={handleCreateIncident}
            className="px-3.5 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/50 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Create Incident</span>
          </button>

          <button
            onClick={handleGenerateReport}
            className="px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-cyan-950 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Switch between other threats selector if multiple */}
      {threats.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
          <span className="text-slate-400 shrink-0">Switch Threat Dossier:</span>
          {threats.map((t) => (
            <button
              key={t.id}
              onClick={() => navigateToThreat(t.id)}
              className={`px-3 py-1 rounded-lg border whitespace-nowrap cursor-pointer transition-all ${
                t.id === activeThreat.id
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-200 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.id}: {t.affected_user} ({t.risk_level})
            </button>
          ))}
        </div>
      )}

      {/* Main 2-Column Investigation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Chronological Attack Timeline (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Attack Timeline Header */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Chronological Attack Timeline
                </h3>
                <p className="text-xs text-slate-400">
                  {correlatedEvents.length} correlated events forming reconstructed attack chain
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                Attack Vector Reconstructed
              </span>
            </div>

            {/* Timeline Nodes */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {correlatedEvents.map((evt, idx) => {
                const isExpanded = expandedTimelineId === evt.id;
                let dotColor = 'bg-cyan-500 ring-cyan-950';
                if (evt.severity === 'critical') dotColor = 'bg-rose-500 ring-rose-950 animate-pulse';
                else if (evt.severity === 'high') dotColor = 'bg-amber-500 ring-amber-950';

                return (
                  <div key={evt.id} className="relative group">
                    {/* Timeline Node Dot */}
                    <div
                      className={`absolute -left-[19px] top-1.5 w-3 h-3 rounded-full ${dotColor} ring-4 border border-slate-950`}
                    />

                    {/* Timeline Event Card */}
                    <div className="p-4 bg-slate-950/80 border border-slate-800/90 rounded-xl hover:border-cyan-800/80 transition-all space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold text-slate-300">{evt.event_type}</span>
                          <RiskBadge level={evt.severity} size="sm" />
                          <StatusBadge status={evt.status} size="sm" />
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">{evt.timestamp}</span>
                      </div>

                      {/* Key details */}
                      <div className="text-xs font-mono text-slate-300">
                        <span className="text-slate-500">Action: </span>
                        <span className="text-cyan-300 font-semibold">{evt.action}</span> •{' '}
                        <span className="text-slate-500">Actor: </span>
                        <span className="text-indigo-300">{evt.user}</span> •{' '}
                        <span className="text-slate-500">Source: </span>
                        <span className="text-rose-400">{evt.source_ip}</span>
                      </div>

                      {/* Indicators & Command */}
                      {evt.command && (
                        <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-[11px] font-mono text-amber-300 break-all">
                          $ {evt.command}
                        </div>
                      )}

                      {evt.suspicious_reasons && evt.suspicious_reasons.length > 0 && (
                        <div className="text-[11px] text-amber-400/90 flex items-start gap-1 font-sans">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{evt.suspicious_reasons.join(' • ')}</span>
                        </div>
                      )}

                      {/* Expand / View Details Button */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[11px] font-mono">
                        <button
                          onClick={() => setExpandedTimelineId(isExpanded ? null : evt.id)}
                          className="text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          <span>{isExpanded ? 'Hide Raw Details' : 'View Full Event Details'}</span>
                        </button>

                        <button
                          onClick={() => setActiveEventModal(evt)}
                          className="text-cyan-400 hover:underline cursor-pointer"
                        >
                          Inspect Event Log
                        </button>
                      </div>

                      {/* Collapsible raw details */}
                      {isExpanded && (
                        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono space-y-1.5 mt-2 animate-in fade-in">
                          <div className="text-slate-400">Destination: {evt.destination_ip}</div>
                          {evt.process && <div className="text-slate-400">Process: {evt.process}</div>}
                          {evt.file && <div className="text-slate-400">File Asset: {evt.file}</div>}
                          {evt.bytes_transferred && evt.bytes_transferred > 0 && (
                            <div className="text-slate-400">
                              Bytes Transferred: {Math.round(evt.bytes_transferred / (1024 * 1024))} MB (
                              {evt.bytes_transferred.toLocaleString()} B)
                            </div>
                          )}
                          {evt.mitre_technique && (
                            <div className="text-cyan-400">MITRE Technique: {evt.mitre_technique}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Evidence Vault (Clickable cards) */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Key className="w-4 h-4 text-cyan-400" />
                  Correlated Log Evidence Vault ({activeThreat.evidence.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Click any evidence card to inspect raw field signatures and log traces
                </p>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900">
                Verified Trace
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {activeThreat.evidence.map((evd) => (
                <div
                  key={evd.id}
                  onClick={() => setActiveEvidenceModal(evd)}
                  className="p-3.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-700/80 rounded-xl cursor-pointer transition-all flex items-start justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="text-cyan-400 font-bold">{evd.id}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">{evd.timestamp}</span>
                      <RiskBadge level={evd.severity} size="sm" />
                    </div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                      {evd.title}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono break-all">{evd.description}</div>
                  </div>

                  <span className="text-[11px] font-mono text-cyan-400 group-hover:underline shrink-0 flex items-center gap-1">
                    Examine →
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Risk Assessment, AI Explanation, Recommended Response (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Section: Risk Assessment Breakdown */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-400" />
                Autonomous Risk Assessment
              </h3>
              <RiskBadge level={activeThreat.risk_level} size="lg" />
            </div>

            {/* Risk Gauge / Score */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500">Calculated Risk Score</span>
                <div className="text-3xl font-black text-slate-100 font-mono mt-0.5">
                  {activeThreat.risk_score}
                  <span className="text-xs text-slate-500 font-normal"> / 100</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-mono text-slate-500">Confidence Rating</span>
                <div className="text-2xl font-bold text-cyan-400 font-mono mt-0.5">
                  {activeThreat.confidence}%
                </div>
              </div>
            </div>

            {/* Breakdown factors */}
            <div className="space-y-2.5">
              <div className="text-xs font-mono uppercase text-slate-400 font-semibold">
                Transparent Risk Factors
              </div>
              {activeThreat.risk_breakdown.factors.map((f, i) => (
                <div key={i} className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-semibold text-slate-200">{f.name}</span>
                    <span className="text-rose-400 font-bold">+{f.score} pts</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 font-sans leading-snug">{f.description}</p>
                </div>
              ))}
            </div>

            {/* MITRE ATT&CK Tactics */}
            {activeThreat.mitre_tactics && activeThreat.mitre_tactics.length > 0 && (
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1.5 font-semibold">
                  MITRE ATT&amp;CK Mapping
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeThreat.mitre_tactics.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-indigo-950/70 border border-indigo-800/60 text-indigo-300 text-[10px] font-mono rounded"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section: Structured Evidence-Backed AI Explanation */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                Evidence-Backed AI Reasoning
              </h3>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                Explainable AI
              </span>
            </div>

            <div className="space-y-4 text-xs">
              {/* What happened? */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 font-mono">
                  <span>1.</span> What happened?
                </h4>
                <p className="text-slate-300 font-sans leading-relaxed">{activeThreat.explanation.what_happened}</p>
              </div>

              {/* Why is it suspicious? */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5 font-mono">
                  <span>2.</span> Why is it suspicious?
                </h4>
                <p className="text-slate-300 font-sans leading-relaxed">{activeThreat.explanation.why_suspicious}</p>
              </div>

              {/* Which events are connected? */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 font-mono">
                  <span>3.</span> Which events are connected?
                </h4>
                <p className="text-slate-300 font-sans leading-relaxed">{activeThreat.explanation.connected_events}</p>
              </div>

              {/* Why was this risk level assigned? */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1.5 font-mono">
                  <span>4.</span> Why was this risk level assigned?
                </h4>
                <p className="text-slate-300 font-sans leading-relaxed">{activeThreat.explanation.risk_rationale}</p>
              </div>
            </div>
          </div>

          {/* Section: Actionable Recommended Response Playbooks */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Recommended Response Actions
                </h3>
                <p className="text-xs text-slate-400">Defensive response playbooks synthesized by Response Engine</p>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900">
                Actionable
              </span>
            </div>

            <div className="space-y-4">
              {Object.entries(groupedRecommendations).map(([category, actions]) => {
                if (actions.length === 0) return null;

                return (
                  <div key={category} className="space-y-2">
                    <div className="text-[11px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1.5">
                      <CornerDownRight className="w-3 h-3 text-cyan-400" />
                      {category}
                    </div>

                    <div className="space-y-2">
                      {actions.map((rec) => {
                        const isExecuted = rec.status === 'executed';

                        return (
                          <div
                            key={rec.id}
                            className={`p-3 rounded-xl border transition-all text-xs ${
                              isExecuted
                                ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                                      rec.priority === 'CRITICAL'
                                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                                        : rec.priority === 'HIGH'
                                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                                        : 'bg-slate-800 text-slate-300 border-slate-700'
                                    }`}
                                  >
                                    {rec.priority}
                                  </span>
                                  <span className="text-slate-400 font-mono text-[10px]">Target: {rec.target}</span>
                                </div>
                                <div className="font-semibold text-slate-100 font-sans">{rec.action}</div>
                                <div className="text-[11px] text-slate-400 font-sans">{rec.reason}</div>
                              </div>

                              <button
                                onClick={() => executeResponseAction(activeThreat.id, rec.id)}
                                disabled={isExecuted}
                                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg shrink-0 flex items-center gap-1 transition-colors cursor-pointer ${
                                  isExecuted
                                    ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 cursor-default'
                                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm'
                                }`}
                              >
                                {isExecuted ? (
                                  <>
                                    <Check className="w-3 h-3" /> Applied
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-3 h-3" /> Apply
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Evidence Modal Viewer */}
      {activeEvidenceModal && (
        <Modal
          isOpen={!!activeEvidenceModal}
          onClose={() => setActiveEvidenceModal(null)}
          title={`Evidence Inspection: ${activeEvidenceModal.id}`}
          subtitle={activeEvidenceModal.title}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs font-mono">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[10px]">TIMESTAMP</span>
                <span className="text-slate-200">{activeEvidenceModal.timestamp}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">SEVERITY</span>
                <RiskBadge level={activeEvidenceModal.severity} size="sm" />
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 block text-[10px]">FORENSIC DESCRIPTION</span>
              <p className="text-slate-300 font-sans text-xs">{activeEvidenceModal.description}</p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 block text-[10px]">EXTRACTED EVIDENCE VALUE</span>
              <div className="text-cyan-300 text-xs font-bold break-all">{activeEvidenceModal.extracted_value}</div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 block text-[10px]">RAW LOG TRACE</span>
              <pre className="text-[11px] text-slate-300 whitespace-pre-wrap break-all p-2 bg-slate-900 rounded border border-slate-800 mt-1">
                {activeEvidenceModal.raw_snippet}
              </pre>
            </div>
          </div>
        </Modal>
      )}

      {/* Event Modal Viewer */}
      {activeEventModal && (
        <Modal
          isOpen={!!activeEventModal}
          onClose={() => setActiveEventModal(null)}
          title={`Event Record: ${activeEventModal.id}`}
          subtitle={`${activeEventModal.event_type} • ${activeEventModal.timestamp}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Source IP</span>
                <span className="text-cyan-400 font-semibold">{activeEventModal.source_ip}</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Destination IP</span>
                <span className="text-slate-300 font-semibold">{activeEventModal.destination_ip}</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">User</span>
                <span className="text-indigo-300 font-semibold">{activeEventModal.user}</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Action</span>
                <span className="text-slate-300 font-semibold">{activeEventModal.action}</span>
              </div>
            </div>

            {activeEventModal.command && (
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Command Line</span>
                <span className="text-amber-300 break-all">{activeEventModal.command}</span>
              </div>
            )}

            {activeEventModal.raw_log && (
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Raw Log Record</span>
                <pre className="text-[11px] text-slate-300 whitespace-pre-wrap break-all mt-1">
                  {activeEventModal.raw_log}
                </pre>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
