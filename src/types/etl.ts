import { ColumnMetadata, ColumnDataType, DatasetStatistics } from './dataset';

export type ExtendedDataType = 'Text' | 'Integer' | 'Decimal' | 'Boolean' | 'Date' | 'DateTime';

export type QualityRating = 'Excellent' | 'Good' | 'Needs Attention' | 'Poor';

export interface QualityFactor {
  name: string;
  impactScore: number; // Penalty points deducted
  description: string;
  count: number;
}

export interface DataQualityReport {
  score: number; // 0 - 100
  rating: QualityRating;
  factors: QualityFactor[];
  totalIssues: number;
}

export interface MissingValueColumnReport {
  columnName: string;
  dataType: ColumnDataType;
  total: number;
  missing: number;
  missingPercent: number;
  nonMissing: number;
  status: 'Good' | 'Attention' | 'Critical';
}

export interface OutlierColumnReport {
  columnName: string;
  q1: number;
  q3: number;
  iqr: number;
  lowerBound: number;
  upperBound: number;
  outlierCount: number;
  outlierPercent: number;
}

export interface CleaningOperation {
  id: string;
  timestamp: string;
  timeFormatted: string;
  type: 
    | 'remove_duplicates'
    | 'fill_missing'
    | 'remove_missing_rows'
    | 'override_type'
    | 'clean_numeric'
    | 'clean_dates'
    | 'text_transform'
    | 'remove_column'
    | 'rename_column'
    | 'remove_outliers'
    | 'reset';
  columnName?: string;
  description: string;
  affectedRows: number;
  affectedColumns?: number;
  status: 'applied' | 'reverted';
}

export interface DatasetSnapshot {
  id: string;
  timestamp: number;
  operationDescription: string;
  rows: Record<string, any>[];
  headers: string[];
}

export interface ETLStage {
  id: 'extract' | 'transform' | 'validate' | 'load';
  name: string;
  label: string;
  status: 'completed' | 'in_progress' | 'ready' | 'pending';
  detail: string;
}
