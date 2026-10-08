import React from 'react';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  className = '',
}) => {
  const isSm = size === 'sm';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <label
      className={`flex items-start gap-3 cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        onKeyDown={handleKeyDown}
        className={`
          relative inline-flex shrink-0 transition-colors duration-200 ease-in-out rounded-full
          focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-1
          cursor-pointer disabled:cursor-not-allowed
          ${isSm ? 'h-4 w-7' : 'h-5 w-9'}
          ${
            checked
              ? 'bg-indigo-600 dark:bg-indigo-500'
              : 'bg-slate-200 dark:bg-slate-700'
          }
        `}
      >
        <span
          className={`
            pointer-events-none inline-block rounded-full bg-white shadow-xs transform transition-transform duration-200 ease-in-out
            ${isSm ? 'h-3 w-3 mt-0.5' : 'h-4 w-4 mt-0.5'}
            ${
              checked
                ? isSm
                  ? 'translate-x-3.5'
                  : 'translate-x-4.5'
                : 'translate-x-0.5'
            }
          `}
        />
      </button>

      {(label || description) && (
        <div className="flex flex-col">
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
};
