import React, { useState } from 'react';
import { useSOC } from '../context/SOCContext';
import {
  FolderLock,
  Search,
  ArrowRight,
  FileCheck2,
  Clock,
  User,
} from 'lucide-react';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';

export const IncidentsPage = () => {
  const {
    incidents,
    navigateToIncident,
    generateReportForIncident,
    navigateToReport,
    loadDemoDataset,
  } = useSOC();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');

  const filteredIncidents = incidents.filter((inc) => {
    if (statusFilter !== 'ALL' && inc.status !== statusFilter) return false;
    if (riskFilter !== 'ALL' && inc.risk_level !== riskFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        inc.id.toLowerCase().includes(q) ||
        inc.threat_title.toLowerCase().includes(q) ||
        inc.assigned_to.toLowerCase().includes(q) ||
        inc.affected_user.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleGenerateReport = (incidentId) => {
    const rpt = generateReportForIncident(incidentId);
    if (rpt) {
      navigateToReport(rpt.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Operations Bar */}
      <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FolderLock className="w-5 h-5 text-blue-400" />
            Security Incident Response Queue
          </h2>
          <p className="text-xs text-gray-400">
            Triage, containment progress tracking, and analyst investigation workflows
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search incidents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#111217] border border-white/10 rounded-md text-xs text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:outline-none w-48 sm:w-60 font-mono"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#111217] border border-white/10 text-gray-300 text-xs rounded px-2.5 py-1.5 focus:border-blue-500 focus:outline-none font-mono"
          >
            <option value="ALL">All Statuses</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="contained">Contained</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Risk Filter */}
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
        </div>
      </div>

      {/* Incidents Table / List */}
      {incidents.length === 0 ? (
        <EmptyState
          title="Incident Queue is Empty"
          description="No security incidents have been promoted from threats yet. Load the test suite to populate verified incidents."
          actionText="Run SIH-26 Scenarios"
          onAction={loadDemoDataset}
        />
      ) : filteredIncidents.length === 0 ? (
        <div className="py-12 text-center text-xs font-mono text-gray-500 bg-[#1A1C23] border border-white/10 rounded-lg">
          No incident records match the specified filters.
        </div>
      ) : (
        <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#111217] text-gray-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3 px-3">Incident ID</th>
                  <th className="py-3 px-3">Threat Summary</th>
                  <th className="py-3 px-3">Risk Level</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Affected Asset</th>
                  <th className="py-3 px-3">Assignee</th>
                  <th className="py-3 px-3">Created</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {filteredIncidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-semibold text-blue-400 whitespace-nowrap">{inc.id}</td>
                    <td className="py-3 px-3 font-sans font-medium text-white max-w-xs truncate">
                      {inc.threat_title}
                    </td>
                    <td className="py-3 px-3">
                      <RiskBadge level={inc.risk_level} size="sm" />
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={inc.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-gray-300 whitespace-nowrap">
                      {inc.affected_user} @ {inc.affected_system}
                    </td>
                    <td className="py-3 px-3 text-gray-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3 text-gray-500" />
                        <span>{inc.assigned_to}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-gray-500 whitespace-nowrap">{inc.created_at}</td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleGenerateReport(inc.id)}
                          className="px-2.5 py-1 bg-[#111217] hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 rounded text-xs flex items-center gap-1 cursor-pointer transition-colors"
                          title="Generate Formal SIH 2026 Incident Report"
                        >
                          <FileCheck2 className="w-3.5 h-3.5 text-blue-400" />
                          <span>Report</span>
                        </button>

                        <button
                          onClick={() => navigateToIncident(inc.id)}
                          className="px-3 py-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <span>Manage</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
