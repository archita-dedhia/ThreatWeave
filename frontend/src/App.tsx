/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SOCProvider, useSOC } from './context/SOCContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { ToastContainer } from './components/common/ToastContainer';

// Page components
import { DashboardPage } from './pages/DashboardPage';
import { LogAnalysisPage } from './pages/LogAnalysisPage';
import { AIInvestigationPage } from './pages/AIInvestigationPage';
import { ThreatsPage } from './pages/ThreatsPage';
import { ThreatInvestigationPage } from './pages/ThreatInvestigationPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { IncidentDetailPage } from './pages/IncidentDetailPage';
import { ReportsPage } from './pages/ReportsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';

const SOCAppContent: React.FC = () => {
  const { activePage } = useSOC();

  const renderActivePage = () => {
    switch (activePage) {
      case 'overview':
        return <DashboardPage />;
      case 'log-analysis':
        return <LogAnalysisPage />;
      case 'ai-investigation':
        return <AIInvestigationPage />;
      case 'threats':
        return <ThreatsPage />;
      case 'threat-detail':
        return <ThreatInvestigationPage />;
      case 'incidents':
        return <IncidentsPage />;
      case 'incident-detail':
        return <IncidentDetailPage />;
      case 'reports':
        return <ReportsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0A0B0D] text-gray-300 font-sans selection:bg-blue-600/30 selection:text-blue-200">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <TopBar />

        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#0A0B0D]">
          <div className="max-w-7xl mx-auto pb-12">
            {renderActivePage()}
          </div>
        </main>
      </div>

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <SOCProvider>
      <SOCAppContent />
    </SOCProvider>
  );
}
