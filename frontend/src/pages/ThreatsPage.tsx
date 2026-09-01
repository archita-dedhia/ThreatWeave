import React, { useState } from 'react';
import { useSOC } from '../context/SOCContext';
import {
  ShieldAlert,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Flame,
  Clock,
  Layers,
  FolderPlus,
  FileCheck2,
} from 'lucide-react';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';

export const ThreatsPage: React.FC = () => {
  const {
    threats,
    navigateToThreat,
    createIncidentFromThreat,
    loadDemoDataset,
    setActivePage,
  } = useSOC();

  const [search, setSearch] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Filtered threats
  const filteredThreats = threats.filter((t) => {
    if (riskFilter !== 'ALL' && t.risk_level !== riskFilter) return false;
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (typeFilter !== 'ALL' && t.type !== typeFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        t.title.toLowerCase().includes(q) ||
        t.affected_user.toLowerCase().includes(q) ||
        t.affected_system.toLowerCase().includes(q) ||
        t.source.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const threatTypes = Array.from(new Set(threats.map((t) => t.type)));

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            Detected Security Threats
          </h2>
          <p className="text-xs text-gray-400">
            {threats.length} total correlated threats • {filteredThreats.length} filtered
          </p>
        </div>

        {/* Multi-facet Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search threat, user, asset..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#111217] border border-white/10 focus:border-blue-500 rounded-md text-xs font-mono text-gray-200 placeholder:text-gray-500 focus:outline-none"
            />
          </div>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-[#111217] border border-white/10 text-xs font-mono text-gray-300 rounded-md focus:outline-none"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-[#111217] border border-white/10 text-xs font-mono text-gray-300 rounded-md focus:outline-none"
          >
            <option value="ALL">All Threat Types</option>
            {threatTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-[#111217] border border-white/10 text-xs font-mono text-gray-300 rounded-md focus:outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="active">Active</option>
            <option value="investigating">Investigating</option>
            <option value="contained">Contained</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Threats List or Empty State */}
      {threats.length === 0 ? (
        <EmptyState
          title="No threats detected"
          description="UrbanSOC has not detected any active attack patterns or correlated anomalies yet. Ingest security logs to begin automated investigation."
          actionText="Load Controlled Demo Dataset"
          onAction={loadDemoDataset}
          secondaryActionText="Go to Log Analysis"
          onSecondaryAction={() => setActivePage('log-analysis')}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredThreats.map((threat) => (
            <div
              key={threat.id}
              className="p-5 bg-[#1A1C23] border border-white/10 hover:border-white/20 rounded-lg transition-all shadow-sm flex flex-col justify-between gap-4 group"
            >
              {/* Header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono text-gray-400 font-bold">{threat.id}</span>
                    <RiskBadge level={threat.risk_level} size="sm" />
                    <StatusBadge status={threat.status} size="sm" />
                    <span className="text-[11px] font-mono text-blue-300 bg-blue-600/10 px-2 py-0.5 rounded border border-blue-500/20">
                      {threat.confidence}% Confidence
                    </span>
                    <span className="text-[11px] font-mono text-gray-500">{threat.detected_at}</span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                    {threat.title}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2 max-w-4xl">{threat.explanation.what_happened}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => createIncidentFromThreat(threat.id)}
                    className="px-3 py-1.5 bg-[#111217] hover:bg-white/5 text-gray-200 border border-white/10 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FolderPlus className="w-3.5 h-3.5 text-blue-400" />
                    <span>Create Incident</span>
                  </button>

                  <button
                    onClick={() => navigateToThreat(threat.id)}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-md shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Investigate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Meta details footer */}
              <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-gray-400">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <span className="text-gray-500">Threat Type:</span>{' '}
                    <span className="text-gray-200">{threat.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Affected Identity:</span>{' '}
                    <span className="text-blue-300 font-semibold">{threat.affected_user}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Host Asset:</span>{' '}
                    <span className="text-gray-200">{threat.affected_system}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Source:</span>{' '}
                    <span className="text-red-400">{threat.source}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#111217] rounded border border-white/10 text-blue-400 text-[11px]">
                    {threat.correlated_event_ids.length} Correlated Events
                  </span>
                  <span className="px-2 py-0.5 bg-[#111217] rounded border border-white/10 text-green-400 text-[11px]">
                    {threat.recommendations.length} Recommended Actions
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
