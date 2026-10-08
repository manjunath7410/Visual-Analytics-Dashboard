export type TimeRange = '24h' | '7d' | '30d' | '90d' | 'ytd' | '12m' | 'all';

export type TrendDirection = 'up' | 'down' | 'neutral';

export interface ColumnSchema {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  isMetric?: boolean;
  isDimension?: boolean;
  format?: 'currency' | 'percent' | 'integer' | 'decimal' | 'date';
}

export interface DataRow {
  id: string;
  date: string;
  region: 'North America' | 'EMEA' | 'APAC' | 'LATAM';
  segment: 'Enterprise' | 'Mid-Market' | 'SMB';
  product: 'Analytics Pro' | 'Cloud Warehouse' | 'Enterprise API' | 'Security Suite';
  channel: 'Inbound' | 'Outbound' | 'Partner' | 'Direct';
  salesRep: string;
  revenue: number;
  cost: number;
  profit: number;
  marginPercent: number;
  units: number;
  csat: number; // 1-5
  status: 'Completed' | 'Pending' | 'In Review';
  [key: string]: any;
}

export interface DatasetMeta {
  id: string;
  name: string;
  description: string;
  rowCount: number;
  columnCount: number;
  uploadDate: string;
  sizeBytes: number;
  source: 'Sample CSV' | 'Enterprise ERP' | 'Custom Upload';
  status: 'ready' | 'processing' | 'indexed';
}

export interface KPIMetric {
  id: string;
  title: string;
  value: string;
  numericValue: number;
  unit?: string;
  prefix?: string;
  suffix?: string;
  changePercent: number;
  trend: TrendDirection;
  periodText: string;
  description?: string;
  sparklineData: number[];
}

export interface InsightCardData {
  id: string;
  category: 'anomaly' | 'forecast' | 'correlation' | 'opportunity';
  title: string;
  impact: 'High' | 'Medium' | 'Low';
  confidence: number; // 0 - 100
  summary: string;
  recommendation: string;
  metricAffected: string;
  detectedDate: string;
}

export interface WarehouseTable {
  id: string;
  name: string;
  schema: string;
  rowCount: number;
  sizeFormatted: string;
  lastSynced: string;
  engine: string;
  status: 'healthy' | 'syncing' | 'paused';
}

export interface ReportItem {
  id: string;
  title: string;
  category: 'Executive' | 'Financial' | 'Operations' | 'Sales';
  cadence: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';
  format: 'PDF' | 'XLSX' | 'CSV';
  lastGenerated: string;
  recipientsCount: number;
  status: 'Active' | 'Draft' | 'Archived';
}

export interface ProductPerformance {
  id: string;
  rank: number;
  name: string;
  category: string;
  unitsSold: number;
  revenue: number;
  growthPercent: number;
  marginPercent: number;
  trend: TrendDirection;
}

export interface RecentActivityItem {
  id: string;
  timestamp: string;
  timeAgo: string;
  type: 'order' | 'customer' | 'renewal' | 'alert';
  title: string;
  account: string;
  amount?: number;
  status: 'Completed' | 'Processing' | 'Flagged';
  region: string;
}

export interface CategorySalesData {
  category: string;
  sales: number;
  orders: number;
  share: number;
  targetAchievement: number;
  color: string;
}

