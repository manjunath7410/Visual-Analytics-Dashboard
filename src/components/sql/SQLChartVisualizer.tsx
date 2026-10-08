import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { BarChart2, TrendingUp, PieChart as PieIcon, Sliders } from 'lucide-react';
import { SQLQueryResult } from '../../types/sqlAnalytics';
import { BIEngine } from '../../utils/analytics/biEngine';

interface SQLChartVisualizerProps {
  result: SQLQueryResult;
  className?: string;
}

const COLORS = ['#6366f1', '#10b981', '#0ea5e9', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e'];

export const SQLChartVisualizer: React.FC<SQLChartVisualizerProps> = ({
  result,
  className = ''
}) => {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area' | 'pie' | 'donut'>('bar');

  // Candidate column detection
  const textCols = useMemo(() => {
    if (result.rows.length === 0) return [];
    return result.columns.filter(c => typeof result.rows[0]?.[c] === 'string' || c.toLowerCase().includes('id') || c.toLowerCase().includes('name') || c.toLowerCase().includes('date') || c.toLowerCase().includes('region') || c.toLowerCase().includes('category') || c.toLowerCase().includes('product') || c.toLowerCase().includes('segment'));
  }, [result]);

  const numCols = useMemo(() => {
    if (result.rows.length === 0) return [];
    return result.columns.filter(c => typeof result.rows[0]?.[c] === 'number' || (!isNaN(Number(result.rows[0]?.[c])) && !textCols.includes(c)));
  }, [result, textCols]);

  const [dimensionCol, setDimensionCol] = useState<string>(textCols[0] || result.columns[0] || '');
  const [metricCol, setMetricCol] = useState<string>(numCols[0] || result.columns[1] || result.columns[0] || '');

  // Format chart data safely
  const chartData = useMemo(() => {
    return result.rows.slice(0, 30).map(r => ({
      ...r,
      [dimensionCol]: r[dimensionCol] !== undefined ? String(r[dimensionCol]) : 'Unknown',
      [metricCol]: Number(r[metricCol]) || 0
    }));
  }, [result.rows, dimensionCol, metricCol]);

  if (!result.success || result.rows.length === 0) {
    return null;
  }

  return (
    <div className={`rounded-xl border border-indigo-200/80 bg-white p-4 shadow-2xs dark:border-indigo-900/60 dark:bg-slate-900/90 text-xs ${className}`}>
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
            SQL Query Result Visualization
          </h3>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chart Type */}
          <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800">
            {(['bar', 'line', 'area', 'pie', 'donut'] as const).map(t => (
              <button
                key={t}
                onClick={() => setChartType(t)}
                className={`rounded px-2 py-0.5 font-semibold capitalize ${
                  chartType === t ? 'bg-white text-indigo-600 shadow-2xs dark:bg-slate-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Dimension Selector */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-500 font-medium">Dimension:</span>
            <select
              value={dimensionCol}
              onChange={(e) => setDimensionCol(e.target.value)}
              className="rounded border border-slate-200 bg-white p-1 text-xs dark:border-slate-700 dark:bg-slate-800 font-semibold"
            >
              {result.columns.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Metric Selector */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-500 font-medium">Metric:</span>
            <select
              value={metricCol}
              onChange={(e) => setMetricCol(e.target.value)}
              className="rounded border border-slate-200 bg-white p-1 text-xs dark:border-slate-700 dark:bg-slate-800 font-semibold text-indigo-600 dark:text-indigo-400"
            >
              {result.columns.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Render Chart */}
      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey={dimensionCol} tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis tickFormatter={(v) => typeof v === 'number' && v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : String(v)} tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <Tooltip formatter={(v: any) => [typeof v === 'number' ? Number(v).toLocaleString() : v, metricCol]} />
              <Bar dataKey={metricCol} fill="#6366f1" radius={[4, 4, 0, 0]} name={metricCol} />
            </BarChart>
          ) : chartType === 'line' ? (
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey={dimensionCol} tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <Tooltip formatter={(v: any) => [typeof v === 'number' ? Number(v).toLocaleString() : v, metricCol]} />
              <Line type="monotone" dataKey={metricCol} stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3 }} name={metricCol} />
            </LineChart>
          ) : chartType === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <defs>
                <linearGradient id="sqlAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey={dimensionCol} tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <Tooltip formatter={(v: any) => [typeof v === 'number' ? Number(v).toLocaleString() : v, metricCol]} />
              <Area type="monotone" dataKey={metricCol} stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#sqlAreaGrad)" name={metricCol} />
            </AreaChart>
          ) : (
            <PieChart>
              <Tooltip formatter={(v: any) => [typeof v === 'number' ? Number(v).toLocaleString() : v, metricCol]} />
              <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 10 }} />
              <Pie
                data={chartData}
                dataKey={metricCol}
                nameKey={dimensionCol}
                cx="50%"
                cy="50%"
                innerRadius={chartType === 'donut' ? 45 : 0}
                outerRadius={75}
                paddingAngle={2}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
