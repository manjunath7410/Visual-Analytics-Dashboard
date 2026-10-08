import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  ...props
}) => {
  const variantStyles = {
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
    text: 'rounded h-3.5 w-full',
  };

  return (
    <div
      className={`animate-pulse bg-slate-200/80 dark:bg-slate-800/80 ${variantStyles[variant]} ${className}`}
      {...props}
    />
  );
};

export const KPISkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200/90 bg-white p-5 dark:border-slate-800/90 dark:bg-slate-900"
        >
          <Skeleton variant="text" className="w-24 h-3" />
          <Skeleton variant="rectangular" className="mt-3 h-8 w-36" />
          <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
            <Skeleton variant="text" className="w-28 h-3" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const ChartSkeleton: React.FC<{ height?: number }> = ({ height = 280 }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Skeleton variant="text" className="w-36 h-4" />
          <Skeleton variant="text" className="mt-1.5 w-48 h-3" />
        </div>
        <Skeleton variant="rectangular" className="h-7 w-20" />
      </div>
      <div
        style={{ height }}
        className="flex items-end gap-3 rounded-lg bg-slate-50 p-4 dark:bg-slate-950/40"
      >
        {Array.from({ length: 10 }).map((_, idx) => (
          <Skeleton
            key={idx}
            className="flex-1 rounded-t"
            style={{ height: `${25 + ((idx * 17) % 65)}%` }}
          />
        ))}
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 p-4 dark:border-slate-800 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" className="flex-1 h-4" />
        ))}
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 p-3">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton key={c} variant="text" className="flex-1 h-3.5" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
