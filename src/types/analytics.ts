import { FilterState } from './dataset';

export type AggregationType = 'SUM' | 'COUNT' | 'AVERAGE' | 'MIN' | 'MAX' | 'MEDIAN' | 'STDDEV' | 'VARIANCE';

export type TimeGranularity = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export type ColumnRole = 
  | 'Identifier'
  | 'Date'
  | 'Numeric Metric'
  | 'Currency'
  | 'Percentage'
  | 'Categorical Dimension'
  | 'Text'
  | 'Boolean';

export interface ColumnClassification {
  name: string;
  role: ColumnRole;
  isNumeric: boolean;
  isDate: boolean;
  isDimension: boolean;
}

export interface AnalyticsQuery {
  dimension?: string;
  metric?: string;
  aggregation?: AggregationType;
  filters?: FilterState;
  limit?: number;
  sort?: 'ASC' | 'DESC';
  timeGranularity?: TimeGranularity;
  dateColumn?: string;
}

export interface KPIResult {
  id: string;
  title: string;
  value: string;
  numericValue: number;
  changePercent: number | null;
  trend: 'up' | 'down' | 'neutral';
  periodText: string;
  description: string;
  sparklineData: number[];
  available: boolean;
  prefix?: string;
  suffix?: string;
}

export interface GroupedResult {
  dimensionValue: string;
  recordCount: number;
  value: number;
  formattedValue: string;
  average: number;
  min: number;
  max: number;
  percentageShare: number;
}

export interface TimeSeriesPoint {
  period: string;
  timestamp: number;
  value: number;
  formattedValue: string;
  previousValue?: number;
  growthPercent?: number | null;
}

export interface RankingResult {
  rank: number;
  dimensionValue: string;
  metricValue: number;
  formattedValue: string;
  percentageOfTotal: number;
  category?: string;
}

export interface DescriptiveStatistics {
  column: string;
  count: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
  variance: number;
  sum: number;
}

export interface CorrelationResult {
  columnA: string;
  columnB: string;
  coefficient: number; // -1.00 to +1.00
  strength: 'Strong Positive' | 'Moderate Positive' | 'Weak / None' | 'Moderate Negative' | 'Strong Negative';
  sampleSize: number;
}
