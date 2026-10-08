import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { DetectedAnomaly } from '../../types/businessIntelligence';

interface ReportAnomalySectionProps {
  anomalies: DetectedAnomaly[];
  className?: string;
}

export const ReportAnomalySection: React.FC<ReportAnomalySectionProps> = ({
  anomalies,
  className = ''
}) => {
  return (
    <div className={`rounded-xl border border-amber-200/80 bg-white p-5 shadow-2xs dark:border-amber-900/60 dark:bg-slate-900/90 break-inside-avoid ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-100 pb-2.5 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
            Statistical Distribution Anomalies (Tukey's IQR Fences)
          </h3>
        </div>

        <span className="rounded-md bg-amber-50 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800">
          {anomalies.length} Flagged Outliers
        </span>
      </div>

      {/* Mandatory Disclaimer (Requirement 9) */}
      <div className="mt-3 rounded-lg bg-amber-50/50 p-2.5 text-[11px] text-amber-950 dark:bg-amber-950/30 dark:text-amber-200 border border-amber-100 dark:border-amber-900/40">
        <strong>Governance Policy: </strong> Anomalies are analytical observations and have not been automatically removed from the dataset.
      </div>

      {/* Anomaly Table */}
      {anomalies.length > 0 ? (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 font-semibold text-slate-500 dark:border-slate-800">
                <th className="py-2">Period / Entity</th>
                <th className="py-2">Evaluated Metric</th>
                <th className="py-2">Observed Value</th>
                <th className="py-2">Expected Range</th>
                <th className="py-2 text-right">Deviation %</th>
                <th className="py-2 pl-3">Context / Diagnosis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {anomalies.slice(0, 10).map((a, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40">
                  <td className="py-2 font-bold text-slate-900 dark:text-slate-100 font-sans">{a.periodOrEntity}</td>
                  <td className="py-2 text-slate-600 dark:text-slate-300 font-sans">{a.metric}</td>
                  <td className="py-2 font-bold text-amber-700 dark:text-amber-300">{a.formattedValue}</td>
                  <td className="py-2 text-slate-500">{a.formattedExpectedRange}</td>
                  <td className="py-2 text-right font-bold text-rose-600 dark:text-rose-400">+{a.deviationPercent}%</td>
                  <td className="py-2 pl-3 font-sans text-slate-600 dark:text-slate-400 text-[11px]">{a.context}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-4 text-center text-xs text-slate-400 font-medium">
          No statistical anomalies detected outside 1.5× IQR fences.
        </div>
      )}
    </div>
  );
};
