import React from 'react';
import { Scale, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { SQLValidationItem } from '../../types/sqlAnalytics';

interface SQLValidationPanelProps {
  validations: SQLValidationItem[];
  className?: string;
}

export const SQLValidationPanel: React.FC<SQLValidationPanelProps> = ({
  validations,
  className = ''
}) => {
  return (
    <div className={`rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 text-xs ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-emerald-500" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
            SQL Engine vs. Analytics Engine Reconciled Parity
          </h3>
        </div>

        <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          Dual-Engine Cross-Validation
        </span>
      </div>

      <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
        Verifies mathematical equality between application-level aggregators and in-browser relational SQL projections.
      </p>

      {/* Validations Table */}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 font-semibold text-slate-400 dark:border-slate-800">
              <th className="py-2">Benchmark Metric</th>
              <th className="py-2">Analytics Engine</th>
              <th className="py-2">SQL Engine</th>
              <th className="py-2 text-center">Status</th>
              <th className="py-2 pl-3">Audit Reconciliation Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
            {validations.map((v, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40">
                <td className="py-2 font-bold text-slate-900 dark:text-slate-100 font-sans">{v.metricName}</td>
                <td className="py-2 text-indigo-600 dark:text-indigo-400 font-bold">{String(v.analyticsValue)}</td>
                <td className="py-2 text-slate-800 dark:text-slate-200 font-bold">{String(v.sqlValue)}</td>
                <td className="py-2 text-center font-sans">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    v.status === 'MATCHED'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}>
                    <CheckCircle2 className="h-3 w-3" />
                    {v.status}
                  </span>
                </td>
                <td className="py-2 pl-3 font-sans text-slate-500 text-[11px]">{v.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
