import React, { useState, useMemo } from 'react';
import { 
  Sliders, 
  Play, 
  Download, 
  Table, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  PieChart, 
  Sparkles,
  BarChart2,
  TrendingUp,
  Grid3X3,
  Maximize2,
  RotateCcw,
  ChevronRight,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { StarSchema, OLAPOperation, OLAPQuery, OLAPResult } from '../../types/dataWarehouse';
import { OLAPEngine } from '../../utils/warehouse/olapEngine';
import { WarehouseBuilder } from '../../utils/warehouse/warehouseBuilder';
import { BIEngine } from '../../utils/analytics/biEngine';

interface OLAPAnalysisSectionProps {
  schema: StarSchema;
  className?: string;
}

const CHART_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e'];

export const OLAPAnalysisSection: React.FC<OLAPAnalysisSectionProps> = ({
  schema,
  className = ''
}) => {
  // Available measures in fact table
  const measureNames = schema.factTable.measures.map(m => m.name);
  const defaultMeasure = measureNames.find(m => m.toLowerCase().includes('sales')) || measureNames[0] || 'Sales';

  // State
  const [operation, setOperation] = useState<OLAPOperation>('pivot');
  const [metric, setMetric] = useState<string>(defaultMeasure);
  const [aggregation, setAggregation] = useState<'SUM' | 'COUNT' | 'AVG' | 'MIN' | 'MAX'>('SUM');
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area' | 'pie'>('bar');

  // Rollup & Drilldown controls
  const [rollupDim, setRollupDim] = useState<'Category' | 'Time'>('Time');
  const [timeLevel, setTimeLevel] = useState<'year' | 'quarter' | 'month'>('quarter');

  // Slice controls
  const [sliceRegion, setSliceRegion] = useState<string>('North America');

  // Dice controls
  const [diceRegion, setDiceRegion] = useState<string>('North America');
  const [diceCategory, setDiceCategory] = useState<string>('Technology');

  // Pivot controls
  const [pivotRowDim, setPivotRowDim] = useState<string>('Region');
  const [pivotColDim, setPivotColDim] = useState<string>('Category');

  // Available regions & categories
  const regDim = schema.dimensions.find(d => d.name === 'Dim_Region');
  const catDim = schema.dimensions.find(d => d.name === 'Dim_Category');

  const regionNames = regDim ? regDim.rows.map(r => r.Region_Name) : ['North America', 'EMEA', 'APAC', 'LATAM'];
  const categoryNames = catDim ? catDim.rows.map(r => r.Category_Name) : ['Technology', 'Furniture', 'Office Supplies'];

  // Construct query
  const query = useMemo<OLAPQuery>(() => {
    if (operation === 'rollup') {
      return {
        operation: 'rollup',
        dimension: rollupDim,
        timeLevel: rollupDim === 'Time' ? timeLevel : undefined,
        metric,
        aggregation
      };
    }
    if (operation === 'drilldown') {
      return {
        operation: 'drilldown',
        metric,
        aggregation
      };
    }
    if (operation === 'slice') {
      return {
        operation: 'slice',
        sliceCondition: { dimension: 'Region', value: sliceRegion },
        metric,
        aggregation
      };
    }
    if (operation === 'dice') {
      return {
        operation: 'dice',
        diceConditions: [
          { dimension: 'Region', value: diceRegion },
          { dimension: 'Category', value: diceCategory }
        ],
        metric,
        aggregation
      };
    }
    // Pivot
    return {
      operation: 'pivot',
      dimension: pivotRowDim,
      secondaryDimension: pivotColDim,
      metric,
      aggregation
    };
  }, [
    operation,
    rollupDim,
    timeLevel,
    sliceRegion,
    diceRegion,
    diceCategory,
    pivotRowDim,
    pivotColDim,
    metric,
    aggregation
  ]);

  // Execute OLAP Query
  const result: OLAPResult = useMemo(() => {
    return OLAPEngine.executeQuery(schema, query);
  }, [schema, query]);

  // Prepare chart dataset
  const chartData: Array<Record<string, any>> = useMemo(() => {
    if (operation === 'pivot' && result.pivotData) {
      return result.pivotData.matrix.map(item => ({
        name: item.rowValue,
        value: item.rowTotal,
        ...item.cols,
        Total: item.rowTotal
      }));
    }

    // Standard tabular format
    const primaryKey = result.headers[0];
    const metricCol = result.headers.find(h => h.includes(metric) || h === 'TotalSales' || h === 'Value') || result.headers[result.headers.length - 2];

    return result.rows.map(r => ({
      name: String(r[primaryKey] || 'Unknown'),
      value: Number(r[metricCol]) || (typeof r.RecordCount === 'number' ? r.RecordCount : 0),
      raw: r
    }));
  }, [result, operation, metric]);

  const handleExport = () => {
    WarehouseBuilder.exportToCSV(`OLAP_${operation}_result`, result.rows);
  };

  // Operation cards definitions
  const operationCards = [
    {
      id: 'pivot' as OLAPOperation,
      label: 'PIVOT',
      title: '2D Matrix Pivot',
      desc: 'Rotate dimensional axes into a 2D cross-tabulation matrix.',
      icon: Grid3X3
    },
    {
      id: 'rollup' as OLAPOperation,
      label: 'ROLL-UP',
      title: 'Hierarchical Roll-up',
      desc: 'Aggregate granular facts upward along time or product hierarchy.',
      icon: ArrowUpRight
    },
    {
      id: 'drilldown' as OLAPOperation,
      label: 'DRILL-DOWN',
      title: 'Detailed Drill-down',
      desc: 'Navigate from summary groups down to granular SKU facts.',
      icon: ArrowDownRight
    },
    {
      id: 'slice' as OLAPOperation,
      label: 'SLICE',
      title: 'Single-Dimension Slice',
      desc: 'Fix 1 dimension plane (e.g. Region) to produce a 2D sub-view.',
      icon: Filter
    },
    {
      id: 'dice' as OLAPOperation,
      label: 'DICE',
      title: 'Multi-Dimension Dice',
      desc: 'Filter multi-dimensional sub-cube across concurrent criteria.',
      icon: Layers
    }
  ];

  return (
    <div className={`rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              OLAP Analytical Operations Engine
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Multi-dimensional data cube transformations: Roll-Up, Drill-Down, Slice, Dice, and 2D Cross-Tabulation
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800 text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-semibold transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <Table className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-semibold transition-colors cursor-pointer ${
                viewMode === 'chart'
                  ? 'bg-white text-purple-600 shadow-2xs dark:bg-slate-700 dark:text-purple-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <BarChart2 className="h-3.5 w-3.5" />
              <span>Chart</span>
            </button>
          </div>

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 1. INTERACTIVE OPERATION CARDS (Requirement 11) */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {operationCards.map(op => {
          const Icon = op.icon;
          const isSelected = operation === op.id;

          return (
            <button
              key={op.id}
              onClick={() => setOperation(op.id)}
              className={`flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer last:col-span-2 sm:last:col-span-1 min-h-[96px] ${
                isSelected
                  ? 'border-purple-600 bg-purple-50/70 shadow-xs ring-2 ring-purple-500/20 dark:border-purple-500 dark:bg-purple-950/40'
                  : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-850/60 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                  isSelected ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                }`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className={`font-mono text-[9px] font-bold ${
                  isSelected ? 'text-purple-700 dark:text-purple-300' : 'text-slate-400'
                }`}>
                  {op.label}
                </span>
              </div>
              <span className="mt-2 text-xs font-bold text-slate-900 dark:text-slate-100">
                {op.title}
              </span>
              <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 leading-tight line-clamp-2">
                {op.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* 2. OLAP ANALYTICAL BREADCRUMB (Requirement 12) */}
      <div className="mt-3.5 flex items-center gap-1.5 rounded-lg border border-purple-100 bg-purple-50/40 p-2.5 text-xs dark:border-purple-900/40 dark:bg-purple-950/20 overflow-x-auto whitespace-nowrap">
        <span className="font-semibold text-slate-500 dark:text-slate-400 shrink-0">Analytical Path:</span>
        <span className="rounded bg-white px-2 py-0.5 font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shrink-0">
          All Warehouse Facts ({schema.factTable.rowCount.toLocaleString()})
        </span>
        <ChevronRight className="h-3.5 w-3.5 text-purple-400 shrink-0" />
        <span className="rounded bg-purple-100 px-2 py-0.5 font-bold text-purple-800 dark:bg-purple-900/60 dark:text-purple-200 shrink-0">
          Operation: {operation.toUpperCase()}
        </span>
        <ChevronRight className="h-3.5 w-3.5 text-purple-400 shrink-0" />
        <span className="rounded bg-indigo-50 px-2 py-0.5 font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shrink-0">
          {aggregation}({metric})
        </span>
      </div>

      {/* 3. DYNAMIC OLAP PARAMETERS CONTROLS */}
      <div className="mt-3.5 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-850/50">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Target Measure */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Fact Measure
            </label>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:outline-hidden"
            >
              {measureNames.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Aggregation Function */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Aggregation Function
            </label>
            <select
              value={aggregation}
              onChange={(e) => setAggregation(e.target.value as any)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 font-mono font-bold text-purple-600 dark:border-slate-700 dark:bg-slate-800 dark:text-purple-400 focus:outline-hidden"
            >
              <option value="SUM">SUM (Total)</option>
              <option value="AVG">AVG (Average)</option>
              <option value="COUNT">COUNT (Frequency)</option>
              <option value="MIN">MIN (Minimum)</option>
              <option value="MAX">MAX (Maximum)</option>
            </select>
          </div>

          {/* Dynamic Operation Parameters */}
          <div className="lg:col-span-2">
            {operation === 'pivot' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Row Dimension</label>
                  <select
                    value={pivotRowDim}
                    onChange={(e) => setPivotRowDim(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="Region">Region Dimension</option>
                    <option value="Category">Category Dimension</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Column Dimension</label>
                  <select
                    value={pivotColDim}
                    onChange={(e) => setPivotColDim(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="Category">Category Dimension</option>
                    <option value="Region">Region Dimension</option>
                  </select>
                </div>
              </div>
            )}

            {operation === 'rollup' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Roll-Up Target</label>
                  <select
                    value={rollupDim}
                    onChange={(e) => setRollupDim(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="Time">Time Hierarchy (Date)</option>
                    <option value="Category">Product &rarr; Category</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Temporal Grain</label>
                  {rollupDim === 'Time' ? (
                    <select
                      value={timeLevel}
                      onChange={(e) => setTimeLevel(e.target.value as any)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                      <option value="year">Yearly Roll-Up</option>
                      <option value="quarter">Quarterly Roll-Up</option>
                      <option value="month">Monthly Roll-Up</option>
                    </select>
                  ) : (
                    <div className="mt-1 rounded-lg border border-slate-200 bg-slate-100 p-2 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800">
                      Product SKU &rarr; Category
                    </div>
                  )}
                </div>
              </div>
            )}

            {operation === 'slice' && (
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Fixed Dimension Slice (Region)
                </label>
                <select
                  value={sliceRegion}
                  onChange={(e) => setSliceRegion(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  {regionNames.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            )}

            {operation === 'dice' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Slice Region</label>
                  <select
                    value={diceRegion}
                    onChange={(e) => setDiceRegion(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    {regionNames.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Slice Category</label>
                  <select
                    value={diceCategory}
                    onChange={(e) => setDiceCategory(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    {categoryNames.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {operation === 'drilldown' && (
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Drill-Down Scope
                </label>
                <div className="mt-1 rounded-lg border border-purple-200 bg-purple-50/50 p-2 text-xs text-purple-900 dark:border-purple-900/60 dark:bg-purple-950/30 dark:text-purple-200 font-mono">
                  Category &rarr; Granular Product SKU Level
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. ACTIVE OLAP QUERY SUMMARY BANNER */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-900 p-3 text-xs text-white dark:bg-slate-800 shadow-xs">
        <div>
          <span className="font-bold text-indigo-300">{result.title}</span>
          <span className="text-slate-400 ml-2 font-mono">({result.rows.length} rows aggregated)</span>
        </div>
        {result.summaryMetrics && (
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Aggregated Metric Total:</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {result.summaryMetrics.formattedTotal}
            </span>
          </div>
        )}
      </div>

      {/* 5. RESULTS WORKSPACE (TABLE OR CHART VIEW) */}
      {viewMode === 'table' ? (
        <div className="mt-3.5 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-300">
                <th className="py-2.5 px-3 w-10 text-center text-slate-400">#</th>
                {result.headers.map(h => (
                  <th key={h} className="py-2.5 px-3 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-mono text-[11px]">
              {result.rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors">
                  <td className="py-2 px-3 text-center text-slate-400 text-[10px]">
                    {idx + 1}
                  </td>
                  {result.headers.map(h => {
                    const val = row[h];
                    const isTotal = h === 'Row_Total' || h.startsWith('SUM_') || h === 'FormattedValue' || h.startsWith('Total');
                    const isNumber = typeof val === 'number';

                    return (
                      <td 
                        key={h} 
                        className={`py-2 px-3 whitespace-nowrap ${
                          isTotal 
                            ? 'font-bold text-purple-600 dark:text-purple-400' 
                            : isNumber
                            ? 'text-slate-800 dark:text-slate-200'
                            : 'font-sans text-slate-700 dark:text-slate-300 font-semibold'
                        }`}
                      >
                        {val !== undefined && val !== null ? String(val) : '-'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* CHART VIEW (Requirement 13 & 15) */
        <div className="mt-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Interactive OLAP Visualization
            </span>
            <div className="flex items-center gap-1">
              {(['bar', 'line', 'area', 'pie'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setChartType(t)}
                  className={`rounded px-2 py-0.5 text-xs font-semibold uppercase transition-colors cursor-pointer ${
                    chartType === t
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                  <Tooltip 
                    formatter={(value: any) => [
                      typeof value === 'number' && metric.toLowerCase().includes('sales') || metric.toLowerCase().includes('profit')
                        ? BIEngine.formatCurrency(value)
                        : Number(value).toLocaleString(),
                      metric
                    ]}
                  />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : chartType === 'line' ? (
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                  <Tooltip formatter={(value: any) => [BIEngine.formatNumber(Number(value)), metric]} />
                  <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              ) : chartType === 'area' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                  <Tooltip formatter={(value: any) => [BIEngine.formatNumber(Number(value)), metric]} />
                  <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
                </AreaChart>
              ) : (
                <RechartsPieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [BIEngine.formatNumber(Number(value)), metric]} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </RechartsPieChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
