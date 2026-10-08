import React, { useState, useMemo } from 'react';
import { 
  Table, 
  Search, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Key, 
  Layers, 
  Database, 
  ArrowUpDown,
  Filter,
  CheckCircle2,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { StarSchema, DimensionTable, FactTable } from '../../types/dataWarehouse';
import { WarehouseBuilder } from '../../utils/warehouse/warehouseBuilder';

interface WarehouseExplorerTableProps {
  schema: StarSchema;
  selectedTableName: string;
  onSelectTable: (name: string) => void;
  className?: string;
}

export const WarehouseExplorerTable: React.FC<WarehouseExplorerTableProps> = ({
  schema,
  selectedTableName,
  onSelectTable,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tableFilter, setTableFilter] = useState<'all' | 'fact' | 'dimension'>('all');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const fact = schema.factTable;
  const dims = schema.dimensions;

  // Filtered table list based on segmented control
  const availableTables = useMemo(() => {
    if (tableFilter === 'fact') return [fact];
    if (tableFilter === 'dimension') return dims;
    return [fact, ...dims];
  }, [tableFilter, fact, dims]);

  // Active current table metadata
  const currentTable = useMemo(() => {
    if (selectedTableName === fact.name) {
      return {
        name: fact.name,
        isFact: true,
        primaryKey: fact.primaryKey,
        foreignKeys: fact.foreignKeys,
        measures: fact.measures,
        columns: fact.columns,
        rows: fact.rows,
        rowCount: fact.rowCount
      };
    }
    const dim = dims.find(d => d.name === selectedTableName) || dims[0];
    return {
      name: dim.name,
      isFact: false,
      primaryKey: dim.primaryKey,
      foreignKeys: [],
      measures: [],
      columns: dim.columns,
      rows: dim.rows,
      rowCount: dim.rowCount
    };
  }, [selectedTableName, fact, dims]);

  // Filter and Sort rows
  const processedRows = useMemo(() => {
    let result = [...currentTable.rows];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(row => 
        Object.values(row).some(v => String(v).toLowerCase().includes(term))
      );
    }

    // Column sort
    if (sortColumn) {
      result.sort((a, b) => {
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
        return sortDirection === 'asc' 
          ? strA.localeCompare(strB) 
          : strB.localeCompare(strA);
      });
    }

    return result;
  }, [currentTable.rows, searchTerm, sortColumn, sortDirection]);

  // Pagination math
  const totalPages = Math.max(1, Math.ceil(processedRows.length / pageSize));
  const currentPageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return processedRows.slice(start, start + pageSize);
  }, [processedRows, page, pageSize]);

  const handleSort = (colName: string) => {
    if (sortColumn === colName) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else {
        setSortColumn(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumn(colName);
      setSortDirection('asc');
    }
  };

  const handleExport = () => {
    WarehouseBuilder.exportToCSV(currentTable.name, processedRows);
  };

  return (
    <div className={`rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 ${className}`}>
      {/* Header & Table Category Segmented Control */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Table className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Warehouse Table Explorer
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Inspect physical schema tables, surrogate keys, foreign references, and stored relational records
          </p>
        </div>

        {/* Segmented Filter Control */}
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800 text-xs">
          <button
            onClick={() => setTableFilter('all')}
            className={`rounded-md px-2.5 py-1 font-semibold transition-colors cursor-pointer ${
              tableFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            All Tables ({dims.length + 1})
          </button>
          <button
            onClick={() => setTableFilter('fact')}
            className={`rounded-md px-2.5 py-1 font-semibold transition-colors cursor-pointer ${
              tableFilter === 'fact'
                ? 'bg-white text-indigo-600 shadow-2xs dark:bg-slate-700 dark:text-indigo-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Fact Table (1)
          </button>
          <button
            onClick={() => setTableFilter('dimension')}
            className={`rounded-md px-2.5 py-1 font-semibold transition-colors cursor-pointer ${
              tableFilter === 'dimension'
                ? 'bg-white text-sky-600 shadow-2xs dark:bg-slate-700 dark:text-sky-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Dimensions ({dims.length})
          </button>
        </div>
      </div>

      {/* Table Selector Pills */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        {availableTables.map(t => {
          const isSelected = selectedTableName === t.name;
          const isFact = t.name === fact.name;

          return (
            <button
              key={t.name}
              onClick={() => {
                onSelectTable(t.name);
                setPage(1);
                setSortColumn(null);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? isFact
                    ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-500/20'
                    : 'bg-sky-600 text-white shadow-xs ring-2 ring-sky-500/20'
                  : 'border border-slate-200 bg-slate-50/80 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-300'
              }`}
            >
              {isFact ? <Database className="h-3.5 w-3.5" /> : <Table className="h-3.5 w-3.5" />}
              <span>{t.name}</span>
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                {t.rowCount.toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Table Summary Ledger */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3 text-xs dark:border-slate-800 dark:bg-slate-850/40">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900 dark:text-slate-100">
              Selected:
            </span>
            <code className="rounded bg-white px-2 py-0.5 font-mono text-indigo-600 dark:bg-slate-800 dark:text-indigo-400 font-bold border border-slate-200 dark:border-slate-700">
              {currentTable.name}
            </code>
          </div>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className="font-mono text-slate-600 dark:text-slate-300">
            {currentTable.rowCount.toLocaleString()} rows × {currentTable.columns.length} columns
          </span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className="inline-flex items-center gap-1 font-mono text-amber-600 dark:text-amber-400 font-semibold">
            <Key className="h-3 w-3" />
            PK: {currentTable.primaryKey}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              placeholder={`Filter in ${currentTable.name}...`}
              className="rounded-lg border border-slate-200 bg-white pl-8.5 pr-8 py-1 text-xs text-slate-900 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 w-52 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-4 w-4 items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title="Clear Search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Export */}
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="mt-3.5 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-300">
              <th className="py-2.5 px-3 w-12 text-slate-400 text-center">#</th>
              {currentTable.columns.map(col => {
                const isPk = col.name === currentTable.primaryKey || (col as any).isSurrogateKey;
                const isSorted = sortColumn === col.name;

                return (
                  <th 
                    key={col.name} 
                    onClick={() => handleSort(col.name)}
                    className="py-2.5 px-3 whitespace-nowrap cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.name}</span>
                      {isPk && <Key className="h-3 w-3 text-amber-500" />}
                      <ArrowUpDown className={`h-3 w-3 ${isSorted ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 opacity-40'}`} />
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-mono text-[11px]">
            {currentPageRows.length === 0 ? (
              <tr>
                <td colSpan={currentTable.columns.length + 1} className="py-8 text-center text-slate-400 font-sans">
                  No records matching "{searchTerm}" in {currentTable.name}.
                </td>
              </tr>
            ) : (
              currentPageRows.map((row, idx) => {
                const rowNum = (page - 1) * pageSize + idx + 1;

                return (
                  <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors">
                    <td className="py-2 px-3 text-center text-slate-400 text-[10px]">
                      {rowNum}
                    </td>
                    {currentTable.columns.map(col => {
                      const val = row[col.name];
                      const isKey = col.name === currentTable.primaryKey || col.name.endsWith('_Key');
                      const isNumber = typeof val === 'number';

                      return (
                        <td 
                          key={col.name} 
                          className={`py-2 px-3 whitespace-nowrap ${
                            isKey 
                              ? 'font-bold text-amber-700 dark:text-amber-400' 
                              : isNumber
                              ? 'text-slate-800 dark:text-slate-200'
                              : 'font-sans text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {val !== undefined && val !== null ? String(val) : <span className="text-slate-400">-</span>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span>Showing</span>
          <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
            {processedRows.length > 0 ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, processedRows.length)}
          </span>
          <span>of</span>
          <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
            {processedRows.length.toLocaleString()}
          </span>
          <span>rows</span>

          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="ml-2 rounded border border-slate-200 bg-white px-2 py-0.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value={15}>15 per page</option>
            <option value={30}>30 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Prev</span>
          </button>

          <span className="px-2 font-mono text-[11px]">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
