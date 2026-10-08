import React from 'react';
import { History, RotateCcw, Undo2, CheckCircle2, RotateCw } from 'lucide-react';
import { CleaningOperation } from '../../types/etl';

interface CleaningHistorySectionProps {
  history: CleaningOperation[];
  canUndo: boolean;
  onUndo: () => void;
  onResetCleaning: () => void;
  activeMode: 'clean' | 'raw';
  onToggleMode: (mode: 'clean' | 'raw') => void;
  className?: string;
}

export const CleaningHistorySection: React.FC<CleaningHistorySectionProps> = ({
  history,
  canUndo,
  onUndo,
  onResetCleaning,
  activeMode,
  onToggleMode,
  className = ''
}) => {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-indigo-500" />
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Audit Log & Transformation Rollback History
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Immutable event ledger with snapshot backups for one-click operation undo
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Raw vs Cleaned Data View Toggle (Requirement 13) */}
          <div className="flex items-center rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800 text-xs">
            <button
              onClick={() => onToggleMode('clean')}
              className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                activeMode === 'clean'
                  ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-slate-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Cleaned Data View
            </button>
            <button
              onClick={() => onToggleMode('raw')}
              className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                activeMode === 'raw'
                  ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-slate-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Raw Data View
            </button>
          </div>

          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
            title="Roll back the most recently applied cleaning step"
          >
            <Undo2 className="h-3.5 w-3.5" />
            <span>Undo Last Step</span>
          </button>

          <button
            onClick={onResetCleaning}
            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 shadow-2xs"
            title="Restore dataset to original uploaded CSV state"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Cleaning</span>
          </button>
        </div>
      </div>

      <div className="mt-4">
        {history.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No transformations applied yet. Dataset is currently in initial baseline state.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 dark:bg-slate-850 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2 px-3 font-semibold">Timestamp</th>
                  <th className="py-2 px-3 font-semibold">Operation Description</th>
                  <th className="py-2 px-3 font-semibold">Column</th>
                  <th className="py-2 px-3 text-right font-semibold">Affected Rows</th>
                  <th className="py-2 px-3 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px] dark:divide-slate-800/60">
                {history.map((op) => (
                  <tr key={op.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-850/40">
                    <td className="py-2 px-3 text-slate-500 whitespace-nowrap">
                      {op.timeFormatted}
                    </td>
                    <td className="py-2 px-3 font-sans text-slate-800 dark:text-slate-200 font-medium">
                      {op.description}
                    </td>
                    <td className="py-2 px-3 text-slate-600 dark:text-slate-400 font-sans">
                      {op.columnName || '-'}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums text-slate-700 dark:text-slate-300">
                      {op.affectedRows.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right font-sans">
                      <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        op.status === 'applied'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-500 line-through dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {op.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
