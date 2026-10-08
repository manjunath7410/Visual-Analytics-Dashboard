import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  metadata?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  metadata,
  actions,
  className = '',
}) => {
  return (
    <div className={`mb-6 flex flex-col gap-3 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-start sm:justify-between dark:border-slate-800/80 ${className}`}>
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-1.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            {breadcrumbs.map((b, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="h-3 w-3 text-slate-400" />}
                {b.onClick || b.href ? (
                  <button
                    onClick={b.onClick}
                    className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                  >
                    {b.label}
                  </button>
                ) : (
                  <span className={idx === breadcrumbs.length - 1 ? 'font-medium text-slate-800 dark:text-slate-200' : ''}>
                    {b.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-50">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400 leading-relaxed max-w-3xl">
            {subtitle}
          </p>
        )}

        {metadata && (
          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            {metadata}
          </div>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto shrink-0 mt-2 sm:mt-0">
          {actions}
        </div>
      )}
    </div>
  );
};
