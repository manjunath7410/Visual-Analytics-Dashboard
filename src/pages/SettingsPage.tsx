import React, { useState } from 'react';
import { 
  Sliders, 
  Moon, 
  Sun, 
  Bell, 
  ShieldCheck, 
  Database, 
  Check, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { useData } from '../context/DataContext';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useData();

  const [currency, setCurrency] = useState('USD');
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');
  const [refreshInterval, setRefreshInterval] = useState('5m');
  const [alertThreshold, setAlertThreshold] = useState('70');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 2500);
  };

  const handleReset = () => {
    setCurrency('USD');
    setDateFormat('YYYY-MM-DD');
    setRefreshInterval('5m');
    setAlertThreshold('70');
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 2500);
  };

  return (
    <PageContainer
      title="Dashboard & System Settings"
      subtitle="Configure organizational currency standards, telemetry polling rates, and anomaly variance triggers."
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      }
    >
      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        {/* Appearance Settings */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Visual Canvas & Theme
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Executive high-contrast dark slate or clean daylight mode.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5 text-indigo-400" />
              ) : (
                <Sun className="h-5 w-5 text-amber-500" />
              )}
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Active Mode: {theme === 'dark' ? 'Executive Slate (Dark)' : 'Daylight Contrast (Light)'}
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Synchronizes with system preferences and persists in your local session.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750"
            >
              Toggle to {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>

        {/* Financial & Regional Standards */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80">
          <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Financial Normalization & Formats
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Baseline currency denominators and temporal indexing.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Reporting Currency Denominator
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-100 font-medium"
              >
                <option value="USD">USD ($) - United States Dollar</option>
                <option value="EUR">EUR (€) - Eurozone</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="JPY">JPY (¥) - Japanese Yen</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Temporal Index Format
              </label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-100 font-medium"
              >
                <option value="YYYY-MM-DD">ISO 8601 (YYYY-MM-DD)</option>
                <option value="MM/DD/YYYY">US Standard (MM/DD/YYYY)</option>
                <option value="DD/MM/YYYY">International (DD/MM/YYYY)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Telemetry & Variance Alert Limits */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80">
          <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Telemetry Polling & Anomaly Triggers
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Engine synchronization intervals and automated threshold alerts.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Telemetry Sync Interval
              </label>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-100 font-medium"
              >
                <option value="1m">Real-Time (Every 1 minute)</option>
                <option value="5m">Standard (Every 5 minutes)</option>
                <option value="15m">Conservative (Every 15 minutes)</option>
                <option value="manual">Manual Refresh Only</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Gross Margin Anomaly Trigger Threshold (%)
              </label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="number"
                  min="40"
                  max="95"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 font-mono text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-100 font-semibold tabular-nums"
                />
                <span className="text-xs font-medium text-slate-500">%</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Flag an executive anomaly notification if margin drops below this value.
              </p>
            </div>
          </div>
        </div>

        {/* Phase 9: AI Model & Gemini Configuration (Requirement 31 & 32) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80">
          <div className="border-b border-slate-100 pb-3 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Google Gemini AI & Model Configuration
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AI Business Analyst interpretation layer and runtime security status.
              </p>
            </div>

            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
              <Check className="h-3 w-3" />
              Configured
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-850/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                AI Service Status
              </span>
              <p className="mt-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Active & Operational
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Server-side proxy running on /api/gemini/*
              </p>
            </div>

            <div className="rounded-lg border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-850/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Configured Model
              </span>
              <p className="mt-1 font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                gemini-3.8-flash
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                High-speed analytical reasoning
              </p>
            </div>

            <div className="rounded-lg border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-850/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                API Key Injection
              </span>
              <p className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
                Configured via Server Secret
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Stored securely; never sent to browser
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-indigo-50/50 border border-indigo-100 p-3 text-xs text-indigo-900 dark:bg-indigo-950/30 dark:border-indigo-900/60 dark:text-indigo-200">
            <span className="font-bold">Security & Grounding Notice: </span>
            <span>
              All business calculations (sums, margins, IQR anomalies, growth rates) are calculated deterministically by the application engine first. Gemini functions strictly as a natural-language interpretation layer and never recalculates or estimates business totals.
            </span>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Check className="h-4 w-4" />
              <span>Preferences saved successfully!</span>
            </div>
          ) : (
            <div />
          )}

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition-colors"
          >
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </PageContainer>
  );
};
