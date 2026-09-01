import React, { useState, useRef } from 'react';
import { useSOC } from '../context/SOCContext';
import {
  Upload,
  FileText,
  Sparkles,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Eye,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { RAW_DEMO_CSV, RAW_DEMO_SYSLOG } from '../data/demoDataset';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';

export const LogAnalysisPage = () => {
  const {
    events,
    processRawLogs,
    loadDemoDataset,
    isProcessing,
    activeLogPipelineStage,
  } = useSOC();

  const [rawInput, setRawInput] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('auto');
  const [tableSearch, setTableSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [eventTypeFilter, setEventTypeFilter] = useState('ALL');
  const [suspiciousOnly, setSuspiciousOnly] = useState(false);
  const [sortField, setSortField] = useState('timestamp');
  const [sortAsc, setSortAsc] = useState(false);
  const [inspectedEvent, setInspectedEvent] = useState(null);

  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  // Handle Drag & Drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileRead(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileRead(e.target.files[0]);
    }
  };

  const handleFileRead = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (content) {
        setRawInput(content);
      }
    };
    reader.readAsText(file);
  };

  const handleAnalyze = () => {
    if (!rawInput.trim()) return;
    processRawLogs(rawInput, selectedFormat);
  };

  const handleExportCSV = () => {
    if (events.length === 0) return;
    const headers = 'id,timestamp,source_ip,destination_ip,user,event_type,action,status,severity,is_suspicious\n';
    const rows = events
      .map(
        (e) =>
          `"${e.id}","${e.timestamp}","${e.source_ip}","${e.destination_ip}","${e.user}","${e.event_type}","${e.action}","${e.status}","${e.severity}",${e.is_suspicious}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `normalized_events_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered & Sorted events
  const filteredEvents = events.filter((evt) => {
    if (suspiciousOnly && !evt.is_suspicious) return false;
    if (severityFilter !== 'ALL' && evt.severity.toUpperCase() !== severityFilter) return false;
    if (eventTypeFilter !== 'ALL' && evt.event_type !== eventTypeFilter) return false;

    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase();
      const match =
        evt.id.toLowerCase().includes(q) ||
        evt.source_ip.toLowerCase().includes(q) ||
        evt.destination_ip.toLowerCase().includes(q) ||
        evt.user.toLowerCase().includes(q) ||
        evt.event_type.toLowerCase().includes(q) ||
        (evt.command && evt.command.toLowerCase().includes(q)) ||
        (evt.file && evt.file.toLowerCase().includes(q)) ||
        (evt.raw_log && evt.raw_log.toLowerCase().includes(q));
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

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const allEventTypes = Array.from(new Set(events.map((e) => e.event_type)));

  return (
    <div className="space-y-6">
      {/* Section 1: Ingestion Console & Parser */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Textarea & Drop Zone */}
        <div className="lg:col-span-8 p-5 bg-[#1A1C23] border border-white/10 rounded-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-600/10 text-blue-400 border border-blue-500/20 font-semibold">
                  Agent 1 Subsystem
                </span>
                <span className="text-xs text-gray-500 font-mono">L1 Stream Preprocessor</span>
              </div>
              <h3 className="text-sm font-bold text-white mt-1">Raw Security Log Ingestion Console</h3>
            </div>

            {/* Preload Templates */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRawInput(RAW_DEMO_CSV)}
                className="text-[11px] font-mono px-2.5 py-1 bg-[#111217] hover:bg-white/5 text-gray-300 border border-white/10 rounded cursor-pointer transition-colors"
              >
                Insert CSV Sample
              </button>
              <button
                onClick={() => setRawInput(RAW_DEMO_SYSLOG)}
                className="text-[11px] font-mono px-2.5 py-1 bg-[#111217] hover:bg-white/5 text-gray-300 border border-white/10 rounded cursor-pointer transition-colors"
              >
                Insert Syslog Sample
              </button>
            </div>
          </div>

          {/* Drag & Drop Box */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative rounded-lg border-2 border-dashed transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-white/10 bg-[#111217] hover:border-white/20'
            }`}
          >
            <textarea
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="Paste raw cybersecurity logs here (CSV rows, Syslog lines, Windows Event Audit JSON, or Auth traces)..."
              className="w-full h-40 p-3 bg-transparent text-xs font-mono text-gray-200 placeholder-gray-600 focus:outline-none resize-y"
            />

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json,.log,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-[#111217] hover:bg-white/5 text-gray-300 text-xs font-semibold rounded-md border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File</span>
              </button>

              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
                <span>Format:</span>
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="bg-[#111217] border border-white/10 text-gray-300 text-xs rounded px-2 py-1 focus:border-blue-500 focus:outline-none"
                >
                  <option value="auto">Auto-Detect</option>
                  <option value="csv">CSV (Comma-Separated)</option>
                  <option value="json">JSON / Array</option>
                  <option value="txt">Syslog / Plaintext</option>
                </select>
              </div>

              {rawInput && (
                <button
                  onClick={() => setRawInput('')}
                  className="text-xs text-gray-500 hover:text-gray-300 underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAnalyze}
                disabled={!rawInput.trim() || isProcessing}
                className={`px-4 py-2 text-xs font-bold rounded-md flex items-center gap-2 transition-all cursor-pointer ${
                  !rawInput.trim() || isProcessing
                    ? 'bg-blue-600/30 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20'
                }`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Stream...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run Log Analysis Agent</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Normalization Pipeline Specs & Heuristic Stats */}
        <div className="lg:col-span-4 p-5 bg-[#1A1C23] border border-white/10 rounded-lg flex flex-col justify-between space-y-4">
          <div>
            <div className="pb-3 border-b border-white/10">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Log Preprocessing Schema
              </h4>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Converts unstructured logs into normalized security schema:
              </p>
            </div>

            <div className="space-y-2 py-3 text-xs font-mono">
              {[
                { field: 'timestamp', desc: 'ISO 8601 UTC temporal index' },
                { field: 'source_ip / destination_ip', desc: 'IPv4/IPv6 socket pair mapping' },
                { field: 'user / identity', desc: 'Human, service or system caller' },
                { field: 'event_type & action', desc: 'Normalized taxonomy categorization' },
                { field: 'process & command', desc: 'Process execution tree & args' },
                { field: 'severity & flags', desc: 'Heuristic anomaly score rating' },
              ].map((item) => (
                <div key={item.field} className="p-2 bg-[#111217] rounded border border-white/10">
                  <div className="text-blue-400 font-semibold text-[11px]">{item.field}</div>
                  <div className="text-gray-400 text-[10px]">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-[#111217] rounded-lg border border-white/10 text-[11px] font-mono text-gray-400">
            <span className="text-white font-semibold block mb-1">Standard Demo Data</span>
            <p className="leading-relaxed">
              Click below to restore the controlled multi-scenario dataset for test evaluations.
            </p>
            <button
              onClick={loadDemoDataset}
              className="mt-2 text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Load 21 Controlled Events</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 2: Normalized Events Feed */}
      <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg space-y-4">
        {/* Table Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Normalized Security Events</h3>
              <span className="text-xs font-mono text-blue-400 bg-blue-600/10 px-2 py-0.5 rounded border border-blue-500/20">
                {filteredEvents.length} of {events.length} Records
              </span>
            </div>
            <p className="text-xs text-gray-400">Structured telemetry ready for L2 attack chain correlation</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search IP, user, event, log..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-[#111217] border border-white/10 rounded-md text-xs text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:outline-none w-48 sm:w-60 font-mono"
              />
            </div>

            {/* Suspicious Toggle */}
            <button
              onClick={() => setSuspiciousOnly(!suspiciousOnly)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-mono font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                suspiciousOnly
                  ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                  : 'bg-[#111217] text-gray-400 border-white/10 hover:text-white'
              }`}
            >
              <span>Flagged Suspicious</span>
              <span className="text-[10px] px-1 bg-white/10 rounded">
                {events.filter((e) => e.is_suspicious).length}
              </span>
            </button>

            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-[#111217] border border-white/10 text-gray-300 text-xs rounded px-2.5 py-1.5 focus:border-blue-500 focus:outline-none font-mono"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
              <option value="INFO">Info</option>
            </select>

            {/* Event Type Filter */}
            {allEventTypes.length > 0 && (
              <select
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
                className="bg-[#111217] border border-white/10 text-gray-300 text-xs rounded px-2.5 py-1.5 focus:border-blue-500 focus:outline-none font-mono"
              >
                <option value="ALL">All Event Types</option>
                {allEventTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            )}

            {/* Export CSV */}
            {events.length > 0 && (
              <button
                onClick={handleExportCSV}
                className="px-2.5 py-1.5 bg-[#111217] hover:bg-white/5 text-gray-300 text-xs font-semibold rounded-md border border-white/10 flex items-center gap-1 transition-colors cursor-pointer"
                title="Export normalized events as CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
            )}
          </div>
        </div>

        {/* Events Table */}
        {events.length === 0 ? (
          <EmptyState
            title="No logs ingested"
            description="Paste raw security logs into the console above or load the SIH 2026 test suite to begin parsing."
            actionText="Load Test Dataset"
            onAction={loadDemoDataset}
          />
        ) : filteredEvents.length === 0 ? (
          <div className="py-12 text-center text-xs font-mono text-gray-500">
            No events match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#111217] text-gray-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th
                    className="py-2.5 px-3 cursor-pointer hover:text-white"
                    onClick={() => handleSort('timestamp')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Timestamp</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-2.5 px-3 cursor-pointer hover:text-white"
                    onClick={() => handleSort('source_ip')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Source IP</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-2.5 px-3">Destination</th>
                  <th
                    className="py-2.5 px-3 cursor-pointer hover:text-white"
                    onClick={() => handleSort('user')}
                  >
                    <div className="flex items-center gap-1">
                      <span>User</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-2.5 px-3 cursor-pointer hover:text-white"
                    onClick={() => handleSort('event_type')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Event Type</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Anomaly Indicators</th>
                  <th className="py-2.5 px-3 text-right">Inspect</th>
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
                    <td className="py-2.5 px-3 text-blue-400 font-semibold whitespace-nowrap">{evt.source_ip}</td>
                    <td className="py-2.5 px-3 text-gray-400 whitespace-nowrap">{evt.destination_ip}</td>
                    <td className="py-2.5 px-3 text-gray-200 font-semibold">{evt.user}</td>
                    <td className="py-2.5 px-3 text-white font-medium">{evt.event_type}</td>
                    <td className="py-2.5 px-3">
                      <RiskBadge level={evt.severity} size="sm" />
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={evt.status} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 max-w-xs font-sans">
                      {evt.is_suspicious && evt.suspicious_reasons && evt.suspicious_reasons.length > 0 ? (
                        <div className="space-y-0.5">
                          {evt.suspicious_reasons.map((r, i) => (
                            <div key={i} className="text-[11px] text-yellow-400 flex items-start gap-1">
                              <span className="text-yellow-500">•</span>
                              <span className="truncate">{r}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-[11px]">Normal telemetry</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setInspectedEvent(evt)}
                        className="p-1 text-gray-400 hover:text-blue-400 hover:bg-white/5 rounded transition-colors cursor-pointer"
                        title="View Raw Log & Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Forensic Inspection Modal */}
      {inspectedEvent && (
        <Modal
          isOpen={!!inspectedEvent}
          onClose={() => setInspectedEvent(null)}
          title={`Forensic Event Inspection: ${inspectedEvent.id}`}
          subtitle={`${inspectedEvent.event_type} on ${inspectedEvent.destination_ip}`}
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-[#111217] rounded border border-white/10">
              <div>
                <span className="text-gray-500 block text-[10px] uppercase">Timestamp</span>
                <span className="text-white font-semibold">{inspectedEvent.timestamp}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px] uppercase">User Identity</span>
                <span className="text-white font-semibold">{inspectedEvent.user}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px] uppercase">Source IP</span>
                <span className="text-blue-400 font-semibold">{inspectedEvent.source_ip}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px] uppercase">Destination IP</span>
                <span className="text-gray-300 font-semibold">{inspectedEvent.destination_ip}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px] uppercase">Severity</span>
                <RiskBadge level={inspectedEvent.severity} size="sm" />
              </div>
              <div>
                <span className="text-gray-500 block text-[10px] uppercase">Action Status</span>
                <StatusBadge status={inspectedEvent.status} size="sm" />
              </div>
            </div>

            {inspectedEvent.command && (
              <div className="p-3 bg-[#111217] rounded border border-white/10">
                <span className="text-gray-500 block text-[10px] uppercase mb-1">Executed Command</span>
                <code className="text-yellow-400 break-all">{inspectedEvent.command}</code>
              </div>
            )}

            {inspectedEvent.file && (
              <div className="p-3 bg-[#111217] rounded border border-white/10">
                <span className="text-gray-500 block text-[10px] uppercase mb-1">File Target</span>
                <code className="text-blue-300 break-all">{inspectedEvent.file}</code>
              </div>
            )}

            {inspectedEvent.suspicious_reasons && inspectedEvent.suspicious_reasons.length > 0 && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
                <span className="text-yellow-400 font-bold block text-[10px] uppercase mb-1">
                  Suspicious Indicators Flagged by Agent 1:
                </span>
                <ul className="list-disc list-inside space-y-1 text-yellow-300">
                  {inspectedEvent.suspicious_reasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {inspectedEvent.raw_log && (
              <div className="p-3 bg-[#111217] rounded border border-white/10">
                <span className="text-gray-500 block text-[10px] uppercase mb-1">Raw Unparsed Log Entry</span>
                <pre className="text-[11px] text-gray-300 whitespace-pre-wrap break-all bg-black/40 p-2 rounded">
                  {inspectedEvent.raw_log}
                </pre>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
