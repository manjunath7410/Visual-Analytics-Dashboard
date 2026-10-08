import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { DataQualityReport } from '../../types/etl';

interface DataQualityCardProps {
  report: DataQualityReport;
  className?: string;
  onNavigateToSection?: (sectionId: string) => void;
}

export const DataQualityCard: React.FC<DataQualityCardProps> = ({ 
  report, 
  className = '',
  onNavigateToSection 
}) => {
  const score = report.score;
  const isExcellent = score >= 90;
  const isGood = score >= 75 && score < 90;
  const isFair = score >= 50 && score < 75;

  const scoreColor = isExcellent
    ? 'text-emerald-600 dark:text-emerald-400'
    : isGood
    ? 'text-indigo-600 dark:text-indigo-400'
    : isFair
    ? 'text-amber-600 dark:text-amber-400'
    : 'text-rose-600 dark:text-rose-400';

  const barColor = isExcellent
    ? 'bg-emerald-500'
    : isGood
    ? 'bg-indigo-500'
    : isFair
    ? 'bg-amber-500'
    : 'bg-rose-500';

  const badgeBg = isExcellent
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
    : isGood
    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800'
    : isFair
    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
    : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800';

  const readinessStatus = isExcellent
    ? { label: 'Ready for Analysis', badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' }
    : isGood
    ? { label: 'Good (Minor Issues)', badge: 'bg-blue-500/10 text-blue-600 border-blue-500/20' }
    : isFair
    ? { label: 'Needs Attention', badge: 'bg-amber-500/10 text-amber-600 border-amber-500/20' }
    : { label: 'Critical Issues Detected', badge: 'bg-rose-500/10 text-rose-600 border-rose-500/20' };

  return (
    <div className={`rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 space-y-5 ${className}`}>
      {/* Top Header & Quality Gauge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 dark:border-slate-800 gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400 shadow-2xs">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Data Quality & Health Index
              </h3>
              <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${readinessStatus.badge}`}>
                {isExcellent ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                <span>{readinessStatus.label}</span>
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Evaluated across missing cells, duplicate records, outlier bounds, and column type fidelity.
            </p>
          </div>
        </div>

        {/* Big Score Visual */}
        <div className="flex items-center gap-3 self-start sm:self-auto bg-slate-50/80 dark:bg-slate-850/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
          <div className="text-right pl-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Overall Score</span>
            <div className={`font-mono text-3xl font-black tracking-tight tabular-nums ${scoreColor}`}>
              {score} <span className="text-xs font-medium text-slate-400">/ 100</span>
            </div>
          </div>
          <div className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${badgeBg}`}>
            {report.rating}
          </div>
        </div>
      </div>

      {/* Progress Metric Bar */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1.5 font-medium text-slate-600 dark:text-slate-300">
          <span>Integrity Score Spectrum</span>
          <span className="font-mono tabular-nums font-bold">{score}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full ${barColor} transition-all duration-500`}
            style={{ width: `${Math.max(4, score)}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
          <span>0 (Critical)</span>
          <span>50 (Needs Attention)</span>
          <span>75 (Good)</span>
          <span>100 (Excellent)</span>
        </div>
      </div>

      {/* Factors Breakdown Explanation */}
      <div className="border-t border-slate-100 pt-4 dark:border-slate-800/60">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Detected Issues & Deductions ({report.factors.length})
          </h4>
          <span className="font-mono text-xs text-slate-400">
            {report.totalIssues.toLocaleString()} total cells/records affected
          </span>
        </div>

        {report.factors.length === 0 ? (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 font-medium">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>Zero structural flaws detected. Dataset is staged and completely sanitized for high-fidelity analytics.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {report.factors.map((f, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-850/50 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {f.name}
                    </span>
                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                      {f.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                    -{f.impactScore} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
