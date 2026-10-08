import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Database, 
  Play, 
  Save, 
  RotateCcw, 
  Download, 
  Sparkles, 
  HelpCircle, 
  Scale, 
  History, 
  FolderOpen,
  CheckCircle2,
  AlertCircle,
  Table,
  BarChart2,
  Code2,
  FileSpreadsheet,
  Terminal,
  Clock
} from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { EmptyState } from '../components/common/EmptyState';
import { GlobalFilterBar } from '../components/common/GlobalFilterBar';
import { useData } from '../context/DataContext';
import { SQLEngine } from '../utils/sql/sqlEngine';
import { SQLTableSchema, SQLQueryResult, SQLValidationItem } from '../types/sqlAnalytics';
import { SQLEditor } from '../components/sql/SQLEditor';
import { SQLSchemaExplorer } from '../components/sql/SQLSchemaExplorer';
import { SQLResultTable } from '../components/sql/SQLResultTable';
import { SQLChartVisualizer } from '../components/sql/SQLChartVisualizer';
import { SQLHistorySavedDrawer } from '../components/sql/SQLHistorySavedDrawer';
import { SQLQuestionsLibrary } from '../components/sql/SQLQuestionsLibrary';
import { SQLValidationPanel } from '../components/sql/SQLValidationPanel';
import { useToast } from '../context/ToastContext';

export const SQLAnalyticsPage: React.FC = () => {
  const { dataset, filteredRows, loadSampleDataset, activeFilterCount } = useData();
  const navigate = useNavigate();
  const { success, error, info } = useToast();

  const sourceRows = useMemo(() => {
    if (filteredRows && filteredRows.length > 0) return filteredRows;
    return dataset ? dataset.rows : [];
  }, [filteredRows, dataset]);

  // Schema definition for SQL table
  const schema: SQLTableSchema = useMemo(() => {
    return SQLEngine.generateSchema(dataset, sourceRows);
  }, [dataset, sourceRows]);

  // Default query generated dynamically based on actual schema
  const defaultQuery = useMemo(() => {
    if (!schema.columns || schema.columns.length === 0) {
      return 'SELECT * FROM sales_data LIMIT 10;';
    }
    const catCol = schema.columns.find(c => c.dataType === 'TEXT')?.name || 'region';
    const numCol = schema.columns.find(c => c.dataType === 'DECIMAL' || c.dataType === 'INTEGER')?.name || 'sales';

    return `SELECT ${catCol},\n       SUM(${numCol}) AS total_${numCol},\n       COUNT(*) AS total_orders\nFROM sales_data\nGROUP BY ${catCol}\nORDER BY total_${numCol} DESC\nLIMIT 10;`;
  }, [schema]);

  const [query, setQuery] = useState<string>(defaultQuery);
  const [queryResult, setQueryResult] = useState<SQLQueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [isVisualizing, setIsVisualizing] = useState<boolean>(false);

  // Active sub-panels
  const [activeTab, setActiveTab] = useState<'editor' | 'library' | 'validation' | 'history'>('editor');
  // Mobile responsive section switcher: [Schema] [SQL] [Results] (Requirement 18)
  const [mobileTab, setMobileTab] = useState<'sql' | 'schema' | 'results'>('sql');

  // Update default query if user hasn't edited
  useEffect(() => {
    if (schema.columns.length > 0 && query === 'SELECT * FROM sales_data LIMIT 10;') {
      setQuery(defaultQuery);
    }
  }, [defaultQuery, schema]);

  // Execute SQL Query
  const handleExecute = () => {
    if (!query.trim()) return;
    setIsExecuting(true);

    setTimeout(() => {
      const res = SQLEngine.executeQuery(query, dataset, sourceRows);
      setQueryResult(res);
      setIsExecuting(false);

      if (res.success) {
        success('Query executed successfully', `${res.rowCount.toLocaleString()} rows returned in ${res.executionTimeMs}ms`);
        // On mobile, automatically show the query results
        setMobileTab('results');
      } else {
        error('Query execution failed', res.error || 'Syntax error in SQL statement');
      }
    }, 60);
  };

  // Keyboard shortcut: Ctrl+Enter / Cmd+Enter to Run
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleExecute();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [query, dataset, sourceRows]);

  // Save Query to localStorage
  const handleSaveQuery = () => {
    if (!query.trim()) return;
    try {
      const SAVED_QUERIES_KEY = 'bi_dashboard_saved_sql_queries';
      const existing = JSON.parse(localStorage.getItem(SAVED_QUERIES_KEY) || '[]');
      const newQuery = {
        id: `saved-${Date.now()}`,
        name: `Query - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        sql: query,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(SAVED_QUERIES_KEY, JSON.stringify([newQuery, ...existing]));
      success('Query Saved', 'Saved to your workspace library');
    } catch {
      error('Storage Error', 'Could not save query to local storage');
    }
  };

  // Insert column identifier into query
  const handleInsertColumn = (colName: string) => {
    setQuery(prev => prev + ` ${colName}`);
    info('Column Inserted', `Added "${colName}" to editor cursor`);
  };

  // Parity validations between SQL engine & Analytics Engine
  const validations: SQLValidationItem[] = useMemo(() => {
    if (!dataset || sourceRows.length === 0) return [];
    return SQLEngine.validateAgainstAnalytics(dataset, sourceRows);
  }, [dataset, sourceRows]);

  if (!dataset || dataset.rows.length === 0) {
    return (
      <PageContainer
        title="SQL Analytics Workspace"
        subtitle="Query, analyze, visualize, and export insights from your dataset."
        breadcrumbs={[
          { label: 'Analytics', onClick: () => navigate('/analytics') },
          { label: 'SQL Analytics' }
        ]}
      >
        <EmptyState
          title="No Dataset Available for SQL Analytics"
          description="Upload a CSV dataset or load the commercial benchmark dataset to launch the in-memory SQL query engine."
          actionText="Upload Dataset"
          onAction={() => navigate('/upload')}
          secondaryActionText="Load Sample Dataset"
          onSecondaryAction={loadSampleDataset}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="SQL Analytics Workspace"
      subtitle="Query, analyze, visualize, and export insights from your dataset."
      fullWidth={true}
      breadcrumbs={[
        { label: 'Analytics', onClick: () => navigate('/analytics') },
        { label: 'SQL Analytics' }
      ]}
      metadata={
        <>
          <span>Database Table: <strong>sales_data</strong></span>
          <span>·</span>
          <span>Records: {sourceRows.length.toLocaleString()} rows</span>
          <span>·</span>
          <span>Columns: {schema.columns.length}</span>
        </>
      }
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('library')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'library'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Query Library</span>
          </button>

          <button
            onClick={() => setActiveTab('validation')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'validation'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
            }`}
          >
            <Scale className="h-3.5 w-3.5" />
            <span>Engine Parity ({validations.filter(v => v.status === 'MATCHED').length}/{validations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>History & Saved</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Global Filter Bar */}
        <GlobalFilterBar />

        {/* Dynamic Context Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Target Table: <code className="font-mono text-indigo-600 dark:text-indigo-400">sales_data</code>
                </span>
                <span className="rounded bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  In-Memory SQL Projections
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Source: {dataset.name} · {sourceRows.length.toLocaleString()} active rows available for queries
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
            <span>Shortcuts:</span>
            <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Ctrl+Enter
            </kbd>
            <span>Run</span>
          </div>
        </div>

        {/* Secondary Panels: Query Library, Validation, History */}
        {activeTab === 'library' && (
          <SQLQuestionsLibrary
            onSelectQuery={(sql) => {
              setQuery(sql);
              setActiveTab('editor');
              info('Query Loaded', 'Loaded template query into SQL editor');
            }}
          />
        )}

        {activeTab === 'validation' && (
          <SQLValidationPanel validations={validations} />
        )}

        {activeTab === 'history' && (
          <SQLHistorySavedDrawer
            onLoadQuery={(sql) => {
              setQuery(sql);
              setActiveTab('editor');
              info('Query Loaded', 'Loaded query from history into editor');
            }}
          />
        )}

        {/* Mobile Section Switcher Tab Bar (Requirement 18) */}
        <div className="flex lg:hidden items-center rounded-xl border border-slate-200 bg-slate-100/90 p-1 dark:border-slate-800 dark:bg-slate-900 text-xs">
          <button
            onClick={() => setMobileTab('schema')}
            className={`flex-1 rounded-lg py-2.5 font-semibold transition-all cursor-pointer min-h-[40px] text-center ${
              mobileTab === 'schema'
                ? 'bg-white text-indigo-700 shadow-2xs font-bold dark:bg-slate-800 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Schema
          </button>
          <button
            onClick={() => setMobileTab('sql')}
            className={`flex-1 rounded-lg py-2.5 font-semibold transition-all cursor-pointer min-h-[40px] text-center ${
              mobileTab === 'sql'
                ? 'bg-white text-indigo-700 shadow-2xs font-bold dark:bg-slate-800 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            SQL Editor
          </button>
          <button
            onClick={() => setMobileTab('results')}
            className={`flex-1 rounded-lg py-2.5 font-semibold transition-all cursor-pointer min-h-[40px] text-center ${
              mobileTab === 'results'
                ? 'bg-white text-indigo-700 shadow-2xs font-bold dark:bg-slate-800 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Results {queryResult ? `(${queryResult.rowCount})` : ''}
          </button>
        </div>

        {/* Main 2-Column Multi-Panel Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Schema Explorer (4 cols desktop, controlled by mobileTab on mobile) */}
          <div className={`lg:col-span-4 space-y-6 ${mobileTab !== 'schema' ? 'hidden lg:block' : 'block'}`}>
            <SQLSchemaExplorer
              schema={schema}
              onInsertColumn={handleInsertColumn}
            />

            {/* Supported Syntax Reference Card */}
            <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                <Code2 className="h-4 w-4 text-indigo-500" />
                <span>Supported SQL Grammar</span>
              </div>
              <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                {['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'DISTINCT', 'COUNT()', 'SUM()', 'AVG()', 'MIN()', 'MAX()', 'LIKE', 'BETWEEN', 'IN', 'AND', 'OR', 'NOT'].map(kw => (
                  <span key={kw} className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: SQL Editor + Result Table + Visualizer (8 cols desktop, controlled on mobile) */}
          <div className={`lg:col-span-8 space-y-6 ${mobileTab === 'schema' ? 'hidden lg:block' : 'block'}`}>
            {/* SQL Editor (Always shown on desktop, shown on mobile when mobileTab === 'sql' or no results yet) */}
            <div className={mobileTab === 'results' ? 'hidden lg:block' : 'block'}>
              <SQLEditor
                query={query}
                onChangeQuery={setQuery}
                onExecute={handleExecute}
                onSaveQuery={handleSaveQuery}
                isExecuting={isExecuting}
                executionTimeMs={queryResult?.executionTimeMs}
                rowCount={queryResult?.rowCount}
                error={queryResult?.error}
              />
            </div>

            {/* Results Section (Shown on desktop always, shown on mobile when mobileTab === 'results') */}
            <div className={mobileTab === 'sql' && queryResult ? 'hidden lg:block' : 'block'}>
              {/* Result Table */}
              {queryResult ? (
                <SQLResultTable
                  result={queryResult}
                  onToggleVisualize={() => setIsVisualizing(!isVisualizing)}
                  isVisualizing={isVisualizing}
                />
              ) : (
                mobileTab === 'results' && (
                  <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">No Query Executed Yet</p>
                    <p className="mt-1">Write your query in the SQL Editor and tap "Run Query" to view results here.</p>
                    <button
                      onClick={() => setMobileTab('sql')}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Go to SQL Editor
                    </button>
                  </div>
                )
              )}

              {/* Result Chart Visualizer */}
              {queryResult && isVisualizing && (
                <div className="mt-6">
                  <SQLChartVisualizer result={queryResult} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
