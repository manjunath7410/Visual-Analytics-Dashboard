import React from 'react';
import { AlertTriangle, Search, CheckCircle2, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';
import { AIAnomalyExplanation } from '../../types/gemini';

interface AIAnomalyExplanationSectionProps {
  explanation: AIAnomalyExplanation | null;
  loading: boolean;
  className?: string;
}

export const AIAnomalyExplanationSection: React.FC<AIAnomalyExplanationSectionProps> = ({
  explanation,
  loading,
  className = ''
}) => {
  return (
    <div className={`rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              AI Statistical Anomaly Diagnostics
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Qualitative business diagnosis for observations outside Tukey's IQR distribution fences
          </p>
        </div>

        {explanation && (
          <span className="rounded-md bg-amber-50 border border-amber-200/80 px-2 py-0.5 font-mono text-[11px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
            {explanation.anomalyCount} Flagged
          </span>
        )}
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4 animate-spin" />
          <span>Formulating audit recommendations for statistical outliers...</span>
        </div>
      ) : explanation ? (
        <div className="mt-4 space-y-3.5">
          <div className="rounded-lg bg-amber-50/40 border border-amber-200/60 p-3 text-xs text-amber-950 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-200 leading-relaxed">
            <span className="font-bold">Executive Diagnostic: </span>
            <span>{explanation.summary}</span>
          </div>

          <div className="space-y-3">
            {explanation.interpretations.map((item, idx) => (
              <div 
                key={idx}
                className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-850/40"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-sans font-bold text-xs text-slate-900 dark:text-slate-100">
                    {item.entity}
                  </h4>
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    Distribution Outlier
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  <strong className="text-slate-700 dark:text-slate-200">Observation: </strong>
                  {item.observation}
                </p>

                <p className="mt-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <strong className="text-slate-700 dark:text-slate-200">Contextual Meaning: </strong>
                  {item.interpretation}
                </p>

                {/* Audit checklist */}
                <div className="mt-2.5 flex items-start gap-1.5 rounded-lg bg-white p-2.5 text-xs dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <Search className="h-3.5 w-3.5 text-indigo-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-indigo-700 dark:text-indigo-300 text-[11px]">
                      Recommended Audit Action:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                      {item.recommendedInvestigation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
