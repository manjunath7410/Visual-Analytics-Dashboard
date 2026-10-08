import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
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
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Layers, 
  Sliders, 
  Filter, 
  ArrowUpDown, 
  RotateCcw,
  Sparkles,
  Database,
  Calendar,
  Binary,
  HelpCircle,
  FileSpreadsheet,
  ArrowRight,
  Download,
  Table2,
  PieChart as PieIcon,
  Activity,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Compass
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { PageContainer } from '../components/common/PageContainer';
import { KPICard } from '../components/common/KPICard';
import { ChartContainer } from '../components/common/ChartContainer';
import { EmptyState } from '../components/common/EmptyState';
import { GlobalFilterBar } from '../components/common/GlobalFilterBar';
import { AggregationType, TimeGranularity } from '../types/analytics';
import { AnalyticsEngine } from '../utils/analytics/analyticsEngine';
import { ChartBuilder } from '../components/charts/ChartBuilder';

export const AnalyticsPage: React.FC = () => {
  const { 
    dataset, 
    filteredRows, 
    kpis, 
    filters, 
    clearFilters, 
    activeFilterCount,
    searchQuery,
    loadSampleDataset
  } = useData();

  const navigate = useNavigate();

  // Active view mode: Interactive Chart Builder vs Multi-Dimensional Analytical Suite
  const [viewMode, setViewMode] = useState<'suite' | 'builder'>('suite');

  // Column classifications based on actual loaded dataset using AnalyticsEngine
  const classifications = useMemo(() => {
    if (!dataset) return [];
    return AnalyticsEngine.classifyColumns(dataset.columns, filteredRows);
  }, [dataset, filteredRows]);

  const numericColumns = useMemo(() => {
    return classifications.filter(c => c.isNumeric).map(c => c.name);
  }, [classifications]);

  const dimensionColumns = useMemo(() => {
    return classifications.filter(c => c.isDimension).map(c => c.name);
  }, [classifications]);

  const dateColumns = useMemo(() => {
    return classifications.filter(c => c.isDate).map(c => c.name);
  }, [classifications]);

  // Selected Interactive Controls
  const primarySales = useMemo(() => AnalyticsEngine.findPrimarySalesColumn(classifications), [classifications]);
  const primaryProfit = useMemo(() => AnalyticsEngine.findPrimaryProfitColumn(classifications), [classifications]);
  const primaryDate = useMemo(() => AnalyticsEngine.findPrimaryDateColumn(classifications), [classifications]);
  const primaryDims = useMemo(() => AnalyticsEngine.findPrimaryDimensions(classifications), [classifications]);

  const [selectedMetric, setSelectedMetric] = useState<string>('');
  const [selectedDimension, setSelectedDimension] = useState<string>('');
  const [selectedAggregation, setSelectedAggregation] = useState<AggregationType>('SUM');
  const [selectedChartType, setSelectedChartType] = useState<'bar' | 'horizontal_bar' | 'line' | 'area' | 'pie'>('bar');
  const [resultViewType, setResultViewType] = useState<'chart' | 'table'>('chart');
  const [selectedGranularity, setSelectedGranularity] = useState<TimeGranularity>('monthly');
  const [selectedDateCol, setSelectedDateCol] = useState<string>('');
  const [topNCount, setTopNCount] = useState<number>(10);
  const [topNSort, setTopNSort] = useState<'ASC' | 'DESC'>('DESC');

  // Dedicated Pie Chart Breakdown Controls
  const [pieDimension, setPieDimension] = useState<string>('');
  const [pieMetric, setPieMetric] = useState<string>('');
  const [pieChartStyle, setPieChartStyle] = useState<'donut' | 'pie'>('donut');
  const [pieHoverIndex, setPieHoverIndex] = useState<number | null>(null);

  // Initialize selectors once dataset is available
  React.useEffect(() => {
    if (numericColumns.length > 0 && (!selectedMetric || !numericColumns.includes(selectedMetric))) {
      setSelectedMetric(primarySales || numericColumns[0]);
    }
    if (dimensionColumns.length > 0 && (!selectedDimension || !dimensionColumns.includes(selectedDimension))) {
      setSelectedDimension(primaryDims.categoryColumn || primaryDims.regionColumn || dimensionColumns[0]);
    }
    if (dateColumns.length > 0 && (!selectedDateCol || !dateColumns.includes(selectedDateCol))) {
      setSelectedDateCol(primaryDate || dateColumns[0]);
    }
    if (dimensionColumns.length > 0 && (!pieDimension || !dimensionColumns.includes(pieDimension))) {
      setPieDimension(primaryDims.categoryColumn || primaryDims.regionColumn || dimensionColumns[0]);
    }
    if (numericColumns.length > 0 && (!pieMetric || !numericColumns.includes(pieMetric))) {
      setPieMetric(primarySales || numericColumns[0]);
    }
  }, [numericColumns, dimensionColumns, dateColumns, primarySales, primaryDate, primaryDims, pieDimension, pieMetric]);

  // 1. Group By Dimension Analysis using AnalyticsEngine
  const groupedData = useMemo(() => {
    if (!selectedDimension || filteredRows.length === 0) return [];
    return AnalyticsEngine.groupBy(filteredRows, selectedDimension, selectedMetric || undefined, selectedAggregation);
  }, [filteredRows, selectedDimension, selectedMetric, selectedAggregation]);

  // 2. Time-Series Analysis using AnalyticsEngine
  const timeSeriesData = useMemo(() => {
    if (!selectedDateCol || filteredRows.length === 0) return [];
    return AnalyticsEngine.aggregateTimeSeries(filteredRows, selectedDateCol, selectedMetric || undefined, selectedGranularity, selectedAggregation);
  }, [filteredRows, selectedDateCol, selectedMetric, selectedGranularity, selectedAggregation]);

  // 3. Top-N Rankings Analysis using AnalyticsEngine
  const rankingData = useMemo(() => {
    if (!selectedDimension || filteredRows.length === 0) return [];
    return AnalyticsEngine.topN(filteredRows, selectedDimension, selectedMetric || undefined, topNCount, topNSort, selectedAggregation);
  }, [filteredRows, selectedDimension, selectedMetric, topNCount, topNSort, selectedAggregation]);

  // 4. Descriptive Statistics Table using AnalyticsEngine
  const descriptiveStats = useMemo(() => {
    if (numericColumns.length === 0 || filteredRows.length === 0) return [];
    return numericColumns.map(col => AnalyticsEngine.calculateDescriptiveStatistics(filteredRows, col));
  }, [filteredRows, numericColumns]);

  // 5. Pearson Correlation Matrix using AnalyticsEngine
  const correlationMatrix = useMemo(() => {
    if (numericColumns.length < 2 || filteredRows.length === 0) return [];
    return AnalyticsEngine.calculateCorrelationMatrix(filteredRows, numericColumns);
  }, [filteredRows, numericColumns]);

  // 6. Deterministic Insights (Requirement 36)
  const deterministicInsights = useMemo(() => {
    if (filteredRows.length === 0 || !dataset) return null;

    let topRegion = { name: '-', value: 0 };
    let topCategory = { name: '-', value: 0 };
    let topProfitProduct = { name: '-', value: 0 };

    if (primaryDims.regionColumn && primarySales) {
      const regGroup = AnalyticsEngine.groupBy(filteredRows, primaryDims.regionColumn, primarySales, 'SUM');
      if (regGroup.length > 0) {
        topRegion = { name: String(regGroup[0].dimensionValue), value: regGroup[0].value };
      }
    }

    if (primaryDims.categoryColumn && primarySales) {
      const catGroup = AnalyticsEngine.groupBy(filteredRows, primaryDims.categoryColumn, primarySales, 'SUM');
      if (catGroup.length > 0) {
        topCategory = { name: String(catGroup[0].dimensionValue), value: catGroup[0].value };
      }
    }

    if (primaryDims.productColumn && primaryProfit) {
      const prodGroup = AnalyticsEngine.groupBy(filteredRows, primaryDims.productColumn, primaryProfit, 'SUM');
      if (prodGroup.length > 0) {
        topProfitProduct = { name: String(prodGroup[0].dimensionValue), value: prodGroup[0].value };
      }
    }

    return {
      topRegion,
      topCategory,
      topProfitProduct
    };
  }, [filteredRows, dataset, primaryDims, primarySales, primaryProfit]);

  // Dedicated Pie Chart Breakdown Data
  const pieChartData = useMemo(() => {
    if (!pieDimension || filteredRows.length === 0) return [];
    const rawGrouped = AnalyticsEngine.groupBy(filteredRows, pieDimension, pieMetric || undefined, 'SUM');
    if (rawGrouped.length === 0) return [];

    const sorted = [...rawGrouped].sort((a, b) => b.value - a.value);

    if (sorted.length <= 6) {
      return sorted.map(r => ({
        name: String(r.dimensionValue || 'Unknown'),
        value: r.value,
        formattedValue: r.formattedValue,
        recordCount: r.recordCount,
        percentage: r.percentageShare || 0
      }));
    }

    const topSlices = sorted.slice(0, 5);
    const otherSlices = sorted.slice(5);
    const otherValue = otherSlices.reduce((acc, curr) => acc + curr.value, 0);
    const otherCount = otherSlices.reduce((acc, curr) => acc + curr.recordCount, 0);
    const totalVal = sorted.reduce((acc, curr) => acc + curr.value, 0);
    const otherPct = totalVal > 0 ? Number(((otherValue / totalVal) * 100).toFixed(1)) : 0;

    return [
      ...topSlices.map(r => ({
        name: String(r.dimensionValue || 'Unknown'),
        value: r.value,
        formattedValue: r.formattedValue,
        recordCount: r.recordCount,
        percentage: r.percentageShare || 0
      })),
      {
        name: 'Other',
        value: otherValue,
        formattedValue: otherValue >= 1000000 ? `$${(otherValue / 1000000).toFixed(1)}M` : otherValue >= 1000 ? `$${(otherValue / 1000).toFixed(1)}K` : otherValue.toLocaleString(),
        recordCount: otherCount,
        percentage: otherPct
      }
    ];
  }, [filteredRows, pieDimension, pieMetric]);

  const pieTotal = useMemo(() => {
    return pieChartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [pieChartData]);

  const leadingPieSlice = useMemo(() => {
    if (pieChartData.length === 0) return null;
    return pieChartData[0];
  }, [pieChartData]);

  // Date range string for context
  const dateRangeStr = useMemo(() => {
    if (dateColumns.length > 0) {
      const dCol = dataset?.columns.find(c => c.name === (primaryDate || dateColumns[0]));
      if (dCol && dCol.minDate && dCol.maxDate) {
        return `${dCol.minDate} → ${dCol.maxDate}`;
      }
    }
    return 'All Time';
  }, [dateColumns, dataset, primaryDate]);

  // Export grouped result as CSV
  const handleExportGroupedCSV = () => {
    if (!groupedData || groupedData.length === 0) return;
    const header = `${selectedDimension},${selectedAggregation}_${selectedMetric},Record_Count,Percentage_Share\n`;
    const rows = groupedData.map(r => `"${r.dimensionValue}",${r.value},${r.recordCount},${r.percentageShare || ''}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics_${selectedDimension}_${selectedMetric}_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Empty State if no dataset exists
  if (!dataset || dataset.rows.length === 0) {
    return (
      <PageContainer
        title="Analytics"
        subtitle="Analyze performance, trends, relationships, and key business metrics."
        breadcrumbs={[
          { label: 'Analytics', onClick: () => navigate('/analytics') },
          { label: 'Analytics Workspace' }
        ]}
      >
        <EmptyState
          title="No Active Dataset Available"
          description="Upload a CSV file or load the benchmark enterprise sales dataset to begin visual analytics."
          actionText="Upload Dataset"
          onAction={() => navigate('/upload')}
          secondaryActionText="Load Sample Dataset"
          onSecondaryAction={loadSampleDataset}
        />
      </PageContainer>
    );
  }

  // Empty State if active filters return 0 rows
  if (filteredRows.length === 0) {
    return (
      <PageContainer
        title="Analytics"
        subtitle="Analyze performance, trends, relationships, and key business metrics."
        breadcrumbs={[
          { label: 'Analytics', onClick: () => navigate('/analytics') },
          { label: 'Analytics Workspace' }
        ]}
      >
        <EmptyState
          title="Zero Records Match Active Filters"
          description="Your active filters returned 0 rows. Reset your search query or attribute filters to restore analytics."
          actionText="Clear All Filters"
          onAction={clearFilters}
        />
      </PageContainer>
    );
  }

  const COLORS = ['#6366f1', '#38bdf8', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f43f5e'];
  const PIE_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#94a3b8'];

  return (
    <PageContainer
      title="Analytics"
      subtitle="Analyze performance, trends, relationships, and key business metrics."
      fullWidth={true}
      breadcrumbs={[
        { label: 'Analytics', onClick: () => navigate('/analytics') },
        { label: 'Analytics Workspace' }
      ]}
      metadata={
        <>
          <span>Dataset: <strong>{dataset.name}</strong></span>
          <span>·</span>
          <span>Scope: <strong>{filteredRows.length.toLocaleString()} of {dataset.statistics.rowCount.toLocaleString()} rows</strong></span>
          <span>·</span>
          <span>Temporal Range: {dateRangeStr}</span>
        </>
      }
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-2xs transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Filters ({activeFilterCount})</span>
            </button>
          )}

          <button
            onClick={handleExportGroupedCSV}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Query CSV</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* GLOBAL BI FILTER BAR */}
        <GlobalFilterBar />

        {/* 1. ANALYTICS KPI STRIP (Requirement 24) */}
        <section aria-label="Executive KPIs">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
            {kpis.map((kpi) => (
              <KPICard key={kpi.id} kpi={kpi} />
            ))}
          </div>
        </section>

        {/* 2. DETERMINISTIC INSIGHT CARDS (Requirement 36) */}
        {deterministicInsights && (
          <section aria-label="Analytics Insights" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Leading Revenue Region
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                  {deterministicInsights.topRegion.name}
                </span>
                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                  ${(deterministicInsights.topRegion.value / 1000).toFixed(1)}K
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Leading Volume Category
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                  {deterministicInsights.topCategory.name}
                </span>
                <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400 tabular-nums">
                  ${(deterministicInsights.topCategory.value / 1000).toFixed(1)}K
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Top Profit Driver
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                  {deterministicInsights.topProfitProduct.name}
                </span>
                <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  ${(deterministicInsights.topProfitProduct.value / 1000).toFixed(1)}K
                </span>
              </div>
            </div>
          </section>
        )}

        {/* VIEW MODE TABS */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            onClick={() => setViewMode('suite')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'suite'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Multi-Dimensional Analytics Suite</span>
          </button>
          <button
            onClick={() => setViewMode('builder')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'builder'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Interactive Chart Builder</span>
          </button>
        </div>

        {viewMode === 'builder' ? (
          <ChartBuilder />
        ) : (
          <>
            {/* 3. ANALYSIS QUERY BUILDER (Requirements 25-30) */}
            <section aria-label="Query Controls">
              <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 dark:border-slate-800 gap-2">
                  <div className="flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-indigo-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                      Analytical Query Parameters
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Chart / Table View Segmented Control */}
                    <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50/80 p-0.5 text-xs dark:border-slate-800 dark:bg-slate-950/60">
                      <button
                        onClick={() => setResultViewType('chart')}
                        className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                          resultViewType === 'chart'
                            ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-white'
                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                        }`}
                      >
                        <BarChart3 className="h-3.5 w-3.5" />
                        <span>Chart</span>
                      </button>
                      <button
                        onClick={() => setResultViewType('table')}
                        className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                          resultViewType === 'table'
                            ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-white'
                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                        }`}
                      >
                        <Table2 className="h-3.5 w-3.5" />
                        <span>Table</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                  {/* Dimension Selector */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Categorical Dimension
                    </label>
                    <select
                      value={selectedDimension}
                      onChange={(e) => setSelectedDimension(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-100 cursor-pointer"
                    >
                      {dimensionColumns.map(dim => (
                        <option key={dim} value={dim}>{dim}</option>
                      ))}
                    </select>
                  </div>

                  {/* Metric Selector */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Numerical Metric
                    </label>
                    <select
                      value={selectedMetric}
                      onChange={(e) => setSelectedMetric(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-100 cursor-pointer"
                    >
                      {numericColumns.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  {/* Aggregation Function Selector */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Aggregation Function
                    </label>
                    <select
                      value={selectedAggregation}
                      onChange={(e) => setSelectedAggregation(e.target.value as AggregationType)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-100 cursor-pointer"
                    >
                      <option value="SUM">SUM (Total)</option>
                      <option value="AVERAGE">AVERAGE (Mean)</option>
                      <option value="COUNT">COUNT (Frequency)</option>
                      <option value="MEDIAN">MEDIAN (50th Percentile)</option>
                      <option value="MIN">MIN (Minimum)</option>
                      <option value="MAX">MAX (Maximum)</option>
                    </select>
                  </div>

                  {/* Chart Type Selector */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Visualization Style
                    </label>
                    <select
                      value={selectedChartType}
                      onChange={(e) => setSelectedChartType(e.target.value as any)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-100 cursor-pointer"
                    >
                      <option value="bar">Vertical Bar</option>
                      <option value="horizontal_bar">Horizontal Bar</option>
                      <option value="line">Line Chart</option>
                      <option value="area">Area Chart</option>
                      <option value="pie">Donut / Pie</option>
                    </select>
                  </div>
                </div>

                {/* Analysis Result Output: Chart or Table */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  {resultViewType === 'chart' ? (
                    <div className="h-80 w-full pt-2">
                      {groupedData.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-xs text-slate-400">
                          No aggregation data available.
                        </div>
                      ) : selectedChartType === 'pie' ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={groupedData.slice(0, 8)}
                              dataKey="value"
                              nameKey="dimensionValue"
                              cx="50%"
                              cy="50%"
                              innerRadius={65}
                              outerRadius={95}
                              paddingAngle={3}
                            >
                              {groupedData.slice(0, 8).map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                              formatter={(val: any) => [Number(val).toLocaleString(), `${selectedAggregation} ${selectedMetric}`]}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : selectedChartType === 'line' ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={groupedData.slice(0, 16)} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                            <XAxis dataKey="dimensionValue" stroke="#94a3b8" fontSize={11} tickLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                              formatter={(val: any) => [Number(val).toLocaleString(), `${selectedAggregation} ${selectedMetric}`]}
                            />
                            <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : selectedChartType === 'area' ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={groupedData.slice(0, 16)} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                            <XAxis dataKey="dimensionValue" stroke="#94a3b8" fontSize={11} tickLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                              formatter={(val: any) => [Number(val).toLocaleString(), `${selectedAggregation} ${selectedMetric}`]}
                            />
                            <Area type="monotone" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2.5} />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : selectedChartType === 'horizontal_bar' ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={groupedData.slice(0, 10)} layout="vertical" margin={{ top: 10, right: 15, left: 30, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
                            <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                            <YAxis type="category" dataKey="dimensionValue" stroke="#94a3b8" fontSize={11} tickLine={false} width={80} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                              formatter={(val: any) => [Number(val).toLocaleString(), `${selectedAggregation} ${selectedMetric}`]}
                            />
                            <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={groupedData.slice(0, 14)} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                            <XAxis 
                              dataKey="dimensionValue" 
                              stroke="#94a3b8" 
                              fontSize={10} 
                              tickLine={false} 
                              angle={-25} 
                              textAnchor="end"
                              interval={0}
                            />
                            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                              formatter={(val: any) => [Number(val).toLocaleString(), `${selectedAggregation} ${selectedMetric}`]}
                            />
                            <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  ) : (
                    <div className="overflow-x-auto max-h-72">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 dark:bg-slate-850 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="py-2.5 px-3 font-semibold">{selectedDimension}</th>
                            <th className="py-2.5 px-3 text-right font-semibold">{selectedAggregation} {selectedMetric}</th>
                            <th className="py-2.5 px-3 text-right font-semibold">Record Count</th>
                            <th className="py-2.5 px-3 text-right font-semibold">Share of Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono text-[11px] dark:divide-slate-800/60">
                          {groupedData.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-850/40">
                              <td className="py-2 px-3 text-slate-900 dark:text-slate-100 font-sans font-semibold">
                                {String(row.dimensionValue)}
                              </td>
                              <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                                {Number(row.value).toLocaleString()}
                              </td>
                              <td className="py-2 px-3 text-right text-slate-500 tabular-nums">
                                {row.recordCount.toLocaleString()}
                              </td>
                              <td className="py-2 px-3 text-right text-indigo-600 dark:text-indigo-400 tabular-nums">
                                {row.percentageShare}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* 4. MULTI-PERSPECTIVE ANALYTICS: TRENDS, MARKET SHARE PIE & RANKINGS */}
            <section aria-label="Visual Analytics Breakdown" className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {/* CARD 1: CHRONOLOGICAL TIME-SERIES */}
              <div className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 dark:border-slate-800 gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4 text-sky-500 shrink-0" />
                        <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                          Chronological Trend Analysis
                        </h3>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        Aggregated over {selectedGranularity} cadence
                      </p>
                    </div>

                    <select
                      disabled={dateColumns.length === 0}
                      value={selectedGranularity}
                      onChange={(e) => setSelectedGranularity(e.target.value as TimeGranularity)}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-xs font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-100 cursor-pointer disabled:opacity-40"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>

                  <div className="mt-4 h-64">
                    {dateColumns.length === 0 ? (
                      <div className="flex h-full flex-col items-center justify-center text-xs text-slate-400">
                        <Calendar className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                        <span>No date dimension detected in active dataset.</span>
                      </div>
                    ) : timeSeriesData.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-xs text-slate-400">
                        No time-series data found.
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                          <defs>
                            <linearGradient id="analyticsTimeGrad2" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                          <XAxis dataKey="period" stroke="#94a3b8" fontSize={10} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                            formatter={(val: any, name: any, item: any) => [
                              `${Number(val).toLocaleString()} ${item.payload.growthPercent !== null ? `(${item.payload.growthPercent > 0 ? '+' : ''}${item.payload.growthPercent}%)` : ''}`,
                              `${selectedAggregation} ${selectedMetric}`
                            ]}
                          />
                          <Area type="monotone" dataKey="value" stroke="#0284c7" strokeWidth={2.5} fill="url(#analyticsTimeGrad2)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-lg bg-sky-50/70 px-3 py-2 text-xs dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50">
                  <span className="text-[11px] text-slate-600 dark:text-slate-300">
                    Temporal Baseline
                  </span>
                  <span className="font-mono text-[11px] font-bold text-sky-700 dark:text-sky-300">
                    {timeSeriesData.length} Intervals Recorded
                  </span>
                </div>
              </div>

              {/* CARD 2: DEDICATED PIE / DONUT CHART BREAKDOWN */}
              <div className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 dark:border-slate-800 gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <PieIcon className="h-4 w-4 text-indigo-500 shrink-0" />
                        <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                          Proportional Share Breakdown
                        </h3>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        Market share of {pieMetric || 'Metric'} by {pieDimension || 'Dimension'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <select
                        value={pieDimension}
                        onChange={(e) => setPieDimension(e.target.value)}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-100 cursor-pointer max-w-[105px] truncate"
                        title="Select Dimension"
                      >
                        {dimensionColumns.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>

                      <select
                        value={pieMetric}
                        onChange={(e) => setPieMetric(e.target.value)}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-100 cursor-pointer max-w-[105px] truncate"
                        title="Select Metric"
                      >
                        {numericColumns.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>

                      <button
                        onClick={() => setPieChartStyle(prev => prev === 'donut' ? 'pie' : 'donut')}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-300 transition-colors cursor-pointer"
                        title={`Switch to ${pieChartStyle === 'donut' ? 'Solid Pie' : 'Donut'}`}
                      >
                        {pieChartStyle === 'donut' ? 'Donut' : 'Pie'}
                      </button>
                    </div>
                  </div>

                  <div className="relative mt-4 h-52">
                    {pieChartData.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-xs text-slate-400">
                        No distribution data available.
                      </div>
                    ) : (
                      <>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieChartData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={pieChartStyle === 'donut' ? 48 : 0}
                              outerRadius={75}
                              paddingAngle={pieChartStyle === 'donut' ? 3 : 1}
                              onMouseEnter={(_, index) => setPieHoverIndex(index)}
                              onMouseLeave={() => setPieHoverIndex(null)}
                            >
                              {pieChartData.map((_, index) => (
                                <Cell 
                                  key={`slice-${index}`} 
                                  fill={PIE_COLORS[index % PIE_COLORS.length]} 
                                  stroke={pieHoverIndex === index ? '#ffffff' : 'transparent'}
                                  strokeWidth={pieHoverIndex === index ? 2 : 1}
                                  className="transition-all duration-150 cursor-pointer"
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#0f172a',
                                borderColor: '#334155',
                                borderRadius: '8px',
                                fontSize: '12px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                              }}
                              formatter={(val: any, name: any, item: any) => [
                                `${Number(val).toLocaleString()} (${item?.payload?.percentage || 0}%)`,
                                item?.payload?.name || name
                              ]}
                            />
                          </PieChart>
                        </ResponsiveContainer>

                        {/* Donut Center Display */}
                        {pieChartStyle === 'donut' && (
                          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              {pieHoverIndex !== null ? pieChartData[pieHoverIndex]?.name : 'Total'}
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                              {pieHoverIndex !== null 
                                ? `${pieChartData[pieHoverIndex]?.percentage}%` 
                                : (pieTotal >= 1000000 
                                    ? `$${(pieTotal / 1000000).toFixed(1)}M` 
                                    : pieTotal >= 1000 
                                      ? `$${(pieTotal / 1000).toFixed(1)}K` 
                                      : pieTotal.toLocaleString())}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Slices Legend Breakdown */}
                  <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1 border-t border-slate-100 dark:border-slate-800 pt-2.5 text-xs max-h-24 overflow-y-auto">
                    {pieChartData.map((slice, idx) => (
                      <div 
                        key={slice.name} 
                        onMouseEnter={() => setPieHoverIndex(idx)}
                        onMouseLeave={() => setPieHoverIndex(null)}
                        className={`flex items-center justify-between rounded px-1.5 py-0.5 transition-colors cursor-pointer ${
                          pieHoverIndex === idx ? 'bg-slate-100 dark:bg-slate-800' : ''
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate mr-1">
                          <span 
                            className="h-2 w-2 rounded-full shrink-0" 
                            style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} 
                          />
                          <span className="truncate text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                            {slice.name}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] font-semibold text-slate-900 dark:text-slate-100 tabular-nums shrink-0">
                          {slice.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Leading Contributor Insight */}
                {leadingPieSlice && (
                  <div className="mt-3 flex items-center justify-between rounded-lg bg-indigo-50/70 px-3 py-2 text-xs dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
                    <div className="flex items-center gap-1.5 truncate mr-2">
                      <Award className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                        Leader: <strong className="text-slate-900 dark:text-slate-100">{leadingPieSlice.name}</strong>
                      </span>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-indigo-700 dark:text-indigo-300 tabular-nums shrink-0">
                      {leadingPieSlice.percentage}% of Total
                    </span>
                  </div>
                )}
              </div>

              {/* CARD 3: TOP-N & BOTTOM-N RANKINGS ANALYSIS */}
              <div className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 dark:border-slate-800 gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Activity className="h-4 w-4 text-emerald-500 shrink-0" />
                        <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                          Top & Bottom Rankings
                        </h3>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        Ranked performance contribution
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800 text-xs">
                        {[5, 10, 20].map(n => (
                          <button
                            key={n}
                            onClick={() => setTopNCount(n)}
                            className={`rounded-md px-2 py-0.5 font-semibold transition-colors cursor-pointer ${
                              topNCount === n
                                ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-slate-100'
                                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                            }`}
                          >
                            Top {n}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => setTopNSort(prev => prev === 'DESC' ? 'ASC' : 'DESC')}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                      >
                        <ArrowUpDown className="h-3 w-3" />
                        <span>{topNSort === 'DESC' ? 'High' : 'Low'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800/60 overflow-y-auto max-h-56">
                    {rankingData.map((item) => (
                      <div key={item.rank} className="flex items-center justify-between py-2 text-xs">
                        <div className="flex items-center gap-2 truncate max-w-[170px]">
                          <span className="font-mono font-bold text-slate-400 w-5">
                            #{item.rank}
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {item.dimensionValue}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                            {item.formattedValue}
                          </span>
                          <div className="flex items-center gap-1.5 w-20 justify-end">
                            <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                              {item.percentageOfTotal}%
                            </span>
                            <div className="h-1.5 w-10 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div 
                                className="h-full rounded-full bg-emerald-500" 
                                style={{ width: `${Math.min(100, item.percentageOfTotal)}%` }} 
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-lg bg-emerald-50/70 px-3 py-2 text-xs dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50">
                  <span className="text-[11px] text-slate-600 dark:text-slate-300">
                    Sorted By
                  </span>
                  <span className="font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                    {topNSort === 'DESC' ? 'Highest Value (Descending)' : 'Lowest Value (Ascending)'}
                  </span>
                </div>
              </div>
            </section>

            {/* 6. STATISTICAL SUMMARY TABLE (Requirement 35) */}
            <section aria-label="Descriptive Statistics">
              <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90">
                <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
                  <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                    Statistical Distribution Summary
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Parametric measures of central tendency, spread, and dispersion across all numeric fields
                  </p>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 dark:bg-slate-850 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold">Numeric Metric</th>
                        <th className="py-2.5 px-3 text-right font-semibold">Count</th>
                        <th className="py-2.5 px-3 text-right font-semibold">Mean (Average)</th>
                        <th className="py-2.5 px-3 text-right font-semibold">Median (50%)</th>
                        <th className="py-2.5 px-3 text-right font-semibold">Min</th>
                        <th className="py-2.5 px-3 text-right font-semibold">Max</th>
                        <th className="py-2.5 px-3 text-right font-semibold">Std Dev (σ)</th>
                        <th className="py-2.5 px-3 text-right font-semibold">Variance (s²)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px] dark:divide-slate-800/60">
                      {descriptiveStats.map((stat) => (
                        <tr key={stat.column} className="hover:bg-slate-50/60 dark:hover:bg-slate-850/40">
                          <td className="py-2 px-3 text-slate-900 dark:text-slate-100 font-sans font-semibold">
                            {stat.column}
                          </td>
                          <td className="py-2 px-3 text-right tabular-nums text-slate-600 dark:text-slate-400">
                            {stat.count.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-right tabular-nums font-bold text-slate-800 dark:text-slate-200">
                            {stat.mean.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-right tabular-nums text-slate-700 dark:text-slate-300">
                            {stat.median.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-right tabular-nums text-slate-600 dark:text-slate-400">
                            {stat.min.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-right tabular-nums text-slate-600 dark:text-slate-400">
                            {stat.max.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-right tabular-nums text-indigo-600 dark:text-indigo-400 font-semibold">
                            {stat.stdDev.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-right tabular-nums text-slate-500">
                            {stat.variance.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* 7. CORRELATION ANALYSIS (Requirement 34) */}
            {correlationMatrix.length > 0 && (
              <section aria-label="Correlation Analysis">
                <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90">
                  <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
                    <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                      Bivariate Pearson Correlation Matrix
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      Linear relationship coefficients between -1.00 and +1.00 (Correlation does not imply causation)
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {correlationMatrix.map((corr, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-850/40"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                              {corr.columnA} <span className="text-slate-400">vs</span> {corr.columnB}
                            </span>
                          </div>
                          <div className="mt-2 flex items-baseline gap-2 font-mono">
                            <span className="text-2xl font-bold text-slate-900 dark:text-slate-50 tabular-nums">
                              {corr.coefficient > 0 ? `+${corr.coefficient.toFixed(2)}` : corr.coefficient.toFixed(2)}
                            </span>
                            <span className="text-[11px] text-slate-400 font-sans">Pearson r</span>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-slate-200/80 pt-2 dark:border-slate-700/80 text-[11px]">
                          <span className={`font-semibold ${
                            corr.strength.includes('Positive') ? 'text-emerald-600 dark:text-emerald-400' :
                            corr.strength.includes('Negative') ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'
                          }`}>
                            {corr.strength}
                          </span>
                          <span className="font-mono text-slate-400">{corr.sampleSize} data points</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
};
