import React from 'react';
import { CheckCircle2, ArrowRight, Clock, Layers, Database } from 'lucide-react';
import { ETLStage } from '../../types/etl';

interface ETLPipelineStatusProps {
  stages: ETLStage[];
  className?: string;
}

export const ETLPipelineStatus: React.FC<ETLPipelineStatusProps> = ({ stages, className = '' }) => {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-indigo-500" />
          <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Client-Side ETL Pipeline Architecture
          </h3>
        </div>
        <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          Continuous In-Memory Stream
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stages.map((stage, idx) => {
          const isDone = stage.status === 'completed';
          const isReady = stage.status === 'ready';

          return (
            <div
              key={stage.id}
              className={`relative flex flex-col justify-between rounded-xl border p-3.5 transition-colors ${
                isDone
                  ? 'border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20'
                  : isReady
                  ? 'border-indigo-200/80 bg-indigo-50/40 dark:border-indigo-900/50 dark:bg-indigo-950/20'
                  : 'border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Stage 0{idx + 1}
                  </span>
                  {isDone ? (
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{stage.label}ed</span>
                    </span>
                  ) : isReady ? (
                    <span className="inline-flex items-center gap-1 rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                      <span>Ready</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      <span>Pending</span>
                    </span>
                  )}
                </div>

                <h4 className="mt-2 text-xs font-bold text-slate-900 dark:text-slate-100">
                  {stage.name}
                </h4>

                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {stage.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
