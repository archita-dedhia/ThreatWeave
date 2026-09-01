import React, { useState } from 'react';
import { useSOC } from '../context/SOCContext';
import {
  Sliders,
  Save,
  RotateCcw,
  Bot,
  ShieldCheck,
  Bell,
  Cpu,
  Database,
  CheckCircle2,
} from 'lucide-react';
import { SOCSettings } from '../types';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, addToast } = useSOC();

  const [localSettings, setLocalSettings] = useState<SOCSettings>({ ...settings });

  const handleSave = () => {
    updateSettings(localSettings);
    addToast('success', 'Settings Saved', 'SOC detection engine and agent parameters updated.');
  };

  const handleReset = () => {
    const defaults: SOCSettings = {
      brute_force_threshold: 5,
      exfiltration_threshold_mb: 50,
      off_hours_start: '22:00',
      off_hours_end: '06:00',
      log_agent_model: 'Gemini 2.5 Flash (Heuristic Engine)',
      investigation_agent_model: 'Gemini 2.5 Pro (Graph Reasoner)',
      ai_temperature: 0.2,
      alert_critical: true,
      alert_incident_created: true,
      auto_correlate: true,
      max_batch_size: 5000,
    };
    setLocalSettings(defaults);
    updateSettings(defaults);
    addToast('info', 'Settings Reset', 'Configuration restored to default enterprise parameters.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-400" />
            SOC System Configuration &amp; AI Engine Parameters
          </h2>
          <p className="text-xs text-gray-400">
            Tune anomaly detection thresholds, agent cognitive models, and notification channels
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="px-3.5 py-1.5 bg-[#111217] hover:bg-white/5 text-gray-300 text-xs font-semibold rounded-md border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-md shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detection Engine Parameters */}
        <div className="p-6 bg-[#1A1C23] border border-white/10 rounded-lg space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            Detection Engine Thresholds
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-gray-300 font-semibold block mb-1">
                Brute-Force Detection Threshold (Failed Attempts)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={localSettings.brute_force_threshold}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, brute_force_threshold: parseInt(e.target.value) || 5 })
                  }
                  className="w-24 px-3 py-1.5 bg-[#111217] border border-white/10 focus:border-blue-500 rounded-md text-xs font-mono text-gray-200"
                />
                <span className="text-gray-500">Failed authentication attempts within 10-minute window</span>
              </div>
            </div>

            <div>
              <label className="text-gray-300 font-semibold block mb-1">
                Data Exfiltration Volume Alert Threshold (MB)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={5}
                  max={10000}
                  value={localSettings.exfiltration_threshold_mb}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, exfiltration_threshold_mb: parseInt(e.target.value) || 50 })
                  }
                  className="w-24 px-3 py-1.5 bg-[#111217] border border-white/10 focus:border-blue-500 rounded-md text-xs font-mono text-gray-200"
                />
                <span className="text-gray-500">Outbound data transfer volume per host</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-300 font-semibold block mb-1">Off-Hours Start (UTC)</label>
                <input
                  type="text"
                  value={localSettings.off_hours_start}
                  onChange={(e) => setLocalSettings({ ...localSettings, off_hours_start: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#111217] border border-white/10 focus:border-blue-500 rounded-md text-xs font-mono text-gray-200"
                />
              </div>

              <div>
                <label className="text-gray-300 font-semibold block mb-1">Off-Hours End (UTC)</label>
                <input
                  type="text"
                  value={localSettings.off_hours_end}
                  onChange={(e) => setLocalSettings({ ...localSettings, off_hours_end: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#111217] border border-white/10 focus:border-blue-500 rounded-md text-xs font-mono text-gray-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* AI Agent Engine Settings */}
        <div className="p-6 bg-[#1A1C23] border border-white/10 rounded-lg space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
            <Bot className="w-4 h-4 text-blue-400" />
            Agentic AI Engine Parameters
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-gray-300 font-semibold block mb-1">Log Analysis Agent Engine</label>
              <select
                value={localSettings.log_agent_model}
                onChange={(e) => setLocalSettings({ ...localSettings, log_agent_model: e.target.value })}
                className="w-full px-3 py-2 bg-[#111217] border border-white/10 focus:border-blue-500 rounded-md text-xs font-mono text-gray-200"
              >
                <option value="Gemini 2.5 Flash (Heuristic Engine)">Gemini 2.5 Flash (High-Throughput Stream)</option>
                <option value="Gemini 2.5 Pro (Deep Parser)">Gemini 2.5 Pro (Deep Syntax Parser)</option>
                <option value="Deterministic Heuristic L1">Deterministic Rule-Engine L1</option>
              </select>
            </div>

            <div>
              <label className="text-gray-300 font-semibold block mb-1">Threat Investigation Agent Model</label>
              <select
                value={localSettings.investigation_agent_model}
                onChange={(e) => setLocalSettings({ ...localSettings, investigation_agent_model: e.target.value })}
                className="w-full px-3 py-2 bg-[#111217] border border-white/10 focus:border-blue-500 rounded-md text-xs font-mono text-gray-200"
              >
                <option value="Gemini 2.5 Pro (Graph Reasoner)">Gemini 2.5 Pro (Graph Correlator &amp; Reasoner)</option>
                <option value="Gemini 2.5 Flash (Fast Correlator)">Gemini 2.5 Flash (Fast Correlator)</option>
                <option value="Graph Attack-Chain Reasoner L2">Cognitive Attack-Chain Reasoner L2</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-gray-300 font-semibold">AI Reasoning Temperature</label>
                <span className="font-mono text-blue-400">{localSettings.ai_temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={localSettings.ai_temperature}
                onChange={(e) => setLocalSettings({ ...localSettings, ai_temperature: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-[#111217] rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="text-[11px] text-gray-500 block mt-1">
                Lower temperature (0.1 - 0.2) guarantees strict factual evidence grounding.
              </span>
            </div>
          </div>
        </div>

        {/* Notifications & Automation */}
        <div className="p-6 bg-[#1A1C23] border border-white/10 rounded-lg space-y-4 lg:col-span-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
            <Bell className="w-4 h-4 text-yellow-400" />
            Alerting &amp; Workflow Automation
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <label className="flex items-start gap-3 p-3 bg-[#111217] rounded-md border border-white/10 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.alert_critical}
                onChange={(e) => setLocalSettings({ ...localSettings, alert_critical: e.target.checked })}
                className="mt-0.5 rounded border-white/20 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div className="font-semibold text-gray-200">Alert on Critical Threats</div>
                <div className="text-gray-500 text-[11px] mt-0.5">Show instant toast on critical anomalies</div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 bg-[#111217] rounded-md border border-white/10 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.alert_incident_created}
                onChange={(e) => setLocalSettings({ ...localSettings, alert_incident_created: e.target.checked })}
                className="mt-0.5 rounded border-white/20 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div className="font-semibold text-gray-200">Alert on Incident Creation</div>
                <div className="text-gray-500 text-[11px] mt-0.5">Notify when new incident dossier is generated</div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 bg-[#111217] rounded-md border border-white/10 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.auto_correlate}
                onChange={(e) => setLocalSettings({ ...localSettings, auto_correlate: e.target.checked })}
                className="mt-0.5 rounded border-white/20 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div className="font-semibold text-gray-200">Auto-Correlation Engine</div>
                <div className="text-gray-500 text-[11px] mt-0.5">Automatically bundle related events into threat dossiers</div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
