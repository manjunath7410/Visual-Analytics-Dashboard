import React, { useState } from 'react';
import { Globe, ArrowUpRight, ArrowDownRight, Minus, ChevronRight, Award, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { RegionalPerformanceItem } from '../../types/businessIntelligence';
import { BIEngine } from '../../utils/analytics/biEngine';

interface RegionalPerformanceSectionProps {
  regions: RegionalPerformanceItem[];
  selectedRegion?: string;
  onSelectRegion?: (region: string) => void;
  className?: string;
}

export const RegionalPerformanceSection: React.FC<RegionalPerformanceSectionProps> = ({
  regions,
  selectedRegion,
  onSelectRegion,
  className = ''
}) => {
  const [sortBy, setSortBy] = useState<'sales' | 'profit' | 'orders' | 'growth' | 'score'>('sales');

  const sortedRegions = [...regions].sort((a, b) => {
    if (sortBy === 'profit') return b.profit - a.profit;
    if (sortBy === 'orders') return b.orders - a.orders;
    if (sortBy === 'growth') return (b.growth ?? -999) - (a.growth ?? -999);
    if (sortBy === 'score') return b.performanceScore - a.performanceScore;
    return b.sales - a.sales;
  });

  return (
    <div className={`rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 ${className}`}>
      {/* Header with Sort Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Regional Performance & Leaderboard
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Ranked geographical operating theaters with analytical scoring and margin telemetry
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 dark:text-slate-500">Rank by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
          >
            <option value="sales">Revenue / Sales</option>
            <option value="profit">Operating Profit</option>
            <option value="orders">Orders Volume</option>
            <option value="growth">Period Growth (%)</option>
            <option value="score">Analytical Score (0-100)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <th className="py-2.5 pr-2 w-12 text-center">Rank</th>
              <th className="py-2.5 px-3">Operating Region</th>
              <th className="py-2.5 px-3 text-right">Recognized Sales</th>
              <th className="py-2.5 px-3 text-right">Gross Profit</th>
              <th className="py-2.5 px-3 text-right">Margin</th>
              <th className="py-2.5 px-3 text-right">Growth</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 pl-3 text-right">Score (0-100)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
            {sortedRegions.map((item, idx) => {
              const isSelected = selectedRegion && selectedRegion.toLowerCase() === item.region.toLowerCase();

              // Status Badge
              let statusBadge = (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <Minus className="h-2.5 w-2.5" />
                  Stable
                </span>
              );

              if (item.status === 'Strong') {
                statusBadge = (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                    <CheckCircle2 className="h-2.5 w-2.5" />
                    Strong
                  </span>
                );
              } else if (item.status === 'Needs Attention') {
                statusBadge = (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200/80 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800">
                    <ShieldAlert className="h-2.5 w-2.5" />
                    Needs Attention
                  </span>
                );
              }

              return (
                <tr
                  key={item.region}
                  onClick={() => onSelectRegion?.(item.region)}
                  className={`group transition-colors ${
                    onSelectRegion ? 'cursor-pointer hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20' : ''
                  } ${isSelected ? 'bg-indigo-50/70 dark:bg-indigo-950/40' : ''}`}
                >
                  <td className="py-2.5 pr-2 text-center">
                    <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      idx === 0 
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200' 
                        : idx === 1
                        ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        : 'text-slate-500'
                    }`}>
                      {idx + 1}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 font-sans font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                    <span>{item.region}</span>
                    {onSelectRegion && (
                      <ChevronRight className="h-3 w-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500" />
                    )}
                  </td>

                  <td className="py-2.5 px-3 text-right font-medium text-slate-800 dark:text-slate-200">
                    {BIEngine.formatCurrency(item.sales)}
                  </td>

                  <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-300">
                    {BIEngine.formatCurrency(item.profit)}
                  </td>

                  <td className="py-2.5 px-3 text-right font-semibold text-slate-700 dark:text-slate-200">
                    {item.margin.toFixed(1)}%
                  </td>

                  <td className="py-2.5 px-3 text-right">
                    {item.growth !== null ? (
                      <span className={`inline-flex items-center gap-0.5 ${
                        item.growth >= 0 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-rose-600 dark:text-rose-400 font-semibold'
                      }`}>
                        {item.growth >= 0 ? '↑' : '↓'}
                        {Math.abs(item.growth)}%
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 text-center font-sans">
                    {statusBadge}
                  </td>

                  <td className="py-2.5 pl-3 text-right">
                    <div className="flex items-center justify-end gap-2 font-mono">
                      <div className="hidden sm:block h-1.5 w-14 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                        <div 
                          className="h-full bg-indigo-600 rounded-full" 
                          style={{ width: `${item.performanceScore}%` }} 
                        />
                      </div>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {item.performanceScore}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400 dark:border-slate-800 dark:text-slate-500">
        <span>* Analytical score formula: 40% Normalized Sales + 30% Normalized Profit + 30% Normalized Period Growth</span>
        <span>Click row to filter dashboard by region</span>
      </div>
    </div>
  );
};
