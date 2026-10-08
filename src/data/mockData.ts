import { 
  DataRow, 
  ColumnSchema, 
  DatasetMeta, 
  KPIMetric, 
  InsightCardData, 
  WarehouseTable, 
  ReportItem,
  ProductPerformance,
  CategorySalesData,
  RecentActivityItem
} from '../types/dashboard';

export const INITIAL_DATASETS: DatasetMeta[] = [
  {
    id: 'ds-enterprise-sales-2026',
    name: 'Enterprise Global Sales & ARR (Q1-Q4)',
    description: 'B2B subscription, pipeline contracts, margins and regional distributions.',
    rowCount: 1420,
    columnCount: 14,
    uploadDate: '2026-10-01',
    sizeBytes: 348200,
    source: 'Sample CSV',
    status: 'ready',
  },
  {
    id: 'ds-cloud-warehouse-usage',
    name: 'Cloud Data Warehouse Query Telemetry',
    description: 'Cluster compute time, data transfer volume and cost attribution.',
    rowCount: 8540,
    columnCount: 11,
    uploadDate: '2026-09-28',
    sizeBytes: 1240000,
    source: 'Enterprise ERP',
    status: 'ready',
  },
  {
    id: 'ds-customer-retention',
    name: 'Customer Success & Retention Cohorts',
    description: 'Net dollar retention, NPS surveys and expansion tier trends.',
    rowCount: 640,
    columnCount: 9,
    uploadDate: '2026-09-15',
    sizeBytes: 154000,
    source: 'Sample CSV',
    status: 'ready',
  }
];

export const DATA_COLUMNS: ColumnSchema[] = [
  { key: 'id', label: 'Order ID', type: 'string', isDimension: true },
  { key: 'date', label: 'Transaction Date', type: 'date', isDimension: true, format: 'date' },
  { key: 'region', label: 'Region', type: 'string', isDimension: true },
  { key: 'segment', label: 'Customer Segment', type: 'string', isDimension: true },
  { key: 'product', label: 'Product Family', type: 'string', isDimension: true },
  { key: 'channel', label: 'Acquisition Channel', type: 'string', isDimension: true },
  { key: 'salesRep', label: 'Account Executive', type: 'string', isDimension: true },
  { key: 'revenue', label: 'Revenue ($)', type: 'number', isMetric: true, format: 'currency' },
  { key: 'cost', label: 'COGS ($)', type: 'number', isMetric: true, format: 'currency' },
  { key: 'profit', label: 'Gross Profit ($)', type: 'number', isMetric: true, format: 'currency' },
  { key: 'marginPercent', label: 'Margin (%)', type: 'number', isMetric: true, format: 'percent' },
  { key: 'units', label: 'Seats / Units', type: 'number', isMetric: true, format: 'integer' },
  { key: 'csat', label: 'CSAT Score (1-5)', type: 'number', isMetric: true, format: 'decimal' },
  { key: 'status', label: 'Contract Status', type: 'string', isDimension: true }
];

// Rich isolated mock data representing realistic transactions
export const INITIAL_TRANSACTIONS: DataRow[] = [
  { id: 'ORD-8921', date: '2026-10-04', region: 'North America', segment: 'Enterprise', product: 'Cloud Warehouse', channel: 'Direct', salesRep: 'Sarah Jenkins', revenue: 64500, cost: 18200, profit: 46300, marginPercent: 71.8, units: 120, csat: 4.9, status: 'Completed' },
  { id: 'ORD-8920', date: '2026-10-04', region: 'EMEA', segment: 'Enterprise', product: 'Security Suite', channel: 'Partner', salesRep: 'Marcus Thorne', revenue: 42000, cost: 11400, profit: 30600, marginPercent: 72.8, units: 85, csat: 4.8, status: 'Completed' },
  { id: 'ORD-8919', date: '2026-10-03', region: 'APAC', segment: 'Mid-Market', product: 'Analytics Pro', channel: 'Inbound', salesRep: 'Elena Chen', revenue: 18500, cost: 4200, profit: 14300, marginPercent: 77.3, units: 45, csat: 4.7, status: 'Completed' },
  { id: 'ORD-8918', date: '2026-10-03', region: 'North America', segment: 'Mid-Market', product: 'Enterprise API', channel: 'Direct', salesRep: 'Sarah Jenkins', revenue: 29000, cost: 7800, profit: 21200, marginPercent: 73.1, units: 60, csat: 4.6, status: 'Completed' },
  { id: 'ORD-8917', date: '2026-10-02', region: 'LATAM', segment: 'SMB', product: 'Analytics Pro', channel: 'Outbound', salesRep: 'Carlos Mendez', revenue: 8400, cost: 2300, profit: 6100, marginPercent: 72.6, units: 20, csat: 4.5, status: 'Completed' },
  { id: 'ORD-8916', date: '2026-10-02', region: 'North America', segment: 'Enterprise', product: 'Security Suite', channel: 'Direct', salesRep: 'David Miller', revenue: 78000, cost: 21000, profit: 57000, marginPercent: 73.1, units: 150, csat: 4.9, status: 'Completed' },
  { id: 'ORD-8915', date: '2026-10-01', region: 'EMEA', segment: 'Mid-Market', product: 'Cloud Warehouse', channel: 'Partner', salesRep: 'Marcus Thorne', revenue: 34500, cost: 9800, profit: 24700, marginPercent: 71.6, units: 70, csat: 4.7, status: 'Completed' },
  { id: 'ORD-8914', date: '2026-10-01', region: 'APAC', segment: 'Enterprise', product: 'Cloud Warehouse', channel: 'Outbound', salesRep: 'Elena Chen', revenue: 92000, cost: 26000, profit: 66000, marginPercent: 71.7, units: 180, csat: 4.8, status: 'Completed' },
  { id: 'ORD-8913', date: '2026-09-30', region: 'North America', segment: 'SMB', product: 'Analytics Pro', channel: 'Inbound', salesRep: 'Sarah Jenkins', revenue: 12200, cost: 3100, profit: 9100, marginPercent: 74.6, units: 25, csat: 4.4, status: 'Completed' },
  { id: 'ORD-8912', date: '2026-09-30', region: 'EMEA', segment: 'Enterprise', product: 'Enterprise API', channel: 'Direct', salesRep: 'Marcus Thorne', revenue: 54000, cost: 14200, profit: 39800, marginPercent: 73.7, units: 110, csat: 4.9, status: 'Completed' },
  { id: 'ORD-8911', date: '2026-09-29', region: 'APAC', segment: 'Mid-Market', product: 'Security Suite', channel: 'Partner', salesRep: 'Elena Chen', revenue: 26500, cost: 7100, profit: 19400, marginPercent: 73.2, units: 50, csat: 4.6, status: 'Pending' },
  { id: 'ORD-8910', date: '2026-09-28', region: 'North America', segment: 'Enterprise', product: 'Analytics Pro', channel: 'Direct', salesRep: 'David Miller', revenue: 86000, cost: 19800, profit: 66200, marginPercent: 77.0, units: 160, csat: 5.0, status: 'Completed' },
  { id: 'ORD-8909', date: '2026-09-27', region: 'LATAM', segment: 'Mid-Market', product: 'Enterprise API', channel: 'Inbound', salesRep: 'Carlos Mendez', revenue: 21500, cost: 5800, profit: 15700, marginPercent: 73.0, units: 40, csat: 4.3, status: 'Completed' },
  { id: 'ORD-8908', date: '2026-09-26', region: 'EMEA', segment: 'SMB', product: 'Analytics Pro', channel: 'Inbound', salesRep: 'Marcus Thorne', revenue: 9800, cost: 2400, profit: 7400, marginPercent: 75.5, units: 22, csat: 4.5, status: 'Completed' },
  { id: 'ORD-8907', date: '2026-09-25', region: 'North America', segment: 'Mid-Market', product: 'Cloud Warehouse', channel: 'Outbound', salesRep: 'Sarah Jenkins', revenue: 38200, cost: 10400, profit: 27800, marginPercent: 72.8, units: 75, csat: 4.8, status: 'Completed' },
  { id: 'ORD-8906', date: '2026-09-24', region: 'APAC', segment: 'Enterprise', product: 'Security Suite', channel: 'Direct', salesRep: 'Elena Chen', revenue: 115000, cost: 31000, profit: 84000, marginPercent: 73.0, units: 220, csat: 4.9, status: 'Completed' },
  { id: 'ORD-8905', date: '2026-09-23', region: 'North America', segment: 'Enterprise', product: 'Enterprise API', channel: 'Partner', salesRep: 'David Miller', revenue: 47500, cost: 12500, profit: 35000, marginPercent: 73.7, units: 95, csat: 4.7, status: 'In Review' },
  { id: 'ORD-8904', date: '2026-09-22', region: 'EMEA', segment: 'Enterprise', product: 'Cloud Warehouse', channel: 'Direct', salesRep: 'Marcus Thorne', revenue: 68000, cost: 18500, profit: 49500, marginPercent: 72.8, units: 130, csat: 4.8, status: 'Completed' },
  { id: 'ORD-8903', date: '2026-09-21', region: 'LATAM', segment: 'Enterprise', product: 'Security Suite', channel: 'Partner', salesRep: 'Carlos Mendez', revenue: 52000, cost: 14300, profit: 37700, marginPercent: 72.5, units: 100, csat: 4.6, status: 'Completed' },
  { id: 'ORD-8902', date: '2026-09-20', region: 'North America', segment: 'SMB', product: 'Analytics Pro', channel: 'Inbound', salesRep: 'Sarah Jenkins', revenue: 14200, cost: 3600, profit: 10600, marginPercent: 74.6, units: 28, csat: 4.7, status: 'Completed' },
  { id: 'ORD-8901', date: '2026-09-19', region: 'APAC', segment: 'Mid-Market', product: 'Cloud Warehouse', channel: 'Outbound', salesRep: 'Elena Chen', revenue: 31000, cost: 8600, profit: 22400, marginPercent: 72.3, units: 62, csat: 4.6, status: 'Completed' }
];

export const INITIAL_KPIS: KPIMetric[] = [
  {
    id: 'kpi-revenue',
    title: 'Total Revenue',
    value: '$4,842,600',
    numericValue: 4842600,
    prefix: '$',
    changePercent: 14.8,
    trend: 'up',
    periodText: 'vs prior period',
    description: 'Consolidated recognized revenue across global business segments.',
    sparklineData: [42, 45, 43, 48, 52, 50, 56, 59, 64, 62, 68, 72]
  },
  {
    id: 'kpi-orders',
    title: 'Total Orders',
    value: '12,480',
    numericValue: 12480,
    changePercent: 9.2,
    trend: 'up',
    periodText: 'vs prior period',
    description: 'Total processed enterprise contract & subscription transactions.',
    sparklineData: [920, 960, 990, 1020, 1050, 1080, 1120, 1160, 1200, 1248]
  },
  {
    id: 'kpi-customers',
    title: 'Total Customers',
    value: '3,840',
    numericValue: 3840,
    changePercent: 12.5,
    trend: 'up',
    periodText: 'vs prior period',
    description: 'Active unique enterprise, mid-market, and institutional accounts.',
    sparklineData: [2900, 3020, 3150, 3280, 3420, 3550, 3680, 3840]
  },
  {
    id: 'kpi-aov',
    title: 'Average Order Value',
    value: '$388',
    numericValue: 388,
    prefix: '$',
    changePercent: 5.1,
    trend: 'up',
    periodText: 'vs prior period',
    description: 'Blended mean contract monetization across all operational units.',
    sparklineData: [340, 348, 355, 362, 360, 372, 378, 384, 388]
  },
  {
    id: 'kpi-growth',
    title: 'Growth Rate',
    value: '24.6%',
    numericValue: 24.6,
    suffix: '%',
    changePercent: 3.8,
    trend: 'up',
    periodText: 'YoY trajectory',
    description: 'Annualized net revenue expansion adjusted for churn and renewals.',
    sparklineData: [18.2, 19.5, 20.1, 21.4, 22.0, 23.2, 23.8, 24.6]
  }
];

// Top Products dataset
export const TOP_PRODUCTS_DATA: ProductPerformance[] = [
  { id: 'prod-01', rank: 1, name: 'Cloud Warehouse Enterprise', category: 'Infrastructure', unitsSold: 4820, revenue: 1940000, growthPercent: 21.4, marginPercent: 72.8, trend: 'up' },
  { id: 'prod-02', rank: 2, name: 'Cyber Security Zero-Trust Suite', category: 'Security', unitsSold: 3410, revenue: 1420000, growthPercent: 18.2, marginPercent: 74.2, trend: 'up' },
  { id: 'prod-03', rank: 3, name: 'Enterprise API Gateway & Connectors', category: 'Developer Tools', unitsSold: 2190, revenue: 860000, growthPercent: 14.6, marginPercent: 75.0, trend: 'up' },
  { id: 'prod-04', rank: 4, name: 'Analytics Pro Visual BI Mart', category: 'Business Intelligence', unitsSold: 1680, revenue: 622600, growthPercent: 9.8, marginPercent: 76.5, trend: 'neutral' },
  { id: 'prod-05', rank: 5, name: 'Real-time Telemetry Pipeline', category: 'Infrastructure', unitsSold: 940, revenue: 380000, growthPercent: 28.5, marginPercent: 68.4, trend: 'up' },
];

// Sales by Category dataset
export const SALES_BY_CATEGORY_DATA: CategorySalesData[] = [
  { category: 'Cloud Infrastructure', sales: 1940000, orders: 4820, share: 40.1, targetAchievement: 104.2, color: '#6366f1' },
  { category: 'Cyber Security', sales: 1420000, orders: 3410, share: 29.3, targetAchievement: 98.6, color: '#10b981' },
  { category: 'Developer Tools & API', sales: 860000, orders: 2190, share: 17.8, targetAchievement: 102.1, color: '#8b5cf6' },
  { category: 'Visual Analytics & BI', sales: 622600, orders: 2060, share: 12.8, targetAchievement: 95.4, color: '#06b6d4' }
];

// Detailed Regional Performance dataset
export const REGIONAL_PERFORMANCE_DATA = [
  { region: 'North America', sales: 2180400, target: 2050000, orders: 5640, growth: 16.4, attainment: 106.3 },
  { region: 'EMEA', sales: 1340200, target: 1300000, orders: 3420, growth: 12.8, attainment: 103.1 },
  { region: 'APAC', sales: 980000, target: 920000, orders: 2480, growth: 22.5, attainment: 106.5 },
  { region: 'LATAM', sales: 342000, target: 380000, orders: 940, growth: 18.0, attainment: 90.0 }
];

// Chronological Recent Activity feed
export const RECENT_ACTIVITY_FEED: RecentActivityItem[] = [
  { id: 'act-01', timestamp: '2026-10-05 14:22', timeAgo: '6 mins ago', type: 'order', title: 'Enterprise Annual License Provisioned', account: 'Acme Global Cloud', amount: 64500, status: 'Completed', region: 'North America' },
  { id: 'act-02', timestamp: '2026-10-05 13:48', timeAgo: '40 mins ago', type: 'renewal', title: 'Multi-Region Security Tier Upgraded', account: 'Vertex Dynamics EMEA', amount: 42000, status: 'Completed', region: 'EMEA' },
  { id: 'act-03', timestamp: '2026-10-05 12:15', timeAgo: '2 hours ago', type: 'customer', title: 'New Strategic Account Onboarded', account: 'Nexus FinTech Tokyo', amount: 92000, status: 'Completed', region: 'APAC' },
  { id: 'act-04', timestamp: '2026-10-05 10:30', timeAgo: '4 hours ago', type: 'order', title: 'Enterprise API Gateway Seats Expanded', account: 'Helios Data Systems', amount: 29000, status: 'Completed', region: 'North America' },
  { id: 'act-05', timestamp: '2026-10-05 09:10', timeAgo: '5 hours ago', type: 'alert', title: 'Compliance Audit Report Generated', account: 'Starlight Media LATAM', amount: 8400, status: 'Processing', region: 'LATAM' },
  { id: 'act-06', timestamp: '2026-10-04 18:40', timeAgo: 'Yesterday', type: 'order', title: 'Cloud Warehouse Dedicated Cluster Added', account: 'Nordic Logistics AB', amount: 68000, status: 'Completed', region: 'EMEA' },
];

// Time-series data for main charts
export const MONTHLY_TREND_DATA = [
  { month: 'Nov 25', revenue: 310, target: 290, profit: 226, cogs: 84, forecast: null },
  { month: 'Dec 25', revenue: 345, target: 320, profit: 252, cogs: 93, forecast: null },
  { month: 'Jan 26', revenue: 360, target: 340, profit: 264, cogs: 96, forecast: null },
  { month: 'Feb 26', revenue: 382, target: 360, profit: 280, cogs: 102, forecast: null },
  { month: 'Mar 26', revenue: 410, target: 390, profit: 301, cogs: 109, forecast: null },
  { month: 'Apr 26', revenue: 395, target: 400, profit: 288, cogs: 107, forecast: null },
  { month: 'May 26', revenue: 425, target: 415, profit: 312, cogs: 113, forecast: null },
  { month: 'Jun 26', revenue: 440, target: 430, profit: 324, cogs: 116, forecast: null },
  { month: 'Jul 26', revenue: 462, target: 445, profit: 340, cogs: 122, forecast: null },
  { month: 'Aug 26', revenue: 478, target: 460, profit: 351, cogs: 127, forecast: null },
  { month: 'Sep 26', revenue: 495, target: 480, profit: 364, cogs: 131, forecast: null },
  { month: 'Oct 26', revenue: 520, target: 495, profit: 383, cogs: 137, forecast: 520 },
  { month: 'Nov 26', revenue: null, target: 515, profit: null, cogs: null, forecast: 546 },
  { month: 'Dec 26', revenue: null, target: 535, profit: null, cogs: null, forecast: 578 },
  { month: 'Jan 27', revenue: null, target: 550, profit: null, cogs: null, forecast: 602 },
];

export const REGIONAL_BREAKDOWN = [
  { region: 'North America', revenue: 2180, share: 45.0, accounts: 620, growth: 16.4 },
  { region: 'EMEA', revenue: 1340, share: 27.7, accounts: 410, growth: 12.8 },
  { region: 'APAC', revenue: 980, share: 20.2, accounts: 270, growth: 22.5 },
  { region: 'LATAM', revenue: 342, share: 7.1, accounts: 120, growth: 18.0 }
];

export const PRODUCT_DISTRIBUTION = [
  { name: 'Cloud Warehouse', revenue: 1940, margin: 72.1, color: '#3b82f6' },
  { name: 'Security Suite', revenue: 1420, margin: 73.8, color: '#10b981' },
  { name: 'Enterprise API', revenue: 860, margin: 74.2, color: '#8b5cf6' },
  { name: 'Analytics Pro', revenue: 622, margin: 76.5, color: '#06b6d4' }
];

export const PIPELINE_FUNNEL = [
  { stage: 'Qualified Leads', count: 4200, value: '$18.4M', conversion: '100%' },
  { stage: 'Technical Discovery', count: 2180, value: '$11.2M', conversion: '51.9%' },
  { stage: 'POC / Evaluation', count: 1240, value: '$7.8M', conversion: '29.5%' },
  { stage: 'Security & Legal Review', count: 680, value: '$4.9M', conversion: '16.2%' },
  { stage: 'Closed Won', count: 412, value: '$3.4M', conversion: '9.8%' }
];

export const RETENTION_COHORTS = [
  { cohort: 'Q1 2025', m0: 100, m3: 108, m6: 114, m9: 119, m12: 124 },
  { cohort: 'Q2 2025', m0: 100, m3: 106, m6: 112, m9: 118, m12: 121 },
  { cohort: 'Q3 2025', m0: 100, m3: 109, m6: 116, m9: 122, m12: 128 },
  { cohort: 'Q4 2025', m0: 100, m3: 111, m6: 118, m9: 125, m12: null },
  { cohort: 'Q1 2026', m0: 100, m3: 112, m6: 120, m9: null, m12: null },
  { cohort: 'Q2 2026', m0: 100, m3: 114, m6: null, m9: null, m12: null },
];

export const INSIGHTS_FEED: InsightCardData[] = [
  {
    id: 'ins-01',
    category: 'anomaly',
    title: 'APAC Mid-Market Expansion Velocity Surging',
    impact: 'High',
    confidence: 94,
    summary: 'APAC Mid-Market accounts demonstrated a 22.5% increase in monthly compute units during Q3, outpacing EMEA by 9.7 points.',
    recommendation: 'Allocate additional dedicated technical solutions engineers to Singapore and Tokyo to support contract expansion.',
    metricAffected: 'Net ARR & Compute Volume',
    detectedDate: '2026-10-04'
  },
  {
    id: 'ins-02',
    category: 'opportunity',
    title: 'Cross-Sell Potential in Cloud Warehouse Base',
    impact: 'High',
    confidence: 91,
    summary: '68% of Enterprise customers utilizing Cloud Warehouse have not provisioned the Security Suite module despite meeting compliance threshold.',
    recommendation: 'Trigger automated compliance benchmark audit report to all Cloud Warehouse admins with one-click trial provisioning.',
    metricAffected: 'Cross-Sell ARR (+$840K Est.)',
    detectedDate: '2026-10-03'
  },
  {
    id: 'ins-03',
    category: 'correlation',
    title: 'CSAT Scores Strongly Correlate with Retention Rates',
    impact: 'Medium',
    confidence: 88,
    summary: 'Accounts with CSAT >= 4.8 demonstrate an annual Net Revenue Retention (NRR) of 132%, compared to 98% for accounts below 4.2.',
    recommendation: 'Set proactive alert workflows for Customer Success when an account logs a satisfaction score below 4.5.',
    metricAffected: 'Customer Churn & NRR',
    detectedDate: '2026-10-01'
  },
  {
    id: 'ins-04',
    category: 'forecast',
    title: 'Q4 Budget Target Expected to Exceed by 4.8%',
    impact: 'Medium',
    confidence: 86,
    summary: 'Based on current qualified pipeline velocity and historical 4th-quarter budget flush patterns, Q4 projected revenue is $1.64M vs $1.56M plan.',
    recommendation: 'Pre-allocate server infrastructure reservations to benefit from 3-year committed-use discount tier.',
    metricAffected: 'Gross Profit Margin (+1.2%)',
    detectedDate: '2026-09-29'
  }
];

export const WAREHOUSE_TABLES: WarehouseTable[] = [
  { id: 'tb-01', name: 'fact_order_transactions', schema: 'analytics_prod', rowCount: 1420500, sizeFormatted: '284.2 MB', lastSynced: '5 mins ago', engine: 'ClickHouse / Parquet', status: 'healthy' },
  { id: 'tb-02', name: 'dim_customer_organizations', schema: 'analytics_prod', rowCount: 14200, sizeFormatted: '4.8 MB', lastSynced: '12 mins ago', engine: 'PostgreSQL Sync', status: 'healthy' },
  { id: 'tb-03', name: 'dim_product_catalog', schema: 'analytics_prod', rowCount: 184, sizeFormatted: '120 KB', lastSynced: '1 hour ago', engine: 'PostgreSQL Sync', status: 'healthy' },
  { id: 'tb-04', name: 'fact_hourly_telemetry', schema: 'telemetry_stream', rowCount: 18490000, sizeFormatted: '2.14 GB', lastSynced: 'Just now', engine: 'Kafka Stream', status: 'healthy' },
  { id: 'tb-05', name: 'agg_monthly_executive_kpis', schema: 'marts_bi', rowCount: 360, sizeFormatted: '96 KB', lastSynced: '15 mins ago', engine: 'dbt Materialized', status: 'healthy' },
  { id: 'tb-06', name: 'fact_churn_risk_predictions', schema: 'ml_models', rowCount: 1420, sizeFormatted: '1.2 MB', lastSynced: '3 hours ago', engine: 'Python / ML Pipeline', status: 'healthy' },
];

export const SCHEDULED_REPORTS: ReportItem[] = [
  { id: 'rep-01', title: 'Executive Board Performance Brief', category: 'Executive', cadence: 'Monthly', format: 'PDF', lastGenerated: '2026-10-01', recipientsCount: 8, status: 'Active' },
  { id: 'rep-02', title: 'Weekly Regional Pipeline & Bookings', category: 'Sales', cadence: 'Weekly', format: 'XLSX', lastGenerated: '2026-10-04', recipientsCount: 24, status: 'Active' },
  { id: 'rep-03', title: 'Infrastructure Cost Attribution & COGS', category: 'Operations', cadence: 'Monthly', format: 'CSV', lastGenerated: '2026-10-01', recipientsCount: 6, status: 'Active' },
  { id: 'rep-04', title: 'Customer Retention & Churn Risk Ledger', category: 'Financial', cadence: 'Weekly', format: 'PDF', lastGenerated: '2026-09-28', recipientsCount: 14, status: 'Active' },
  { id: 'rep-05', title: 'Q3 Tax & Audit Revenue Recognition Pack', category: 'Financial', cadence: 'Quarterly', format: 'XLSX', lastGenerated: '2026-09-30', recipientsCount: 5, status: 'Active' },
];
