import React from 'react';
import { X, Filter } from 'lucide-react';

export interface FilterChipItem {
  id: string;
  label: string;
  value: string;
  category?: string;
  onRemove: () => void;
}

export interface FilterChipsProps {
  chips: FilterChipItem[];
  onClearAll?: () => void;
  className?: string;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  chips,
  onClearAll,
  className = '',
}) => {
  if (chips.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-1.5 text-xs ${className}`}>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
        <Filter className="h-3 w-3" />
        <span>Active:</span>
      </span>

      {chips.map((chip) => (
        <span
          key={chip.id}
          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-800 shadow-2xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          {chip.category && (
            <span className="font-semibold text-slate-500 dark:text-slate-400">
              {chip.category}:
            </span>
          )}
          <span>{chip.value}</span>
          <button
            onClick={chip.onRemove}
            className="ml-0.5 rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-800 dark:hover:text-rose-400"
            aria-label={`Remove filter for ${chip.category || ''} ${chip.value}`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}

      {onClearAll && chips.length > 1 && (
        <button
          onClick={onClearAll}
          className="ml-1 text-[11px] font-semibold text-indigo-600 hover:underline dark:text-indigo-400 cursor-pointer"
        >
          Clear All
        </button>
      )}
    </div>
  );
};
