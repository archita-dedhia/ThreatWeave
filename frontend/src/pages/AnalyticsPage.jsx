import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  BarChart3,
  Flame,
  Shield,
  Activity,
  Server,
  RefreshCw,
  AlertTriangle,
  HardDrive,
  Users,
} from 'lucide-react';
import { getSummary, getThreats, getLogs } from '../services/api';
import { EmptyState } from '../components/common/EmptyState';

const SEVERITY_COLORS = {
  CRITICAL: '#ef4444',
  HIGH: '#f59e0b',
  MEDIUM: '#3b82f6',
  LOW: '#10b981',
};

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

export const AnalyticsPage = () => {
  const [summary, setSummary] = useState(null);
  const [threats, setThreats] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryData, threatsData, logsData] = await Promise.all([
        getSummary(),
        getThreats(),
        getLogs(),
      ]);
      setSummary(summaryData);
      setThreats(threatsData || []);
      setLogs(logsData || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Unable to load analytics data from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // 1. Threats by Severity
  const severityData = useMemo(() => {
    const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    threats.forEach((t) => {
      const sev = (t.severity || 'LOW').toUpperCase();
      if (counts[sev] !== undefined) {
        counts[sev]++;
      } else {
        counts.LOW++;
      }
    });
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      color: SEVERITY_COLORS[name] || '#3b82f6',
    }));
  }, [threats]);

  // 2. Threats by Type
  const threatTypeData = useMemo(() => {
    const counts = {};
    threats.forEach((t) => {
      const type = t.threat_type || 'Unknown';
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
    }));
  }, [threats]);

  // 3. Logs by Event Type
  const eventTypeData = useMemo(() => {
    const counts = {};
    logs.forEach((l) => {
      const type = l.event_type || 'other';
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [logs]);

  // 4. Top Source IPs
  const topSourceIPs = useMemo(() => {
    const counts = {};
    logs.forEach((l) => {
      const ip = l.source_ip || 'unknown';
      counts[ip] = (counts[ip] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([ip, count]) => ({
        ip,
        count,
      }));
  }, [logs]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm text-gray-400 font-mono">Calculating security analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 bg-red-950/20 border border-red-500/30 rounded-xl text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white mb-2">Analytics Computation Error</h3>
        <p className="text-xs text-red-300 mb-6 font-mono">{error}</p>
        <button
          onClick={fetchAnalyticsData}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-2 mx-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Loading Analytics</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 bg-[#111217] border border-white/10 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Security Analytics &amp; Visualizations</h2>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Aggregated threat metrics and event distribution computed from live backend telemetry
            </p>
          </div>
        </div>

        <button
          onClick={fetchAnalyticsData}
          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Metric Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[#111217] border border-white/10 rounded-xl">
          <div className="text-xs font-mono text-gray-400">Total Telemetry Events</div>
          <div className="text-xl font-bold text-white font-mono mt-1">{logs.length}</div>
        </div>
        <div className="p-4 bg-[#111217] border border-white/10 rounded-xl">
          <div className="text-xs font-mono text-gray-400">Correlated Threat Count</div>
          <div className="text-xl font-bold text-red-400 font-mono mt-1">{threats.length}</div>
        </div>
        <div className="p-4 bg-[#111217] border border-white/10 rounded-xl">
          <div className="text-xs font-mono text-gray-400">Unique Attack Vectors</div>
          <div className="text-xl font-bold text-yellow-400 font-mono mt-1">{threatTypeData.length}</div>
        </div>
        <div className="p-4 bg-[#111217] border border-white/10 rounded-xl">
          <div className="text-xs font-mono text-gray-400">Active Source IPs</div>
          <div className="text-xl font-bold text-blue-400 font-mono mt-1">
            {summary ? summary.unique_source_ips : topSourceIPs.length}
          </div>
        </div>
      </div>

      {/* Charts Grid Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threats by Severity */}
        <div className="p-5 bg-[#111217] border border-white/10 rounded-xl space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-bold text-white">Threats by Severity Tier</h3>
          </div>
          <div className="h-64 w-full">
            {threats.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-500 font-mono">
                No threat severity data to display
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={severityData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#9ca3af"
                    fontSize={11}
                    tickLine={false}
                    fontFamily="monospace"
                  />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A1C23',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Threats by Attack Category */}
        <div className="p-5 bg-[#111217] border border-white/10 rounded-xl space-y-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-yellow-400" />
            <h3 className="text-sm font-bold text-white">Threats by Attack Type</h3>
          </div>
          <div className="h-64 w-full">
            {threatTypeData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-500 font-mono">
                No threat categories to display
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={threatTypeData}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 40, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                  <XAxis type="number" stroke="#9ca3af" fontSize={11} tickLine={false} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#9ca3af"
                    fontSize={11}
                    tickLine={false}
                    width={110}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A1C23',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Charts Grid Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Types Distribution */}
        <div className="p-5 bg-[#111217] border border-white/10 rounded-xl space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Security Events by Category</h3>
          </div>
          <div className="h-64 w-full">
            {eventTypeData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-500 font-mono">
                No event telemetry data to display
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={eventTypeData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {eventTypeData.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A1C23',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Active Source IPs */}
        <div className="p-5 bg-[#111217] border border-white/10 rounded-xl space-y-4">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Top Active Source IPs</h3>
          </div>
          <div className="space-y-3 pt-2">
            {topSourceIPs.map((item, idx) => (
              <div
                key={item.ip}
                className="p-3 bg-[#1A1C23] border border-white/5 rounded-lg flex items-center justify-between font-mono text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-white">{item.ip}</span>
                </div>
                <div className="text-gray-400 flex items-center gap-2">
                  <span className="text-blue-400 font-bold">{item.count}</span>
                  <span className="text-[11px] text-gray-500">events</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
