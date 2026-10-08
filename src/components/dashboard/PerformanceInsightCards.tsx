import React from 'react';
import { Award, TrendingUp, DollarSign, ArrowUpRight, ShieldCheck, Users } from 'lucide-react';
import { 
  RegionalPerformanceItem, 
  CategoryPerformanceItem, 
  CustomerSegmentItem 
} from '../../types/businessIntelligence';

interface PerformanceInsightCardsProps {
  regions: RegionalPerformanceItem[];
  categories: CategoryPerformanceItem[];
  segments: CustomerSegmentItem[];
  className?: string;
  onSelectRegion?: (region: string) => void;
  onSelectCategory?: (category: string) => void;
}

export const PerformanceInsightCards: React.FC<PerformanceInsightCardsProps> = ({
  regions,
  categories,
  segments,
  className = '',
  onSelectRegion,
  onSelectCategory,
}) => {
  const topRegion = regions[0];
  const mostProfitableCat = [...categories].sort((a, b) => b.profitMargin - a.profitMargin)[0];
  const topSegment = segments[0];

  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-3 ${className}`}>
      {/* 1. Best Performing Territory */}
      <div
        onClick={() => topRegion && onSelectRegion?.(topRegion.region)}
        className={`rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs transition-all dark:border-slate-800/90 dark:bg-slate-900/90 ${
          onSelectRegion && topRegion ? 'hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Top Operating Territory
          </span>
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <Award className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-base font-bold text-slate-900 dark:text-white truncate">
            {topRegion ? topRegion.region : 'General Portfolio'}
          </span>
          {topRegion && (
            <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
              Score: {topRegion.performanceScore}/100
            </span>
          )}
        </div>

        <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 pt-2 dark:border-slate-800/60">
          {topRegion ? (
            <>
              <span className="font-mono tabular-nums font-medium text-slate-700 dark:text-slate-300">
                ${(topRegion.sales / 1000).toFixed(1)}K Sales
              </span>
              <span>·</span>
              <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-medium">
                {topRegion.margin}% Margin
              </span>
            </>
          ) : (
            <span>Established regional baseline</span>
          )}
        </div>
      </div>

      {/* 2. Most Profitable Category */}
      <div
        onClick={() => mostProfitableCat && onSelectCategory?.(mostProfitableCat.category)}
        className={`rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs transition-all dark:border-slate-800/90 dark:bg-slate-900/90 ${
          onSelectCategory && mostProfitableCat ? 'hover:border-emerald-300 dark:hover:border-emerald-700 cursor-pointer' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Highest Margin Category
          </span>
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <DollarSign className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-base font-bold text-slate-900 dark:text-white truncate">
            {mostProfitableCat ? mostProfitableCat.category : 'Core Products'}
          </span>
          {mostProfitableCat && (
            <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {mostProfitableCat.profitMargin}% Margin
            </span>
          )}
        </div>

        <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 pt-2 dark:border-slate-800/60">
          {mostProfitableCat ? (
            <>
              <span className="font-mono tabular-nums font-medium text-slate-700 dark:text-slate-300">
                ${(mostProfitableCat.sales / 1000).toFixed(1)}K Volume
              </span>
              <span>·</span>
              <span className="font-mono tabular-nums font-medium">
                {mostProfitableCat.share}% Share
              </span>
            </>
          ) : (
            <span>Optimized margin distribution</span>
          )}
        </div>
      </div>

      {/* 3. Primary Customer Segment */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Primary Volume Segment
          </span>
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
            <Users className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-base font-bold text-slate-900 dark:text-white truncate">
            {topSegment ? topSegment.segment : 'Enterprise Base'}
          </span>
          {topSegment && (
            <span className="font-mono text-xs font-semibold text-sky-600 dark:text-sky-400 tabular-nums">
              {topSegment.share}% Share
            </span>
          )}
        </div>

        <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 pt-2 dark:border-slate-800/60">
          {topSegment ? (
            <>
              <span className="font-mono tabular-nums font-medium text-slate-700 dark:text-slate-300">
                ${(topSegment.sales / 1000).toFixed(1)}K Revenue
              </span>
              <span>·</span>
              <span className="font-mono tabular-nums font-medium">
                {topSegment.orders} Orders
              </span>
            </>
          ) : (
            <span>Consistent customer cohorts</span>
          )}
        </div>
      </div>
    </div>
  );
};
