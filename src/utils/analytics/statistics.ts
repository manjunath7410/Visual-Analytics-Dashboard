import { DescriptiveStatistics, CorrelationResult } from '../../types/analytics';
import { sum, average, median, min, max, stdDev, variance, extractNumericSeries } from './aggregation';
import { isNumericValue, parseNumericValue } from '../dataAnalysis';

/**
 * Calculates full descriptive statistics for a numerical column
 */
export function calculateDescriptiveStatistics(
  data: Record<string, any>[],
  columnName: string
): DescriptiveStatistics {
  const series = extractNumericSeries(data, columnName);

  if (series.length === 0) {
    return {
      column: columnName,
      count: 0,
      mean: 0,
      median: 0,
      min: 0,
      max: 0,
      stdDev: 0,
      variance: 0,
      sum: 0
    };
  }

  return {
    column: columnName,
    count: series.length,
    mean: average(data, columnName),
    median: median(data, columnName),
    min: min(data, columnName),
    max: max(data, columnName),
    stdDev: stdDev(data, columnName),
    variance: variance(data, columnName),
    sum: sum(data, columnName)
  };
}

/**
 * Calculates Pearson Correlation Coefficient (r) between two numeric columns.
 * Formula: r = sum((x - meanX) * (y - meanY)) / sqrt(sum((x - meanX)^2) * sum((y - meanY)^2))
 */
export function calculatePearsonCorrelation(
  data: Record<string, any>[],
  columnA: string,
  columnB: string
): CorrelationResult {
  const pairs: [number, number][] = [];

  for (let i = 0; i < data.length; i++) {
    const valA = data[i][columnA];
    const valB = data[i][columnB];

    if (isNumericValue(valA) && isNumericValue(valB)) {
      const numA = parseNumericValue(valA);
      const numB = parseNumericValue(valB);
      if (!isNaN(numA) && isFinite(numA) && !isNaN(numB) && !isFinite(numB) === false) {
        pairs.push([numA, numB]);
      }
    }
  }

  const n = pairs.length;
  if (n < 3) {
    return {
      columnA,
      columnB,
      coefficient: 0,
      strength: 'Weak / None',
      sampleSize: n
    };
  }

  // Calculate means
  const meanA = pairs.reduce((acc, p) => acc + p[0], 0) / n;
  const meanB = pairs.reduce((acc, p) => acc + p[1], 0) / n;

  // Calculate numerator and denominators
  let num = 0;
  let denA = 0;
  let denB = 0;

  for (let i = 0; i < n; i++) {
    const diffA = pairs[i][0] - meanA;
    const diffB = pairs[i][1] - meanB;
    num += diffA * diffB;
    denA += diffA * diffA;
    denB += diffB * diffB;
  }

  const den = Math.sqrt(denA * denB);
  let coefficient = 0;
  if (den > 0) {
    coefficient = Number((num / den).toFixed(2));
    coefficient = Math.max(-1, Math.min(1, coefficient));
  }

  let strength: CorrelationResult['strength'] = 'Weak / None';
  if (coefficient >= 0.7) {
    strength = 'Strong Positive';
  } else if (coefficient >= 0.3) {
    strength = 'Moderate Positive';
  } else if (coefficient <= -0.7) {
    strength = 'Strong Negative';
  } else if (coefficient <= -0.3) {
    strength = 'Moderate Negative';
  }

  return {
    columnA,
    columnB,
    coefficient,
    strength,
    sampleSize: n
  };
}

/**
 * Calculates a complete pairwise correlation matrix for all numeric columns
 */
export function calculateCorrelationMatrix(
  data: Record<string, any>[],
  numericColumns: string[]
): CorrelationResult[] {
  const results: CorrelationResult[] = [];

  for (let i = 0; i < numericColumns.length; i++) {
    for (let j = i + 1; j < numericColumns.length; j++) {
      results.push(calculatePearsonCorrelation(data, numericColumns[i], numericColumns[j]));
    }
  }

  return results;
}
