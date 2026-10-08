import React from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, FileCheck, Layers } from 'lucide-react';
import { ReportDataQualitySummary } from '../../types/reporting';

interface ReportDataQualitySectionProps {
  summary: ReportDataQualitySummary;
  className?: string;
}

export const ReportDataQualitySection: React.FC<ReportDataQualitySectionProps> = ({
  summary,
  className = ''
}) => {
  return (
    <div className={`rounded-xl border border-emerald-200/80 bg-white p-5 shadow-2xs dark:border-emerald-900/60 dark:bg-slate-900/90 break-inside-avoid ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-100 pb-2.5 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
            Data Quality & Pipeline Governance Audit
          </h3>
        </div>

        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          ETL Status: {summary.etlStatus}
        </span>
      </div>

      {/* KPI Cards */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-850/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quality Score</span>
          <p className="mt-1 font-mono text-xl font-bold text-emerald-600 dark:text-emerald-400">{summary.qualityScore}/100</p>
          <span className="text-[10px] text-slate-500">Completeness & Typing</span>
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-850/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Evaluated Rows</span>
          <p className="mt-1 font-mono text-xl font-bold text-slate-900 dark:text-slate-100">{summary.totalRows.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500">{summary.totalColumns} attributes</span>
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-850/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Missing Values</span>
          <p className="mt-1 font-mono text-xl font-bold text-slate-900 dark:text-slate-100">{summary.missingValuesCount}</p>
          <span className="text-[10px] text-slate-500">{summary.missingValuesPercentage}% missing rate</span>
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-850/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Duplicate Records</span>
          <p className="mt-1 font-mono text-xl font-bold text-slate-900 dark:text-slate-100">{summary.duplicateRowsCount}</p>
          <span className="text-[10px] text-slate-500">Deduplicated in ETL</span>
        </div>
      </div>

      {/* Applied Cleaning Operations List */}
      <div className="mt-3.5 border-t border-slate-100 pt-2.5 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Applied Transformation & Cleaning Rules:</span>
        <ul className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600 dark:text-slate-400">
          {summary.cleaningOperations.map((op, idx) => (
            <li key={idx} className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
              <span>{op}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
