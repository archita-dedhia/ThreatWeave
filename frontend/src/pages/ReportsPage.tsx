import React, { useState } from 'react';
import { useSOC } from '../context/SOCContext';
import {
  FileCheck2,
  Download,
  Printer,
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  FolderLock,
  ArrowRight,
  ShieldAlert,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { IncidentReport } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';

export const ReportsPage: React.FC = () => {
  const {
    reports,
    selectedReportId,
    navigateToReport,
    incidents,
    generateReportForIncident,
    setActivePage,
    loadDemoDataset,
    addToast,
  } = useSOC();

  const [activeReport, setActiveReport] = useState<IncidentReport | null>(
    reports.find((r) => r.id === selectedReportId) || reports[0] || null
  );

  // Sync if reports update
  React.useEffect(() => {
    if (selectedReportId) {
      const match = reports.find((r) => r.id === selectedReportId);
      if (match) setActiveReport(match);
    } else if (reports.length > 0 && !activeReport) {
      setActiveReport(reports[0]);
    }
  }, [selectedReportId, reports]);

  const handleExportJSON = (report: IncidentReport) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${report.id}_forensic_report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('success', 'Report Exported', `Downloaded ${report.id}_forensic_report.json`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-blue-400" />
            Formal Incident &amp; Executive Forensic Reports
          </h2>
          <p className="text-xs text-gray-400">
            {reports.length} generated official incident reports ready for executive leadership and compliance audit
          </p>
        </div>

        {activeReport && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExportJSON(activeReport)}
              className="px-3.5 py-1.5 bg-[#111217] hover:bg-white/5 text-gray-200 text-xs font-semibold rounded-md border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-md shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF View</span>
            </button>
          </div>
        )}
      </div>

      {reports.length === 0 ? (
        <EmptyState
          title="No incident reports generated yet"
          description="Reports can be generated instantly from any detected threat or open incident in the SOC workbench."
          actionText="Load Controlled Demo Dataset"
          onAction={loadDemoDataset}
          secondaryActionText="Go to Threats"
          onSecondaryAction={() => setActivePage('threats')}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Reports Sidebar List (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-mono uppercase text-gray-400 font-semibold px-1">
              Generated Reports Catalog ({reports.length})
            </div>

            <div className="space-y-2.5">
              {reports.map((rpt) => (
                <div
                  key={rpt.id}
                  onClick={() => setActiveReport(rpt)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                    activeReport?.id === rpt.id
                      ? 'bg-blue-600/10 border-blue-500/50 shadow-md'
                      : 'bg-[#1A1C23] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-blue-400">{rpt.id}</span>
                    <RiskBadge level={rpt.risk_level} size="sm" />
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{rpt.threat_title}</h4>
                  <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 pt-1 border-t border-white/10">
                    <span>Target: {rpt.affected_user}</span>
                    <span>{rpt.generated_at.slice(0, 10)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Report Viewer / Printable Document (8 cols) */}
          {activeReport && (
            <div className="lg:col-span-8 p-8 bg-[#1A1C23] border border-white/10 rounded-lg space-y-6 print:bg-white print:text-black print:p-0 print:border-none shadow-xl">
              {/* Document Header */}
              <div className="border-b border-white/10 pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase bg-blue-600/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-bold">
                      UrbanSOC Official Incident Report
                    </span>
                    <span className="text-xs font-mono text-gray-400">{activeReport.id}</span>
                  </div>
                  <RiskBadge level={activeReport.risk_level} size="md" />
                </div>

                <h1 className="text-xl font-black text-white mt-3">{activeReport.threat_title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-400 mt-2">
                  <span>
                    Generated By: <strong className="text-gray-200">{activeReport.generated_by}</strong>
                  </span>
                  <span>•</span>
                  <span>Date: {activeReport.generated_at}</span>
                  <span>•</span>
                  <span>Incident Ref: {activeReport.incident_id}</span>
                </div>
              </div>

              {/* 1. Executive Summary */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono uppercase text-blue-400 font-bold tracking-wider">
                  1. Executive Summary (Leadership Overview)
                </h3>
                <div className="p-4 bg-[#111217] rounded-lg border border-white/10 text-xs text-gray-200 leading-relaxed">
                  {activeReport.executive_summary}
                </div>
              </div>

              {/* 2. Key Incident Details */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono uppercase text-blue-400 font-bold tracking-wider">
                  2. Forensic Incident Metadata
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3 bg-[#111217] rounded-lg border border-white/10">
                    <span className="text-gray-500 block text-[10px] uppercase">Affected Identity</span>
                    <span className="text-blue-300 font-semibold">{activeReport.affected_user}</span>
                  </div>
                  <div className="p-3 bg-[#111217] rounded-lg border border-white/10">
                    <span className="text-gray-500 block text-[10px] uppercase">Target Endpoint</span>
                    <span className="text-gray-200 font-semibold">{activeReport.affected_system}</span>
                  </div>
                  <div className="p-3 bg-[#111217] rounded-lg border border-white/10">
                    <span className="text-gray-500 block text-[10px] uppercase">Primary Vector</span>
                    <span className="text-red-400 font-semibold">{activeReport.attack_vector}</span>
                  </div>
                </div>
              </div>

              {/* 3. Threat Explanation (Technical + Non-technical) */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase text-blue-400 font-bold tracking-wider">
                  3. Multi-Tier Threat Explanation
                </h3>

                <div className="p-4 bg-[#111217] rounded-lg border border-white/10 space-y-2">
                  <div className="text-[11px] font-mono text-gray-400 font-bold">NON-TECHNICAL SUMMARY:</div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {activeReport.threat_explanation.non_technical}
                  </p>
                </div>

                <div className="p-4 bg-[#111217] rounded-lg border border-white/10 space-y-2">
                  <div className="text-[11px] font-mono text-blue-400 font-bold">TECHNICAL SOC ROOT CAUSE:</div>
                  <p className="text-xs text-gray-300 leading-relaxed font-mono">
                    {activeReport.threat_explanation.technical}
                  </p>
                </div>
              </div>

              {/* 4. Evidence Timeline */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono uppercase text-blue-400 font-bold tracking-wider">
                  4. Evidence Reconstruction &amp; Audit Trail
                </h3>
                <div className="p-4 bg-[#111217] rounded-lg border border-white/10 space-y-2.5 font-mono text-xs">
                  {activeReport.evidence_timeline.map((evt, idx) => (
                    <div key={idx} className="flex items-start gap-3 pb-2 border-b border-white/5 last:border-0 last:pb-0">
                      <span className="text-gray-500 shrink-0 text-[11px]">[{evt.timestamp.slice(11, 19)}]</span>
                      <div className="space-y-0.5">
                        <div className="text-gray-200 font-semibold">
                          {evt.event_type} ({evt.source_ip} → {evt.destination_ip})
                        </div>
                        <div className="text-[11px] text-gray-400">{evt.raw_log}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Response Actions & Playbooks */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono uppercase text-blue-400 font-bold tracking-wider">
                  5. Response Actions &amp; Defensive Recommendations
                </h3>
                <div className="p-4 bg-[#111217] rounded-lg border border-white/10 space-y-2">
                  {activeReport.response_actions_summary.map((act, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                      <span className="text-gray-200">{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signature Block */}
              <div className="pt-6 border-t border-white/10 flex justify-between items-end text-xs font-mono text-gray-500">
                <div>UrbanSOC Autonomous Security Protocol v2.6 • PS SIH26S01</div>
                <div className="text-right">
                  <div className="text-gray-300 font-semibold">Verified Electronic Signature</div>
                  <div>SOC Incident Response Commander</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
