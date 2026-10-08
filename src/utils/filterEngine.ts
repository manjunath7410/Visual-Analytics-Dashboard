import { ColumnMetadata } from '../types/dataset';
import { isMissing, isNumericValue, parseNumericValue } from './dataAnalysis';

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

export interface FacetedOption {
  value: string;
  count: number;
}

export const EMPTY_FILTER_STATE: AdvancedFilterState = {
  dateRange: null,
  categoricalFilters: {},
  numericFilters: {},
  searchTerm: ''
};

/**
 * Filter Engine API
 */
export class FilterEngine {
  /**
   * Applies all active filters (date, categorical, numeric, search) to dataset rows
   */
  public static applyFilters(
    rows: Record<string, any>[],
    filters: AdvancedFilterState
  ): Record<string, any>[] {
    if (!rows || rows.length === 0) return [];

    return rows.filter((row) => {
      // 1. Search Term Filter
      if (filters.searchTerm && filters.searchTerm.trim() !== '') {
        const query = filters.searchTerm.toLowerCase().trim();
        const matches = Object.values(row).some((val) => {
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(query);
        });
        if (!matches) return false;
      }

      // 2. Date Range Filter
      if (filters.dateRange && filters.dateRange.column) {
        const rowDateVal = row[filters.dateRange.column];
        if (isMissing(rowDateVal)) return false;

        const dateStr = String(rowDateVal).split('T')[0];
        if (filters.dateRange.start && dateStr < filters.dateRange.start) {
          return false;
        }
        if (filters.dateRange.end && dateStr > filters.dateRange.end) {
          return false;
        }
      }

      // 3. Categorical Multi-Select Filters
      for (const [col, selectedVals] of Object.entries(filters.categoricalFilters)) {
        if (selectedVals && selectedVals.length > 0) {
          const rawVal = row[col];
          const valStr = isMissing(rawVal) ? 'Unspecified' : String(rawVal).trim();
          if (!selectedVals.includes(valStr)) {
            return false;
          }
        }
      }

      // 4. Numeric Range Filters
      for (const [col, range] of Object.entries(filters.numericFilters)) {
        if (range && (range.min !== null || range.max !== null)) {
          const rawVal = row[col];
          if (!isNumericValue(rawVal)) return false;
          const num = parseNumericValue(rawVal);
          if (isNaN(num)) return false;

          if (range.min !== null && num < range.min) return false;
          if (range.max !== null && num > range.max) return false;
        }
      }

      return true;
    });
  }

  /**
   * Evaluates cascading faceted options with accurate counts for a categorical column.
   * Note: It applies all filters EXCEPT the target column's own filter, so available options
   * reflect the current context without collapsing the dropdown into only selected items!
   */
  public static getFacetedOptions(
    rows: Record<string, any>[],
    targetColumn: string,
    filters: AdvancedFilterState
  ): FacetedOption[] {
    if (!rows || rows.length === 0 || !targetColumn) return [];

    // Create a filter state that excludes the target column's own categorical filter
    const partialFilters: AdvancedFilterState = {
      ...filters,
      categoricalFilters: { ...filters.categoricalFilters }
    };
    delete partialFilters.categoricalFilters[targetColumn];

    // Filter rows based on all OTHER active criteria
    const contextualRows = FilterEngine.applyFilters(rows, partialFilters);

    // Compute counts
    const counts = new Map<string, number>();
    for (let i = 0; i < contextualRows.length; i++) {
      const raw = contextualRows[i][targetColumn];
      const key = isMissing(raw) ? 'Unspecified' : String(raw).trim();
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    // Convert to sorted array (highest volume first)
    const options: FacetedOption[] = Array.from(counts.entries()).map(([value, count]) => ({
      value,
      count
    }));

    options.sort((a, b) => b.count - a.count);
    return options;
  }

  /**
   * Evaluates detected minimum and maximum boundaries for a numeric column
   */
  public static getNumericBoundaries(
    rows: Record<string, any>[],
    column: string
  ): { min: number; max: number } {
    let min = Infinity;
    let max = -Infinity;

    for (let i = 0; i < rows.length; i++) {
      const val = rows[i][column];
      if (isNumericValue(val)) {
        const num = parseNumericValue(val);
        if (!isNaN(num) && isFinite(num)) {
          if (num < min) min = num;
          if (num > max) max = num;
        }
      }
    }

    if (min === Infinity || max === -Infinity) {
      return { min: 0, max: 100 };
    }

    return { min: Math.floor(min), max: Math.ceil(max) };
  }

  /**
   * Evaluates chronological boundaries for a date column
   */
  public static getDateBoundaries(
    rows: Record<string, any>[],
    column: string
  ): { minDate: string; maxDate: string } {
    let minDate = '';
    let maxDate = '';

    for (let i = 0; i < rows.length; i++) {
      const val = rows[i][column];
      if (!isMissing(val)) {
        const str = String(val).split('T')[0];
        if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
          if (!minDate || str < minDate) minDate = str;
          if (!maxDate || str > maxDate) maxDate = str;
        }
      }
    }

    return { minDate, maxDate };
  }

  /**
   * Evaluates start/end dates for quick presets
   */
  public static calculateDatePresetRange(
    preset: string,
    minBound: string,
    maxBound: string
  ): { start: string; end: string } {
    // If no boundary, anchor around reference date or maxBound
    const refDate = maxBound ? new Date(maxBound) : new Date();
    const year = refDate.getFullYear();
    const month = refDate.getMonth(); // 0-11
    const day = refDate.getDate();

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    switch (preset) {
      case 'today': {
        const dStr = formatDate(refDate);
        return { start: dStr, end: dStr };
      }
      case 'this_week': {
        const start = new Date(refDate);
        start.setDate(day - refDate.getDay());
        return { start: formatDate(start), end: formatDate(refDate) };
      }
      case 'this_month': {
        const start = new Date(year, month, 1);
        return { start: formatDate(start), end: formatDate(refDate) };
      }
      case 'last_month': {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0);
        return { start: formatDate(start), end: formatDate(end) };
      }
      case 'this_quarter': {
        const q = Math.floor(month / 3);
        const start = new Date(year, q * 3, 1);
        return { start: formatDate(start), end: formatDate(refDate) };
      }
      case 'last_quarter': {
        const q = Math.floor(month / 3) - 1;
        const start = new Date(year, q * 3, 1);
        const end = new Date(year, (q + 1) * 3, 0);
        return { start: formatDate(start), end: formatDate(end) };
      }
      case 'this_year': {
        const start = new Date(year, 0, 1);
        return { start: formatDate(start), end: formatDate(refDate) };
      }
      case 'last_year': {
        const start = new Date(year - 1, 0, 1);
        const end = new Date(year - 1, 11, 31);
        return { start: formatDate(start), end: formatDate(end) };
      }
      case 'all':
      default:
        return { start: minBound, end: maxBound };
    }
  }

  /**
   * Counts active filters
   */
  public static countActiveFilters(filters: AdvancedFilterState): number {
    let count = 0;
    if (filters.searchTerm && filters.searchTerm.trim() !== '') count++;
    if (filters.dateRange && (filters.dateRange.start || filters.dateRange.end)) count++;
    for (const vals of Object.values(filters.categoricalFilters)) {
      if (vals && vals.length > 0) count++;
    }
    for (const r of Object.values(filters.numericFilters)) {
      if (r && (r.min !== null || r.max !== null)) count++;
    }
    return count;
  }
}
