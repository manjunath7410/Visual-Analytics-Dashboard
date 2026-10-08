import { ExecutiveKPI, RegionalPerformanceItem, CategoryPerformanceItem, ProductRankingItem, TrendAnalysisItem, DetectedAnomaly, CustomerSegmentItem } from './businessIntelligence';

export interface StructuredAnalyticsContext {
  datasetSummary: {
    datasetName: string;
    rowCount: number;
    columnCount: number;
    isSample: boolean;
  };
  activeFilters: {
    region?: string[];
    segment?: string[];
    category?: string[];
    product?: string[];
    dateRange?: { start: string | null; end: string | null; preset?: string | null };
    numericFilters?: Record<string, { min: number | null; max: number | null }>;
    searchTerm?: string;
    filteredRowCount: number;
    totalRowCount: number;
    filteredPercentage: number;
  };
  kpis: {
    revenue?: { current: number; previous: number | null; formatted: string; changePercent: number | null };
    profit?: { current: number; previous: number | null; formatted: string; changePercent: number | null };
    profitMargin?: { current: number; previous: number | null; formatted: string; changePercent: number | null };
    orders?: { current: number; previous: number | null; formatted: string; changePercent: number | null };
    aov?: { current: number; previous: number | null; formatted: string; changePercent: number | null };
    quantity?: { current: number; previous: number | null; formatted: string; changePercent: number | null };
  };
  rankings: {
    topRegions: Array<{ rank: number; region: string; sales: number; profit: number; margin: number; status: string; score: number }>;
    topCategories: Array<{ rank: number; category: string; sales: number; profit: number; margin: number; share: number }>;
    topProducts: Array<{ rank: number; product: string; value: string; metric: string }>;
    underperformingProducts: Array<{ rank: number; product: string; value: string; metric: string; margin?: number }>;
  };
  trends: Array<{
    period: string;
    value: number;
    formattedValue: string;
    growthRate: number | null;
    direction: string;
    indicator: string;
  }>;
  anomalies: Array<{
    periodOrEntity: string;
    metric: string;
    value: string;
    expectedRange: string;
    deviationPercent: number;
    status: string;
    context: string;
  }>;
  customerSegments?: Array<{
    segment: string;
    sales: number;
    margin: number;
    orders: number;
    share: number;
  }>;
}

export interface AIExecutiveSummary {
  overallPerformance: string;
  strongestArea: string;
  weakestArea: string;
  importantTrend: string;
  importantAnomaly: string;
  recommendedAction: string;
}

export interface AIKeyFinding {
  title: string;
  finding: string;
  evidence: string;
  importance: 'high' | 'medium' | 'low';
}

export interface AITrendExplanation {
  directionSummary: string;
  significantChanges: string[];
  observedFacts: string[];
  possibleExplanations: string[];
}

export interface AIAnomalyExplanation {
  anomalyCount: number;
  summary: string;
  interpretations: Array<{
    entity: string;
    observation: string;
    interpretation: string;
    recommendedInvestigation: string;
  }>;
}

export interface AIBusinessRecommendation {
  id: string;
  title: string;
  observation: string;
  recommendation: string;
  expectedImpact: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AIAskDataAnswer {
  question: string;
  answer: string;
  keyTakeaway: string;
  supportingEvidence: string[];
  suggestedFollowUps: string[];
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  keyTakeaway?: string;
  supportingEvidence?: string[];
  suggestedFollowUps?: string[];
}

export interface AIConfigStatus {
  configured: boolean;
  model: string;
  source: string;
}
