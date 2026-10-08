import React, { useState } from 'react';
import { 
  Database, 
  Key, 
  Table, 
  ArrowRight, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  Hash, 
  Tag, 
  Info,
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { StarSchema, DimensionTable, FactTable } from '../../types/dataWarehouse';
import { BIEngine } from '../../utils/analytics/biEngine';

interface StarSchemaDiagramProps {
  schema: StarSchema;
  selectedTableName: string;
  onSelectTable: (tableName: string) => void;
  className?: string;
}

export const StarSchemaDiagram: React.FC<StarSchemaDiagramProps> = ({
  schema,
  selectedTableName,
  onSelectTable,
  className = ''
}) => {
  const fact = schema.factTable;
  const dims = schema.dimensions;
  const [hoveredDim, setHoveredDim] = useState<string | null>(null);
  const [inspectDrawerTable, setInspectDrawerTable] = useState<string | null>(null);
  // Mobile responsive view toggle (Requirement 19)
  const [mobileView, setMobileView] = useState<'canvas' | 'cards'>('canvas');

  // Split dimensions into spatial groupings around Fact table
  const topDim = dims.find(d => d.name === 'Dim_Date' || d.name.toLowerCase().includes('date') || d.name.toLowerCase().includes('time'));
  const otherDims = dims.filter(d => d !== topDim);
  
  // Left and Right splits
  const half = Math.ceil(otherDims.length / 2);
  const leftDims = otherDims.slice(0, half);
  const rightDims = otherDims.slice(half);

  // Selected table entity details
  const activeTableEntity = inspectDrawerTable === fact.name
    ? { isFact: true, name: fact.name, pk: fact.primaryKey, rows: fact.rowCount, cols: fact.columns, measures: fact.measures, fks: fact.foreignKeys }
    : (() => {
        const dim = dims.find(d => d.name === inspectDrawerTable);
        if (!dim) return null;
        return { isFact: false, name: dim.name, pk: dim.primaryKey, rows: dim.rowCount, cols: dim.columns, measures: [], fks: [] };
      })();

  return (
    <div className={`rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 ${className}`}>
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Interactive Star Schema Architecture
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Relational multi-dimensional model: 1 Central Fact Table connected to {dims.length} Dimension Tables via Surrogate Keys
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold">
            <span className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
            <span>Fact Table</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <div className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-semibold">
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            <span>Dimension Table</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
            <Key className="h-2.5 w-2.5" />
            <span>Surrogate / Foreign Key</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold">
            <Hash className="h-2.5 w-2.5" />
            <span>Measure</span>
          </div>
        </div>
      </div>

      {/* Mobile View Switcher (Requirement 19) */}
      <div className="mt-3 flex sm:hidden items-center rounded-lg bg-slate-100 p-1 dark:bg-slate-800 text-xs">
        <button
          onClick={() => setMobileView('canvas')}
          className={`flex-1 rounded-md py-2 font-semibold text-center transition-colors cursor-pointer min-h-[38px] ${
            mobileView === 'canvas'
              ? 'bg-white text-indigo-700 shadow-2xs font-bold dark:bg-slate-700 dark:text-indigo-400'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Visual Diagram
        </button>
        <button
          onClick={() => setMobileView('cards')}
          className={`flex-1 rounded-md py-2 font-semibold text-center transition-colors cursor-pointer min-h-[38px] ${
            mobileView === 'cards'
              ? 'bg-white text-indigo-700 shadow-2xs font-bold dark:bg-slate-700 dark:text-indigo-400'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Table Structure Cards
        </button>
      </div>

      {/* Date Dimension Hierarchy Banner (Requirement 9) */}
      {topDim && (
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-sky-100 bg-sky-50/50 p-2.5 text-xs dark:border-sky-900/40 dark:bg-sky-950/20">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Temporal Dimension Hierarchy:
            </span>
            <div className="flex items-center gap-1 font-mono text-[11px] text-sky-700 dark:text-sky-300">
              <span className="font-bold">Year</span>
              <ChevronRight className="h-3 w-3 text-sky-400" />
              <span className="font-bold">Quarter</span>
              <ChevronRight className="h-3 w-3 text-sky-400" />
              <span className="font-bold">Month</span>
              <ChevronRight className="h-3 w-3 text-sky-400" />
              <span className="font-bold">Day (ISO Date Key)</span>
            </div>
          </div>

          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            Enables granular OLAP roll-up & drill-down across quarters & fiscal years
          </span>
        </div>
      )}

      {/* Mobile Stacked Table Structure Cards View */}
      {mobileView === 'cards' && (
        <div className="mt-4 space-y-3.5 sm:hidden">
          {/* Fact Table Card */}
          <div 
            onClick={() => {
              onSelectTable(fact.name);
              setInspectDrawerTable(fact.name);
            }}
            className="rounded-xl border-2 border-indigo-500/80 bg-indigo-50/60 p-4 dark:border-indigo-800 dark:bg-indigo-950/40 cursor-pointer shadow-xs"
          >
            <div className="flex items-center justify-between border-b border-indigo-200 pb-2 dark:border-indigo-800">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                  {fact.name}
                </span>
              </div>
              <span className="rounded bg-indigo-600 px-2 py-0.5 font-mono text-[9px] font-bold text-white">
                CENTRAL FACT
              </span>
            </div>

            <div className="mt-2.5 text-xs space-y-1.5 font-mono">
              <div className="flex items-center justify-between text-indigo-900 dark:text-indigo-300 font-bold">
                <span className="flex items-center gap-1">
                  <Key className="h-3 w-3 text-amber-500" />
                  PK: {fact.primaryKey}
                </span>
                <span className="text-[10px] font-sans text-slate-500">Surrogate</span>
              </div>

              <div className="text-[11px] pt-1">
                <span className="text-slate-500 font-sans font-semibold">Foreign Keys ({fact.foreignKeys.length}):</span>
                {fact.foreignKeys.map(fk => (
                  <div key={fk.keyName} className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-300 pl-2">
                    <span>{fk.keyName}</span>
                    <span className="text-indigo-600 dark:text-indigo-400">&rarr; {fk.referencesTable}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-indigo-200/80 pt-1.5 dark:border-indigo-800 flex items-center justify-between text-[11px] font-sans">
                <span className="text-slate-500">Measures ({fact.measures.length}):</span>
                <span className="font-bold text-purple-700 dark:text-purple-300 font-mono">
                  {fact.measures.map(m => m.name).join(', ')}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-indigo-200/80 pt-1.5 dark:border-indigo-800 text-[11px] font-sans">
                <span className="text-slate-500">Grain:</span>
                <span className="font-bold text-indigo-700 dark:text-indigo-300 font-mono">
                  {fact.rowCount.toLocaleString()} rows
                </span>
              </div>
            </div>
          </div>

          {/* Dimension Cards */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
              Connected Dimensions ({dims.length})
            </span>

            {dims.map(dim => (
              <div
                key={dim.name}
                onClick={() => {
                  onSelectTable(dim.name);
                  setInspectDrawerTable(dim.name);
                }}
                className={`rounded-xl border p-3.5 transition-all cursor-pointer ${
                  selectedTableName === dim.name
                    ? 'border-sky-500 bg-sky-50/70 ring-1 ring-sky-500 dark:border-sky-600 dark:bg-sky-950/40'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Table className="h-4 w-4 text-sky-500" />
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                      {dim.name}
                    </span>
                  </div>
                  <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[9px] font-mono font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                    1 : ∞
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
                  <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                    <Key className="h-3 w-3 text-amber-500" />
                    {dim.primaryKey}
                  </span>
                  <span className="font-sans text-[10px] text-slate-400">
                    {dim.rowCount.toLocaleString()} records · {dim.columns.length} attributes
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Diagram Canvas (Always on desktop, conditional on mobile) */}
      <div className={`mt-4 overflow-x-auto pb-4 ${mobileView === 'cards' ? 'hidden sm:block' : 'block'}`}>
        <div className="min-w-[760px] flex flex-col items-center gap-4 py-2">
          {/* Top Dimension (Dim_Date) */}
          {topDim && (
            <div className="flex flex-col items-center">
              <DimensionNode
                dim={topDim}
                isSelected={selectedTableName === topDim.name}
                isHovered={hoveredDim === topDim.name}
                onHover={setHoveredDim}
                onSelect={() => {
                  onSelectTable(topDim.name);
                  setInspectDrawerTable(topDim.name);
                }}
              />
              {/* Vertical Connector Path */}
              <div className="relative flex flex-col items-center h-8 my-0.5">
                <div className={`w-0.5 flex-1 transition-colors ${
                  hoveredDim === topDim.name || selectedTableName === topDim.name
                    ? 'bg-indigo-600 dark:bg-indigo-400'
                    : 'bg-slate-300 dark:bg-slate-700'
                }`} />
                <span className="absolute top-1.5 rounded bg-slate-100 px-1 py-0.2 text-[9px] font-mono font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  1 : ∞
                </span>
              </div>
            </div>
          )}

          {/* Central Tier: Left Dims <-> Fact Table <-> Right Dims */}
          <div className="flex items-center justify-center gap-4 w-full">
            {/* Left Dimension Group */}
            <div className="flex flex-col gap-3.5">
              {leftDims.map(dim => (
                <div key={dim.name} className="flex items-center gap-2">
                  <DimensionNode
                    dim={dim}
                    isSelected={selectedTableName === dim.name}
                    isHovered={hoveredDim === dim.name}
                    onHover={setHoveredDim}
                    onSelect={() => {
                      onSelectTable(dim.name);
                      setInspectDrawerTable(dim.name);
                    }}
                  />
                  {/* Horizontal Line to Fact */}
                  <div className="relative flex items-center w-8">
                    <div className={`h-0.5 w-full transition-colors ${
                      hoveredDim === dim.name || selectedTableName === dim.name
                        ? 'bg-indigo-600 dark:bg-indigo-400'
                        : 'bg-slate-300 dark:bg-slate-700'
                    }`} />
                    <span className="absolute -top-2.5 left-1 text-[8px] font-mono text-slate-400 font-bold">
                      1:N
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Central Fact Table Node */}
            <div
              onClick={() => {
                onSelectTable(fact.name);
                setInspectDrawerTable(fact.name);
              }}
              className={`w-80 cursor-pointer rounded-xl border-2 p-4 transition-all shadow-md ${
                selectedTableName === fact.name
                  ? 'border-indigo-600 bg-indigo-50/90 ring-2 ring-indigo-500/20 dark:border-indigo-400 dark:bg-indigo-950/60'
                  : 'border-indigo-300/80 bg-indigo-50/40 hover:border-indigo-500 dark:border-indigo-800 dark:bg-slate-850'
              }`}
            >
              <div className="flex items-center justify-between border-b border-indigo-200/80 pb-2 dark:border-indigo-800">
                <div className="flex items-center gap-1.5">
                  <Database className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-bold text-xs text-indigo-950 dark:text-indigo-100">
                    {fact.name}
                  </span>
                </div>
                <span className="rounded bg-indigo-600 px-2 py-0.5 font-mono text-[9px] font-bold text-white shadow-2xs">
                  CENTRAL FACT TABLE
                </span>
              </div>

              <div className="mt-2.5 text-[11px] font-mono space-y-1.5">
                {/* Primary Key */}
                <div className="flex items-center justify-between rounded bg-indigo-100/60 px-2 py-1 text-indigo-900 dark:bg-indigo-900/40 dark:text-indigo-200 font-bold">
                  <span className="flex items-center gap-1">
                    <Key className="h-3 w-3 text-amber-500" />
                    <span>PK: {fact.primaryKey}</span>
                  </span>
                  <span className="text-[9px] font-sans uppercase">Surrogate</span>
                </div>

                {/* Foreign Keys */}
                <div className="space-y-0.5 pt-1">
                  <span className="text-[10px] font-sans font-semibold text-slate-500 dark:text-slate-400">
                    Foreign Key Mappings ({fact.foreignKeys.length}):
                  </span>
                  {fact.foreignKeys.map(fk => (
                    <div key={fk.keyName} className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-300 pl-2">
                      <span className="text-slate-500 dark:text-slate-400">FK: {fk.keyName}</span>
                      <span className="text-indigo-600 dark:text-indigo-400">&rarr; {fk.referencesTable}</span>
                    </div>
                  ))}
                </div>

                {/* Measures */}
                <div className="border-t border-indigo-100 pt-1.5 dark:border-indigo-900/60">
                  <span className="text-[10px] font-sans font-semibold text-slate-500 dark:text-slate-400">
                    Additive Measures ({fact.measures.length}):
                  </span>
                  <div className="mt-1 flex flex-wrap gap-1 font-sans text-[10px]">
                    {fact.measures.map(m => (
                      <span key={m.name} className="rounded bg-purple-100/80 px-1.5 py-0.5 font-semibold text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                        {m.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Row Summary */}
                <div className="flex items-center justify-between border-t border-indigo-100 pt-1.5 dark:border-indigo-900/60 text-[10px] font-sans">
                  <span className="text-slate-500">Record Grain:</span>
                  <span className="font-bold text-indigo-700 dark:text-indigo-300 font-mono">
                    {fact.rowCount.toLocaleString()} fact records
                  </span>
                </div>
              </div>
            </div>

            {/* Right Dimension Group */}
            <div className="flex flex-col gap-3.5">
              {rightDims.map(dim => (
                <div key={dim.name} className="flex items-center gap-2">
                  {/* Horizontal Line from Fact */}
                  <div className="relative flex items-center w-8">
                    <div className={`h-0.5 w-full transition-colors ${
                      hoveredDim === dim.name || selectedTableName === dim.name
                        ? 'bg-indigo-600 dark:bg-indigo-400'
                        : 'bg-slate-300 dark:bg-slate-700'
                    }`} />
                    <span className="absolute -top-2.5 right-1 text-[8px] font-mono text-slate-400 font-bold">
                      N:1
                    </span>
                  </div>
                  <DimensionNode
                    dim={dim}
                    isSelected={selectedTableName === dim.name}
                    isHovered={hoveredDim === dim.name}
                    onHover={setHoveredDim}
                    onSelect={() => {
                      onSelectTable(dim.name);
                      setInspectDrawerTable(dim.name);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Instructions */}
      <div className="mt-3 flex flex-wrap items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-indigo-500" />
          <span>Click any table node to view detailed column lineage, surrogate keys, and sample data.</span>
        </div>
        <span className="font-mono text-[11px]">
          Total Warehouse Grain: {schema.sourceRowCount.toLocaleString()} transactional facts
        </span>
      </div>

      {/* Table Detail Drawer Modal (Requirement 6) */}
      {inspectDrawerTable && activeTableEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                {activeTableEntity.isFact ? (
                  <Database className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <Table className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                )}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {activeTableEntity.name}
                  </h4>
                  <span className="text-xs text-slate-500">
                    {activeTableEntity.isFact ? 'Central Fact Table (Measures & FKs)' : 'Dimension Table (Normalized Attributes)'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setInspectDrawerTable(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Table Metrics */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-850">
                  <span className="text-[10px] text-slate-500">Total Rows</span>
                  <p className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                    {activeTableEntity.rows.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-850">
                  <span className="text-[10px] text-slate-500">Total Columns</span>
                  <p className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                    {activeTableEntity.cols.length}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-850">
                  <span className="text-[10px] text-slate-500">Primary Key</span>
                  <p className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 truncate">
                    {activeTableEntity.pk}
                  </p>
                </div>
              </div>

              {/* Columns Breakdown */}
              <div>
                <h5 className="font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Column Structure & Data Types
                </h5>
                <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 font-semibold text-slate-600 dark:bg-slate-850 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                        <th className="py-2 px-3">Column Name</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                      {activeTableEntity.cols.map((col: any) => {
                        const isPk = col.name === activeTableEntity.pk || col.isSurrogateKey;
                        const isFk = (activeTableEntity.fks || []).some((fk: any) => fk.keyName === col.name);
                        const isMeasure = (activeTableEntity.measures || []).some((m: any) => m.name === col.name);

                        return (
                          <tr key={col.name} className="hover:bg-slate-50/60 dark:hover:bg-slate-850/40">
                            <td className="py-2 px-3 font-semibold text-slate-900 dark:text-slate-100">
                              <span className="flex items-center gap-1.5">
                                {isPk && <Key className="h-3 w-3 text-amber-500" />}
                                <span>{col.name}</span>
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-500">
                              {col.type}
                            </td>
                            <td className="py-2 px-3">
                              {isPk ? (
                                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                  Surrogate PK
                                </span>
                              ) : isFk ? (
                                <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                                  Foreign Key
                                </span>
                              ) : isMeasure ? (
                                <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                                  Additive Measure
                                </span>
                              ) : (
                                <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                                  Attribute
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setInspectDrawerTable(null)}
                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DimensionNode: React.FC<{
  dim: DimensionTable;
  isSelected: boolean;
  isHovered: boolean;
  onHover: (name: string | null) => void;
  onSelect: () => void;
}> = ({ dim, isSelected, isHovered, onHover, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => onHover(dim.name)}
      onMouseLeave={() => onHover(null)}
      className={`w-60 cursor-pointer rounded-xl border p-3 transition-all shadow-2xs ${
        isSelected
          ? 'border-sky-500 bg-sky-50/90 ring-2 ring-sky-400/20 dark:border-sky-400 dark:bg-sky-950/50'
          : isHovered
          ? 'border-sky-300 bg-sky-50/40 dark:border-sky-700 dark:bg-slate-850'
          : 'border-slate-200/90 bg-slate-50/70 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-850 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5 dark:border-slate-700">
        <div className="flex items-center gap-1.5">
          <Table className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
          <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
            {dim.name}
          </span>
        </div>
        <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[9px] font-bold text-sky-800 dark:bg-sky-950/80 dark:text-sky-300">
          DIMENSION
        </span>
      </div>

      <div className="mt-2 text-[10px] font-mono space-y-1">
        <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 font-bold">
          <span className="flex items-center gap-1">
            <Key className="h-2.5 w-2.5" />
            <span>PK: {dim.primaryKey}</span>
          </span>
          <span className="font-sans text-[8px] text-slate-400">Surrogate</span>
        </div>

        <div className="pt-0.5 text-slate-500 dark:text-slate-400 font-sans text-[10px] flex items-center justify-between">
          <span>Unique Entities:</span>
          <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
            {dim.rowCount.toLocaleString()}
          </span>
        </div>

        <div className="border-t border-slate-100 pt-1 dark:border-slate-800 text-[10px] text-slate-500 truncate font-sans">
          <span>Attributes: </span>
          <span className="text-slate-700 dark:text-slate-300">
            {dim.columns.filter(c => !c.isSurrogateKey && c.name !== dim.primaryKey).map(c => c.name).join(', ') || dim.sourceColumn}
          </span>
        </div>
      </div>
    </div>
  );
};
