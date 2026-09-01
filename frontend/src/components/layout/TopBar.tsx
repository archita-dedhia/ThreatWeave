import React, { useState, useRef, useEffect } from 'react';
import { useSOC } from '../../context/SOCContext';
import {
  Search,
  Bell,
  Sparkles,
  UserCheck,
  RotateCcw,
  ShieldAlert,
  FolderLock,
  FileText,
  X,
  ExternalLink,
} from 'lucide-react';
import { RiskBadge } from '../common/RiskBadge';

export const TopBar: React.FC = () => {
  const {
    activePage,
    events,
    threats,
    incidents,
    loadDemoDataset,
    clearAllData,
    isProcessing,
    searchQuery,
    setSearchQuery,
    navigateToThreat,
    navigateToIncident,
    setActivePage,
    notifications,
  } = useSOC();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter items based on searchQuery
  const q = searchQuery.trim().toLowerCase();
  const matchedThreats = q ? threats.filter((t) => t.title.toLowerCase().includes(q) || t.affected_user.toLowerCase().includes(q) || t.source.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)) : [];
  const matchedIncidents = q ? incidents.filter((i) => i.id.toLowerCase().includes(q) || i.threat_title.toLowerCase().includes(q) || i.affected_user.toLowerCase().includes(q)) : [];
  const matchedEvents = q ? events.filter((e) => e.source_ip.includes(q) || e.user.toLowerCase().includes(q) || (e.command && e.command.toLowerCase().includes(q)) || e.id.toLowerCase().includes(q)).slice(0, 5) : [];

  const getPageMeta = () => {
    switch (activePage) {
      case 'overview':
        return {
          title: 'Security Operations Center',
          subtitle: 'AI-powered threat detection, investigation and response',
        };
      case 'log-analysis':
        return {
          title: 'Security Log Analysis',
          subtitle: 'Multi-format log ingestion, event normalization, and heuristic anomaly detection',
        };
      case 'ai-investigation':
        return {
          title: 'Agentic AI Investigation',
          subtitle: 'Coordinated multi-agent workflow for threat correlation, attack graph generation & reasoning',
        };
      case 'threats':
        return {
          title: 'Detected Threats',
          subtitle: 'Active threat clusters derived from normalized security events and telemetry',
        };
      case 'threat-detail':
        return {
          title: 'Threat Investigation',
          subtitle: 'Evidence-backed attack timeline, transparent risk scoring & defensive playbooks',
        };
      case 'incidents':
        return {
          title: 'Security Incidents',
          subtitle: 'Operational incident queue with audit logs and assigned analyst workflows',
        };
      case 'incident-detail':
        return {
          title: 'Incident Resolution Workbench',
          subtitle: 'Incident tracking, containment orchestration & analyst investigation journal',
        };
      case 'reports':
        return {
          title: 'Incident Reports',
          subtitle: 'Formal executive & forensic incident reports with instant export capabilities',
        };
      case 'analytics':
        return {
          title: 'Security Analytics',
          subtitle: 'Telemetry breakdowns, MITRE mapping trends, and SOC operational performance',
        };
      case 'settings':
        return {
          title: 'System Settings',
          subtitle: 'Configure risk scoring thresholds, detection engine parameters, and agent models',
        };
      default:
        return {
          title: 'UrbanSOC Console',
          subtitle: 'Enterprise Cybersecurity Platform',
        };
    }
  };

  const meta = getPageMeta();

  return (
    <header className="h-16 border-b border-white/10 bg-[#111217]/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20 shrink-0">
      {/* Page Title & Subtitle */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-base font-bold text-white tracking-tight">{meta.title}</h1>
          <span className="text-xs text-blue-400 font-mono hidden md:inline-block">/</span>
          <span className="text-[11px] text-gray-400 font-normal hidden md:inline-block truncate max-w-md">
            {meta.subtitle}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Global Search with Smart Results Dropdown */}
        <div className="relative" ref={searchRef}>
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search IP, user, threat..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-52 lg:w-64 pl-8 pr-7 py-1 bg-white/5 border border-white/10 focus:border-blue-500 rounded-full text-xs text-gray-300 placeholder:text-gray-500 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-gray-500 hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {isSearchOpen && searchQuery.trim() && (
            <div className="absolute right-0 top-full mt-2 w-96 max-h-96 bg-[#1A1C23] border border-white/10 rounded-lg shadow-2xl overflow-y-auto custom-scrollbar p-2 z-50 animate-in fade-in">
              <div className="text-[10px] font-mono text-gray-400 uppercase px-3 py-1 font-semibold">
                Search Results for &quot;{searchQuery}&quot;
              </div>

              {matchedThreats.length === 0 && matchedIncidents.length === 0 && matchedEvents.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-400">No matching threat, incident, or log found.</div>
              ) : (
                <div className="space-y-2 mt-1">
                  {matchedThreats.length > 0 && (
                    <div>
                      <div className="text-[10px] font-mono text-blue-400 uppercase px-2 py-0.5 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> Detected Threats ({matchedThreats.length})
                      </div>
                      {matchedThreats.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => {
                            navigateToThreat(t.id);
                            setIsSearchOpen(false);
                          }}
                          className="p-2 rounded-md hover:bg-white/5 cursor-pointer flex items-center justify-between text-xs transition-colors"
                        >
                          <div className="truncate mr-2">
                            <div className="text-white font-medium truncate">{t.title}</div>
                            <div className="text-[10px] text-gray-400 font-mono">
                              {t.affected_user} • {t.source}
                            </div>
                          </div>
                          <RiskBadge level={t.risk_level} size="sm" />
                        </div>
                      ))}
                    </div>
                  )}

                  {matchedIncidents.length > 0 && (
                    <div className="border-t border-white/10 pt-1">
                      <div className="text-[10px] font-mono text-yellow-500 uppercase px-2 py-0.5 flex items-center gap-1">
                        <FolderLock className="w-3 h-3" /> Incidents ({matchedIncidents.length})
                      </div>
                      {matchedIncidents.map((inc) => (
                        <div
                          key={inc.id}
                          onClick={() => {
                            navigateToIncident(inc.id);
                            setIsSearchOpen(false);
                          }}
                          className="p-2 rounded-md hover:bg-white/5 cursor-pointer flex items-center justify-between text-xs transition-colors"
                        >
                          <div className="truncate mr-2">
                            <div className="text-white font-medium truncate">
                              {inc.id}: {inc.threat_title}
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono">Status: {inc.status}</div>
                          </div>
                          <RiskBadge level={inc.risk_level} size="sm" />
                        </div>
                      ))}
                    </div>
                  )}

                  {matchedEvents.length > 0 && (
                    <div className="border-t border-white/10 pt-1">
                      <div className="text-[10px] font-mono text-blue-400 uppercase px-2 py-0.5 flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Matching Logs ({matchedEvents.length})
                      </div>
                      {matchedEvents.map((evt) => (
                        <div
                          key={evt.id}
                          onClick={() => {
                            setActivePage('log-analysis');
                            setIsSearchOpen(false);
                          }}
                          className="p-2 rounded-md hover:bg-white/5 cursor-pointer text-xs transition-colors"
                        >
                          <div className="text-gray-300 font-mono text-[11px] truncate">
                            {evt.source_ip} → {evt.user} ({evt.event_type})
                          </div>
                          <div className="text-[10px] text-gray-500 truncate">{evt.command || evt.raw_log}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controlled Demo Dataset Quick Action */}
        <button
          onClick={loadDemoDataset}
          disabled={isProcessing}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-md shadow-md flex items-center gap-2 transition-all cursor-pointer"
          title="Load Controlled SIH 2026 Test Dataset"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : 'text-blue-200'}`} />
          <span className="hidden sm:inline">Load Demo Dataset</span>
          <span className="text-[9px] uppercase font-mono bg-blue-900/60 text-blue-200 px-1 py-0.5 rounded border border-blue-400/30">
            DEMO
          </span>
        </button>

        {/* Reset / Clear Button */}
        {events.length > 0 && (
          <button
            onClick={clearAllData}
            title="Reset Workspace to Clean State"
            className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 rounded-md transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 rounded-md transition-colors relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[#1A1C23] border border-white/10 rounded-lg shadow-2xl p-3 z-50 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-semibold text-white">
                <span>SOC Notifications</span>
                <span className="text-[10px] font-mono text-blue-400">{notifications.length} active</span>
              </div>
              <div className="divide-y divide-white/5 max-h-64 overflow-y-auto custom-scrollbar mt-1">
                {notifications.length === 0 ? (
                  <div className="py-4 text-center text-xs text-gray-500">No new alerts</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="py-2 text-xs">
                      <div className="font-medium text-white">{n.title}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{n.message}</div>
                      <div className="text-[10px] text-gray-500 font-mono mt-1">{n.timestamp}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Analyst Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
          <div className="w-7 h-7 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-mono text-xs font-bold">
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-white">SOC Analyst</div>
            <div className="text-[9px] text-green-500 font-mono">L3 Incident Responder</div>
          </div>
        </div>
      </div>
    </header>
  );
};
