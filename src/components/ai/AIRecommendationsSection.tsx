import React from 'react';
import { Lightbulb, ArrowRight, ShieldCheck, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';
import { AIBusinessRecommendation } from '../../types/gemini';

interface AIRecommendationsSectionProps {
  recommendations: AIBusinessRecommendation[];
  loading: boolean;
  className?: string;
}

export const AIRecommendationsSection: React.FC<AIRecommendationsSectionProps> = ({
  recommendations,
  loading,
  className = ''
}) => {
  return (
    <div className={`rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              AI Strategic Recommendations
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Actionable tactical initiatives tied strictly to verified performance observations
          </p>
        </div>

        <span className="rounded-md bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 font-mono text-[11px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800">
          {recommendations.length} Actions
        </span>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4 animate-spin" />
          <span>Formulating data-grounded strategic recommendations...</span>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          No recommendations generated for active scope.
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => {
            let priorityBadge = (
              <span className="rounded bg-sky-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800">
                Medium Priority
              </span>
            );

            if (rec.priority === 'high') {
              priorityBadge = (
                <span className="rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800">
                  High Priority
                </span>
              );
            }

            return (
              <div 
                key={rec.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-slate-850/40"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-sans font-bold text-xs text-slate-900 dark:text-slate-100">
                      {rec.title}
                    </h4>
                    {priorityBadge}
                  </div>

                  {/* Observation callout */}
                  <div className="mt-2.5 rounded-lg bg-white/80 p-2 text-xs text-slate-600 dark:bg-slate-900/80 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Observation: </span>
                    <span>{rec.observation}</span>
                  </div>

                  {/* Action recommendation */}
                  <div className="mt-2 text-xs text-slate-800 dark:text-slate-200">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">Action: </span>
                    <span>{rec.recommendation}</span>
                  </div>
                </div>

                {/* Expected impact footer */}
                <div className="mt-3.5 border-t border-slate-200/60 pt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between dark:border-slate-800">
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    Impact: {rec.expectedImpact}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
