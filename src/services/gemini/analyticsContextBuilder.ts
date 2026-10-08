import { Dataset, AdvancedFilterState } from '../../types/dataset';
import { 
  ExecutiveKPI, 
  RegionalPerformanceItem, 
  CategoryPerformanceItem, 
  ProductRankingItem, 
  TrendAnalysisItem, 
  DetectedAnomaly, 
  CustomerSegmentItem 
} from '../../types/businessIntelligence';
import { StructuredAnalyticsContext } from '../../types/gemini';
import { BIEngine } from '../../utils/analytics/biEngine';

/**
 * Builds a compact, privacy-safe structured analytics context.
 * Strict token efficiency: Aggregations, metrics, and trends are included;
 * raw rows, personal data, and extraneous records are strictly excluded.
 */
export function buildStructuredAnalyticsContext(
  dataset: Dataset | null,
  filteredRows: Record<string, any>[],
  advancedFilters: AdvancedFilterState,
  kpis: ExecutiveKPI[],
  regions: RegionalPerformanceItem[],
  categories: CategoryPerformanceItem[],
  topProducts: ProductRankingItem[],
  bottomProducts: ProductRankingItem[],
  trends: TrendAnalysisItem[],
  anomalies: DetectedAnomaly[],
  segments: CustomerSegmentItem[]
): StructuredAnalyticsContext {
  const totalRows = dataset ? dataset.statistics.rowCount : 0;
  const filteredCount = filteredRows.length;
  const filteredPct = totalRows > 0 ? Number(((filteredCount / totalRows) * 100).toFixed(1)) : 100;

  // KPIs mapping
  const revKPI = kpis.find(k => k.id === 'kpi-revenue');
  const profKPI = kpis.find(k => k.id === 'kpi-profit');
  const marginKPI = kpis.find(k => k.id === 'kpi-margin');
  const ordKPI = kpis.find(k => k.id === 'kpi-orders');
  const aovKPI = kpis.find(k => k.id === 'kpi-aov');
  const qtyKPI = kpis.find(k => k.id === 'kpi-quantity');

  return {
    datasetSummary: {
      datasetName: dataset ? dataset.name : 'Unknown Dataset',
      rowCount: filteredCount,
      columnCount: dataset ? dataset.columns.length : 0,
      isSample: Boolean(dataset?.isSample)
    },
    activeFilters: {
      region: advancedFilters.categoricalFilters['Region'],
      category: advancedFilters.categoricalFilters['Category'],
      segment: advancedFilters.categoricalFilters['Customer Segment'] || advancedFilters.categoricalFilters['Segment'],
      product: advancedFilters.categoricalFilters['Product'],
      dateRange: advancedFilters.dateRange ? {
        start: advancedFilters.dateRange.start,
        end: advancedFilters.dateRange.end,
        preset: advancedFilters.dateRange.preset
      } : undefined,
      searchTerm: advancedFilters.searchTerm || undefined,
      filteredRowCount: filteredCount,
      totalRowCount: totalRows,
      filteredPercentage: filteredPct
    },
    kpis: {
      revenue: revKPI ? {
        current: revKPI.currentValue,
        previous: revKPI.previousValue,
        formatted: revKPI.formattedCurrent,
        changePercent: revKPI.percentageChange
      } : undefined,
      profit: profKPI ? {
        current: profKPI.currentValue,
        previous: profKPI.previousValue,
        formatted: profKPI.formattedCurrent,
        changePercent: profKPI.percentageChange
      } : undefined,
      profitMargin: marginKPI ? {
        current: marginKPI.currentValue,
        previous: marginKPI.previousValue,
        formatted: marginKPI.formattedCurrent,
        changePercent: marginKPI.percentageChange
      } : undefined,
      orders: ordKPI ? {
        current: ordKPI.currentValue,
        previous: ordKPI.previousValue,
        formatted: ordKPI.formattedCurrent,
        changePercent: ordKPI.percentageChange
      } : undefined,
      aov: aovKPI ? {
        current: aovKPI.currentValue,
        previous: aovKPI.previousValue,
        formatted: aovKPI.formattedCurrent,
        changePercent: aovKPI.percentageChange
      } : undefined,
      quantity: qtyKPI ? {
        current: qtyKPI.currentValue,
        previous: qtyKPI.previousValue,
        formatted: qtyKPI.formattedCurrent,
        changePercent: qtyKPI.percentageChange
      } : undefined
    },
    rankings: {
      topRegions: regions.slice(0, 5).map(r => ({
        rank: r.rank,
        region: r.region,
        sales: r.sales,
        profit: r.profit,
        margin: r.margin,
        status: r.status,
        score: r.performanceScore
      })),
      topCategories: categories.slice(0, 5).map(c => ({
        rank: c.rank,
        category: c.category,
        sales: c.sales,
        profit: c.profit,
        margin: c.profitMargin,
        share: c.share
      })),
      topProducts: topProducts.slice(0, 5).map(p => ({
        rank: p.rank,
        product: p.product,
        value: p.formattedValue,
        metric: p.metric
      })),
      underperformingProducts: bottomProducts.slice(0, 5).map(p => ({
        rank: p.rank,
        product: p.product,
        value: p.formattedValue,
        metric: p.metric,
        margin: p.margin
      }))
    },
    trends: trends.map(t => ({
      period: t.period,
      value: t.currentValue,
      formattedValue: BIEngine.formatCurrency(t.currentValue),
      growthRate: t.growthRate,
      direction: t.direction,
      indicator: t.indicator
    })),
    anomalies: anomalies.slice(0, 5).map(a => ({
      periodOrEntity: a.periodOrEntity,
      metric: a.metric,
      value: a.formattedValue,
      expectedRange: a.formattedExpectedRange,
      deviationPercent: a.deviationPercent,
      status: a.status,
      context: a.context
    })),
    customerSegments: segments.map(s => ({
      segment: s.segment,
      sales: s.sales,
      margin: s.margin,
      orders: s.orders,
      share: s.share
    }))
  };
}
