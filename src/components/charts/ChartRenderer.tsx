import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { AnalyticsEngine } from '../../utils/analytics/analyticsEngine';
import { ChartConfig, DrillDownState, InteractiveDataPoint, ChartType } from '../../types/visualization';
import { EnhancedChartContainer } from './ChartContainer';
import { BarChartRenderer } from './BarChartRenderer';
import { LineChartRenderer } from './LineChartRenderer';
import { AreaChartRenderer } from './AreaChartRenderer';
import { PieChartRenderer } from './PieChartRenderer';
import { ScatterChartRenderer, ScatterPoint } from './ScatterChartRenderer';

interface ChartRendererProps {
  config: ChartConfig;
  customData?: Record<string, any>[];
  onCrossFilter?: (dimension: string, value: string) => void;
  className?: string;
  actionsSlot?: React.ReactNode;
}

export const ChartRenderer: React.FC<ChartRendererProps> = ({
  config,
  customData,
  onCrossFilter,
  className = '',
  actionsSlot
}) => {
  const { dataset, filteredRows, setFilter } = useData();

  // Active chart type toggle (allows in-place switching between e.g. Pie and Bar)
  const [activeChartType, setActiveChartType] = useState<ChartType>(config.chartType);

  // Drill-down State (Requirement 13)
  const [drillDown, setDrillDown] = useState<DrillDownState | null>(null);

  // Interactive Selected Point (Requirement 12)
  const [selectedPoint, setSelectedPoint] = useState<InteractiveDataPoint | null>(null);

  // Base rows to aggregate
  const baseRows = customData || filteredRows;

  // Filter rows if currently drilled down
  const scopedRows = useMemo(() => {
    if (!drillDown) return baseRows;
    return baseRows.filter(row => {
      const val = row[drillDown.parentDimension];
      return String(val).trim() === drillDown.parentValue.trim();
    });
  }, [baseRows, drillDown]);

  // Current active dimension (either base or drill-down dimension)
  const currentDimension = drillDown ? drillDown.currentDimension : (config.dimension || 'Category');

  // Compute aggregated analytical data via AnalyticsEngine
  const { chartData, scatterData, rawAggregations } = useMemo(() => {
    if (scopedRows.length === 0) {
      return { chartData: [], scatterData: [], rawAggregations: [] };
    }

    // 1. Scatter Chart Type
    if (activeChartType === 'scatter') {
      const xMetric = config.metric;
      const yMetric = config.secondaryMetric || 'Profit';
      const labelCol = config.dimension || 'Product';

      // Sample up to 150 points for optimal SVG rendering
      const maxPoints = 150;
      const points: ScatterPoint[] = [];

      for (let i = 0; i < scopedRows.length && points.length < maxPoints; i++) {
        const row = scopedRows[i];
        const xVal = Number(row[xMetric]);
        const yVal = Number(row[yMetric]);
        if (!isNaN(xVal) && isFinite(xVal) && !isNaN(yVal) && isFinite(yVal)) {
          points.push({
            x: xVal,
            y: yVal,
            label: String(row[labelCol] || row['Order ID'] || `Point ${i + 1}`),
            category: config.dimension && row[config.dimension] ? String(row[config.dimension]) : undefined,
            raw: row
          });
        }
      }

      return { chartData: [], scatterData: points, rawAggregations: [] };
    }

    // 2. Time-Series (Line or Area on Date dimension)
    const isTemporal = config.chartType === 'line' || config.chartType === 'area';
    const isDateCol = currentDimension.toLowerCase().includes('date') || currentDimension.toLowerCase().includes('time');

    if (isTemporal && isDateCol) {
      const timePoints = AnalyticsEngine.aggregateTimeSeries(
        scopedRows,
        currentDimension,
        config.metric,
        config.timeGranularity || 'monthly',
        config.aggregation
      );

      // If secondary metric is requested, aggregate it too
      let secondaryMap = new Map<string, number>();
      if (config.secondaryMetric) {
        const secPoints = AnalyticsEngine.aggregateTimeSeries(
          scopedRows,
          currentDimension,
          config.secondaryMetric,
          config.timeGranularity || 'monthly',
          config.aggregation
        );
        secPoints.forEach(p => secondaryMap.set(p.period, p.value));
      }

      const points: InteractiveDataPoint[] = timePoints.map(p => ({
        label: p.period,
        value: p.value,
        secondaryValue: secondaryMap.get(p.period),
        percentageShare: undefined,
        raw: p
      }));

      return { chartData: points, scatterData: [], rawAggregations: timePoints };
    }

    // 3. Dimensional Group By (Bar, Horizontal Bar, Pie, Donut, or standard Line/Area)
    const grouped = AnalyticsEngine.groupBy(
      scopedRows,
      currentDimension,
      config.metric,
      config.aggregation
    );

    // Apply Top N limit if specified
    const limit = config.topN === 'all' || !config.topN ? grouped.length : Number(config.topN);
    const sliced = grouped.slice(0, limit);

    const points: InteractiveDataPoint[] = sliced.map(g => ({
      label: g.dimensionValue,
      value: g.value,
      recordCount: g.recordCount,
      percentageShare: g.percentageShare,
      raw: g
    }));

    return { chartData: points, scatterData: [], rawAggregations: sliced };
  }, [scopedRows, currentDimension, config, activeChartType]);

  // Drill-down Handler (Requirement 13)
  const handleDrillDown = (point: InteractiveDataPoint) => {
    // If we're not drilled down and user configured a drill-down dimension or default to Product
    if (!drillDown) {
      const targetDim = config.drillDownDimension || 'Product';
      if (targetDim !== currentDimension) {
        setDrillDown({
          level: 1,
          parentDimension: currentDimension,
          parentValue: point.label,
          currentDimension: targetDim,
          breadcrumbs: [
            { dimension: currentDimension, value: point.label }
          ]
        });
        setSelectedPoint(null);
      }
    }
  };

  const handleBackDrillDown = () => {
    setDrillDown(null);
    setSelectedPoint(null);
  };

  // Cross-filtering Handler (Requirement 14)
  const handleCrossFilter = (dim: string, val: string) => {
    if (onCrossFilter) {
      onCrossFilter(dim, val);
    } else {
      // Use standard DataContext setFilter
      setFilter(dim, {
        type: 'category',
        selectedCategories: [val]
      });
    }
  };

  // Export Chart Data as CSV (Requirement 18)
  const handleExportCSV = () => {
    if (activeChartType === 'scatter') {
      if (scatterData.length === 0) return;
      const headers = ['Item', config.metric, config.secondaryMetric || 'Profit'];
      const rows = scatterData.map(p => `"${p.label}",${p.x},${p.y}`);
      const csv = `${headers.join(',')}\n${rows.join('\n')}`;
      downloadBlob(csv, `${config.title.toLowerCase().replace(/\s+/g, '_')}_scatter.csv`);
      return;
    }

    if (chartData.length === 0) return;
    const headers = [currentDimension, config.metric, 'Share Percent', 'Records'];
    const rows = chartData.map(p => 
      `"${p.label}",${p.value},${p.percentageShare ?? ''},${p.recordCount ?? ''}`
    );
    const csv = `${headers.join(',')}\n${rows.join('\n')}`;
    downloadBlob(csv, `${config.title.toLowerCase().replace(/\s+/g, '_')}_analytics.csv`);
  };

  const downloadBlob = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Table Data format for the data inspector view
  const tableData = useMemo(() => {
    if (activeChartType === 'scatter') {
      return {
        headers: ['Identifier', config.metric, config.secondaryMetric || 'Y Metric'],
        rows: scatterData.map(p => [p.label, p.x, p.y])
      };
    }
    return {
      headers: [currentDimension, `${config.metric} (${config.aggregation})`, 'Share %', 'Volume'],
      rows: chartData.map(p => [
        p.label, 
        p.value, 
        p.percentageShare !== undefined ? `${p.percentageShare}%` : '-', 
        p.recordCount ?? '-'
      ])
    };
  }, [activeChartType, currentDimension, config, scatterData, chartData]);

  // Determine title with drilldown context
  const displayTitle = drillDown 
    ? `${config.title} › ${drillDown.parentValue}` 
    : config.title;

  const displaySubtitle = drillDown
    ? `Drilled down by ${drillDown.currentDimension} where ${drillDown.parentDimension} = "${drillDown.parentValue}"`
    : config.description;

  const canDrillDown = !drillDown && (config.drillDownDimension !== undefined || currentDimension === 'Category');

  return (
    <EnhancedChartContainer
      title={displayTitle}
      subtitle={displaySubtitle}
      drillDownInfo={drillDown ? {
        canGoBack: true,
        onBack: handleBackDrillDown,
        currentLevelLabel: `${drillDown.parentDimension}: ${drillDown.parentValue}`
      } : undefined}
      selectedPoint={selectedPoint}
      onClearSelection={() => setSelectedPoint(null)}
      onApplyCrossFilter={handleCrossFilter}
      activeFilterDimension={currentDimension}
      onExportCSV={handleExportCSV}
      tableData={tableData}
      actionsSlot={actionsSlot}
      height={config.height || 280}
      className={className}
      footerText={config.topN && config.topN !== 'all' ? `Showing Top ${config.topN} aggregated items` : undefined}
    >
      {/* Chart Dispatcher */}
      {(() => {
        switch (activeChartType) {
          case 'bar':
            return (
              <BarChartRenderer
                data={chartData}
                metricName={config.metric}
                horizontal={false}
                height={config.height || 280}
                showGrid={config.showGrid ?? true}
                showLegend={config.showLegend ?? false}
                selectedLabel={selectedPoint?.label}
                onSelectPoint={setSelectedPoint}
                onDrillDown={handleDrillDown}
                canDrillDown={canDrillDown}
              />
            );

          case 'horizontal_bar':
            return (
              <BarChartRenderer
                data={chartData}
                metricName={config.metric}
                horizontal={true}
                height={config.height || 280}
                showGrid={config.showGrid ?? true}
                showLegend={config.showLegend ?? false}
                selectedLabel={selectedPoint?.label}
                onSelectPoint={setSelectedPoint}
                onDrillDown={handleDrillDown}
                canDrillDown={canDrillDown}
              />
            );

          case 'line':
            return (
              <LineChartRenderer
                data={chartData}
                metricName={config.metric}
                secondaryMetricName={config.secondaryMetric}
                height={config.height || 280}
                showGrid={config.showGrid ?? true}
                showLegend={config.showLegend ?? true}
                selectedLabel={selectedPoint?.label}
                onSelectPoint={setSelectedPoint}
              />
            );

          case 'area':
            return (
              <AreaChartRenderer
                data={chartData}
                metricName={config.metric}
                secondaryMetricName={config.secondaryMetric}
                height={config.height || 280}
                showGrid={config.showGrid ?? true}
                showLegend={config.showLegend ?? true}
                selectedLabel={selectedPoint?.label}
                onSelectPoint={setSelectedPoint}
              />
            );

          case 'pie':
            return (
              <PieChartRenderer
                data={chartData}
                metricName={config.metric}
                isDonut={false}
                height={config.height || 280}
                showLegend={config.showLegend ?? true}
                selectedLabel={selectedPoint?.label}
                onSelectPoint={setSelectedPoint}
                onDrillDown={handleDrillDown}
                canDrillDown={canDrillDown}
                onSwitchToBar={() => setActiveChartType('bar')}
              />
            );

          case 'donut':
            return (
              <PieChartRenderer
                data={chartData}
                metricName={config.metric}
                isDonut={true}
                height={config.height || 280}
                showLegend={config.showLegend ?? true}
                selectedLabel={selectedPoint?.label}
                onSelectPoint={setSelectedPoint}
                onDrillDown={handleDrillDown}
                canDrillDown={canDrillDown}
                onSwitchToBar={() => setActiveChartType('bar')}
              />
            );

          case 'scatter':
            return (
              <ScatterChartRenderer
                data={scatterData}
                xMetric={config.metric}
                yMetric={config.secondaryMetric || 'Profit'}
                height={config.height || 280}
                showGrid={config.showGrid ?? true}
                totalPoints={scopedRows.length}
              />
            );

          default:
            return null;
        }
      })()}
    </EnhancedChartContainer>
  );
};
