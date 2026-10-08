import React from 'react';
import { ShieldCheck, AlertCircle, Database, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dataset } from '../../types/dataset';

interface OperationalContextRowProps {
  dataset: Dataset;
  factRowCount?: number;
  dimensionCount?: number;
  className?: string;
}

export const OperationalContextRow: React.FC<OperationalContextRowProps> = ({
  dataset,
  factRowCount = 0,
  dimensionCount = 0,
  className = '',
}) => {
  const navigate = useNavigate();

  // Data Quality computations
  const missingCount = dataset.statistics.missingValuesCount || 0;
  const duplicateCount = dataset.statistics.duplicateRowsCount || 0;
  const totalCells = dataset.statistics.rowCount * (dataset.columns.length || 1);
  const missingPct = totalCells > 0 ? (missingCount / totalCells) * 100 : 0;
  const qualityScore = Math.max(70, Math.min(100, Math.round(100 - missingPct * 2)));

  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${className}`}>
      {/* 1. Data Quality Health Card */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Data Quality Health
              </span>
              <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {qualityScore}/100
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums truncate">
              <span>{missingCount} missing cells</span>
              <span>·</span>
              <span>{duplicateCount} duplicate rows</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/cleaning')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 shrink-0 cursor-pointer ml-2"
        >
          <span>ETL Audit</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* 2. Warehouse & Schema Status Card */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 shrink-0">
            <Database className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Star Schema Warehouse
              </span>
              <span className="rounded bg-indigo-50 px-1.5 py-0.2 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                Synchronized
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums truncate">
              <span>{dimensionCount || 5} Dimension Tables</span>
              <span>·</span>
              <span>{factRowCount.toLocaleString()} Fact Records</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/warehouse')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 shrink-0 cursor-pointer ml-2"
        >
          <span>Star Schema</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};
