import { ReportConfig, ReportTemplateType } from '../../types/reporting';

export interface TemplateDefinition {
  id: ReportTemplateType;
  title: string;
  badge: string;
  description: string;
  iconName: string;
  defaultConfig: Omit<ReportConfig, 'id' | 'createdAt' | 'updatedAt'>;
}

export const REPORT_TEMPLATES: TemplateDefinition[] = [
  {
    id: 'executive',
    title: 'Executive Business Report',
    badge: 'C-Suite Briefing',
    description: 'Comprehensive executive briefing: strategic KPIs, volume trajectories, regional rankings, category margins, and actionable recommendations.',
    iconName: 'Award',
    defaultConfig: {
      name: 'Executive Business Report',
      template: 'executive',
      title: 'Executive Performance & Strategic Intelligence Report',
      subtitle: 'Consolidated commercial revenue, profit margins, regional attainment, and risk assessment.',
      author: 'Executive BI System',
      organization: 'Enterprise Analytics Group',
      topN: 5,
      selectedKPIs: ['kpi-revenue', 'kpi-profit', 'kpi-margin', 'kpi-orders', 'kpi-aov'],
      selectedCharts: ['chart-revenue-trend', 'chart-regional', 'chart-category-margin', 'chart-top-products'],
      selectedTables: ['table-regions', 'table-categories', 'table-top-products', 'table-bottom-products'],
      includeAnomalies: true,
      includeRecommendations: true,
      includeAIInsights: true,
      includeWarehouse: false,
      includeDataQuality: false,
      includeOLAP: false
    }
  },
  {
    id: 'bi_analysis',
    title: 'BI Analysis & Deep Dive Report',
    badge: 'Analytical Diagnostic',
    description: 'Multi-dimensional deep dive into category dynamics, customer segments, quadrant segmentation, time-series growth, and statistical distributions.',
    iconName: 'LineChart',
    defaultConfig: {
      name: 'BI Analysis & Deep Dive',
      template: 'bi_analysis',
      title: 'Multi-Dimensional Business Intelligence Diagnostic Report',
      subtitle: 'In-depth analysis of category unit economics, customer cohort attainment, and performance matrix quadrants.',
      author: 'Senior BI Analyst',
      organization: 'Strategic Operations',
      topN: 10,
      selectedKPIs: ['kpi-revenue', 'kpi-profit', 'kpi-margin', 'kpi-orders', 'kpi-quantity'],
      selectedCharts: ['chart-revenue-trend', 'chart-category-margin', 'chart-segments', 'chart-matrix'],
      selectedTables: ['table-categories', 'table-regions', 'table-segments', 'table-top-products', 'table-anomalies'],
      includeAnomalies: true,
      includeRecommendations: true,
      includeAIInsights: true,
      includeWarehouse: true,
      includeDataQuality: true,
      includeOLAP: true
    }
  },
  {
    id: 'data_quality',
    title: 'Data Quality & Governance Report',
    badge: 'ETL & Hygiene Audit',
    description: 'Audit dataset hygiene: completeness scores, missing field rates, deduplication metrics, invalid type corrections, and pipeline audit logs.',
    iconName: 'ShieldCheck',
    defaultConfig: {
      name: 'Data Quality & Governance Audit',
      template: 'data_quality',
      title: 'Enterprise Data Hygiene & Pipeline Governance Report',
      subtitle: 'Audit log of missing values, duplicate record resolution, schema validation, and statistical outlier flags.',
      author: 'Data Governance Lead',
      organization: 'Data Engineering & Assurance',
      topN: 10,
      selectedKPIs: ['kpi-records', 'kpi-columns', 'kpi-quality-score', 'kpi-clean-rate'],
      selectedCharts: ['chart-missing-values', 'chart-column-types'],
      selectedTables: ['table-quality-summary', 'table-cleaning-operations', 'table-anomalies'],
      includeAnomalies: true,
      includeRecommendations: false,
      includeAIInsights: false,
      includeWarehouse: false,
      includeDataQuality: true,
      includeOLAP: false
    }
  },
  {
    id: 'data_warehouse',
    title: 'Data Warehouse & OLAP Report',
    badge: 'Dimensional Modeling',
    description: 'Star schema architecture report: Fact table measurements, dimension tables, surrogate key mappings, ETL lineage, and multi-dimensional OLAP cube analysis.',
    iconName: 'Database',
    defaultConfig: {
      name: 'Data Warehouse & Star Schema Report',
      template: 'data_warehouse',
      title: 'Dimensional Modeling & OLAP Cube Analytical Dossier',
      subtitle: 'Star Schema normalization, surrogate key integrity, measure additivity, and multi-dimensional cube aggregations.',
      author: 'Data Warehouse Architect',
      organization: 'Enterprise Data Platform',
      topN: 5,
      selectedKPIs: ['kpi-fact-rows', 'kpi-dimensions-count', 'kpi-measures-count', 'kpi-integrity-score'],
      selectedCharts: ['chart-olap-matrix'],
      selectedTables: ['table-warehouse-stats', 'table-etl-mappings', 'table-olap-result', 'table-integrity'],
      includeAnomalies: false,
      includeRecommendations: false,
      includeAIInsights: false,
      includeWarehouse: true,
      includeDataQuality: true,
      includeOLAP: true
    }
  }
];

export function createDefaultReportConfig(templateType: ReportTemplateType): ReportConfig {
  const t = REPORT_TEMPLATES.find(temp => temp.id === templateType) || REPORT_TEMPLATES[0];
  return {
    ...t.defaultConfig,
    id: `rep-config-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
