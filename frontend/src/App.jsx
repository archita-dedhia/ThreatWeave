import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { LogAnalysisPage } from './pages/LogAnalysisPage';
import { ThreatsPage } from './pages/ThreatsPage';
import { ThreatDetailPage } from './pages/ThreatDetailPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="logs" element={<LogAnalysisPage />} />
        <Route path="threats" element={<ThreatsPage />} />
        <Route path="threats/:id" element={<ThreatDetailPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default App;
