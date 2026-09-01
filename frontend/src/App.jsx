import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SOCProvider, useSOC } from './context/SOCContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { ToastContainer } from './components/common/ToastContainer';

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

import Signup from './Signup.jsx';
import Login from './Login.jsx';
import { ProtectedRoute, GuestRoute } from './AuthContext.jsx';

const PAGE_MAP = {
  overview: <DashboardPage />,
  'log-analysis': <LogAnalysisPage />,
  'ai-investigation': <AIInvestigationPage />,
  threats: <ThreatsPage />,
  'threat-detail': <ThreatInvestigationPage />,
  incidents: <IncidentsPage />,
  'incident-detail': <IncidentDetailPage />,
  reports: <ReportsPage />,
  analytics: <AnalyticsPage />,
  settings: <SettingsPage />,
};

const ProtectedSOCShell = () => {
  const { activePage } = useSOC();
  const location = useLocation();

  const pageFromPath =
    location.pathname === '/dashboard' ? 'overview' : location.pathname.replace(/^\//, '');
  const renderKey = PAGE_MAP[pageFromPath] ? pageFromPath : activePage;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0A0B0D] text-gray-300 font-sans selection:bg-blue-600/30 selection:text-blue-200">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#0A0B0D]">
          <div className="max-w-7xl mx-auto pb-12">
            {PAGE_MAP[renderKey] || PAGE_MAP.overview}
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <SOCProvider>
      <Routes>
        <Route
          path="/"
          element={
            <GuestRoute>
              <Signup />
            </GuestRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <GuestRoute>
              <Signup />
            </GuestRoute>
          }
        />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ProtectedSOCShell />
            </ProtectedRoute>
          }
        />
        <Route
          path="/overview"
          element={
            <ProtectedRoute>
              <ProtectedSOCShell />
            </ProtectedRoute>
          }
        />
        <Route
          path="/log-analysis"
          element={
            <ProtectedRoute>
              <ProtectedSOCShell />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-investigation"
          element={
            <ProtectedRoute>
              <ProtectedSOCShell />
            </ProtectedRoute>
          }
        />
        <Route
          path="/threats"
          element={
            <ProtectedRoute>
              <ProtectedSOCShell />
            </ProtectedRoute>
          }
        />
        <Route
          path="/threat-detail"
          element={
            <ProtectedRoute>
              <ProtectedSOCShell />
            </ProtectedRoute>
          }
        />
        <Route
          path="/incidents"
          element={
            <ProtectedRoute>
              <ProtectedSOCShell />
            </ProtectedRoute>
          }
        />
        <Route
          path="/incident-detail"
          element={
            <ProtectedRoute>
              <ProtectedSOCShell />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ProtectedSOCShell />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <ProtectedSOCShell />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <ProtectedSOCShell />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </SOCProvider>
  );
}
