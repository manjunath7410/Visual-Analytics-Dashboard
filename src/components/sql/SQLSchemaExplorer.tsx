import React, { useState } from 'react';
import { Database, Table, Key, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { SQLTableSchema } from '../../types/sqlAnalytics';

interface SQLSchemaExplorerProps {
  schema: SQLTableSchema;
  onInsertColumn: (colName: string) => void;
  className?: string;
}

export const SQLSchemaExplorer: React.FC<SQLSchemaExplorerProps> = ({
  schema,
  onInsertColumn,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [copiedCol, setCopiedCol] = useState<string | null>(null);

  const handleCopy = (name: string) => {
    onInsertColumn(name);
    setCopiedCol(name);
    setTimeout(() => setCopiedCol(null), 1500);
  };

  return (
    <div className={`rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 text-xs ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-indigo-500" />
          <span className="font-bold text-slate-900 dark:text-slate-100">
            Active Schema Explorer
          </span>
          <span className="rounded bg-indigo-50 px-1.5 py-0.5 font-mono text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            {schema.tableName} ({schema.rowCount.toLocaleString()} rows)
          </span>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850"
        >
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="border-b border-slate-100 font-semibold text-slate-400 dark:border-slate-800">
                <th className="py-1.5 px-2">Column Identifier</th>
                <th className="py-1.5 px-2">SQL Type</th>
                <th className="py-1.5 px-2">Nullable</th>
                <th className="py-1.5 px-2">Sample Value</th>
                <th className="py-1.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {schema.columns.map(col => (
                <tr key={col.name} className="hover:bg-slate-50/60 dark:hover:bg-slate-850/40">
                  <td className="py-1.5 px-2 font-bold text-indigo-600 dark:text-indigo-400">
                    {col.name}
                  </td>
                  <td className="py-1.5 px-2">
                    <span className="rounded bg-slate-100 px-1 py-0.5 text-[10px] text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {col.dataType}
                    </span>
                  </td>
                  <td className="py-1.5 px-2 text-slate-500 font-sans">
                    {col.nullable ? 'YES' : 'NO'}
                  </td>
                  <td className="py-1.5 px-2 text-slate-600 dark:text-slate-400 font-sans truncate max-w-[120px]">
                    {col.sampleValue || '-'}
                  </td>
                  <td className="py-1.5 text-right font-sans">
                    <button
                      onClick={() => handleCopy(col.name)}
                      className="rounded px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      {copiedCol === col.name ? <span className="text-emerald-600">Inserted</span> : '+ Insert'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
