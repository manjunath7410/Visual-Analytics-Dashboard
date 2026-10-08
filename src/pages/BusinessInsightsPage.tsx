import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Lightbulb, 
  Award, 
  TrendingUp, 
  AlertTriangle, 
  MessageSquare, 
  Calendar, 
  RotateCcw, 
  CheckCircle2, 
  Activity, 
  Layers, 
  ShieldCheck, 
  RefreshCw, 
  FileText,
  Download,
  BarChart3,
  Globe,
  Package,
  Clock,
  PieChart,
  Info,
  ChevronRight,
  Filter
} from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { EmptyState } from '../components/common/EmptyState';
import { GlobalFilterBar } from '../components/common/GlobalFilterBar';
import { useData } from '../context/DataContext';
import { AnalyticsEngine } from '../utils/analytics/analyticsEngine';
import { BIEngine } from '../utils/analytics/biEngine';
import { TimeGranularity } from '../types/analytics';
import { ChartConfig } from '../types/visualization';
import { buildStructuredAnalyticsContext } from '../services/gemini/analyticsContextBuilder';
import { GeminiClient } from '../services/gemini/geminiClient';
import { 
  AIExecutiveSummary, 
  AIKeyFinding, 
  AITrendExplanation, 
  AIAnomalyExplanation, 
  AIBusinessRecommendation, 
  AIConfigStatus 
} from '../types/gemini';
import { AIStatusBanner } from '../components/ai/AIStatusBanner';
import { AIExecutiveSummaryCard } from '../components/ai/AIExecutiveSummaryCard';
import { AIKeyFindingsSection } from '../components/ai/AIKeyFindingsSection';
import { AITrendExplanationCard } from '../components/ai/AITrendExplanationCard';
import { AIAnomalyExplanationSection } from '../components/ai/AIAnomalyExplanationSection';
import { AIRecommendationsSection } from '../components/ai/AIRecommendationsSection';
import { AskTheDataChat } from '../components/ai/AskTheDataChat';
import { RegionalPerformanceSection } from '../components/bi/RegionalPerformanceSection';
import { CategoryPerformanceSection } from '../components/bi/CategoryPerformanceSection';
import { ProductRankingSection } from '../components/bi/ProductRankingSection';
import { PerformanceMatrixChart } from '../components/bi/PerformanceMatrixChart';
import { CustomerSegmentSection } from '../components/bi/CustomerSegmentSection';
import { ExecutiveKPICardsGrid } from '../components/bi/ExecutiveKPICardsGrid';
import { PerformanceScorecard } from '../components/bi/PerformanceScorecard';
import { GrowthAnalysisSection } from '../components/bi/GrowthAnalysisSection';
import { AnomalyDetectionTable } from '../components/bi/AnomalyDetectionTable';
import { DashboardHeroTrendSection } from '../components/dashboard/DashboardHeroTrendSection';
import { BusinessAlertsSection } from '../components/dashboard/BusinessAlertsSection';
import { DatasetContextBar } from '../components/dashboard/DatasetContextBar';
import { useToast } from '../context/ToastContext';

export const BusinessInsightsPage: React.FC = () => {
  const { 
    dataset, 
    filteredRows, 
    loadSampleDataset,
    advancedFilters,
    clearFilters,
    activeFilterCount,
    filters,
    selectedRegion,
    setSelectedRegion,
    selectedSegment,
    setSelectedSegment,
    setCategoricalFilter
  } = useData();

  const navigate = useNavigate();
  const { success, info } = useToast();

  // Active view tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'dossier' | 'ask_data' | 'matrix_segments' | 'anomalies_alerts'
  >('overview');

  // Time Granularity
  const [biGranularity, setBiGranularity] = useState<TimeGranularity>('monthly');

  // Product Ranking Controls
  const [productLimit, setProductLimit] = useState<number>(5);
  const [productMetric, setProductMetric] = useState<'sales' | 'profit' | 'quantity' | 'orders'>('sales');
  const [isTopProducts, setIsTopProducts] = useState<boolean>(true);

  // AI State
  const [aiStatus, setAiStatus] = useState<AIConfigStatus | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [executiveSummary, setExecutiveSummary] = useState<AIExecutiveSummary | null>(null);
  const [keyFindings, setKeyFindings] = useState<AIKeyFinding[]>([]);
  const [trendExplanation, setTrendExplanation] = useState<AITrendExplanation | null>(null);
  const [anomalyExplanation, setAnomalyExplanation] = useState<AIAnomalyExplanation | null>(null);
  const [recommendations, setRecommendations] = useState<AIBusinessRecommendation[]>([]);

  // Classify columns dynamically
  const classifications = useMemo(() => {
    if (!dataset) return [];
    return AnalyticsEngine.classifyColumns(dataset.columns, filteredRows);
  }, [dataset, filteredRows]);

  const primarySales = useMemo(() => AnalyticsEngine.findPrimarySalesColumn(classifications), [classifications]);
  const primaryProfit = useMemo(() => AnalyticsEngine.findPrimaryProfitColumn(classifications), [classifications]);
  const primaryDate = useMemo(() => AnalyticsEngine.findPrimaryDateColumn(classifications), [classifications]);
  const primaryDims = useMemo(() => AnalyticsEngine.findPrimaryDimensions(classifications), [classifications]);

  // BI Analysis Engine Computations (Authoritative deterministic math)
  const executiveKPIs = useMemo(() => {
    return BIEngine.calculateExecutiveKPICards(filteredRows, dataset, biGranularity);
  }, [filteredRows, dataset, biGranularity]);

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

  const trendItems = useMemo(() => {
    return BIEngine.analyzeTrends(filteredRows, dataset, biGranularity);
  }, [filteredRows, dataset, biGranularity]);

  const anomalies = useMemo(() => {
    return BIEngine.detectAnomalies(filteredRows, dataset);
  }, [filteredRows, dataset]);

  const segmentItems = useMemo(() => {
    return BIEngine.analyzeCustomerSegments(filteredRows, dataset);
  }, [filteredRows, dataset]);

  const performanceMatrix = useMemo(() => {
    return BIEngine.calculatePerformanceMatrix(filteredRows, dataset);
  }, [filteredRows, dataset]);

  // Construct structured analytics context
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
      trendItems,
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
    trendItems,
    anomalies,
    segmentItems
  ]);

  // Check Gemini Status on mount
  useEffect(() => {
    GeminiClient.checkStatus().then(status => {
      setAiStatus(status);
    });
  }, []);

  // Run full AI Analysis
  const runAIAnalysis = async (skipCache: boolean = false) => {
    if (!dataset || filteredRows.length === 0) return;
    setAiLoading(true);
    setAiError(null);

    try {
      const [summaryRes, findingsRes, trendsRes, anomaliesRes, recsRes] = await Promise.all([
        GeminiClient.generateExecutiveSummary(structuredContext, skipCache).catch(() => null),
        GeminiClient.generateKeyFindings(structuredContext, skipCache).catch(() => []),
        GeminiClient.explainTrends(structuredContext, skipCache).catch(() => null),
        GeminiClient.explainAnomalies(structuredContext, skipCache).catch(() => null),
        GeminiClient.generateRecommendations(structuredContext, skipCache).catch(() => []),
      ]);

      if (summaryRes) setExecutiveSummary(summaryRes);
      if (findingsRes) setKeyFindings(findingsRes);
      if (trendsRes) setTrendExplanation(trendsRes);
      if (anomaliesRes) setAnomalyExplanation(anomaliesRes);
      if (recsRes) setRecommendations(recsRes);

      if (!summaryRes && !findingsRes.length && !trendsRes && !anomaliesRes && !recsRes.length) {
        setAiError('AI response could not be processed. Your analytical data is still available.');
      } else if (skipCache) {
        success('Analysis Refreshed', 'AI Business Analyst synthesized updated briefing');
      }
    } catch (err: any) {
      console.error('AI Analysis failed:', err);
      setAiError(err.message || 'AI response could not be processed. Your analytical data is still available.');
    } finally {
      setAiLoading(false);
    }
  };

  // Trigger AI synthesis when dataset or filters change
  useEffect(() => {
    if (dataset && filteredRows.length > 0) {
      runAIAnalysis(false);
    }
  }, [dataset?.name, filteredRows.length, advancedFilters]);

  // Chart config for hero trend
  const revenueTrendConfig: ChartConfig = useMemo(() => ({
    id: 'bi-revenue-trend',
    title: 'Revenue & Gross Profit Trajectory',
    description: `Chronological ${biGranularity} trajectory with gross profit overlay`,
    chartType: 'area',
    dimension: primaryDate || 'Order Date',
    metric: primarySales || 'Sales',
    secondaryMetric: primaryProfit,
    aggregation: 'SUM',
    timeGranularity: biGranularity,
    showGrid: true,
    showLegend: true,
    height: 300
  }), [primaryDate, primarySales, primaryProfit, biGranularity]);

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

  // Date range string for context bar
  const dateRangeStr = useMemo(() => {
    if (advancedFilters.dateRange?.start || advancedFilters.dateRange?.end) {
      return `${advancedFilters.dateRange.start || 'Start'} → ${advancedFilters.dateRange.end || 'End'}`;
    }
    return 'All Active Time';
  }, [advancedFilters]);

  // Empty state if no dataset loaded
  if (!dataset || dataset.rows.length === 0) {
    return (
      <PageContainer
        title="AI Business Analyst"
        subtitle="Ask questions, understand performance and discover actionable insights from your data."
        breadcrumbs={[
          { label: 'Analytics', onClick: () => navigate('/analytics') },
          { label: 'AI Business Analyst' }
        ]}
      >
        <EmptyState
          title="No Active Dataset Available"
          description="Upload a CSV dataset or load the benchmark commercial sales data to activate the AI Business Analyst & Business Intelligence suite."
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
        title="AI Business Analyst"
        subtitle="Ask questions, understand performance and discover actionable insights from your data."
        breadcrumbs={[
          { label: 'Analytics', onClick: () => navigate('/analytics') },
          { label: 'AI Business Analyst' }
        ]}
      >
        <EmptyState
          title="No Records Match Active Filters"
          description="Your current global filter combination returned zero rows. Clear filters to restore AI Business Analyst and metrics."
          actionText="Reset All Filters"
          onAction={clearFilters}
        />
      </PageContainer>
    );
  }

  const tabs = [
    { id: 'overview', label: 'BI Performance Overview', icon: BarChart3 },
    { id: 'dossier', label: 'AI Executive Dossier & Findings', icon: Sparkles },
    { id: 'ask_data', label: 'Ask the Data (Natural Language)', icon: MessageSquare },
    { id: 'matrix_segments', label: 'Profitability Matrix & Cohorts', icon: PieChart },
    { id: 'anomalies_alerts', label: 'Anomaly Monitor & Alerts', icon: AlertTriangle }
  ];

  return (
    <PageContainer
      title="AI Business Analyst"
      subtitle="Ask questions, understand performance and discover actionable insights from your data."
      fullWidth={true}
      breadcrumbs={[
        { label: 'Analytics', onClick: () => navigate('/analytics') },
        { label: 'AI Business Analyst' }
      ]}
      metadata={
        <>
          <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold">
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            <span>AI Analyst Ready</span>
          </span>
          <span>·</span>
          <span>Engine: Deterministic BI Aggregator</span>
          <span>·</span>
          <span>Scope: {filteredRows.length.toLocaleString()} records</span>
          <span>·</span>
          <span>Cadence: {biGranularity.toUpperCase()}</span>
        </>
      }
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {/* Executive Date Control */}
          <div className="hidden sm:flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 text-xs dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
            <Calendar className="h-3.5 w-3.5 text-slate-400 ml-1.5 mr-0.5" />
            {(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'] as TimeGranularity[]).map((g) => (
              <button
                key={g}
                onClick={() => setBiGranularity(g)}
                disabled={!primaryDate}
                className={`rounded px-2 py-0.5 font-semibold capitalize transition-colors cursor-pointer ${
                  biGranularity === g
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                } disabled:opacity-40`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Mobile Granularity Select */}
          <div className="sm:hidden relative">
            <select
              value={biGranularity}
              onChange={(e) => setBiGranularity(e.target.value as TimeGranularity)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 capitalize cursor-pointer"
            >
              {(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'] as TimeGranularity[]).map((g) => (
                <option key={g} value={g} className="capitalize">
                  {g}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => runAIAnalysis(true)}
            disabled={aiLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`h-3.5 w-3.5 text-indigo-500 ${aiLoading ? 'animate-spin' : ''}`} />
            <span>{aiLoading ? 'Analyzing...' : 'Refresh AI Analysis'}</span>
          </button>

          <button
            onClick={() => navigate('/reports')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition-colors cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Generate Report</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* 1. DATASET CONTEXT BAR & TRUST INDICATOR (Requirements 4 & 5) */}
        <DatasetContextBar
          dataset={dataset}
          filteredCount={filteredRows.length}
          totalCount={dataset.statistics.rowCount}
          activeFilterCount={activeFilterCount}
          dateRangeStr={dateRangeStr}
        />

        {/* 2. GLOBAL BI FILTER BAR */}
        <GlobalFilterBar />

        {/* 3. AI STATUS BANNER */}
        <AIStatusBanner
          status={aiStatus}
          loading={aiLoading}
          error={aiError}
          onRetry={() => runAIAnalysis(true)}
        />

        {/* 4. NAVIGATION TABS */}
        <div className="flex items-center gap-1.5 border-b border-slate-200/80 pb-2 dark:border-slate-800 overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap min-h-[38px] ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Scorecard */}
            <section aria-label="Performance Scorecard">
              <PerformanceScorecard
                kpis={executiveKPIs}
                regions={regionalItems}
                categories={categoryItems}
              />
            </section>

            {/* KPI Grid */}
            <section aria-label="Executive KPIs">
              <ExecutiveKPICardsGrid kpis={executiveKPIs} />
            </section>

            {/* Hero Trend */}
            <section aria-label="Revenue & Profit Trajectory">
              <DashboardHeroTrendSection
                chartConfig={revenueTrendConfig}
                kpis={executiveKPIs}
                granularity={biGranularity}
                onGranularityChange={setBiGranularity}
                hasDateColumn={Boolean(primaryDate)}
              />
            </section>

            {/* Regional & Category Breakdown */}
            <section aria-label="Regional and Category Performance" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <RegionalPerformanceSection
                regions={regionalItems}
                selectedRegion={selectedRegion !== 'all' ? selectedRegion : undefined}
                onSelectRegion={handleSelectRegion}
              />

              <CategoryPerformanceSection
                categories={categoryItems}
                selectedCategory={filters[primaryDims.categoryColumn || 'Category']?.selectedCategories?.[0]}
                onSelectCategory={handleSelectCategory}
              />
            </section>

            {/* Product Rankings */}
            <section aria-label="Product Rankings">
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
            </section>

            {/* Growth Analysis */}
            <section aria-label="Growth Analysis">
              <GrowthAnalysisSection kpis={executiveKPIs} />
            </section>

            {/* Business Alerts */}
            <section aria-label="Business Alerts">
              <BusinessAlertsSection
                kpis={executiveKPIs}
                categories={categoryItems}
                underperformingProducts={bottomProducts}
                anomalies={anomalies}
                onViewDeepDive={() => setActiveTab('dossier')}
              />
            </section>
          </div>
        )}

        {/* TAB 2: AI DOSSIER (Requirements 6, 7, 13, 15) */}
        {activeTab === 'dossier' && (
          <div className="space-y-6">
            {/* Executive Summary */}
            <section aria-label="Executive Brief">
              <AIExecutiveSummaryCard
                summary={executiveSummary}
                context={structuredContext}
                loading={aiLoading}
                onRefresh={() => runAIAnalysis(true)}
              />
            </section>

            {/* Key Findings */}
            <section aria-label="Key Findings">
              <AIKeyFindingsSection
                findings={keyFindings}
                loading={aiLoading}
              />
            </section>

            {/* Trend Explanations */}
            <section aria-label="Trend Explanations">
              <AITrendExplanationCard
                explanation={trendExplanation}
                loading={aiLoading}
              />
            </section>

            {/* Strategic Recommendations */}
            <section aria-label="Strategic Recommendations">
              <AIRecommendationsSection
                recommendations={recommendations}
                loading={aiLoading}
              />
            </section>
          </div>
        )}

        {/* TAB 3: ASK THE DATA (Requirements 8, 9, 10, 11) */}
        {activeTab === 'ask_data' && (
          <section aria-label="Ask the Data Chat">
            <AskTheDataChat context={structuredContext} />
          </section>
        )}

        {/* TAB 4: PROFITABILITY MATRIX & SEGMENTS */}
        {activeTab === 'matrix_segments' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <PerformanceMatrixChart
                points={performanceMatrix}
                onSelectPoint={(label) => handleSelectProduct(label)}
              />

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
            </div>

            {/* Product Rankings */}
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
          </div>
        )}

        {/* TAB 5: ANOMALIES & ALERTS */}
        {activeTab === 'anomalies_alerts' && (
          <div className="space-y-6">
            <section aria-label="Statistical Anomalies">
              <AnomalyDetectionTable
                anomalies={anomalies}
                onSelectEntity={(entity) => handleSelectProduct(entity)}
              />
            </section>

            {anomalyExplanation && (
              <section aria-label="AI Anomaly Interpretation">
                <AIAnomalyExplanationSection
                  explanation={anomalyExplanation}
                  loading={aiLoading}
                />
              </section>
            )}

            <section aria-label="Needs Attention Alerts">
              <BusinessAlertsSection
                kpis={executiveKPIs}
                categories={categoryItems}
                underperformingProducts={bottomProducts}
                anomalies={anomalies}
                onViewDeepDive={() => setActiveTab('dossier')}
              />
            </section>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
