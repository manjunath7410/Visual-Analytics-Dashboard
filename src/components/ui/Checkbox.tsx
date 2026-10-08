import React from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: React.ReactNode;
  description?: string;
  checkboxSize?: 'sm' | 'md';
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, checked, disabled, checkboxSize = 'md', className = '', onChange, ...props }, ref) => {
    return (
      <label
        className={`inline-flex items-start gap-2.5 cursor-pointer select-none ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
      >
        <div className="relative flex items-center pt-0.5">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="peer sr-only"
            {...props}
          />
          <div
            className={`
              ${checkboxSize === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} rounded border transition-all duration-150 flex items-center justify-center
              peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500/40 peer-focus-visible:ring-offset-1
              ${
                checked
                  ? 'bg-indigo-600 border-indigo-600 text-white dark:bg-indigo-500 dark:border-indigo-500'
                  : 'border-slate-300 bg-white hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600'
              }
            `}
          >
            {checked && <Check className="h-3 w-3 stroke-[3]" />}
          </div>
        </div>

        {(label || description) && (
          <div className="flex flex-col text-left">
            {label && (
              <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                {label}
              </span>
            )}
            {description && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
