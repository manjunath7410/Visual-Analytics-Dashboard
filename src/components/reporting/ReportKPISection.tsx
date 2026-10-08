import React from 'react';
import { TrendingUp, TrendingDown, Minus, DollarSign, ShoppingBag, Percent, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ExecutiveKPI } from '../../types/businessIntelligence';

interface ReportKPISectionProps {
  kpis: ExecutiveKPI[];
  className?: string;
}

export const ReportKPISection: React.FC<ReportKPISectionProps> = ({
  kpis,
  className = ''
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
            Key Performance Indicators & Baseline Delta
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Current period calculations reconciled against historical period baselines
          </p>
        </div>
        <span className="font-mono text-[11px] text-slate-400">
          Source: Analytics Engine
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {kpis.map((kpi) => {
          const isPos = kpi.status === 'positive' || kpi.trendDirection === 'increasing';
          const isNeg = kpi.status === 'negative' || kpi.trendDirection === 'decreasing';

          return (
            <div
              key={kpi.id}
              className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90"
            >
              <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold">
                <span>{kpi.title}</span>
                {kpi.percentageChange !== null && (
                  <span
                    className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                      isPos
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : isNeg
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {isPos ? <ArrowUpRight className="h-3 w-3" /> : isNeg ? <ArrowDownRight className="h-3 w-3" /> : null}
                    <span>{kpi.percentageChange > 0 ? '+' : ''}{kpi.percentageChange}%</span>
                  </span>
                )}
              </div>

              <div className="mt-1 font-mono text-lg font-bold text-slate-900 dark:text-slate-100">
                {kpi.formattedCurrent}
              </div>

              <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[10px] text-slate-400 dark:border-slate-800/80">
                <span>Prev: {kpi.formattedPrevious}</span>
                <span>{kpi.periodLabel}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
