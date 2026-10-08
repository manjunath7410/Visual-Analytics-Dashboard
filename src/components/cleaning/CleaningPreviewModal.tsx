import React from 'react';
import { AlertCircle, Check, X, ArrowRight } from 'lucide-react';

interface CleaningPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  affectedRowCount: number;
  previewColumn?: string;
  beforeSample: any[];
  afterSample: any[];
}

export const CleaningPreviewModal: React.FC<CleaningPreviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  affectedRowCount,
  previewColumn,
  beforeSample,
  afterSample
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {title}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Impact Warning */}
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-indigo-50/80 p-3 text-xs text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
          <span>
            <strong>{affectedRowCount.toLocaleString()} rows</strong> will be affected by this transformation.
          </span>
        </div>

        {/* Before vs After Side-by-Side Comparison */}
        {previewColumn && (
          <div className="mt-4">
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Transformation Preview ({previewColumn})
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-950/60">
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  BEFORE (Current)
                </span>
                <div className="space-y-1.5 font-mono text-[11px]">
                  {beforeSample.map((val, idx) => (
                    <div
                      key={idx}
                      className="rounded bg-white px-2 py-1 border border-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 truncate"
                    >
                      {val === null || val === undefined || val === '' ? (
                        <span className="text-rose-500 italic font-semibold">NULL</span>
                      ) : (
                        String(val)
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-indigo-200 bg-indigo-50/30 p-3 dark:border-indigo-950/60 dark:bg-indigo-950/20">
                <span className="font-mono text-[10px] font-bold text-indigo-500 uppercase tracking-wider block mb-2">
                  AFTER (Projected)
                </span>
                <div className="space-y-1.5 font-mono text-[11px]">
                  {afterSample.map((val, idx) => (
                    <div
                      key={idx}
                      className="rounded bg-white px-2 py-1 border border-indigo-100 text-indigo-700 dark:border-indigo-900/60 dark:bg-slate-900 dark:text-indigo-300 font-semibold truncate"
                    >
                      {val === null || val === undefined || val === '' ? (
                        <span className="text-slate-400 italic">NULL</span>
                      ) : (
                        String(val)
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-3 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500"
          >
            <span>Apply Changes</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
