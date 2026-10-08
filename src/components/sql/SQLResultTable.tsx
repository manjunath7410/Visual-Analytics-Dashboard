import React, { useState, useMemo } from 'react';
import { Table, Search, Download, Copy, ChevronLeft, ChevronRight, BarChart2, Check, ArrowUpDown } from 'lucide-react';
import { SQLQueryResult } from '../../types/sqlAnalytics';
import { exportToCSV, exportToJSON } from '../../utils/reporting/exportUtils';

interface SQLResultTableProps {
  result: SQLQueryResult;
  onToggleVisualize: () => void;
  isVisualizing: boolean;
  className?: string;
}

export const SQLResultTable: React.FC<SQLResultTableProps> = ({
  result,
  onToggleVisualize,
  isVisualizing,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDesc, setSortDesc] = useState(false);
  const [copied, setCopied] = useState(false);
  const pageSize = 12;

  // Filter & Sort
  const processedRows = useMemo(() => {
    let rows = [...result.rows];
    if (searchTerm.trim()) {
      const t = searchTerm.toLowerCase();
      rows = rows.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(t)));
    }
    if (sortCol) {
      rows.sort((a, b) => {
        const aV = a[sortCol];
        const bV = b[sortCol];
        if (typeof aV === 'number' && typeof bV === 'number') {
          return sortDesc ? bV - aV : aV - bV;
        }
        return sortDesc ? String(bV).localeCompare(String(aV)) : String(aV).localeCompare(String(bV));
      });
    }
    return rows;
  }, [result.rows, searchTerm, sortCol, sortDesc]);

  const totalPages = Math.max(1, Math.ceil(processedRows.length / pageSize));
  const currentPageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return processedRows.slice(start, start + pageSize);
  }, [processedRows, page, pageSize]);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(result.rows, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDesc(!sortDesc);
    } else {
      setSortCol(col);
      setSortDesc(false);
    }
  };

  if (!result.success || result.columns.length === 0) {
    return null;
  }

  return (
    <div className={`rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 text-xs ${className}`}>
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Table className="h-4 w-4 text-emerald-500" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
            Query Result Set ({result.rowCount.toLocaleString()} rows)
          </h3>
          <span className="font-mono text-[10px] text-slate-400">
            {result.executionTimeMs}ms execution
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Visualize Toggle */}
          <button
            onClick={onToggleVisualize}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition-colors ${
              isVisualizing
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300'
            }`}
          >
            <BarChart2 className="h-3.5 w-3.5" />
            <span>{isVisualizing ? 'Hide Visualizer' : 'Visualize Result'}</span>
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-300"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={() => exportToCSV(result.rows, 'sql_query_result')}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-300"
          >
            <Download className="h-3.5 w-3.5 text-emerald-600" />
            <span>CSV</span>
          </button>

          {/* Search */}
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              placeholder="Search results..."
              className="rounded-lg border border-slate-200 bg-slate-50 pl-8.5 pr-2.5 py-1 text-xs text-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-850 dark:text-slate-100 w-36"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-3 overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-850/60 dark:text-slate-300">
              {result.columns.map(col => (
                <th 
                  key={col} 
                  onClick={() => handleSort(col)}
                  className="py-2 px-3 whitespace-nowrap cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>{col}</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-60" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
            {currentPageRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-850/40">
                {result.columns.map(col => {
                  const val = row[col];
                  return (
                    <td key={col} className="py-2 px-3 whitespace-nowrap text-slate-800 dark:text-slate-200">
                      {val !== undefined && val !== null ? String(val) : '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, processedRows.length)} of {processedRows.length.toLocaleString()} rows
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded p-1 border border-slate-200 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-800 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-mono font-medium">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded p-1 border border-slate-200 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-800 dark:hover:bg-slate-800"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
