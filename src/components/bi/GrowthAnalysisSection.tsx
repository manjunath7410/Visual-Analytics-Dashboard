import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  DollarSign, 
  ShoppingBag, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from 'lucide-react';
import { ExecutiveKPI } from '../../types/businessIntelligence';

interface GrowthAnalysisSectionProps {
  kpis: ExecutiveKPI[];
  className?: string;
}

export const GrowthAnalysisSection: React.FC<GrowthAnalysisSectionProps> = ({
  kpis,
  className = ''
}) => {
  const revenueKPI = kpis.find(k => k.id === 'revenue');
  const profitKPI = kpis.find(k => k.id === 'profit');
  const ordersKPI = kpis.find(k => k.id === 'orders');
  const aovKPI = kpis.find(k => k.id === 'avg_order_value');

  const growthMetrics = [
    {
      title: 'Revenue Trajectory',
      current: revenueKPI?.formattedCurrent || '$0',
      previous: revenueKPI?.formattedPrevious || 'N/A',
      change: revenueKPI?.percentageChange !== null && revenueKPI?.percentageChange !== undefined ? `${revenueKPI.percentageChange > 0 ? '+' : ''}${revenueKPI.percentageChange}%` : 'Baseline Period',
      delta: revenueKPI?.formattedAbsoluteChange || '-',
      isPositive: (revenueKPI?.percentageChange || 0) >= 0,
      icon: DollarSign,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40'
    },
    {
      title: 'Net Profit Expansion',
      current: profitKPI?.formattedCurrent || '$0',
      previous: profitKPI?.formattedPrevious || 'N/A',
      change: profitKPI?.percentageChange !== null && profitKPI?.percentageChange !== undefined ? `${profitKPI.percentageChange > 0 ? '+' : ''}${profitKPI.percentageChange}%` : 'Baseline Period',
      delta: profitKPI?.formattedAbsoluteChange || '-',
      isPositive: (profitKPI?.percentageChange || 0) >= 0,
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40'
    },
    {
      title: 'Order Volume Growth',
      current: ordersKPI?.formattedCurrent || '0',
      previous: ordersKPI?.formattedPrevious || 'N/A',
      change: ordersKPI?.percentageChange !== null && ordersKPI?.percentageChange !== undefined ? `${ordersKPI.percentageChange > 0 ? '+' : ''}${ordersKPI.percentageChange}%` : 'Baseline Period',
      delta: ordersKPI?.formattedAbsoluteChange || '-',
      isPositive: (ordersKPI?.percentageChange || 0) >= 0,
      icon: ShoppingBag,
      color: 'text-sky-600 dark:text-sky-400',
      bgColor: 'bg-sky-50 dark:bg-sky-950/40'
    }
  ];

  return (
    <div className={`rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 dark:border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-indigo-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
            Period-over-Period Growth Velocity
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Lagged Sequential Comparison Analysis
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
        {growthMetrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-850/40 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${m.bgColor} ${m.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {m.title}
                  </span>
                </div>

                <span className={`inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 font-mono text-[11px] font-bold ${
                  m.isPositive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                }`}>
                  {m.isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  <span>{m.change}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-slate-200/60 pt-2.5 font-mono text-xs dark:border-slate-750">
                <div>
                  <span className="font-sans text-[10px] text-slate-400">Current Period</span>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {m.current}
                  </div>
                </div>

                <div>
                  <span className="font-sans text-[10px] text-slate-400">Previous Period</span>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400 tabular-nums">
                    {m.previous}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
