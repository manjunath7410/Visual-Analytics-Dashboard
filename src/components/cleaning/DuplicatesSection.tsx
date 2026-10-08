import React from 'react';
import { Copy, Trash2, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface DuplicatesSectionProps {
  duplicateCount: number;
  totalRows: number;
  onRemoveDuplicates: () => void;
  onShowPreview: (config: {
    title: string;
    description: string;
    affectedRowCount: number;
    previewColumn?: string;
    beforeSample: any[];
    afterSample: any[];
    confirmAction: () => void;
  }) => void;
  className?: string;
}

export const DuplicatesSection: React.FC<DuplicatesSectionProps> = ({
  duplicateCount,
  totalRows,
  onRemoveDuplicates,
  onShowPreview,
  className = ''
}) => {
  const duplicatePercent = totalRows > 0 ? ((duplicateCount / totalRows) * 100).toFixed(1) : '0.0';

  const handleRequestRemove = () => {
    onShowPreview({
      title: 'Remove Duplicate Rows',
      description: `${duplicateCount.toLocaleString()} duplicate rows will be permanently filtered out of the cleaned dataset.`,
      affectedRowCount: duplicateCount,
      beforeSample: ['Duplicate Row A', 'Duplicate Row A', 'Duplicate Row B'],
      afterSample: ['Duplicate Row A', 'Duplicate Row B'],
      confirmAction: onRemoveDuplicates
    });
  };

  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 dark:border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <Copy className="h-4 w-4 text-indigo-500" />
          <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Duplicate Row Detection & Deduplication
          </h3>
        </div>
        <span className="font-mono text-xs text-slate-400">
          Full Record Hash Matching
        </span>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800/60 dark:bg-slate-850/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {duplicateCount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              redundant rows identified ({duplicatePercent}% of dataset)
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {duplicateCount === 0 
              ? 'No duplicate rows detected. All dataset records have unique signatures.' 
              : 'Identical records with identical values across all columns.'}
          </p>
        </div>

        <button
          onClick={handleRequestRemove}
          disabled={duplicateCount === 0}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Remove Duplicate Rows</span>
        </button>
      </div>
    </div>
  );
};
