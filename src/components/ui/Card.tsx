import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  elevation?: 'flat' | 'elevated' | 'subtle';
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      elevation = 'flat',
      interactive = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const elevationStyles = {
      flat: 'border border-slate-200/90 bg-white dark:border-slate-800/90 dark:bg-slate-900/90 shadow-2xs',
      elevated:
        'border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900',
      subtle:
        'border border-slate-200/60 bg-slate-50/60 dark:border-slate-800/60 dark:bg-slate-950/60',
    };

    const interactiveStyles = interactive
      ? 'hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-150 cursor-pointer'
      : '';

    return (
      <div
        ref={ref}
        className={`rounded-xl p-5 ${elevationStyles[elevation]} ${interactiveStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  kicker?: string;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, kicker, action, className = '' }) => {
  return (
    <div className={`mb-4 flex items-start justify-between gap-3 ${className}`}>
      <div className="min-w-0">
        {kicker && (
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {kicker}
          </p>
        )}
        <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100 truncate">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return <div className={`relative ${className}`}>{children}</div>;
};

export const CardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div
      className={`mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800/60 dark:text-slate-400 ${className}`}
    >
      {children}
    </div>
  );
};
