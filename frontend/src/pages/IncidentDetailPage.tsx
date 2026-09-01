import React, { useState } from 'react';
import { useSOC } from '../context/SOCContext';
import {
  FolderLock,
  ArrowLeft,
  ShieldAlert,
  UserCheck,
  CheckCircle2,
  Clock,
  Send,
  FileCheck2,
  AlertOctagon,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { Incident, IncidentStatus } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';

export const IncidentDetailPage: React.FC = () => {
  const {
    incidents,
    threats,
    selectedIncidentId,
    setActivePage,
    navigateToThreat,
    updateIncidentStatus,
    addIncidentNote,
    generateReportForIncident,
    navigateToReport,
    addToast,
  } = useSOC();

  const [newNoteText, setNewNoteText] = useState<string>('');
  const [analystName, setAnalystName] = useState<string>('Lead SOC Analyst');

  const activeIncident: Incident | undefined =
    incidents.find((i) => i.id === selectedIncidentId) || incidents[0];

  if (!activeIncident) {
    return (
      <EmptyState
        title="No incident selected"
        description="Select an incident from the Incident Queue to review containment progress and analyst notes."
        actionText="View Incidents Queue"
        onAction={() => setActivePage('incidents')}
      />
    );
  }

  const linkedThreat = threats.find((t) => t.id === activeIncident.threat_id);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    addIncidentNote(activeIncident.id, newNoteText, analystName);
    setNewNoteText('');
  };

  const handleGenerateReport = () => {
    const rpt = generateReportForIncident(activeIncident.id);
    if (rpt) {
      navigateToReport(rpt.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="space-y-1">
          <button
            onClick={() => setActivePage('incidents')}
            className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 font-mono cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Incident Queue
          </button>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-mono font-bold text-cyan-400">{activeIncident.id}</span>
            <RiskBadge level={activeIncident.risk_level} size="md" />
            <StatusBadge status={activeIncident.status} size="md" />
            <span className="text-xs font-mono text-slate-400">Created: {activeIncident.created_at}</span>
          </div>
          <h2 className="text-lg font-bold text-slate-100">{activeIncident.threat_title}</h2>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {linkedThreat && (
            <button
              onClick={() => navigateToThreat(linkedThreat.id)}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>View Threat Dossier</span>
            </button>
          )}

          <button
            onClick={handleGenerateReport}
            className="px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-cyan-950 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Generate Official Report</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Incident Details & Containment Playbook */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Card */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <FolderLock className="w-4 h-4 text-indigo-400" />
              Incident Summary & Context
            </h3>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">{activeIncident.summary}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 font-mono text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Affected User</span>
                <span className="text-indigo-300 font-semibold">{activeIncident.affected_user}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Target Host</span>
                <span className="text-slate-200 font-semibold">{activeIncident.affected_system}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Assigned To</span>
                <span className="text-cyan-300 font-semibold">{activeIncident.assigned_to}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Incident State</span>
                <span className="text-emerald-400 font-semibold uppercase">{activeIncident.status}</span>
              </div>
            </div>
          </div>

          {/* Containment & Playbook Actions */}
          {activeIncident.containment_actions && activeIncident.containment_actions.length > 0 && (
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Containment &amp; Remediation Workflow
                </h3>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900">
                  {activeIncident.containment_actions.filter((a) => a.status === 'executed').length} /{' '}
                  {activeIncident.containment_actions.length} Completed
                </span>
              </div>

              <div className="space-y-2">
                {activeIncident.containment_actions.map((act) => (
                  <div
                    key={act.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                      act.status === 'executed'
                        ? 'bg-emerald-950/20 border-emerald-800/50 text-emerald-200'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-100 font-sans">{act.action}</div>
                      <div className="text-[11px] text-slate-400 font-sans">{act.reason}</div>
                    </div>

                    <span
                      className={`px-2.5 py-1 text-[10px] font-mono rounded-lg border font-semibold ${
                        act.status === 'executed'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border-amber-800'
                      }`}
                    >
                      {act.status === 'executed' ? '✓ EXECUTED' : 'PENDING'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analyst Investigation Journal */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                Analyst Investigation Journal ({activeIncident.notes.length})
              </h3>
              <span className="text-xs font-mono text-slate-400">Timestamped Audit Trail</span>
            </div>

            {/* Note Input */}
            <form onSubmit={handleAddNote} className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Analyst Name (e.g. Lead SOC Analyst)"
                  value={analystName}
                  onChange={(e) => setAnalystName(e.target.value)}
                  className="w-1/3 px-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter forensic observation or response update..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!newNoteText.trim()}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-bold rounded-lg shadow flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post Note</span>
                </button>
              </div>
            </form>

            {/* Notes List */}
            <div className="space-y-2.5 pt-2">
              {activeIncident.notes.map((note) => (
                <div key={note.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-cyan-300">{note.author}</span>
                    <span className="text-[10px] text-slate-500">{note.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">{note.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Incident Management Controls */}
        <div className="space-y-6">
          {/* Incident Status Workflow */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              Incident Lifecycle State
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {(['open', 'investigating', 'contained', 'resolved'] as IncidentStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => updateIncidentStatus(activeIncident.id, st)}
                  className={`p-3 rounded-xl border text-xs font-mono uppercase font-bold text-center cursor-pointer transition-all ${
                    activeIncident.status === st
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-950'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[11px] font-mono text-slate-400">
              <div>Incident SLA: <span className="text-emerald-400">On Track</span></div>
              <div className="mt-1">Severity: <span className="text-rose-400 font-bold">{activeIncident.risk_level}</span></div>
            </div>
          </div>

          {/* Linked Threat Reference */}
          {linkedThreat && (
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Underlying Threat Vector
              </h3>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                <div className="text-slate-200 font-bold font-sans">{linkedThreat.title}</div>
                <div className="text-slate-400">Source: <span className="text-rose-400">{linkedThreat.source}</span></div>
                <div className="text-slate-400">Confidence: <span className="text-cyan-400">{linkedThreat.confidence}%</span></div>
                <button
                  onClick={() => navigateToThreat(linkedThreat.id)}
                  className="w-full mt-2 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-300 text-xs font-bold rounded-lg border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Open Full Threat Dossier</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
