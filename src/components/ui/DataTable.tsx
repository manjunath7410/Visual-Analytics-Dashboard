import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react';
import { Button } from './Button';

export interface ColumnDef<T> {
  key: string;
  header: string;
  accessor?: (item: T) => any;
  render?: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  isNumeric?: boolean;
  sortable?: boolean;
  width?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  pageSize?: number;
  density?: 'compact' | 'comfortable';
  searchable?: boolean;
  searchPlaceholder?: string;
  stickyHeader?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  pageSize = 10,
  density = 'comfortable',
  searchable = true,
  searchPlaceholder = 'Filter rows...',
  stickyHeader = true,
  emptyMessage = 'No records found',
  className = '',
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [currentDensity, setCurrentDensity] = useState<'compact' | 'comfortable'>(density);

  // Filter rows
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter((item) =>
      Object.values(item).some((val) =>
        String(val ?? '').toLowerCase().includes(term)
      )
    );
  }, [data, searchTerm]);

  // Sort rows
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    const col = columns.find((c) => c.key === sortKey);
    return [...filteredData].sort((a, b) => {
      let valA = col?.accessor ? col.accessor(a) : a[sortKey];
      let valB = col?.accessor ? col.accessor(b) : b[sortKey];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }

      return sortOrder === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredData, sortKey, sortOrder, columns]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else {
        setSortKey(null);
        setSortOrder('asc');
      }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const isCompact = currentDensity === 'compact';

  return (
    <div className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 ${className}`}>
      {/* Table Toolbar */}
      {searchable && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-3 dark:border-slate-800">
          <div className="relative min-w-[200px] flex-1 max-w-sm flex items-center">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50/60 pl-8.5 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono text-slate-500 dark:text-slate-400 tabular-nums text-[11px]">
              {sortedData.length.toLocaleString()} rows
            </span>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
            <button
              onClick={() => setCurrentDensity(isCompact ? 'comfortable' : 'compact')}
              className="rounded px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              {isCompact ? 'Comfortable' : 'Compact'}
            </button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead
            className={`bg-slate-50/90 text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:bg-slate-950/80 dark:text-slate-400 ${
              stickyHeader ? 'sticky top-0 z-10' : ''
            }`}
          >
            <tr>
              {columns.map((col) => {
                const alignClass =
                  col.align === 'right' || col.isNumeric
                    ? 'text-right'
                    : col.align === 'center'
                    ? 'text-center'
                    : 'text-left';

                return (
                  <th
                    key={col.key}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                    style={{ width: col.width }}
                    className={`
                      border-b border-slate-200/80 px-4 py-3 font-semibold select-none dark:border-slate-800/80
                      ${col.sortable !== false ? 'cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-900' : ''}
                      ${alignClass}
                    `}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === 'right' || col.isNumeric ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <span>{col.header}</span>
                      {sortKey === col.key && (
                        <span className="text-indigo-600 dark:text-indigo-400">
                          {sortOrder === 'asc' ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-10 text-center text-xs text-slate-400 dark:text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr
                  key={idx}
                  className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                >
                  {columns.map((col) => {
                    const alignClass =
                      col.align === 'right' || col.isNumeric
                        ? 'text-right font-mono tabular-nums'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left';

                    const value = col.render
                      ? col.render(row)
                      : col.accessor
                      ? col.accessor(row)
                      : row[col.key];

                    return (
                      <td
                        key={col.key}
                        className={`${
                          isCompact ? 'py-2 px-4' : 'py-3 px-4'
                        } ${alignClass} truncate max-w-[280px]`}
                      >
                        {value !== undefined && value !== null ? String(value) : '—'}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 dark:border-slate-800 text-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setPage(1)}
              disabled={currentPage === 1}
              aria-label="First page"
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setPage(totalPages)}
              disabled={currentPage === totalPages}
              aria-label="Last page"
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
