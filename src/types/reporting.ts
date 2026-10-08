export type ReportTemplateType = 'executive' | 'bi_analysis' | 'data_quality' | 'data_warehouse';

export interface ReportConfig {
  id: string;
  name: string;
  template: ReportTemplateType;
  title: string;
  subtitle: string;
  author: string;
  organization: string;
  topN: number; // 5, 10, 20
  selectedKPIs: string[];
  selectedCharts: string[];
  selectedTables: string[];
  includeAnomalies: boolean;
  includeRecommendations: boolean;
  includeAIInsights: boolean;
  includeWarehouse: boolean;
  includeDataQuality: boolean;
  includeOLAP: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SavedReportItem {
  id: string;
  config: ReportConfig;
  timestamp: string;
  datasetName: string;
  recordCount: number;
  filterSummary: string;
}

export interface ReportDataQualitySummary {
  qualityScore: number;
  totalRows: number;
  totalColumns: number;
  missingValuesCount: number;
  missingValuesPercentage: number;
  duplicateRowsCount: number;
  invalidNumericCount: number;
  invalidDatesCount: number;
  cleaningOperationsCount: number;
  cleaningOperations: string[];
  etlStatus: 'Verified & Clean' | 'Raw / Unprocessed' | 'Needs Attention';
}

export interface ReportFilterContext {
  datasetName: string;
  totalRows: number;
  filteredRows: number;
  filteredPercentage: number;
  dateRange: string;
  activeFilters: Array<{ dimension: string; values: string[] }>;
  hasFilters: boolean;
}
