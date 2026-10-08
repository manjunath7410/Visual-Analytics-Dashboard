import React, { useState } from 'react';
import { ColumnMetadata } from '../../types/dataset';
import { OutlierColumnReport } from '../../types/etl';
import { detectOutliersIQR } from '../../utils/dataCleaning';
import { AlertTriangle, Trash2, CheckCircle2, Info } from 'lucide-react';

interface OutlierSectionProps {
  rows: Record<string, any>[];
  columns: ColumnMetadata[];
  onRemoveOutliers: (columnName: string, lowerBound: number, upperBound: number) => void;
  onShowPreview: (config: {
    title: string;
    description: string;
    affectedRowCount: number;
    previewColumn?: string;
    beforeSample: any[];
    afterSample: any[];
    confirmAction: () => void;
  }) => void;
  className?: string;
}

export const OutlierSection: React.FC<OutlierSectionProps> = ({
  rows,
  columns,
  onRemoveOutliers,
  onShowPreview,
  className = ''
}) => {
  const numericColumns = React.useMemo(() => {
    return columns.filter(c => c.type === 'Number');
  }, [columns]);

  const outlierReports = React.useMemo(() => {
    return detectOutliersIQR(rows, numericColumns);
  }, [rows, numericColumns]);

  const handleRequestRemove = (rep: OutlierColumnReport) => {
    onShowPreview({
      title: `Remove Statistical Outliers: ${rep.columnName}`,
      description: `Removing values outside the IQR interval [${rep.lowerBound.toLocaleString()}, ${rep.upperBound.toLocaleString()}]. Note: In business intelligence, extreme values can represent legitimate high-value transactions.`,
      affectedRowCount: rep.outlierCount,
      previewColumn: rep.columnName,
      beforeSample: [`Outlier (< ${rep.lowerBound})`, `Normal Value`, `Outlier (> ${rep.upperBound})`],
      afterSample: [`Filtered Out`, `Normal Value`, `Filtered Out`],
      confirmAction: () => onRemoveOutliers(rep.columnName, rep.lowerBound, rep.upperBound)
    });
  };

  if (numericColumns.length === 0) {
    return null;
  }

  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 dark:border-slate-800 gap-2">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Outlier Analysis (Interquartile Range IQR Protocol)
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Identifies distribution anomalies where value &lt; Q1 - 1.5×IQR or &gt; Q3 + 1.5×IQR
          </p>
        </div>
      </div>

      {/* Advisory Banner */}
      <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-200/80 bg-amber-50/70 p-3 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
        <Info className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Analytical Advisory:</strong> Outliers are not automatically removed. In enterprise financial datasets, large transactions, executive renewals, and volume spikes frequently represent authentic business milestones rather than erroneous measurements.
        </p>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 dark:bg-slate-850 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-2.5 px-3 font-semibold">Numeric Column</th>
              <th className="py-2.5 px-3 text-right font-semibold">Q1 (25%)</th>
              <th className="py-2.5 px-3 text-right font-semibold">Q3 (75%)</th>
              <th className="py-2.5 px-3 text-right font-semibold">IQR Spread</th>
              <th className="py-2.5 px-3 text-right font-semibold">Lower Bound</th>
              <th className="py-2.5 px-3 text-right font-semibold">Upper Bound</th>
              <th className="py-2.5 px-3 text-right font-semibold">Outliers</th>
              <th className="py-2.5 px-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[11px] dark:divide-slate-800/60">
            {outlierReports.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-slate-400 font-sans">
                  No statistical outliers detected across current numeric distributions.
                </td>
              </tr>
            ) : (
              outlierReports.map((rep) => (
                <tr key={rep.columnName} className="hover:bg-slate-50/60 dark:hover:bg-slate-850/40 transition-colors">
                  <td className="py-2.5 px-3 text-slate-900 dark:text-slate-100 font-sans font-semibold">
                    {rep.columnName}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-slate-600 dark:text-slate-400">
                    {rep.q1.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-slate-600 dark:text-slate-400">
                    {rep.q3.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-slate-600 dark:text-slate-400">
                    {rep.iqr.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-slate-700 dark:text-slate-300">
                    {rep.lowerBound.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-slate-700 dark:text-slate-300">
                    {rep.upperBound.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums">
                    {rep.outlierCount > 0 ? (
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        {rep.outlierCount.toLocaleString()} ({rep.outlierPercent}%)
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-sans">
                    {rep.outlierCount > 0 ? (
                      <button
                        onClick={() => handleRequestRemove(rep)}
                        className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Filter Outliers</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Normal</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
