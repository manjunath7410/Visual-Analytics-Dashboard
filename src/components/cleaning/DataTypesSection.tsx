import React, { useState } from 'react';
import { ColumnMetadata, ColumnDataType } from '../../types/dataset';
import { Binary, Calendar, Tag, Type, Check, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';

interface DataTypesSectionProps {
  columns: ColumnMetadata[];
  onOverrideType: (columnName: string, newType: ColumnDataType) => void;
  onCleanNumeric: (columnName: string, strategy: 'to_missing' | 'replace_zero' | 'remove_rows') => void;
  onCleanDates: (columnName: string, strategy: 'remove_invalid' | 'to_missing') => void;
  className?: string;
}

export const DataTypesSection: React.FC<DataTypesSectionProps> = ({
  columns,
  onOverrideType,
  onCleanNumeric,
  onCleanDates,
  className = ''
}) => {
  const [selectedCol, setSelectedCol] = useState<string>(columns[0]?.name ?? '');
  const [targetType, setTargetType] = useState<ColumnDataType>('Number');
  const [numStrategy, setNumStrategy] = useState<'to_missing' | 'replace_zero' | 'remove_rows'>('replace_zero');
  const [dateStrategy, setDateStrategy] = useState<'remove_invalid' | 'to_missing'>('to_missing');

  const activeCol = columns.find(c => c.name === selectedCol);

  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 dark:border-slate-800 gap-2">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Schema Types & Type Inconsistency Sanitization
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Manually override inferred column types or sanitize invalid values inside numerical and temporal columns
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Type Override Tool */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-850/40">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
            1. Manual Data Type Override
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Explicitly re-cast an attribute if statistical detection inferred an incorrect schema type.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Column</label>
              <select
                value={selectedCol}
                onChange={(e) => {
                  setSelectedCol(e.target.value);
                  const found = columns.find(c => c.name === e.target.value);
                  if (found) setTargetType(found.type);
                }}
                className="mt-1 w-full rounded border border-slate-200 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              >
                {columns.map(c => (
                  <option key={c.name} value={c.name}>{c.name} ({c.type})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Target Type</label>
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as ColumnDataType)}
                className="mt-1 w-full rounded border border-slate-200 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              >
                <option value="Number">Number</option>
                <option value="Category">Category</option>
                <option value="Date">Date</option>
                <option value="Text">Text</option>
                <option value="Boolean">Boolean</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => onOverrideType(selectedCol, targetType)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500"
          >
            <span>Apply Type Override</span>
          </button>
        </div>

        {/* Specialized Numeric & Date Sanitizer */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-850/40">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
            2. Numeric & Date Value Sanitization
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Sanitize corrupted values (e.g. unparseable text in numbers or ambiguous dates).
          </p>

          {activeCol?.type === 'Number' ? (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Invalid Numeric Values in "{activeCol.name}":
                </label>
                <select
                  value={numStrategy}
                  onChange={(e: any) => setNumStrategy(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-200 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  <option value="replace_zero">Replace Invalid Values with 0</option>
                  <option value="to_missing">Convert Invalid Values to Missing (NULL)</option>
                  <option value="remove_rows">Remove Rows Containing Invalid Numbers</option>
                </select>
              </div>

              <button
                onClick={() => onCleanNumeric(activeCol.name, numStrategy)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500"
              >
                <span>Sanitize Numbers</span>
              </button>
            </div>
          ) : activeCol?.type === 'Date' ? (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Invalid Dates in "{activeCol.name}":
                </label>
                <select
                  value={dateStrategy}
                  onChange={(e: any) => setDateStrategy(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-200 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  <option value="to_missing">Convert Invalid Dates to Missing (NULL)</option>
                  <option value="remove_invalid">Remove Rows with Invalid Dates</option>
                </select>
              </div>

              <button
                onClick={() => onCleanDates(activeCol.name, dateStrategy)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500"
              >
                <span>Sanitize Dates</span>
              </button>
            </div>
          ) : (
            <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              Selected column is {activeCol?.type}. Select a Numeric or Date column to apply specialized value sanitizers.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
