import { TimeSeriesPoint, TimeGranularity, AggregationType } from '../../types/analytics';
import { executeAggregation } from './aggregation';
import { isMissing, isDateValue } from '../dataAnalysis';

/**
 * Normalizes date string into chronological period buckets:
 * - Daily: YYYY-MM-DD
 * - Weekly: YYYY-Www
 * - Monthly: YYYY-MM (e.g. "2026-10" or "Oct 2026")
 * - Quarterly: YYYY-Qx (e.g. "2026 Q3")
 * - Yearly: YYYY
 */
export function formatBucketKey(date: Date, granularity: TimeGranularity): { key: string; label: string; timestamp: number } {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11
  const day = date.getDate();

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  switch (granularity) {
    case 'daily': {
      const dKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return {
        key: dKey,
        label: `${monthNames[month]} ${day}, ${year}`,
        timestamp: new Date(year, month, day).getTime()
      };
    }
    case 'weekly': {
      // Calculate ISO week
      const target = new Date(date.valueOf());
      const dayNr = (date.getDay() + 6) % 7;
      target.setDate(target.getDate() - dayNr + 3);
      const firstThursday = target.valueOf();
      target.setMonth(0, 1);
      if (target.getDay() !== 4) {
        target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
      }
      const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
      return {
        key: `${year}-W${String(weekNumber).padStart(2, '0')}`,
        label: `Wk ${weekNumber} ${year}`,
        timestamp: date.getTime()
      };
    }
    case 'quarterly': {
      const quarter = Math.floor(month / 3) + 1;
      return {
        key: `${year}-Q${quarter}`,
        label: `Q${quarter} ${year}`,
        timestamp: new Date(year, (quarter - 1) * 3, 1).getTime()
      };
    }
    case 'yearly': {
      return {
        key: `${year}`,
        label: `${year}`,
        timestamp: new Date(year, 0, 1).getTime()
      };
    }
    case 'monthly':
    default: {
      const mKey = `${year}-${String(month + 1).padStart(2, '0')}`;
      return {
        key: mKey,
        label: `${monthNames[month]} ${year}`,
        timestamp: new Date(year, month, 1).getTime()
      };
    }
  }
}

/**
 * Aggregates dataset into chronological time-series points with period-over-period growth.
 */
export function aggregateTimeSeries(
  data: Record<string, any>[],
  dateColumn: string,
  metricColumn?: string,
  granularity: TimeGranularity = 'monthly',
  aggregationType: AggregationType = 'SUM'
): TimeSeriesPoint[] {
  if (!data || data.length === 0 || !dateColumn) return [];

  // 1. Group records by time bucket
  const buckets: Record<string, { label: string; timestamp: number; rows: Record<string, any>[] }> = {};

  for (let i = 0; i < data.length; i++) {
    const rawDate = data[i][dateColumn];
    if (isMissing(rawDate)) continue;

    const parsedMs = Date.parse(String(rawDate));
    if (isNaN(parsedMs)) continue;

    const dateObj = new Date(parsedMs);
    const { key, label, timestamp } = formatBucketKey(dateObj, granularity);

    if (!buckets[key]) {
      buckets[key] = { label, timestamp, rows: [] };
    }
    buckets[key].rows.push(data[i]);
  }

  // 2. Sort chronologically
  const sortedKeys = Object.keys(buckets).sort((a, b) => buckets[a].timestamp - buckets[b].timestamp);

  // 3. Compute values and growth %
  const points: TimeSeriesPoint[] = [];

  for (let i = 0; i < sortedKeys.length; i++) {
    const key = sortedKeys[i];
    const item = buckets[key];
    const val = executeAggregation(item.rows, metricColumn, aggregationType);

    let growthPercent: number | null = null;
    let prevVal: number | undefined = undefined;

    if (i > 0) {
      prevVal = points[i - 1].value;
      if (prevVal > 0) {
        growthPercent = Number((((val - prevVal) / prevVal) * 100).toFixed(1));
      } else if (prevVal === 0 && val > 0) {
        growthPercent = 100;
      }
    }

    let formattedValue = val.toLocaleString();
    if (val >= 1000000) {
      formattedValue = `$${(val / 1000000).toFixed(2)}M`;
    } else if (val >= 1000) {
      formattedValue = `$${(val / 1000).toFixed(1)}k`;
    }

    points.push({
      period: item.label,
      timestamp: item.timestamp,
      value: val,
      formattedValue,
      previousValue: prevVal,
      growthPercent
    });
  }

  return points;
}
