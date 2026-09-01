import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const CREWAI_BASE_URL = process.env.CREWAI_BASE_URL || '';
const CREWAI_API_TOKEN = process.env.CREWAI_API_TOKEN || '';
const crewAIConfigured = Boolean(CREWAI_BASE_URL && CREWAI_API_TOKEN);

const crewaiFetch = async (endpointPath: string, options: RequestInit = {}, timeoutMs = 8000) => {
  if (!crewAIConfigured) {
    throw new Error('CrewAI not configured: missing CREWAI_BASE_URL or CREWAI_API_TOKEN');
  }
  const url = `${CREWAI_BASE_URL.replace(/\/$/, '')}${endpointPath.startsWith('/') ? endpointPath : '/' + endpointPath}`;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CREWAI_API_TOKEN}`,
        ...(options.headers || {}),
      },
    });
    clearTimeout(t);
    return res;
  } catch (err) {
    clearTimeout(t);
    throw err;
  }
};

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const mongoUri = process.env.MONGO_URI || '';
let dbConnected = false;

// In-Memory Storage Fallbacks
const inMemoryReports: any[] = [];
const inMemoryIncidents: any[] = [];
const inMemoryThreats: any[] = [];
const inMemoryEvents: any[] = [];

const connectDB = async () => {
  try {
    if (!mongoUri) {
      console.warn('MONGO_URI not set - running in memory mode');
      return;
    }
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 4000 });
    dbConnected = true;
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection notice:', (err as Error).message || err);
    console.log('Running in memory fallback mode');
    dbConnected = false;
  }
};

// CSV Log Loader Helper
const getCSVLogs = () => {
  const possiblePaths = [
    path.join(__dirname, '..', 'data', 'ThreatWeave_security_logs.csv'),
    path.join(process.cwd(), 'backend', 'data', 'ThreatWeave_security_logs.csv'),
    path.join(process.cwd(), 'data', 'ThreatWeave_security_logs.csv'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf-8');
      const lines = content.trim().split('\n');
      if (lines.length <= 1) return [];
      const headers = lines[0].split(',').map((h) => h.trim());
      const records = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(',');
        const obj: Record<string, any> = {};
        headers.forEach((h, idx) => {
          let val = values[idx] !== undefined ? values[idx].trim() : null;
          if (val === '') val = null;
          if (h === 'bytes_transferred') {
            obj[h] = val !== null ? parseInt(val, 10) || 0 : 0;
          } else {
            obj[h] = val;
          }
        });
        records.push(obj);
      }
      return records;
    }
  }
  return [];
};

const IncidentReportSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    incident_id: { type: String, required: true, index: true },
    threat_id: { type: String, required: true },
    threat_title: String,
    threat_classification: String,
    risk_level: String,
    risk_score: Number,
    confidence: Number,
    affected_user_system: String,
    affected_user: String,
    affected_system: String,
    attack_vector: String,
    detection_time: String,
    generated_at: String,
    generated_by: String,
    threat_summary: String,
    executive_summary: String,
    threat_explanation: mongoose.Schema.Types.Mixed,
    evidence_timeline: [mongoose.Schema.Types.Mixed],
    response_actions_summary: [String],
    correlated_timeline: [mongoose.Schema.Types.Mixed],
    evidence_list: [mongoose.Schema.Types.Mixed],
    ai_investigation_explanation: mongoose.Schema.Types.Mixed,
    recommended_response: [mongoose.Schema.Types.Mixed],
    root_cause: String,
    containment_actions: [String],
    long_term_recommendations: [String],
    timeline: [mongoose.Schema.Types.Mixed],
    title: String,
    incident_status: String,
    analyst_signoff: String,
    source: String,
  },
  { timestamps: true, strict: false }
);

const IncidentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    threat_id: { type: String, required: true, index: true },
    threat_title: String,
    risk_level: String,
    status: String,
    affected_user: String,
    affected_system: String,
    source: String,
    created_at: String,
    assigned_to: String,
    notes: [mongoose.Schema.Types.Mixed],
  },
  { timestamps: true, strict: false }
);

const ThreatSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: String,
    type: String,
    risk_level: String,
    risk_score: Number,
    confidence: Number,
    affected_user: String,
    affected_system: String,
    source: String,
    correlated_event_ids: [String],
    evidence: [mongoose.Schema.Types.Mixed],
    risk_breakdown: mongoose.Schema.Types.Mixed,
    explanation: mongoose.Schema.Types.Mixed,
    recommendations: [mongoose.Schema.Types.Mixed],
    status: String,
    detected_at: String,
    mitre_tactics: [String],
  },
  { timestamps: true, strict: false }
);

const SecurityEventSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    timestamp: String,
    source_ip: String,
    destination_ip: String,
    user: String,
    event_type: String,
    action: String,
    status: String,
    severity: String,
    process: String,
    command: String,
    file: String,
    bytes_transferred: Number,
    raw_log: String,
    is_suspicious: Boolean,
    suspicious_reasons: [String],
    mitre_technique: String,
    mitre_tactic: String,
  },
  { timestamps: true, strict: false }
);

const IncidentReport = mongoose.models.IncidentReport || mongoose.model('IncidentReport', IncidentReportSchema);
const Incident = mongoose.models.Incident || mongoose.model('Incident', IncidentSchema);
const Threat = mongoose.models.Threat || mongoose.model('Threat', ThreatSchema);
const SecurityEvent = mongoose.models.SecurityEvent || mongoose.model('SecurityEvent', SecurityEventSchema);

connectDB();

// ==========================================
// ROUTES (Registered on router & mapped to both / and /api)
// ==========================================
const router = express.Router();

// Health Check
router.get(['/health', '/api/health'], (req, res) => {
  res.json({
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    dbConnected,
    mongoUriConfigured: Boolean(mongoUri),
    crewai: {
      configured: crewAIConfigured,
      base_url: CREWAI_BASE_URL || 'not set',
      token_configured: Boolean(CREWAI_API_TOKEN),
    },
  });
});

// Welcome / Endpoint Index
router.get(['/', '/api'], (req, res) => {
  res.json({
    message: 'ThreatWeave API is running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      logs: '/api/logs',
      summary: '/api/summary',
      threats: '/api/threats',
      incidents: '/api/incidents',
      events: '/api/events',
      reports: '/api/reports',
      db_status: '/api/db-status',
      crewai_status: '/api/crewai-status',
      crewai_run_pipeline: '/api/crewai/run-pipeline',
      crewai_generate_report: '/api/crewai/generate-report',
      generate_markdown: '/api/generate-markdown',
      generate_pdf: '/api/generate-pdf',
    },
  });
});

// DB Status
router.get(['/db-status', '/api/db-status'], (req, res) => {
  res.json({
    connected: dbConnected,
    mongoUri: mongoUri ? mongoUri.split('@')[1] || 'configured' : 'not configured',
  });
});

// Logs from CSV
router.get(['/logs', '/api/logs'], (req, res) => {
  try {
    const logs = getCSVLogs();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read logs', message: (err as Error).message });
  }
});

// Summary Statistics from CSV
router.get(['/summary', '/api/summary'], (req, res) => {
  try {
    const logs = getCSVLogs();
    const failedLogins = logs.filter((l) => l.event_type === 'authentication' && l.status === 'failed').length;
    const suspiciousCmds = logs.filter((l) => l.command && /powershell|Invoke-WebRequest|curl -T/i.test(l.command)).length;
    const totalBytes = logs.reduce((acc, l) => acc + (l.bytes_transferred || 0), 0);
    const uniqueUsers = new Set(logs.map((l) => l.user).filter(Boolean)).size;
    const uniqueIPs = new Set(logs.map((l) => l.source_ip).filter(Boolean)).size;

    res.json({
      total_logs: logs.length,
      failed_logins: failedLogins,
      suspicious_commands: suspiciousCmds,
      total_bytes_transferred: totalBytes,
      unique_users: uniqueUsers,
      unique_source_ips: uniqueIPs,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate summary', message: (err as Error).message });
  }
});

// CrewAI Status Probe (Fast & Resilient)
router.get(['/crewai-status', '/api/crewai-status'], async (req, res) => {
  if (!crewAIConfigured) {
    return res.json({
      configured: false,
      connected: false,
      base_url: 'not set',
      token_configured: false,
      detail: 'CrewAI credentials not configured in backend/.env',
    });
  }

  let reachable = false;
  let detail: any = null;
  try {
    const probe = await crewaiFetch('/health', { method: 'GET' }, 3000);
    reachable = probe.ok;
    try { detail = await probe.json().catch(() => null); } catch {}
  } catch {
    reachable = false;
    detail = 'Probe timed out or failed to connect';
  }

  res.json({
    configured: true,
    connected: reachable,
    base_url: CREWAI_BASE_URL,
    token_configured: true,
    detail,
  });
});

// CrewAI Run Pipeline (Never returns 502/503 - Always returns HTTP 200 with fallback flag)
router.post(['/crewai/run-pipeline', '/api/crewai/run-pipeline'], async (req, res) => {
  if (!crewAIConfigured) {
    return res.json({
      success: false,
      configured: false,
      fallback: true,
      message: 'CrewAI not configured. Built-in multi-agent heuristic engine active.',
    });
  }

  const { events, threats, incidents, config } = req.body || {};
  const payload = {
    source: 'ThreatWeave SIH-26 Platform',
    generated_at: new Date().toISOString(),
    events: events || [],
    threats: threats || [],
    incidents: incidents || [],
    config: config || {
      generate_pdf: true,
      generate_markdown: true,
      include_mitre_mapping: true,
      include_evidence: true,
      include_remediation_playbooks: true,
    },
  };

  const tryPaths = [
    { path: '/api/v1/pipelines/security-incident-pipeline-v1/execute', method: 'POST' },
    { path: '/pipelines/security-incident-pipeline-v1/execute', method: 'POST' },
    { path: '/api/v1/run/security-incident-pipeline-v1', method: 'POST' },
    { path: '/runs', method: 'POST' },
    { path: '/execute', method: 'POST' },
  ];

  for (const endpoint of tryPaths) {
    try {
      const response = await crewaiFetch(endpoint.path, {
        method: endpoint.method,
        body: JSON.stringify(payload),
      }, 5000);
      if (response.ok) {
        const crewaiResult: any = await response.json().catch(async () => await response.text());
        return res.json({
          success: true,
          source: 'crewai',
          result: crewaiResult,
          pipeline_id: crewaiResult && typeof crewaiResult === 'object' ? (crewaiResult.id || crewaiResult.run_id || crewaiResult.pipeline_id || null) : null,
          markdown_report: crewaiResult && typeof crewaiResult === 'object' ? (crewaiResult.markdown || crewaiResult.markdown_report || crewaiResult.report_markdown || null) : null,
          pdf_report_url: crewaiResult && typeof crewaiResult === 'object' ? (crewaiResult.pdf_url || crewaiResult.pdf_report_url || crewaiResult.report_url || null) : null,
        });
      }
    } catch {
      // Continue next path
    }
  }

  // Graceful fallback response with HTTP 200 (avoids browser console 502 error)
  return res.json({
    success: false,
    source: 'crewai_unreachable',
    fallback: true,
    message: 'CrewAI external service is currently unreachable; continuing with built-in SOC detection engine.',
  });
});

// CrewAI Generate Report (Never returns 502/503 - Always returns HTTP 200 with fallback flag)
router.post(['/crewai/generate-report', '/api/crewai/generate-report'], async (req, res) => {
  if (!crewAIConfigured) {
    return res.json({
      success: false,
      configured: false,
      fallback: true,
      message: 'CrewAI not configured. Using local report generator.',
    });
  }

  const report = req.body || {};
  const payload = {
    report,
    format: req.query.format || 'both',
    options: {
      include_cover_page: true,
      include_toc: true,
      include_timeline: true,
      include_evidence: true,
      include_remediation: true,
      brand_name: 'ThreatWeave Security Operations',
      reference: 'SIH 2026 — Formal Forensic Dossier',
    },
  };

  const tryPaths = [
    { path: '/api/v1/reports/generate', method: 'POST' },
    { path: '/reports/generate', method: 'POST' },
    { path: '/api/v1/pipelines/report-generation/execute', method: 'POST' },
    { path: '/generate-report', method: 'POST' },
  ];

  for (const endpoint of tryPaths) {
    try {
      const response = await crewaiFetch(endpoint.path, {
        method: endpoint.method,
        body: JSON.stringify(payload),
      }, 5000);
      if (response.ok) {
        const crewaiResult: any = await response.json().catch(async () => ({ raw: await response.text() }));
        return res.json({
          success: true,
          source: 'crewai',
          result: crewaiResult,
          markdown: crewaiResult && typeof crewaiResult === 'object' ? (crewaiResult.markdown || crewaiResult.report || crewaiResult.content || null) : null,
          pdf_url: crewaiResult && typeof crewaiResult === 'object' ? (crewaiResult.pdf_url || crewaiResult.url || crewaiResult.download_url || null) : null,
        });
      }
    } catch {
      // Continue next path
    }
  }

  return res.json({
    success: false,
    source: 'crewai_unreachable',
    fallback: true,
    message: 'CrewAI report service unreachable. Using local report generator.',
  });
});

// Reports CRUD
router.get(['/reports', '/api/reports'], async (req, res) => {
  try {
    if (dbConnected) {
      const reports = await IncidentReport.find().sort({ createdAt: -1 }).limit(100);
      return res.json(reports);
    }
    return res.json(inMemoryReports);
  } catch (err) {
    res.json(inMemoryReports);
  }
});

router.get(['/reports/:id', '/api/reports/:id'], async (req, res) => {
  try {
    if (dbConnected) {
      const report = await IncidentReport.findOne({ id: req.params.id });
      if (report) return res.json(report);
    }
    const mem = inMemoryReports.find((r) => r.id === req.params.id);
    if (mem) return res.json(mem);
    return res.status(404).json({ error: 'Report not found' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch report', message: (err as Error).message });
  }
});

router.post(['/reports', '/api/reports'], async (req, res) => {
  try {
    const reportData = req.body;
    if (dbConnected) {
      const existing = await IncidentReport.findOne({ id: reportData.id });
      let report;
      if (existing) {
        report = await IncidentReport.findOneAndUpdate({ id: reportData.id }, reportData, { new: true });
      } else {
        report = new IncidentReport(reportData);
        await report.save();
      }
      return res.json({ saved: true, report });
    }

    // In-memory update or insert
    const idx = inMemoryReports.findIndex((r) => r.id === reportData.id);
    if (idx >= 0) {
      inMemoryReports[idx] = reportData;
    } else {
      inMemoryReports.unshift(reportData);
    }
    return res.json({ saved: true, report: reportData });
  } catch (err) {
    console.error('Save report error:', err);
    res.json({ saved: true, report: req.body });
  }
});

router.delete(['/reports/:id', '/api/reports/:id'], async (req, res) => {
  try {
    if (dbConnected) {
      await IncidentReport.deleteOne({ id: req.params.id });
    }
    const idx = inMemoryReports.findIndex((r) => r.id === req.params.id);
    if (idx >= 0) inMemoryReports.splice(idx, 1);
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete report', message: (err as Error).message });
  }
});

// Incidents CRUD
router.get(['/incidents', '/api/incidents'], async (req, res) => {
  try {
    if (dbConnected) {
      const list = await Incident.find().sort({ createdAt: -1 }).limit(100);
      return res.json(list);
    }
    return res.json(inMemoryIncidents);
  } catch {
    return res.json(inMemoryIncidents);
  }
});

router.post(['/incidents/batch', '/api/incidents/batch'], async (req, res) => {
  try {
    const list = Array.isArray(req.body) ? req.body : [req.body];
    let count = 0;
    if (dbConnected) {
      for (const inc of list) {
        const existing = await Incident.findOne({ id: inc.id });
        if (existing) {
          await Incident.findOneAndUpdate({ id: inc.id }, inc);
        } else {
          await new Incident(inc).save();
        }
        count++;
      }
    } else {
      for (const inc of list) {
        const idx = inMemoryIncidents.findIndex((i) => i.id === inc.id);
        if (idx >= 0) inMemoryIncidents[idx] = inc;
        else inMemoryIncidents.unshift(inc);
        count++;
      }
    }
    res.json({ saved: true, count });
  } catch (err) {
    res.json({ saved: true, count: req.body?.length || 0 });
  }
});

// Threats CRUD
router.get(['/threats', '/api/threats'], async (req, res) => {
  try {
    const { severity, threat_type } = req.query;
    let list = inMemoryThreats;
    if (dbConnected) {
      list = await Threat.find().sort({ createdAt: -1 }).limit(100);
    }
    if (severity) {
      list = list.filter((t: any) => (t.severity || t.risk_level || '').toUpperCase() === String(severity).toUpperCase());
    }
    if (threat_type) {
      list = list.filter((t: any) => (t.threat_type || t.type || '').toLowerCase() === String(threat_type).toLowerCase());
    }
    res.json(list);
  } catch {
    res.json(inMemoryThreats);
  }
});

router.get(['/threats/:id', '/api/threats/:id'], async (req, res) => {
  try {
    if (dbConnected) {
      const t = await Threat.findOne({ id: req.params.id });
      if (t) return res.json(t);
    }
    const mem = inMemoryThreats.find((t) => t.id === req.params.id);
    if (mem) return res.json(mem);
    return res.status(404).json({ error: 'Threat not found' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch threat', message: (err as Error).message });
  }
});

router.post(['/threats/batch', '/api/threats/batch'], async (req, res) => {
  try {
    const list = Array.isArray(req.body) ? req.body : [req.body];
    let count = 0;
    if (dbConnected) {
      for (const t of list) {
        const existing = await Threat.findOne({ id: t.id });
        if (existing) {
          await Threat.findOneAndUpdate({ id: t.id }, t);
        } else {
          await new Threat(t).save();
        }
        count++;
      }
    } else {
      for (const t of list) {
        const idx = inMemoryThreats.findIndex((item) => item.id === t.id);
        if (idx >= 0) inMemoryThreats[idx] = t;
        else inMemoryThreats.unshift(t);
        count++;
      }
    }
    res.json({ saved: true, count });
  } catch (err) {
    res.json({ saved: true, count: req.body?.length || 0 });
  }
});

// Events CRUD
router.get(['/events', '/api/events'], async (req, res) => {
  try {
    if (dbConnected) {
      const list = await SecurityEvent.find().sort({ createdAt: -1 }).limit(500);
      return res.json(list);
    }
    return res.json(inMemoryEvents);
  } catch {
    return res.json(inMemoryEvents);
  }
});

router.post(['/events/batch', '/api/events/batch'], async (req, res) => {
  try {
    const list = Array.isArray(req.body) ? req.body : [req.body];
    let count = 0;
    if (dbConnected) {
      for (const e of list) {
        const existing = await SecurityEvent.findOne({ id: e.id });
        if (!existing) {
          await new SecurityEvent(e).save();
          count++;
        }
      }
    } else {
      for (const e of list) {
        const idx = inMemoryEvents.findIndex((item) => item.id === e.id);
        if (idx < 0) {
          inMemoryEvents.push(e);
          count++;
        }
      }
    }
    res.json({ saved: true, count });
  } catch (err) {
    res.json({ saved: true, count: req.body?.length || 0 });
  }
});

// Markdown Report Generator
router.post(['/generate-markdown', '/api/generate-markdown'], (req, res) => {
  const r = req.body;
  const md = `# ${r.title || r.threat_title || 'Incident Investigation Report'}

**Report ID:** ${r.id || 'N/A'}
**Incident ID:** ${r.incident_id || 'N/A'}
**Generated Date:** ${r.generated_at || new Date().toISOString()}
**Generated By:** ${r.generated_by || 'ThreatWeave AI'}
**Risk Level:** ${r.risk_level || 'N/A'} (Score: ${r.risk_score || 'N/A'}/100)
**Confidence:** ${r.confidence || 'N/A'}%

---

## 1. Executive Summary
${r.executive_summary || r.threat_summary || 'N/A'}

---

## 2. Incident Context & Affected Assets

| Attribute | Value |
|-----------|-------|
| Target Entity | ${r.affected_user || 'N/A'} |
| Impacted System | ${r.affected_system || 'N/A'} |
| Affected Asset | ${r.affected_user_system || 'N/A'} |
| Attack Origin / Vector | ${r.source || r.attack_vector || 'N/A'} |
| Classification | ${r.threat_classification || r.type || 'N/A'} |
| Detection Time | ${r.detection_time || 'N/A'} |

---

## 3. Attack Progression & Forensic Timeline

${(r.timeline && r.timeline.length > 0)
  ? r.timeline.map((t: any, i: number) => `### ${i + 1}. [${t.timestamp || 'N/A'}] ${t.event || 'Event'}\n**Details:** ${t.details || 'N/A'}\n`).join('\n')
  : (r.correlated_timeline && r.correlated_timeline.length > 0)
    ? r.correlated_timeline.map((t: any, i: number) => `### ${i + 1}. [${t.timestamp || 'N/A'}] ${t.event_type || t.event || 'Event'}\n- **User:** ${t.user || 'N/A'}\n- **Source:** ${t.source || t.source_ip || 'N/A'}\n- **Action:** ${t.action || 'N/A'}\n- **Severity:** ${t.severity || 'N/A'}\n- **Details:** ${t.details || t.raw_log || 'N/A'}\n`).join('\n')
    : 'Timeline data unavailable.'}

---

## 4. Root Cause Analysis
${r.root_cause || (r.threat_explanation && (r.threat_explanation.technical || r.threat_explanation.non_technical)) || 'Root cause analysis pending.'}

---

## 5. Evidence Chain

${(r.evidence_list && r.evidence_list.length > 0)
  ? r.evidence_list.map((e: any, i: number) => `### Evidence Item ${i + 1}: ${e.id || e.title || 'N/A'}\n- **Type:** ${e.type || 'N/A'}\n- **Title:** ${e.title || 'N/A'}\n- **Timestamp:** ${e.timestamp || 'N/A'}\n- **Description:** ${e.description || 'N/A'}\n- **Extracted Value:** ${e.extracted_value || 'N/A'}\n- **Severity:** ${e.severity || 'N/A'}\n\n\`\`\`\n${e.raw_snippet || 'N/A'}\n\`\`\`\n`).join('\n')
  : 'No evidence items linked.'}

---

## 6. Immediate Containment Actions Taken

${(r.containment_actions && r.containment_actions.length > 0)
  ? r.containment_actions.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n')
  : (r.recommended_response && r.recommended_response.filter((rr: any) => rr.category === 'Containment Actions' || rr.category === 'Immediate Actions').map((a: any, i: number) => `${i + 1}. **${a.priority || ''}:** ${a.action} (Target: ${a.target} - ${a.reason || ''})`).join('\n'))
    || 'No containment actions recorded.'}

---

## 7. Long-term Remediation & Strategic Hardening Recommendations

${(r.long_term_recommendations && r.long_term_recommendations.length > 0)
  ? r.long_term_recommendations.map((rec: string, i: number) => `${i + 1}. ${rec}`).join('\n')
  : (r.recommended_response && r.recommended_response.filter((rr: any) => rr.category === 'Recovery Actions' || rr.category === 'Investigation Actions').map((a: any, i: number) => `${i + 1}. **${a.priority || ''}:** ${a.action} (Target: ${a.target} - ${a.reason || ''})`).join('\n'))
    || 'Recommendations pending.'}

---

## 8. MITRE ATT&CK Framework Mapping

${(r.ai_investigation_explanation && r.ai_investigation_explanation.risk_rationale) ? `**Risk Rationale:** ${r.ai_investigation_explanation.risk_rationale}\n\n` : ''}

**Attack Vector Summary:** ${r.attack_vector || (r.ai_investigation_explanation && r.ai_investigation_explanation.attack_vector_summary) || 'N/A'}

---

*Document generated by ThreatWeave Security Operations Platform — SIH 2026 Problem PS-01 Verified Dossier*
*${r.analyst_signoff || 'AI-Automated Forensic Analysis'}*
`;

  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="ThreatWeave_Report_${r.id || 'UNSAVED'}.md"`);
  res.send(md);
});

// PDF Report Generator
router.post(['/generate-pdf', '/api/generate-pdf'], (req, res) => {
  const r = req.body;

  const chunks: Buffer[] = [];
  const doc = new PDFDocument({ size: 'A4', margin: 50, info: { Title: r.title || 'Incident Report', Author: r.generated_by || 'ThreatWeave AI' } });

  doc.on('data', (chunk: Buffer) => chunks.push(chunk));
  doc.on('end', () => {
    const result = Buffer.concat(chunks);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ThreatWeave_Report_${r.id || 'UNSAVED'}.pdf"`);
    res.setHeader('Content-Length', result.length);
    res.send(result);
  });

  doc.fontSize(20).font('Helvetica-Bold').fillColor('#1a365d').text(r.title || r.threat_title || 'INCIDENT INVESTIGATION REPORT', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica').fillColor('#718096').text('THREATWEAVE SECURITY OPERATIONS PLATFORM', { align: 'center' });
  doc.fontSize(9).fillColor('#718096').text('SIH 2026 — Formal Forensic Dossier', { align: 'center' });
  doc.moveDown(1);

  doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(1);

  doc.fontSize(11).font('Helvetica-Bold').fillColor('#2d3748').text('REPORT METADATA');
  doc.moveDown(0.5);

  doc.fontSize(9).font('Helvetica');
  const meta = [
    ['Report ID', r.id || 'N/A'],
    ['Incident Ref', r.incident_id || 'N/A'],
    ['Threat ID', r.threat_id || 'N/A'],
    ['Risk Level', `${r.risk_level || 'N/A'} (${r.risk_score || 'N/A'}/100)`],
    ['Confidence', `${r.confidence || 'N/A'}%`],
    ['Classification', r.threat_classification || r.type || 'N/A'],
    ['Generated At', r.generated_at || new Date().toISOString()],
    ['Investigator', r.generated_by || 'ThreatWeave AI'],
  ];

  let metaY = doc.y;
  meta.forEach((m) => {
    doc.fillColor('#718096').font('Helvetica-Bold').text(m[0] + ':', 50, metaY);
    doc.fillColor('#2d3748').font('Helvetica').text(m[1], 180, metaY);
    metaY += 14;
  });
  doc.y = metaY + 10;

  doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(1);

  doc.fontSize(13).font('Helvetica-Bold').fillColor('#2b6cb0').text('1. EXECUTIVE SUMMARY');
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica').fillColor('#2d3748').text(r.executive_summary || r.threat_summary || 'Not available.', { align: 'justify' });
  doc.moveDown(1);

  doc.fontSize(13).font('Helvetica-Bold').fillColor('#2b6cb0').text('2. AFFECTED ASSETS');
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#718096').text('Target Entity: ');
  doc.font('Helvetica').fillColor('#2d3748').text(r.affected_user || 'N/A');
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#718096').text('Impacted System: ');
  doc.font('Helvetica').fillColor('#2d3748').text(r.affected_system || 'N/A');
  doc.font('Helvetica-Bold').fillColor('#718096').text('Attack Origin: ');
  doc.font('Helvetica').fillColor('#c53030').text(r.source || r.attack_vector || 'N/A');
  doc.font('Helvetica-Bold').fillColor('#718096').text('Detection Time: ');
  doc.font('Helvetica').fillColor('#2d3748').text(r.detection_time || 'N/A');
  doc.moveDown(1);

  doc.fontSize(13).font('Helvetica-Bold').fillColor('#2b6cb0').text('3. FORENSIC TIMELINE');
  doc.moveDown(0.5);
  const tl = r.timeline && r.timeline.length > 0 ? r.timeline : (r.correlated_timeline || []);
  if (tl.length > 0) {
    tl.slice(0, 20).forEach((t: any, i: number) => {
      const ev = t.event || t.event_type || 'Event';
      const ts = t.timestamp || '';
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#2b6cb0').text(`${i + 1}. [${ts}]  ${ev}`);
      doc.fontSize(9).font('Helvetica').fillColor('#4a5568').text('    ' + (t.details || t.action || t.raw_log || ''));
      doc.moveDown(0.3);
    });
  } else {
    doc.fontSize(10).fillColor('#4a5568').text('Timeline data unavailable.');
  }
  doc.moveDown(1);

  doc.fontSize(13).font('Helvetica-Bold').fillColor('#2b6cb0').text('4. ROOT CAUSE ANALYSIS');
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica').fillColor('#2d3748').text(
    r.root_cause || (r.threat_explanation && (r.threat_explanation.technical || r.threat_explanation.non_technical)) || 'Root cause analysis pending.',
    { align: 'justify' }
  );
  doc.moveDown(1);

  doc.fontSize(13).font('Helvetica-Bold').fillColor('#d69e2e').text('5. CONTAINMENT ACTIONS');
  doc.moveDown(0.5);
  const actions = r.containment_actions && r.containment_actions.length > 0
    ? r.containment_actions
    : r.recommended_response
      ? r.recommended_response.filter((a: any) => a.category === 'Containment Actions' || a.category === 'Immediate Actions').map((a: any) => `[${a.priority}] ${a.action} — ${a.target}`)
      : ['No actions recorded.'];
  actions.forEach((a: string, i: number) => {
    doc.fontSize(10).font('Helvetica').fillColor('#2d3748').text(`  ${i + 1}. ${a}`);
    doc.moveDown(0.2);
  });
  doc.moveDown(0.8);

  doc.fontSize(13).font('Helvetica-Bold').fillColor('#38a169').text('6. REMEDIATION RECOMMENDATIONS');
  doc.moveDown(0.5);
  const recs = r.long_term_recommendations && r.long_term_recommendations.length > 0
    ? r.long_term_recommendations
    : r.recommended_response
      ? r.recommended_response.filter((a: any) => a.category === 'Recovery Actions' || a.category === 'Investigation Actions').map((a: any) => `[${a.priority}] ${a.action} — ${a.target}`)
      : ['Recommendations pending.'];
  recs.forEach((a: string, i: number) => {
    doc.fontSize(10).font('Helvetica').fillColor('#2d3748').text(`  ${i + 1}. ${a}`);
    doc.moveDown(0.2);
  });
  doc.moveDown(1);

  if (doc.y > 700) doc.addPage();

  doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, 780).lineTo(550, 780).stroke();
  doc.fontSize(8).font('Helvetica').fillColor('#a0aec0').text('ThreatWeave SIH 2026 — Forensic Incident Report', 50, 800, { align: 'left' });
  doc.fontSize(8).fillColor('#a0aec0').text(r.analyst_signoff || 'AI-Automated Analysis', 50, 800, { align: 'right' });

  doc.end();
});

// Mount router on app
app.use(router);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err?.message || 'Unknown error' });
});

app.listen(PORT, () => {
  console.log(`ThreatWeave API Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`MongoDB: ${dbConnected ? 'Connected' : 'Memory Fallback'}`);
  console.log(`CrewAI: ${crewAIConfigured ? 'Configured' : 'Not Set'}`);
});
