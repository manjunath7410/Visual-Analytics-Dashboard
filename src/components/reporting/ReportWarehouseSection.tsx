import React from 'react';
import { Database, Table, Layers, Key } from 'lucide-react';
import { StarSchema } from '../../types/dataWarehouse';

interface ReportWarehouseSectionProps {
  schema: StarSchema;
  className?: string;
}

export const ReportWarehouseSection: React.FC<ReportWarehouseSectionProps> = ({
  schema,
  className = ''
}) => {
  const fact = schema.factTable;
  const dims = schema.dimensions;

  return (
    <div className={`rounded-xl border border-purple-200/80 bg-white p-5 shadow-2xs dark:border-purple-900/60 dark:bg-slate-900/90 break-inside-avoid ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-100 pb-2.5 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-purple-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
            Dimensional Data Warehouse Architecture
          </h3>
        </div>

        <span className="rounded-md bg-purple-50 px-2 py-0.5 font-mono text-[10px] font-bold text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800">
          Star Schema · 1 Fact + {dims.length} Dimensions
        </span>
      </div>

      {/* Fact & Dimensions Summary */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fact Table Card */}
        <div className="rounded-lg border border-purple-100 bg-purple-50/40 p-3.5 dark:border-purple-900/40 dark:bg-purple-950/20 text-xs">
          <div className="flex items-center justify-between font-bold text-purple-950 dark:text-purple-100">
            <span>Central Fact Table: {fact.name}</span>
            <span className="font-mono text-[11px]">{fact.rowCount.toLocaleString()} rows</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 font-mono">Surrogate Primary Key: {fact.primaryKey}</p>
          <div className="mt-2 text-slate-700 dark:text-slate-300">
            <span className="font-semibold">Measures: </span>
            <span className="font-mono">{fact.measures.map(m => `${m.name} (${m.additivity})`).join(', ')}</span>
          </div>
        </div>

        {/* Dimension Tables Card */}
        <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-850/40 text-xs">
          <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
            <span>Normalized Dimensions ({dims.length})</span>
            <span className="font-mono text-[11px]">{dims.reduce((a, d) => a + d.rowCount, 0).toLocaleString()} unique rows</span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5 font-mono text-[11px]">
            {dims.map(d => (
              <div key={d.name} className="flex items-center justify-between rounded bg-white p-1 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-sky-700 dark:text-sky-300">{d.name}</span>
                <span className="text-slate-400">{d.rowCount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
