import React from 'react';
import { ChevronRight, ArrowLeft, RotateCcw, Layers, MapPin, ShoppingBag } from 'lucide-react';

export interface DrillDownHierarchy {
  region: string | null;
  category: string | null;
  product: string | null;
}

interface ExecutiveBreadcrumbsProps {
  hierarchy: DrillDownHierarchy;
  onClearAll: () => void;
  onNavigateToLevel: (level: 'root' | 'region' | 'category') => void;
  className?: string;
}

export const ExecutiveBreadcrumbs: React.FC<ExecutiveBreadcrumbsProps> = ({
  hierarchy,
  onClearAll,
  onNavigateToLevel,
  className = ''
}) => {
  const hasDrillDown = Boolean(hierarchy.region || hierarchy.category || hierarchy.product);

  if (!hasDrillDown) return null;

  return (
    <div className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border border-indigo-200/80 bg-indigo-50/60 p-2.5 text-xs dark:border-indigo-900/60 dark:bg-indigo-950/30 ${className}`}>
      <div className="flex flex-wrap items-center gap-1.5 font-medium">
        <button
          onClick={() => onNavigateToLevel('root')}
          className="inline-flex items-center gap-1 text-indigo-700 hover:text-indigo-900 dark:text-indigo-300 dark:hover:text-white font-semibold transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Executive Overview</span>
        </button>

        {hierarchy.region && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-indigo-400" />
            <button
              onClick={() => onNavigateToLevel('region')}
              className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold transition-colors ${
                !hierarchy.category && !hierarchy.product
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white text-indigo-700 hover:bg-indigo-100 dark:bg-slate-900 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
              }`}
            >
              Region: {hierarchy.region}
            </button>
          </>
        )}

        {hierarchy.category && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-indigo-400" />
            <button
              onClick={() => onNavigateToLevel('category')}
              className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold transition-colors ${
                !hierarchy.product
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white text-indigo-700 hover:bg-indigo-100 dark:bg-slate-900 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
              }`}
            >
              Category: {hierarchy.category}
            </button>
          </>
        )}

        {hierarchy.product && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-indigo-400" />
            <span className="rounded-md bg-indigo-600 px-2 py-0.5 font-mono text-[11px] font-bold text-white shadow-2xs">
              Product: {hierarchy.product}
            </span>
          </>
        )}
      </div>

      <button
        onClick={onClearAll}
        className="inline-flex items-center gap-1 rounded-lg border border-indigo-300/80 bg-white px-2 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:bg-slate-900 dark:text-indigo-300 transition-colors shadow-2xs shrink-0"
        title="Reset drill-down to root executive level"
      >
        <RotateCcw className="h-3 w-3" />
        <span>Reset Drill-Down</span>
      </button>
    </div>
  );
};
