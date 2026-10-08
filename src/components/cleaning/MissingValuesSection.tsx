import React, { useState } from 'react';
import { ColumnMetadata } from '../../types/dataset';
import { MissingValueColumnReport } from '../../types/etl';
import { analyzeMissingValuesPerColumn, calculateColumnAggregates } from '../../utils/dataCleaning';
import { AlertCircle, CheckCircle2, Sliders, ArrowRight } from 'lucide-react';

interface MissingValuesSectionProps {
  rows: Record<string, any>[];
  columns: ColumnMetadata[];
  onApplyFill: (columnName: string, strategy: any, customVal?: any) => void;
  onApplyDropRows: (columnName: string) => void;
  onShowPreview: (config: {
    title: string;
    description: string;
    affectedRowCount: number;
    previewColumn: string;
    beforeSample: any[];
    afterSample: any[];
    confirmAction: () => void;
  }) => void;
  className?: string;
}

export const MissingValuesSection: React.FC<MissingValuesSectionProps> = ({
  rows,
  columns,
  onApplyFill,
  onApplyDropRows,
  onShowPreview,
  className = ''
}) => {
  const missingReports = React.useMemo(() => {
    return analyzeMissingValuesPerColumn(rows, columns);
  }, [rows, columns]);

  const [selectedColumn, setSelectedColumn] = useState<string>(
    missingReports.find(c => c.missing > 0)?.columnName || (columns[0]?.name ?? '')
  );
  const [selectedStrategy, setSelectedStrategy] = useState<string>('mean');

  const activeColReport = missingReports.find(c => c.columnName === selectedColumn);
  const activeColMeta = columns.find(c => c.name === selectedColumn);

  const handleTriggerOperation = () => {
    if (!activeColReport || activeColReport.missing === 0) return;

    const colName = selectedColumn;
    const isNum = activeColMeta?.type === 'Number';
    const isDate = activeColMeta?.type === 'Date';

    // Build sample before and after for preview
    const sampleRows = rows.slice(0, 10);
    const beforeSample = sampleRows.map(r => r[colName]);

    let afterSample: any[] = [];
    let confirmAction = () => {};
    let desc = '';

    if (selectedStrategy === 'drop_rows') {
      afterSample = sampleRows.filter(r => r[colName] !== null && r[colName] !== undefined).map(r => r[colName]);
      desc = `Rows with missing or empty "${colName}" will be permanently removed from cleaned dataset.`;
      confirmAction = () => onApplyDropRows(colName);
    } else {
      const aggregates = calculateColumnAggregates(rows, colName);
      let fillVal: any = 'Unknown';
      if (selectedStrategy === 'mean') fillVal = aggregates.mean;
      else if (selectedStrategy === 'median') fillVal = aggregates.median;
      else if (selectedStrategy === 'zero') fillVal = 0;
      else if (selectedStrategy === 'mode') fillVal = aggregates.mode || 'Unknown';
      else if (selectedStrategy === 'unknown') fillVal = 'Unknown';

      afterSample = sampleRows.map(r => (r[colName] === null || r[colName] === undefined ? fillVal : r[colName]));
      desc = `Missing values in "${colName}" will be replaced with ${selectedStrategy} (${fillVal}).`;
      confirmAction = () => onApplyFill(colName, selectedStrategy);
    }

    onShowPreview({
      title: `Impute Missing Values: ${colName}`,
      description: desc,
      affectedRowCount: activeColReport.missing,
      previewColumn: colName,
      beforeSample,
      afterSample,
      confirmAction
    });
  };

  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 dark:border-slate-800 gap-2">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Missing Value Analysis & Imputation Strategy
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Audit null occurrences across all attributes and apply mathematical or categorical imputation
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Missing Value Table (2 Cols) */}
        <div className="lg:col-span-2 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 dark:bg-slate-850 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Column</th>
                <th className="py-2.5 px-3 font-semibold">Type</th>
                <th className="py-2.5 px-3 text-right font-semibold">Total</th>
                <th className="py-2.5 px-3 text-right font-semibold">Missing</th>
                <th className="py-2.5 px-3 text-right font-semibold">Missing %</th>
                <th className="py-2.5 px-3 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px] dark:divide-slate-800/60">
              {missingReports.map((col) => {
                const isSelected = selectedColumn === col.columnName;
                return (
                  <tr
                    key={col.columnName}
                    onClick={() => setSelectedColumn(col.columnName)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-indigo-50/50 dark:bg-indigo-950/30 font-semibold'
                        : 'hover:bg-slate-50/60 dark:hover:bg-slate-850/40'
                    }`}
                  >
                    <td className="py-2 px-3 text-slate-900 dark:text-slate-100 font-sans">
                      {col.columnName}
                    </td>
                    <td className="py-2 px-3 font-sans text-slate-500">
                      {col.dataType}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums text-slate-600 dark:text-slate-400">
                      {col.total.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      {col.missing > 0 ? (
                        <span className="text-amber-600 dark:text-amber-400 font-bold">
                          {col.missing.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      <span className={col.missingPercent > 15 ? 'text-rose-600 font-bold' : col.missingPercent > 0 ? 'text-amber-600 font-medium' : 'text-emerald-600'}>
                        {col.missingPercent}%
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-sans">
                      <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        col.status === 'Good' 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                          : col.status === 'Attention'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                      }`}>
                        {col.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Imputation Action Panel (1 Col) */}
        <div className="lg:col-span-1 rounded-lg border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-850/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2 dark:border-slate-700/80">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Imputation Strategy
              </span>
              <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold truncate max-w-[120px]">
                {selectedColumn}
              </span>
            </div>

            {activeColReport && activeColReport.missing > 0 ? (
              <div className="mt-3 space-y-3">
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Target column has <strong className="text-amber-600 dark:text-amber-400">{activeColReport.missing}</strong> missing cells ({activeColReport.missingPercent}%).
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Select Replacement Strategy:
                  </label>
                  <select
                    value={selectedStrategy}
                    onChange={(e) => setSelectedStrategy(e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-200 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  >
                    {activeColMeta?.type === 'Number' ? (
                      <>
                        <option value="mean">Replace with Mean (Average)</option>
                        <option value="median">Replace with Median</option>
                        <option value="zero">Replace with 0</option>
                        <option value="drop_rows">Drop Affected Rows</option>
                      </>
                    ) : activeColMeta?.type === 'Date' ? (
                      <>
                        <option value="drop_rows">Remove Rows with Invalid / Missing Dates</option>
                      </>
                    ) : (
                      <>
                        <option value="unknown">Replace with "Unknown"</option>
                        <option value="mode">Replace with Mode (Most Frequent)</option>
                        <option value="drop_rows">Drop Affected Rows</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            ) : (
              <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="h-6 w-6 mx-auto text-emerald-500 mb-2" />
                <span>Column "{selectedColumn}" has zero missing values.</span>
              </div>
            )}
          </div>

          <button
            onClick={handleTriggerOperation}
            disabled={!activeColReport || activeColReport.missing === 0}
            className="mt-4 w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span>Review & Impute</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
