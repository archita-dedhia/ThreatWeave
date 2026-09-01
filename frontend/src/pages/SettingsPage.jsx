import React, { useState } from 'react';
import { useSOC } from '../context/SOCContext';
import {
  Sliders,
  Sparkles,
  Save,
  RotateCcw,
  Zap,
  Info,
} from 'lucide-react';

export const SettingsPage = () => {
  const {
    socSettings,
    updateSOCSettings,
    loadDemoDataset,
    addToast,
  } = useSOC();

  const [localSettings, setLocalSettings] = useState({ ...socSettings });

  const handleSave = (e) => {
    e.preventDefault();
    updateSOCSettings(localSettings);
  };

  const handleResetDefaults = () => {
    const defaults = {
      bruteForceThreshold: 4,
      riskThresholdHigh: 70,
      riskThresholdCritical: 85,
      enableAutoContainment: false,
      aiModelMode: 'mock_ai',
      apiKey: '',
      syslogPort: 514,
    };
    setLocalSettings(defaults);
    updateSOCSettings(defaults);
    addToast('Defaults Restored', 'Detection engine parameters reset to standard baseline', 'info');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-400" />
            Detection Engine &amp; AI Assistant Parameters
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Configure correlation thresholds, scoring algorithms, and autonomous containment policies
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="px-3 py-1.5 bg-[#111217] hover:bg-white/5 text-gray-300 text-xs font-semibold rounded border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Anomaly Detection Engine Rules */}
        <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg space-y-4">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              1. Anomaly &amp; Heuristic Thresholds (Agent 1)
            </h3>
            <p className="text-xs text-gray-400">
              Tune sensitivity for failed authentication spikes and anomaly flags
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
            <div className="space-y-2">
              <label className="text-gray-300 font-semibold block">
                Brute Force Fail Count Threshold (Attempts)
              </label>
              <input
                type="number"
                min={2}
                max={20}
                value={localSettings.bruteForceThreshold}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, bruteForceThreshold: parseInt(e.target.value) || 4 })
                }
                className="w-full p-2.5 bg-[#111217] border border-white/10 rounded text-gray-200 text-xs focus:border-blue-500 focus:outline-none"
              />
              <span className="text-[11px] text-gray-500 block">
                Triggers Brute Force attack dossier when failures per source IP exceed this count.
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-gray-300 font-semibold block">Syslog Listener Port (Default: 514 UDP)</label>
              <input
                type="number"
                value={localSettings.syslogPort}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, syslogPort: parseInt(e.target.value) || 514 })
                }
                className="w-full p-2.5 bg-[#111217] border border-white/10 rounded text-gray-200 text-xs focus:border-blue-500 focus:outline-none"
              />
              <span className="text-[11px] text-gray-500 block">
                Network socket target for RFC 5424 raw syslog log forwarders.
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: AI Risk Scoring Thresholds */}
        <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg space-y-4">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              2. Threat Risk Score Tiers (Agent 2)
            </h3>
            <p className="text-xs text-gray-400">
              Define the boundary values for autonomous severity classification (0 - 100)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
            <div className="space-y-2">
              <label className="text-yellow-400 font-semibold block">
                HIGH Severity Risk Threshold (Score &ge;):
              </label>
              <input
                type="number"
                min={40}
                max={85}
                value={localSettings.riskThresholdHigh}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, riskThresholdHigh: parseInt(e.target.value) || 70 })
                }
                className="w-full p-2.5 bg-[#111217] border border-white/10 rounded text-gray-200 text-xs focus:border-blue-500 focus:outline-none"
              />
              <span className="text-[11px] text-gray-500 block">
                Threats scoring above this score receive HIGH risk classification.
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-red-400 font-semibold block">
                CRITICAL Severity Risk Threshold (Score &ge;):
              </label>
              <input
                type="number"
                min={70}
                max={99}
                value={localSettings.riskThresholdCritical}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, riskThresholdCritical: parseInt(e.target.value) || 85 })
                }
                className="w-full p-2.5 bg-[#111217] border border-white/10 rounded text-gray-200 text-xs focus:border-blue-500 focus:outline-none"
              />
              <span className="text-[11px] text-gray-500 block">
                Threats scoring above this score escalate directly to Tier-1 alert queues.
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Autonomous Response Guardrails */}
        <div className="p-5 bg-[#1A1C23] border border-white/10 rounded-lg space-y-4">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              3. Autonomous Containment Execution Guardrails
            </h3>
            <p className="text-xs text-gray-400">
              Safety policies controlling whether playbooks execute automatically or require Human-in-the-Loop
              approval
            </p>
          </div>

          <div className="p-4 bg-[#111217] rounded-lg border border-white/10 flex items-start gap-4">
            <input
              type="checkbox"
              id="autoContainment"
              checked={localSettings.enableAutoContainment}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, enableAutoContainment: e.target.checked })
              }
              className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-0 focus:outline-none"
            />
            <label htmlFor="autoContainment" className="text-xs space-y-1 cursor-pointer">
              <span className="text-white font-bold block">
                Enable Autonomous Playbook Execution for High-Confidence Threats
              </span>
              <p className="text-gray-400 font-sans leading-relaxed">
                When enabled, containment actions (firewall block rules, token invalidation) tagged with
                &lsquo;auto-containment eligible&rsquo; will execute immediately without waiting for manual analyst
                click-to-execute confirmation.
              </p>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-md shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
