import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Activity,
  AlertTriangle,
  Flame,
  ArrowRight,
  ShieldCheck,
  Server,
  Users,
  HardDrive,
  RefreshCw,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { getSummary, getThreats } from '../services/api';
import { RiskBadge } from '../components/common/RiskBadge';
import { EmptyState } from '../components/common/EmptyState';

export const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryData, threatsData] = await Promise.all([
        getSummary(),
        getThreats(),
      ]);
      setSummary(summaryData);
      setThreats(threatsData || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Unable to connect to ThreatWeave backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm text-gray-400 font-mono">Loading security data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 bg-red-950/20 border border-red-500/30 rounded-xl text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white mb-2">Backend Connection Error</h3>
        <p className="text-xs text-red-300 mb-6 font-mono">{error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-2 mx-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  const criticalCount = threats.filter((t) => (t.severity || '').toUpperCase() === 'CRITICAL').length;
  const highCount = threats.filter((t) => (t.severity || '').toUpperCase() === 'HIGH').length;
  const mediumCount = threats.filter((t) => (t.severity || '').toUpperCase() === 'MEDIUM').length;
  const lowCount = threats.filter((t) => (t.severity || '').toUpperCase() === 'LOW').length;

  return (
    <div className="space-y-6">
      {/* Banner / Welcome Header */}
      <div className="p-6 bg-[#111217] border border-white/10 rounded-xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-blue-400 font-semibold uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            Active Threat Detection Engine
          </div>
          <h2 className="text-xl font-bold text-white">Security Operations Center</h2>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            Live telemetry ingestion, deterministic rule matching, and explainable threat scoring directly from backend security logs.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Total Logs */}
        <div className="p-4 bg-[#111217] border border-white/10 rounded-xl">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold">Total Logs</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {summary ? summary.total_logs.toLocaleString() : '0'}
          </div>
          <div className="text-[10px] text-gray-500 font-mono mt-1">Processed Telemetry</div>
        </div>

        {/* Total Threats */}
        <div className="p-4 bg-[#111217] border border-white/10 rounded-xl">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold">Total Threats</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{threats.length}</div>
          <div className="text-[10px] text-gray-500 font-mono mt-1">Detected Incidents</div>
        </div>

        {/* Critical Threats */}
        <div className="p-4 bg-[#111217] border border-red-500/20 bg-red-500/5 rounded-xl">
          <div className="flex items-center justify-between text-red-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold">Critical</span>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-red-400 font-mono">{criticalCount}</div>
          <div className="text-[10px] text-red-400/70 font-mono mt-1">Immediate Escalation</div>
        </div>

        {/* High Threats */}
        <div className="p-4 bg-[#111217] border border-yellow-500/20 bg-yellow-500/5 rounded-xl">
          <div className="flex items-center justify-between text-yellow-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold">High</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-yellow-400 font-mono">{highCount}</div>
          <div className="text-[10px] text-yellow-400/70 font-mono mt-1">High Risk Severity</div>
        </div>

        {/* Medium Threats */}
        <div className="p-4 bg-[#111217] border border-blue-500/20 bg-blue-500/5 rounded-xl">
          <div className="flex items-center justify-between text-blue-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold">Medium</span>
            <Activity className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-blue-400 font-mono">{mediumCount}</div>
          <div className="text-[10px] text-blue-400/70 font-mono mt-1">Under Observation</div>
        </div>

        {/* Low Threats */}
        <div className="p-4 bg-[#111217] border border-emerald-500/20 bg-emerald-500/5 rounded-xl">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold">Low</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{lowCount}</div>
          <div className="text-[10px] text-emerald-400/70 font-mono mt-1">Informational</div>
        </div>
      </div>

      {/* Secondary Metrics Row */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-[#111217] border border-white/10 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-mono">Failed Login Events</div>
              <div className="text-lg font-bold text-white font-mono">{summary.failed_logins}</div>
            </div>
          </div>

          <div className="p-4 bg-[#111217] border border-white/10 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-mono">Unique Users / IPs</div>
              <div className="text-lg font-bold text-white font-mono">
                {summary.unique_users} Users &bull; {summary.unique_source_ips} IPs
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#111217] border border-white/10 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-mono">Total Transferred</div>
              <div className="text-lg font-bold text-white font-mono">
                {(summary.total_bytes_transferred / (1024 * 1024)).toFixed(2)} MB
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detected Threats Preview */}
      <div className="bg-[#111217] border border-white/10 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Flame className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-bold text-white">Active Detected Threats</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-semibold">
              {threats.length} Threats
            </span>
          </div>
          <Link
            to="/threats"
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span>View All Threats</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {threats.length === 0 ? (
          <EmptyState
            title="No threats detected"
            description="The security log processor did not identify any active threat patterns in the current dataset."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-[#16181F] text-gray-400 font-mono">
                  <th className="py-3 px-4 font-semibold">Threat Type</th>
                  <th className="py-3 px-4 font-semibold">Severity</th>
                  <th className="py-3 px-4 font-semibold">Risk Score</th>
                  <th className="py-3 px-4 font-semibold">Source IP</th>
                  <th className="py-3 px-4 font-semibold">Destination IP</th>
                  <th className="py-3 px-4 font-semibold">Detection Reason</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {threats.slice(0, 5).map((threat) => (
                  <tr key={threat.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {threat.threat_type}
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge level={threat.severity} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{threat.risk_score}/100</span>
                        <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
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
                    <td className="py-3.5 px-4 text-gray-300">{threat.source_ip || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-gray-400">{threat.destination_ip || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-gray-400 max-w-xs truncate font-sans text-xs">
                      {threat.detection_reason}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/threats/${threat.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded font-semibold text-[11px] transition-colors"
                      >
                        <span>Details</span>
                        <ExternalLink className="w-3 h-3" />
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
