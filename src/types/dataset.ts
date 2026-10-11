export type ColumnDataType = 'Number' | 'Category' | 'Date' | 'Text' | 'Boolean';

export interface ColumnMetadata {
  name: string;
  type: ColumnDataType;
  nonEmptyCount: number;
  missingCount: number;
  uniqueCount: number;
  uniqueValues?: string[]; // Cached top unique values for categorical filters
  min?: number;
  max?: number;
  mean?: number;
  minDate?: string;
  maxDate?: string;
}

export interface DatasetStatistics {
  rowCount: number;
  columnCount: number;
  missingValuesCount: number;
  duplicateRowsCount: number;
  numericColumnsCount: number;
  categoricalColumnsCount: number;
  dateColumnsCount: number;
  emptyColumnsCount: number;
}

export interface DateFilterRange {
  column: string;
  start: string | null;
  end: string | null;
  preset?: string;
}

export interface NumericFilterRange {
  min: number | null;
  max: number | null;
}

export interface AdvancedFilterState {
  dateRange: DateFilterRange | null;
  categoricalFilters: Record<string, string[]>;
  numericFilters: Record<string, NumericFilterRange>;
  searchTerm: string;
}

export interface FilterValue {
  type: 'category' | 'number' | 'date';
  selectedCategories?: string[];
  minNumber?: number;
  maxNumber?: number;
  minDate?: string;
  maxDate?: string;
}

export type FilterState = Record<string, FilterValue>;

export interface Dataset {
  id: string;
  name: string;
  fileName?: string;
  fileSize?: number;
  fileType?: 'csv' | 'xlsx' | 'xls' | 'json' | 'tsv';
  sheetNames?: string[];
  activeSheet?: string;
  uploadDate: string;
  isSample?: boolean;
  rows: Record<string, any>[];
  columns: ColumnMetadata[];
  statistics: DatasetStatistics;
  rawHeaders: string[];
  normalizedModel?: any;
}
