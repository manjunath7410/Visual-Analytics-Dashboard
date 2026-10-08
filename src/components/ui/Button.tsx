import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'subtle';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'secondary',
      size = 'sm',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    // Base styles: Focus visible rings, typography, rounded math
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 select-none whitespace-nowrap shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]';

    // Size mappings
    const sizeStyles: Record<ButtonSize, string> = {
      xs: 'h-6 px-2 text-[11px] gap-1',
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-9 px-3.5 text-xs font-semibold gap-2',
      lg: 'h-10 px-4 text-sm font-semibold gap-2',
    };

    // Variant mappings (following 60-30-10 palette rules)
    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        'bg-indigo-600 text-white shadow-2xs hover:bg-indigo-500 active:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500',
      secondary:
        'border border-slate-200 bg-white text-slate-800 shadow-2xs hover:bg-slate-50 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-850 dark:hover:border-slate-700',
      outline:
        'border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-100/60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/60',
      ghost:
        'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
      danger:
        'bg-rose-600 text-white shadow-2xs hover:bg-rose-500 active:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500',
      subtle:
        'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
