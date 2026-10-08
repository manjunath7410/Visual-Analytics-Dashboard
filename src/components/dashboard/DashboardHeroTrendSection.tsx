import React, { useState } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Maximize2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus,
  Sparkles,
  Layers,
  Activity
} from 'lucide-react';
import { ChartConfig } from '../../types/visualization';
import { TimeGranularity } from '../../types/analytics';
import { ExecutiveKPI } from '../../types/businessIntelligence';
import { ChartRenderer } from '../charts/ChartRenderer';
import { FullScreenChartModal } from './FullScreenChartModal';

interface DashboardHeroTrendSectionProps {
  chartConfig: ChartConfig;
  kpis: ExecutiveKPI[];
  granularity: TimeGranularity;
  onGranularityChange: (g: TimeGranularity) => void;
  hasDateColumn: boolean;
  filterSummary?: string;
  className?: string;
}

export const DashboardHeroTrendSection: React.FC<DashboardHeroTrendSectionProps> = ({
  chartConfig,
  kpis,
  granularity,
  onGranularityChange,
  hasDateColumn,
  filterSummary,
  className = '',
}) => {
  const [showFullScreen, setShowFullScreen] = useState(false);

  // Extract key metrics for the side panel
  const revenueKPI = kpis.find(k => k.id === 'revenue');
  const profitKPI = kpis.find(k => k.id === 'profit');
  const marginKPI = kpis.find(k => k.id === 'profit_margin');
  const aovKPI = kpis.find(k => k.id === 'avg_order_value');

  const granularities: TimeGranularity[] = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];

  return (
    <>
      <div
        className={`flex flex-col rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 ${className}`}
      >
        {/* Header: Title, Subtitle, Granularity Selector & Fullscreen Button */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3.5 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Performance Trajectory
              </span>
            </div>
            <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Revenue & Gross Profit Trajectory
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Chronological business performance tracking across {granularity} cadence
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* Granularity Selector */}
            <div className="flex flex-wrap items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50/80 p-0.5 text-xs dark:border-slate-800 dark:bg-slate-950/60 shadow-2xs">
              {granularities.map((g) => (
                <button
                  key={g}
                  onClick={() => onGranularityChange(g)}
                  disabled={!hasDateColumn}
                  className={`rounded-md px-2 py-1 text-[11px] font-medium capitalize transition-colors ${
                    granularity === g
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold dark:bg-slate-800 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  } disabled:opacity-40 cursor-pointer`}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Expand Fullscreen Button */}
            <button
              onClick={() => setShowFullScreen(true)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              title="Expand Chart View"
              aria-label="Expand Fullscreen Chart"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Content: Main Chart Area + Side Summary Metrics */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Main Chart Canvas (3 Columns) */}
          <div className="lg:col-span-3 min-h-[300px] w-full">
            <ChartRenderer config={chartConfig} />
          </div>

          {/* Side Performance Metrics Panel (1 Column) */}
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800/60 dark:bg-slate-950/40">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                <Activity className="h-3.5 w-3.5 text-indigo-500" />
                <span>Period Performance</span>
              </div>

              <div className="space-y-3.5">
                {/* Revenue Summary */}
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Total Recognized Revenue</span>
                  <div className="mt-0.5 flex items-baseline justify-between">
                    <span className="font-mono text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                      {revenueKPI?.formattedCurrent || '$0'}
                    </span>
                    {revenueKPI?.percentageChange !== null && revenueKPI?.percentageChange !== undefined && (
                      <span className={`inline-flex items-center font-mono text-[11px] font-semibold tabular-nums ${
                        revenueKPI.percentageChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {revenueKPI.percentageChange >= 0 ? '+' : ''}{revenueKPI.percentageChange}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Profit Summary */}
                <div className="border-t border-slate-200/60 pt-2.5 dark:border-slate-800/60">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Operating Gross Profit</span>
                  <div className="mt-0.5 flex items-baseline justify-between">
                    <span className="font-mono text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                      {profitKPI?.formattedCurrent || '$0'}
                    </span>
                    {profitKPI?.percentageChange !== null && profitKPI?.percentageChange !== undefined && (
                      <span className={`inline-flex items-center font-mono text-[11px] font-semibold tabular-nums ${
                        profitKPI.percentageChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {profitKPI.percentageChange >= 0 ? '+' : ''}{profitKPI.percentageChange}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Profit Margin Summary */}
                <div className="border-t border-slate-200/60 pt-2.5 dark:border-slate-800/60">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Blended Gross Margin</span>
                  <div className="mt-0.5 flex items-baseline justify-between">
                    <span className="font-mono text-lg font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                      {marginKPI?.formattedCurrent || '0%'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Target ≥ 20%
                    </span>
                  </div>
                </div>

                {/* AOV Summary */}
                {aovKPI && (
                  <div className="border-t border-slate-200/60 pt-2.5 dark:border-slate-800/60">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Average Order Realization</span>
                    <div className="mt-0.5 flex items-baseline justify-between">
                      <span className="font-mono text-base font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                        {aovKPI.formattedCurrent}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Per Order
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-200/80 pt-2.5 text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
              Values computed strictly via deterministic in-memory BI calculations.
            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen Chart Modal */}
      <FullScreenChartModal
        isOpen={showFullScreen}
        onClose={() => setShowFullScreen(false)}
        config={chartConfig}
        activeFilterSummary={filterSummary}
      />
    </>
  );
};
