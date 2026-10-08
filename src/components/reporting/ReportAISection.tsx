import React from 'react';
import { Sparkles, Award, Lightbulb, CheckCircle2 } from 'lucide-react';
import { AIExecutiveSummary, AIKeyFinding, AIBusinessRecommendation } from '../../types/gemini';

interface ReportAISectionProps {
  summary: AIExecutiveSummary | null;
  findings: AIKeyFinding[];
  recommendations: AIBusinessRecommendation[];
  isConfigured: boolean;
  className?: string;
}

export const ReportAISection: React.FC<ReportAISectionProps> = ({
  summary,
  findings,
  recommendations,
  isConfigured,
  className = ''
}) => {
  return (
    <div className={`rounded-xl border border-indigo-200/90 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 p-5 shadow-2xs dark:border-indigo-900/60 dark:from-indigo-950/30 dark:via-slate-900/80 dark:to-slate-900/40 break-inside-avoid ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 pb-2.5 dark:border-indigo-900/60">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
            AI-Generated Business Insights & Strategic Analysis
          </h3>
        </div>

        <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
          Gemini Interpretation Layer
        </span>
      </div>

      {summary ? (
        <div className="mt-4 space-y-4 text-xs">
          {/* Executive Performance Statement */}
          <div>
            <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500">
              Executive Synthesis:
            </span>
            <p className="mt-1 text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {summary.overallPerformance}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg bg-emerald-50/60 p-2.5 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/60">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 text-[10px] uppercase">Primary Strength</span>
              <p className="mt-0.5 text-emerald-950 dark:text-emerald-100 font-medium">{summary.strongestArea}</p>
            </div>
            <div className="rounded-lg bg-amber-50/60 p-2.5 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/60">
              <span className="font-bold text-amber-800 dark:text-amber-300 text-[10px] uppercase">Focus Area</span>
              <p className="mt-0.5 text-amber-950 dark:text-amber-100 font-medium">{summary.weakestArea}</p>
            </div>
          </div>

          {/* Key Findings List */}
          {findings.length > 0 && (
            <div>
              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500">
                Key Analytical Findings:
              </span>
              <ul className="mt-1.5 space-y-1.5">
                {findings.slice(0, 3).map((f, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-relaxed text-slate-700 dark:text-slate-300">
                    <span className="text-indigo-600 font-bold shrink-0">•</span>
                    <span><strong>{f.title}: </strong>{f.finding} <span className="font-mono text-[11px] text-slate-500">({f.evidence})</span></span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations List */}
          {recommendations.length > 0 && (
            <div className="rounded-lg bg-indigo-50/60 p-3 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
              <span className="font-bold text-indigo-950 dark:text-indigo-200 text-[10px] uppercase">
                Strategic Recommendations:
              </span>
              <ul className="mt-1.5 space-y-1 text-slate-800 dark:text-slate-200">
                {recommendations.slice(0, 3).map((r, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="font-bold text-indigo-600 shrink-0">{idx + 1}.</span>
                    <span><strong>{r.title}: </strong>{r.recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="py-4 text-center text-xs text-slate-400 font-medium">
          {isConfigured 
            ? 'AI insights loading from active analytical context...' 
            : 'AI insights are unavailable because Gemini is not currently configured.'}
        </div>
      )}

      <div className="mt-3 border-t border-indigo-100 pt-2 text-[10px] text-slate-400 dark:border-slate-800 flex items-center justify-between">
        <span>* AI-generated interpretations are based strictly on the deterministic analytical results in this report.</span>
        <span>Source of Truth: Application Calculations</span>
      </div>
    </div>
  );
};
