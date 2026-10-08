import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from './components/ui/ErrorState';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { DataUploadPage } from './pages/DataUploadPage';
import { DataExplorerPage } from './pages/DataExplorerPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { BusinessInsightsPage } from './pages/BusinessInsightsPage';
import { DataWarehousePage } from './pages/DataWarehousePage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { DataCleaningPage } from './pages/DataCleaningPage';
import { SQLAnalyticsPage } from './pages/SQLAnalyticsPage';

export default function App() {
  return (
    <ErrorBoundary>
      <DataProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="dashboard" element={<Navigate to="/" replace />} />
                <Route path="upload" element={<DataUploadPage />} />
                <Route path="cleaning" element={<DataCleaningPage />} />
                <Route path="explorer" element={<DataExplorerPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="sql" element={<SQLAnalyticsPage />} />
                <Route path="insights" element={<BusinessInsightsPage />} />
                <Route path="warehouse" element={<DataWarehousePage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </DataProvider>
    </ErrorBoundary>
  );
}
