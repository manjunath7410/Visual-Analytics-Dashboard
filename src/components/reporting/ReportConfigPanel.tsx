import React, { useState } from 'react';
import { Sliders, Save, RotateCcw, Check, Sparkles, Layers, ShieldCheck, Database, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { ReportConfig } from '../../types/reporting';
import { createDefaultReportConfig } from '../../utils/reporting/reportTemplates';

interface ReportConfigPanelProps {
  config: ReportConfig;
  onChangeConfig: (newConfig: ReportConfig) => void;
  onSaveConfig: () => void;
  className?: string;
}

export const ReportConfigPanel: React.FC<ReportConfigPanelProps> = ({
  config,
  onChangeConfig,
  onSaveConfig,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleReset = () => {
    const defaults = createDefaultReportConfig(config.template);
    onChangeConfig({
      ...defaults,
      id: config.id,
      name: config.name
    });
  };

  const updateField = <K extends keyof ReportConfig>(field: K, val: ReportConfig[K]) => {
    onChangeConfig({
      ...config,
      [field]: val,
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div className={`rounded-xl border border-slate-200/90 bg-white shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 ${className}`}>
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Report Specifications & Section Configurator
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Configure report metadata, enabled analytical modules, and ranking limits
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={onSaveConfig}
            className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500 shadow-2xs transition-colors cursor-pointer"
          >
            <Save className="h-3 w-3" />
            <span>Save Configuration</span>
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 cursor-pointer"
          >
            <span>{isOpen ? 'Collapse' : 'Expand'}</span>
            {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 space-y-4 text-xs">
          {/* Metadata Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Report Title
              </label>
              <input
                type="text"
                value={config.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-850 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Report Subtitle
              </label>
              <input
                type="text"
                value={config.subtitle}
                onChange={(e) => updateField('subtitle', e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 focus:outline-hidden dark:border-slate-800 dark:bg-slate-850 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Author / Lead Analyst
              </label>
              <input
                type="text"
                value={config.author}
                onChange={(e) => updateField('author', e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 focus:outline-hidden dark:border-slate-800 dark:bg-slate-850 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Organization / Project
              </label>
              <input
                type="text"
                value={config.organization}
                onChange={(e) => updateField('organization', e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 focus:outline-hidden dark:border-slate-800 dark:bg-slate-850 dark:text-slate-200"
              />
            </div>
          </div>

          {/* Section Inclusion Checkboxes */}
          <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Included Analytical Sections:
              </span>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Rankings Limit (Top-N):</span>
                <select
                  value={config.topN}
                  onChange={(e) => updateField('topN', Number(e.target.value))}
                  className="rounded border border-slate-200 bg-white px-2 py-0.5 text-xs font-mono dark:border-slate-700 dark:bg-slate-800 font-bold"
                >
                  <option value={5}>Top 5</option>
                  <option value={10}>Top 10</option>
                  <option value={15}>Top 15</option>
                  <option value={20}>Top 20</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 cursor-pointer hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850">
                <input
                  type="checkbox"
                  checked={config.includeAIInsights}
                  onChange={(e) => updateField('includeAIInsights', e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-semibold text-slate-800 dark:text-slate-200">AI Business Brief</span>
              </label>

              <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 cursor-pointer hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850">
                <input
                  type="checkbox"
                  checked={config.includeAnomalies}
                  onChange={(e) => updateField('includeAnomalies', e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-semibold text-slate-800 dark:text-slate-200">Statistical Anomalies</span>
              </label>

              <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 cursor-pointer hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850">
                <input
                  type="checkbox"
                  checked={config.includeDataQuality}
                  onChange={(e) => updateField('includeDataQuality', e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-semibold text-slate-800 dark:text-slate-200">Data Quality Audit</span>
              </label>

              <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 cursor-pointer hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850">
                <input
                  type="checkbox"
                  checked={config.includeWarehouse}
                  onChange={(e) => updateField('includeWarehouse', e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-semibold text-slate-800 dark:text-slate-200">Star Schema Models</span>
              </label>

              <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 cursor-pointer hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850">
                <input
                  type="checkbox"
                  checked={config.includeOLAP}
                  onChange={(e) => updateField('includeOLAP', e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-semibold text-slate-800 dark:text-slate-200">OLAP Pivot Matrix</span>
              </label>

              <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 cursor-pointer hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850">
                <input
                  type="checkbox"
                  checked={config.includeRecommendations}
                  onChange={(e) => updateField('includeRecommendations', e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-semibold text-slate-800 dark:text-slate-200">Recommendations</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
