import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Table2, 
  Calendar, 
  Hash, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  HelpCircle,
  FileCheck,
  Check,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { ColumnMetadata, DatasetStatistics } from '../../types/dataset';
import { ColumnMappingResult } from '../../utils/intelligentColumnMapping';

interface DatasetPreviewProps {
  fileName: string;
  fileType: string;
  fileSize: number;
  statistics: DatasetStatistics;
  columns: ColumnMetadata[];
  previewRows: Record<string, any>[];
  mappings: ColumnMappingResult[];
  onConfirmMappings: (updatedMappings: ColumnMappingResult[]) => void;
  onProceedToDashboard: () => void;
  onOpenExplorer: () => void;
  sheetNames?: string[];
  activeSheet?: string;
  onSelectSheet?: (sheet: string) => void;
}

export const DatasetPreview: React.FC<DatasetPreviewProps> = ({
  fileName,
  fileType,
  fileSize,
  statistics,
  columns,
  previewRows,
  mappings,
  onConfirmMappings,
  onProceedToDashboard,
  onOpenExplorer,
  sheetNames,
  activeSheet,
  onSelectSheet
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'mapping' | 'metadata'>('preview');
  const [userMappings, setUserMappings] = useState<ColumnMappingResult[]>(mappings);

  // Group detected columns by analytical category
  const dateCols = columns.filter(c => c.type === 'Date');
  const numericCols = columns.filter(c => c.type === 'Number');
  const categoricalCols = columns.filter(c => c.type === 'Category');
  const textCols = columns.filter(c => c.type === 'Text');

  // Count items needing confirmation
  const unconfirmedCount = userMappings.filter(m => m.requiresConfirmation).length;

  const handleUpdateMapping = (conceptId: string, colName: string | null) => {
    setUserMappings(prev => {
      const updated = prev.map(m => {
        if (m.conceptId === conceptId) {
          return {
            ...m,
            mappedColumn: colName === 'none' ? null : colName,
            confidence: colName && colName !== 'none' ? 1.0 : 0.0,
            isAutoConfirmed: true,
            requiresConfirmation: false
          };
        }
        return m;
      });
      onConfirmMappings(updated);
      return updated;
    });
  };

  const formattedSize = fileSize >= 1024 * 1024 
    ? `${(fileSize / (1024 * 1024)).toFixed(2)} MB` 
    : `${(fileSize / 1024).toFixed(1)} KB`;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
        <div className="flex items-start gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {fileName}
              </h3>
              <span className="rounded-md bg-indigo-100 px-2 py-0.5 font-mono text-[11px] font-bold uppercase text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {fileType.toUpperCase()}
              </span>
              {activeSheet && (
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Sheet: {activeSheet}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Verified client-side parser &middot; {formattedSize} &middot; In-memory analytical stage ready
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenExplorer}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 shadow-2xs transition-colors cursor-pointer"
          >
            <Table2 className="h-4 w-4 text-slate-500" />
            <span>Preview Dataset</span>
          </button>

          <button
            onClick={onProceedToDashboard}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition-colors cursor-pointer"
          >
            <span>Analyze Dataset</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Excel Multi-Sheet Selector (if multiple sheets exist) */}
      {sheetNames && sheetNames.length > 1 && (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-850/60">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Workbook Sheets:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {sheetNames.map(sheet => (
              <button
                key={sheet}
                onClick={() => onSelectSheet?.(sheet)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                  activeSheet === sheet
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {sheet}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Metrics & Statistical Breakdown Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-850/40">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Total Rows
          </span>
          <p className="mt-1 font-mono text-xl font-bold text-slate-900 dark:text-white">
            {statistics.rowCount.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-850/40">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Columns
          </span>
          <p className="mt-1 font-mono text-xl font-bold text-slate-900 dark:text-white">
            {statistics.columnCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-850/40">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Date Columns
          </span>
          <p className="mt-1 font-mono text-xl font-bold text-indigo-600 dark:text-indigo-400">
            {statistics.dateColumnsCount}
          </p>
          <span className="text-[10px] text-slate-400 truncate block mt-0.5">
            {dateCols.map(c => c.name).join(', ') || 'None'}
          </span>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-850/40">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Numeric Columns
          </span>
          <p className="mt-1 font-mono text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {statistics.numericColumnsCount}
          </p>
          <span className="text-[10px] text-slate-400 truncate block mt-0.5">
            {numericCols.map(c => c.name).slice(0, 3).join(', ') || 'None'}
          </span>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-850/40">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Categorical
          </span>
          <p className="mt-1 font-mono text-xl font-bold text-sky-600 dark:text-sky-400">
            {statistics.categoricalColumnsCount}
          </p>
          <span className="text-[10px] text-slate-400 truncate block mt-0.5">
            {categoricalCols.map(c => c.name).slice(0, 3).join(', ') || 'None'}
          </span>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-850/40">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Data Quality
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
              {statistics.missingValuesCount} nulls
            </span>
            <span className="text-slate-300">&middot;</span>
            <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
              {statistics.duplicateRowsCount} dups
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {statistics.missingValuesCount === 0 && statistics.duplicateRowsCount === 0 ? '✓ Pristine' : 'Hygiene ready'}
          </span>
        </div>
      </div>

      {/* Tabs: First 10 Rows Preview vs Intelligent Column Mapping */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('preview')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              First 10 Rows Table Preview
            </button>

            <button
              onClick={() => setActiveTab('mapping')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'mapping'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <span>Intelligent Field Mapping</span>
              {unconfirmedCount > 0 && (
                <span className="rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] font-bold text-white">
                  {unconfirmedCount} verify
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('metadata')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'metadata'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Column Schema ({columns.length})
            </button>
          </div>

          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            Rendering first {Math.min(10, previewRows.length)} of {statistics.rowCount.toLocaleString()} records
          </span>
        </div>

        {/* Tab 1: First 10 Rows Preview Table */}
        {activeTab === 'preview' && (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850/80 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 font-semibold text-slate-400 uppercase text-[10px] w-12 text-center">
                    #
                  </th>
                  {columns.map(col => (
                    <th key={col.name} className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <span>{col.name}</span>
                        <span className="rounded bg-slate-200/60 dark:bg-slate-700 px-1 py-0.2 text-[9px] font-mono font-medium text-slate-600 dark:text-slate-300">
                          {col.type}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {previewRows.slice(0, 10).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-850/40 transition-colors">
                    <td className="py-2 px-3 text-center text-slate-400 text-[11px]">
                      {idx + 1}
                    </td>
                    {columns.map(col => {
                      const val = row[col.name];
                      const isNull = val === null || val === undefined || String(val).trim() === '';
                      return (
                        <td key={col.name} className="py-2 px-3 text-slate-800 dark:text-slate-200 whitespace-nowrap max-w-[200px] truncate">
                          {isNull ? (
                            <span className="text-slate-300 dark:text-slate-600 italic">null</span>
                          ) : (
                            String(val)
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Intelligent Field Mapping with Confirmation */}
        {activeTab === 'mapping' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 dark:border-indigo-950 dark:bg-indigo-950/20">
              <div className="flex items-start gap-2.5">
                <HelpCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-900 dark:text-indigo-300">
                  <p className="font-semibold">
                    Flexible Multi-Industry Column Normalization
                  </p>
                  <p className="mt-0.5 text-indigo-800/80 dark:text-indigo-400/80 leading-relaxed">
                    Acuity BI maps fields across Retail, Finance, Healthcare, and Logistics to standard analytical schemas. If a field isn't present in your dataset, corresponding visual modules gracefully adapt.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {userMappings.map(item => {
                const isAuto = item.isAutoConfirmed;
                const isReq = item.requiresConfirmation;

                return (
                  <div
                    key={item.conceptId}
                    className={`rounded-xl border p-3.5 transition-all ${
                      isReq
                        ? 'border-amber-300 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30 ring-1 ring-amber-400/30'
                        : item.mappedColumn
                        ? 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                        : 'border-slate-200/60 bg-slate-50/40 dark:border-slate-800/60 dark:bg-slate-850/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {item.conceptLabel}
                      </span>
                      {isReq ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-900 dark:text-amber-200 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Confirmation required
                        </span>
                      ) : item.mappedColumn ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          {(item.confidence * 100).toFixed(0)}% Match
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">
                          Optional / Absent
                        </span>
                      )}
                    </div>

                    <div className="mt-2.5">
                      <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block mb-1">
                        Assigned Column
                      </label>
                      <select
                        value={item.mappedColumn || 'none'}
                        onChange={(e) => handleUpdateMapping(item.conceptId, e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
                      >
                        <option value="none">-- Not Mapped (Omit) --</option>
                        {columns.map(col => (
                          <option key={col.name} value={col.name}>
                            {col.name} ({col.type})
                          </option>
                        ))}
                      </select>
                    </div>

                    {isReq && (
                      <p className="mt-2 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                        Column mapping requires confirmation before analytics lock.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Detailed Column Metadata */}
        {activeTab === 'metadata' && (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850/80 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">Column Name</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">Data Type</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300 text-right">Non-Empty</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300 text-right">Missing</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300 text-right">Unique Values</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">Sample Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {columns.map(col => (
                  <tr key={col.name} className="hover:bg-slate-50/60 dark:hover:bg-slate-850/40">
                    <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white font-sans">
                      {col.name}
                    </td>
                    <td className="py-2 px-3">
                      <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                        {col.type}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-slate-700 dark:text-slate-300">
                      {col.nonEmptyCount.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right">
                      {col.missingCount > 0 ? (
                        <span className="text-amber-600 font-bold">{col.missingCount}</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-700 dark:text-slate-300">
                      {col.uniqueCount.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-slate-500 font-sans text-[11px] truncate max-w-xs">
                      {col.type === 'Number' && col.min !== undefined && col.max !== undefined
                        ? `Min: ${col.min.toLocaleString()} | Max: ${col.max.toLocaleString()} | Avg: ${col.mean?.toLocaleString()}`
                        : col.type === 'Date' && col.minDate && col.maxDate
                        ? `${col.minDate} → ${col.maxDate}`
                        : col.uniqueValues
                        ? col.uniqueValues.slice(0, 3).join(', ')
                        : '—'}
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
