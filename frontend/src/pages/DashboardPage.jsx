import React from 'react';
import { useSOC } from '../context/SOCContext';
import {
  ShieldAlert,
  Activity,
  AlertTriangle,
  FolderLock,
  Flame,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';

export const DashboardPage = () => {
  const {
    events,
    threats,
    incidents,
    navigateToThreat,
    setActivePage,
    loadDemoDataset,
  } = useSOC();

  // Derived dynamic KPIs from application state
  const totalEvents = events.length;
  const suspiciousEvents = events.filter((e) => e.is_suspicious).length;
  const activeThreats = threats.filter((t) => t.status === 'active').length;
  const openIncidents = incidents.filter((i) => i.status !== 'resolved').length;
  const highCriticalIncidents = threats.filter((t) => t.risk_level === 'HIGH' || t.risk_level === 'CRITICAL').length;

  // Risk distribution derived
  const riskCounts = {
    CRITICAL: threats.filter((t) => t.risk_level === 'CRITICAL').length,
    HIGH: threats.filter((t) => t.risk_level === 'HIGH').length,
    MEDIUM: threats.filter((t) => t.risk_level === 'MEDIUM').length,
    LOW: threats.filter((t) => t.risk_level === 'LOW').length,
  };

  const hasData = totalEvents > 0;

  return (
    <div className="space-y-6">
      {/* Top Derived KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Events */}
        <div className="p-4 bg-[#1A1C23] border border-white/10 rounded-lg shadow-sm hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Total Events</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-2">{totalEvents}</div>
          <div className="text-[11px] text-gray-500 mt-1 font-mono">
            {totalEvents > 0 ? 'Ingested & Normalized' : 'Awaiting log feed'}
          </div>
        </div>

        {/* Suspicious Events */}
        <div className="p-4 bg-[#1A1C23] border border-white/10 rounded-lg shadow-sm hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Suspicious Events</span>
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="text-2xl font-black text-yellow-500 font-mono mt-2">{suspiciousEvents}</div>
          <div className="text-[11px] text-gray-500 mt-1 font-mono">
            {totalEvents > 0 ? `${Math.round((suspiciousEvents / (totalEvents || 1)) * 100)}% anomaly rate` : 'None detected'}
          </div>
        </div>

        {/* Active Threats */}
        <div className="p-4 bg-[#1A1C23] border border-white/10 rounded-lg shadow-sm hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Active Threats</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-400 font-mono mt-2">{activeThreats}</div>
          <div className="text-[11px] text-gray-500 mt-1 font-mono">
            {threats.length > 0 ? `${threats.length} total correlated` : 'No active threats'}
          </div>
        </div>

        {/* Open Incidents */}
        <div className="p-4 bg-[#1A1C23] border border-white/10 rounded-lg shadow-sm hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Open Incidents</span>
            <FolderLock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-300 font-mono mt-2">{openIncidents}</div>
          <div className="text-[11px] text-gray-500 mt-1 font-mono">
            {incidents.length > 0 ? `${incidents.length} total tracked` : 'Zero open cases'}
          </div>
        </div>

        {/* High / Critical Risk */}
        <div className="p-4 bg-[#1A1C23] border border-white/10 rounded-lg shadow-sm hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">High / Critical</span>
            <Flame className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-red-500 font-mono mt-2">{highCriticalIncidents}</div>
          <div className="text-[11px] text-gray-500 mt-1 font-mono">Requires analyst response</div>
        </div>
      </div>

      {/* Main Grid: Threat Overview & Active Threats */}
      {!hasData ? (
        <EmptyState
          title="No security events analyzed yet"
          description="Ingest raw security logs or load the demo dataset to begin threat detection."
          actionText="Load Demo Dataset"
          onAction={loadDemoDataset}
          secondaryActionText="Go to Log Analysis"
          onSecondaryAction={() => setActivePage('log-analysis')}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section A: Threat Overview Chart & Breakdown */}
          <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-sm font-bold text-white">Threat Risk Distribution</h3>
                <span className="text-xs font-mono text-gray-400">{threats.length} Threats</span>
              </div>

              <div className="py-4 space-y-3">
                {[
                  { level: 'CRITICAL', count: riskCounts.CRITICAL, color: 'bg-red-500', bar: 'bg-red-500/20' },
                  { level: 'HIGH', count: riskCounts.HIGH, color: 'bg-yellow-500', bar: 'bg-yellow-500/20' },
                  { level: 'MEDIUM', count: riskCounts.MEDIUM, color: 'bg-blue-500', bar: 'bg-blue-500/20' },
                  { level: 'LOW', count: riskCounts.LOW, color: 'bg-green-500', bar: 'bg-green-500/20' },
                ].map((item) => {
                  const pct = threats.length > 0 ? Math.round((item.count / threats.length) * 100) : 0;
                  return (
                    <div key={item.level} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-gray-300 font-semibold">{item.level}</span>
                        <span className="text-gray-400">
                          {item.count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section C: Active Threats Cards */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Active Detected Threats</h3>
                <span className="text-xs font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                  {threats.length} Actionable
                </span>
              </div>
              <button
                onClick={() => setActivePage('threats')}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <span>View All Threats</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {threats.map((threat) => {
                const riskStyles = {
                  CRITICAL: 'border-red-500/40 hover:border-red-400/60 bg-gradient-to-br from-red-500/5 via-[#1A1C23] to-transparent shadow-[0_0_15px_rgba(239,68,68,0.08)]',
                  HIGH: 'border-orange-500/40 hover:border-orange-400/60 bg-gradient-to-br from-orange-500/5 via-[#1A1C23] to-transparent shadow-[0_0_15px_rgba(249,115,22,0.08)]',
                  MEDIUM: 'border-yellow-500/40 hover:border-yellow-400/60 bg-gradient-to-br from-yellow-500/5 via-[#1A1C23] to-transparent shadow-[0_0_15px_rgba(234,179,8,0.08)]',
                  LOW: 'border-green-500/40 hover:border-green-400/60 bg-gradient-to-br from-green-500/5 via-[#1A1C23] to-transparent shadow-[0_0_15px_rgba(34,197,94,0.08)]',
                };
                const cardStyle = riskStyles[(threat.risk_level || 'LOW').toUpperCase()] || 'border-white/10 hover:border-blue-500/40';
                return (
                <div
                  key={threat.id}
                  className={`p-4 border rounded-lg transition-all shadow-sm flex flex-col justify-between gap-3 group ${cardStyle}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-gray-400">{threat.id}</span>
                        <RiskBadge level={threat.risk_level} size="sm" />
                        <span className="text-[11px] font-mono text-blue-400 bg-blue-600/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                          {threat.confidence}% Confidence
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1.5 group-hover:text-blue-300 transition-colors">
                        {threat.title}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{threat.explanation.what_happened}</p>
                    </div>

                    <button
                      onClick={() => navigateToThreat(threat.id)}
                      className="px-3.5 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 border border-blue-500/30 text-xs font-semibold rounded-md flex items-center gap-1.5 shrink-0 self-start sm:self-center transition-all cursor-pointer"
                    >
                      <span>Investigate</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-gray-400">
                    <div className="flex items-center gap-3">
                      <span>
                        Target: <span className="text-white">{threat.affected_user}</span> @{' '}
                        <span className="text-white">{threat.affected_system}</span>
                      </span>
                      <span>
                        Origin: <span className="text-red-400">{threat.source}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400 bg-[#111217] px-2 py-0.5 rounded border border-white/10">
                        {threat.correlated_event_ids.length} Correlated Events
                      </span>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          </div>
        </div>
      )}

      {/* Section B: Recent Security Events Table */}
      {hasData && (
        <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Live Ingested Security Events Feed</h3>
              <p className="text-xs text-gray-400">Normalized real-time stream evaluated by Log Analysis Agent</p>
            </div>
            <button
              onClick={() => setActivePage('log-analysis')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <span>Open Log Ingestion Console</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#111217] text-gray-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Event Type</th>
                  <th className="py-2.5 px-3">Source IP</th>
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Indicator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {events.slice(0, 8).map((evt) => (
                  <tr key={evt.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 px-3 text-gray-400">{evt.timestamp}</td>
                    <td className="py-2.5 px-3 font-semibold text-white">{evt.event_type}</td>
                    <td className="py-2.5 px-3 text-blue-400">{evt.source_ip}</td>
                    <td className="py-2.5 px-3 text-gray-300">{evt.user}</td>
                    <td className="py-2.5 px-3">
                      <RiskBadge level={evt.severity} size="sm" />
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={evt.status} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 truncate max-w-xs text-gray-400 font-sans">
                      {evt.suspicious_reasons?.[0] || evt.command || evt.action}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
