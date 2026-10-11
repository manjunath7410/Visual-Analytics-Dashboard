import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus, 
  Clock, 
  TrendingUp,
  Activity
} from 'lucide-react';
import { ExecutiveKPI } from '../../types/businessIntelligence';

interface ExecutiveKPICardsGridProps {
  kpis: ExecutiveKPI[];
  className?: string;
  onCardClick?: (kpiId: string) => void;
}

export const ExecutiveKPICardsGrid: React.FC<ExecutiveKPICardsGridProps> = ({
  kpis,
  className = '',
  onCardClick
}) => {
  return (
    <div className={`grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 ${className}`}>
      {kpis.map((kpi) => {
        const isPositive = kpi.status === 'positive';
        const isNegative = kpi.status === 'negative';
        const isNeutral = kpi.status === 'neutral';

        // SVG mini sparkline calculation
        const sparklinePoints = kpi.sparkline && kpi.sparkline.length >= 2 ? (() => {
          const min = Math.min(...kpi.sparkline);
          const max = Math.max(...kpi.sparkline);
          const range = max - min || 1;
          const width = 64;
          const height = 22;

          return kpi.sparkline
            .map((val: number, idx: number) => {
              const x = (idx / (kpi.sparkline!.length - 1)) * width;
              const y = height - ((val - min) / range) * (height - 4) - 2;
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join(' ');
        })() : '';

        return (
          <div
            key={kpi.id}
            onClick={() => onCardClick?.(kpi.id)}
            className={`group relative flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs transition-all duration-150 hover:border-slate-300 dark:border-[#263247] dark:bg-[#151D2F] dark:hover:bg-[#1B263B] dark:hover:border-slate-600 ${
              onCardClick ? 'cursor-pointer hover:shadow-xs' : ''
            }`}
          >
            <div>
              {/* Top Row: Label & Mini Sparkline */}
              <div className="flex items-start justify-between gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8] select-none">
                  {kpi.title}
                </span>

                {sparklinePoints ? (
                  <svg
                    className={`h-5 w-16 overflow-visible shrink-0 ${
                      isPositive
                        ? 'text-[#10B981]'
                        : isNegative
                        ? 'text-[#EF4444]'
                        : 'text-[#6366F1]'
                    }`}
                    viewBox="0 0 64 22"
                    fill="none"
                    aria-hidden="true"
                  >
                    <polyline
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={sparklinePoints}
                    />
                  </svg>
                ) : (
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-slate-50 text-slate-400 dark:bg-[#111827] dark:text-[#64748B] shrink-0">
                    <Activity className="h-3 w-3" />
                  </div>
                )}
              </div>

              {/* Main KPI Value */}
              <div className="mt-2 flex items-baseline min-w-0">
                <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-slate-900 tabular-nums dark:text-[#F8FAFC] truncate">
                  {kpi.formattedCurrent}
                </span>
              </div>
            </div>

            {/* Comparison Context & Delta */}
            <div className="mt-3.5 border-t border-slate-100 pt-2.5 dark:border-[#263247]">
              <div className="flex items-center justify-between text-[11px]">
                {kpi.percentageChange !== null ? (
                  <div className="flex items-center gap-1 font-medium">
                    {isPositive && (
                      <span className="flex items-center gap-0.5 text-[#10B981] font-semibold">
                        <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
                        <span className="font-mono tabular-nums">+{kpi.percentageChange}%</span>
                      </span>
                    )}
                    {isNegative && (
                      <span className="flex items-center gap-0.5 text-[#EF4444] font-semibold">
                        <ArrowDownRight className="h-3.5 w-3.5 stroke-[2.5]" />
                        <span className="font-mono tabular-nums">-{Math.abs(kpi.percentageChange)}%</span>
                      </span>
                    )}
                    {isNeutral && (
                      <span className="flex items-center gap-0.5 text-slate-500 dark:text-[#94A3B8]">
                        <Minus className="h-3.5 w-3.5" />
                        <span className="font-mono tabular-nums">{kpi.percentageChange}%</span>
                      </span>
                    )}
                    <span className="text-slate-300 dark:text-[#64748B]" aria-hidden="true">·</span>
                    <span className="text-slate-400 dark:text-[#64748B] truncate max-w-[80px]">
                      {kpi.trendDirection}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-slate-400 dark:text-[#64748B]">
                    <Clock className="h-3 w-3" />
                    <span>Baseline</span>
                  </div>
                )}

                {kpi.previousValue !== null && (
                  <span className="font-mono text-[10px] text-slate-400 dark:text-[#64748B] tabular-nums truncate">
                    {kpi.formattedPrevious}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
