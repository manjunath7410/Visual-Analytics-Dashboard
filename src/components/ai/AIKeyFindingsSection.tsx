import React from 'react';
import { Award, ArrowUpRight, CheckCircle2, AlertTriangle, Info, Sparkles } from 'lucide-react';
import { AIKeyFinding } from '../../types/gemini';

interface AIKeyFindingsSectionProps {
  findings: AIKeyFinding[];
  loading: boolean;
  className?: string;
}

export const AIKeyFindingsSection: React.FC<AIKeyFindingsSectionProps> = ({
  findings,
  loading,
  className = ''
}) => {
  return (
    <div className={`rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              AI Key Business Findings
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Validated strategic discoveries corroborated with exact empirical evidence
          </p>
        </div>

        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {findings.length} Findings
        </span>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4 animate-spin" />
          <span>Synthesizing key findings with verified mathematical evidence...</span>
        </div>
      ) : findings.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          No key findings generated for the current scope.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {findings.map((finding, idx) => {
            let badge = (
              <span className="rounded bg-sky-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800">
                Medium Priority
              </span>
            );

            if (finding.importance === 'high') {
              badge = (
                <span className="rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800">
                  High Priority
                </span>
              );
            } else if (finding.importance === 'low') {
              badge = (
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  Observational
                </span>
              );
            }

            return (
              <div 
                key={idx}
                className="rounded-xl border border-slate-200/70 bg-slate-50/50 p-4 transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-slate-850/40"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {finding.title}
                  </h4>
                  {badge}
                </div>

                <p className="mt-1.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {finding.finding}
                </p>

                {/* Evidence Callout */}
                <div className="mt-2.5 flex items-start gap-1.5 rounded-lg bg-white p-2 text-xs dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 font-mono">
                  <span className="font-sans font-bold text-indigo-600 dark:text-indigo-400 text-[11px] shrink-0">
                    Evidence:
                  </span>
                  <span className="text-slate-800 dark:text-slate-200 text-[11px]">
                    {finding.evidence}
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
