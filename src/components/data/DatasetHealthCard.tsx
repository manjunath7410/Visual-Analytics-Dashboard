import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  Layers,
  Activity,
  AlertOctagon,
  Copy
} from 'lucide-react';
import { Dataset } from '../../types/dataset';
import { calculateDataQuality } from '../../utils/dataCleaning';

interface DatasetHealthCardProps {
  dataset: Dataset;
  className?: string;
}

export const DatasetHealthCard: React.FC<DatasetHealthCardProps> = ({
  dataset,
  className = ''
}) => {
  const navigate = useNavigate();

  const qualityReport = React.useMemo(() => {
    return calculateDataQuality(dataset.rows, dataset.columns, dataset.statistics);
  }, [dataset]);

  const score = qualityReport.score;
  const isExcellent = score >= 90;
  const isGood = score >= 75 && score < 90;
  const isFair = score >= 50 && score < 75;

  const scoreColor = isExcellent
    ? 'text-emerald-600 dark:text-emerald-400'
    : isGood
    ? 'text-blue-600 dark:text-blue-400'
    : isFair
    ? 'text-amber-600 dark:text-amber-400'
    : 'text-rose-600 dark:text-rose-400';

  const badgeBg = isExcellent
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
    : isGood
    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800'
    : isFair
    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
    : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800';

  return (
    <div className={`rounded-xl border border-slate-200/90 bg-white p-4.5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left Side: Quality Score & Status */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-2.5 text-center dark:border-slate-800/80 dark:bg-slate-850/60 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Health Score
            </span>
            <div className="mt-0.5 flex items-baseline gap-1">
              <span className={`font-mono text-2xl font-black tabular-nums ${scoreColor}`}>
                {score}
              </span>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">/100</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Dataset Integrity & Cleanliness
              </span>
              <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeBg}`}>
                {isExcellent ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <AlertTriangle className="h-3 w-3" />
                )}
                <span>{qualityReport.rating} Quality</span>
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {qualityReport.factors.length === 0
                ? 'All columns and records meet enterprise data hygiene standards with zero null anomalies.'
                : `${qualityReport.factors.length} potential schema factors identified across missing cells and duplicates.`}
            </p>
          </div>
        </div>

        {/* Right Side: Key Metrics & Data Cleaning Button */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <AlertOctagon className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-sans font-medium text-slate-400">Null Cells</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                  {dataset.statistics.missingValuesCount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Copy className="h-3.5 w-3.5 text-rose-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-sans font-medium text-slate-400">Duplicates</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                  {dataset.statistics.duplicateRowsCount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-sans font-medium text-slate-400">Issues</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                  {qualityReport.totalIssues.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/cleaning')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>View Data Cleaning</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
