import { GroupedResult, RankingResult, AggregationType } from '../../types/analytics';
import { executeAggregation } from './aggregation';
import { isMissing } from '../dataAnalysis';

/**
 * Generic GROUP BY calculation for any dimension and metric.
 */
export function groupBy(
  data: Record<string, any>[],
  dimensionColumn: string,
  metricColumn?: string,
  aggregationType: AggregationType = 'SUM'
): GroupedResult[] {
  if (!data || data.length === 0 || !dimensionColumn) return [];

  // 1. Group records by dimension value
  const groups: Record<string, Record<string, any>[]> = {};
  for (let i = 0; i < data.length; i++) {
    const rawVal = data[i][dimensionColumn];
    const key = isMissing(rawVal) ? 'Unspecified' : String(rawVal).trim();
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(data[i]);
  }

  // 2. Aggregate each group
  let totalAcrossAllGroups = 0;
  const rawResults: {
    dimensionValue: string;
    recordCount: number;
    value: number;
    average: number;
    min: number;
    max: number;
  }[] = [];

  for (const [key, groupRows] of Object.entries(groups)) {
    const value = executeAggregation(groupRows, metricColumn, aggregationType);
    const avgVal = metricColumn ? executeAggregation(groupRows, metricColumn, 'AVERAGE') : 1;
    const minVal = metricColumn ? executeAggregation(groupRows, metricColumn, 'MIN') : 0;
    const maxVal = metricColumn ? executeAggregation(groupRows, metricColumn, 'MAX') : 0;

    totalAcrossAllGroups += value;

    rawResults.push({
      dimensionValue: key,
      recordCount: groupRows.length,
      value,
      average: avgVal,
      min: minVal,
      max: maxVal
    });
  }

  // Sort descending by value by default
  rawResults.sort((a, b) => b.value - a.value);

  // 3. Format output with percentage shares
  return rawResults.map(item => {
    const share = totalAcrossAllGroups > 0 
      ? Number(((item.value / totalAcrossAllGroups) * 100).toFixed(1)) 
      : 0;

    let formattedValue = item.value.toLocaleString();
    if (item.value >= 1000000) {
      formattedValue = `$${(item.value / 1000000).toFixed(2)}M`;
    } else if (item.value >= 1000) {
      formattedValue = `$${(item.value / 1000).toFixed(1)}k`;
    }

    return {
      ...item,
      percentageShare: share,
      formattedValue
    };
  });
}

/**
 * Reusable TOP-N & BOTTOM-N Ranking Engine
 */
export function topN(
  data: Record<string, any>[],
  dimensionColumn: string,
  metricColumn?: string,
  n: number = 10,
  order: 'ASC' | 'DESC' = 'DESC',
  aggregationType: AggregationType = 'SUM'
): RankingResult[] {
  const grouped = groupBy(data, dimensionColumn, metricColumn, aggregationType);
  if (grouped.length === 0) return [];

  // Sort based on order
  if (order === 'ASC') {
    grouped.sort((a, b) => a.value - b.value);
  } else {
    grouped.sort((a, b) => b.value - a.value);
  }

  const sliced = grouped.slice(0, Math.max(1, n));
  const totalValue = grouped.reduce((acc, item) => acc + item.value, 0);

  return sliced.map((item, idx) => {
    const percentageOfTotal = totalValue > 0 
      ? Number(((item.value / totalValue) * 100).toFixed(1)) 
      : 0;

    return {
      rank: idx + 1,
      dimensionValue: item.dimensionValue,
      metricValue: item.value,
      formattedValue: item.value.toLocaleString(),
      percentageOfTotal
    };
  });
}
