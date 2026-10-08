import React, { useState, useMemo } from 'react';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  X,
  Binary,
  Tag,
  Calendar,
  Type
} from 'lucide-react';
import { ColumnMetadata } from '../../types/dataset';

interface DataPreviewTableProps {
  rows: Record<string, any>[];
  columns: ColumnMetadata[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  className?: string;
  title?: string;
  onExportFiltered?: () => void;
}

export const DataPreviewTable: React.FC<DataPreviewTableProps> = ({
  rows,
  columns,
  searchQuery,
  onSearchChange,
  className = '',
  title = 'Dataset Preview Ledger',
  onExportFiltered
}) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);

  // 1. Global Search Filtering across all column values
  const searchedRows = useMemo(() => {
    if (!searchQuery || searchQuery.trim() === '') return rows;
    const query = searchQuery.trim().toLowerCase();

    return rows.filter((row) => {
      for (const col of columns) {
        const val = row[col.name];
        if (val !== null && val !== undefined) {
          const strVal = String(val).toLowerCase();
          if (strVal.includes(query)) {
            return true;
          }
        }
      }
      return false;
    });
  }, [rows, columns, searchQuery]);

  // 2. Sort Rows
  const sortedRows = useMemo(() => {
    if (!sortColumn) return searchedRows;

    return [...searchedRows].sort((a, b) => {
      const valA = a[sortColumn];
      const valB = b[sortColumn];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [searchedRows, sortColumn, sortDirection]);

  // 3. Paginate
  const totalPages = Math.ceil(sortedRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  const handleSort = (colName: string) => {
    if (sortColumn === colName) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortColumn(null); // Reset
      }
    } else {
      setSortColumn(colName);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const formatCellValue = (val: any, type: string): React.ReactNode => {
    if (val === null || val === undefined || val === '') {
      return <span className="text-slate-300 dark:text-slate-600 font-mono">-</span>;
    }
    if (typeof val === 'number' || type === 'Number') {
      const num = Number(val);
      if (isNaN(num) || !isFinite(num)) return '-';
      return <span className="font-mono tabular-nums">{num.toLocaleString()}</span>;
    }
    return String(val);
  };

  const getColIcon = (type: string) => {
    switch (type) {
      case 'Number':
        return <Binary className="h-3 w-3 text-violet-500 shrink-0" />;
      case 'Category':
        return <Tag className="h-3 w-3 text-teal-500 shrink-0" />;
      case 'Date':
        return <Calendar className="h-3 w-3 text-blue-500 shrink-0" />;
      default:
        return <Type className="h-3 w-3 text-slate-400 shrink-0" />;
    }
  };

  return (
    <div className={`overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 ${className}`}>
      {/* Table Header Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 px-4 py-3.5 dark:border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </h3>
            <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              {searchQuery ? `${searchedRows.length.toLocaleString()} matching records` : `${rows.length.toLocaleString()} total records`}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Comfortable tabular view with sticky headers, multi-type alignment, and live search
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Record Search Field */}
          <div className="relative w-full sm:w-64 flex items-center">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search records..."
              className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8.5 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-850 dark:text-slate-100 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  onSearchChange('');
                  setCurrentPage(1);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-4 w-4 items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {onExportFiltered && (
            <button
              onClick={onExportFiltered}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors shadow-2xs"
              title="Download currently filtered records as CSV"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table Area */}
      {paginatedRows.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
          <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No matching records found</p>
          <p>Try modifying or clearing your search term or adjusting active attribute filters.</p>
          {searchQuery && (
            <button
              onClick={() => {
                onSearchChange('');
                setCurrentPage(1);
              }}
              className="mt-2 inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[580px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 backdrop-blur-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/95 dark:text-slate-300">
              <tr>
                {/* Row Number Column */}
                <th className="py-2.5 px-3 font-semibold text-slate-400 w-12 text-center select-none sticky left-0 bg-slate-50/95 dark:bg-slate-900/95 z-20">
                  #
                </th>
                {columns.map((col) => {
                  const isSorted = sortColumn === col.name;
                  const isNum = col.type === 'Number';

                  return (
                    <th
                      key={col.name}
                      onClick={() => handleSort(col.name)}
                      className={`cursor-pointer select-none py-2.5 px-3.5 font-semibold transition-colors hover:text-slate-900 dark:hover:text-slate-100 whitespace-nowrap ${
                        isNum ? 'text-right' : 'text-left'
                      }`}
                    >
                      <div className={`inline-flex items-center gap-1.5 ${isNum ? 'flex-row-reverse' : ''}`}>
                        {getColIcon(col.type)}
                        <span>{col.name}</span>
                        {isSorted ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="h-3 w-3 text-indigo-500 shrink-0" />
                          ) : (
                            <ArrowDown className="h-3 w-3 text-indigo-500 shrink-0" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-30 hover:opacity-100 shrink-0" />
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans text-xs dark:divide-slate-800/60">
              {paginatedRows.map((row, idx) => {
                const globalRowNumber = (currentPage - 1) * pageSize + idx + 1;
                return (
                  <tr
                    key={idx}
                    className="h-9 hover:bg-slate-50/80 dark:hover:bg-slate-850/50 transition-colors"
                  >
                    <td className="py-1.5 px-3 text-center text-slate-400 font-mono text-[11px] tabular-nums select-none sticky left-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-850">
                      {globalRowNumber}
                    </td>
                    {columns.map((col) => {
                      const val = row[col.name];
                      const isNum = col.type === 'Number';
                      return (
                        <td
                          key={col.name}
                          className={`py-1.5 px-3.5 whitespace-nowrap text-slate-700 dark:text-slate-300 ${
                            isNum ? 'text-right text-slate-900 dark:text-slate-100 font-mono' : 'text-left'
                          }`}
                        >
                          {formatCellValue(val, col.type)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 gap-3 bg-slate-50/40 dark:bg-slate-950/30">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-850 dark:text-slate-300 cursor-pointer shadow-2xs"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>·</span>
          <span className="font-mono tabular-nums">
            Showing {sortedRows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sortedRows.length)} of {sortedRows.length.toLocaleString()} rows
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="font-mono tabular-nums">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage <= 1}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 disabled:opacity-30 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors shadow-2xs"
              aria-label="Previous Page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 disabled:opacity-30 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors shadow-2xs"
              aria-label="Next Page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
