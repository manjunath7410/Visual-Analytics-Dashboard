import React from 'react';
import { Database, Calendar, Filter, Clock, CheckCircle2, Layers } from 'lucide-react';
import { Dataset } from '../../types/dataset';

interface DatasetContextBarProps {
  dataset: Dataset;
  filteredCount: number;
  totalCount: number;
  activeFilterCount: number;
  dateRangeStr?: string;
  lastAnalyzedTime?: string;
  className?: string;
}

export const DatasetContextBar: React.FC<DatasetContextBarProps> = ({
  dataset,
  filteredCount,
  totalCount,
  activeFilterCount,
  dateRangeStr = 'All Available Timeframes',
  lastAnalyzedTime = 'Live In-Memory Aggregator',
  className = '',
}) => {
  const percentage = totalCount > 0 ? ((filteredCount / totalCount) * 100).toFixed(1) : '100';

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 shadow-2xs dark:border-slate-800/80 dark:bg-slate-900/80 text-xs ${className}`}
    >
      {/* Left side: Dataset Name & Record Count */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-slate-700 dark:text-slate-300">
        <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
          <Database className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
          <span className="truncate max-w-[180px] sm:max-w-none">{dataset.name}</span>
        </div>

        <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>

        <div className="flex items-center gap-1.5 font-mono tabular-nums text-[11px]">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
          <span>
            <strong className="font-semibold text-slate-900 dark:text-slate-100">
              {filteredCount.toLocaleString()}
            </strong>{' '}
            / {totalCount.toLocaleString()} records
          </span>
          <span className="rounded bg-slate-100 px-1.5 py-0.2 font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {percentage}%
          </span>
        </div>

        {dateRangeStr && (
          <>
            <span className="text-slate-300 dark:text-slate-700 hidden md:inline" aria-hidden="true">·</span>
            <div className="hidden md:flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px]">
              <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
              <span>{dateRangeStr}</span>
            </div>
          </>
        )}
      </div>

      {/* Right side: Pipeline Cadence & Filter State */}
      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-[11px]">
        <div className="hidden sm:flex items-center gap-1 text-slate-500 dark:text-slate-400">
          <Clock className="h-3 w-3 text-slate-400" />
          <span>{lastAnalyzedTime}</span>
        </div>

        {activeFilterCount > 0 ? (
          <div className="flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50/80 px-2 py-0.5 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 font-medium">
            <Filter className="h-3 w-3" />
            <span>{activeFilterCount} active filter{activeFilterCount > 1 ? 's' : ''}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            <span>Unfiltered baseline</span>
          </div>
        )}
      </div>
    </div>
  );
};
