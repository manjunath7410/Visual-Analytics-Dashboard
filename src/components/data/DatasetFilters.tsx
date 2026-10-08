import React, { useState } from 'react';
import { Filter, RotateCcw, ChevronDown, ChevronUp, Calendar, Binary, Tag } from 'lucide-react';
import { ColumnMetadata, FilterState, FilterValue } from '../../types/dataset';

interface DatasetFiltersProps {
  columns: ColumnMetadata[];
  filters: FilterState;
  onFilterChange: (columnName: string, filterValue: FilterValue | null) => void;
  onResetFilters: () => void;
  activeFilterCount: number;
  className?: string;
}

export const DatasetFilters: React.FC<DatasetFiltersProps> = ({
  columns,
  filters,
  onFilterChange,
  onResetFilters,
  activeFilterCount,
  className = ''
}) => {
  const [expanded, setExpanded] = useState<boolean>(true);

  // Filter columns suitable for interactive filtering (Categories, Numbers, Dates)
  const filterableColumns = columns.filter(
    c => c.type === 'Category' || c.type === 'Number' || c.type === 'Date'
  );

  if (filterableColumns.length === 0) return null;

  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-indigo-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Multi-Attribute Dataset Filtering
          </h3>
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {activeFilterCount} active
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle Filters Panel"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filterableColumns.slice(0, 8).map((col) => {
            const currentFilter = filters[col.name];

            // 1. Categorical column filter
            if (col.type === 'Category' && col.uniqueValues && col.uniqueValues.length > 0) {
              const selected = currentFilter?.selectedCategories || [];
              return (
                <div key={col.name} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800/60 dark:bg-slate-850/40">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                    <span className="truncate">{col.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">Category</span>
                  </div>
                  <div className="max-h-28 overflow-y-auto space-y-1 pr-1 text-xs">
                    {col.uniqueValues.slice(0, 10).map((val) => {
                      const isChecked = selected.includes(val);
                      return (
                        <label key={val} className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const next = e.target.checked
                                ? [...selected, val]
                                : selected.filter(item => item !== val);
                              if (next.length === 0) {
                                onFilterChange(col.name, null);
                              } else {
                                onFilterChange(col.name, {
                                  type: 'category',
                                  selectedCategories: next
                                });
                              }
                            }}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-0"
                          />
                          <span className="truncate">{val}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            }

            // 2. Numeric column filter
            if (col.type === 'Number' && col.min !== undefined && col.max !== undefined) {
              const minVal = currentFilter?.minNumber ?? '';
              const maxVal = currentFilter?.maxNumber ?? '';

              return (
                <div key={col.name} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800/60 dark:bg-slate-850/40">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                    <span className="truncate">{col.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">Range</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <input
                      type="number"
                      placeholder={`Min (${col.min})`}
                      value={minVal}
                      onChange={(e) => {
                        const val = e.target.value === '' ? undefined : Number(e.target.value);
                        if (val === undefined && currentFilter?.maxNumber === undefined) {
                          onFilterChange(col.name, null);
                        } else {
                          onFilterChange(col.name, {
                            type: 'number',
                            minNumber: val,
                            maxNumber: currentFilter?.maxNumber
                          });
                        }
                      }}
                      className="w-full rounded border border-slate-200 bg-white p-1 text-[11px] font-mono dark:border-slate-700 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    />
                    <span className="text-slate-400 text-xs">-</span>
                    <input
                      type="number"
                      placeholder={`Max (${col.max})`}
                      value={maxVal}
                      onChange={(e) => {
                        const val = e.target.value === '' ? undefined : Number(e.target.value);
                        if (val === undefined && currentFilter?.minNumber === undefined) {
                          onFilterChange(col.name, null);
                        } else {
                          onFilterChange(col.name, {
                            type: 'number',
                            minNumber: currentFilter?.minNumber,
                            maxNumber: val
                          });
                        }
                      }}
                      className="w-full rounded border border-slate-200 bg-white p-1 text-[11px] font-mono dark:border-slate-700 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              );
            }

            // 3. Date column filter
            if (col.type === 'Date') {
              const minD = currentFilter?.minDate ?? '';
              const maxD = currentFilter?.maxDate ?? '';

              return (
                <div key={col.name} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800/60 dark:bg-slate-850/40">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                    <span className="truncate">{col.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">Date</span>
                  </div>
                  <div className="space-y-1.5 mt-2">
                    <input
                      type="date"
                      value={minD}
                      onChange={(e) => {
                        const val = e.target.value || undefined;
                        if (!val && !currentFilter?.maxDate) {
                          onFilterChange(col.name, null);
                        } else {
                          onFilterChange(col.name, {
                            type: 'date',
                            minDate: val,
                            maxDate: currentFilter?.maxDate
                          });
                        }
                      }}
                      className="w-full rounded border border-slate-200 bg-white p-1 text-[10px] font-mono dark:border-slate-700 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    />
                    <input
                      type="date"
                      value={maxD}
                      onChange={(e) => {
                        const val = e.target.value || undefined;
                        if (!val && !currentFilter?.minDate) {
                          onFilterChange(col.name, null);
                        } else {
                          onFilterChange(col.name, {
                            type: 'date',
                            minDate: currentFilter?.minDate,
                            maxDate: val
                          });
                        }
                      }}
                      className="w-full rounded border border-slate-200 bg-white p-1 text-[10px] font-mono dark:border-slate-700 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      )}
    </div>
  );
};
