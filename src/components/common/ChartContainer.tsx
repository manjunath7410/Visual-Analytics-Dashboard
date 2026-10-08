import React from 'react';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  footerText?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  actions,
  children,
  className = '',
  footerText,
}) => {
  return (
    <div
      className={`flex flex-col rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs transition-colors dark:border-slate-800/90 dark:bg-slate-900/90 ${className}`}
    >
      {/* Chart Header */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Main Chart Canvas Area */}
      <div className="relative min-h-[260px] w-full flex-1">
        {children}
      </div>

      {/* Optional Metadata Footer */}
      {footerText && (
        <div className="mt-3 border-t border-slate-100 pt-2.5 text-xs text-slate-400 dark:border-slate-800/60 dark:text-slate-500">
          {footerText}
        </div>
      )}
    </div>
  );
};
