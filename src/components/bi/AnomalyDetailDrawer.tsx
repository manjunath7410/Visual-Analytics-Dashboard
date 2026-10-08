import React, { useEffect } from 'react';
import { 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  HelpCircle, 
  Calendar, 
  TrendingUp, 
  ShieldAlert, 
  ArrowRight,
  Info
} from 'lucide-react';
import { DetectedAnomaly } from '../../types/businessIntelligence';

interface AnomalyDetailDrawerProps {
  anomaly: DetectedAnomaly | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AnomalyDetailDrawer: React.FC<AnomalyDetailDrawerProps> = ({
  anomaly,
  isOpen,
  onClose
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !anomaly) return null;

  const isAbove = anomaly.status === 'Above Expected Range';
  const isHighSeverity = anomaly.severity === 'High';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div 
        className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in slide-in-from-right duration-250"
        role="dialog"
        aria-modal="true"
        aria-labelledby="anomaly-drawer-title"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              isHighSeverity 
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400' 
                : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
            }`}>
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h2 id="anomaly-drawer-title" className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Anomaly Audit Inspection
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Statistical Outlier Diagnostic
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            aria-label="Close drawer (Esc)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Main Anomaly Summary Card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-850/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {anomaly.periodOrEntity}
              </span>
              <span className={`inline-flex rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
                isHighSeverity
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
              }`}>
                {anomaly.severity} Severity
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {anomaly.context}
            </p>
          </div>

          {/* Value Comparison */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Parametric Metrics Comparison
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-950 font-mono">
                <span className="font-sans text-[11px] text-slate-500">Observed Value</span>
                <div className={`mt-1 text-lg font-bold tabular-nums ${isAbove ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {anomaly.formattedValue}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-950 font-mono">
                <span className="font-sans text-[11px] text-slate-500">Expected Normal Range</span>
                <div className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                  {anomaly.formattedExpectedRange}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-950 font-mono">
                <span className="font-sans text-[11px] text-slate-500">Variance Delta</span>
                <div className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {anomaly.deviation > 0 ? `+${anomaly.deviation.toLocaleString()}` : anomaly.deviation.toLocaleString()}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-950 font-mono">
                <span className="font-sans text-[11px] text-slate-500">Deviation Percentage</span>
                <div className="mt-1 text-sm font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                  {anomaly.deviationPercent > 0 ? `+${anomaly.deviationPercent}%` : `${anomaly.deviationPercent}%`}
                </div>
              </div>
            </div>
          </div>

          {/* Diagnostic Methodology */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 space-y-2 text-xs">
            <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-indigo-500" />
              <span>Detection Methodology</span>
            </span>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
              {anomaly.method}. The analytical engine benchmarks each observational period or entity against historical quartile distribution boundaries (1.5x IQR).
            </p>
          </div>

          {/* Analytical Observation Notice (Requirement 18) */}
          <div className="flex items-start gap-2.5 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3.5 text-xs text-indigo-900 dark:border-indigo-950/70 dark:bg-indigo-950/30 dark:text-indigo-300">
            <Info className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Analytical observation only:</strong> This data point is highlighted for business review and strategic attention, and does not necessarily indicate bad data or operational defects.
            </p>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="border-t border-slate-200 px-5 py-3 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
