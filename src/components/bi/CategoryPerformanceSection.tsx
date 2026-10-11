import React, { useState } from 'react';
import { Layers, ArrowUpRight, ArrowDownRight, ChevronRight, PieChart, Sparkles } from 'lucide-react';
import { CategoryPerformanceItem } from '../../types/businessIntelligence';
import { BIEngine } from '../../utils/analytics/biEngine';

interface CategoryPerformanceSectionProps {
  categories: CategoryPerformanceItem[];
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  className?: string;
}

export const CategoryPerformanceSection: React.FC<CategoryPerformanceSectionProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  className = ''
}) => {
  const [sortBy, setSortBy] = useState<'sales' | 'profit' | 'orders' | 'growth'>('sales');

  if (!categories || categories.length === 0) {
    return (
      <div className={`rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 ${className}`}>
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
          <Layers className="h-4 w-4 text-sky-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Product Category Performance & Margins
          </h3>
        </div>
        <div className="py-8 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Category analysis unavailable because this dataset does not contain a category or department field.
          </p>
        </div>
      </div>
    );
  }

  const sortedCategories = [...categories].sort((a, b) => {
    if (sortBy === 'profit') return b.profit - a.profit;
    if (sortBy === 'orders') return b.orders - a.orders;
    if (sortBy === 'growth') return (b.growth ?? -999) - (a.growth ?? -999);
    return b.sales - a.sales;
  });

  return (
    <div className={`rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 ${className}`}>
      {/* Header with Sort Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-sky-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Product Category Performance & Margins
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Portfolio contribution mix, gross margins, and volume distribution
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 dark:text-slate-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
          >
            <option value="sales">Sales Volume</option>
            <option value="profit">Gross Profit</option>
            <option value="orders">Orders Count</option>
            <option value="growth">Growth (%)</option>
          </select>
        </div>
      </div>

      {/* Grid of category breakdown cards */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sortedCategories.map((item, idx) => {
          const isSelected = selectedCategory && selectedCategory.toLowerCase() === item.category.toLowerCase();

          return (
            <div
              key={`cat-${item.category || 'item'}-${idx}`}
              onClick={() => onSelectCategory?.(item.category)}
              className={`group flex flex-col justify-between rounded-xl border p-4 transition-all shadow-2xs ${
                isSelected 
                  ? 'border-indigo-400 bg-indigo-50/50 dark:border-indigo-700 dark:bg-indigo-950/40' 
                  : 'border-slate-200/80 bg-slate-50/40 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-850/40 dark:hover:border-slate-700'
              } ${onSelectCategory ? 'cursor-pointer' : ''}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                    {item.category}
                  </span>
                  <span className="rounded-md bg-white px-2 py-0.5 font-mono text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700 shadow-2xs">
                    {item.share}% share
                  </span>
                </div>

                {/* Progress bar of share */}
                <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden dark:bg-slate-700">
                  <div 
                    className="h-full bg-sky-500 rounded-full" 
                    style={{ width: `${Math.min(100, Math.max(5, item.share))}%` }} 
                  />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-[10px] uppercase font-sans text-slate-400 dark:text-slate-500">Sales</span>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {BIEngine.formatCurrency(item.sales)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-sans text-slate-400 dark:text-slate-500">Gross Margin</span>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {item.profitMargin}%
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-sans text-slate-400 dark:text-slate-500">Transactions</span>
                    <p className="font-medium text-slate-700 dark:text-slate-300">
                      {item.orders.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-sans text-slate-400 dark:text-slate-500">Period Delta</span>
                    <p className={`font-semibold ${
                      item.growth !== null && item.growth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {item.growth !== null ? `${item.growth >= 0 ? '+' : ''}${item.growth}%` : 'Baseline'}
                    </p>
                  </div>
                </div>
              </div>

              {onSelectCategory && (
                <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2 text-[11px] text-indigo-600 dark:text-indigo-400 dark:border-slate-800">
                  <span>Drill into products</span>
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
