export type DashboardWidgetId =
  | 'kpi_cards'
  | 'performance_insights'
  | 'revenue_trajectory'
  | 'category_performance'
  | 'regional_performance'
  | 'product_rankings'
  | 'profitability_matrix'
  | 'customer_segments'
  | 'business_alerts'
  | 'statistical_anomalies'
  | 'ai_executive_brief'
  | 'operational_context';

export type WidgetSize = 'full' | 'half' | 'third' | 'two-thirds';

export interface DashboardWidgetConfig {
  id: DashboardWidgetId;
  title: string;
  category: 'KPIs' | 'Trends' | 'Breakdowns' | 'Rankings' | 'Risk & Health' | 'AI Insights' | 'Operations';
  description: string;
  visible: boolean;
  size: WidgetSize;
  defaultSize: WidgetSize;
  minSize?: WidgetSize;
}

export type DashboardLayoutPreset = 'default' | 'executive' | 'sales' | 'operations';

export const DEFAULT_DASHBOARD_WIDGETS: DashboardWidgetConfig[] = [
  {
    id: 'kpi_cards',
    title: 'Executive Key Performance Indicators',
    category: 'KPIs',
    description: 'Core financial, operational, and customer volume metrics with trend badges',
    visible: true,
    size: 'full',
    defaultSize: 'full'
  },
  {
    id: 'performance_insights',
    title: 'Top Performance Highlights',
    category: 'KPIs',
    description: 'Leading regional territory, highest-margin category, and top volume segment',
    visible: true,
    size: 'full',
    defaultSize: 'full'
  },
  {
    id: 'revenue_trajectory',
    title: 'Revenue & Gross Profit Trajectory',
    category: 'Trends',
    description: 'Chronological performance tracking across daily, weekly, monthly or yearly cadences',
    visible: true,
    size: 'full',
    defaultSize: 'full'
  },
  {
    id: 'category_performance',
    title: 'Category Performance & Margins',
    category: 'Breakdowns',
    description: 'Portfolio contribution mix, profit margins, and volume distribution by category',
    visible: true,
    size: 'half',
    defaultSize: 'half'
  },
  {
    id: 'regional_performance',
    title: 'Regional Performance Leaderboard',
    category: 'Breakdowns',
    description: 'Ranked geographical operating theaters with analytical scoring and margin telemetry',
    visible: true,
    size: 'half',
    defaultSize: 'half'
  },
  {
    id: 'product_rankings',
    title: 'Top & Underperforming Catalog Rankings',
    category: 'Rankings',
    description: 'Top-N and Bottom-N catalog items ranked by sales, profit, quantity, or orders',
    visible: true,
    size: 'full',
    defaultSize: 'full'
  },
  {
    id: 'profitability_matrix',
    title: 'Profitability & Volume Matrix',
    category: 'Breakdowns',
    description: 'Multi-quadrant distribution analyzing revenue vs profit margin across entities',
    visible: true,
    size: 'half',
    defaultSize: 'half'
  },
  {
    id: 'customer_segments',
    title: 'Customer Segments Distribution',
    category: 'Breakdowns',
    description: 'Segment volume shares, average order values, and revenue contribution',
    visible: true,
    size: 'half',
    defaultSize: 'half'
  },
  {
    id: 'business_alerts',
    title: 'Business Risk & Needs Attention Alerts',
    category: 'Risk & Health',
    description: 'Automated warnings for margin deterioration, lagging territories, and volume anomalies',
    visible: true,
    size: 'full',
    defaultSize: 'full'
  },
  {
    id: 'statistical_anomalies',
    title: 'Detected Statistical Anomalies',
    category: 'Risk & Health',
    description: 'Z-Score and IQR outliers detected across time periods, categories, and regions',
    visible: true,
    size: 'full',
    defaultSize: 'full'
  },
  {
    id: 'ai_executive_brief',
    title: 'AI Executive Brief & Narrative',
    category: 'AI Insights',
    description: 'Synthesized executive commentary, key findings, and strategic recommendations',
    visible: true,
    size: 'full',
    defaultSize: 'full'
  },
  {
    id: 'operational_context',
    title: 'Operational Data Health & Warehouse Status',
    category: 'Operations',
    description: 'ETL schema integrity, star schema fact/dimension relations, and refresh cadence',
    visible: true,
    size: 'full',
    defaultSize: 'full'
  }
];

export const PRESET_CONFIGS: Record<DashboardLayoutPreset, { name: string; description: string; widgetIds: { id: DashboardWidgetId; size: WidgetSize }[] }> = {
  default: {
    name: 'Balanced Business Intelligence',
    description: 'Standard comprehensive view with all analytical sections enabled in standard hierarchy',
    widgetIds: [
      { id: 'kpi_cards', size: 'full' },
      { id: 'performance_insights', size: 'full' },
      { id: 'revenue_trajectory', size: 'full' },
      { id: 'category_performance', size: 'half' },
      { id: 'regional_performance', size: 'half' },
      { id: 'product_rankings', size: 'full' },
      { id: 'profitability_matrix', size: 'half' },
      { id: 'customer_segments', size: 'half' },
      { id: 'business_alerts', size: 'full' },
      { id: 'statistical_anomalies', size: 'full' },
      { id: 'ai_executive_brief', size: 'full' },
      { id: 'operational_context', size: 'full' },
    ]
  },
  executive: {
    name: 'C-Suite Executive Brief',
    description: 'Focused view on primary KPIs, chronological trajectory, AI brief, and urgent business risks',
    widgetIds: [
      { id: 'kpi_cards', size: 'full' },
      { id: 'ai_executive_brief', size: 'full' },
      { id: 'revenue_trajectory', size: 'full' },
      { id: 'business_alerts', size: 'half' },
      { id: 'performance_insights', size: 'half' },
      { id: 'regional_performance', size: 'half' },
      { id: 'category_performance', size: 'half' },
    ]
  },
  sales: {
    name: 'Sales & Commercial Operations',
    description: 'Tailored for revenue leaders tracking territory leaders, category margins, and top catalog items',
    widgetIds: [
      { id: 'kpi_cards', size: 'full' },
      { id: 'performance_insights', size: 'full' },
      { id: 'regional_performance', size: 'half' },
      { id: 'category_performance', size: 'half' },
      { id: 'product_rankings', size: 'full' },
      { id: 'revenue_trajectory', size: 'full' },
      { id: 'profitability_matrix', size: 'half' },
      { id: 'customer_segments', size: 'half' },
    ]
  },
  operations: {
    name: 'Risk & Data Governance',
    description: 'Prioritizes anomaly alerts, operational health, underperforming products, and data warehouse status',
    widgetIds: [
      { id: 'kpi_cards', size: 'full' },
      { id: 'business_alerts', size: 'full' },
      { id: 'statistical_anomalies', size: 'full' },
      { id: 'operational_context', size: 'full' },
      { id: 'product_rankings', size: 'half' },
      { id: 'profitability_matrix', size: 'half' },
      { id: 'ai_executive_brief', size: 'full' },
    ]
  }
};

const STORAGE_KEY = 'acuity_dashboard_custom_layout_v2';

export function loadSavedDashboardLayout(): DashboardWidgetConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DASHBOARD_WIDGETS;
    const parsed: DashboardWidgetConfig[] = JSON.parse(raw);
    
    // Ensure all current widgets exist in saved list (in case new widgets were added)
    const existingIds = new Set(parsed.map(w => w.id));
    const missingWidgets = DEFAULT_DASHBOARD_WIDGETS.filter(w => !existingIds.has(w.id));
    
    // Merge known metadata
    const merged = parsed.map(w => {
      const defaultMeta = DEFAULT_DASHBOARD_WIDGETS.find(dw => dw.id === w.id);
      return {
        ...defaultMeta,
        ...w,
        title: defaultMeta?.title || w.title,
        category: defaultMeta?.category || w.category,
        description: defaultMeta?.description || w.description,
      };
    });
    
    return [...merged, ...missingWidgets];
  } catch {
    return DEFAULT_DASHBOARD_WIDGETS;
  }
}

export function saveDashboardLayout(widgets: DashboardWidgetConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
  } catch {
    // ignore
  }
}

export function applyLayoutPreset(preset: DashboardLayoutPreset): DashboardWidgetConfig[] {
  const config = PRESET_CONFIGS[preset];
  const activeIds = new Set(config.widgetIds.map(w => w.id));
  const sizeMap = new Map(config.widgetIds.map(w => [w.id, w.size]));
  
  // Ordered active widgets
  const activeWidgets: DashboardWidgetConfig[] = config.widgetIds.map(item => {
    const defaultWidget = DEFAULT_DASHBOARD_WIDGETS.find(w => w.id === item.id)!;
    return {
      ...defaultWidget,
      visible: true,
      size: item.size
    };
  });
  
  // Inactive widgets appended at the end with visible: false
  const inactiveWidgets: DashboardWidgetConfig[] = DEFAULT_DASHBOARD_WIDGETS
    .filter(w => !activeIds.has(w.id))
    .map(w => ({
      ...w,
      visible: false
    }));
    
  const result = [...activeWidgets, ...inactiveWidgets];
  saveDashboardLayout(result);
  return result;
}

export function resetDashboardLayout(): DashboardWidgetConfig[] {
  saveDashboardLayout(DEFAULT_DASHBOARD_WIDGETS);
  return DEFAULT_DASHBOARD_WIDGETS;
}
