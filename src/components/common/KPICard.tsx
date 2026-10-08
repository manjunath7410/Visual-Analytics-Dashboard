import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp } from 'lucide-react';
import { KPIMetric } from '../../types/dashboard';

interface KPICardProps {
  kpi: KPIMetric;
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({ kpi, className = '' }) => {
  const isUp = kpi.trend === 'up';
  const isDown = kpi.trend === 'down';

  // SVG mini sparkline calculation
  const sparklinePoints = React.useMemo(() => {
    if (!kpi.sparklineData || kpi.sparklineData.length < 2) return '';
    const min = Math.min(...kpi.sparklineData);
    const max = Math.max(...kpi.sparklineData);
    const range = max - min || 1;
    const width = 84;
    const height = 30;

    return kpi.sparklineData
      .map((val, idx) => {
        const x = (idx / (kpi.sparklineData.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 6) - 3;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [kpi.sparklineData]);

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs transition-all duration-200 hover:border-slate-300 dark:border-slate-800/90 dark:bg-slate-900/90 dark:hover:border-slate-700 ${className}`}
    >
      {/* Top row: Label & Mini Sparkline */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
          {kpi.title}
        </span>

        {sparklinePoints ? (
          <div className="pt-0.5 shrink-0">
            <svg
              className={`h-7 w-20 overflow-visible ${
                isUp
                  ? 'text-emerald-500'
                  : isDown
                  ? 'text-rose-500'
                  : 'text-indigo-500'
              }`}
              viewBox="0 0 84 30"
              fill="none"
              aria-hidden="true"
            >
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={sparklinePoints}
              />
            </svg>
          </div>
        ) : (
          <div className="h-7 w-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 dark:bg-slate-800/60 shrink-0">
            <TrendingUp className="h-3.5 w-3.5" />
          </div>
        )}
      </div>

      {/* Primary KPI Metric */}
      <div className="mt-2.5 flex items-baseline min-w-0">
        <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-slate-900 tabular-nums dark:text-slate-50 truncate">
          {kpi.value}
        </span>
      </div>

      {/* Semantic Indicator & Period Context */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800/60 gap-1">
        <div className="flex items-center gap-1.5 font-medium truncate min-w-0">
          {isUp && (
            <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 shrink-0">
              <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
              <span className="font-mono tabular-nums font-semibold">
                {kpi.changePercent !== null ? `+${kpi.changePercent}%` : '—'}
              </span>
            </span>
          )}
          {isDown && (
            <span className="flex items-center gap-0.5 text-rose-600 dark:text-rose-400 shrink-0">
              <ArrowDownRight className="h-3.5 w-3.5 stroke-[2.5]" />
              <span className="font-mono tabular-nums font-semibold">
                {kpi.changePercent !== null ? `-${Math.abs(kpi.changePercent)}%` : '—'}
              </span>
            </span>
          )}
          {!isUp && !isDown && (
            <span className="flex items-center gap-0.5 text-slate-500 dark:text-slate-400 shrink-0">
              <Minus className="h-3.5 w-3.5" />
              <span className="font-mono tabular-nums">
                {kpi.changePercent !== null ? `${kpi.changePercent}%` : 'Baseline'}
              </span>
            </span>
          )}
          <span className="text-slate-300 dark:text-slate-600 shrink-0">·</span>
          <span className="text-slate-500 dark:text-slate-400 truncate max-w-[120px] sm:max-w-[140px]">
            {kpi.periodText || 'vs previous period'}
          </span>
        </div>
      </div>
    </div>
  );
};
