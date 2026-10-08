import React, { useState } from 'react';
import { Target, HelpCircle, Layers, Sparkles } from 'lucide-react';
import { PerformanceMatrixPoint } from '../../types/businessIntelligence';

interface PerformanceMatrixChartProps {
  points: PerformanceMatrixPoint[];
  className?: string;
  onSelectPoint?: (label: string) => void;
}

export const PerformanceMatrixChart: React.FC<PerformanceMatrixChartProps> = ({
  points,
  className = '',
  onSelectPoint
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filteredPoints = points.filter(p => 
    activeFilter === 'all' ? true : p.quadrant === activeFilter
  );

  const quadrantCounts = {
    star: points.filter(p => p.quadrant === 'star').length,
    volume_risk: points.filter(p => p.quadrant === 'volume_risk').length,
    niche_efficient: points.filter(p => p.quadrant === 'niche_efficient').length,
    underperformer: points.filter(p => p.quadrant === 'underperformer').length
  };

  return (
    <div className={`rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Analytical Performance Matrix (Sales vs. Gross Margin)
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            2×2 Analytical portfolio segmentation based on median sales volume and gross margin thresholds
          </p>
        </div>

        {/* Quadrant Quick Filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            All Items ({points.length})
          </button>
          <button
            onClick={() => setActiveFilter('star')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
              activeFilter === 'star'
                ? 'bg-emerald-600 text-white'
                : 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
            }`}
          >
            Stars ({quadrantCounts.star})
          </button>
          <button
            onClick={() => setActiveFilter('volume_risk')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
              activeFilter === 'volume_risk'
                ? 'bg-amber-600 text-white'
                : 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
            }`}
          >
            Volume Drivers ({quadrantCounts.volume_risk})
          </button>
          <button
            onClick={() => setActiveFilter('niche_efficient')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
              activeFilter === 'niche_efficient'
                ? 'bg-sky-600 text-white'
                : 'border border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
            }`}
          >
            Niche Leaders ({quadrantCounts.niche_efficient})
          </button>
          <button
            onClick={() => setActiveFilter('underperformer')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
              activeFilter === 'underperformer'
                ? 'bg-rose-600 text-white'
                : 'border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
            }`}
          >
            Underperformers ({quadrantCounts.underperformer})
          </button>
        </div>
      </div>

      {/* 2x2 Visual Quadrant Grid */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quadrant 1: Stars (High Sales, High Profit Margin) */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                Stars (High Volume & High Margin)
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-300">
              {quadrantCounts.star} items
            </span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
            Core commercial pillars delivering superior cash generation and profitability.
          </p>

          <div className="mt-3 space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {points.filter(p => p.quadrant === 'star').map(p => (
              <div 
                key={p.id}
                onClick={() => onSelectPoint?.(p.label)}
                className="flex items-center justify-between rounded-lg bg-white/80 p-2 text-xs font-medium text-slate-800 dark:bg-slate-900/80 dark:text-slate-200 hover:border-emerald-400 border border-transparent shadow-2xs transition-colors cursor-pointer"
              >
                <span className="truncate pr-2">{p.label}</span>
                <span className="font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                  {p.formattedX} · {p.formattedY}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quadrant 2: Niche Leaders (Low Sales, High Profit Margin) */}
        <div className="rounded-xl border border-sky-200 bg-sky-50/40 p-4 dark:border-sky-900/60 dark:bg-sky-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              <span className="text-xs font-bold text-sky-900 dark:text-sky-200">
                Niche Leaders (High Margin, Moderate Volume)
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-sky-700 dark:text-sky-300">
              {quadrantCounts.niche_efficient} items
            </span>
          </div>
          <p className="mt-1 text-[11px] text-sky-800/80 dark:text-sky-300/80 leading-relaxed">
            High unit economic efficiency with potential for marketing expansion.
          </p>

          <div className="mt-3 space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {points.filter(p => p.quadrant === 'niche_efficient').map(p => (
              <div 
                key={p.id}
                onClick={() => onSelectPoint?.(p.label)}
                className="flex items-center justify-between rounded-lg bg-white/80 p-2 text-xs font-medium text-slate-800 dark:bg-slate-900/80 dark:text-slate-200 hover:border-sky-400 border border-transparent shadow-2xs transition-colors cursor-pointer"
              >
                <span className="truncate pr-2">{p.label}</span>
                <span className="font-mono text-[11px] font-semibold text-sky-600 dark:text-sky-400 shrink-0">
                  {p.formattedX} · {p.formattedY}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quadrant 3: Volume Drivers (High Sales, Low Margin) */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 dark:border-amber-900/60 dark:bg-amber-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Volume Drivers (High Volume, Low Margin)
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-300">
              {quadrantCounts.volume_risk} items
            </span>
          </div>
          <p className="mt-1 text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
            Revenue generators exposed to discounting pressure; examine pricing power.
          </p>

          <div className="mt-3 space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {points.filter(p => p.quadrant === 'volume_risk').map(p => (
              <div 
                key={p.id}
                onClick={() => onSelectPoint?.(p.label)}
                className="flex items-center justify-between rounded-lg bg-white/80 p-2 text-xs font-medium text-slate-800 dark:bg-slate-900/80 dark:text-slate-200 hover:border-amber-400 border border-transparent shadow-2xs transition-colors cursor-pointer"
              >
                <span className="truncate pr-2">{p.label}</span>
                <span className="font-mono text-[11px] font-semibold text-amber-600 dark:text-amber-400 shrink-0">
                  {p.formattedX} · {p.formattedY}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quadrant 4: Underperformers (Low Sales, Low Margin) */}
        <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 dark:border-rose-900/60 dark:bg-rose-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
                Underperformers (Low Volume & Low Margin)
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-rose-700 dark:text-rose-300">
              {quadrantCounts.underperformer} items
            </span>
          </div>
          <p className="mt-1 text-[11px] text-rose-800/80 dark:text-rose-300/80 leading-relaxed">
            Trailing inventory lines requiring strategic portfolio evaluation or sun-setting.
          </p>

          <div className="mt-3 space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {points.filter(p => p.quadrant === 'underperformer').map(p => (
              <div 
                key={p.id}
                onClick={() => onSelectPoint?.(p.label)}
                className="flex items-center justify-between rounded-lg bg-white/80 p-2 text-xs font-medium text-slate-800 dark:bg-slate-900/80 dark:text-slate-200 hover:border-rose-400 border border-transparent shadow-2xs transition-colors cursor-pointer"
              >
                <span className="truncate pr-2">{p.label}</span>
                <span className="font-mono text-[11px] font-semibold text-rose-600 dark:text-rose-400 shrink-0">
                  {p.formattedX} · {p.formattedY}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400 dark:border-slate-800 dark:text-slate-500">
        <span>* Analytical segmentation matrix. Does not automatically dictate commercial strategy.</span>
        <span>Click item to filter dashboard</span>
      </div>
    </div>
  );
};
