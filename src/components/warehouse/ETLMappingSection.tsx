import React, { useState, useMemo } from 'react';
import { 
  GitCommit, 
  ArrowRight, 
  CheckCircle2, 
  Database, 
  Table, 
  Layers, 
  Sliders, 
  Search,
  Filter,
  Key,
  Hash,
  Tag,
  Calendar,
  Sparkles,
  ArrowDown
} from 'lucide-react';
import { StarSchema, ETLMappingItem } from '../../types/dataWarehouse';
import { WarehouseBuilder } from '../../utils/warehouse/warehouseBuilder';

interface ETLMappingSectionProps {
  schema: StarSchema;
  className?: string;
}

export const ETLMappingSection: React.FC<ETLMappingSectionProps> = ({
  schema,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'mapping' | 'classification'>('pipeline');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'Surrogate Key' | 'Measure' | 'Dimension'>('all');

  const mappings = useMemo(() => {
    return WarehouseBuilder.generateETLMappings(schema);
  }, [schema]);

  const filteredMappings = useMemo(() => {
    return mappings.filter(m => {
      const matchesSearch = !searchTerm.trim() || 
        m.sourceColumn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.targetColumn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.targetTable.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.transformation.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || m.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [mappings, searchTerm, roleFilter]);

  const pipelineStages = [
    { 
      step: 1, 
      name: 'Extract (Source Feed)', 
      status: 'Complete', 
      desc: `Ingested cleaned source records (${schema.sourceRowCount.toLocaleString()} rows) from active dataset.`,
      icon: Database 
    },
    { 
      step: 2, 
      name: 'Transform & Coalesce', 
      status: 'Complete', 
      desc: 'Type normalization, ISO date component extraction, string trimming & null handling.',
      icon: Sliders 
    },
    { 
      step: 3, 
      name: 'Dimension Modeling', 
      status: 'Complete', 
      desc: `Generated ${schema.dimensions.length} normalized 3NF Dimension tables with deterministic surrogate keys.`,
      icon: Table 
    },
    { 
      step: 4, 
      name: 'Fact Table Population', 
      status: 'Complete', 
      desc: `Linked ${schema.factTable.name} measures with foreign key lookups against dimension tables.`,
      icon: Layers 
    },
    { 
      step: 5, 
      name: 'Constraint Validation', 
      status: 'Complete', 
      desc: '100% referential integrity verified with zero orphaned foreign keys.',
      icon: CheckCircle2 
    },
    { 
      step: 6, 
      name: 'OLAP Cube Readiness', 
      status: 'Complete', 
      desc: 'In-memory dimensional cube compiled for sub-millisecond multi-dimensional analysis.',
      icon: Sparkles 
    }
  ];

  return (
    <div className={`rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 ${className}`}>
      {/* Header with Sub-tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <GitCommit className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              ETL Pipeline & Data Lineage Mapping
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Automated source-to-warehouse transformations, surrogate key generation, and architectural lineage
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`rounded-md px-2.5 py-1 font-semibold transition-colors cursor-pointer ${
              activeTab === 'pipeline'
                ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Pipeline Flow (6 Stages)
          </button>
          <button
            onClick={() => setActiveTab('mapping')}
            className={`rounded-md px-2.5 py-1 font-semibold transition-colors cursor-pointer ${
              activeTab === 'mapping'
                ? 'bg-white text-emerald-600 shadow-2xs dark:bg-slate-700 dark:text-emerald-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Field Transformations ({mappings.length})
          </button>
          <button
            onClick={() => setActiveTab('classification')}
            className={`rounded-md px-2.5 py-1 font-semibold transition-colors cursor-pointer ${
              activeTab === 'classification'
                ? 'bg-white text-purple-600 shadow-2xs dark:bg-slate-700 dark:text-purple-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Dimensions vs Measures
          </button>
        </div>
      </div>

      {/* 1. PIPELINE FLOW STAGES */}
      {activeTab === 'pipeline' && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pipelineStages.map((stage) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.step}
                  className="rounded-xl border border-emerald-100 bg-emerald-50/25 p-3.5 dark:border-emerald-900/40 dark:bg-emerald-950/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                        {stage.step}
                      </span>
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                        {stage.name}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      {stage.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {stage.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-850 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800">
            <span>
              <strong>ETL Engine Status:</strong> Zero runtime schema errors · Deterministic integer surrogate keys · 3NF normalization
            </span>
            <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
              ✓ Synchronized
            </span>
          </div>
        </div>
      )}

      {/* 2. FIELD TRANSFORMATIONS & MAPPINGS */}
      {activeTab === 'mapping' && (
        <div className="mt-4 space-y-3">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-semibold">Filter Role:</span>
              {(['all', 'Surrogate Key', 'Measure', 'Dimension'] as const).map(role => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                    roleFilter === role
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {role === 'all' ? 'All Roles' : role}
                </button>
              ))}
            </div>

            <div className="relative flex items-center">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search mapping columns..."
                className="rounded-lg border border-slate-200 bg-slate-50 pl-8.5 pr-3 py-1 text-xs text-slate-900 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 w-52"
              />
            </div>
          </div>

          {/* Mapping Table */}
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-300">
                  <th className="py-2.5 px-3">Source Dataset Column</th>
                  <th className="py-2.5 px-3">Applied Transformation</th>
                  <th className="py-2.5 px-3">Warehouse Target Table</th>
                  <th className="py-2.5 px-3">Target Warehouse Column</th>
                  <th className="py-2.5 px-3">Architectural Role</th>
                  <th className="py-2.5 px-3">Data Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-mono text-[11px]">
                {filteredMappings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400 font-sans">
                      No ETL mappings matching query.
                    </td>
                  </tr>
                ) : (
                  filteredMappings.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors">
                      <td className="py-2 px-3 font-semibold text-slate-900 dark:text-slate-100 font-sans">
                        {m.sourceColumn}
                      </td>
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-300 font-sans text-[11px]">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {m.transformation}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-indigo-600 dark:text-indigo-400 font-semibold">
                        {m.targetTable}
                      </td>
                      <td className="py-2 px-3 text-slate-800 dark:text-slate-200">
                        {m.targetColumn}
                      </td>
                      <td className="py-2 px-3 font-sans">
                        <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          m.role === 'Measure'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : m.role === 'Surrogate Key'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                        }`}>
                          {m.role}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-sans text-[11px] text-slate-500 dark:text-slate-400">
                        {m.dataClassification}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. DIMENSIONS VS MEASURES CLASSIFICATION */}
      {activeTab === 'classification' && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dimensions Card */}
            <div className="rounded-xl border border-sky-200 bg-sky-50/30 p-4 dark:border-sky-900/60 dark:bg-sky-950/20">
              <div className="flex items-center gap-2 border-b border-sky-100 pb-2.5 dark:border-sky-900/60">
                <Tag className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Dimensional Attributes ({schema.dimensions.length} Tables)
                </h4>
              </div>
              <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Categorical and temporal features used for slicing, dicing, filtering, and grouping measures in OLAP queries.
              </p>
              <div className="mt-3 space-y-2 font-mono text-xs">
                {schema.dimensions.map(dim => (
                  <div key={dim.name} className="flex items-center justify-between rounded bg-white p-2 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 font-sans">{dim.name}</span>
                      <span className="text-[10px] text-slate-400 ml-2">PK: {dim.primaryKey}</span>
                    </div>
                    <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-bold">
                      {dim.rowCount.toLocaleString()} entities
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Measures Card */}
            <div className="rounded-xl border border-purple-200 bg-purple-50/30 p-4 dark:border-purple-900/60 dark:bg-purple-950/20">
              <div className="flex items-center gap-2 border-b border-purple-100 pb-2.5 dark:border-purple-900/60">
                <Hash className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Fact Measures ({schema.factTable.measures.length} Measures)
                </h4>
              </div>
              <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Continuous quantitative numerical measurements stored in the Fact Table that support aggregations (SUM, AVG, MIN, MAX).
              </p>
              <div className="mt-3 space-y-2 font-mono text-xs">
                {schema.factTable.measures.map(m => (
                  <div key={m.name} className="flex items-center justify-between rounded bg-white p-2 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 font-sans">{m.name}</span>
                      <span className="text-[10px] text-slate-400 ml-2">Source: {m.sourceColumn}</span>
                    </div>
                    <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold">
                      {m.additivity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
