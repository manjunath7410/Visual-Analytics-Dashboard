import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, 
  BarChart2, 
  LineChart, 
  PieChart, 
  Sparkles, 
  Sliders, 
  Bookmark, 
  Trash2, 
  Play, 
  Plus, 
  Check, 
  FileDown, 
  HelpCircle,
  ScatterChart as ScatterIcon
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { AnalyticsEngine } from '../../utils/analytics/analyticsEngine';
import { ChartConfig, ChartType, SavedChartConfig } from '../../types/visualization';
import { AggregationType, TimeGranularity } from '../../types/analytics';
import { ChartRenderer } from './ChartRenderer';

const SAVED_CHARTS_KEY = 'acuity_saved_visualizations';

export const ChartBuilder: React.FC = () => {
  const { dataset, filteredRows } = useData();

  // Classify dataset columns dynamically
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

  // Primary defaults
  const primarySales = useMemo(() => AnalyticsEngine.findPrimarySalesColumn(classifications), [classifications]);
  const primaryProfit = useMemo(() => AnalyticsEngine.findPrimaryProfitColumn(classifications), [classifications]);
  const primaryDate = useMemo(() => AnalyticsEngine.findPrimaryDateColumn(classifications), [classifications]);
  const primaryDims = useMemo(() => AnalyticsEngine.findPrimaryDimensions(classifications), [classifications]);

  // Builder Configuration State
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [selectedDimension, setSelectedDimension] = useState<string>('');
  const [selectedMetric, setSelectedMetric] = useState<string>('');
  const [secondaryMetric, setSecondaryMetric] = useState<string>('');
  const [aggregation, setAggregation] = useState<AggregationType>('SUM');
  const [timeGranularity, setTimeGranularity] = useState<TimeGranularity>('monthly');
  const [topN, setTopN] = useState<string>('10');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [drillDownDim, setDrillDownDim] = useState<string>('');

  // Saved visual configurations
  const [savedConfigs, setSavedConfigs] = useState<SavedChartConfig[]>(() => {
    try {
      const stored = localStorage.getItem(SAVED_CHARTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [];
  });
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Initialize sensible defaults when columns load
  useEffect(() => {
    if (numericColumns.length > 0 && (!selectedMetric || !numericColumns.includes(selectedMetric))) {
      setSelectedMetric(primarySales || numericColumns[0]);
    }
    if (numericColumns.length > 1 && (!secondaryMetric || !numericColumns.includes(secondaryMetric))) {
      setSecondaryMetric(primaryProfit || numericColumns[1]);
    }
    if (dimensionColumns.length > 0 && (!selectedDimension || !dimensionColumns.includes(selectedDimension))) {
      setSelectedDimension(primaryDims.categoryColumn || primaryDims.regionColumn || dimensionColumns[0]);
    }
    if (dimensionColumns.length > 1 && !drillDownDim) {
      setDrillDownDim(primaryDims.productColumn || dimensionColumns[1]);
    }
  }, [numericColumns, dimensionColumns, primarySales, primaryProfit, primaryDims]);

  // Handle Chart Type switch adjustments
  const handleChartTypeChange = (newType: ChartType) => {
    setChartType(newType);
    if ((newType === 'line' || newType === 'area') && dateColumns.length > 0) {
      setSelectedDimension(primaryDate || dateColumns[0]);
    } else if (newType === 'scatter' && numericColumns.length > 1) {
      // Scatter uses numeric for both axes
      if (!secondaryMetric) setSecondaryMetric(numericColumns[1]);
    } else if (newType !== 'line' && newType !== 'area' && dimensionColumns.length > 0) {
      if (selectedDimension.toLowerCase().includes('date')) {
        setSelectedDimension(primaryDims.categoryColumn || dimensionColumns[0]);
      }
    }
  };

  // Compile active configuration
  const activeConfig: ChartConfig = useMemo(() => {
    const isScatter = chartType === 'scatter';
    const title = customTitle.trim() || (isScatter 
      ? `${selectedMetric} vs ${secondaryMetric} Correlation` 
      : `${selectedMetric} by ${selectedDimension}`);

    return {
      id: `builder-chart-${Date.now()}`,
      title,
      description: isScatter 
        ? `Scatter plot examining parametric variance between ${selectedMetric} (X) and ${secondaryMetric} (Y)`
        : `Dynamic ${aggregation} aggregation across ${selectedDimension}`,
      chartType,
      dimension: isScatter ? (primaryDims.productColumn || 'Product') : selectedDimension,
      metric: selectedMetric,
      secondaryMetric: isScatter || chartType === 'line' || chartType === 'area' ? secondaryMetric : undefined,
      aggregation,
      timeGranularity: (chartType === 'line' || chartType === 'area') ? timeGranularity : undefined,
      topN: topN === 'all' ? 'all' : Number(topN),
      drillDownDimension: drillDownDim && drillDownDim !== selectedDimension ? drillDownDim : undefined,
      showGrid: true,
      showLegend: true,
      showTooltip: true,
      height: 320
    };
  }, [chartType, selectedDimension, selectedMetric, secondaryMetric, aggregation, timeGranularity, topN, customTitle, drillDownDim, primaryDims]);

  // Save current visualization to state and storage
  const handleSaveVisualization = () => {
    const newSaved: SavedChartConfig = {
      id: `saved-${Date.now()}`,
      name: activeConfig.title,
      createdAt: new Date().toLocaleDateString(),
      config: { ...activeConfig, id: `saved-cfg-${Date.now()}` }
    };
    const updated = [newSaved, ...savedConfigs];
    setSavedConfigs(updated);
    try {
      localStorage.setItem(SAVED_CHARTS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 2500);
  };

  // Load a saved visualization
  const handleLoadSaved = (saved: SavedChartConfig) => {
    setChartType(saved.config.chartType);
    if (saved.config.dimension) setSelectedDimension(saved.config.dimension);
    setSelectedMetric(saved.config.metric);
    if (saved.config.secondaryMetric) setSecondaryMetric(saved.config.secondaryMetric);
    setAggregation(saved.config.aggregation);
    if (saved.config.timeGranularity) setTimeGranularity(saved.config.timeGranularity);
    if (saved.config.topN) setTopN(String(saved.config.topN));
    if (saved.config.drillDownDimension) setDrillDownDim(saved.config.drillDownDimension);
    setCustomTitle(saved.config.title);
  };

  // Delete a saved visualization
  const handleDeleteSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedConfigs.filter(s => s.id !== id);
    setSavedConfigs(updated);
    try {
      localStorage.setItem(SAVED_CHARTS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const chartTypeButtons: { type: ChartType; label: string; icon: any }[] = [
    { type: 'bar', label: 'Bar', icon: BarChart },
    { type: 'horizontal_bar', label: 'H-Bar', icon: BarChart2 },
    { type: 'line', label: 'Line', icon: LineChart },
    { type: 'area', label: 'Area', icon: Sparkles },
    { type: 'pie', label: 'Pie', icon: PieChart },
    { type: 'donut', label: 'Donut', icon: PieChart },
    { type: 'scatter', label: 'Scatter', icon: ScatterIcon },
  ];

  return (
    <div className="space-y-6">
      {/* BUILDER CONTROL PANEL (Requirement 3 & 16) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 dark:border-slate-800 gap-2">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-indigo-500" />
            <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Interactive Visualization Builder
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveVisualization}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-2xs"
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span>Save Visualization</span>
            </button>
            {saveSuccessMsg && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="h-3.5 w-3.5" /> Saved!
              </span>
            )}
          </div>
        </div>

        {/* 1. Chart Type Selector */}
        <div className="mt-4">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
            Select Chart Type:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {chartTypeButtons.map(btn => {
              const Icon = btn.icon;
              const isActive = chartType === btn.type;
              return (
                <button
                  key={btn.type}
                  onClick={() => handleChartTypeChange(btn.type)}
                  className={`flex flex-col items-center justify-center rounded-lg border p-2.5 text-xs font-medium transition-all ${
                    isActive
                      ? 'border-indigo-600 bg-indigo-50/80 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/50 dark:text-indigo-300 shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4 mb-1" />
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Dimension & Metric Selectors */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          {/* Dimension (X-Axis) */}
          {chartType !== 'scatter' ? (
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Dimension (Categorical):
              </label>
              <select
                value={selectedDimension}
                onChange={(e) => setSelectedDimension(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 focus:outline-hidden"
              >
                {dimensionColumns.map(dim => (
                  <option key={dim} value={dim}>{dim}</option>
                ))}
                {dateColumns.map(d => (
                  <option key={d} value={d}>{d} (Temporal)</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                X-Axis Metric:
              </label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 focus:outline-hidden"
              >
                {numericColumns.map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          )}

          {/* Primary Metric (Y-Axis) */}
          {chartType !== 'scatter' ? (
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Primary Metric (Value):
              </label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 focus:outline-hidden"
              >
                {numericColumns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Y-Axis Metric (Correlation):
              </label>
              <select
                value={secondaryMetric}
                onChange={(e) => setSecondaryMetric(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 focus:outline-hidden"
              >
                {numericColumns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
          )}

          {/* Aggregation Function */}
          {chartType !== 'scatter' ? (
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Aggregation:
              </label>
              <select
                value={aggregation}
                onChange={(e) => setAggregation(e.target.value as AggregationType)}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 focus:outline-hidden"
              >
                <option value="SUM">SUM (Total)</option>
                <option value="AVERAGE">AVERAGE (Mean)</option>
                <option value="COUNT">COUNT (Volume)</option>
                <option value="MIN">MIN (Minimum)</option>
                <option value="MAX">MAX (Maximum)</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Point Identifier:
              </label>
              <select
                value={drillDownDim || 'Product'}
                onChange={(e) => setDrillDownDim(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 focus:outline-hidden"
              >
                {dimensionColumns.map(dim => (
                  <option key={dim} value={dim}>{dim}</option>
                ))}
              </select>
            </div>
          )}

          {/* Time Granularity OR Top N */}
          {(chartType === 'line' || chartType === 'area') && selectedDimension.toLowerCase().includes('date') ? (
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Time Granularity:
              </label>
              <select
                value={timeGranularity}
                onChange={(e) => setTimeGranularity(e.target.value as TimeGranularity)}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 focus:outline-hidden"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          ) : chartType !== 'scatter' ? (
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Top N Items:
              </label>
              <select
                value={topN}
                onChange={(e) => setTopN(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 focus:outline-hidden"
              >
                <option value="5">Top 5</option>
                <option value="10">Top 10</option>
                <option value="15">Top 15</option>
                <option value="20">Top 20</option>
                <option value="all">All Items</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Chart Scope:
              </label>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950 font-mono">
                {filteredRows.length.toLocaleString()} matching rows
              </div>
            </div>
          )}
        </div>

        {/* 3. Drill-down Configuration & Title */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Custom Chart Title (Optional):
            </label>
            <input
              type="text"
              placeholder={activeConfig.title}
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Drill-down Target Dimension:
            </label>
            <select
              value={drillDownDim}
              onChange={(e) => setDrillDownDim(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="">None (Standard View)</option>
              {dimensionColumns.filter(d => d !== selectedDimension).map(dim => (
                <option key={dim} value={dim}>Drill into: {dim}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* LIVE INTERACTIVE CHART PREVIEW (Requirement 16) */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Live Interactive Preview
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Powered by Phase 5 Analytics Engine
          </span>
        </div>
        <ChartRenderer config={activeConfig} />
      </div>

      {/* SAVED VISUALIZATIONS GALLERY (Requirement 17) */}
      {savedConfigs.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-indigo-500" />
              <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                Saved Custom Visualizations ({savedConfigs.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Persisted in application memory
            </span>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {savedConfigs.map(item => (
              <div
                key={item.id}
                onClick={() => handleLoadSaved(item)}
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-slate-50/60 p-3 hover:border-indigo-300 hover:bg-indigo-50/30 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/20 cursor-pointer transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                      {item.config.chartType}
                    </span>
                    <button
                      onClick={(e) => handleDeleteSaved(item.id, e)}
                      className="text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Saved Visualization"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <h4 className="mt-2 text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.config.metric} by {item.config.dimension || 'Date'} ({item.config.aggregation})
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-200/60 pt-2 dark:border-slate-800/80">
                  <span>Saved on {item.createdAt}</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold group-hover:underline">
                    Load Config →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
