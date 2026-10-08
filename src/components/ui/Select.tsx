import React from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: SelectOption[];
  error?: string;
  helperText?: string;
  leftElement?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      error,
      helperText,
      leftElement,
      children,
      className = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftElement && (
            <div className="absolute left-2.5 flex items-center pointer-events-none text-slate-400">
              {leftElement}
            </div>
          )}

          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={`
              h-9 w-full appearance-none rounded-lg border bg-white px-3 pr-8 text-xs text-slate-900
              transition-all duration-150 cursor-pointer
              focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500
              disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50
              dark:bg-slate-900 dark:text-slate-100
              ${leftElement ? 'pl-8' : ''}
              ${
                error
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/30 dark:border-rose-800'
                  : 'border-slate-200 dark:border-slate-800 dark:focus:border-indigo-500'
              }
              ${className}
            `}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
                    className="dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  >
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-slate-400" />
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

Select.displayName = 'Select';
