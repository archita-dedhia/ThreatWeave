import React, { useState } from 'react';
import { useSOC } from '../context/SOCContext';
import {
  ShieldAlert,
  Search,
  ArrowRight,
  FolderPlus,
} from 'lucide-react';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';

export const ThreatsPage = () => {
  const {
    threats,
    navigateToThreat,
    createIncidentFromThreat,
    loadDemoDataset,
  } = useSOC();

  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

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
            Detected Threat Dossiers Catalog
          </h2>
          <p className="text-xs text-gray-400">
            Synthesized multi-stage attack chains identified by the Threat Investigation Agent
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Filter threats..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#111217] border border-white/10 rounded-md text-xs text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:outline-none w-48 sm:w-60 font-mono"
            />
          </div>

          {/* Risk Level Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-[#111217] border border-white/10 text-gray-300 text-xs rounded px-2.5 py-1.5 focus:border-blue-500 focus:outline-none font-mono"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Threat Type Filter */}
          {threatTypes.length > 0 && (
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-[#111217] border border-white/10 text-gray-300 text-xs rounded px-2.5 py-1.5 focus:border-blue-500 focus:outline-none font-mono"
            >
              <option value="ALL">All Threat Types</option>
              {threatTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Threats Grid */}
      {threats.length === 0 ? (
        <EmptyState
          title="No threats detected"
          description="The AI Threat Investigation Agent has not synthesized any active attack chains yet. Ingest raw logs or run the demo dataset."
          actionText="Run SIH-26 Test Scenarios"
          onAction={loadDemoDataset}
        />
      ) : filteredThreats.length === 0 ? (
        <div className="py-12 text-center text-xs font-mono text-gray-500 bg-[#1A1C23] border border-white/10 rounded-lg">
          No threat dossiers match your current filter parameters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredThreats.map((threat) => (
            <div
              key={threat.id}
              className="p-5 bg-[#1A1C23] border border-white/10 hover:border-blue-500/40 rounded-lg flex flex-col justify-between space-y-4 shadow-sm transition-all group"
            >
              <div>
                {/* Header meta */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10 text-xs font-mono">
                  <span className="text-gray-400">{threat.id}</span>
                  <div className="flex items-center gap-2">
                    <RiskBadge level={threat.risk_level} size="sm" />
                    <span className="text-blue-400 font-bold bg-blue-600/10 px-1.5 py-0.5 rounded border border-blue-500/20 text-[10px]">
                      {threat.risk_score}/100 Risk
                    </span>
                  </div>
                </div>

                {/* Threat Title & Classification */}
                <h3 className="text-sm font-bold text-white mt-3 group-hover:text-blue-300 transition-colors">
                  {threat.title}
                </h3>
                <span className="inline-block mt-1 text-[11px] font-mono text-gray-400 bg-[#111217] px-2 py-0.5 rounded border border-white/5">
                  {threat.type}
                </span>

                {/* Summary Explanation */}
                <p className="text-xs text-gray-400 mt-2.5 line-clamp-3 leading-relaxed">
                  {threat.explanation.what_happened}
                </p>
              </div>

              {/* Target & Origin Info */}
              <div className="space-y-3 pt-3 border-t border-white/10 text-xs font-mono">
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Affected User:</span>
                    <span className="text-white font-semibold">{threat.affected_user}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Target System:</span>
                    <span className="text-gray-300">{threat.affected_system}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Origin / Vector:</span>
                    <span className="text-red-400 truncate max-w-[170px]">{threat.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Correlated Events:</span>
                    <span className="text-blue-400">{threat.correlated_event_ids.length} Telemetry Events</span>
                  </div>
                </div>

                {/* MITRE Badges */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {threat.mitre_tactics.map((tactic, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] font-mono px-1.5 py-0.5 bg-[#111217] text-gray-400 border border-white/10 rounded"
                    >
                      {tactic}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => navigateToThreat(threat.id)}
                    className="w-full py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 border border-blue-500/30 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <span>Investigate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => createIncidentFromThreat(threat.id)}
                    className="w-full py-1.5 bg-[#111217] hover:bg-white/5 text-gray-300 hover:text-white border border-white/10 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>Create Incident</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
