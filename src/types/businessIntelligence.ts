export type TrendDirection = 'increasing' | 'decreasing' | 'stable' | 'unavailable';
export type KPIStatus = 'positive' | 'negative' | 'neutral' | 'unavailable';
export type PerformanceTier = 'Strong' | 'Stable' | 'Needs Attention';

export interface ExecutiveKPI {
  id: string;
  title: string;
  currentValue: number;
  previousValue: number | null;
  formattedCurrent: string;
  formattedPrevious: string | null;
  absoluteChange: number | null;
  formattedAbsoluteChange: string | null;
  percentageChange: number | null;
  trendDirection: TrendDirection;
  status: KPIStatus;
  periodLabel: string;
  shortExplanation: string;
  prefix?: string;
  suffix?: string;
  sparkline?: number[];
  isAvailable: boolean;
}

export interface RegionalPerformanceItem {
  rank: number;
  region: string;
  sales: number;
  profit: number;
  orders: number;
  quantity?: number;
  aov: number;
  margin: number;
  growth: number | null;
  status: PerformanceTier;
  performanceScore: number; // Analytical score: 40% norm sales + 30% norm profit + 30% norm growth
  raw?: Record<string, any>;
}

export interface CategoryPerformanceItem {
  rank: number;
  category: string;
  sales: number;
  profit: number;
  orders: number;
  quantity?: number;
  profitMargin: number;
  growth: number | null;
  share: number;
}

export interface ProductRankingItem {
  rank: number;
  product: string;
  category?: string;
  value: number;
  formattedValue: string;
  metric: string;
  orders: number;
  profit?: number;
  margin?: number;
  quantity?: number;
}

export interface PerformanceMatrixPoint {
  id: string;
  label: string;
  category?: string;
  xValue: number;
  yValue: number;
  formattedX: string;
  formattedY: string;
  quadrant: 'star' | 'volume_risk' | 'niche_efficient' | 'underperformer';
  quadrantLabel: string;
}

export interface TrendAnalysisItem {
  period: string;
  currentValue: number;
  previousValue: number | null;
  growthRate: number | null;
  direction: 'increasing' | 'decreasing' | 'stable';
  indicator: '↗' | '↘' | '→';
  isStable: boolean;
}

export interface DetectedAnomaly {
  id: string;
  periodOrEntity: string;
  metric: string;
  value: number;
  formattedValue: string;
  expectedMin: number;
  expectedMax: number;
  formattedExpectedRange: string;
  deviation: number;
  deviationPercent: number;
  status: 'Above Expected Range' | 'Below Expected Range';
  severity: 'High' | 'Medium' | 'Low';
  method: string;
  context: string;
}

export interface CustomerSegmentItem {
  segment: string;
  sales: number;
  profit: number;
  orders: number;
  quantity?: number;
  aov: number;
  margin: number;
  share: number;
}

export interface ExecutiveSummaryReport {
  headline: string;
  bulletPoints: string[];
  revenueChangeText: string;
  topCategoryText: string;
  topRegionText: string;
  growthText: string;
  anomalyText: string;
  timestamp: string;
}
