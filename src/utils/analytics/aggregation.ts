import { isMissing, isNumericValue, parseNumericValue } from '../dataAnalysis';

/**
 * Extracts all valid numeric values for a specific column from records.
 * Filters out nulls, missing, non-finite, and NaN values.
 */
export function extractNumericSeries(data: Record<string, any>[], column: string): number[] {
  if (!data || data.length === 0 || !column) return [];

  const series: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const val = data[i][column];
    if (isNumericValue(val)) {
      const num = parseNumericValue(val);
      if (!isNaN(num) && isFinite(num)) {
        series.push(num);
      }
    }
  }
  return series;
}

/**
 * Computes SUM of column values.
 */
export function sum(data: Record<string, any>[], column?: string): number {
  if (!data || data.length === 0) return 0;
  if (!column) return data.length;

  const series = extractNumericSeries(data, column);
  if (series.length === 0) return 0;

  const total = series.reduce((acc, val) => acc + val, 0);
  return Number(total.toFixed(2));
}

/**
 * Computes arithmetic MEAN / AVERAGE.
 */
export function average(data: Record<string, any>[], column?: string): number {
  if (!data || data.length === 0) return 0;
  if (!column) return 1;

  const series = extractNumericSeries(data, column);
  if (series.length === 0) return 0;

  const total = series.reduce((acc, val) => acc + val, 0);
  const avg = total / series.length;
  return Number(avg.toFixed(2));
}

/**
 * Computes MINIMUM value in column.
 */
export function min(data: Record<string, any>[], column: string): number {
  const series = extractNumericSeries(data, column);
  if (series.length === 0) return 0;
  return Math.min(...series);
}

/**
 * Computes MAXIMUM value in column.
 */
export function max(data: Record<string, any>[], column: string): number {
  const series = extractNumericSeries(data, column);
  if (series.length === 0) return 0;
  return Math.max(...series);
}

/**
 * Counts rows.
 */
export function count(data: Record<string, any>[]): number {
  return data ? data.length : 0;
}

/**
 * Computes MEDIAN (50th percentile).
 */
export function median(data: Record<string, any>[], column: string): number {
  const series = extractNumericSeries(data, column);
  if (series.length === 0) return 0;

  series.sort((a, b) => a - b);
  const mid = Math.floor(series.length / 2);

  if (series.length % 2 !== 0) {
    return series[mid];
  }
  return Number(((series[mid - 1] + series[mid]) / 2).toFixed(2));
}

/**
 * Computes sample VARIANCE (s^2).
 */
export function variance(data: Record<string, any>[], column: string): number {
  const series = extractNumericSeries(data, column);
  if (series.length <= 1) return 0;

  const meanVal = average(data, column);
  const sumSquaredDiff = series.reduce((acc, val) => acc + Math.pow(val - meanVal, 2), 0);
  const v = sumSquaredDiff / (series.length - 1);
  return Number(v.toFixed(2));
}

/**
 * Computes STANDARD DEVIATION (s = sqrt(variance)).
 */
export function stdDev(data: Record<string, any>[], column: string): number {
  const v = variance(data, column);
  if (v <= 0) return 0;
  return Number(Math.sqrt(v).toFixed(2));
}

/**
 * Execute aggregation dynamically based on AggregationType.
 */
export function executeAggregation(
  data: Record<string, any>[],
  column: string | undefined,
  type: string
): number {
  switch (type.toUpperCase()) {
    case 'SUM':
      return column ? sum(data, column) : count(data);
    case 'COUNT':
      return count(data);
    case 'AVERAGE':
    case 'AVG':
      return column ? average(data, column) : 0;
    case 'MIN':
      return column ? min(data, column) : 0;
    case 'MAX':
      return column ? max(data, column) : 0;
    case 'MEDIAN':
      return column ? median(data, column) : 0;
    case 'STDDEV':
      return column ? stdDev(data, column) : 0;
    case 'VARIANCE':
      return column ? variance(data, column) : 0;
    default:
      return column ? sum(data, column) : count(data);
  }
}
