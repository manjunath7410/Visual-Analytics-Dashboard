import React, { useState, useEffect } from 'react';
import { FolderOpen, Clock, Play, Trash2, Copy, Plus, Check } from 'lucide-react';
import { SavedSQLQuery, SQLHistoryItem } from '../../types/sqlAnalytics';

const SAVED_QUERIES_KEY = 'bi_dashboard_saved_sql_queries';
const QUERY_HISTORY_KEY = 'bi_dashboard_sql_history';

interface SQLHistorySavedDrawerProps {
  onLoadQuery: (sql: string) => void;
  className?: string;
}

export const SQLHistorySavedDrawer: React.FC<SQLHistorySavedDrawerProps> = ({
  onLoadQuery,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'saved' | 'history'>('saved');
  const [savedQueries, setSavedQueries] = useState<SavedSQLQuery[]>([]);
  const [history, setHistory] = useState<SQLHistoryItem[]>([]);

  const loadAll = () => {
    try {
      const s = localStorage.getItem(SAVED_QUERIES_KEY);
      if (s) setSavedQueries(JSON.parse(s));
      const h = localStorage.getItem(QUERY_HISTORY_KEY);
      if (h) setHistory(JSON.parse(h));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleDeleteSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedQueries.filter(q => q.id !== id);
    setSavedQueries(updated);
    localStorage.setItem(SAVED_QUERIES_KEY, JSON.stringify(updated));
  };

  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem(QUERY_HISTORY_KEY, JSON.stringify(updated));
  };

  return (
    <div className={`rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 text-xs ${className}`}>
      {/* Header Tabs */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-indigo-500" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
            Query Workspace
          </h3>
        </div>

        <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800 text-[11px]">
          <button
            onClick={() => setActiveTab('saved')}
            className={`rounded px-2.5 py-0.5 font-semibold transition-colors ${
              activeTab === 'saved' ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white' : 'text-slate-500'
            }`}
          >
            Saved ({savedQueries.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`rounded px-2.5 py-0.5 font-semibold transition-colors ${
              activeTab === 'history' ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white' : 'text-slate-500'
            }`}
          >
            History ({history.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-3 max-h-56 overflow-y-auto space-y-2 pr-1">
        {activeTab === 'saved' && (
          savedQueries.length === 0 ? (
            <div className="py-6 text-center text-slate-400">
              No saved SQL queries yet. Use "Save Query" in editor.
            </div>
          ) : (
            savedQueries.map(q => (
              <div
                key={q.id}
                onClick={() => onLoadQuery(q.sql)}
                className="group flex items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50/60 p-2.5 hover:border-indigo-400 hover:bg-indigo-50/30 cursor-pointer dark:border-slate-800 dark:bg-slate-850/40 transition-all"
              >
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">{q.name}</h4>
                  <p className="font-mono text-[10px] text-slate-400 truncate max-w-[200px]">{q.sql}</p>
                </div>

                <div className="flex items-center gap-1">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 text-[10px] group-hover:inline-block hidden">Run &rarr;</span>
                  <button
                    onClick={(e) => handleDeleteSaved(q.id, e)}
                    className="rounded p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          )
        )}

        {activeTab === 'history' && (
          history.length === 0 ? (
            <div className="py-6 text-center text-slate-400">
              No recent queries in local execution history.
            </div>
          ) : (
            history.map(h => (
              <div
                key={h.id}
                onClick={() => onLoadQuery(h.query)}
                className="group flex items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50/60 p-2.5 hover:border-indigo-400 hover:bg-indigo-50/30 cursor-pointer dark:border-slate-800 dark:bg-slate-850/40 transition-all"
              >
                <div>
                  <p className="font-mono text-xs text-slate-800 dark:text-slate-200 truncate max-w-[220px]">{h.query}</p>
                  <span className="font-mono text-[10px] text-slate-400">{h.executionTimeMs}ms · {h.rowCount} rows · {h.timestamp}</span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 text-[10px] group-hover:inline-block hidden">Load</span>
                  <button
                    onClick={(e) => handleDeleteHistory(h.id, e)}
                    className="rounded p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
};
