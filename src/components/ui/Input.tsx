import React from 'react';
import { Search, X, AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  isSearch?: boolean;
  onClear?: () => void;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      isSearch = false,
      onClear,
      leftElement,
      rightElement,
      className = '',
      id,
      value,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    const hasLeftIcon = isSearch || Boolean(leftElement);
    const hasValue = value !== undefined && value !== null && String(value).length > 0;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {isSearch && !leftElement && (
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none shrink-0" />
          )}
          {leftElement && (
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-slate-400 shrink-0">
              {leftElement}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            value={value}
            disabled={disabled}
            className={`
              h-9 w-full rounded-lg border bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400
              transition-all duration-150
              focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500
              disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50
              dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500
              ${hasLeftIcon ? 'pl-9' : ''}
              ${hasValue && onClear ? 'pr-8' : rightElement ? 'pr-8' : ''}
              ${
                error
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/30 dark:border-rose-800'
                  : 'border-slate-200 dark:border-slate-800 dark:focus:border-indigo-500'
              }
              ${className}
            `}
            {...props}
          />

          {hasValue && onClear && !disabled && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-2 rounded p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Clear input"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {rightElement && !onClear && (
            <div className="absolute right-2.5 flex items-center text-slate-400">
              {rightElement}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-3 w-3 shrink-0" />
            <span>{error}</span>
          </p>
        )}

        {!error && helperText && (
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
