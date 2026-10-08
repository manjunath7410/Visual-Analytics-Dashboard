import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, Minus } from 'lucide-react';

export type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface StatusBadgeProps {
  variant?: StatusVariant;
  label: string;
  icon?: React.ReactNode;
  showIcon?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * StatusBadge follows anti-slop guidelines:
 * - Always pairs status color with explicit text label and icon (never color alone)
 * - Clean subtle border without bulky oversized capsules
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant = 'neutral',
  label,
  icon,
  showIcon = true,
  size = 'sm',
  className = '',
}) => {
  const getDefaultIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400" />;
      case 'danger':
        return <XCircle className="h-3 w-3 text-rose-600 dark:text-rose-400" />;
      case 'info':
        return <Info className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />;
      case 'neutral':
      default:
        return <Minus className="h-3 w-3 text-slate-500 dark:text-slate-400" />;
    }
  };

  const variantStyles: Record<StatusVariant, string> = {
    success:
      'border-emerald-200 bg-emerald-50/80 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300',
    warning:
      'border-amber-200 bg-amber-50/80 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300',
    danger:
      'border-rose-200 bg-rose-50/80 text-rose-800 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-300',
    info:
      'border-indigo-200 bg-indigo-50/80 text-indigo-800 dark:border-indigo-800/60 dark:bg-indigo-950/40 dark:text-indigo-300',
    neutral:
      'border-slate-200 bg-slate-100/80 text-slate-700 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-300',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border font-medium whitespace-nowrap ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {showIcon && (icon || getDefaultIcon())}
      <span>{label}</span>
    </span>
  );
};
