import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  Clock,
  Server,
  User,
  Terminal,
  FileCode,
  HardDrive,
  CheckCircle2,
  Copy,
  Check,
  Flame,
} from 'lucide-react';
import { getThreat } from '../services/api';
import { RiskBadge } from '../components/common/RiskBadge';

export const ThreatDetailPage = () => {
  const { id } = useParams();
  const [threat, setThreat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchThreatDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getThreat(id);
      setThreat(data);
    } catch (err) {
      console.error('Error fetching threat details:', err);
      setError(
        err.message?.includes('404')
          ? `Threat ID "${id}" was not found in the detection system.`
          : 'Unable to connect to ThreatWeave backend.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreatDetails();
  }, [id]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm text-gray-400 font-mono">Loading threat dossier for ID: {id}...</p>
      </div>
    );
  }

  if (error || !threat) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 bg-red-950/20 border border-red-500/30 rounded-xl text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white mb-2">Threat Investigation Error</h3>
        <p className="text-xs text-red-300 mb-6 font-mono">{error || 'Threat not found'}</p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/threats"
            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Threats</span>
          </Link>
          <button
            onClick={fetchThreatDetails}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  const rawLog = threat.relevant_log_information || {};

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono">
          <Link
            to="/threats"
            className="text-gray-400 hover:text-blue-400 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Threats</span>
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-blue-400 font-semibold truncate max-w-xs">{threat.id}</span>
        </div>

        <Link
          to="/threats"
          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Feed</span>
        </Link>
      </div>

      {/* Main Threat Header Card */}
      <div className="p-6 bg-[#111217] border border-white/10 rounded-xl shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <RiskBadge level={threat.severity} size="lg" />
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-mono font-semibold uppercase ${
                  threat.status === 'Compromised'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                }`}
              >
                Status: {threat.status || 'Active'}
              </span>
              <span className="text-xs font-mono text-gray-400 bg-white/5 px-2.5 py-1 rounded border border-white/10">
                ID: {threat.id}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2.5">
              <Flame className="w-6 h-6 text-red-400 shrink-0" />
              <span>{threat.threat_type}</span>
            </h2>
            <p className="text-xs text-gray-400 font-mono">
              Detected at {threat.timestamp} &bull; Target Asset: {threat.destination_ip || 'Internal Network'}
            </p>
          </div>

          {/* Risk Score Gauge */}
          <div className="p-4 bg-[#1A1C23] border border-white/10 rounded-xl flex items-center gap-5 shrink-0">
            <div className="text-center">
              <div className="text-3xl font-black text-white font-mono">{threat.risk_score}</div>
              <div className="text-[10px] uppercase font-mono text-gray-400 font-semibold mt-0.5">
                Risk Score / 100
              </div>
            </div>
            <div className="h-10 w-[1px] bg-white/10" />
            <div className="space-y-1 text-xs font-mono">
              <div className="text-gray-400">Severity Tier:</div>
              <div className="font-bold text-red-400 uppercase">{threat.severity}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Why was this threat detected? (Crucial Section) */}
      <div className="p-6 bg-blue-950/20 border border-blue-500/30 rounded-xl space-y-3 shadow-sm">
        <div className="flex items-center gap-2 text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4" />
          <span>Why Was This Threat Detected?</span>
        </div>
        <h3 className="text-base font-semibold text-white">
          {threat.detection_reason}
        </h3>
        {threat.description && threat.description !== threat.detection_reason && (
          <p className="text-xs text-gray-300 leading-relaxed font-sans">
            {threat.description}
          </p>
        )}
      </div>

      {/* Threat Attributes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#111217] border border-white/10 rounded-xl space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>Detection Time</span>
          </div>
          <div className="text-sm font-bold text-white font-mono">{threat.timestamp}</div>
        </div>

        <div className="p-4 bg-[#111217] border border-white/10 rounded-xl space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
            <Server className="w-3.5 h-3.5 text-red-400" />
            <span>Attacker (Source IP)</span>
          </div>
          <div className="text-sm font-bold text-blue-400 font-mono">
            {threat.source_ip || rawLog.source_ip || 'N/A'}
          </div>
        </div>

        <div className="p-4 bg-[#111217] border border-white/10 rounded-xl space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
            <Server className="w-3.5 h-3.5 text-purple-400" />
            <span>Target (Destination IP)</span>
          </div>
          <div className="text-sm font-bold text-purple-300 font-mono">
            {threat.destination_ip || rawLog.destination_ip || 'N/A'}
          </div>
        </div>

        <div className="p-4 bg-[#111217] border border-white/10 rounded-xl space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
            <User className="w-3.5 h-3.5 text-yellow-400" />
            <span>User Account</span>
          </div>
          <div className="text-sm font-bold text-yellow-300 font-mono">
            {rawLog.user || 'Unknown User'}
          </div>
        </div>
      </div>

      {/* Relevant Log Information */}
      <div className="p-6 bg-[#111217] border border-white/10 rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Relevant Log Information</h3>
          </div>
          <button
            onClick={() => copyToClipboard(JSON.stringify(rawLog, null, 2))}
            className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 font-mono transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy JSON</span>
              </>
            )}
          </button>
        </div>

        {/* Structured Log Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-3 bg-[#1A1C23] border border-white/5 rounded-lg">
            <span className="text-gray-400 text-[11px] block">Event Type:</span>
            <span className="text-white font-semibold">{rawLog.event_type || 'N/A'}</span>
          </div>

          <div className="p-3 bg-[#1A1C23] border border-white/5 rounded-lg">
            <span className="text-gray-400 text-[11px] block">Action:</span>
            <span className="text-white font-semibold">{rawLog.action || 'N/A'}</span>
          </div>

          <div className="p-3 bg-[#1A1C23] border border-white/5 rounded-lg">
            <span className="text-gray-400 text-[11px] block">Status:</span>
            <span className="text-white font-semibold uppercase">{rawLog.status || 'N/A'}</span>
          </div>

          <div className="p-3 bg-[#1A1C23] border border-white/5 rounded-lg">
            <span className="text-gray-400 text-[11px] block">Process Name:</span>
            <span className="text-white font-semibold">{rawLog.process || 'N/A'}</span>
          </div>

          <div className="p-3 bg-[#1A1C23] border border-white/5 rounded-lg">
            <span className="text-gray-400 text-[11px] block">File Target:</span>
            <span className="text-white font-semibold">{rawLog.file || 'N/A'}</span>
          </div>

          <div className="p-3 bg-[#1A1C23] border border-white/5 rounded-lg">
            <span className="text-gray-400 text-[11px] block">Bytes Transferred:</span>
            <span className="text-white font-semibold">
              {rawLog.bytes_transferred ? `${rawLog.bytes_transferred.toLocaleString()} bytes` : '0 bytes'}
            </span>
          </div>
        </div>

        {/* Executed Command if present */}
        {rawLog.command && (
          <div className="space-y-1.5 pt-2">
            <div className="text-xs font-mono text-gray-400 flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-yellow-400" />
              <span>Executed Command Signature:</span>
            </div>
            <pre className="p-3.5 bg-black/60 border border-yellow-500/20 text-yellow-300 font-mono text-xs rounded-lg overflow-x-auto selection:bg-yellow-500/30">
              {rawLog.command}
            </pre>
          </div>
        )}

        {/* Full Raw JSON Viewer */}
        <div className="space-y-1.5 pt-2">
          <div className="text-xs font-mono text-gray-400">Complete Telemetry Payload:</div>
          <pre className="p-4 bg-black/70 border border-white/10 text-gray-300 font-mono text-[11px] rounded-lg overflow-x-auto leading-relaxed">
            {JSON.stringify(rawLog, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
