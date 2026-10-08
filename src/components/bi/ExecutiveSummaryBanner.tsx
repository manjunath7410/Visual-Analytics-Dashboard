import React from 'react';
import { Sparkles, FileText, CheckCircle2, ChevronRight, Activity, ArrowUpRight } from 'lucide-react';
import { ExecutiveSummaryReport } from '../../types/businessIntelligence';

interface ExecutiveSummaryBannerProps {
  summary: ExecutiveSummaryReport;
  className?: string;
  onViewDeepDive?: () => void;
}

export const ExecutiveSummaryBanner: React.FC<ExecutiveSummaryBannerProps> = ({
  summary,
  className = '',
  onViewDeepDive
}) => {
  return (
    <div className={`rounded-xl border border-indigo-200/90 bg-gradient-to-r from-indigo-50/70 via-white to-sky-50/50 p-4 shadow-2xs dark:border-indigo-900/60 dark:from-indigo-950/40 dark:via-slate-900/60 dark:to-slate-900/40 ${className}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1.5 max-w-4xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase text-white shadow-2xs">
              <Activity className="h-3 w-3" />
              Executive BI Summary
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
              Synchronized at {summary.timestamp}
            </span>
          </div>

          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
            {summary.headline}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 pt-1">
            {summary.bulletPoints.map((point, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <span className="text-indigo-500 dark:text-indigo-400 font-bold shrink-0">•</span>
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>

        {onViewDeepDive && (
          <button
            onClick={onViewDeepDive}
            className="self-start lg:self-center inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-2xs hover:bg-indigo-50 dark:border-indigo-800 dark:bg-slate-900 dark:text-indigo-300 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <span>Full BI Dossier</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
