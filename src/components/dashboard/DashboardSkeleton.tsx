import React from 'react';
import { Skeleton, KPISkeleton, ChartSkeleton } from '../ui/Skeleton';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Context bar skeleton */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <Skeleton variant="text" className="h-4 w-72" />
      </div>

      {/* Filter bar skeleton */}
      <div className="flex gap-2">
        <Skeleton variant="rectangular" className="h-8 w-44" />
        <Skeleton variant="rectangular" className="h-8 w-32" />
        <Skeleton variant="rectangular" className="h-8 w-32" />
      </div>

      {/* Primary KPI skeleton grid */}
      <KPISkeleton count={6} />

      {/* Performance Insights 3-cards skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Skeleton variant="rectangular" className="h-24 w-full" />
        <Skeleton variant="rectangular" className="h-24 w-full" />
        <Skeleton variant="rectangular" className="h-24 w-full" />
      </div>

      {/* Hero Trend Chart Skeleton */}
      <ChartSkeleton height={320} />

      {/* 2-Column Breakdown Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartSkeleton height={260} />
        <ChartSkeleton height={260} />
      </div>

      {/* Product Ranking & Alerts Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton variant="rectangular" className="h-72 w-full" />
        <Skeleton variant="rectangular" className="h-72 w-full" />
      </div>
    </div>
  );
};
