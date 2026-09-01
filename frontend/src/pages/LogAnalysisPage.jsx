import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Shield,
  Activity,
  Terminal,
} from 'lucide-react';
import { getLogs } from '../services/api';
import { EmptyState } from '../components/common/EmptyState';

export const LogAnalysisPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const fetchLogsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLogs();
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('Unable to connect to ThreatWeave backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogsData();
  }, []);

  // Filtered logs calculation
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Event Type filter
      if (eventTypeFilter !== 'ALL' && log.event_type !== eventTypeFilter) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'ALL' && (log.status || '').toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      // Search term filter
      if (search.trim()) {
        const query = search.toLowerCase();
        const matches =
          (log.timestamp && log.timestamp.toLowerCase().includes(query)) ||
          (log.source_ip && log.source_ip.toLowerCase().includes(query)) ||
          (log.destination_ip && log.destination_ip.toLowerCase().includes(query)) ||
          (log.user && log.user.toLowerCase().includes(query)) ||
          (log.event_type && log.event_type.toLowerCase().includes(query)) ||
          (log.action && log.action.toLowerCase().includes(query)) ||
          (log.process && log.process.toLowerCase().includes(query)) ||
          (log.command && log.command.toLowerCase().includes(query)) ||
          (log.file && log.file.toLowerCase().includes(query));
        if (!matches) return false;
      }
      return true;
    });
  }, [logs, eventTypeFilter, statusFilter, search]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  const uniqueEventTypes = useMemo(() => {
    const types = new Set();
    logs.forEach((l) => {
      if (l.event_type) types.add(l.event_type);
    });
    return Array.from(types);
  }, [logs]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm text-gray-400 font-mono">Loading security logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 bg-red-950/20 border border-red-500/30 rounded-xl text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white mb-2">Logs Ingestion Error</h3>
        <p className="text-xs text-red-300 mb-6 font-mono">{error}</p>
        <button
          onClick={fetchLogsData}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-2 mx-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Loading Logs</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="p-4 bg-[#111217] border border-white/10 rounded-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Security Event Logs</span>
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400">
                {filteredLogs.length} of {logs.length} events
              </span>
            </h2>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Live audit telemetry ingested directly via GET /logs
            </p>
          </div>
        </div>

        <button
          onClick={fetchLogsData}
          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all self-start md:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-[#111217] border border-white/10 rounded-xl flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by IP, user, command, process, file..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-[#1A1C23] border border-white/10 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
            >
              &times;
            </button>
          )}
        </div>

        {/* Event Type Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={eventTypeFilter}
            onChange={(e) => {
              setEventTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-[#1A1C23] border border-white/10 rounded-lg text-xs text-gray-300 focus:outline-none focus:border-blue-500 font-mono w-full md:w-auto cursor-pointer"
          >
            <option value="ALL">All Event Types</option>
            {uniqueEventTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-[#1A1C23] border border-white/10 rounded-lg text-xs text-gray-300 focus:outline-none focus:border-blue-500 font-mono w-full md:w-auto cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#111217] border border-white/10 rounded-xl overflow-hidden shadow-sm">
        {filteredLogs.length === 0 ? (
          <EmptyState
            title="No logs found"
            description="No security logs match your current search query or filter criteria."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-[#16181F] text-gray-400 font-mono">
                    <th className="py-3 px-3.5 font-semibold">Timestamp</th>
                    <th className="py-3 px-3.5 font-semibold">Source IP</th>
                    <th className="py-3 px-3.5 font-semibold">Destination IP</th>
                    <th className="py-3 px-3.5 font-semibold">User</th>
                    <th className="py-3 px-3.5 font-semibold">Event Type</th>
                    <th className="py-3 px-3.5 font-semibold">Action</th>
                    <th className="py-3 px-3.5 font-semibold">Status</th>
                    <th className="py-3 px-3.5 font-semibold">Process / Command / File</th>
                    <th className="py-3 px-3.5 font-semibold text-right">Bytes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {paginatedLogs.map((log, index) => {
                    const isFailed = (log.status || '').toLowerCase() === 'failed';
                    return (
                      <tr
                        key={index}
                        className={`hover:bg-white/[0.02] transition-colors ${
                          isFailed ? 'bg-red-500/[0.03]' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3.5 text-gray-400 whitespace-nowrap">
                          {log.timestamp}
                        </td>
                        <td className="py-2.5 px-3.5 text-blue-400 font-medium">
                          {log.source_ip}
                        </td>
                        <td className="py-2.5 px-3.5 text-gray-400">
                          {log.destination_ip}
                        </td>
                        <td className="py-2.5 px-3.5 text-white font-semibold">
                          {log.user}
                        </td>
                        <td className="py-2.5 px-3.5">
                          <span className="px-2 py-0.5 rounded text-[11px] bg-white/5 border border-white/10 text-gray-300">
                            {log.event_type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-gray-300">
                          {log.action}
                        </td>
                        <td className="py-2.5 px-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              isFailed
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-gray-400 max-w-xs truncate font-sans text-xs">
                          {log.command ? (
                            <span className="font-mono text-yellow-300 bg-yellow-950/30 px-1 py-0.5 rounded text-[11px]">
                              {log.command}
                            </span>
                          ) : log.process ? (
                            <span className="text-gray-300">{log.process}</span>
                          ) : log.file ? (
                            <span className="text-purple-300">{log.file}</span>
                          ) : (
                            <span className="text-gray-600">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3.5 text-right text-gray-400 font-mono">
                          {log.bytes_transferred ? log.bytes_transferred.toLocaleString() : '0'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-white/10 bg-[#16181F] flex items-center justify-between font-mono text-xs text-gray-400">
              <div>
                Showing page <span className="text-white font-bold">{currentPage}</span> of{' '}
                <span className="text-white font-bold">{totalPages}</span> ({filteredLogs.length} entries)
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 bg-[#1A1C23] border border-white/10 rounded text-gray-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 bg-[#1A1C23] border border-white/10 rounded text-gray-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
