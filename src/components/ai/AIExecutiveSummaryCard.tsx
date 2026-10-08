import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, AlertTriangle, Layers, RotateCcw } from 'lucide-react';
import { AIExecutiveSummary, StructuredAnalyticsContext } from '../../types/gemini';

interface AIExecutiveSummaryCardProps {
  summary: AIExecutiveSummary | null;
  context: StructuredAnalyticsContext;
  loading: boolean;
  onRefresh?: () => void;
  className?: string;
}

export const AIExecutiveSummaryCard: React.FC<AIExecutiveSummaryCardProps> = ({
  summary,
  context,
  loading,
  onRefresh,
  className = ''
}) => {
  return (
    <div className={`rounded-xl border border-indigo-200/90 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 p-5 shadow-2xs dark:border-indigo-900/60 dark:from-indigo-950/40 dark:via-slate-900/80 dark:to-slate-900/40 ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 pb-3 dark:border-indigo-900/60">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-2xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>AI Business Analyst Summary</span>
              <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                Gemini Interpreted
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Grounded natural-language briefing derived strictly from active filtered calculations
            </p>
          </div>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-white px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:bg-slate-900 dark:text-indigo-300 transition-colors shadow-2xs disabled:opacity-50"
          >
            <RotateCcw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-analyze</span>
          </button>
        )}
      </div>

      {/* Active Filter Scope Pill (Requirement 22 & 23) */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-slate-500 dark:text-slate-400">Analysis Context:</span>
        <span className="rounded-md bg-white px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
          {context.datasetSummary.rowCount.toLocaleString()} records evaluated ({context.activeFilters.filteredPercentage}% of total)
        </span>
        {context.activeFilters.region && (
          <span className="rounded-md bg-indigo-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
            Region: {context.activeFilters.region.join(', ')}
          </span>
        )}
        {context.activeFilters.category && (
          <span className="rounded-md bg-indigo-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
            Category: {context.activeFilters.category.join(', ')}
          </span>
        )}
        {context.activeFilters.dateRange && (
          <span className="rounded-md bg-indigo-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
            Date: {context.activeFilters.dateRange.preset || `${context.activeFilters.dateRange.start} → ${context.activeFilters.dateRange.end}`}
          </span>
        )}
      </div>

      {/* Body content */}
      {loading ? (
        <div className="py-6 text-center text-xs text-indigo-600 dark:text-indigo-300 flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4 animate-spin" />
          <span>Synthesizing executive briefing from mathematical results...</span>
        </div>
      ) : summary ? (
        <div className="mt-4 space-y-3.5">
          {/* Overall Performance */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Overall Performance
            </h4>
            <p className="mt-1 text-xs leading-relaxed font-medium text-slate-800 dark:text-slate-200">
              {summary.overallPerformance}
            </p>
          </div>

          {/* Strongest & Weakest Vectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="rounded-lg border border-emerald-200/80 bg-emerald-50/50 p-2.5 dark:border-emerald-900/60 dark:bg-emerald-950/30">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Strongest Vector
              </span>
              <p className="mt-0.5 text-xs text-emerald-950 dark:text-emerald-100 font-medium">
                {summary.strongestArea}
              </p>
            </div>

            <div className="rounded-lg border border-amber-200/80 bg-amber-50/50 p-2.5 dark:border-amber-900/60 dark:bg-amber-950/30">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Area Requiring Focus
              </span>
              <p className="mt-0.5 text-xs text-amber-950 dark:text-amber-100 font-medium">
                {summary.weakestArea}
              </p>
            </div>
          </div>

          {/* Important Trend & Anomaly */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Chronological Trend
              </span>
              <p className="mt-0.5 text-xs text-slate-700 dark:text-slate-300">
                {summary.importantTrend}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Statistical Anomaly
              </span>
              <p className="mt-0.5 text-xs text-slate-700 dark:text-slate-300">
                {summary.importantAnomaly}
              </p>
            </div>
          </div>

          {/* Recommended Action */}
          <div className="rounded-lg border border-indigo-200/90 bg-indigo-50/60 p-3 dark:border-indigo-900 dark:bg-indigo-950/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200">
              Primary Executive Action
            </span>
            <p className="mt-0.5 text-xs text-indigo-950 dark:text-indigo-100 font-semibold">
              {summary.recommendedAction}
            </p>
          </div>
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-slate-400">
          Click "Re-analyze" to trigger AI synthesis from the current filtered metrics.
        </div>
      )}

      {/* Mandatory Disclaimer (Requirement 25) */}
      <div className="mt-4 border-t border-indigo-100 pt-2.5 text-[10px] text-slate-400 dark:border-slate-800 dark:text-slate-500 flex items-center justify-between">
        <span>* AI-generated interpretations are based on the analytical results shown in this dashboard. Verify important business decisions against the underlying data.</span>
        <span>Source of Truth: Application Calculations</span>
      </div>
    </div>
  );
};
