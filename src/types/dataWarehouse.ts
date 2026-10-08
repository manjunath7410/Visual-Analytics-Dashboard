export type MeasureAdditivity = 'Additive' | 'Semi-additive' | 'Non-additive';

export interface DimensionColumn {
  name: string;
  type: 'string' | 'number' | 'date';
  isSurrogateKey?: boolean;
}

export interface DimensionTable {
  name: string; // e.g. "Dim_Region", "Dim_Product", "Dim_Date"
  primaryKey: string; // e.g. "Region_Key", "Product_Key", "Date_Key"
  sourceColumn: string;
  rowCount: number;
  columns: DimensionColumn[];
  rows: Record<string, any>[];
  lookupMap: Map<string, string | number>; // maps raw source value to surrogate key
}

export interface FactMeasure {
  name: string;
  sourceColumn: string;
  type: string;
  additivity: MeasureAdditivity;
}

export interface FactForeignKey {
  keyName: string;
  referencesTable: string;
  referencesKey: string;
}

export interface FactTable {
  name: string; // e.g. "Fact_Sales"
  primaryKey: string; // e.g. "Sales_Fact_Key"
  foreignKeys: FactForeignKey[];
  measures: FactMeasure[];
  rowCount: number;
  columns: Array<{ name: string; type: string; role: 'surrogate_key' | 'foreign_key' | 'measure' }>;
  rows: Record<string, any>[];
}

export interface StarSchemaRelationship {
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
}

export interface StarSchema {
  factTable: FactTable;
  dimensions: DimensionTable[];
  relationships: StarSchemaRelationship[];
  buildTimestamp: string;
  sourceDatasetName: string;
  sourceRowCount: number;
}

export interface ETLMappingItem {
  sourceColumn: string;
  transformation: string;
  targetTable: string;
  targetColumn: string;
  role: 'Dimension' | 'Measure' | 'Surrogate Key';
  dataClassification: string;
}

export type OLAPOperation = 'rollup' | 'drilldown' | 'slice' | 'dice' | 'pivot';

export interface OLAPQuery {
  operation: OLAPOperation;
  dimension?: string;
  secondaryDimension?: string;
  metric: string;
  aggregation: 'SUM' | 'COUNT' | 'AVG' | 'MIN' | 'MAX';
  sliceCondition?: { dimension: string; value: string };
  diceConditions?: Array<{ dimension: string; value: string }>;
  timeLevel?: 'year' | 'quarter' | 'month' | 'day';
  hierarchicalLevel?: 'category' | 'product';
}

export interface OLAPPivotMatrix {
  rowDimension: string;
  colDimension: string;
  colHeaders: string[];
  matrix: Array<{ rowValue: string; cols: Record<string, number>; rowTotal: number }>;
  grandTotal: number;
}

export interface OLAPResult {
  title: string;
  operation: OLAPOperation;
  headers: string[];
  rows: Record<string, any>[];
  pivotData?: OLAPPivotMatrix;
  summaryMetrics?: {
    totalRecords: number;
    aggregatedTotal: number;
    formattedTotal: string;
  };
}

export interface WarehouseIntegrityReport {
  status: 'PASS' | 'WARNING' | 'FAIL';
  orphanForeignKeyCount: number;
  uniqueSurrogateKeyPass: boolean;
  dateParsingPass: boolean;
  measuresIntegrityPass: boolean;
  notes: string[];
}

export interface WarehouseSourceComparison {
  sourceRows: number;
  factRows: number;
  sourceSales: number;
  factSales: number;
  sourceProfit: number;
  factProfit: number;
  dimensionsMatch: boolean;
  notes: string[];
}

export interface WarehouseStatistics {
  factRecords: number;
  dimensionTablesCount: number;
  totalDimensionRecords: number;
  measuresCount: number;
  dimensionsCount: number;
  dateRange: string;
  buildStatus: 'Complete' | 'Requires Rebuild' | 'Empty';
}
