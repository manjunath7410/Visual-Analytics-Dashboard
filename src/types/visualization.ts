import { AggregationType, TimeGranularity } from './analytics';

export type ChartType = 
  | 'bar' 
  | 'horizontal_bar' 
  | 'line' 
  | 'area' 
  | 'pie' 
  | 'donut' 
  | 'scatter';

export interface ChartConfig {
  id: string;
  title: string;
  description?: string;
  chartType: ChartType;
  dimension?: string;
  metric: string;
  secondaryMetric?: string;
  aggregation: AggregationType;
  timeGranularity?: TimeGranularity;
  topN?: number | 'all';
  showLegend?: boolean;
  showTooltip?: boolean;
  showGrid?: boolean;
  height?: number;
  drillDownDimension?: string;
  color?: string;
}

export interface DrillDownState {
  level: number;
  parentDimension: string;
  parentValue: string;
  currentDimension: string;
  breadcrumbs: { dimension: string; value: string }[];
}

export interface InteractiveDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  recordCount?: number;
  percentageShare?: number;
  color?: string;
  raw?: any;
}

export interface SavedChartConfig {
  id: string;
  name: string;
  createdAt: string;
  config: ChartConfig;
}
