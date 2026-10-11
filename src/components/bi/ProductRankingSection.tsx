import React, { useState } from 'react';
import { ShoppingBag, ArrowUpRight, ArrowDownRight, Layers, Filter } from 'lucide-react';
import { ProductRankingItem } from '../../types/businessIntelligence';
import { BIEngine } from '../../utils/analytics/biEngine';

interface ProductRankingSectionProps {
  products: ProductRankingItem[];
  currentLimit: number;
  currentMetric: 'sales' | 'profit' | 'quantity' | 'orders';
  isTop: boolean;
  onLimitChange: (limit: number) => void;
  onMetricChange: (metric: 'sales' | 'profit' | 'quantity' | 'orders') => void;
  onToggleTopBottom: (isTop: boolean) => void;
  onSelectProduct?: (product: string) => void;
  className?: string;
}

export const ProductRankingSection: React.FC<ProductRankingSectionProps> = ({
  products,
  currentLimit,
  currentMetric,
  isTop,
  onLimitChange,
  onMetricChange,
  onToggleTopBottom,
  onSelectProduct,
  className = ''
}) => {
  if (!products || products.length === 0) {
    return (
      <div className={`rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 ${className}`}>
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
          <ShoppingBag className="h-4 w-4 text-emerald-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Product Performance Rankings
          </h3>
        </div>
        <div className="py-8 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Product analysis unavailable because this dataset does not contain an item, product, or SKU field.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 ${className}`}>
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {isTop ? 'Top Performing Products' : 'Underperforming Products (Bottom-N)'}
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {isTop ? 'Highest value catalog items' : 'Lowest contribution items requiring audit'} ranked by {currentMetric.toUpperCase()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Top vs Bottom Toggle */}
          <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800">
            <button
              onClick={() => onToggleTopBottom(true)}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                isTop 
                  ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white' 
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Top Performers
            </button>
            <button
              onClick={() => onToggleTopBottom(false)}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                !isTop 
                  ? 'bg-white text-rose-700 shadow-2xs dark:bg-slate-700 dark:text-rose-400' 
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Bottom Performers
            </button>
          </div>

          {/* Metric Selector */}
          <select
            value={currentMetric}
            onChange={(e) => onMetricChange(e.target.value as any)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
          >
            <option value="sales">Metric: Sales ($)</option>
            <option value="profit">Metric: Profit ($)</option>
            <option value="quantity">Metric: Quantity (Units)</option>
            <option value="orders">Metric: Orders (Count)</option>
          </select>

          {/* N Limit Selector (5, 10, 20) */}
          <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800">
            {[5, 10, 20].map((n) => (
              <button
                key={n}
                onClick={() => onLimitChange(n)}
                className={`rounded-md px-2 py-0.5 text-xs font-mono font-semibold transition-colors ${
                  currentLimit === n 
                    ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white' 
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                N={n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <th className="py-2.5 pr-2 w-12 text-center">Rank</th>
              <th className="py-2.5 px-3">Product Name</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3 text-right">Recognized {currentMetric.toUpperCase()}</th>
              <th className="py-2.5 px-3 text-right">Total Profit</th>
              <th className="py-2.5 px-3 text-right">Margin</th>
              <th className="py-2.5 pl-3 text-right">Orders</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
            {products.map((item, idx) => (
              <tr
                key={`prod-${item.product || 'item'}-${idx}`}
                onClick={() => onSelectProduct?.(item.product)}
                className={`group transition-colors ${
                  onSelectProduct ? 'cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-850/40' : ''
                }`}
              >
                <td className="py-2.5 pr-2 text-center">
                  <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    isTop 
                      ? (idx === 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'text-slate-500')
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}>
                    {idx + 1}
                  </span>
                </td>

                <td className="py-2.5 px-3 font-sans font-semibold text-slate-900 dark:text-slate-100">
                  {item.product}
                </td>

                <td className="py-2.5 px-3 font-sans text-slate-500 dark:text-slate-400">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] dark:bg-slate-800">
                    {item.category || 'General'}
                  </span>
                </td>

                <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                  {item.formattedValue}
                </td>

                <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                  {item.profit !== undefined ? BIEngine.formatCurrency(item.profit) : '-'}
                </td>

                <td className="py-2.5 px-3 text-right font-medium">
                  {item.margin !== undefined ? (
                    <span className={item.margin < 10 ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                      {item.margin}%
                    </span>
                  ) : '-'}
                </td>

                <td className="py-2.5 pl-3 text-right text-slate-600 dark:text-slate-400">
                  {item.orders}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400 dark:border-slate-800 dark:text-slate-500">
        <span>* Rankings dynamically evaluate active filtered records</span>
        <span>Click row to filter by this product</span>
      </div>
    </div>
  );
};
