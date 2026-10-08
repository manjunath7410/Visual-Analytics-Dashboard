import React, { useEffect } from 'react';
import { 
  X, 
  Binary, 
  Tag, 
  Calendar, 
  Type, 
  Hash, 
  CheckCircle2, 
  AlertTriangle, 
  Percent, 
  Sparkles,
  BarChart2,
  ListFilter
} from 'lucide-react';
import { ColumnMetadata } from '../../types/dataset';

interface ColumnDetailDrawerProps {
  column: ColumnMetadata | null;
  rowCount: number;
  rows?: Record<string, any>[];
  isOpen: boolean;
  onClose: () => void;
}

export const ColumnDetailDrawer: React.FC<ColumnDetailDrawerProps> = ({
  column,
  rowCount,
  rows = [],
  isOpen,
  onClose
}) => {
  // Handle escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !column) return null;

  const fillRate = rowCount > 0 ? ((column.nonEmptyCount / rowCount) * 100).toFixed(1) : '0.0';
  const missingRate = rowCount > 0 ? ((column.missingCount / rowCount) * 100).toFixed(1) : '0.0';

  // Compute top unique values with frequency if rows are provided
  const valueFrequencies = (() => {
    if (!rows || rows.length === 0) return [];
    const counts: Record<string, number> = {};
    for (const row of rows) {
      const val = row[column.name];
      if (val !== null && val !== undefined && val !== '') {
        const key = String(val);
        counts[key] = (counts[key] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([value, count]) => ({
        value,
        count,
        percentage: ((count / (column.nonEmptyCount || 1)) * 100).toFixed(1)
      }));
  })();

  const getTypeIcon = () => {
    switch (column.type) {
      case 'Number':
        return <Binary className="h-4 w-4 text-violet-500" />;
      case 'Category':
        return <Tag className="h-4 w-4 text-teal-500" />;
      case 'Date':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      default:
        return <Type className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      {/* Backdrop click handler */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Drawer Container */}
      <div 
        className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in slide-in-from-right duration-250"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
              {getTypeIcon()}
            </div>
            <div>
              <h2 id="drawer-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
                {column.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Type: <strong className="font-semibold text-slate-700 dark:text-slate-300">{column.type}</strong></span>
                <span>·</span>
                <span>Role: <strong className="font-semibold text-slate-700 dark:text-slate-300">{column.uniqueCount === rowCount && rowCount > 0 ? 'Unique ID' : column.type === 'Number' ? 'Measure' : 'Dimension'}</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            aria-label="Close drawer (Esc)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-850/50">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Filled Records</span>
              <div className="mt-1 font-mono text-lg font-bold text-slate-900 tabular-nums dark:text-slate-100">
                {column.nonEmptyCount.toLocaleString()}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500">
                <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full" 
                    style={{ width: `${fillRate}%` }}
                  />
                </div>
                <span className="font-mono">{fillRate}%</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-850/50">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Missing / Nulls</span>
              <div className={`mt-1 font-mono text-lg font-bold tabular-nums ${column.missingCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-slate-100'}`}>
                {column.missingCount.toLocaleString()}
              </div>
              <div className="mt-1 text-[10px] text-slate-500">
                {column.missingCount > 0 ? `${missingRate}% missing rate` : '100% complete'}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-850/50">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Unique Values</span>
              <div className="mt-1 font-mono text-lg font-bold text-slate-900 tabular-nums dark:text-slate-100">
                {column.uniqueCount.toLocaleString()}
              </div>
              <div className="mt-1 text-[10px] text-slate-500">
                Cardinality ratio: {((column.uniqueCount / (column.nonEmptyCount || 1)) * 100).toFixed(1)}%
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-850/50">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Completeness</span>
              <div className="mt-1 font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {fillRate}%
              </div>
              <div className="mt-1 text-[10px] text-slate-500">
                {Number(fillRate) >= 95 ? 'High quality' : 'May need imputation'}
              </div>
            </div>
          </div>

          {/* Statistical Properties */}
          {column.type === 'Number' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <BarChart2 className="h-3.5 w-3.5 text-violet-500" />
                <span>Descriptive Statistics</span>
              </h3>
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white font-mono text-xs dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex justify-between px-3.5 py-2.5">
                  <span className="font-sans text-slate-500 dark:text-slate-400">Minimum Value</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">{column.min !== undefined ? column.min.toLocaleString() : '-'}</span>
                </div>
                <div className="flex justify-between px-3.5 py-2.5">
                  <span className="font-sans text-slate-500 dark:text-slate-400">Maximum Value</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">{column.max !== undefined ? column.max.toLocaleString() : '-'}</span>
                </div>
                <div className="flex justify-between px-3.5 py-2.5">
                  <span className="font-sans text-slate-500 dark:text-slate-400">Mean / Average</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">{column.mean !== undefined ? column.mean.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '-'}</span>
                </div>
                <div className="flex justify-between px-3.5 py-2.5">
                  <span className="font-sans text-slate-500 dark:text-slate-400">Value Range (Max - Min)</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">{column.max !== undefined && column.min !== undefined ? (column.max - column.min).toLocaleString() : '-'}</span>
                </div>
              </div>
            </div>
          )}

          {column.type === 'Date' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-blue-500" />
                <span>Temporal Bounds</span>
              </h3>
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white font-mono text-xs dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex justify-between px-3.5 py-2.5">
                  <span className="font-sans text-slate-500 dark:text-slate-400">Earliest Date</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{column.minDate || '-'}</span>
                </div>
                <div className="flex justify-between px-3.5 py-2.5">
                  <span className="font-sans text-slate-500 dark:text-slate-400">Latest Date</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{column.maxDate || '-'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Top Frequencies / Values */}
          {valueFrequencies.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <ListFilter className="h-3.5 w-3.5 text-teal-500" />
                <span>Top Value Frequencies ({valueFrequencies.length})</span>
              </h3>
              <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-950 text-xs">
                {valueFrequencies.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
                      <span className="truncate max-w-[200px]">{item.value}</span>
                      <span className="font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                        {item.count.toLocaleString()} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full bg-teal-500 rounded-full transition-all" 
                        style={{ width: `${Math.min(100, Math.max(4, Number(item.percentage)))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sample Raw Values */}
          {column.uniqueValues && column.uniqueValues.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Sample Distinct Domain Values
              </span>
              <div className="flex flex-wrap gap-1.5">
                {column.uniqueValues.slice(0, 12).map((val, idx) => (
                  <span
                    key={idx}
                    className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[11px] text-slate-700 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-300"
                  >
                    {String(val)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="border-t border-slate-200 px-5 py-3 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
