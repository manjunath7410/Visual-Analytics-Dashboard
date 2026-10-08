import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { 
  Globe, 
  Building2, 
  Clock, 
  ShoppingBag, 
  UserCheck, 
  ShieldAlert, 
  CheckCircle2, 
  RotateCcw,
  Sparkles,
  ChevronRight,
  Filter,
  BarChart3,
  Layers,
  Calendar,
  TrendingUp,
  Download,
  Activity,
  FileText,
  ArrowUpRight,
  SlidersHorizontal
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { PageContainer } from '../components/common/PageContainer';
import { EmptyState } from '../components/common/EmptyState';
import { GlobalFilterBar } from '../components/common/GlobalFilterBar';
import { AnalyticsEngine } from '../utils/analytics/analyticsEngine';
import { BIEngine } from '../utils/analytics/biEngine';
import { ChartConfig } from '../types/visualization';
import { TimeGranularity } from '../types/analytics';
import { ExecutiveKPICardsGrid } from '../components/bi/ExecutiveKPICardsGrid';
import { RegionalPerformanceSection } from '../components/bi/RegionalPerformanceSection';
import { CategoryPerformanceSection } from '../components/bi/CategoryPerformanceSection';
import { ProductRankingSection } from '../components/bi/ProductRankingSection';
import { PerformanceMatrixChart } from '../components/bi/PerformanceMatrixChart';
import { AnomalyDetectionTable } from '../components/bi/AnomalyDetectionTable';
import { CustomerSegmentSection } from '../components/bi/CustomerSegmentSection';
import { ExecutiveBreadcrumbs, DrillDownHierarchy } from '../components/bi/ExecutiveBreadcrumbs';
import { buildStructuredAnalyticsContext } from '../services/gemini/analyticsContextBuilder';
import { GeminiClient } from '../services/gemini/geminiClient';
import { AIExecutiveSummary } from '../types/gemini';
import { AIExecutiveSummaryCard } from '../components/ai/AIExecutiveSummaryCard';
import { DatasetContextBar } from '../components/dashboard/DatasetContextBar';
import { DashboardHeroTrendSection } from '../components/dashboard/DashboardHeroTrendSection';
import { PerformanceInsightCards } from '../components/dashboard/PerformanceInsightCards';
import { BusinessAlertsSection } from '../components/dashboard/BusinessAlertsSection';
import { OperationalContextRow } from '../components/dashboard/DataQualityMiniCard';
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton';
import { WarehouseBuilder } from '../utils/warehouse/warehouseBuilder';
import { Button } from '../components/ui/Button';
import { 
  DashboardWidgetConfig, 
  DashboardWidgetId, 
  WidgetSize, 
  DashboardLayoutPreset, 
  loadSavedDashboardLayout, 
  saveDashboardLayout, 
  applyLayoutPreset, 
  resetDashboardLayout 
} from '../types/dashboardLayout';
import { DraggableWidgetWrapper } from '../components/dashboard/DraggableWidgetWrapper';
import { DashboardCustomizerToolbar } from '../components/dashboard/DashboardCustomizerToolbar';
import { useToast } from '../context/ToastContext';

export const DashboardPage: React.FC = () => {
  const { 
    dataset,
    filteredRows, 
    selectedRegion, 
    setSelectedRegion,
    selectedSegment,
    setSelectedSegment,
    isRefreshing,
    refreshData,
    loadSampleDataset,
    filters,
    advancedFilters,
    clearFilters,
    activeFilterCount,
    setFilter,
    setCategoricalFilter,
    removeFilterChip
  } = useData();

  const navigate = useNavigate();
  const { success, info } = useToast();

  // Dashboard Layout & Customization State
  const [widgets, setWidgets] = useState<DashboardWidgetConfig[]>(() => loadSavedDashboardLayout());
  const [isCustomizing, setIsCustomizing] = useState<boolean>(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const visibleWidgets = useMemo(() => widgets.filter(w => w.visible), [widgets]);

  // Reordering & Customization Handlers
  const handleMoveWidget = (fromIndex: number, toIndex: number) => {
    setWidgets((prev) => {
      const visible = prev.filter(w => w.visible);
      const hidden = prev.filter(w => !w.visible);
      
      const itemToMove = visible[fromIndex];
      const newVisible = [...visible];
      newVisible.splice(fromIndex, 1);
      newVisible.splice(toIndex, 0, itemToMove);
      
      const updated = [...newVisible, ...hidden];
      saveDashboardLayout(updated);
      return updated;
    });
  };

  const handleResizeWidget = (id: string, size: WidgetSize) => {
    setWidgets((prev) => {
      const updated = prev.map(w => w.id === id ? { ...w, size } : w);
      saveDashboardLayout(updated);
      return updated;
    });
  };

  const handleToggleWidgetVisibility = (id: string) => {
    setWidgets((prev) => {
      const updated = prev.map(w => w.id === id ? { ...w, visible: !w.visible } : w);
      saveDashboardLayout(updated);
      return updated;
    });
  };

  const handleApplyPreset = (preset: DashboardLayoutPreset) => {
    const updated = applyLayoutPreset(preset);
    setWidgets(updated);
    success('Preset Applied', `Loaded "${preset.toUpperCase()}" dashboard layout view`);
  };

  const handleResetLayout = () => {
    const reset = resetDashboardLayout();
    setWidgets(reset);
    info('Layout Reset', 'Restored default balanced dashboard layout');
  };

  // Drag and Drop Event Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', String(index));
    } catch {
      // ignore
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      handleMoveWidget(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Executive Dashboard-Level Date/Granularity Control
  const [executiveGranularity, setExecutiveGranularity] = useState<TimeGranularity>('monthly');

  // Product Ranking Controls (Top-N vs Bottom-N, metric, limit)
  const [productLimit, setProductLimit] = useState<number>(5);
  const [productMetric, setProductMetric] = useState<'sales' | 'profit' | 'quantity' | 'orders'>('sales');
  const [isTopProducts, setIsTopProducts] = useState<boolean>(true);

  // Column classifications dynamically from dataset
  const classifications = useMemo(() => {
    if (!dataset) return [];
    return AnalyticsEngine.classifyColumns(dataset.columns, filteredRows);
  }, [dataset, filteredRows]);

  const primarySales = useMemo(() => AnalyticsEngine.findPrimarySalesColumn(classifications), [classifications]);
  const primaryProfit = useMemo(() => AnalyticsEngine.findPrimaryProfitColumn(classifications), [classifications]);
  const primaryDate = useMemo(() => AnalyticsEngine.findPrimaryDateColumn(classifications), [classifications]);
  const primaryDims = useMemo(() => AnalyticsEngine.findPrimaryDimensions(classifications), [classifications]);

  // Hierarchical Drill-down State (Executive Overview -> Region -> Category -> Product)
  const hierarchy = useMemo<DrillDownHierarchy>(() => {
    const regFilter = selectedRegion !== 'all' ? selectedRegion : (filters[primaryDims.regionColumn || 'Region']?.selectedCategories?.[0] || null);
    const catFilter = filters[primaryDims.categoryColumn || 'Category']?.selectedCategories?.[0] || null;
    const prodFilter = filters[primaryDims.productColumn || 'Product']?.selectedCategories?.[0] || null;
    return {
      region: regFilter,
      category: catFilter,
      product: prodFilter
    };
  }, [selectedRegion, filters, primaryDims]);

  // Drill-down actions
  const handleSelectRegion = (regionName: string) => {
    if (primaryDims.regionColumn) {
      setCategoricalFilter(primaryDims.regionColumn, [regionName]);
      setSelectedRegion(regionName);
    }
  };

  const handleSelectCategory = (categoryName: string) => {
    if (primaryDims.categoryColumn) {
      setCategoricalFilter(primaryDims.categoryColumn, [categoryName]);
    }
  };

  const handleSelectProduct = (productName: string) => {
    if (primaryDims.productColumn) {
      setCategoricalFilter(primaryDims.productColumn, [productName]);
    }
  };

  const handleDrillBreadcrumbNavigate = (level: 'root' | 'region' | 'category') => {
    if (level === 'root') {
      if (primaryDims.regionColumn) removeFilterChip('category', primaryDims.regionColumn);
      if (primaryDims.categoryColumn) removeFilterChip('category', primaryDims.categoryColumn);
      if (primaryDims.productColumn) removeFilterChip('category', primaryDims.productColumn);
      setSelectedRegion('all');
    } else if (level === 'region') {
      if (primaryDims.categoryColumn) removeFilterChip('category', primaryDims.categoryColumn);
      if (primaryDims.productColumn) removeFilterChip('category', primaryDims.productColumn);
    } else if (level === 'category') {
      if (primaryDims.productColumn) removeFilterChip('category', primaryDims.productColumn);
    }
  };

  // BI Analysis Engine Computations (Memoized)
  const executiveKPIs = useMemo(() => {
    return BIEngine.calculateExecutiveKPICards(filteredRows, dataset, executiveGranularity);
  }, [filteredRows, dataset, executiveGranularity]);

  const regionalItems = useMemo(() => {
    return BIEngine.analyzeRegionalPerformance(filteredRows, dataset);
  }, [filteredRows, dataset]);

  const categoryItems = useMemo(() => {
    return BIEngine.analyzeCategoryPerformance(filteredRows, dataset);
  }, [filteredRows, dataset]);

  const topProducts = useMemo(() => {
    return BIEngine.calculateProductRankings(filteredRows, dataset, productMetric, productLimit, true);
  }, [filteredRows, dataset, productMetric, productLimit]);

  const bottomProducts = useMemo(() => {
    return BIEngine.calculateProductRankings(filteredRows, dataset, productMetric, productLimit, false);
  }, [filteredRows, dataset, productMetric, productLimit]);

  const productRankings = useMemo(() => {
    return isTopProducts ? topProducts : bottomProducts;
  }, [isTopProducts, topProducts, bottomProducts]);

  const performanceMatrix = useMemo(() => {
    return BIEngine.calculatePerformanceMatrix(filteredRows, dataset);
  }, [filteredRows, dataset]);

  const anomalies = useMemo(() => {
    return BIEngine.detectAnomalies(filteredRows, dataset);
  }, [filteredRows, dataset]);

  const segmentItems = useMemo(() => {
    return BIEngine.analyzeCustomerSegments(filteredRows, dataset);
  }, [filteredRows, dataset]);

  // Star Schema computation for metadata
  const starSchema = useMemo(() => {
    if (!dataset || filteredRows.length === 0) return null;
    return WarehouseBuilder.buildStarSchema(dataset, filteredRows);
  }, [dataset, filteredRows]);

  // AI Executive Summary Context & State
  const [aiSummary, setAiSummary] = useState<AIExecutiveSummary | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  const structuredContext = useMemo(() => {
    return buildStructuredAnalyticsContext(
      dataset,
      filteredRows,
      advancedFilters,
      executiveKPIs,
      regionalItems,
      categoryItems,
      topProducts,
      bottomProducts,
      [],
      anomalies,
      segmentItems
    );
  }, [
    dataset,
    filteredRows,
    advancedFilters,
    executiveKPIs,
    regionalItems,
    categoryItems,
    topProducts,
    bottomProducts,
    anomalies,
    segmentItems
  ]);

  const fetchAiSummary = async (skipCache: boolean = false) => {
    if (!dataset || filteredRows.length === 0) return;
    setAiLoading(true);
    try {
      const res = await GeminiClient.generateExecutiveSummary(structuredContext, skipCache);
      setAiSummary(res);
    } catch {
      // Handled by grounded fallback
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (dataset && filteredRows.length > 0) {
      fetchAiSummary(false);
    }
  }, [dataset?.name, filteredRows.length, advancedFilters]);

  // Revenue Trajectory Chart Config
  const revenueTrendConfig: ChartConfig = useMemo(() => ({
    id: 'dash-revenue-trend',
    title: 'Revenue & Gross Profit Trajectory',
    description: `Chronological ${executiveGranularity} trajectory with gross profit overlay`,
    chartType: 'area',
    dimension: primaryDate || 'Order Date',
    metric: primarySales || 'Sales',
    secondaryMetric: primaryProfit,
    aggregation: 'SUM',
    timeGranularity: executiveGranularity,
    showGrid: true,
    showLegend: true,
    height: 300
  }), [primaryDate, primarySales, primaryProfit, executiveGranularity]);

  // Active filter summary string for modals
  const activeFilterSummary = useMemo(() => {
    const parts: string[] = [];
    Object.entries(advancedFilters.categoricalFilters).forEach(([col, vals]) => {
      if (vals && vals.length > 0) parts.push(`${col}: ${vals.join(', ')}`);
    });
    if (advancedFilters.dateRange?.start || advancedFilters.dateRange?.end) {
      parts.push(`Date: ${advancedFilters.dateRange.start || 'Start'} to ${advancedFilters.dateRange.end || 'End'}`);
    }
    return parts.join(' | ') || 'All Data Records (Unfiltered)';
  }, [advancedFilters]);

  // Date range string for context bar
  const dateRangeStr = useMemo(() => {
    if (advancedFilters.dateRange?.start || advancedFilters.dateRange?.end) {
      return `${advancedFilters.dateRange.start || 'Start'} → ${advancedFilters.dateRange.end || 'End'}`;
    }
    return 'Jan 2026 – Dec 2026';
  }, [advancedFilters]);

  // Loading State
  if (isRefreshing) {
    return (
      <PageContainer 
        title="Executive Dashboard" 
        subtitle="Synchronizing analytical pipelines..."
      >
        <DashboardSkeleton />
      </PageContainer>
    );
  }

  // Empty state if no dataset loaded
  if (!dataset || dataset.rows.length === 0) {
    return (
      <PageContainer
        title="Executive Dashboard"
        subtitle="Monitor business performance, trends, profitability, and key opportunities from one unified view."
      >
        <EmptyState
          title="No Active Dataset Available"
          description="Upload a CSV dataset or load the benchmark enterprise sales dataset to activate real-time visual business intelligence."
          actionText="Upload Dataset"
          onAction={() => navigate('/upload')}
          secondaryActionText="Load Sample Dataset"
          onSecondaryAction={loadSampleDataset}
        />
      </PageContainer>
    );
  }

  // Empty state if active filters return 0 rows
  if (filteredRows.length === 0) {
    return (
      <PageContainer
        title="Executive Dashboard"
        subtitle="Monitor business performance, trends, profitability, and key opportunities from one unified view."
      >
        <EmptyState
          title="No Data Matches Active Filters"
          description="Zero records found matching your selected attribute filters. Reset filters to restore executive metrics."
          actionText="Reset All Filters"
          onAction={clearFilters}
        />
      </PageContainer>
    );
  }

  // Helper to render widget content by id
  const renderWidgetContent = (id: DashboardWidgetId) => {
    switch (id) {
      case 'kpi_cards':
        return <ExecutiveKPICardsGrid kpis={executiveKPIs} />;
      case 'performance_insights':
        return (
          <PerformanceInsightCards
            regions={regionalItems}
            categories={categoryItems}
            segments={segmentItems}
            onSelectRegion={handleSelectRegion}
            onSelectCategory={handleSelectCategory}
          />
        );
      case 'revenue_trajectory':
        return (
          <DashboardHeroTrendSection
            chartConfig={revenueTrendConfig}
            kpis={executiveKPIs}
            granularity={executiveGranularity}
            onGranularityChange={setExecutiveGranularity}
            hasDateColumn={Boolean(primaryDate)}
            filterSummary={activeFilterSummary}
          />
        );
      case 'category_performance':
        return (
          <CategoryPerformanceSection
            categories={categoryItems}
            selectedCategory={filters[primaryDims.categoryColumn || 'Category']?.selectedCategories?.[0]}
            onSelectCategory={handleSelectCategory}
          />
        );
      case 'regional_performance':
        return (
          <RegionalPerformanceSection
            regions={regionalItems}
            selectedRegion={selectedRegion !== 'all' ? selectedRegion : undefined}
            onSelectRegion={handleSelectRegion}
          />
        );
      case 'product_rankings':
        return (
          <ProductRankingSection
            products={productRankings}
            currentLimit={productLimit}
            currentMetric={productMetric}
            isTop={isTopProducts}
            onLimitChange={setProductLimit}
            onMetricChange={setProductMetric}
            onToggleTopBottom={setIsTopProducts}
            onSelectProduct={handleSelectProduct}
          />
        );
      case 'profitability_matrix':
        return (
          <PerformanceMatrixChart
            points={performanceMatrix}
            onSelectPoint={(label) => handleSelectProduct(label)}
          />
        );
      case 'customer_segments':
        return (
          <CustomerSegmentSection
            segments={segmentItems}
            selectedSegment={selectedSegment !== 'all' ? selectedSegment : undefined}
            onSelectSegment={(seg) => {
              if (primaryDims.segmentColumn) {
                setCategoricalFilter(primaryDims.segmentColumn, [seg]);
                setSelectedSegment(seg);
              }
            }}
          />
        );
      case 'business_alerts':
        return (
          <BusinessAlertsSection
            kpis={executiveKPIs}
            categories={categoryItems}
            underperformingProducts={bottomProducts}
            anomalies={anomalies}
            onViewDeepDive={() => navigate('/insights')}
          />
        );
      case 'statistical_anomalies':
        return (
          <AnomalyDetectionTable
            anomalies={anomalies}
            onSelectEntity={(entity) => handleSelectProduct(entity)}
          />
        );
      case 'ai_executive_brief':
        return (
          <AIExecutiveSummaryCard
            summary={aiSummary}
            context={structuredContext}
            loading={aiLoading}
            onRefresh={() => fetchAiSummary(true)}
          />
        );
      case 'operational_context':
        return (
          <OperationalContextRow
            dataset={dataset}
            factRowCount={starSchema?.factTable.rows.length || dataset.rows.length}
            dimensionCount={starSchema?.dimensions.length || 5}
          />
        );
      default:
        return null;
    }
  };

  return (
    <PageContainer
      title="Executive Dashboard"
      subtitle="Monitor business performance, trends, profitability, and key opportunities from one unified view."
      fullWidth={true}
      breadcrumbs={[
        { label: 'Overview', onClick: () => navigate('/') },
        { label: 'Executive Dashboard' }
      ]}
      metadata={
        <>
          <span className="font-semibold text-slate-700 dark:text-slate-300">Engine: In-Memory BI Aggregator</span>
          <span>·</span>
          <span>Cadence: {executiveGranularity.toUpperCase()}</span>
          <span>·</span>
          <span>{filteredRows.length.toLocaleString()} of {dataset.statistics.rowCount.toLocaleString()} records</span>
          {visibleWidgets.length < widgets.length && (
            <>
              <span>·</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                Custom View ({visibleWidgets.length} widgets)
              </span>
            </>
          )}
        </>
      }
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={isCustomizing ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setIsCustomizing(!isCustomizing)}
            leftIcon={<SlidersHorizontal className="h-3.5 w-3.5" />}
          >
            {isCustomizing ? 'Done Customizing' : 'Customize Layout'}
            {widgets.filter(w => !w.visible).length > 0 && !isCustomizing && (
              <span className="ml-1.5 rounded-full bg-indigo-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {widgets.filter(w => w.visible).length}/{widgets.length}
              </span>
            )}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={refreshData}
            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
          >
            Synchronize
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/insights')}
            leftIcon={<Sparkles className="h-3.5 w-3.5 text-indigo-500" />}
          >
            BI Deep Dive
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/reports')}
            leftIcon={<FileText className="h-3.5 w-3.5" />}
          >
            Generate Report
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Customization Toolbar when editing layout */}
        {isCustomizing && (
          <DashboardCustomizerToolbar
            isCustomizing={isCustomizing}
            onToggleCustomizing={() => setIsCustomizing(!isCustomizing)}
            widgets={widgets}
            onApplyPreset={handleApplyPreset}
            onReset={handleResetLayout}
            onToggleVisibility={handleToggleWidgetVisibility}
            onResize={handleResizeWidget}
          />
        )}

        {/* 1. DATASET CONTEXT BAR (Requirement 4) */}
        <DatasetContextBar
          dataset={dataset}
          filteredCount={filteredRows.length}
          totalCount={dataset.statistics.rowCount}
          activeFilterCount={activeFilterCount}
          dateRangeStr={dateRangeStr}
        />

        {/* 2. GLOBAL FILTER BAR (Requirement 5) */}
        <GlobalFilterBar />

        {/* 3. HIERARCHICAL DRILL-DOWN BREADCRUMBS */}
        <ExecutiveBreadcrumbs
          hierarchy={hierarchy}
          onClearAll={() => handleDrillBreadcrumbNavigate('root')}
          onNavigateToLevel={handleDrillBreadcrumbNavigate}
        />

        {/* 4. CUSTOMIZABLE & REORDERABLE ANALYTIC WIDGETS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start w-full min-w-0">
          {visibleWidgets.map((w, idx) => (
            <DraggableWidgetWrapper
              key={w.id}
              widget={w}
              index={idx}
              totalVisible={visibleWidgets.length}
              isCustomizing={isCustomizing}
              onMove={handleMoveWidget}
              onResize={handleResizeWidget}
              onToggleVisibility={handleToggleWidgetVisibility}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              isDraggingCurrent={draggedIndex === idx}
              isDragOverCurrent={dragOverIndex === idx && draggedIndex !== idx}
            >
              {renderWidgetContent(w.id)}
            </DraggableWidgetWrapper>
          ))}
        </div>
      </div>
    </PageContainer>
  );
};
