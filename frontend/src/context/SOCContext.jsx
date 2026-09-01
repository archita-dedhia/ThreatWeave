import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CONTROLLED_DEMO_EVENTS } from '../data/demoDataset';
import {
  parseRawLogs,
  runLogAnalysisAgent,
  runThreatInvestigationAgent,
  generateReportFromThreat,
} from '../services/detectionEngine';

const SOCContext = createContext(undefined);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const safeFetch = async (url, opts, timeoutMs = 6000) => {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(url, { ...opts, signal: ctrl.signal });
    clearTimeout(t);
    return res;
  } catch {
    return { ok: false, status: 0, json: async () => ({}) };
  }
};

export const SOCProvider = ({ children }) => {
  // Navigation
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedThreatId, setSelectedThreatId] = useState(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [selectedReportId, setSelectedReportId] = useState(null);

  // Core Data
  const [events, setEvents] = useState([]);
  const [threats, setThreats] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [reports, setReports] = useState([]);
  const [backendAvailable, setBackendAvailable] = useState(false);

  // Multi-Agent Execution States
  const [logAgentState, setLogAgentState] = useState({
    id: 'agent-1',
    name: 'Log Analysis Agent',
    role: 'L1 Ingestion, normalization, regex/heuristic parsing & anomaly detection',
    status: 'idle',
    current_task: 'Standing by for live security telemetry streams',
    progress: 0,
    output_summary: '0 logs processed',
    last_active: 'Ready',
  });

  const [investigationAgentState, setInvestigationAgentState] = useState({
    id: 'agent-2',
    name: 'Threat Investigation Agent',
    role: 'L2 Contextual correlation, MITRE ATT&CK mapping, risk scoring & response playbooks',
    status: 'idle',
    current_task: 'Standing by for suspicious event envelopes',
    progress: 0,
    output_summary: '0 threats synthesized',
    last_active: 'Ready',
  });

  const [agentLogs, setAgentLogs] = useState([]);
  const [agentMessages, setAgentMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeLogPipelineStage, setActiveLogPipelineStage] = useState('idle');

  // UI Toast notifications
  const [toasts, setToasts] = useState([]);

  const addToast = (type, title, message) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // User Settings
  const [settings, setSettings] = useState({
    brute_force_threshold: 5,
    exfiltration_threshold_mb: 50,
    off_hours_start: '22:00',
    off_hours_end: '06:00',
    log_agent_model: 'CrewAI L1 Pipeline (Security Incident v1)',
    investigation_agent_model: 'CrewAI L2 Pipeline (Attack Chain Reasoner)',
    ai_temperature: 0.2,
    alert_critical: true,
    alert_incident_created: true,
    auto_correlate: true,
    max_batch_size: 5000,
    mongo_uri: import.meta.env.VITE_MONGO_URI || '',
    use_crewai: true,
  });

  const [crewAIStatus, setCrewAIStatus] = useState({
    configured: false,
    connected: false,
    checked: false,
  });

  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const socSettings = {
    bruteForceThreshold: settings.brute_force_threshold,
    riskThresholdHigh: 70,
    riskThresholdCritical: 85,
    enableAutoContainment: settings.auto_correlate,
    aiModelMode: settings.log_agent_model,
    apiKey: '',
    syslogPort: 514,
    mongoUri: settings.mongo_uri,
  };

  const updateSOCSettings = (local) => {
    updateSettings({
      brute_force_threshold: local.bruteForceThreshold ?? settings.brute_force_threshold,
      auto_correlate:
        typeof local.enableAutoContainment === 'boolean'
          ? local.enableAutoContainment
          : settings.auto_correlate,
      log_agent_model: local.aiModelMode ?? settings.log_agent_model,
      mongo_uri: local.mongoUri ?? settings.mongo_uri,
    });
    addToast('success', 'Configuration Saved', 'Detection engine settings updated successfully.');
  };

  const runCrewAIPipeline = async (rawEvents) => {
    if (!settings.use_crewai) return { used: false };
    try {
      const res = await safeFetch(`${API_BASE}/api/crewai/run-pipeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events: rawEvents,
          config: {
            generate_pdf: true,
            generate_markdown: true,
            include_mitre_mapping: true,
            include_evidence: true,
            include_remediation_playbooks: true,
          },
        }),
      }, 120000);
      if (!res.ok) return { used: false };
      const data = await res.json().catch(() => ({}));
      return { used: true, data };
    } catch {
      return { used: false };
    }
  };

  const generateCrewAIReport = async (report) => {
    if (!settings.use_crewai) return { used: false };
    try {
      const res = await safeFetch(`${API_BASE}/api/crewai/generate-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      }, 120000);
      if (!res.ok) return { used: false };
      const data = await res.json().catch(() => ({}));
      return { used: true, data };
    } catch {
      return { used: false };
    }
  };

  /**
   * Loads the controlled SIH 2026 3-scenario dataset and auto-executes the multi-agent pipeline
   */
  const loadDemoDataset = () => {
    setIsProcessing(true);
    setActiveLogPipelineStage('ingestion');

    setLogAgentState((prev) => ({
      ...prev,
      status: 'analyzing',
      current_task: 'Ingesting SIH 2026 multi-scenario cybersecurity telemetry',
      progress: 20,
      output_summary: 'Normalizing 21 raw security events via CrewAI pipeline...',
    }));

    addToast('info', 'Demo Dataset Loaded', 'Ingesting 21 controlled multi-scenario security events.');

    const fallbackRun = () => {
      setTimeout(() => {
        const logAnalysisResult = runLogAnalysisAgent(CONTROLLED_DEMO_EVENTS, settings);
        setEvents(logAnalysisResult.enrichedEvents);
        setAgentLogs((prev) => [...prev, ...logAnalysisResult.logs]);
        setActiveLogPipelineStage('detection');

        setLogAgentState({
          id: 'agent-1',
          name: 'Log Analysis Agent',
          role: 'L1 Ingestion, normalization, regex/heuristic parsing & anomaly detection',
          status: 'completed',
          current_task: 'Idle - Ingestion batch normalized and evaluated (Local fallback)',
          progress: 100,
          output_summary: `Processed ${logAnalysisResult.enrichedEvents.length} events, flagged ${logAnalysisResult.suspiciousEvents.length} suspicious anomalies`,
          last_active: 'Just now',
        });

        setInvestigationAgentState((prev) => ({
          ...prev,
          status: 'analyzing',
          current_task: 'Correlating attack chains, mapping MITRE techniques, and scoring risk',
          progress: 50,
          output_summary: 'Reconstructing graph attack paths...',
        }));

        setTimeout(() => {
          const investigationResult = runThreatInvestigationAgent(
            logAnalysisResult.suspiciousEvents,
            logAnalysisResult.enrichedEvents,
            settings
          );

          setThreats(investigationResult.threats);
          setAgentLogs((prev) => [...prev, ...investigationResult.logs]);
          setAgentMessages((prev) => [...prev, ...investigationResult.messages]);

          const newIncidents = investigationResult.threats.map((threat, idx) => ({
            id: `INC-2026-${String(idx + 1).padStart(3, '0')}`,
            threat_id: threat.id,
            threat_title: threat.title,
            risk_level: threat.risk_level,
            status: 'open',
            affected_user: threat.affected_user,
            affected_system: threat.affected_system,
            source: threat.source,
            created_at: threat.detected_at,
            assigned_to: idx === 0 ? 'Lead SOC Analyst' : 'Incident Responder (Triage)',
            notes: [
              {
                id: `NOTE-${Date.now()}-${idx}`,
                author: 'Threat Detection Engine',
                timestamp: threat.detected_at,
                text: `Incident automatically opened upon verification by Threat Investigation Agent. Risk score: ${threat.risk_score}/100.`,
              },
            ],
          }));

          setIncidents(newIncidents);

          setInvestigationAgentState({
            id: 'agent-2',
            name: 'Threat Investigation Agent',
            role: 'L2 Contextual correlation, MITRE ATT&CK mapping, risk scoring & response playbooks',
            status: 'completed',
            current_task: 'Completed - 3 Correlated Threat Chains verified (Local fallback)',
            progress: 100,
            output_summary: `Correlated ${investigationResult.threats.length} actionable attack chains with defensive playbooks`,
            last_active: 'Just now',
          });

          setIsProcessing(false);
          setActiveLogPipelineStage('idle');
          addToast(
            'success',
            'Threat Pipeline Completed',
            `Detection engine processed events: ${investigationResult.threats.length} actionable threats correlated.`
          );
        }, 700);
      }, 600);
    };

    // Try CrewAI first if connected, then run detection pipeline
    (async () => {
      if (crewAIStatus.connected) {
        const crew = await runCrewAIPipeline(CONTROLLED_DEMO_EVENTS);
        if (crew.used && crew.data && crew.data.success) {
          addToast('success', 'CrewAI Pipeline Engaged', 'Security Incident Pipeline v1 processing via CrewAI...');
        }
      }
      fallbackRun();
    })();
  };

  // Process manual raw log inputs
  const processRawLogs = (rawText, format = 'auto') => {
    setIsProcessing(true);
    setActiveLogPipelineStage('ingestion');

    setLogAgentState((prev) => ({
      ...prev,
      status: 'analyzing',
      current_task: `Parsing and normalizing ${format.toUpperCase()} log input...`,
      progress: 30,
    }));

    setTimeout(() => {
      const parsed = parseRawLogs(rawText, format);
      if (parsed.length === 0) {
        setIsProcessing(false);
        setActiveLogPipelineStage('idle');
        setLogAgentState((prev) => ({ ...prev, status: 'idle', current_task: 'Idle' }));
        addToast('error', 'Parse Error', 'No valid log records found in the provided input.');
        return;
      }

      const logAnalysisResult = runLogAnalysisAgent(parsed, settings);
      setEvents((prev) => [...logAnalysisResult.enrichedEvents, ...prev]);
      setAgentLogs((prev) => [...prev, ...logAnalysisResult.logs]);

      setLogAgentState({
        id: 'agent-1',
        name: 'Log Analysis Agent',
        role: 'L1 Ingestion, normalization, regex/heuristic parsing & anomaly detection',
        status: 'completed',
        current_task: 'Normalization & Anomaly flagging complete',
        progress: 100,
        output_summary: `Ingested ${parsed.length} events, flagged ${logAnalysisResult.suspiciousEvents.length} suspicious`,
        last_active: 'Just now',
      });

      if (logAnalysisResult.suspiciousEvents.length > 0) {
        setInvestigationAgentState((prev) => ({
          ...prev,
          status: 'analyzing',
          current_task: 'Reconstructing graph attack vectors for flagged anomalies...',
          progress: 60,
        }));

        setTimeout(() => {
          const invResult = runThreatInvestigationAgent(
            logAnalysisResult.suspiciousEvents,
            [...logAnalysisResult.enrichedEvents, ...events],
            settings
          );

          setThreats((prev) => {
            const existingIds = new Set(prev.map((t) => t.id));
            const fresh = invResult.threats.filter((t) => !existingIds.has(t.id));
            return [...fresh, ...prev];
          });

          setAgentLogs((prev) => [...prev, ...invResult.logs]);
          setAgentMessages((prev) => [...prev, ...invResult.messages]);

          setInvestigationAgentState({
            id: 'agent-2',
            name: 'Threat Investigation Agent',
            role: 'L2 Contextual correlation, MITRE ATT&CK mapping, risk scoring & response playbooks',
            status: 'completed',
            current_task: 'Completed correlation cycle',
            progress: 100,
            output_summary: `Correlated ${invResult.threats.length} threats`,
            last_active: 'Just now',
          });

          setIsProcessing(false);
          setActiveLogPipelineStage('idle');
          addToast(
            'success',
            'Logs Processed',
            `Normalized ${parsed.length} events and detected ${invResult.threats.length} actionable threats.`
          );
        }, 500);
      } else {
        setIsProcessing(false);
        setActiveLogPipelineStage('idle');
        addToast('info', 'Logs Ingested', `Normalized ${parsed.length} events. No critical anomalies found.`);
      }
    }, 500);
  };

  // Navigation Helpers
  const navigateToThreat = (threatId) => {
    setSelectedThreatId(threatId);
    setActivePage('threat-detail');
  };

  const navigateToIncident = (incidentId) => {
    setSelectedIncidentId(incidentId);
    setActivePage('incident-detail');
  };

  const navigateToReport = (reportId) => {
    setSelectedReportId(reportId);
    setActivePage('reports');
  };

  // Threat & Incident Management
  const createIncidentFromThreat = (threatId, analystName = 'Lead SOC Analyst') => {
    const threat = threats.find((t) => t.id === threatId);
    if (!threat) return null;

    const existing = incidents.find((i) => i.threat_id === threatId);
    if (existing) {
      navigateToIncident(existing.id);
      addToast('info', 'Incident Exists', `Navigated to existing incident ${existing.id}`);
      return existing;
    }

    const newInc = {
      id: `INC-2026-${String(incidents.length + 1).padStart(3, '0')}`,
      threat_id: threat.id,
      threat_title: threat.title,
      risk_level: threat.risk_level,
      status: 'investigating',
      affected_user: threat.affected_user,
      affected_system: threat.affected_system,
      source: threat.source,
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      assigned_to: analystName,
      notes: [
        {
          id: `NOTE-${Date.now()}`,
          author: analystName,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
          text: `Investigating threat: ${threat.title}. Initial risk score: ${threat.risk_score}/100.`,
        },
      ],
    };

    setIncidents((prev) => [newInc, ...prev]);
    addToast('success', 'Incident Created', `Created ${newInc.id} for ${threat.title}`);
    navigateToIncident(newInc.id);
    return newInc;
  };

  const updateIncidentStatus = (incidentId, status) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === incidentId ? { ...inc, status } : inc))
    );
    addToast('info', 'Status Updated', `Incident ${incidentId} marked as ${status.toUpperCase()}`);
  };

  const addIncidentNote = (incidentId, text, author = 'Lead SOC Analyst') => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          const newNote = {
            id: `NOTE-${Date.now()}`,
            author,
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
            text,
          };
          return { ...inc, notes: [...inc.notes, newNote] };
        }
        return inc;
      })
    );
    addToast('success', 'Note Added', 'Incident dossier updated with analyst notes.');
  };

  const executeResponseAction = (threatId, actionId) => {
    setThreats((prev) =>
      prev.map((t) => {
        if (t.id === threatId) {
          const updatedRecs = t.recommendations.map((r) =>
            r.id === actionId ? { ...r, status: 'executed' } : r
          );
          return { ...t, recommendations: updatedRecs };
        }
        return t;
      })
    );
    addToast('success', 'Playbook Action Executed', `Executed action ${actionId} on target endpoint.`);
  };

  const saveReportsToBackend = useCallback(async (reportsList) => {
    if (!backendAvailable || !reportsList || reportsList.length === 0) return;
    for (const r of reportsList.slice(0, 10)) {
      try {
        await safeFetch(`${API_BASE}/api/reports`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(r),
        });
      } catch {}
    }
  }, [backendAvailable]);

  const saveThreatsToBackend = useCallback(async (threatsList) => {
    if (!backendAvailable || threatsList?.length === 0) return;
    try {
      await safeFetch(`${API_BASE}/api/threats/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(threatsList),
      });
    } catch {}
  }, [backendAvailable]);

  const saveIncidentsToBackend = useCallback(async (incidentsList) => {
    if (!backendAvailable || incidentsList?.length === 0) return;
    try {
      await safeFetch(`${API_BASE}/api/incidents/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incidentsList),
      });
    } catch {}
  }, [backendAvailable]);

  const saveEventsToBackend = useCallback(async (eventsList) => {
    if (!backendAvailable || eventsList?.length === 0) return;
    try {
      await safeFetch(`${API_BASE}/api/events/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventsList),
      });
    } catch {}
  }, [backendAvailable]);

  const generateReportForIncident = (incidentId) => {
    const incident = incidents.find((i) => i.id === incidentId);
    if (!incident) return null;
    const threat = threats.find((t) => t.id === incident.threat_id);
    if (!threat) return null;

    const report = generateReportFromThreat(incident, threat, events);
    setReports((prev) => {
      const filtered = prev.filter((r) => r.incident_id !== incidentId);
      const next = [report, ...filtered];
      setTimeout(() => saveReportsToBackend(next), 200);
      return next;
    });
    addToast('success', 'Report Generated', `Compiled forensic incident report ${report.id}`);
    if (backendAvailable) {
      setTimeout(async () => {
        try {
          await safeFetch(`${API_BASE}/api/reports`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(report),
          });
        } catch {}
      }, 100);
    }
    return report;
  };

  // Sync data to backend whenever the lists change
  useEffect(() => { if (threats.length) saveThreatsToBackend(threats); }, [threats, saveThreatsToBackend]);
  useEffect(() => { if (incidents.length) saveIncidentsToBackend(incidents); }, [incidents, saveIncidentsToBackend]);
  useEffect(() => { if (events.length) saveEventsToBackend(events); }, [events, saveEventsToBackend]);

  // Initialize: Try to load from DB, check CrewAI status, else demo dataset
  useEffect(() => {
    let cancelled = false;
    const bootstrap = async () => {
      try {
        const health = await safeFetch(`${API_BASE}/api/health`, undefined, 3500);
        const h = await health.json().catch(() => ({}));
        if (health.ok) {
          setBackendAvailable(true);
          const dbStatus = await safeFetch(`${API_BASE}/api/db-status`, undefined, 3500);
          const dbData = await dbStatus.json().catch(() => ({ connected: false }));
          if (dbStatus.ok && dbData.connected) {
            const reports = [];
            const repRes = await safeFetch(`${API_BASE}/api/reports`);
            if (repRes.ok) reports.push(...(await repRes.json().catch(() => [])));
            if (!cancelled && reports.length > 0) setReports(reports);
          }
          try {
            const crewStatus = await safeFetch(`${API_BASE}/api/crewai-status`, undefined, 4000);
            const cs = await crewStatus.json().catch(() => ({}));
            if (!cancelled) {
              setCrewAIStatus({
                configured: Boolean(cs.configured),
                connected: Boolean(cs.connected),
                checked: true,
              });
            }
          } catch {}
        }
      } catch {}
      if (!cancelled) loadDemoDataset();
    };
    bootstrap();
    return () => { cancelled = true; };
  }, []);

  return (
    <SOCContext.Provider
      value={{
        activePage,
        setActivePage,
        selectedThreatId,
        setSelectedThreatId,
        selectedIncidentId,
        setSelectedIncidentId,
        selectedReportId,
        setSelectedReportId,
        events,
        threats,
        incidents,
        reports,
        logAgentState,
        investigationAgentState,
        agentLogs,
        agentMessages,
        isProcessing,
        activeLogPipelineStage,
        settings,
        updateSettings,
        socSettings,
        updateSOCSettings,
        toasts,
        addToast,
        removeToast,
        loadDemoDataset,
        processRawLogs,
        navigateToThreat,
        navigateToIncident,
        navigateToReport,
        createIncidentFromThreat,
        updateIncidentStatus,
        addIncidentNote,
        executeResponseAction,
        generateReportForIncident,
        backendAvailable,
        crewAIStatus,
        runCrewAIPipeline,
        generateCrewAIReport,
      }}
    >
      {children}
    </SOCContext.Provider>
  );
};

export const useSOC = () => {
  const context = useContext(SOCContext);
  if (!context) {
    throw new Error('useSOC must be used within a SOCProvider');
  }
  return context;
};
