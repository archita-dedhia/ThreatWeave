/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type IncidentStatus = 'open' | 'investigating' | 'contained' | 'resolved';
export type ThreatStatus = 'active' | 'investigating' | 'contained' | 'resolved';
export type AgentStatus = 'idle' | 'analyzing' | 'completed' | 'needs_review';

export interface SecurityEvent {
  id: string;
  timestamp: string;
  source_ip: string;
  destination_ip: string;
  user: string;
  event_type: string;
  action: string;
  status: 'SUCCESS' | 'FAILURE' | 'BLOCKED' | 'DETECTED' | 'NORMAL';
  severity: SeverityLevel;
  process?: string;
  command?: string;
  file?: string;
  bytes_transferred?: number;
  raw_log?: string;
  is_suspicious?: boolean;
  suspicious_reasons?: string[];
  mitre_technique?: string;
  mitre_tactic?: string;
}

export interface RiskFactor {
  name: string;
  score: number;
  weight: string;
  description: string;
}

export interface RiskBreakdown {
  base_score: number;
  factors: RiskFactor[];
  justification: string;
}

export type RiskScoreBreakdown = RiskBreakdown;

export interface EvidenceItem {
  id: string;
  title: string;
  event_id: string;
  timestamp: string;
  type: string;
  description: string;
  extracted_value: string;
  source_field: string;
  raw_snippet: string;
  severity: SeverityLevel;
}

export interface AIExplanation {
  what_happened: string;
  why_suspicious: string;
  connected_events: string;
  risk_rationale: string;
  attack_vector_summary: string;
}

export interface ResponseAction {
  id: string;
  category: 'Immediate Actions' | 'Containment Actions' | 'Investigation Actions' | 'Recovery Actions';
  action: string;
  reason: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  target: string;
  status?: 'pending' | 'executed' | 'failed';
  command_snippet?: string;
  is_automated_eligible?: boolean;
}

export interface Threat {
  id: string; // e.g., 'THR-2026-001'
  title: string;
  type: string; // e.g., 'Brute Force Attack & Credential Abuse'
  risk_level: RiskLevel;
  risk_score: number; // 0 - 100
  confidence: number; // percentage e.g., 94
  affected_user: string;
  affected_system: string;
  source: string;
  correlated_event_ids: string[];
  evidence: EvidenceItem[];
  risk_breakdown: RiskBreakdown;
  explanation: AIExplanation;
  recommendations: ResponseAction[];
  status: ThreatStatus;
  detected_at: string;
  mitre_tactics: string[];
}

export interface AnalystNote {
  id: string;
  analyst_name: string;
  author?: string;
  timestamp: string;
  content: string;
  note?: string;
  category?: 'observation' | 'action_taken' | 'forensic_finding' | 'containment_log' | string;
}

export interface Incident {
  id: string; // e.g., 'INC-2026-0841'
  threat_id: string;
  threat_title: string;
  threat_type: string;
  risk_level: RiskLevel;
  status: IncidentStatus;
  assigned_analyst: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  affected_asset: string;
  affected_system?: string;
  affected_user: string;
  summary?: string;
  notes: AnalystNote[];
  executed_actions: string[];
  containment_actions?: ResponseAction[];
}

export interface IncidentReport {
  id: string; // e.g., 'RPT-2026-104'
  incident_id: string;
  threat_id: string;
  threat_title?: string;
  threat_classification: string;
  risk_level: RiskLevel;
  confidence: number;
  affected_user_system: string;
  affected_user?: string;
  affected_system?: string;
  attack_vector?: string;
  detection_time: string;
  generated_at: string;
  generated_by?: string;
  threat_summary: string;
  executive_summary?: string;
  threat_explanation?: {
    non_technical: string;
    technical: string;
  };
  evidence_timeline?: {
    timestamp: string;
    event_type: string;
    source_ip: string;
    destination_ip: string;
    raw_log: string;
  }[];
  response_actions_summary?: string[];
  correlated_timeline: {
    timestamp: string;
    event_type: string;
    source: string;
    user: string;
    action: string;
    severity: string;
    details: string;
  }[];
  evidence_list: EvidenceItem[];
  ai_investigation_explanation: AIExplanation;
  recommended_response: ResponseAction[];
  incident_status: IncidentStatus;
  analyst_signoff: string;
}

export interface AgentRunLog {
  id: string;
  agent_name: 'Log Analysis Agent' | 'Threat Investigation Agent' | 'Orchestrator' | 'Response Engine';
  timestamp: string;
  level: 'info' | 'warn' | 'detection' | 'correlation' | 'success';
  message: string;
  payload?: any;
}

export interface AgentState {
  name: string;
  role: string;
  status: AgentStatus;
  input_summary: string;
  output_summary: string;
  processing_time_ms: number;
  last_active: string;
  model_provider: string;
  current_task: string;
}

export interface AgentMessageBusItem {
  id: string;
  from_agent: string;
  to_agent: string;
  timestamp: string;
  stage: string;
  payload_summary: string;
  data: any;
}

export interface SystemSettings {
  risk_thresholds: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  detection: {
    anomaly_detection: boolean;
    rule_based_detection: boolean;
    ai_investigation: boolean;
    auto_correlation: boolean;
  };
  response: {
    require_analyst_approval: boolean;
    auto_isolate_critical: boolean;
    notify_on_escalation: boolean;
  };
  agents: {
    log_agent_model: string;
    investigation_agent_model: string;
    correlation_window_mins: number;
    confidence_threshold: number;
  };
}

export interface SOCSettings {
  brute_force_threshold: number;
  exfiltration_threshold_mb: number;
  off_hours_start: string;
  off_hours_end: string;
  log_agent_model: string;
  investigation_agent_model: string;
  ai_temperature: number;
  alert_critical: boolean;
  alert_incident_created: boolean;
  auto_correlate: boolean;
  max_batch_size: number;
}

export interface ToastNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  title: string;
  message: string;
  timestamp: string;
}
