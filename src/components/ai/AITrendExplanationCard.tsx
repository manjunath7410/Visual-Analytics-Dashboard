import React from 'react';
import { TrendingUp, ArrowRight, CheckCircle2, HelpCircle, Sparkles } from 'lucide-react';
import { AITrendExplanation } from '../../types/gemini';

interface AITrendExplanationCardProps {
  explanation: AITrendExplanation | null;
  loading: boolean;
  className?: string;
}

export const AITrendExplanationCard: React.FC<AITrendExplanationCardProps> = ({
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
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              AI Trend Analysis & Hypothesis Validation
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Strict separation of verified chronological observations from analytical hypotheses
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4 animate-spin" />
          <span>Deconstructing time-series trends and validating deltas...</span>
        </div>
      ) : explanation ? (
        <div className="mt-4 space-y-4">
          {/* Trajectory Summary */}
          <div className="rounded-lg bg-emerald-50/50 border border-emerald-200/80 p-3 dark:bg-emerald-950/30 dark:border-emerald-900/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Overall Trajectory
            </span>
            <p className="mt-0.5 text-xs font-semibold text-emerald-950 dark:text-emerald-100">
              {explanation.directionSummary}
            </p>
          </div>

          {/* 2-Column Grid: Observed Facts vs Possible Explanations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Column 1: Observed Facts (Definitive) */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-850/40">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Observed Facts (Corroborated)</span>
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                Empirical numbers recorded in the dataset
              </p>

              <ul className="mt-3 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {explanation.observedFacts.map((fact, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">•</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Possible Explanations (Hypotheses) */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-850/40">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
                <HelpCircle className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                <span>Possible Explanations (Hypotheses)</span>
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                Plausible business hypotheses requiring further operational review
              </p>

              <ul className="mt-3 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {explanation.possibleExplanations.map((exp, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                    <span className="text-sky-600 dark:text-sky-400 font-bold shrink-0">•</span>
                    <span>{exp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
