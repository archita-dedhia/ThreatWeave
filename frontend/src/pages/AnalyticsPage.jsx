import React from 'react';
import { useSOC } from '../context/SOCContext';
import {
  BarChart3,
  ShieldAlert,
  Activity,
  Layers,
  Flame,
  CheckCircle2,
  AlertTriangle,
  FolderLock,
} from 'lucide-react';
import { RiskBadge } from '../components/common/RiskBadge';
import { EmptyState } from '../components/common/EmptyState';

export const AnalyticsPage = () => {
  const { events, threats, incidents, loadDemoDataset } = useSOC();

  const totalEvents = events.length;
  const suspiciousCount = events.filter((e) => e.is_suspicious).length;
  const activeThreatsCount = threats.filter((t) => t.status === 'active').length;
  const openIncidentsCount = incidents.filter((i) => i.status !== 'resolved').length;

  // Event types breakdown
  const eventTypeDist = events.reduce((acc, evt) => {
    acc[evt.event_type] = (acc[evt.event_type] || 0) + 1;
    return acc;
  }, {});

  // Severity breakdown
  const severityDist = {
    CRITICAL: events.filter((e) => e.severity === 'CRITICAL').length,
    HIGH: events.filter((e) => e.severity === 'HIGH').length,
    MEDIUM: events.filter((e) => e.severity === 'MEDIUM').length,
    LOW: events.filter((e) => e.severity === 'LOW').length,
    INFO: events.filter((e) => e.severity === 'INFO').length,
  };

  // MITRE Tactics Matrix mapping from threats
  const mitreTactics = [
    {
      tactic: 'Initial Access',
      id: 'TA0001',
      threats: threats.filter((t) => t.mitre_tactics.some((m) => m.toLowerCase().includes('initial'))),
    },
    {
      tactic: 'Execution',
      id: 'TA0002',
      threats: threats.filter((t) => t.mitre_tactics.some((m) => m.toLowerCase().includes('execution'))),
    },
    {
      tactic: 'Persistence',
      id: 'TA0003',
      threats: threats.filter((t) => t.mitre_tactics.some((m) => m.toLowerCase().includes('persistence'))),
    },
    {
      tactic: 'Privilege Escalation',
      id: 'TA0004',
      threats: threats.filter((t) => t.mitre_tactics.some((m) => m.toLowerCase().includes('privilege'))),
    },
    {
      tactic: 'Defense Evasion',
      id: 'TA0005',
      threats: threats.filter((t) => t.mitre_tactics.some((m) => m.toLowerCase().includes('evasion'))),
    },
    {
      tactic: 'Credential Access',
      id: 'TA0006',
      threats: threats.filter((t) => t.mitre_tactics.some((m) => m.toLowerCase().includes('credential'))),
    },
    {
      tactic: 'Discovery',
      id: 'TA0007',
      threats: threats.filter((t) => t.mitre_tactics.some((m) => m.toLowerCase().includes('discovery'))),
    },
    {
      tactic: 'Lateral Movement',
      id: 'TA0008',
      threats: threats.filter((t) => t.mitre_tactics.some((m) => m.toLowerCase().includes('lateral'))),
    },
    {
      tactic: 'Collection',
      id: 'TA0009',
      threats: threats.filter((t) => t.mitre_tactics.some((m) => m.toLowerCase().includes('collection'))),
    },
    {
      tactic: 'Exfiltration',
      id: 'TA0010',
      threats: threats.filter((t) => t.mitre_tactics.some((m) => m.toLowerCase().includes('exfiltration'))),
    },
    {
      tactic: 'Command & Control',
      id: 'TA0011',
      threats: threats.filter((t) => t.mitre_tactics.some((m) => m.toLowerCase().includes('control'))),
    },
    {
      tactic: 'Impact',
      id: 'TA0040',
      threats: threats.filter((t) => t.mitre_tactics.some((m) => m.toLowerCase().includes('impact'))),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          SOC Threat Analytics &amp; MITRE ATT&amp;CK Matrix
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Quantitative telemetry metrics, severity distributions, and tactical MITRE framework mapping
        </p>
      </div>

      {events.length === 0 ? (
        <EmptyState
          title="No Analytics Data Available"
          description="Load the SIH 2026 test scenarios to populate the MITRE ATT&CK heatmap and quantitative SOC telemetry charts."
          actionText="Load Test Scenarios"
          onAction={loadDemoDataset}
        />
      ) : (
        <>
          {/* Top Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-[#1A1C23] border border-white/10 rounded-lg font-mono">
              <span className="text-gray-400 text-xs uppercase">Telemetry Events</span>
              <div className="text-2xl font-black text-white mt-1">{totalEvents}</div>
              <span className="text-[11px] text-gray-500">100% Ingested &amp; Normalized</span>
            </div>

            <div className="p-4 bg-[#1A1C23] border border-white/10 rounded-lg font-mono">
              <span className="text-gray-400 text-xs uppercase">Anomalous Events</span>
              <div className="text-2xl font-black text-yellow-500 mt-1">{suspiciousCount}</div>
              <span className="text-[11px] text-gray-500">
                {Math.round((suspiciousCount / (totalEvents || 1)) * 100)}% Heuristic Flagged
              </span>
            </div>

            <div className="p-4 bg-[#1A1C23] border border-white/10 rounded-lg font-mono">
              <span className="text-gray-400 text-xs uppercase">Correlated Threats</span>
              <div className="text-2xl font-black text-red-400 mt-1">{threats.length}</div>
              <span className="text-[11px] text-gray-500">Dual-AI Synthesized</span>
            </div>

            <div className="p-4 bg-[#1A1C23] border border-white/10 rounded-lg font-mono">
              <span className="text-gray-400 text-xs uppercase">Active Incidents</span>
              <div className="text-2xl font-black text-blue-400 mt-1">{openIncidentsCount}</div>
              <span className="text-[11px] text-gray-500">{incidents.length} Total Promoted</span>
            </div>
          </div>

          {/* MITRE ATT&CK Matrix Heatmap */}
          <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-sm font-bold text-white">MITRE ATT&amp;CK Tactical Matrix Coverage</h3>
                <p className="text-xs text-gray-400">
                  Tactics automatically tagged by the Threat Investigation Agent across ingested log streams
                </p>
              </div>
              <span className="text-xs font-mono text-blue-400 bg-blue-600/10 px-2 py-0.5 rounded border border-blue-500/20">
                Enterprise Matrix v14
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {mitreTactics.map((tact) => {
                const isHit = tact.threats.length > 0;

                return (
                  <div
                    key={tact.id}
                    className={`p-3 rounded-lg border transition-all font-mono text-xs ${
                      isHit
                        ? 'bg-red-500/10 border-red-500/30 text-red-300 shadow-sm'
                        : 'bg-[#111217] border-white/5 text-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span>{tact.id}</span>
                      {isHit && (
                        <span className="px-1.5 py-0.2 bg-red-500/20 text-red-400 rounded font-bold">
                          {tact.threats.length} THREATS
                        </span>
                      )}
                    </div>
                    <div className={`font-bold mt-1 text-[11px] ${isHit ? 'text-white' : 'text-gray-400'}`}>
                      {tact.tactic}
                    </div>

                    {isHit ? (
                      <div className="mt-2 pt-2 border-t border-red-500/20 space-y-1">
                        {tact.threats.map((t) => (
                          <div key={t.id} className="text-[10px] text-red-400 truncate" title={t.title}>
                            &bull; {t.id}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[10px] text-gray-400 mt-2">No active indicators</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Breakdown Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Types Distribution */}
            <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-sm font-bold text-white">Log Event Type Breakdown</h3>
                <span className="text-xs font-mono text-gray-400">{Object.keys(eventTypeDist).length} Categories</span>
              </div>

              <div className="space-y-3">
                {Object.entries(eventTypeDist).map(([type, count]) => {
                  const pct = Math.round((count / (totalEvents || 1)) * 100);
                  return (
                    <div key={type} className="space-y-1 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-gray-300 font-semibold">{type}</span>
                        <span className="text-gray-400">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-[#111217] rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Event Severity Distribution */}
            <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-sm font-bold text-white">Log Severity Distribution</h3>
                <span className="text-xs font-mono text-gray-400">Heuristic Rating</span>
              </div>

              <div className="space-y-3">
                {[
                  { level: 'CRITICAL', count: severityDist.CRITICAL, color: 'bg-red-500' },
                  { level: 'HIGH', count: severityDist.HIGH, color: 'bg-yellow-500' },
                  { level: 'MEDIUM', count: severityDist.MEDIUM, color: 'bg-blue-500' },
                  { level: 'LOW', count: severityDist.LOW, color: 'bg-green-500' },
                  { level: 'INFO', count: severityDist.INFO, color: 'bg-gray-500' },
                ].map((item) => {
                  const pct = Math.round((item.count / (totalEvents || 1)) * 100);
                  return (
                    <div key={item.level} className="space-y-1 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-gray-300 font-semibold">{item.level}</span>
                        <span className="text-gray-400">
                          {item.count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-[#111217] rounded-full overflow-hidden border border-white/5">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
