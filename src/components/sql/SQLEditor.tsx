import React, { useState } from 'react';
import { Play, RotateCcw, Sparkles, Save, Clock, CheckCircle2, AlertCircle, Copy, Code } from 'lucide-react';

interface SQLEditorProps {
  query: string;
  onChangeQuery: (q: string) => void;
  onExecute: () => void;
  onSaveQuery: () => void;
  isExecuting: boolean;
  executionTimeMs?: number;
  rowCount?: number;
  error?: string;
  className?: string;
}

export const SQLEditor: React.FC<SQLEditorProps> = ({
  query,
  onChangeQuery,
  onExecute,
  onSaveQuery,
  isExecuting,
  executionTimeMs,
  rowCount,
  error,
  className = ''
}) => {
  const lineCount = Math.max(5, query.split('\n').length);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  const handleFormat = () => {
    // Simple clean SQL formatting
    const formatted = query
      .replace(/\s+/g, ' ')
      .replace(/\bSELECT\b/gi, '\nSELECT')
      .replace(/\bFROM\b/gi, '\nFROM')
      .replace(/\bWHERE\b/gi, '\nWHERE')
      .replace(/\bGROUP BY\b/gi, '\nGROUP BY')
      .replace(/\bHAVING\b/gi, '\nHAVING')
      .replace(/\bORDER BY\b/gi, '\nORDER BY')
      .replace(/\bLIMIT\b/gi, '\nLIMIT')
      .trim();
    onChangeQuery(formatted);
  };

  return (
    <div className={`rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 ${className}`}>
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4 text-indigo-500" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
            SQL Analytical Query Editor
          </h3>
          <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            Table: sales_data
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleFormat}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-300 min-h-[34px] cursor-pointer"
          >
            Format
          </button>

          <button
            type="button"
            onClick={() => onChangeQuery('')}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-300 min-h-[34px] cursor-pointer"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={onSaveQuery}
            className="rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300 min-h-[34px] cursor-pointer"
          >
            Save
          </button>

          <button
            type="button"
            onClick={onExecute}
            disabled={isExecuting || !query.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-50 transition-colors min-h-[34px] cursor-pointer"
          >
            <Play className={`h-3.5 w-3.5 ${isExecuting ? 'animate-spin' : ''}`} />
            <span>{isExecuting ? 'Executing...' : 'Run Query'}</span>
            <span className="hidden sm:inline font-mono text-[10px] font-normal opacity-80">(Ctrl+Enter)</span>
          </button>
        </div>
      </div>

      {/* Editor Box */}
      <div className="mt-3 flex rounded-xl border border-slate-200 bg-slate-950 font-mono text-xs text-slate-100 overflow-hidden dark:border-slate-800 shadow-inner">
        {/* Line Numbers */}
        <div className="select-none bg-slate-900 py-3 px-2 text-right text-slate-500 border-r border-slate-800 w-10 text-[11px]">
          {lineNumbers.map(n => (
            <div key={n} className="leading-5">{n}</div>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          value={query}
          onChange={(e) => onChangeQuery(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault();
              onExecute();
            }
          }}
          placeholder="SELECT region, SUM(sales) AS total_sales FROM sales_data GROUP BY region ORDER BY total_sales DESC;"
          className="flex-1 bg-transparent p-3 leading-5 text-emerald-300 focus:outline-hidden resize-y min-h-[140px] font-mono text-xs selection:bg-indigo-500 selection:text-white"
        />
      </div>

      {/* Status Bar */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          {executionTimeMs !== undefined && (
            <span className="flex items-center gap-1 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
              <Clock className="h-3.5 w-3.5" />
              <span>Executed in {executionTimeMs}ms</span>
            </span>
          )}
          {rowCount !== undefined && (
            <span className="font-mono text-[11px]">
              {rowCount.toLocaleString()} rows returned
            </span>
          )}
        </div>

        <span className="text-[10px] text-slate-400">
          Tip: Press Ctrl + Enter to run instantly
        </span>
      </div>

      {/* Error Callout */}
      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <strong>SQL Syntax Error: </strong>
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};
