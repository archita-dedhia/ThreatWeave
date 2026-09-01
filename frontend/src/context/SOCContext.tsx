import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SecurityEvent,
  Threat,
  Incident,
  IncidentReport,
  AgentState,
  AgentRunLog,
  AgentMessageBusItem,
  SystemSettings,
  ToastNotification,
  IncidentStatus,
} from '../types';
import { CONTROLLED_DEMO_EVENTS } from '../data/demoDataset';
import {
  parseRawLogs,
  runLogAnalysisAgent,
  runThreatInvestigationAgent,
  generateReportFromThreat,
} from '../services/detectionEngine';
import { fetchLogs, fetchThreats } from '../services/apiClient';

interface SOCContextType {
  // State
  events: SecurityEvent[];
  threats: Threat[];
  incidents: Incident[];
  reports: IncidentReport[];
  logAgentState: AgentState;
  investigationAgentState: AgentState;
  agentLogs: AgentRunLog[];
  agentMessages: AgentMessageBusItem[];
  settings: SystemSettings;
  activePage: string;
  selectedThreatId: string | null;
  selectedIncidentId: string | null;
  selectedReportId: string | null;
  searchQuery: string;
  notifications: ToastNotification[];
  isProcessing: boolean;
  processingProgress: number; // 0 - 100
  activeLogPipelineStage: number; // 0 to 5

  // Navigation
  setActivePage: (page: string) => void;
  navigateToThreat: (threatId: string) => void;
  navigateToIncident: (incidentId: string) => void;
  navigateToReport: (reportId: string) => void;
  setSearchQuery: (query: string) => void;

  // Actions
  loadDemoDataset: () => Promise<void>;
  processRawLogs: (rawText: string, format: 'csv' | 'json' | 'txt' | 'auto') => Promise<void>;
  createIncidentFromThreat: (threatId: string, analystName?: string) => Incident | null;
  updateIncidentStatus: (incidentId: string, status: IncidentStatus) => void;
  addAnalystNote: (incidentId: string, content: string, category?: any) => void;
  addIncidentNote: (incidentId: string, content: string, author?: string) => void;
  executeResponseAction: (threatId: string, actionId: string) => void;
  generateReportForIncident: (incidentId: string) => IncidentReport | null;
  deleteReport: (reportId: string) => void;
  clearAllData: () => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  dismissNotification: (id: string) => void;
  addToast: (type: 'info' | 'success' | 'warning' | 'danger', title: string, message: string) => void;
}

const DEFAULT_SETTINGS: SystemSettings = {
  risk_thresholds: {
    low: 30,
    medium: 60,
    high: 80,
    critical: 90,
  },
  detection: {
    anomaly_detection: true,
    rule_based_detection: true,
    ai_investigation: true,
    auto_correlation: true,
  },
  response: {
    require_analyst_approval: true,
    auto_isolate_critical: false,
    notify_on_escalation: true,
  },
  agents: {
    log_agent_model: 'Gemini 2.5 Flash (Deterministic Heuristics + LLM)',
    investigation_agent_model: 'Gemini 2.5 Pro (Attack Graph Reasoner)',
    correlation_window_mins: 30,
    confidence_threshold: 75,
  },
};

const INITIAL_LOG_AGENT: AgentState = {
  name: 'Log Analysis Agent',
  role: 'Log Preprocessing, Ingestion Normalization & Anomaly Detection',
  status: 'idle',
  input_summary: 'Waiting for raw security logs (CSV, JSON, Syslog)',
  output_summary: 'No events parsed yet',
  processing_time_ms: 0,
  last_active: 'Never',
  model_provider: 'UrbanSOC Heuristic Engine v2.6',
  current_task: 'Standing by for log stream ingestion',
};

const INITIAL_INV_AGENT: AgentState = {
  name: 'Threat Investigation Agent',
  role: 'Cross-Event Temporal Correlation, MITRE ATT&CK Mapping & Evidence-Backed Reasoning',
  status: 'idle',
  input_summary: 'Awaiting suspicious events envelope from Log Analysis Agent',
  output_summary: 'No correlated attack chains',
  processing_time_ms: 0,
  last_active: 'Never',
  model_provider: 'UrbanSOC Agentic Reasoner v2.6',
  current_task: 'Standing by for correlation trigger',
};

const SOCContext = createContext<SOCContextType | undefined>(undefined);

export const SOCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<SecurityEvent[]>(() => {
    const saved = localStorage.getItem('urbansoc_events');
    return saved ? JSON.parse(saved) : [];
  });

  const [threats, setThreats] = useState<Threat[]>(() => {
    const saved = localStorage.getItem('urbansoc_threats');
    return saved ? JSON.parse(saved) : [];
  });

  const [incidents, setIncidents] = useState<Incident[]>(() => {
    const saved = localStorage.getItem('urbansoc_incidents');
    return saved ? JSON.parse(saved) : [];
  });

  const [reports, setReports] = useState<IncidentReport[]>(() => {
    const saved = localStorage.getItem('urbansoc_reports');
    return saved ? JSON.parse(saved) : [];
  });

  const [logAgentState, setLogAgentState] = useState<AgentState>(() => {
    const saved = localStorage.getItem('urbansoc_log_agent');
    return saved ? JSON.parse(saved) : INITIAL_LOG_AGENT;
  });

  const [investigationAgentState, setInvestigationAgentState] = useState<AgentState>(() => {
    const saved = localStorage.getItem('urbansoc_inv_agent');
    return saved ? JSON.parse(saved) : INITIAL_INV_AGENT;
  });

  const [agentLogs, setAgentLogs] = useState<AgentRunLog[]>(() => {
    const saved = localStorage.getItem('urbansoc_agent_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [agentMessages, setAgentMessages] = useState<AgentMessageBusItem[]>(() => {
    const saved = localStorage.getItem('urbansoc_agent_msgs');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('urbansoc_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [activePage, setActivePage] = useState<string>('overview');
  const [selectedThreatId, setSelectedThreatId] = useState<string | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [activeLogPipelineStage, setActiveLogPipelineStage] = useState<number>(0);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('urbansoc_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('urbansoc_threats', JSON.stringify(threats));
  }, [threats]);

  useEffect(() => {
    localStorage.setItem('urbansoc_incidents', JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem('urbansoc_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('urbansoc_log_agent', JSON.stringify(logAgentState));
  }, [logAgentState]);

  useEffect(() => {
    localStorage.setItem('urbansoc_inv_agent', JSON.stringify(investigationAgentState));
  }, [investigationAgentState]);

  useEffect(() => {
    localStorage.setItem('urbansoc_agent_logs', JSON.stringify(agentLogs));
  }, [agentLogs]);

  useEffect(() => {
    localStorage.setItem('urbansoc_agent_msgs', JSON.stringify(agentMessages));
  }, [agentMessages]);

  useEffect(() => {
    localStorage.setItem('urbansoc_settings', JSON.stringify(settings));
  }, [settings]);

  const addToast = (type: 'info' | 'success' | 'warning' | 'danger', title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastNotification = {
      id,
      type,
      title,
      message,
      timestamp: new Date().toLocaleTimeString(),
    };
    setNotifications((prev) => [newToast, ...prev.slice(0, 7)]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((t) => t.id !== id));
  };

  const navigateToThreat = (threatId: string) => {
    setSelectedThreatId(threatId);
    setActivePage('threat-detail');
  };

  const navigateToIncident = (incidentId: string) => {
    setSelectedIncidentId(incidentId);
    setActivePage('incident-detail');
  };

  const navigateToReport = (reportId: string) => {
    setSelectedReportId(reportId);
    setActivePage('reports');
  };

  // LOAD CONTROLLED DEMO DATASET (NOW FETCHES FROM FASTAPI BACKEND)
  const loadDemoDataset = async () => {
    setIsProcessing(true);
    setProcessingProgress(15);
    setActiveLogPipelineStage(1);

    addToast('info', 'Live API Connection', 'Fetching data from ThreatWeave Backend...');

    try {
      // 1. Fetch Logs
      setLogAgentState((prev) => ({
        ...prev,
        status: 'analyzing',
        current_task: 'Fetching logs from backend...',
        input_summary: `Connecting to http://127.0.0.1:8000/logs`,
      }));

      const backendLogs = await fetchLogs();
      
      const mappedEvents: SecurityEvent[] = backendLogs.map((log: any, idx: number) => ({
        id: `EVT-${Date.now()}-${idx + 1}`,
        timestamp: log.timestamp || new Date().toISOString(),
        source_ip: log.source_ip || 'unknown',
        destination_ip: log.destination_ip || 'unknown',
        user: log.user || 'system',
        event_type: log.event_type || 'SYSTEM_EVENT',
        action: log.action || 'LOG',
        status: (log.status?.toUpperCase() === 'FAILED' ? 'FAILURE' : 'SUCCESS') as any,
        severity: (log.status?.toUpperCase() === 'FAILED' ? 'high' : 'info') as any,
        process: log.process,
        command: log.command,
        file: log.file,
        bytes_transferred: log.bytes_transferred || 0,
        raw_log: JSON.stringify(log),
        is_suspicious: log.status?.toUpperCase() === 'FAILED'
      }));

      setProcessingProgress(50);
      setActiveLogPipelineStage(3);
      setEvents(mappedEvents);

      setLogAgentState({
        name: 'Backend Log Sync',
        role: 'Data Fetcher',
        status: 'completed',
        input_summary: `Fetched ${mappedEvents.length} events from backend`,
        output_summary: `Logs synced successfully`,
        processing_time_ms: 100,
        last_active: new Date().toLocaleTimeString(),
        model_provider: 'FastAPI Backend',
        current_task: 'Logs fetched',
      });

      // 2. Fetch Threats
      setInvestigationAgentState((prev) => ({
        ...prev,
        status: 'analyzing',
        current_task: 'Fetching threats from backend...',
        input_summary: `Connecting to http://127.0.0.1:8000/threats`,
      }));

      const backendThreats = await fetchThreats();
      
      const mappedThreats: Threat[] = backendThreats.map((bt: any, idx: number) => {
        const threatId = `THR-API-${Date.now()}-${idx + 1}`;
        return {
          id: threatId,
          title: bt.threat_type,
          type: bt.threat_type,
          risk_level: bt.risk_level as any,
          risk_score: bt.risk_score,
          confidence: 90,
          affected_user: bt.log_entry?.user || 'unknown',
          affected_system: bt.log_entry?.destination_ip || 'unknown',
          source: bt.log_entry?.source_ip || 'unknown',
          correlated_event_ids: [],
          evidence: [{
            id: `EVD-${threatId}`,
            title: bt.reason,
            event_id: 'N/A',
            timestamp: bt.log_entry?.timestamp || new Date().toISOString(),
            type: bt.threat_type,
            description: bt.reason,
            extracted_value: JSON.stringify(bt.log_entry),
            source_field: 'API Backend',
            raw_snippet: JSON.stringify(bt.log_entry),
            severity: bt.risk_level.toLowerCase() as any
          }],
          risk_breakdown: {
            base_score: bt.risk_score,
            factors: [{ name: 'Backend Rule Match', score: bt.risk_score, weight: '100%', description: bt.reason }],
            justification: 'Threat detected by FastAPI backend rule engine'
          },
          explanation: {
            what_happened: bt.reason,
            why_suspicious: bt.reason,
            connected_events: 'Identified by backend',
            risk_rationale: 'Backend assigned risk',
            attack_vector_summary: bt.threat_type
          },
          recommendations: [{
            id: `REC-${threatId}`,
            category: 'Investigation Actions',
            action: 'Review backend logs for more details',
            reason: bt.reason,
            priority: 'HIGH',
            target: 'Backend API',
            status: 'pending'
          }],
          status: 'active',
          detected_at: new Date().toISOString(),
          mitre_tactics: []
        };
      });

      setThreats(mappedThreats);
      
      setInvestigationAgentState({
        name: 'Backend Threat Sync',
        role: 'Threat Fetcher',
        status: 'completed',
        input_summary: `Fetched ${mappedThreats.length} threats from backend`,
        output_summary: `Threats synced successfully`,
        processing_time_ms: 100,
        last_active: new Date().toLocaleTimeString(),
        model_provider: 'FastAPI Backend',
        current_task: 'Threats fetched',
      });

      setProcessingProgress(100);
      setActiveLogPipelineStage(5);
      
      addToast('success', 'Backend Data Synced', `Fetched ${mappedEvents.length} logs and ${mappedThreats.length} threats.`);

    } catch (error: any) {
      addToast('danger', 'API Error', `Failed to fetch from backend: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // INGEST CUSTOM RAW LOGS
  const processRawLogs = async (rawText: string, format: 'csv' | 'json' | 'txt' | 'auto') => {
    setIsProcessing(true);
    setProcessingProgress(20);
    setActiveLogPipelineStage(1);

    await new Promise((r) => setTimeout(r, 300));
    const parsedEvents = parseRawLogs(rawText, format);

    if (parsedEvents.length === 0) {
      setIsProcessing(false);
      addToast('warning', 'Parsing Warning', 'No valid log records found in the provided text.');
      return;
    }

    setProcessingProgress(45);
    setActiveLogPipelineStage(2);

    setLogAgentState((prev) => ({
      ...prev,
      status: 'analyzing',
      current_task: `Analyzing ${parsedEvents.length} parsed events...`,
    }));

    await new Promise((r) => setTimeout(r, 400));
    setProcessingProgress(70);
    setActiveLogPipelineStage(3);

    const logResult = runLogAnalysisAgent(parsedEvents, settings);
    setEvents(logResult.enrichedEvents);

    setLogAgentState({
      ...INITIAL_LOG_AGENT,
      status: 'completed',
      input_summary: `Parsed ${parsedEvents.length} records`,
      output_summary: `Detected ${logResult.suspiciousEvents.length} suspicious events`,
      processing_time_ms: logResult.metrics.runtimeMs,
      last_active: new Date().toLocaleTimeString(),
      current_task: 'Processing complete',
    });

    setInvestigationAgentState((prev) => ({
      ...prev,
      status: 'analyzing',
      current_task: 'Correlating suspicious events...',
    }));

    await new Promise((r) => setTimeout(r, 400));
    setProcessingProgress(90);
    setActiveLogPipelineStage(4);

    const invResult = runThreatInvestigationAgent(logResult.suspiciousEvents, logResult.enrichedEvents, settings);
    setThreats(invResult.threats);
    setAgentLogs([...logResult.logs, ...invResult.logs]);
    setAgentMessages(invResult.messages);

    setInvestigationAgentState({
      ...INITIAL_INV_AGENT,
      status: 'completed',
      input_summary: `${logResult.suspiciousEvents.length} suspicious events`,
      output_summary: `${invResult.threats.length} correlated threats generated`,
      processing_time_ms: 42,
      last_active: new Date().toLocaleTimeString(),
      current_task: 'Investigation complete',
    });

    setProcessingProgress(100);
    setActiveLogPipelineStage(5);
    setIsProcessing(false);

    addToast('success', 'Logs Ingested', `Successfully processed ${parsedEvents.length} events and detected ${invResult.threats.length} threats.`);
  };

  // CREATE INCIDENT FROM THREAT
  const createIncidentFromThreat = (threatId: string, analystName = 'Senior SOC Analyst'): Incident | null => {
    const threat = threats.find((t) => t.id === threatId);
    if (!threat) return null;

    // Check if incident already exists
    const existing = incidents.find((i) => i.threat_id === threatId);
    if (existing) {
      addToast('info', 'Incident Exists', `An incident (${existing.id}) is already active for this threat.`);
      setSelectedIncidentId(existing.id);
      setActivePage('incident-detail');
      return existing;
    }

    const newIncidentId = `INC-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const newIncident: Incident = {
      id: newIncidentId,
      threat_id: threat.id,
      threat_title: threat.title,
      threat_type: threat.type,
      risk_level: threat.risk_level,
      status: 'open',
      assigned_analyst: analystName,
      assigned_to: analystName,
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      updated_at: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      affected_asset: threat.affected_system,
      affected_system: threat.affected_system,
      affected_user: threat.affected_user,
      summary: threat.explanation.what_happened,
      containment_actions: threat.recommendations,
      notes: [
        {
          id: `NOTE-${Date.now()}-1`,
          analyst_name: 'UrbanSOC AI Bot',
          author: 'UrbanSOC AI Bot',
          timestamp: new Date().toLocaleTimeString(),
          content: `Incident initialized from Threat ${threat.id} (${threat.title}). Risk score: ${threat.risk_score}/100. Confidence: ${threat.confidence}%.`,
          note: `Incident initialized from Threat ${threat.id} (${threat.title}). Risk score: ${threat.risk_score}/100. Confidence: ${threat.confidence}%.`,
          category: 'observation',
        },
      ],
      executed_actions: [],
    };

    setIncidents((prev) => [newIncident, ...prev]);

    // Update threat status
    setThreats((prev) =>
      prev.map((t) => (t.id === threatId ? { ...t, status: 'investigating', associated_incident_id: newIncidentId } : t))
    );

    addToast('success', 'Incident Created', `Case ${newIncidentId} opened for ${threat.title}. Assigned to ${analystName}.`);

    setSelectedIncidentId(newIncidentId);
    return newIncident;
  };

  // UPDATE INCIDENT STATUS
  const updateIncidentStatus = (incidentId: string, status: IncidentStatus) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          const updatedNote = {
            id: `NOTE-${Date.now()}`,
            analyst_name: 'Lead SOC Analyst',
            author: 'Lead SOC Analyst',
            timestamp: new Date().toLocaleTimeString(),
            content: `Incident status updated to ${status.toUpperCase()}`,
            note: `Incident status updated to ${status.toUpperCase()}`,
            category: 'action_taken' as const,
          };
          return {
            ...inc,
            status,
            updated_at: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
            notes: [updatedNote, ...inc.notes],
          };
        }
        return inc;
      })
    );

    addToast('info', 'Status Updated', `Incident ${incidentId} marked as ${status.toUpperCase()}.`);
  };

  // ADD ANALYST NOTE
  const addAnalystNote = (incidentId: string, content: string, category: any = 'observation') => {
    if (!content.trim()) return;
    const newNote = {
      id: `NOTE-${Date.now()}`,
      analyst_name: 'Lead SOC Analyst',
      author: 'Lead SOC Analyst',
      timestamp: new Date().toLocaleTimeString(),
      content: content.trim(),
      note: content.trim(),
      category,
    };

    setIncidents((prev) =>
      prev.map((inc) => (inc.id === incidentId ? { ...inc, notes: [newNote, ...inc.notes] } : inc))
    );

    addToast('success', 'Note Added', 'Analyst observation logged in case file.');
  };

  const addIncidentNote = (incidentId: string, content: string, author = 'Lead SOC Analyst') => {
    if (!content.trim()) return;
    const newNote = {
      id: `NOTE-${Date.now()}`,
      analyst_name: author,
      author: author,
      timestamp: new Date().toLocaleTimeString(),
      content: content.trim(),
      note: content.trim(),
      category: 'observation' as const,
    };

    setIncidents((prev) =>
      prev.map((inc) => (inc.id === incidentId ? { ...inc, notes: [newNote, ...inc.notes] } : inc))
    );

    addToast('success', 'Note Added', 'Analyst observation logged in case file.');
  };

  // EXECUTE RESPONSE ACTION
  const executeResponseAction = (threatId: string, actionId: string) => {
    setThreats((prev) =>
      prev.map((t) => {
        if (t.id === threatId) {
          const updatedRecs = t.recommendations.map((rec) =>
            rec.id === actionId ? { ...rec, status: 'executed' as const } : rec
          );
          return { ...t, recommendations: updatedRecs };
        }
        return t;
      })
    );

    const targetThreat = threats.find((t) => t.id === threatId);
    const targetAction = targetThreat?.recommendations.find((r) => r.id === actionId);

    if (targetThreat && targetThreat.associated_incident_id && targetAction) {
      setIncidents((prev) =>
        prev.map((inc) => {
          if (inc.id === targetThreat.associated_incident_id) {
            const execNote = {
              id: `NOTE-${Date.now()}`,
              analyst_name: 'UrbanSOC Response Engine',
              timestamp: new Date().toLocaleTimeString(),
              content: `Defensive action executed: "${targetAction.action}" on target [${targetAction.target}]. Reason: ${targetAction.reason}`,
              category: 'containment_log' as const,
            };
            return {
              ...inc,
              executed_actions: [...inc.executed_actions, targetAction.action],
              notes: [execNote, ...inc.notes],
            };
          }
          return inc;
        })
      );
    }

    addToast('success', 'Action Executed', `Defensive containment action applied: "${targetAction?.action || actionId}"`);
  };

  // GENERATE FORMAL INCIDENT REPORT
  const generateReportForIncident = (incidentId: string): IncidentReport | null => {
    const incident = incidents.find((i) => i.id === incidentId);
    if (!incident) return null;

    const threat = threats.find((t) => t.id === incident.threat_id);
    if (!threat) return null;

    const newReport = generateReportFromThreat(incident, threat, events);
    setReports((prev) => [newReport, ...prev]);

    addToast('success', 'Report Generated', `Formal report ${newReport.id} created for ${incident.id}.`);
    setSelectedReportId(newReport.id);
    return newReport;
  };

  // DELETE REPORT
  const deleteReport = (reportId: string) => {
    setReports((prev) => prev.filter((r) => r.id !== reportId));
    if (selectedReportId === reportId) setSelectedReportId(null);
    addToast('info', 'Report Removed', `Report ${reportId} deleted from local repository.`);
  };

  // CLEAR ALL DATA
  const clearAllData = () => {
    setEvents([]);
    setThreats([]);
    setIncidents([]);
    setReports([]);
    setLogAgentState(INITIAL_LOG_AGENT);
    setInvestigationAgentState(INITIAL_INV_AGENT);
    setAgentLogs([]);
    setAgentMessages([]);
    setSelectedThreatId(null);
    setSelectedIncidentId(null);
    setSelectedReportId(null);
    setActivePage('overview');
    localStorage.clear();
    addToast('info', 'Workspace Reset', 'All security events, threats, incidents, and reports cleared.');
  };

  // UPDATE SETTINGS
  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
      risk_thresholds: { ...prev.risk_thresholds, ...(newSettings.risk_thresholds || {}) },
      detection: { ...prev.detection, ...(newSettings.detection || {}) },
      response: { ...prev.response, ...(newSettings.response || {}) },
      agents: { ...prev.agents, ...(newSettings.agents || {}) },
    }));
    addToast('success', 'Settings Saved', 'System configurations updated.');
  };

  return (
    <SOCContext.Provider
      value={{
        events,
        threats,
        incidents,
        reports,
        logAgentState,
        investigationAgentState,
        agentLogs,
        agentMessages,
        settings,
        activePage,
        selectedThreatId,
        selectedIncidentId,
        selectedReportId,
        searchQuery,
        notifications,
        isProcessing,
        processingProgress,
        activeLogPipelineStage,
        setActivePage,
        navigateToThreat,
        navigateToIncident,
        navigateToReport,
        setSearchQuery,
        loadDemoDataset,
        processRawLogs,
        createIncidentFromThreat,
        updateIncidentStatus,
        addAnalystNote,
        addIncidentNote,
        executeResponseAction,
        generateReportForIncident,
        deleteReport,
        clearAllData,
        updateSettings,
        dismissNotification,
        addToast,
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
