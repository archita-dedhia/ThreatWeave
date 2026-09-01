import React, { useState } from 'react';
import { useSOC } from '../context/SOCContext';
import {
  FolderLock,
  Search,
  Filter,
  ArrowRight,
  FileCheck2,
  CheckCircle2,
  Clock,
  User,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';

export const IncidentsPage: React.FC = () => {
  const {
    incidents,
    navigateToIncident,
    generateReportForIncident,
    updateIncidentStatus,
    navigateToReport,
    setActivePage,
    loadDemoDataset,
  } = useSOC();

  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

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

  const handleGenerateReport = (incidentId: string) => {
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
            Security Incident Queue
          </h2>
          <p className="text-xs text-gray-400">
            {incidents.length} total incidents • {filteredIncidents.length} active in view
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search incident ID, threat, analyst..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#111217] border border-white/10 focus:border-blue-500 rounded-md text-xs font-mono text-gray-200 placeholder:text-gray-500 focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-[#111217] border border-white/10 text-xs font-mono text-gray-300 rounded-md focus:outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="contained">Contained</option>
            <option value="resolved">Resolved</option>
          </select>

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
        </div>
      </div>

      {/* Incidents Table / Queue */}
      {incidents.length === 0 ? (
        <EmptyState
          title="No security incidents logged"
          description="Incidents are formally opened from investigated threats or automated high-severity detections."
          actionText="Load Controlled Demo Dataset"
          onAction={loadDemoDataset}
          secondaryActionText="View Threats"
          onSecondaryAction={() => setActivePage('threats')}
        />
      ) : (
        <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg space-y-4">
          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#111217] text-gray-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Incident ID</th>
                  <th className="py-3 px-4">Threat Name & Summary</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Analyst</th>
                  <th className="py-3 px-4">Created At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {filteredIncidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-bold text-blue-400 whitespace-nowrap">{inc.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white font-sans">{inc.threat_title}</div>
                      <div className="text-[11px] text-gray-400 font-sans line-clamp-1">{inc.summary}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <RiskBadge level={inc.risk_level} size="sm" />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={inc.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-gray-300">
                        <User className="w-3.5 h-3.5 text-gray-500" />
                        <span>{inc.assigned_to}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-400 whitespace-nowrap">{inc.created_at}</td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleGenerateReport(inc.id)}
                          className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-white/5 rounded-md transition-colors cursor-pointer"
                          title="Generate Formal Incident Report"
                        >
                          <FileCheck2 className="w-4 h-4" />
                        </button>

                        {inc.status !== 'resolved' ? (
                          <button
                            onClick={() => updateIncidentStatus(inc.id, 'resolved')}
                            className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-white/5 rounded-md transition-colors cursor-pointer"
                            title="Mark as Resolved"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        ) : null}

                        <button
                          onClick={() => navigateToIncident(inc.id)}
                          className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold rounded-md flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <span>Open</span>
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
