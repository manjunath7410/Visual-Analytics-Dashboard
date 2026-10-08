import React, { useState } from 'react';
import { HelpCircle, ChevronRight, Sparkles, Database, TrendingUp, DollarSign, Users, AlertTriangle } from 'lucide-react';
import { SQLBusinessQuestion } from '../../types/sqlAnalytics';
import { SQLEngine } from '../../utils/sql/sqlEngine';

interface SQLQuestionsLibraryProps {
  onSelectQuery: (sql: string) => void;
  className?: string;
}

export const SQLQuestionsLibrary: React.FC<SQLQuestionsLibraryProps> = ({
  onSelectQuery,
  className = ''
}) => {
  const questions = SQLEngine.getPredefinedQueries();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'Revenue Analysis', 'Profitability', 'Products', 'Customers', 'Anomalies & Risk', 'Trends'];

  const filtered = selectedCategory === 'all' ? questions : questions.filter(q => q.category === selectedCategory);

  return (
    <div className={`rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 text-xs ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-sky-500" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
            SQL Business Questions Library
          </h3>
        </div>

        <span className="font-mono text-[10px] text-slate-400">
          Click any analytical question to load query
        </span>
      </div>

      {/* Category Filter Chips */}
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-md px-2 py-0.5 text-[11px] font-semibold transition-colors ${
              selectedCategory === cat
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-300'
            }`}
          >
            {cat === 'all' ? 'All Questions' : cat}
          </button>
        ))}
      </div>

      {/* Question Cards Grid */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {filtered.map(q => (
          <div
            key={q.id}
            onClick={() => onSelectQuery(q.sql)}
            className="group cursor-pointer rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 hover:border-sky-400 hover:bg-sky-50/30 dark:border-slate-800 dark:bg-slate-850/40 dark:hover:border-sky-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                <span>{q.category}</span>
                <span className="group-hover:text-sky-600 dark:group-hover:text-sky-400 font-bold transition-colors">Load &rarr;</span>
              </div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs leading-snug">
                {q.question}
              </h4>
              <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                {q.explanation}
              </p>
            </div>

            <div className="mt-2.5 border-t border-slate-200/60 pt-1.5 text-[10px] text-slate-400 font-mono truncate dark:border-slate-800">
              {q.sql.split('\n')[0]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
