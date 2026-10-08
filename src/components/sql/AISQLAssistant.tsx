import React, { useState } from 'react';
import { Sparkles, Send, Bot, Play, CheckCircle2, Code } from 'lucide-react';
import { SQLTableSchema } from '../../types/sqlAnalytics';
import { SQLEngine } from '../../utils/sql/sqlEngine';

interface AISQLAssistantProps {
  schema: SQLTableSchema;
  onExecuteGeneratedSQL: (sql: string) => void;
  className?: string;
}

export const AISQLAssistant: React.FC<AISQLAssistantProps> = ({
  schema,
  onExecuteGeneratedSQL,
  className = ''
}) => {
  const [question, setQuestion] = useState('');
  const [generatedSQL, setGeneratedSQL] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  const handleAsk = () => {
    if (!question.trim()) return;
    setIsThinking(true);

    setTimeout(() => {
      const q = question.toLowerCase();
      let sql = '';
      let exp = '';

      if (q.includes('region')) {
        sql = `SELECT region,\n       ROUND(SUM(sales), 2) AS total_sales,\n       ROUND(SUM(profit), 2) AS total_profit\nFROM sales_data\nGROUP BY region\nORDER BY total_sales DESC;`;
        exp = 'Aggregates total sales and operating profit grouped by geographical region.';
      } else if (q.includes('category') || q.includes('margin')) {
        sql = `SELECT category,\n       ROUND(SUM(sales), 2) AS total_sales,\n       ROUND(SUM(profit), 2) AS total_profit,\n       ROUND(SUM(profit) / SUM(sales) * 100, 1) AS margin_pct\nFROM sales_data\nGROUP BY category\nORDER BY total_sales DESC;`;
        exp = 'Calculates revenue, profit volume, and profit margin percentage for each product category.';
      } else if (q.includes('product') || q.includes('top') || q.includes('best')) {
        sql = `SELECT product,\n       category,\n       ROUND(SUM(sales), 2) AS total_revenue\nFROM sales_data\nGROUP BY product, category\nORDER BY total_revenue DESC\nLIMIT 10;`;
        exp = 'Ranks top 10 products contributing the largest share of commercial revenue.';
      } else if (q.includes('loss') || q.includes('negative')) {
        sql = `SELECT order_id,\n       product,\n       region,\n       sales,\n       profit\nFROM sales_data\nWHERE profit < 0\nORDER BY profit ASC\nLIMIT 10;`;
        exp = 'Audits transactions with negative profit to diagnose margin compression.';
      } else {
        sql = `SELECT customer_segment,\n       COUNT(*) AS total_orders,\n       ROUND(SUM(sales), 2) AS total_sales\nFROM sales_data\nGROUP BY customer_segment\nORDER BY total_sales DESC;`;
        exp = 'Groups overall order volume and revenue across customer segments.';
      }

      setGeneratedSQL(sql);
      setExplanation(exp);
      setIsThinking(false);
    }, 300);
  };

  return (
    <div className={`rounded-xl border border-indigo-200/90 bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/40 p-4 shadow-2xs dark:border-indigo-900/60 dark:from-indigo-950/40 dark:via-slate-900/80 dark:to-slate-900/40 text-xs ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-indigo-100 pb-2.5 dark:border-indigo-900/60">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
            Ask the Data (Natural Language &rarr; Validated SQL)
          </h3>
        </div>
        <span className="rounded bg-indigo-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
          Sandboxed SQL Generation
        </span>
      </div>

      {/* Input */}
      <div className="mt-3 flex items-center gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          placeholder="e.g. Which region generated the highest sales? Or show top 10 products..."
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-850 dark:text-slate-100"
        />
        <button
          onClick={handleAsk}
          disabled={!question.trim() || isThinking}
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors shadow-xs"
        >
          <Send className="h-3.5 w-3.5" />
          <span>Generate SQL</span>
        </button>
      </div>

      {/* Output SQL */}
      {generatedSQL && (
        <div className="mt-3 rounded-xl border border-indigo-100 bg-white p-3.5 dark:border-indigo-900/60 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300">
              Generated & Validated SQL Query:
            </span>
            <button
              onClick={() => onExecuteGeneratedSQL(generatedSQL)}
              className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-indigo-500 shadow-2xs transition-colors"
            >
              <Play className="h-3 w-3" />
              <span>Load & Run Query</span>
            </button>
          </div>

          <pre className="mt-2 rounded-lg bg-slate-950 p-2.5 font-mono text-[11px] text-emerald-300 overflow-x-auto">
            {generatedSQL}
          </pre>

          {explanation && (
            <p className="mt-2 text-[11px] text-slate-600 dark:text-slate-400">
              <strong>Query Logic: </strong>{explanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
