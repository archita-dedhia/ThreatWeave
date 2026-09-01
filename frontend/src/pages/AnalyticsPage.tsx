import React from 'react';
import { useSOC } from '../context/SOCContext';
import {
  BarChart3,
  TrendingUp,
  Shield,
  Layers,
  Users,
  Globe,
  Flame,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';

export const AnalyticsPage: React.FC = () => {
  const { events, threats, incidents, loadDemoDataset, setActivePage } = useSOC();

  const hasData = events.length > 0;

  // Aggregate stats
  const severityCounts = {
    critical: events.filter((e) => e.severity === 'critical').length,
    high: events.filter((e) => e.severity === 'high').length,
    medium: events.filter((e) => e.severity === 'medium').length,
    low: events.filter((e) => e.severity === 'low').length,
    info: events.filter((e) => e.severity === 'info').length,
  };

  // Top Targeted Users
  const userFrequency: Record<string, number> = {};
  events.forEach((e) => {
    if (e.user && e.user !== 'UNKNOWN') {
      userFrequency[e.user] = (userFrequency[e.user] || 0) + 1;
    }
  });
  const topUsers = Object.entries(userFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Top Source IPs
  const ipFrequency: Record<string, number> = {};
  events.forEach((e) => {
    if (e.source_ip && e.source_ip !== 'UNKNOWN') {
      ipFrequency[e.source_ip] = (ipFrequency[e.source_ip] || 0) + 1;
    }
  });
  const topIPs = Object.entries(ipFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // MITRE ATT&CK Framework Tactics mapping
  const mitreTactics = [
    { id: 'TA0001', name: 'Initial Access', count: events.filter((e) => e.event_type.includes('AUTH') || e.event_type.includes('LOGIN')).length, techniques: ['T1110 (Brute Force)', 'T1078 (Valid Accounts)'] },
    { id: 'TA0002', name: 'Execution', count: events.filter((e) => e.event_type.includes('PROCESS') || e.event_type.includes('SCRIPT') || e.event_type.includes('EXEC')).length, techniques: ['T1059.001 (PowerShell)', 'T1059.004 (Unix Shell)'] },
    { id: 'TA0004', name: 'Privilege Escalation', count: events.filter((e) => e.event_type.includes('PRIVILEGE') || (e.command && e.command.includes('sudo'))).length, techniques: ['T1548.003 (Sudo)', 'T1078 (Privileged Accounts)'] },
    { id: 'TA0005', name: 'Defense Evasion', count: events.filter((e) => e.command && (e.command.includes('-enc') || e.command.includes('base64') || e.command.includes('chmod'))).length, techniques: ['T1027 (Obfuscated Files)', 'T1222 (File Permissions)'] },
    { id: 'TA0010', name: 'Exfiltration', count: events.filter((e) => e.event_type.includes('TRANSFER') || e.event_type.includes('EXFIL') || (e.bytes_transferred || 0) > 1000000).length, techniques: ['T1048.003 (Exfiltration Over Web/Cloud)', 'T1567 (Exfiltration Over Web Service)'] },
    { id: 'TA0011', name: 'Command & Control', count: events.filter((e) => e.command && (e.command.includes('http') || e.command.includes('wget') || e.command.includes('curl'))).length, techniques: ['T1071 (Application Layer Protocol)'] },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Security Operations Analytics &amp; MITRE Matrix
          </h2>
          <p className="text-xs text-gray-400">
            Real-time analytics computed across normalized telemetry streams and attack chain models
          </p>
        </div>
      </div>

      {!hasData ? (
        <EmptyState
          title="No analytics data available"
          description="Analytics and threat vector patterns are calculated dynamically when security logs are ingested."
          actionText="Load Controlled Demo Dataset"
          onAction={loadDemoDataset}
          secondaryActionText="Go to Log Analysis"
          onSecondaryAction={() => setActivePage('log-analysis')}
        />
      ) : (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-[#1A1C23] border border-white/10 rounded-lg">
              <span className="text-xs font-mono uppercase text-gray-400">Total Analyzed</span>
              <div className="text-2xl font-black text-white font-mono mt-1">{events.length}</div>
              <span className="text-[11px] text-gray-500 font-mono">Ingested security logs</span>
            </div>

            <div className="p-4 bg-[#1A1C23] border border-white/10 rounded-lg">
              <span className="text-xs font-mono uppercase text-gray-400">Threat Clusters</span>
              <div className="text-2xl font-black text-red-400 font-mono mt-1">{threats.length}</div>
              <span className="text-[11px] text-gray-500 font-mono">Correlated attack chains</span>
            </div>

            <div className="p-4 bg-[#1A1C23] border border-white/10 rounded-lg">
              <span className="text-xs font-mono uppercase text-gray-400">Incidents Tracked</span>
              <div className="text-2xl font-black text-blue-300 font-mono mt-1">{incidents.length}</div>
              <span className="text-[11px] text-gray-500 font-mono">Case files generated</span>
            </div>

            <div className="p-4 bg-[#1A1C23] border border-white/10 rounded-lg">
              <span className="text-xs font-mono uppercase text-gray-400">Avg Risk Rating</span>
              <div className="text-2xl font-black text-yellow-400 font-mono mt-1">
                {threats.length > 0
                  ? Math.round(threats.reduce((acc, t) => acc + t.risk_score, 0) / threats.length)
                  : 0}
                <span className="text-xs font-normal text-gray-500"> / 100</span>
              </div>
              <span className="text-[11px] text-gray-500 font-mono">Across detected threats</span>
            </div>
          </div>

          {/* 2-Column Analytics Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Severity Distribution */}
            <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                Event Severity Distribution
              </h3>

              <div className="space-y-3">
                {[
                  { label: 'Critical', count: severityCounts.critical, color: 'bg-red-500' },
                  { label: 'High', count: severityCounts.high, color: 'bg-yellow-500' },
                  { label: 'Medium', count: severityCounts.medium, color: 'bg-yellow-400' },
                  { label: 'Low', count: severityCounts.low, color: 'bg-green-500' },
                  { label: 'Info', count: severityCounts.info, color: 'bg-blue-500' },
                ].map((item) => {
                  const pct = events.length > 0 ? Math.round((item.count / events.length) * 100) : 0;
                  return (
                    <div key={item.label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-gray-300 font-semibold">{item.label}</span>
                        <span className="text-gray-400">
                          {item.count} events ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-[#111217] rounded-full overflow-hidden">
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

            {/* Top Targeted Users & Top Source IPs */}
            <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                Top Targeted Identities &amp; Source Attack IPs
              </h3>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-[10px] uppercase text-gray-500 block mb-2 font-semibold">
                    Targeted User Accounts
                  </span>
                  <div className="space-y-2">
                    {topUsers.map(([usr, count]) => (
                      <div
                        key={usr}
                        className="p-2 bg-[#111217] rounded-md border border-white/10 flex items-center justify-between"
                      >
                        <span className="text-blue-300 font-semibold truncate max-w-[100px]">{usr}</span>
                        <span className="text-gray-400">{count} events</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase text-gray-500 block mb-2 font-semibold">
                    Attack Origin IPs
                  </span>
                  <div className="space-y-2">
                    {topIPs.map(([ip, count]) => (
                      <div
                        key={ip}
                        className="p-2 bg-[#111217] rounded-md border border-white/10 flex items-center justify-between"
                      >
                        <span className="text-red-400 font-semibold truncate max-w-[100px]">{ip}</span>
                        <span className="text-gray-400">{count} events</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MITRE ATT&CK Matrix Mapping Grid */}
          <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  MITRE ATT&amp;CK Framework Coverage &amp; Detected Tactics
                </h3>
                <p className="text-xs text-gray-400">Enterprise security matrix mapped automatically by AI reasoners</p>
              </div>
              <span className="text-xs font-mono text-blue-400 bg-blue-600/10 px-2 py-0.5 rounded border border-blue-500/20">
                v14 Enterprise
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {mitreTactics.map((tactic) => {
                const isTriggered = tactic.count > 0;

                return (
                  <div
                    key={tactic.id}
                    className={`p-4 rounded-lg border transition-all space-y-2 ${
                      isTriggered
                        ? 'bg-[#111217] border-blue-500/40 shadow-sm'
                        : 'bg-[#111217]/40 border-white/5 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-blue-400 font-bold">{tactic.id}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          isTriggered
                            ? 'bg-red-500/10 text-red-300 border border-red-500/20 font-bold'
                            : 'bg-white/5 text-gray-500'
                        }`}
                      >
                        {tactic.count} Hits
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white">{tactic.name}</h4>

                    <div className="space-y-1 pt-1 border-t border-white/5 font-mono text-[10px] text-gray-400">
                      {tactic.techniques.map((tech, i) => (
                        <div key={i} className="truncate">
                          • {tech}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
