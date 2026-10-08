import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, Info, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { DetectedAnomaly } from '../../types/businessIntelligence';
import { AnomalyDetailDrawer } from './AnomalyDetailDrawer';

interface AnomalyDetectionTableProps {
  anomalies: DetectedAnomaly[];
  className?: string;
  onSelectEntity?: (entity: string) => void;
}

export const AnomalyDetectionTable: React.FC<AnomalyDetectionTableProps> = ({
  anomalies,
  className = '',
  onSelectEntity
}) => {
  const [selectedAnomaly, setSelectedAnomaly] = useState<DetectedAnomaly | null>(null);

  const handleRowClick = (anom: DetectedAnomaly) => {
    setSelectedAnomaly(anom);
    if (onSelectEntity) {
      onSelectEntity(anom.periodOrEntity);
    }
  };

  return (
    <>
      <div className={`rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 ${className}`}>
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Statistical Anomaly Monitor
              </h3>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Parametric outlier observations outside expected distribution bounds. Click any row to inspect audit diagnostic.
            </p>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
            <Info className="h-3.5 w-3.5" />
            <span>{anomalies.length} Outliers Flagged</span>
          </div>
        </div>

        {anomalies.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No Statistical Anomalies Detected</p>
            <p className="mt-1 text-slate-400">All data points are positioned comfortably inside normal historical distribution boundaries.</p>
          </div>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-850/40">
                  <th className="py-2.5 px-3">Period / Entity</th>
                  <th className="py-2.5 px-3">Observed Metric</th>
                  <th className="py-2.5 px-3 text-right">Recorded Value</th>
                  <th className="py-2.5 px-3 text-right">Expected Bound</th>
                  <th className="py-2.5 px-3 text-right">Deviation</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 pl-3">Contextual Business Interpretation</th>
                  <th className="py-2.5 px-2 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {anomalies.map((anom) => {
                  const isAbove = anom.status === 'Above Expected Range';

                  return (
                    <tr 
                      key={anom.id}
                      onClick={() => handleRowClick(anom)}
                      className="group cursor-pointer hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-colors"
                      title="Click to inspect anomaly details"
                    >
                      <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {anom.periodOrEntity}
                      </td>

                      <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-300">
                        {anom.metric}
                      </td>

                      <td className="py-2.5 px-3 text-right font-bold text-slate-950 dark:text-white tabular-nums">
                        {anom.formattedValue}
                      </td>

                      <td className="py-2.5 px-3 text-right text-slate-500 dark:text-slate-400 tabular-nums">
                        {anom.formattedExpectedRange}
                      </td>

                      <td className="py-2.5 px-3 text-right font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                        +{anom.deviationPercent}%
                      </td>

                      <td className="py-2.5 px-3 text-center font-sans">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          isAbove 
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                        }`}>
                          {anom.status}
                        </span>
                      </td>

                      <td className="py-2.5 pl-3 font-sans text-[11px] text-slate-600 dark:text-slate-300 max-w-xs truncate" title={anom.context}>
                        {anom.context}
                      </td>

                      <td className="py-2.5 px-2 text-right font-sans text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        <ChevronRight className="h-4 w-4 inline transition-transform group-hover:translate-x-0.5" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-3 flex flex-wrap items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400 dark:border-slate-800 dark:text-slate-500 gap-2">
          <span>* Analytical observation: Outliers represent legitimate high-impact events or demand shifts.</span>
          <span>Method: Tukey IQR Fences (1.5 × IQR)</span>
        </div>
      </div>

      {/* Anomaly Detail Drawer */}
      <AnomalyDetailDrawer
        anomaly={selectedAnomaly}
        isOpen={Boolean(selectedAnomaly)}
        onClose={() => setSelectedAnomaly(null)}
      />
    </>
  );
};
