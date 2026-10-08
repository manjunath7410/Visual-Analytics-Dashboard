import React from 'react';
import { KPISkeleton, ChartSkeleton, TableSkeleton } from '../ui/Skeleton';

interface LoadingStateProps {
  type?: 'card' | 'chart' | 'table' | 'full';
  rows?: number;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'card',
  rows = 5,
  className = '',
}) => {
  if (type === 'card') {
    return <KPISkeleton count={4} />;
  }

  if (type === 'chart') {
    return <ChartSkeleton height={280} />;
  }

  if (type === 'table') {
    return <TableSkeleton rows={rows} columns={4} />;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <KPISkeleton count={4} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartSkeleton height={280} />
        <ChartSkeleton height={280} />
      </div>
      <TableSkeleton rows={rows} columns={5} />
    </div>
  );
};
