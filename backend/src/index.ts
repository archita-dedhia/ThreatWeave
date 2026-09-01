import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import PDFDocument from 'pdfkit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const mongoUri = process.env.MONGO_URI || '';
let dbConnected = false;

const connectDB = async () => {
  try {
    if (!mongoUri) {
      console.warn('MONGO_URI not set - running in memory mode');
      return;
    }
    await mongoose.connect(mongoUri);
    dbConnected = true;
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection failed:', err);
    console.log('Running in memory fallback mode');
    dbConnected = false;
  }
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

app.get('/api/health', (req, res) => {
  res.json({
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    dbConnected,
    mongoUriConfigured: !!mongoUri,
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'ThreatWeave API',
    version: '1.0.0',
    endpoints: {
      reports: '/api/reports',
      incidents: '/api/incidents',
      threats: '/api/threats',
      events: '/api/events',
    },
  });
});

app.get('/api/db-status', (req, res) => {
  res.json({
    connected: dbConnected,
    mongoUri: mongoUri ? mongoUri.split('@')[1] || 'configured' : 'not configured',
  });
});

app.get('/api/reports', async (req, res) => {
  try {
    if (!dbConnected) return res.json([]);
    const reports = await IncidentReport.find().sort({ createdAt: -1 }).limit(100);
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports', message: (err as Error).message });
  }
});

app.get('/api/reports/:id', async (req, res) => {
  try {
    if (!dbConnected) return res.status(404).json({ error: 'DB not connected' });
    const report = await IncidentReport.findOne({ id: req.params.id });
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch report', message: (err as Error).message });
  }
});

app.post('/api/reports', async (req, res) => {
  try {
    if (!dbConnected) {
      return res.json({
        saved: false,
        reason: 'DB not connected - running in memory mode',
        report: req.body,
      });
    }
    const existing = await IncidentReport.findOne({ id: req.body.id });
    let report;
    if (existing) {
      report = await IncidentReport.findOneAndUpdate({ id: req.body.id }, req.body, { new: true });
    } else {
      report = new IncidentReport(req.body);
      await report.save();
    }
    res.json({ saved: true, report });
  } catch (err) {
    console.error('Save report error:', err);
    res.status(500).json({ error: 'Failed to save report', message: (err as Error).message });
  }
});

app.delete('/api/reports/:id', async (req, res) => {
  try {
    if (!dbConnected) return res.status(404).json({ error: 'DB not connected' });
    await IncidentReport.deleteOne({ id: req.params.id });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete report', message: (err as Error).message });
  }
});

app.post('/api/generate-markdown', (req, res) => {
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
  : (r.recommended_response && r.recommended_response.filter((r: any) => r.category === 'Containment Actions' || r.category === 'Immediate Actions').map((a: any, i: number) => `${i + 1}. **${a.priority || ''}:** ${a.action} (Target: ${a.target} - ${a.reason || ''})`).join('\n'))
    || 'No containment actions recorded.'}

---

## 7. Long-term Remediation & Strategic Hardening Recommendations

${(r.long_term_recommendations && r.long_term_recommendations.length > 0)
  ? r.long_term_recommendations.map((rec: string, i: number) => `${i + 1}. ${rec}`).join('\n')
  : (r.recommended_response && r.recommended_response.filter((r: any) => r.category === 'Recovery Actions' || r.category === 'Investigation Actions').map((a: any, i: number) => `${i + 1}. **${a.priority || ''}:** ${a.action} (Target: ${a.target} - ${a.reason || ''})`).join('\n'))
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

app.post('/api/generate-pdf', (req, res) => {
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
  meta.forEach((m, i) => {
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
  doc.font('Helvetica').fillColor('#2d3748').text(r.affected_user || 'N/A', { continued: false });
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
  doc.fontSize(8).font('Helvetica').fillColor('#a0aec0').text('ThreatWeave SIH 2026 — Forensic Incident Report — Page ' + doc.bufferedPageRange().count, 50, 800, { align: 'left' });
  doc.fontSize(8).fillColor('#a0aec0').text(r.analyst_signoff || 'AI-Automated Analysis', 50, 800, { align: 'right' });

  doc.end();
});

app.get('/api/incidents', async (req, res) => {
  try {
    if (!dbConnected) return res.json([]);
    const incidents = await Incident.find().sort({ createdAt: -1 }).limit(100);
    res.json(incidents);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch incidents', message: (err as Error).message });
  }
});

app.post('/api/incidents/batch', async (req, res) => {
  try {
    if (!dbConnected) {
      return res.json({ saved: false, count: req.body?.length || 0, reason: 'DB not connected' });
    }
    const list = Array.isArray(req.body) ? req.body : [req.body];
    let count = 0;
    for (const inc of list) {
      const existing = await Incident.findOne({ id: inc.id });
      if (existing) {
        await Incident.findOneAndUpdate({ id: inc.id }, inc);
      } else {
        await new Incident(inc).save();
      }
      count++;
    }
    res.json({ saved: true, count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save incidents', message: (err as Error).message });
  }
});

app.get('/api/threats', async (req, res) => {
  try {
    if (!dbConnected) return res.json([]);
    const threats = await Threat.find().sort({ createdAt: -1 }).limit(100);
    res.json(threats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch threats', message: (err as Error).message });
  }
});

app.post('/api/threats/batch', async (req, res) => {
  try {
    if (!dbConnected) {
      return res.json({ saved: false, count: req.body?.length || 0, reason: 'DB not connected' });
    }
    const list = Array.isArray(req.body) ? req.body : [req.body];
    let count = 0;
    for (const t of list) {
      const existing = await Threat.findOne({ id: t.id });
      if (existing) {
        await Threat.findOneAndUpdate({ id: t.id }, t);
      } else {
        await new Threat(t).save();
      }
      count++;
    }
    res.json({ saved: true, count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save threats', message: (err as Error).message });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    if (!dbConnected) return res.json([]);
    const events = await SecurityEvent.find().sort({ createdAt: -1 }).limit(500);
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events', message: (err as Error).message });
  }
});

app.post('/api/events/batch', async (req, res) => {
  try {
    if (!dbConnected) {
      return res.json({ saved: false, count: req.body?.length || 0, reason: 'DB not connected' });
    }
    const list = Array.isArray(req.body) ? req.body : [req.body];
    let count = 0;
    for (const e of list) {
      const existing = await SecurityEvent.findOne({ id: e.id });
      if (!existing) {
        await new SecurityEvent(e).save();
        count++;
      }
    }
    res.json({ saved: true, count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save events', message: (err as Error).message });
  }
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`ThreatWeave API Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`MongoDB URI: ${mongoUri ? 'Configured' : 'Not Set'}`);
});
