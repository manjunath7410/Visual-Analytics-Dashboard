import React from 'react';
import { Sparkles, AlertCircle, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';
import { AIConfigStatus } from '../../types/gemini';

interface AIStatusBannerProps {
  status: AIConfigStatus | null;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  className?: string;
}

export const AIStatusBanner: React.FC<AIStatusBannerProps> = ({
  status,
  loading,
  error,
  onRetry,
  className = ''
}) => {
  if (loading) {
    return (
      <div className={`flex items-center justify-between rounded-xl border border-indigo-200/80 bg-indigo-50/60 p-3 text-xs dark:border-indigo-900/60 dark:bg-indigo-950/30 ${className}`}>
        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
          <RefreshCw className="h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400" />
          <span className="font-semibold">Analyzing your dashboard with Gemini AI...</span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">Evaluating filtered metrics</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs dark:border-amber-900/60 dark:bg-amber-950/30 ${className}`}>
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
          <span>
            <strong>AI Notice:</strong> {error}
          </span>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-white px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-50 dark:border-amber-800 dark:bg-slate-900 dark:text-amber-200 shadow-2xs transition-colors shrink-0"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Retry Analysis</span>
          </button>
        )}
      </div>
    );
  }

  if (status && !status.configured) {
    return (
      <div className={`flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-850/60 ${className}`}>
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <Sparkles className="h-4 w-4 text-slate-400" />
          <span>
            AI insights are unavailable because Gemini is not configured. Add <code className="rounded bg-slate-200 px-1 py-0.5 font-mono text-[10px] dark:bg-slate-700">GEMINI_API_KEY</code> to the environment configuration.
          </span>
        </div>
      </div>
    );
  }

  return null;
};
