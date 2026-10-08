import React, { useState, useMemo } from 'react';
import { ColumnMetadata } from '../../types/dataset';
import { 
  Binary, 
  Tag, 
  Calendar, 
  Type, 
  Search, 
  X, 
  ChevronRight, 
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { ColumnDetailDrawer } from './ColumnDetailDrawer';

interface ColumnMetadataTableProps {
  columns: ColumnMetadata[];
  rowCount: number;
  rows?: Record<string, any>[];
  className?: string;
}

export const ColumnMetadataTable: React.FC<ColumnMetadataTableProps> = ({
  columns,
  rowCount,
  rows = [],
  className = ''
}) => {
  const [columnSearch, setColumnSearch] = useState<string>('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'Number' | 'Category' | 'Date' | 'Text'>('all');
  const [activeDrawerColumn, setActiveDrawerColumn] = useState<ColumnMetadata | null>(null);

  // Filter columns based on search and type filter
  const filteredColumns = useMemo(() => {
    return columns.filter((col) => {
      // Type filter
      if (selectedTypeFilter !== 'all') {
        if (selectedTypeFilter === 'Text') {
          if (col.type === 'Number' || col.type === 'Date') return false;
        } else if (col.type !== selectedTypeFilter) {
          return false;
        }
      }

      // Search filter
      if (columnSearch.trim()) {
        const q = columnSearch.toLowerCase().trim();
        const matchesName = col.name.toLowerCase().includes(q);
        const matchesType = col.type.toLowerCase().includes(q);
        return matchesName || matchesType;
      }

      return true;
    });
  }, [columns, columnSearch, selectedTypeFilter]);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Number':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
            <Binary className="h-3 w-3" />
            <span>123 Numeric</span>
          </span>
        );
      case 'Category':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
            <Tag className="h-3 w-3" />
            <span>Aa Category</span>
          </span>
        );
      case 'Date':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
            <Calendar className="h-3 w-3" />
            <span>Date</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Type className="h-3 w-3" />
            <span>Text</span>
          </span>
        );
    }
  };

  const typeCounts = useMemo(() => {
    return {
      all: columns.length,
      Number: columns.filter(c => c.type === 'Number').length,
      Category: columns.filter(c => c.type === 'Category').length,
      Date: columns.filter(c => c.type === 'Date').length,
    };
  }, [columns]);

  return (
    <>
      <div className={`overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 ${className}`}>
        {/* Header Ribbon with Search & Type Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 px-4 py-3.5 dark:border-slate-800 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Column Profile & Data Schema
              </h3>
              <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                {filteredColumns.length} of {columns.length} columns
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Click any column row to inspect distribution stats, cardinality, and frequency histograms
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Type Filter Tabs */}
            <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50/80 p-0.5 text-xs dark:border-slate-800 dark:bg-slate-950/60">
              <button
                onClick={() => setSelectedTypeFilter('all')}
                className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                  selectedTypeFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold dark:bg-slate-800 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                All ({typeCounts.all})
              </button>
              <button
                onClick={() => setSelectedTypeFilter('Number')}
                className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                  selectedTypeFilter === 'Number'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold dark:bg-slate-800 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Numeric ({typeCounts.Number})
              </button>
              <button
                onClick={() => setSelectedTypeFilter('Category')}
                className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                  selectedTypeFilter === 'Category'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold dark:bg-slate-800 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Category ({typeCounts.Category})
              </button>
              <button
                onClick={() => setSelectedTypeFilter('Date')}
                className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                  selectedTypeFilter === 'Date'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold dark:bg-slate-800 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Date ({typeCounts.Date})
              </button>
            </div>

            {/* Column Search Input */}
            <div className="relative w-full sm:w-48 flex items-center">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none shrink-0" />
              <input
                type="text"
                value={columnSearch}
                onChange={(e) => setColumnSearch(e.target.value)}
                placeholder="Search columns..."
                className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8.5 pr-7 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-850 dark:text-slate-100"
              />
              {columnSearch && (
                <button
                  onClick={() => setColumnSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label="Clear column search"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table Area */}
        {filteredColumns.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500 dark:text-slate-400">
            <p className="font-semibold text-slate-700 dark:text-slate-300">No matching columns found</p>
            <p className="mt-1">Try another search term or reset your type filter.</p>
            <button
              onClick={() => {
                setColumnSearch('');
                setSelectedTypeFilter('all');
              }}
              className="mt-3 inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
            >
              Reset Column Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Column Name</th>
                  <th className="py-2.5 px-3 font-semibold">Detected Type</th>
                  <th className="py-2.5 px-3 font-semibold">Role</th>
                  <th className="py-2.5 px-3 text-right font-semibold">Non-Empty</th>
                  <th className="py-2.5 px-3 text-right font-semibold">Missing</th>
                  <th className="py-2.5 px-3 text-right font-semibold">Fill Rate</th>
                  <th className="py-2.5 px-3 text-right font-semibold">Unique</th>
                  <th className="py-2.5 px-4 font-semibold">Value Profile / Summary</th>
                  <th className="py-2.5 px-3 text-right font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px] dark:divide-slate-800/60">
                {filteredColumns.map((col) => {
                  const fillRate = rowCount > 0 ? ((col.nonEmptyCount / rowCount) * 100).toFixed(1) : '0.0';
                  const roleLabel = col.uniqueCount === rowCount && rowCount > 0 ? 'Unique ID' : col.type === 'Number' ? 'Measure' : 'Dimension';

                  return (
                    <tr 
                      key={col.name} 
                      onClick={() => setActiveDrawerColumn(col)}
                      className="group h-10 cursor-pointer hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-colors"
                      title={`Click to inspect detailed profile for "${col.name}"`}
                    >
                      <td className="py-2 px-4 font-semibold text-slate-900 dark:text-slate-100 font-sans group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {col.name}
                      </td>
                      <td className="py-2 px-3 font-sans">
                        {getTypeBadge(col.type)}
                      </td>
                      <td className="py-2 px-3 font-sans text-slate-500 dark:text-slate-400">
                        <span className="inline-flex rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {roleLabel}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700 dark:text-slate-300 tabular-nums">
                        {col.nonEmptyCount.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right tabular-nums">
                        {col.missingCount > 0 ? (
                          <span className="text-amber-600 dark:text-amber-400 font-semibold">
                            {col.missingCount.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right tabular-nums">
                        <span className={Number(fillRate) < 90 ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-emerald-600 dark:text-emerald-400'}>
                          {fillRate}%
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700 dark:text-slate-300 tabular-nums">
                        {col.uniqueCount.toLocaleString()}
                      </td>
                      <td className="py-2 px-4 font-sans text-slate-500 dark:text-slate-400 truncate max-w-[220px]">
                        {col.type === 'Number' && col.min !== undefined && col.max !== undefined ? (
                          <span className="font-mono text-[10px] text-slate-600 dark:text-slate-300">
                            min: {col.min.toLocaleString()} · max: {col.max.toLocaleString()}
                          </span>
                        ) : col.type === 'Date' && col.minDate && col.maxDate ? (
                          <span className="font-mono text-[10px] text-slate-600 dark:text-slate-300">
                            {col.minDate} → {col.maxDate}
                          </span>
                        ) : col.type === 'Category' && col.uniqueValues ? (
                          <span className="text-[10px] text-slate-600 dark:text-slate-300 truncate block">
                            {col.uniqueValues.slice(0, 3).join(', ')}{col.uniqueValues.length > 3 ? ` (+${col.uniqueValues.length - 3})` : ''}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">-</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right font-sans text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        <ChevronRight className="h-4 w-4 inline transition-transform group-hover:translate-x-0.5" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Column Detail Drawer */}
      <ColumnDetailDrawer
        column={activeDrawerColumn}
        rowCount={rowCount}
        rows={rows}
        isOpen={Boolean(activeDrawerColumn)}
        onClose={() => setActiveDrawerColumn(null)}
      />
    </>
  );
};
