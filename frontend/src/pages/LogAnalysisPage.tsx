import React, { useState, useRef } from 'react';
import { useSOC } from '../context/SOCContext';
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  AlertCircle,
  Eye,
  RefreshCw,
  Terminal,
  FileCode,
} from 'lucide-react';
import { RAW_DEMO_CSV, RAW_DEMO_SYSLOG } from '../data/demoDataset';
import { SecurityEvent } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';

export const LogAnalysisPage: React.FC = () => {
  const {
    events,
    processRawLogs,
    loadDemoDataset,
    isProcessing,
    activeLogPipelineStage,
  } = useSOC();

  const [rawInput, setRawInput] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<'auto' | 'csv' | 'json' | 'txt'>('auto');
  const [tableSearch, setTableSearch] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('ALL');
  const [suspiciousOnly, setSuspiciousOnly] = useState<boolean>(false);
  const [sortField, setSortField] = useState<keyof SecurityEvent>('timestamp');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [inspectedEvent, setInspectedEvent] = useState<SecurityEvent | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Handle Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawInput(content);
      }
    };
    reader.readAsText(file);
  };

  const handleAnalyzeInput = () => {
    if (!rawInput.trim()) return;
    processRawLogs(rawInput, selectedFormat);
  };

  // Filtered & Sorted events
  const filteredEvents = events.filter((evt) => {
    if (suspiciousOnly && !evt.is_suspicious) return false;
    if (severityFilter !== 'ALL' && evt.severity.toUpperCase() !== severityFilter) return false;
    if (eventTypeFilter !== 'ALL' && evt.event_type !== eventTypeFilter) return false;

    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase();
      const match =
        evt.source_ip.includes(q) ||
        evt.destination_ip.includes(q) ||
        evt.user.toLowerCase().includes(q) ||
        evt.event_type.toLowerCase().includes(q) ||
        evt.action.toLowerCase().includes(q) ||
        (evt.command && evt.command.toLowerCase().includes(q)) ||
        (evt.process && evt.process.toLowerCase().includes(q)) ||
        (evt.file && evt.file.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const valA = a[sortField] || '';
    const valB = b[sortField] || '';
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const eventTypes = Array.from(new Set(events.map((e) => e.event_type)));

  return (
    <div className="space-y-6">
      {/* Top Ingestion Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section A: Upload Logs Drag and Drop */}
        <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-400" />
                Upload Security Logs
              </h3>
              <span className="text-[11px] font-mono text-gray-400">CSV / JSON / TXT</span>
            </div>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`mt-4 p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                dragActive
                  ? 'border-blue-400 bg-blue-600/10'
                  : 'border-white/10 hover:border-blue-500/50 bg-[#111217]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json,.txt,.log"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="hidden"
              />
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-blue-400">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-gray-200">
                Drop security log files here, or <span className="text-blue-400 underline">browse</span>
              </p>
              <p className="text-[10px] text-gray-400 font-mono">Supports Syslog, WinEventLog, Auditd, Zeek</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
            <button
              onClick={handleAnalyzeInput}
              disabled={!rawInput.trim() || isProcessing}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold rounded-md shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Upload & Analyze</span>
            </button>

            <button
              onClick={loadDemoDataset}
              disabled={isProcessing}
              className="w-full py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold rounded-md border border-white/10 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Load Controlled Demo Dataset (SIH 2026)</span>
            </button>
          </div>
        </div>

        {/* Section B: Manual Test Input */}
        <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg flex flex-col justify-between lg:col-span-2">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-400" />
                Manual Security Log Input
              </h3>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-mono">Quick Template:</span>
                <button
                  onClick={() => setRawInput(RAW_DEMO_CSV)}
                  className="px-2 py-0.5 bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-mono rounded border border-white/10 cursor-pointer"
                >
                  CSV Format
                </button>
                <button
                  onClick={() => setRawInput(RAW_DEMO_SYSLOG)}
                  className="px-2 py-0.5 bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-mono rounded border border-white/10 cursor-pointer"
                >
                  Syslog / TXT
                </button>
                {rawInput && (
                  <button
                    onClick={() => setRawInput('')}
                    className="px-2 py-0.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-mono rounded border border-red-500/30 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="mt-3">
              <textarea
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder="Paste raw CSV lines, JSON records, or syslog streams here...&#10;e.g. 2026-08-31T03:14:02Z,185.220.101.5,10.0.1.15,svc_backup,AUTH_FAILED,LOGIN,FAILURE,sshd,,/,0,medium"
                rows={7}
                className="w-full p-3 bg-[#111217] border border-white/10 focus:border-blue-500 rounded-lg text-xs font-mono text-gray-200 placeholder:text-gray-600 focus:outline-none resize-none custom-scrollbar"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
              <span>Format:</span>
              {(['auto', 'csv', 'json', 'txt'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setSelectedFormat(fmt)}
                  className={`px-2 py-0.5 rounded uppercase text-[10px] ${
                    selectedFormat === fmt
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 font-bold'
                      : 'bg-white/5 text-gray-400 border border-white/10'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            <button
              onClick={handleAnalyzeInput}
              disabled={!rawInput.trim() || isProcessing}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold rounded-md shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Analyze Logs</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section C: Log Processing Status Stages */}
      <div className="p-4 bg-[#1A1C23] border border-white/10 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              Log Ingestion & Preprocessing Status
            </h4>
          </div>
          {events.length > 0 && (
            <span className="text-[11px] font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/30">
              ✓ Ingestion Complete ({events.length} Events)
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { stage: 1, label: 'Log Received', desc: 'Raw bytes buffered' },
            { stage: 2, label: 'Events Normalized', desc: 'Schema mapped' },
            { stage: 3, label: 'Events Parsed', desc: 'Fields structured' },
            { stage: 4, label: 'Suspicious Detection', desc: 'Heuristics evaluated' },
            { stage: 5, label: 'AI Analysis', desc: 'Graph handoff ready' },
          ].map((item) => {
            const isCompleted = events.length > 0 || activeLogPipelineStage >= item.stage;
            const isCurrent = isProcessing && activeLogPipelineStage === item.stage;

            return (
              <div
                key={item.stage}
                className={`p-3 rounded-lg border transition-all ${
                  isCompleted
                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                    : isCurrent
                    ? 'bg-blue-600/10 border-blue-500 text-blue-400 animate-pulse'
                    : 'bg-[#111217] border-white/5 text-gray-500'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs font-mono">
                  <span>{isCompleted ? '✓' : isCurrent ? '●' : '○'}</span>
                  <span>{item.label}</span>
                </div>
                <div className="text-[10px] text-gray-400 font-sans mt-0.5">{item.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section D: Parsed Events Table */}
      <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <h3 className="text-sm font-bold text-white">Normalized & Parsed Security Events</h3>
            <p className="text-xs text-gray-400">
              {events.length} total events • {filteredEvents.length} displayed
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Filter logs by IP, User, Command..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-[#111217] border border-white/10 focus:border-blue-500 rounded-md text-xs font-mono text-gray-200 placeholder:text-gray-500 focus:outline-none"
              />
            </div>

            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-[#111217] border border-white/10 text-xs font-mono text-gray-300 rounded-md focus:outline-none"
            >
              <option value="ALL">All Severity</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
              <option value="INFO">Info</option>
            </select>

            {/* Event Type Filter */}
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-[#111217] border border-white/10 text-xs font-mono text-gray-300 rounded-md focus:outline-none"
            >
              <option value="ALL">All Event Types</option>
              {eventTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {/* Suspicious Only Toggle */}
            <button
              onClick={() => setSuspiciousOnly(!suspiciousOnly)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors border cursor-pointer ${
                suspiciousOnly
                  ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 font-bold'
                  : 'bg-[#111217] text-gray-400 border-white/10 hover:text-white'
              }`}
            >
              Suspicious Only
            </button>
          </div>
        </div>

        {events.length === 0 ? (
          <EmptyState
            title="No security logs available"
            description="No security logs available. Upload a CSV, JSON or TXT file to begin analysis."
            actionText="Load Controlled Demo Dataset"
            onAction={loadDemoDataset}
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#111217] text-gray-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th
                    className="py-3 px-3 cursor-pointer hover:text-white"
                    onClick={() => {
                      setSortField('timestamp');
                      setSortAsc(!sortAsc);
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Timestamp</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-3">Source IP</th>
                  <th className="py-3 px-3">Destination IP</th>
                  <th className="py-3 px-3">User</th>
                  <th className="py-3 px-3">Event Type</th>
                  <th className="py-3 px-3">Action</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Process / Details</th>
                  <th className="py-3 px-3">Severity</th>
                  <th className="py-3 px-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {sortedEvents.map((evt) => (
                  <tr
                    key={evt.id}
                    className={`hover:bg-white/5 transition-colors ${
                      evt.is_suspicious ? 'bg-yellow-500/5' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 text-gray-400 whitespace-nowrap">{evt.timestamp}</td>
                    <td className="py-2.5 px-3 font-semibold text-blue-400 whitespace-nowrap">{evt.source_ip}</td>
                    <td className="py-2.5 px-3 text-gray-400 whitespace-nowrap">{evt.destination_ip}</td>
                    <td className="py-2.5 px-3 font-medium text-gray-300 whitespace-nowrap">{evt.user}</td>
                    <td className="py-2.5 px-3 font-semibold text-white whitespace-nowrap">{evt.event_type}</td>
                    <td className="py-2.5 px-3 text-gray-300 whitespace-nowrap">{evt.action}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <StatusBadge status={evt.status} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 truncate max-w-xs text-gray-400 font-sans">
                      {evt.command || evt.process || evt.file || '—'}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <RiskBadge level={evt.severity} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setInspectedEvent(evt)}
                        className="p-1 text-gray-400 hover:text-blue-400 hover:bg-white/5 rounded transition-colors cursor-pointer"
                        title="View Raw Log & Fields"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Raw Event Inspection Modal */}
      {inspectedEvent && (
        <Modal
          isOpen={!!inspectedEvent}
          onClose={() => setInspectedEvent(null)}
          title={`Event Inspector: ${inspectedEvent.id}`}
          subtitle={`${inspectedEvent.event_type} • ${inspectedEvent.timestamp}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[#111217] rounded-lg border border-white/10 font-mono text-xs">
              <div>
                <span className="text-gray-500">Severity: </span>
                <RiskBadge level={inspectedEvent.severity} size="sm" />
              </div>
              <div>
                <span className="text-gray-500">Status: </span>
                <StatusBadge status={inspectedEvent.status} size="sm" />
              </div>
            </div>

            {inspectedEvent.is_suspicious && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg space-y-1">
                <div className="text-xs font-bold text-yellow-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Flagged Suspicious Indicators:
                </div>
                <ul className="list-disc list-inside text-xs text-yellow-200/90 font-sans space-y-0.5">
                  {inspectedEvent.suspicious_reasons?.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-2 text-xs font-mono">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-[#111217] rounded-lg border border-white/10">
                  <span className="text-gray-500 block text-[10px] uppercase">Source IP</span>
                  <span className="text-blue-400 font-semibold">{inspectedEvent.source_ip}</span>
                </div>
                <div className="p-2.5 bg-[#111217] rounded-lg border border-white/10">
                  <span className="text-gray-500 block text-[10px] uppercase">Destination IP</span>
                  <span className="text-gray-300 font-semibold">{inspectedEvent.destination_ip}</span>
                </div>
                <div className="p-2.5 bg-[#111217] rounded-lg border border-white/10">
                  <span className="text-gray-500 block text-[10px] uppercase">User Identity</span>
                  <span className="text-gray-300 font-semibold">{inspectedEvent.user}</span>
                </div>
                <div className="p-2.5 bg-[#111217] rounded-lg border border-white/10">
                  <span className="text-gray-500 block text-[10px] uppercase">Action</span>
                  <span className="text-gray-300 font-semibold">{inspectedEvent.action}</span>
                </div>
              </div>

              {inspectedEvent.command && (
                <div className="p-2.5 bg-[#111217] rounded-lg border border-white/10">
                  <span className="text-gray-500 block text-[10px] uppercase">Command</span>
                  <span className="text-yellow-400 break-all">{inspectedEvent.command}</span>
                </div>
              )}

              {inspectedEvent.raw_log && (
                <div className="p-2.5 bg-[#111217] rounded-lg border border-white/10">
                  <span className="text-gray-500 block text-[10px] uppercase">Raw Log Source</span>
                  <pre className="text-[11px] text-gray-300 whitespace-pre-wrap break-all mt-1">
                    {inspectedEvent.raw_log}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
