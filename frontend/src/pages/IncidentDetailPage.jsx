import React, { useState } from 'react';
import { useSOC } from '../context/SOCContext';
import {
  FolderLock,
  ArrowLeft,
  UserCheck,
  Send,
  FileCheck2,
  AlertOctagon,
  ExternalLink,
} from 'lucide-react';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';

export const IncidentDetailPage = () => {
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
  } = useSOC();

  const [newNoteText, setNewNoteText] = useState('');
  const [analystName, setAnalystName] = useState('Lead SOC Analyst');

  const activeIncident =
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

  const handleAddNote = (e) => {
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
      {/* Header Bar */}
      <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => setActivePage('incidents')}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1.5 font-mono mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Incident Queue</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-400">{activeIncident.id}</span>
            <RiskBadge level={activeIncident.risk_level} size="sm" />
            <StatusBadge status={activeIncident.status} />
          </div>
          <h2 className="text-lg font-bold text-white mt-1">{activeIncident.threat_title}</h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateReport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-md shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Generate Forensic Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Incident Metadata & Containment Actions (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Metadata & Status Workflow */}
          <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">Incident Dossier &amp; Status Controls</h3>
              <span className="text-xs font-mono text-gray-400">Created: {activeIncident.created_at}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 bg-[#111217] rounded border border-white/10">
                <span className="text-gray-500 block text-[10px] uppercase">Target Entity</span>
                <span className="text-white font-semibold">{activeIncident.affected_user}</span>
              </div>
              <div className="p-3 bg-[#111217] rounded border border-white/10">
                <span className="text-gray-500 block text-[10px] uppercase">Target Host</span>
                <span className="text-white font-semibold">{activeIncident.affected_system}</span>
              </div>
              <div className="p-3 bg-[#111217] rounded border border-white/10">
                <span className="text-gray-500 block text-[10px] uppercase">Origin Network</span>
                <span className="text-red-400 font-semibold">{activeIncident.source}</span>
              </div>
              <div className="p-3 bg-[#111217] rounded border border-white/10">
                <span className="text-gray-500 block text-[10px] uppercase">Assigned Analyst</span>
                <span className="text-blue-400 font-semibold">{activeIncident.assigned_to}</span>
              </div>
            </div>

            {/* Status Lifecycle Transition Buttons */}
            <div className="pt-2">
              <span className="text-[11px] font-mono text-gray-400 block mb-2 font-semibold">
                Update Incident Lifecycle Status:
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { key: 'open', label: '1. Open', color: 'hover:border-yellow-500' },
                  { key: 'investigating', label: '2. Investigating', color: 'hover:border-blue-500' },
                  { key: 'contained', label: '3. Contained', color: 'hover:border-purple-500' },
                  { key: 'resolved', label: '4. Resolved', color: 'hover:border-green-500' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => updateIncidentStatus(activeIncident.id, item.key)}
                    className={`py-2 px-2 rounded text-xs font-mono font-semibold text-center border transition-all cursor-pointer ${
                      activeIncident.status === item.key
                        ? 'bg-blue-600/20 text-blue-400 border-blue-500/40 shadow-sm'
                        : `bg-[#111217] text-gray-400 border-white/10 ${item.color}`
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Linked Threat Investigation Summary */}
          {linkedThreat && (
            <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-sm font-bold text-white">Linked Threat Dossier: {linkedThreat.id}</h3>
                  <p className="text-xs text-gray-400">Synthesized attack chain and evidence correlation</p>
                </div>
                <button
                  onClick={() => navigateToThreat(linkedThreat.id)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Deep Forensics</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-3.5 bg-[#111217] rounded-lg border border-white/10 space-y-2 text-xs">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-white font-semibold">{linkedThreat.title}</span>
                  <span className="text-red-400 font-bold">{linkedThreat.risk_score}/100 Risk</span>
                </div>
                <p className="text-gray-300 leading-relaxed font-sans">{linkedThreat.explanation.what_happened}</p>
                <div className="pt-2 border-t border-white/5 flex flex-wrap gap-1 font-mono text-[10px]">
                  {linkedThreat.mitre_tactics.map((t, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 bg-black/40 rounded border border-white/5 text-gray-400">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Analyst Case Notes & Audit Activity (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg flex flex-col justify-between space-y-4 min-h-[460px]">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">Analyst Collaboration &amp; Notes</h3>
                </div>
                <span className="text-xs font-mono text-gray-400">{activeIncident.notes.length} Notes</span>
              </div>

              {/* Notes Stream */}
              <div className="space-y-3 py-3 max-h-[300px] overflow-y-auto pr-1">
                {activeIncident.notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 bg-[#111217] rounded-lg border border-white/10 text-xs font-mono space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-blue-400 font-semibold">{note.author}</span>
                      <span className="text-gray-500 text-[10px]">{note.timestamp}</span>
                    </div>
                    <p className="text-gray-300 font-sans leading-relaxed text-[11px]">{note.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Note Input Box */}
            <form onSubmit={handleAddNote} className="space-y-2 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
                <span>Add Case Note:</span>
                <input
                  type="text"
                  value={analystName}
                  onChange={(e) => setAnalystName(e.target.value)}
                  placeholder="Analyst Name"
                  className="bg-transparent border-b border-white/20 text-blue-400 text-[11px] focus:outline-none px-1 text-right"
                />
              </div>

              <div className="flex gap-2">
                <textarea
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Document containment action, forensic findings, or containment sign-off..."
                  rows={2}
                  className="w-full p-2.5 bg-[#111217] border border-white/10 rounded-md text-xs text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-none font-sans"
                />
                <button
                  type="submit"
                  disabled={!newNoteText.trim()}
                  className="px-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
