import { Dataset } from '../../types/dataset';
import { TimeGranularity } from '../../types/analytics';
import { AnalyticsEngine } from './analyticsEngine';
import { 
  ExecutiveKPI, 
  RegionalPerformanceItem, 
  CategoryPerformanceItem, 
  ProductRankingItem, 
  PerformanceMatrixPoint, 
  TrendAnalysisItem, 
  DetectedAnomaly, 
  CustomerSegmentItem, 
  ExecutiveSummaryReport,
  TrendDirection,
  KPIStatus,
  PerformanceTier
} from '../../types/businessIntelligence';

/**
 * BI Analysis Engine (Phase 8)
 * Transforms filtered analytical results into executive-level performance intelligence.
 * All computations are dynamic, transparent, and derived strictly from active dataset rows.
 */
export class BIEngine {
  // Documented threshold for "Stable" trend (Requirement 10)
  public static readonly STABLE_THRESHOLD_PERCENT = 1.0; // Changes within [-1.0%, +1.0%] are labeled "Stable"

  /**
   * Safe percentage change calculation handling zero denominator
   * Formula: ((current - previous) / previous) * 100
   */
  public static calculatePercentageChange(current: number, previous: number | null): number | null {
    if (previous === null || previous === undefined || isNaN(previous)) return null;
    if (previous === 0) {
      if (current === 0) return 0;
      return current > 0 ? 100 : -100;
    }
    const change = ((current - previous) / Math.abs(previous)) * 100;
    if (isNaN(change) || !isFinite(change)) return 0;
    return Number(change.toFixed(1));
  }

  /**
   * Determine trend direction based on transparent percentage change threshold
   */
  public static determineTrendDirection(changePercent: number | null): TrendDirection {
    if (changePercent === null || isNaN(changePercent)) return 'unavailable';
    if (Math.abs(changePercent) <= BIEngine.STABLE_THRESHOLD_PERCENT) return 'stable';
    return changePercent > 0 ? 'increasing' : 'decreasing';
  }

  /**
   * Determine KPI status: Positive, Negative, Neutral, Unavailable
   */
  public static determineKPIStatus(changePercent: number | null, isHigherBetter: boolean = true): KPIStatus {
    if (changePercent === null || isNaN(changePercent)) return 'unavailable';
    if (Math.abs(changePercent) <= BIEngine.STABLE_THRESHOLD_PERCENT) return 'neutral';
    
    if (isHigherBetter) {
      return changePercent > 0 ? 'positive' : 'negative';
    } else {
      return changePercent < 0 ? 'positive' : 'negative';
    }
  }

  /**
   * Format numbers gracefully without NaN, Infinity, null, or undefined
   */
  public static formatCurrency(val: number | null | undefined, prefix: string = '$'): string {
    if (val === null || val === undefined || isNaN(val) || !isFinite(val)) return `${prefix}0`;
    const absVal = Math.abs(val);
    const sign = val < 0 ? '-' : '';
    if (absVal >= 1_000_000) {
      return `${sign}${prefix}${(absVal / 1_000_000).toFixed(2)}M`;
    }
    if (absVal >= 1_000) {
      return `${sign}${prefix}${(absVal / 1_000).toFixed(1)}K`;
    }
    return `${sign}${prefix}${absVal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }

  public static formatNumber(val: number | null | undefined): string {
    if (val === null || val === undefined || isNaN(val) || !isFinite(val)) return '0';
    return Math.round(val).toLocaleString('en-US');
  }

  public static formatPercent(val: number | null | undefined): string {
    if (val === null || val === undefined || isNaN(val) || !isFinite(val)) return '0.0%';
    const sign = val > 0 ? '+' : '';
    return `${sign}${val.toFixed(1)}%`;
  }

  /**
   * 1. Calculate Executive KPI Cards with Period Comparison
   */
  public static calculateExecutiveKPICards(
    rows: Record<string, any>[],
    dataset: Dataset | null,
    granularity: TimeGranularity = 'monthly'
  ): ExecutiveKPI[] {
    if (!dataset || rows.length === 0) {
      return this.getEmptyKPICards();
    }

    const classifications = AnalyticsEngine.classifyColumns(dataset.columns, rows);
    const salesCol = AnalyticsEngine.findPrimarySalesColumn(classifications);
    const profitCol = AnalyticsEngine.findPrimaryProfitColumn(classifications);
    const dateCol = AnalyticsEngine.findPrimaryDateColumn(classifications);
    const quantityCol = classifications.find(c => 
      c.isNumeric && (c.name.toLowerCase().includes('quantity') || c.name.toLowerCase().includes('qty') || c.name.toLowerCase().includes('units'))
    )?.name;

    // Time-series breakdown for period-over-period comparison
    let currentPeriodRows = rows;
    let previousPeriodRows: Record<string, any>[] | null = null;
    let periodLabel = 'vs benchmark';

    if (dateCol) {
      const timePoints = AnalyticsEngine.aggregateTimeSeries(rows, dateCol, salesCol || undefined, granularity, 'SUM');
      if (timePoints.length >= 2) {
        const latestPeriod = timePoints[timePoints.length - 1].period;
        const priorPeriod = timePoints[timePoints.length - 2].period;

        periodLabel = `vs ${priorPeriod}`;
        // Bucket rows by period
        const periodMap = new Map<string, Record<string, any>[]>();
        rows.forEach(r => {
          const rawDate = r[dateCol];
          if (rawDate) {
            const parsed = new Date(rawDate);
            if (!isNaN(parsed.getTime())) {
              let key = '';
              if (granularity === 'yearly') key = `${parsed.getFullYear()}`;
              else if (granularity === 'quarterly') key = `Q${Math.floor(parsed.getMonth() / 3) + 1} ${parsed.getFullYear()}`;
              else key = `${parsed.toLocaleString('en-US', { month: 'short' })} ${parsed.getFullYear()}`;
              
              if (!periodMap.has(key)) periodMap.set(key, []);
              periodMap.get(key)!.push(r);
            }
          }
        });

        currentPeriodRows = periodMap.get(latestPeriod) || rows;
        previousPeriodRows = periodMap.get(priorPeriod) || null;
      }
    }

    const kpiCards: ExecutiveKPI[] = [];

    // Helper to build a KPI card
    const buildCard = (
      id: string,
      title: string,
      currentVal: number,
      previousVal: number | null,
      prefix: string = '',
      suffix: string = '',
      isCurrency: boolean = false,
      isHigherBetter: boolean = true,
      explanationGenerator?: (changePct: number | null) => string
    ): ExecutiveKPI => {
      const pctChange = BIEngine.calculatePercentageChange(currentVal, previousVal);
      const absChange = previousVal !== null ? currentVal - previousVal : null;
      const trend = BIEngine.determineTrendDirection(pctChange);
      const status = BIEngine.determineKPIStatus(pctChange, isHigherBetter);

      let formattedCurrent = isCurrency 
        ? BIEngine.formatCurrency(currentVal, prefix || '$') 
        : `${prefix}${BIEngine.formatNumber(currentVal)}${suffix}`;
      
      let formattedPrevious = previousVal !== null 
        ? (isCurrency ? BIEngine.formatCurrency(previousVal, prefix || '$') : `${prefix}${BIEngine.formatNumber(previousVal)}${suffix}`)
        : null;

      let formattedAbs = absChange !== null
        ? (isCurrency ? BIEngine.formatCurrency(absChange, prefix || '$') : `${absChange > 0 ? '+' : ''}${BIEngine.formatNumber(absChange)}${suffix}`)
        : null;

      const explanation = explanationGenerator 
        ? explanationGenerator(pctChange)
        : (pctChange !== null 
            ? `${Math.abs(pctChange)}% ${pctChange >= 0 ? 'expansion' : 'contraction'} ${periodLabel}`
            : 'Sufficient chronological baseline required for comparison');

      return {
        id,
        title,
        currentValue: currentVal,
        previousValue: previousVal,
        formattedCurrent,
        formattedPrevious,
        absoluteChange: absChange,
        formattedAbsoluteChange: formattedAbs,
        percentageChange: pctChange,
        trendDirection: trend,
        status,
        periodLabel,
        shortExplanation: explanation,
        prefix,
        suffix,
        isAvailable: true
      };
    };

    // 1. Total Revenue / Sales
    if (salesCol) {
      const curSales = AnalyticsEngine.sum(currentPeriodRows, salesCol);
      const prevSales = previousPeriodRows ? AnalyticsEngine.sum(previousPeriodRows, salesCol) : null;
      kpiCards.push(buildCard(
        'kpi-revenue',
        'Total Revenue',
        curSales,
        prevSales,
        '$',
        '',
        true,
        true,
        pct => pct !== null ? `${pct >= 0 ? 'Surged' : 'Contracted'} by ${Math.abs(pct)}% ${periodLabel}` : 'Total recognized sales revenue'
      ));
    }

    // 2. Total Profit
    if (profitCol) {
      const curProfit = AnalyticsEngine.sum(currentPeriodRows, profitCol);
      const prevProfit = previousPeriodRows ? AnalyticsEngine.sum(previousPeriodRows, profitCol) : null;
      kpiCards.push(buildCard(
        'kpi-profit',
        'Total Profit',
        curProfit,
        prevProfit,
        '$',
        '',
        true,
        true,
        pct => pct !== null ? `Net profitability shifted ${pct >= 0 ? '+' : ''}${pct}% ${periodLabel}` : 'Operating gross profit contribution'
      ));
    }

    // 3. Profit Margin (%)
    if (salesCol && profitCol) {
      const curSales = AnalyticsEngine.sum(currentPeriodRows, salesCol);
      const curProfit = AnalyticsEngine.sum(currentPeriodRows, profitCol);
      const curMargin = curSales > 0 ? (curProfit / curSales) * 100 : 0;

      let prevMargin: number | null = null;
      if (previousPeriodRows) {
        const prevSales = AnalyticsEngine.sum(previousPeriodRows, salesCol);
        const prevProfit = AnalyticsEngine.sum(previousPeriodRows, profitCol);
        prevMargin = prevSales > 0 ? (prevProfit / prevSales) * 100 : 0;
      }

      const pctChange = prevMargin !== null ? curMargin - prevMargin : null;
      const trend = BIEngine.determineTrendDirection(pctChange);
      const status = BIEngine.determineKPIStatus(pctChange, true);

      kpiCards.push({
        id: 'kpi-margin',
        title: 'Profit Margin',
        currentValue: Number(curMargin.toFixed(1)),
        previousValue: prevMargin !== null ? Number(prevMargin.toFixed(1)) : null,
        formattedCurrent: `${curMargin.toFixed(1)}%`,
        formattedPrevious: prevMargin !== null ? `${prevMargin.toFixed(1)}%` : null,
        absoluteChange: pctChange !== null ? Number(pctChange.toFixed(1)) : null,
        formattedAbsoluteChange: pctChange !== null ? `${pctChange >= 0 ? '+' : ''}${pctChange.toFixed(1)} pp` : null,
        percentageChange: pctChange !== null ? Number(pctChange.toFixed(1)) : null,
        trendDirection: trend,
        status,
        periodLabel,
        shortExplanation: pctChange !== null ? `Margin shifted ${pctChange >= 0 ? '+' : ''}${pctChange.toFixed(1)} percentage points` : 'Blended margin across active transactions',
        suffix: '%',
        isAvailable: true
      });
    }

    // 4. Total Orders / Transactions
    const curOrders = currentPeriodRows.length;
    const prevOrders = previousPeriodRows ? previousPeriodRows.length : null;
    kpiCards.push(buildCard(
      'kpi-orders',
      'Total Orders',
      curOrders,
      prevOrders,
      '',
      '',
      false,
      true,
      pct => pct !== null ? `Order volume shifted ${pct >= 0 ? '+' : ''}${pct}% ${periodLabel}` : 'Total completed transactions'
    ));

    // 5. Total Quantity / Volume (if supported)
    if (quantityCol) {
      const curQty = AnalyticsEngine.sum(currentPeriodRows, quantityCol);
      const prevQty = previousPeriodRows ? AnalyticsEngine.sum(previousPeriodRows, quantityCol) : null;
      kpiCards.push(buildCard(
        'kpi-quantity',
        'Total Quantity',
        curQty,
        prevQty,
        '',
        ' units',
        false,
        true,
        pct => pct !== null ? `Shipped volume ${pct >= 0 ? '+' : ''}${pct}% ${periodLabel}` : 'Physical units fulfilled'
      ));
    }

    // 6. Average Order Value (AOV)
    if (salesCol) {
      const curSales = AnalyticsEngine.sum(currentPeriodRows, salesCol);
      const curAov = curOrders > 0 ? curSales / curOrders : 0;
      let prevAov: number | null = null;
      if (previousPeriodRows && prevOrders && prevOrders > 0) {
        const prevSales = AnalyticsEngine.sum(previousPeriodRows, salesCol);
        prevAov = prevSales / prevOrders;
      }
      kpiCards.push(buildCard(
        'kpi-aov',
        'Average Order Value',
        curAov,
        prevAov,
        '$',
        '',
        true,
        true,
        pct => pct !== null ? `Basket size shifted ${pct >= 0 ? '+' : ''}${pct}% ${periodLabel}` : 'Average transaction gross realization'
      ));
    }

    return kpiCards;
  }

  private static getEmptyKPICards(): ExecutiveKPI[] {
    return [
      {
        id: 'kpi-revenue',
        title: 'Total Revenue',
        currentValue: 0,
        previousValue: null,
        formattedCurrent: '$0',
        formattedPrevious: null,
        absoluteChange: null,
        formattedAbsoluteChange: null,
        percentageChange: null,
        trendDirection: 'unavailable',
        status: 'unavailable',
        periodLabel: 'No dataset',
        shortExplanation: 'Awaiting data ingestion',
        prefix: '$',
        isAvailable: false
      }
    ];
  }

  /**
   * 2. Regional Performance Analysis with Analytical Scoring
   */
  public static analyzeRegionalPerformance(
    rows: Record<string, any>[],
    dataset: Dataset | null,
    sortBy: 'sales' | 'profit' | 'orders' | 'growth' | 'score' = 'sales'
  ): RegionalPerformanceItem[] {
    if (!dataset || rows.length === 0) return [];

    const classifications = AnalyticsEngine.classifyColumns(dataset.columns, rows);
    const primaryDims = AnalyticsEngine.findPrimaryDimensions(classifications);
    const regionCol = primaryDims.regionColumn;
    const salesCol = AnalyticsEngine.findPrimarySalesColumn(classifications);
    const profitCol = AnalyticsEngine.findPrimaryProfitColumn(classifications);
    const quantityCol = classifications.find(c => 
      c.isNumeric && (c.name.toLowerCase().includes('quantity') || c.name.toLowerCase().includes('qty'))
    )?.name;
    const dateCol = AnalyticsEngine.findPrimaryDateColumn(classifications);

    if (!regionCol) return [];

    // Group rows by region
    const regionMap = new Map<string, Record<string, any>[]>();
    rows.forEach(r => {
      const reg = r[regionCol];
      if (reg !== null && reg !== undefined && String(reg).trim() !== '') {
        const key = String(reg).trim();
        if (!regionMap.has(key)) regionMap.set(key, []);
        regionMap.get(key)!.push(r);
      }
    });

    const items: RegionalPerformanceItem[] = [];

    regionMap.forEach((regRows, region) => {
      const sales = salesCol ? AnalyticsEngine.sum(regRows, salesCol) : regRows.length;
      const profit = profitCol ? AnalyticsEngine.sum(regRows, profitCol) : 0;
      const orders = regRows.length;
      const quantity = quantityCol ? AnalyticsEngine.sum(regRows, quantityCol) : undefined;
      const aov = orders > 0 ? sales / orders : 0;
      const margin = sales > 0 ? (profit / sales) * 100 : 0;

      // Period growth if date available
      let growth: number | null = null;
      if (dateCol && salesCol) {
        const timeSeries = AnalyticsEngine.aggregateTimeSeries(regRows, dateCol, salesCol, 'monthly', 'SUM');
        if (timeSeries.length >= 2) {
          const cur = timeSeries[timeSeries.length - 1].value;
          const prev = timeSeries[timeSeries.length - 2].value;
          growth = BIEngine.calculatePercentageChange(cur, prev);
        }
      }

      // Performance Tier Status
      let status: PerformanceTier = 'Stable';
      if ((growth !== null && growth >= 5) || margin >= 25) {
        status = 'Strong';
      } else if ((growth !== null && growth < 0) || margin < 8) {
        status = 'Needs Attention';
      }

      items.push({
        rank: 0,
        region,
        sales,
        profit,
        orders,
        quantity,
        aov,
        margin: Number(margin.toFixed(1)),
        growth,
        status,
        performanceScore: 0,
        raw: regRows[0]
      });
    });

    if (items.length === 0) return [];

    // Calculate Analytical Performance Score:
    // 40% normalized Sales + 30% normalized Profit + 30% normalized Growth
    const maxSales = Math.max(...items.map(i => i.sales), 1);
    const minSales = Math.min(...items.map(i => i.sales), 0);
    const maxProfit = Math.max(...items.map(i => i.profit), 1);
    const minProfit = Math.min(...items.map(i => i.profit), 0);
    const maxGrowth = Math.max(...items.map(i => i.growth ?? 0), 1);
    const minGrowth = Math.min(...items.map(i => i.growth ?? 0), 0);

    items.forEach(item => {
      const normSales = maxSales !== minSales ? ((item.sales - minSales) / (maxSales - minSales)) * 100 : 50;
      const normProfit = maxProfit !== minProfit ? ((item.profit - minProfit) / (maxProfit - minProfit)) * 100 : 50;
      const g = item.growth ?? 0;
      const normGrowth = maxGrowth !== minGrowth ? ((g - minGrowth) / (maxGrowth - minGrowth)) * 100 : 50;

      const score = (0.40 * normSales) + (0.30 * normProfit) + (0.30 * normGrowth);
      item.performanceScore = Number(Math.max(0, Math.min(100, score)).toFixed(1));
    });

    // Sort items by requested metric
    items.sort((a, b) => {
      if (sortBy === 'profit') return b.profit - a.profit;
      if (sortBy === 'orders') return b.orders - a.orders;
      if (sortBy === 'growth') return (b.growth ?? -999) - (a.growth ?? -999);
      if (sortBy === 'score') return b.performanceScore - a.performanceScore;
      return b.sales - a.sales;
    });

    // Assign rank
    items.forEach((item, idx) => {
      item.rank = idx + 1;
    });

    return items;
  }

  /**
   * 3. Category Performance Analysis
   */
  public static analyzeCategoryPerformance(
    rows: Record<string, any>[],
    dataset: Dataset | null,
    sortBy: 'sales' | 'profit' | 'orders' | 'growth' = 'sales'
  ): CategoryPerformanceItem[] {
    if (!dataset || rows.length === 0) return [];

    const classifications = AnalyticsEngine.classifyColumns(dataset.columns, rows);
    const primaryDims = AnalyticsEngine.findPrimaryDimensions(classifications);
    const catCol = primaryDims.categoryColumn;
    const salesCol = AnalyticsEngine.findPrimarySalesColumn(classifications);
    const profitCol = AnalyticsEngine.findPrimaryProfitColumn(classifications);
    const quantityCol = classifications.find(c => 
      c.isNumeric && (c.name.toLowerCase().includes('quantity') || c.name.toLowerCase().includes('qty'))
    )?.name;
    const dateCol = AnalyticsEngine.findPrimaryDateColumn(classifications);

    if (!catCol) return [];

    const totalSales = salesCol ? AnalyticsEngine.sum(rows, salesCol) : rows.length;

    const catMap = new Map<string, Record<string, any>[]>();
    rows.forEach(r => {
      const cat = r[catCol];
      if (cat !== null && cat !== undefined && String(cat).trim() !== '') {
        const key = String(cat).trim();
        if (!catMap.has(key)) catMap.set(key, []);
        catMap.get(key)!.push(r);
      }
    });

    const items: CategoryPerformanceItem[] = [];

    catMap.forEach((catRows, category) => {
      const sales = salesCol ? AnalyticsEngine.sum(catRows, salesCol) : catRows.length;
      const profit = profitCol ? AnalyticsEngine.sum(catRows, profitCol) : 0;
      const orders = catRows.length;
      const quantity = quantityCol ? AnalyticsEngine.sum(catRows, quantityCol) : undefined;
      const profitMargin = sales > 0 ? (profit / sales) * 100 : 0;
      const share = totalSales > 0 ? (sales / totalSales) * 100 : 0;

      let growth: number | null = null;
      if (dateCol && salesCol) {
        const timeSeries = AnalyticsEngine.aggregateTimeSeries(catRows, dateCol, salesCol, 'monthly', 'SUM');
        if (timeSeries.length >= 2) {
          growth = BIEngine.calculatePercentageChange(
            timeSeries[timeSeries.length - 1].value,
            timeSeries[timeSeries.length - 2].value
          );
        }
      }

      items.push({
        rank: 0,
        category,
        sales,
        profit,
        orders,
        quantity,
        profitMargin: Number(profitMargin.toFixed(1)),
        growth,
        share: Number(share.toFixed(1))
      });
    });

    items.sort((a, b) => {
      if (sortBy === 'profit') return b.profit - a.profit;
      if (sortBy === 'orders') return b.orders - a.orders;
      if (sortBy === 'growth') return (b.growth ?? -999) - (a.growth ?? -999);
      return b.sales - a.sales;
    });

    items.forEach((item, idx) => {
      item.rank = idx + 1;
    });

    return items;
  }

  /**
   * 4. Top-N and Bottom-N Product Performance Rankings
   */
  public static calculateProductRankings(
    rows: Record<string, any>[],
    dataset: Dataset | null,
    metric: 'sales' | 'profit' | 'quantity' | 'orders' = 'sales',
    limit: number = 5,
    isTop: boolean = true
  ): ProductRankingItem[] {
    if (!dataset || rows.length === 0) return [];

    const classifications = AnalyticsEngine.classifyColumns(dataset.columns, rows);
    const primaryDims = AnalyticsEngine.findPrimaryDimensions(classifications);
    const productCol = primaryDims.productColumn || 'Product';
    const catCol = primaryDims.categoryColumn;
    const salesCol = AnalyticsEngine.findPrimarySalesColumn(classifications);
    const profitCol = AnalyticsEngine.findPrimaryProfitColumn(classifications);
    const quantityCol = classifications.find(c => 
      c.isNumeric && (c.name.toLowerCase().includes('quantity') || c.name.toLowerCase().includes('qty'))
    )?.name;

    // Check if column exists
    const hasCol = dataset.columns.some(c => c.name === productCol);
    if (!hasCol) return [];

    const prodMap = new Map<string, Record<string, any>[]>();
    rows.forEach(r => {
      const prod = r[productCol];
      if (prod !== null && prod !== undefined && String(prod).trim() !== '') {
        const key = String(prod).trim();
        if (!prodMap.has(key)) prodMap.set(key, []);
        prodMap.get(key)!.push(r);
      }
    });

    const items: ProductRankingItem[] = [];

    prodMap.forEach((prodRows, product) => {
      const sales = salesCol ? AnalyticsEngine.sum(prodRows, salesCol) : prodRows.length;
      const profit = profitCol ? AnalyticsEngine.sum(prodRows, profitCol) : 0;
      const orders = prodRows.length;
      const quantity = quantityCol ? AnalyticsEngine.sum(prodRows, quantityCol) : undefined;
      const margin = sales > 0 ? (profit / sales) * 100 : 0;
      const category = catCol && prodRows[0][catCol] ? String(prodRows[0][catCol]) : undefined;

      let value = sales;
      let formattedValue = BIEngine.formatCurrency(sales);

      if (metric === 'profit') {
        value = profit;
        formattedValue = BIEngine.formatCurrency(profit);
      } else if (metric === 'quantity' && quantity !== undefined) {
        value = quantity;
        formattedValue = `${BIEngine.formatNumber(quantity)} units`;
      } else if (metric === 'orders') {
        value = orders;
        formattedValue = `${orders} orders`;
      }

      items.push({
        rank: 0,
        product,
        category,
        value,
        formattedValue,
        metric: metric.toUpperCase(),
        orders,
        profit,
        margin: Number(margin.toFixed(1)),
        quantity
      });
    });

    // Sort order: Top (descending) vs Bottom (ascending)
    items.sort((a, b) => {
      return isTop ? b.value - a.value : a.value - b.value;
    });

    const sliced = items.slice(0, limit);
    sliced.forEach((item, idx) => {
      item.rank = idx + 1;
    });

    return sliced;
  }

  /**
   * 5. Performance Matrix (Analytical 2x2 Quadrant Segmentation)
   * X-Axis: Sales / Volume, Y-Axis: Profit Margin / Profitability
   */
  public static calculatePerformanceMatrix(
    rows: Record<string, any>[],
    dataset: Dataset | null
  ): PerformanceMatrixPoint[] {
    if (!dataset || rows.length === 0) return [];

    const classifications = AnalyticsEngine.classifyColumns(dataset.columns, rows);
    const primaryDims = AnalyticsEngine.findPrimaryDimensions(classifications);
    const targetDim = primaryDims.productColumn || primaryDims.categoryColumn || primaryDims.regionColumn;
    const salesCol = AnalyticsEngine.findPrimarySalesColumn(classifications);
    const profitCol = AnalyticsEngine.findPrimaryProfitColumn(classifications);

    if (!targetDim || !salesCol || !profitCol) return [];

    const entityMap = new Map<string, Record<string, any>[]>();
    rows.forEach(r => {
      const val = r[targetDim];
      if (val !== null && val !== undefined && String(val).trim() !== '') {
        const key = String(val).trim();
        if (!entityMap.has(key)) entityMap.set(key, []);
        entityMap.get(key)!.push(r);
      }
    });

    const rawPoints: { id: string; label: string; x: number; y: number }[] = [];

    entityMap.forEach((entRows, label) => {
      const sales = AnalyticsEngine.sum(entRows, salesCol);
      const profit = AnalyticsEngine.sum(entRows, profitCol);
      const margin = sales > 0 ? (profit / sales) * 100 : 0;

      rawPoints.push({
        id: `mat-${label}`,
        label,
        x: sales,
        y: Number(margin.toFixed(1))
      });
    });

    if (rawPoints.length === 0) return [];

    // Calculate median X and median Y as quadrant boundaries
    const sortedX = [...rawPoints].map(p => p.x).sort((a, b) => a - b);
    const sortedY = [...rawPoints].map(p => p.y).sort((a, b) => a - b);
    const medianX = sortedX[Math.floor(sortedX.length / 2)] || 0;
    const medianY = sortedY[Math.floor(sortedY.length / 2)] || 0;

    return rawPoints.map(p => {
      let quadrant: 'star' | 'volume_risk' | 'niche_efficient' | 'underperformer';
      let quadrantLabel: string;

      if (p.x >= medianX && p.y >= medianY) {
        quadrant = 'star';
        quadrantLabel = 'Star (High Sales, High Margin)';
      } else if (p.x >= medianX && p.y < medianY) {
        quadrant = 'volume_risk';
        quadrantLabel = 'Volume Driver (High Sales, Low Margin)';
      } else if (p.x < medianX && p.y >= medianY) {
        quadrant = 'niche_efficient';
        quadrantLabel = 'Niche Leader (Low Sales, High Margin)';
      } else {
        quadrant = 'underperformer';
        quadrantLabel = 'Underperformer (Low Sales, Low Margin)';
      }

      return {
        id: p.id,
        label: p.label,
        xValue: p.x,
        yValue: p.y,
        formattedX: BIEngine.formatCurrency(p.x),
        formattedY: `${p.y.toFixed(1)}%`,
        quadrant,
        quadrantLabel
      };
    });
  }

  /**
   * 6. Trend Analysis & Directional Indicators
   */
  public static analyzeTrends(
    rows: Record<string, any>[],
    dataset: Dataset | null,
    granularity: TimeGranularity = 'monthly'
  ): TrendAnalysisItem[] {
    if (!dataset || rows.length === 0) return [];

    const classifications = AnalyticsEngine.classifyColumns(dataset.columns, rows);
    const salesCol = AnalyticsEngine.findPrimarySalesColumn(classifications);
    const dateCol = AnalyticsEngine.findPrimaryDateColumn(classifications);

    if (!dateCol || !salesCol) return [];

    const timeSeries = AnalyticsEngine.aggregateTimeSeries(rows, dateCol, salesCol, granularity, 'SUM');
    if (timeSeries.length < 2) return [];

    return timeSeries.map((point, index) => {
      let prevVal: number | null = null;
      let growth: number | null = null;
      let direction: 'increasing' | 'decreasing' | 'stable' = 'stable';
      let indicator: '↗' | '↘' | '→' = '→';

      if (index > 0) {
        prevVal = timeSeries[index - 1].value;
        growth = BIEngine.calculatePercentageChange(point.value, prevVal);
        if (growth !== null) {
          if (Math.abs(growth) <= BIEngine.STABLE_THRESHOLD_PERCENT) {
            direction = 'stable';
            indicator = '→';
          } else if (growth > 0) {
            direction = 'increasing';
            indicator = '↗';
          } else {
            direction = 'decreasing';
            indicator = '↘';
          }
        }
      }

      return {
        period: point.period,
        currentValue: point.value,
        previousValue: prevVal,
        growthRate: growth,
        direction,
        indicator,
        isStable: direction === 'stable'
      };
    });
  }

  /**
   * 7. Anomaly Detection using Tukey's IQR Method
   * Flags values outside [Q1 - 1.5*IQR, Q3 + 1.5*IQR]
   * Clearly marked as analytical anomalies (not necessarily errors)
   */
  public static detectAnomalies(
    rows: Record<string, any>[],
    dataset: Dataset | null
  ): DetectedAnomaly[] {
    if (!dataset || rows.length === 0) return [];

    const classifications = AnalyticsEngine.classifyColumns(dataset.columns, rows);
    const salesCol = AnalyticsEngine.findPrimarySalesColumn(classifications);
    const dateCol = AnalyticsEngine.findPrimaryDateColumn(classifications);

    if (!salesCol) return [];

    const anomalies: DetectedAnomaly[] = [];

    // 1. Time-series aggregate anomalies (e.g. month with spike or trough)
    if (dateCol) {
      const timePoints = AnalyticsEngine.aggregateTimeSeries(rows, dateCol, salesCol, 'monthly', 'SUM');
      if (timePoints.length >= 4) {
        const values = timePoints.map(t => t.value).sort((a, b) => a - b);
        const q1 = values[Math.floor(values.length * 0.25)];
        const q3 = values[Math.floor(values.length * 0.75)];
        const iqr = q3 - q1;
        const lowerBound = Math.max(0, q1 - (1.5 * iqr));
        const upperBound = q3 + (1.5 * iqr);

        timePoints.forEach(point => {
          if (point.value > upperBound || point.value < lowerBound) {
            const isAbove = point.value > upperBound;
            const bound = isAbove ? upperBound : lowerBound;
            const dev = Math.abs(point.value - bound);
            const devPct = bound > 0 ? (dev / bound) * 100 : 100;

            anomalies.push({
              id: `anom-ts-${point.period}`,
              periodOrEntity: point.period,
              metric: 'Monthly Revenue',
              value: point.value,
              formattedValue: BIEngine.formatCurrency(point.value),
              expectedMin: lowerBound,
              expectedMax: upperBound,
              formattedExpectedRange: `${BIEngine.formatCurrency(lowerBound)} - ${BIEngine.formatCurrency(upperBound)}`,
              deviation: dev,
              deviationPercent: Number(devPct.toFixed(1)),
              status: isAbove ? 'Above Expected Range' : 'Below Expected Range',
              severity: devPct > 50 ? 'High' : 'Medium',
              method: 'Tukey IQR (Q1 - 1.5×IQR to Q3 + 1.5×IQR)',
              context: isAbove 
                ? 'Unprecedented demand spike or bulk enterprise contract recorded'
                : 'Significant seasonal revenue drop below historical baseline'
            });
          }
        });
      }
    }

    // 2. Transaction-level outlier anomalies
    const salesValues = rows
      .map(r => Number(r[salesCol]))
      .filter(v => !isNaN(v) && isFinite(v))
      .sort((a, b) => a - b);

    if (salesValues.length >= 20) {
      const q1 = salesValues[Math.floor(salesValues.length * 0.25)];
      const q3 = salesValues[Math.floor(salesValues.length * 0.75)];
      const iqr = q3 - q1;
      const upperBound = q3 + (2.5 * iqr); // Extreme outlier threshold

      const extremeRows = rows.filter(r => Number(r[salesCol]) > upperBound).slice(0, 3);
      extremeRows.forEach((r, idx) => {
        const val = Number(r[salesCol]);
        const idLabel = r['Order ID'] || r['Transaction ID'] || r['Product'] || `Record #${idx + 1}`;
        const dev = val - upperBound;
        const devPct = upperBound > 0 ? (dev / upperBound) * 100 : 100;

        anomalies.push({
          id: `anom-row-${idx}`,
          periodOrEntity: String(idLabel),
          metric: 'Single Transaction Size',
          value: val,
          formattedValue: BIEngine.formatCurrency(val),
          expectedMin: q1,
          expectedMax: upperBound,
          formattedExpectedRange: `Up to ${BIEngine.formatCurrency(upperBound)}`,
          deviation: dev,
          deviationPercent: Number(devPct.toFixed(1)),
          status: 'Above Expected Range',
          severity: 'High',
          method: 'Extreme Value IQR (Q3 + 2.5×IQR)',
          context: 'Outsized individual enterprise purchase requiring fulfillment audit'
        });
      });
    }

    return anomalies;
  }

  /**
   * 8. Customer Segment Analysis
   */
  public static analyzeCustomerSegments(
    rows: Record<string, any>[],
    dataset: Dataset | null
  ): CustomerSegmentItem[] {
    if (!dataset || rows.length === 0) return [];

    const classifications = AnalyticsEngine.classifyColumns(dataset.columns, rows);
    const primaryDims = AnalyticsEngine.findPrimaryDimensions(classifications);
    const segCol = primaryDims.segmentColumn;
    const salesCol = AnalyticsEngine.findPrimarySalesColumn(classifications);
    const profitCol = AnalyticsEngine.findPrimaryProfitColumn(classifications);
    const quantityCol = classifications.find(c => 
      c.isNumeric && (c.name.toLowerCase().includes('quantity') || c.name.toLowerCase().includes('qty'))
    )?.name;

    if (!segCol) return [];

    const totalSales = salesCol ? AnalyticsEngine.sum(rows, salesCol) : rows.length;
    const segMap = new Map<string, Record<string, any>[]>();

    rows.forEach(r => {
      const seg = r[segCol];
      if (seg !== null && seg !== undefined && String(seg).trim() !== '') {
        const key = String(seg).trim();
        if (!segMap.has(key)) segMap.set(key, []);
        segMap.get(key)!.push(r);
      }
    });

    const items: CustomerSegmentItem[] = [];

    segMap.forEach((segRows, segment) => {
      const sales = salesCol ? AnalyticsEngine.sum(segRows, salesCol) : segRows.length;
      const profit = profitCol ? AnalyticsEngine.sum(segRows, profitCol) : 0;
      const orders = segRows.length;
      const quantity = quantityCol ? AnalyticsEngine.sum(segRows, quantityCol) : undefined;
      const aov = orders > 0 ? sales / orders : 0;
      const margin = sales > 0 ? (profit / sales) * 100 : 0;
      const share = totalSales > 0 ? (sales / totalSales) * 100 : 0;

      items.push({
        segment,
        sales,
        profit,
        orders,
        quantity,
        aov,
        margin: Number(margin.toFixed(1)),
        share: Number(share.toFixed(1))
      });
    });

    items.sort((a, b) => b.sales - a.sales);
    return items;
  }

  /**
   * 9. Deterministic Executive Performance Summary (Requirement 18)
   * Builds an objective, data-grounded briefing without LLM hallucination.
   */
  public static generateExecutivePerformanceSummary(
    kpis: ExecutiveKPI[],
    regions: RegionalPerformanceItem[],
    categories: CategoryPerformanceItem[],
    anomalies: DetectedAnomaly[]
  ): ExecutiveSummaryReport {
    const revKPI = kpis.find(k => k.id === 'kpi-revenue');
    const marginKPI = kpis.find(k => k.id === 'kpi-margin');

    const revChange = revKPI?.percentageChange ?? null;
    let revenueChangeText = 'Revenue trajectory baseline established across evaluated transactions.';
    if (revChange !== null) {
      const dir = revChange >= 0 ? 'increased' : 'decreased';
      revenueChangeText = `Total recognized revenue ${dir} by ${Math.abs(revChange)}% compared with the preceding evaluation period (${revKPI?.formattedCurrent || '$0'}).`;
    }

    const topCat = categories.length > 0 ? categories[0] : null;
    const topCatText = topCat 
      ? `Portfolio leader "${topCat.category}" generated ${topCat.share}% of total recognized sales (${BIEngine.formatCurrency(topCat.sales)}) with a ${topCat.profitMargin}% gross margin.`
      : 'Category sales evenly distributed across product lines.';

    const topReg = regions.length > 0 ? regions[0] : null;
    const topRegText = topReg
      ? `Operating territory "${topReg.region}" ranked #1 overall with an analytical performance score of ${topReg.performanceScore}/100 and ${BIEngine.formatCurrency(topReg.sales)} in revenue.`
      : 'Geographical volume balanced across operational theaters.';

    // Growth leader among categories or regions
    const growthCandidates = [...categories, ...regions].filter(c => c.growth !== null);
    growthCandidates.sort((a, b) => (b.growth ?? 0) - (a.growth ?? 0));
    const growthLeader = growthCandidates.length > 0 ? growthCandidates[0] : null;
    const growthName = growthLeader 
      ? ('category' in growthLeader ? (growthLeader as any).category : (growthLeader as any).region) 
      : null;
    const growthText = growthLeader && growthName
      ? `Highest acceleration observed in "${growthName}", surging +${growthLeader.growth}% period-over-period.`
      : 'Steady growth pattern maintained across business segments.';

    const anomalyText = anomalies.length > 0
      ? `Statistical anomaly detector flagged ${anomalies.length} unusual observation${anomalies.length > 1 ? 's' : ''} outside Tukey's expected IQR boundaries.`
      : 'All operational metrics are tracking within expected statistical confidence bands.';

    const headline = revChange !== null && revChange >= 0
      ? `Strong Executive Momentum: Performance Expands +${revChange}% With ${topCat?.category || 'Core Portfolio'} Driving Volume`
      : revChange !== null
      ? `Executive Attention Recommended: Performance Trailing -${Math.abs(revChange)}% vs Prior Period Baseline`
      : `Executive BI Briefing: ${kpis.length} Active Key Performance Indicators Evaluated`;

    const bulletPoints = [
      revenueChangeText,
      topCatText,
      topRegText,
      growthText,
      anomalyText
    ];

    return {
      headline,
      bulletPoints,
      revenueChangeText,
      topCategoryText: topCatText,
      topRegionText: topRegText,
      growthText,
      anomalyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }
}
