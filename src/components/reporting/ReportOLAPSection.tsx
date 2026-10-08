import React from 'react';
import { Sliders, Table, Layers } from 'lucide-react';
import { OLAPResult } from '../../types/dataWarehouse';

interface ReportOLAPSectionProps {
  result: OLAPResult | null;
  className?: string;
}

export const ReportOLAPSection: React.FC<ReportOLAPSectionProps> = ({
  result,
  className = ''
}) => {
  if (!result) return null;

  return (
    <div className={`rounded-xl border border-indigo-200/80 bg-white p-5 shadow-2xs dark:border-indigo-900/60 dark:bg-slate-900/90 break-inside-avoid ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 pb-2.5 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
            OLAP Analytical Cube Result
          </h3>
        </div>

        <span className="rounded-md bg-indigo-50 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
          Operation: {result.operation.toUpperCase()}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-semibold">
        <span>{result.title}</span>
        {result.summaryMetrics && (
          <span className="font-mono text-indigo-600 dark:text-indigo-400">
            Total: {result.summaryMetrics.formattedTotal}
          </span>
        )}
      </div>

      {/* Result Table */}
      <div className="mt-3 overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-850/60 dark:text-slate-300">
              {result.headers.map(h => (
                <th key={h} className="py-2 px-3 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
            {result.rows.slice(0, 10).map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-850/40">
                {result.headers.map(h => (
                  <td key={h} className="py-2 px-3 whitespace-nowrap text-slate-800 dark:text-slate-200">
                    {row[h] !== undefined && row[h] !== null ? String(row[h]) : '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
