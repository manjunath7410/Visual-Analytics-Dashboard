import { ColumnMetadata, DatasetStatistics } from '../types/dataset';
import { 
  DataQualityReport, 
  QualityRating, 
  QualityFactor, 
  MissingValueColumnReport, 
  OutlierColumnReport 
} from '../types/etl';
import { isMissing, isNumericValue, parseNumericValue, isDateValue } from './dataAnalysis';

/**
 * Calculates a reliable Data Quality Score from 0 to 100 based on actual dataset issues.
 * Formula penalizes:
 * - Missing values (% of total cells)
 * - Duplicate rows (% of dataset)
 * - Empty columns
 * - Invalid numeric & date values
 */
export function calculateDataQuality(
  rows: Record<string, any>[],
  columns: ColumnMetadata[],
  statistics: DatasetStatistics
): DataQualityReport {
  if (!rows || rows.length === 0 || columns.length === 0) {
    return {
      score: 100,
      rating: 'Excellent',
      factors: [],
      totalIssues: 0
    };
  }

  const totalCells = statistics.rowCount * statistics.columnCount;
  const factors: QualityFactor[] = [];
  let score = 100;
  let totalIssues = 0;

  // 1. Missing Values penalty (up to 30 points)
  if (statistics.missingValuesCount > 0 && totalCells > 0) {
    const missingRatio = statistics.missingValuesCount / totalCells;
    const penalty = Math.min(30, Math.round(missingRatio * 100 * 2));
    score -= penalty;
    totalIssues += statistics.missingValuesCount;
    factors.push({
      name: 'Missing Cell Values',
      impactScore: penalty,
      description: `${statistics.missingValuesCount.toLocaleString()} cells (${(missingRatio * 100).toFixed(1)}% of all cells) contain null or missing data.`,
      count: statistics.missingValuesCount
    });
  }

  // 2. Duplicate Rows penalty (up to 25 points)
  if (statistics.duplicateRowsCount > 0 && statistics.rowCount > 0) {
    const duplicateRatio = statistics.duplicateRowsCount / statistics.rowCount;
    const penalty = Math.min(25, Math.round(duplicateRatio * 100 * 1.5));
    score -= penalty;
    totalIssues += statistics.duplicateRowsCount;
    factors.push({
      name: 'Duplicate Records',
      impactScore: penalty,
      description: `${statistics.duplicateRowsCount.toLocaleString()} duplicate rows (${(duplicateRatio * 100).toFixed(1)}% of rows) found in the dataset.`,
      count: statistics.duplicateRowsCount
    });
  }

  // 3. Empty Columns penalty (up to 20 points, 10 pts per empty column)
  if (statistics.emptyColumnsCount > 0) {
    const penalty = Math.min(20, statistics.emptyColumnsCount * 10);
    score -= penalty;
    totalIssues += statistics.emptyColumnsCount;
    factors.push({
      name: 'Empty Columns',
      impactScore: penalty,
      description: `${statistics.emptyColumnsCount} column(s) contain 100% missing values across all rows.`,
      count: statistics.emptyColumnsCount
    });
  }

  // 4. Inconsistent Column Types / High Missing Rate Columns
  const problematicColumns = columns.filter(c => {
    if (statistics.rowCount === 0) return false;
    const missingRate = c.missingCount / statistics.rowCount;
    return missingRate > 0.4 && missingRate < 1.0;
  });

  if (problematicColumns.length > 0) {
    const penalty = Math.min(15, problematicColumns.length * 4);
    score -= penalty;
    totalIssues += problematicColumns.length;
    factors.push({
      name: 'High-Missing Columns',
      impactScore: penalty,
      description: `${problematicColumns.length} column(s) have more than 40% missing data (${problematicColumns.map(c => c.name).slice(0, 3).join(', ')}).`,
      count: problematicColumns.length
    });
  }

  // Normalize score between 0 and 100
  score = Math.max(0, Math.min(100, Math.round(score)));

  let rating: QualityRating = 'Excellent';
  if (score >= 90) {
    rating = 'Excellent';
  } else if (score >= 75) {
    rating = 'Good';
  } else if (score >= 50) {
    rating = 'Needs Attention';
  } else {
    rating = 'Poor';
  }

  return {
    score,
    rating,
    factors,
    totalIssues
  };
}

/**
 * Missing value analysis per column
 */
export function analyzeMissingValuesPerColumn(
  rows: Record<string, any>[],
  columns: ColumnMetadata[]
): MissingValueColumnReport[] {
  const totalRows = rows.length;

  return columns.map((col) => {
    const missing = col.missingCount;
    const nonMissing = totalRows - missing;
    const missingPercent = totalRows > 0 ? Number(((missing / totalRows) * 100).toFixed(2)) : 0;

    let status: 'Good' | 'Attention' | 'Critical' = 'Good';
    if (missingPercent > 15) {
      status = 'Critical';
    } else if (missingPercent > 2) {
      status = 'Attention';
    }

    return {
      columnName: col.name,
      dataType: col.type,
      total: totalRows,
      missing,
      missingPercent,
      nonMissing,
      status
    };
  });
}

/**
 * Calculates median and mode for filling missing values
 */
export function calculateColumnAggregates(rows: Record<string, any>[], columnName: string) {
  const numbers: number[] = [];
  const freqMap: Record<string, number> = {};

  for (let i = 0; i < rows.length; i++) {
    const val = rows[i][columnName];
    if (!isMissing(val)) {
      if (isNumericValue(val)) {
        numbers.push(parseNumericValue(val));
      }
      const str = String(val).trim();
      freqMap[str] = (freqMap[str] || 0) + 1;
    }
  }

  // Mode calculation
  let mode = '';
  let maxFreq = 0;
  for (const [k, v] of Object.entries(freqMap)) {
    if (v > maxFreq) {
      maxFreq = v;
      mode = k;
    }
  }

  // Mean & Median
  let mean = 0;
  let median = 0;
  if (numbers.length > 0) {
    numbers.sort((a, b) => a - b);
    const sum = numbers.reduce((a, b) => a + b, 0);
    mean = Number((sum / numbers.length).toFixed(2));
    const mid = Math.floor(numbers.length / 2);
    median = numbers.length % 2 !== 0 ? numbers[mid] : Number(((numbers[mid - 1] + numbers[mid]) / 2).toFixed(2));
  }

  return { mean, median, mode };
}

/**
 * Outlier detection using the Interquartile Range (IQR) method:
 * Q1 = 25th percentile, Q3 = 75th percentile, IQR = Q3 - Q1
 * Lower = Q1 - 1.5 * IQR, Upper = Q3 + 1.5 * IQR
 */
export function detectOutliersIQR(
  rows: Record<string, any>[],
  numericColumns: ColumnMetadata[]
): OutlierColumnReport[] {
  const reports: OutlierColumnReport[] = [];

  numericColumns.forEach((col) => {
    const values: number[] = [];
    for (let i = 0; i < rows.length; i++) {
      const val = rows[i][col.name];
      if (isNumericValue(val)) {
        values.push(parseNumericValue(val));
      }
    }

    if (values.length < 5) return;

    values.sort((a, b) => a - b);
    const n = values.length;

    const q1Idx = Math.floor(n * 0.25);
    const q3Idx = Math.floor(n * 0.75);
    const q1 = values[q1Idx];
    const q3 = values[q3Idx];
    const iqr = q3 - q1;

    const lowerBound = Number((q1 - 1.5 * iqr).toFixed(2));
    const upperBound = Number((q3 + 1.5 * iqr).toFixed(2));

    let outlierCount = 0;
    for (let i = 0; i < values.length; i++) {
      if (values[i] < lowerBound || values[i] > upperBound) {
        outlierCount++;
      }
    }

    const outlierPercent = Number(((outlierCount / n) * 100).toFixed(1));

    reports.push({
      columnName: col.name,
      q1,
      q3,
      iqr,
      lowerBound,
      upperBound,
      outlierCount,
      outlierPercent
    });
  });

  return reports;
}

/**
 * Transformation: Remove duplicate rows based on column values
 */
export function executeRemoveDuplicates(
  rows: Record<string, any>[],
  headers: string[]
): { cleanedRows: Record<string, any>[]; removedCount: number } {
  const seenSignatures = new Set<string>();
  const cleanedRows: Record<string, any>[] = [];
  let removedCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const sig = headers.map(h => String(row[h] ?? '')).join('|--|');
    if (seenSignatures.has(sig)) {
      removedCount++;
    } else {
      seenSignatures.add(sig);
      cleanedRows.push(row);
    }
  }

  return { cleanedRows, removedCount };
}

/**
 * Transformation: Fill missing values with selected strategy
 */
export function executeFillMissing(
  rows: Record<string, any>[],
  columnName: string,
  strategy: 'mean' | 'median' | 'zero' | 'unknown' | 'mode' | 'custom',
  customValue?: any
): { cleanedRows: Record<string, any>[]; affectedCount: number } {
  let replacementVal: any = '';

  if (strategy === 'zero') {
    replacementVal = 0;
  } else if (strategy === 'unknown') {
    replacementVal = 'Unknown';
  } else if (strategy === 'custom') {
    replacementVal = customValue ?? '';
  } else {
    const { mean, median, mode } = calculateColumnAggregates(rows, columnName);
    if (strategy === 'mean') replacementVal = mean;
    else if (strategy === 'median') replacementVal = median;
    else if (strategy === 'mode') replacementVal = mode || 'Unknown';
  }

  let affectedCount = 0;
  const cleanedRows = rows.map(r => {
    if (isMissing(r[columnName])) {
      affectedCount++;
      return { ...r, [columnName]: replacementVal };
    }
    return r;
  });

  return { cleanedRows, affectedCount };
}

/**
 * Transformation: Remove rows with missing values in specified column
 */
export function executeRemoveMissingRows(
  rows: Record<string, any>[],
  columnName: string
): { cleanedRows: Record<string, any>[]; removedCount: number } {
  const cleanedRows = rows.filter(r => !isMissing(r[columnName]));
  const removedCount = rows.length - cleanedRows.length;
  return { cleanedRows, removedCount };
}

/**
 * Transformation: Clean numeric column (convert invalid text, replace with 0, or drop rows)
 */
export function executeCleanNumeric(
  rows: Record<string, any>[],
  columnName: string,
  strategy: 'to_missing' | 'replace_zero' | 'remove_rows'
): { cleanedRows: Record<string, any>[]; affectedCount: number } {
  let affectedCount = 0;
  let cleanedRows: Record<string, any>[] = [];

  if (strategy === 'remove_rows') {
    cleanedRows = rows.filter(r => {
      const val = r[columnName];
      if (isMissing(val)) return true; // keep nulls unless invalid
      const isValidNum = isNumericValue(val);
      if (!isValidNum) {
        affectedCount++;
        return false;
      }
      return true;
    });
  } else {
    cleanedRows = rows.map(r => {
      const val = r[columnName];
      if (isMissing(val)) return r;
      if (!isNumericValue(val)) {
        affectedCount++;
        return {
          ...r,
          [columnName]: strategy === 'replace_zero' ? 0 : null
        };
      }
      return { ...r, [columnName]: parseNumericValue(val) };
    });
  }

  return { cleanedRows, affectedCount };
}

/**
 * Transformation: Clean date column
 */
export function executeCleanDates(
  rows: Record<string, any>[],
  columnName: string,
  strategy: 'remove_invalid' | 'to_missing'
): { cleanedRows: Record<string, any>[]; affectedCount: number } {
  let affectedCount = 0;
  let cleanedRows: Record<string, any>[] = [];

  if (strategy === 'remove_invalid') {
    cleanedRows = rows.filter(r => {
      const val = r[columnName];
      if (isMissing(val)) return true;
      const isValid = isDateValue(val);
      if (!isValid) {
        affectedCount++;
        return false;
      }
      return true;
    });
  } else {
    cleanedRows = rows.map(r => {
      const val = r[columnName];
      if (isMissing(val)) return r;
      if (!isDateValue(val)) {
        affectedCount++;
        return { ...r, [columnName]: null };
      }
      return r;
    });
  }

  return { cleanedRows, affectedCount };
}

/**
 * Transformation: Normalize text in a column
 */
export function executeTextTransform(
  rows: Record<string, any>[],
  columnName: string,
  transformType: 'trim' | 'lowercase' | 'uppercase' | 'titlecase' | 'collapse_spaces'
): { cleanedRows: Record<string, any>[]; affectedCount: number } {
  let affectedCount = 0;

  const titleCase = (str: string) => {
    return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  const cleanedRows = rows.map(r => {
    const val = r[columnName];
    if (typeof val !== 'string' || isMissing(val)) return r;

    let transformed = val;
    if (transformType === 'trim') {
      transformed = val.trim();
    } else if (transformType === 'lowercase') {
      transformed = val.toLowerCase();
    } else if (transformType === 'uppercase') {
      transformed = val.toUpperCase();
    } else if (transformType === 'titlecase') {
      transformed = titleCase(val.trim());
    } else if (transformType === 'collapse_spaces') {
      transformed = val.replace(/\s+/g, ' ').trim();
    }

    if (transformed !== val) {
      affectedCount++;
    }

    return { ...r, [columnName]: transformed };
  });

  return { cleanedRows, affectedCount };
}

/**
 * Transformation: Remove Outliers beyond [lowerBound, upperBound]
 */
export function executeRemoveOutliers(
  rows: Record<string, any>[],
  columnName: string,
  lowerBound: number,
  upperBound: number
): { cleanedRows: Record<string, any>[]; removedCount: number } {
  const cleanedRows = rows.filter(r => {
    const val = r[columnName];
    if (!isNumericValue(val)) return true;
    const num = parseNumericValue(val);
    return num >= lowerBound && num <= upperBound;
  });

  const removedCount = rows.length - cleanedRows.length;
  return { cleanedRows, removedCount };
}
