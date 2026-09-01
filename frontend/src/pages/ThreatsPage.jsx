import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';
import { getThreats } from '../services/api';
import { RiskBadge } from '../components/common/RiskBadge';
import { EmptyState } from '../components/common/EmptyState';

export const ThreatsPage = () => {
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [threatTypeFilter, setThreatTypeFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchThreatsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (severityFilter !== 'ALL') {
        params.severity = severityFilter;
      }
      if (threatTypeFilter !== 'ALL') {
        params.threat_type = threatTypeFilter;
      }
      const data = await getThreats(params);
      setThreats(data || []);
    } catch (err) {
      console.error('Error loading threats:', err);
      setError('Unable to connect to ThreatWeave backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreatsData();
  }, [severityFilter, threatTypeFilter]);

  // Client-side search filtering
  const filteredThreats = useMemo(() => {
    if (!search.trim()) return threats;
    const q = search.toLowerCase();
    return threats.filter((t) => {
      return (
        (t.id && t.id.toLowerCase().includes(q)) ||
        (t.threat_type && t.threat_type.toLowerCase().includes(q)) ||
        (t.source_ip && t.source_ip.toLowerCase().includes(q)) ||
        (t.destination_ip && t.destination_ip.toLowerCase().includes(q)) ||
        (t.detection_reason && t.detection_reason.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
    });
  }, [threats, search]);

  const uniqueThreatTypes = useMemo(() => {
    const types = new Set();
    threats.forEach((t) => {
      if (t.threat_type) types.add(t.threat_type);
    });
    return Array.from(types);
  }, [threats]);

  if (loading && threats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm text-gray-400 font-mono">Loading detected threats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 bg-red-950/20 border border-red-500/30 rounded-xl text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white mb-2">Threat Detection Error</h3>
        <p className="text-xs text-red-300 mb-6 font-mono">{error}</p>
        <button
          onClick={fetchThreatsData}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-2 mx-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Loading Threats</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 bg-[#111217] border border-white/10 rounded-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Detected Threats Feed</span>
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 font-semibold">
                {filteredThreats.length} threats active
              </span>
            </h2>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Correlated threat signatures and explainable scoring via GET /threats
            </p>
          </div>
        </div>

        <button
          onClick={fetchThreatsData}
          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all self-start md:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-[#111217] border border-white/10 rounded-xl flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search threats by ID, type, IP, reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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

        <div className="flex items-center gap-2 w-full md:w-auto">
          <SlidersHorizontal className="w-4 h-4 text-gray-400 shrink-0" />
          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 bg-[#1A1C23] border border-white/10 rounded-lg text-xs text-gray-300 focus:outline-none focus:border-blue-500 font-mono w-full md:w-auto cursor-pointer"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical (76-100)</option>
            <option value="HIGH">High (51-75)</option>
            <option value="MEDIUM">Medium (26-50)</option>
            <option value="LOW">Low (0-25)</option>
          </select>

          {/* Threat Type Filter */}
          <select
            value={threatTypeFilter}
            onChange={(e) => setThreatTypeFilter(e.target.value)}
            className="px-3 py-2 bg-[#1A1C23] border border-white/10 rounded-lg text-xs text-gray-300 focus:outline-none focus:border-blue-500 font-mono w-full md:w-auto cursor-pointer"
          >
            <option value="ALL">All Threat Types</option>
            <option value="Brute Force">Brute Force</option>
            <option value="Suspicious Execution">Suspicious Execution</option>
            <option value="Data Exfiltration">Data Exfiltration</option>
            <option value="Privilege Escalation">Privilege Escalation</option>
          </select>
        </div>
      </div>

      {/* Threats List Table */}
      <div className="bg-[#111217] border border-white/10 rounded-xl overflow-hidden shadow-sm">
        {filteredThreats.length === 0 ? (
          <EmptyState
            title="No threats found"
            description="No active security threats match the selected severity and threat type filters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-[#16181F] text-gray-400 font-mono">
                  <th className="py-3 px-4 font-semibold">Threat ID</th>
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold">Threat Type</th>
                  <th className="py-3 px-4 font-semibold">Severity</th>
                  <th className="py-3 px-4 font-semibold">Risk Score</th>
                  <th className="py-3 px-4 font-semibold">Source IP</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Detection Reason</th>
                  <th className="py-3 px-4 font-semibold text-right">Investigation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {filteredThreats.map((threat) => (
                  <tr key={threat.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="text-gray-400 bg-white/5 px-1.5 py-0.5 rounded text-[11px]">
                        {threat.id ? `${threat.id.substring(0, 8)}...` : 'N/A'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400 whitespace-nowrap">
                      {threat.timestamp}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {threat.threat_type}
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge level={threat.severity} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{threat.risk_score}</span>
                        <div className="w-12 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              threat.risk_score >= 76
                                ? 'bg-red-500'
                                : threat.risk_score >= 51
                                ? 'bg-yellow-500'
                                : 'bg-blue-500'
                            }`}
                            style={{ width: `${threat.risk_score}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-blue-400 font-medium">
                      {threat.source_ip || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          threat.status === 'Compromised'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        }`}
                      >
                        {threat.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-300 max-w-sm truncate font-sans text-xs">
                      {threat.detection_reason}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        to={`/threats/${threat.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded font-semibold text-xs transition-all hover:border-blue-500/40"
                      >
                        <span>Investigate</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
