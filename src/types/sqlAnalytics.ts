export interface SQLColumnSchema {
  name: string;
  dataType: 'TEXT' | 'INTEGER' | 'DECIMAL' | 'DATE' | 'BOOLEAN';
  nullable: boolean;
  description: string;
  sampleValue?: string | number;
}

export interface SQLTableSchema {
  tableName: string;
  rowCount: number;
  columns: SQLColumnSchema[];
}

export interface SQLQueryResult {
  query: string;
  success: boolean;
  columns: string[];
  rows: Record<string, any>[];
  rowCount: number;
  executionTimeMs: number;
  error?: string;
  timestamp: string;
}

export interface SavedSQLQuery {
  id: string;
  name: string;
  sql: string;
  description: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface SQLHistoryItem {
  id: string;
  query: string;
  executionTimeMs: number;
  rowCount: number;
  status: 'SUCCESS' | 'ERROR';
  timestamp: string;
}

export interface SQLBusinessQuestion {
  id: string;
  category: string;
  question: string;
  sql: string;
  explanation: string;
  expectedInsight: string;
}

export interface SQLValidationItem {
  metricName: string;
  analyticsValue: number | string;
  sqlValue: number | string;
  status: 'MATCHED' | 'DISCREPANCY';
  toleranceDelta?: number;
  notes: string;
}
