import React from 'react';
import { Filter, Calendar, Layers, Database, CheckCircle2 } from 'lucide-react';
import { ReportFilterContext } from '../../types/reporting';

interface ReportFilterBannerProps {
  filterContext: ReportFilterContext;
  className?: string;
}

export const ReportFilterBanner: React.FC<ReportFilterBannerProps> = ({
  filterContext,
  className = ''
}) => {
  return (
    <div className={`rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 text-xs dark:border-slate-800 dark:bg-slate-850/60 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-indigo-500" />
          <span className="font-bold text-slate-900 dark:text-slate-100">
            Active Report Filter Context & Scope
          </span>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            Authoritative Analytics Scope
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
          <span>Target Dataset: <strong>{filterContext.datasetName}</strong></span>
          <span>·</span>
          <span>Records: <strong>{filterContext.filteredRows.toLocaleString()}</strong> of {filterContext.totalRows.toLocaleString()} ({filterContext.filteredPercentage}%)</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="font-semibold text-slate-600 dark:text-slate-400">
          Active Filter Constraints:
        </span>

        {filterContext.activeFilters.length > 0 ? (
          filterContext.activeFilters.map((f, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-white px-2 py-0.5 font-mono text-[11px] font-semibold text-indigo-800 dark:border-indigo-800 dark:bg-slate-900 dark:text-indigo-300 shadow-2xs"
            >
              <span className="text-slate-400 font-sans">{f.dimension}:</span>
              <span>{f.values.join(', ')}</span>
            </span>
          ))
        ) : (
          <span className="font-mono text-[11px] text-slate-500 italic">
            None (Full unfiltered dataset scope evaluated)
          </span>
        )}

        {filterContext.dateRange && (
          <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 shadow-2xs">
            <Calendar className="h-3 w-3 text-slate-400" />
            <span>{filterContext.dateRange}</span>
          </span>
        )}
      </div>
    </div>
  );
};
