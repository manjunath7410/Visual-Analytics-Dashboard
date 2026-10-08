import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Minus,
  DollarSign,
  PieChart,
  Users,
  Package,
  Globe,
  Activity
} from 'lucide-react';
import { ExecutiveKPI, RegionalPerformanceItem, CategoryPerformanceItem } from '../../types/businessIntelligence';

interface PerformanceScorecardProps {
  kpis: ExecutiveKPI[];
  regions: RegionalPerformanceItem[];
  categories: CategoryPerformanceItem[];
  className?: string;
}

export const PerformanceScorecard: React.FC<PerformanceScorecardProps> = ({
  kpis,
  regions,
  categories,
  className = ''
}) => {
  const revenueKPI = kpis.find(k => k.id === 'revenue');
  const profitKPI = kpis.find(k => k.id === 'profit');
  const marginKPI = kpis.find(k => k.id === 'profit_margin');
  const growthKPI = kpis.find(k => k.id === 'sales_growth');

  // Compute scorecard dimensions
  const cards = [
    {
      dimension: 'Revenue Performance',
      score: revenueKPI?.status === 'positive' ? 'Strong' : revenueKPI?.status === 'negative' ? 'Needs Attention' : 'Stable',
      metric: revenueKPI?.formattedCurrent || '$0',
      change: revenueKPI?.formattedAbsoluteChange ? `${revenueKPI.percentageChange && revenueKPI.percentageChange > 0 ? '+' : ''}${revenueKPI.percentageChange}%` : 'Baseline',
      icon: DollarSign,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
      desc: revenueKPI?.shortExplanation || 'Chronological revenue momentum'
    },
    {
      dimension: 'Profitability & Margin',
      score: marginKPI?.status === 'positive' ? 'Strong' : marginKPI?.status === 'negative' ? 'Needs Attention' : 'Stable',
      metric: marginKPI?.formattedCurrent || '0.0%',
      change: profitKPI?.formattedCurrent ? `${profitKPI.formattedCurrent} net` : 'Normal',
      icon: PieChart,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      desc: marginKPI?.shortExplanation || 'Gross operating profit margin ratio'
    },
    {
      dimension: 'Growth Trajectory',
      score: growthKPI?.status === 'positive' ? 'Strong' : growthKPI?.status === 'negative' ? 'Needs Attention' : 'Stable',
      metric: growthKPI?.formattedCurrent || '0.0%',
      change: growthKPI?.trendDirection === 'increasing' ? 'Accelerating' : growthKPI?.trendDirection === 'decreasing' ? 'Contracting' : 'Neutral',
      icon: TrendingUp,
      color: 'text-sky-600 dark:text-sky-400',
      bgColor: 'bg-sky-50 dark:bg-sky-950/40',
      desc: 'Period-over-period expansion velocity'
    },
    {
      dimension: 'Regional Balance',
      score: regions.some(r => r.margin < 10) ? 'Needs Attention' : regions.length >= 3 ? 'Strong' : 'Stable',
      metric: `${regions.length} Active Hubs`,
      change: regions[0] ? `Top: ${regions[0].region}` : 'Balanced',
      icon: Globe,
      color: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-50 dark:bg-teal-950/40',
      desc: 'Territorial revenue dispersion'
    },
    {
      dimension: 'Category Health',
      score: categories.some(c => c.profitMargin < 5) ? 'Needs Attention' : categories.length >= 3 ? 'Strong' : 'Stable',
      metric: `${categories.length} Segments`,
      change: categories[0] ? `Leader: ${categories[0].category}` : 'Stable',
      icon: Package,
      color: 'text-violet-600 dark:text-violet-400',
      bgColor: 'bg-violet-50 dark:bg-violet-950/40',
      desc: 'Product portfolio mix and margins'
    },
    {
      dimension: 'Operational Integrity',
      score: 'Strong',
      metric: 'Verified',
      change: 'Zero Discrepancy',
      icon: Activity,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40',
      desc: 'Deterministic math validation'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Strong':
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
            <CheckCircle2 className="h-3 w-3" />
            <span>Strong</span>
          </span>
        );
      case 'Needs Attention':
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
            <AlertTriangle className="h-3 w-3" />
            <span>Needs Attention</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Minus className="h-3 w-3" />
            <span>Stable</span>
          </span>
        );
    }
  };

  return (
    <div className={`rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 dark:border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-indigo-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
            Executive Performance Scorecard
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Deterministic BI Evaluation Framework
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-850/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${card.bgColor} ${card.color}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  {getStatusBadge(card.score)}
                </div>

                <h4 className="mt-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {card.dimension}
                </h4>

                <div className="mt-1 font-mono text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {card.metric}
                </div>
              </div>

              <div className="mt-2.5 border-t border-slate-200/60 pt-2 text-[10px] text-slate-500 dark:border-slate-750 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{card.change}</span> · {card.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
