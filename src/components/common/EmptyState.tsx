import React from 'react';
import { Database } from 'lucide-react';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200/90 bg-white/60 p-12 text-center backdrop-blur-xs dark:border-slate-800/90 dark:bg-slate-900/40 ${className}`}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
        {icon || <Database className="h-5 w-5" />}
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h3>

      <p className="mt-1 max-w-md text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        {description}
      </p>

      {(actionText || secondaryActionText) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          {actionText && onAction && (
            <Button variant="primary" size="sm" onClick={onAction}>
              {actionText}
            </Button>
          )}

          {secondaryActionText && onSecondaryAction && (
            <Button variant="secondary" size="sm" onClick={onSecondaryAction}>
              {secondaryActionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
