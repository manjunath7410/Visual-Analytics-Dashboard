import { ColumnMetadata, ColumnDataType, DatasetStatistics } from '../types/dataset';

export function isMissing(val: any): boolean {
  if (val === null || val === undefined) return true;
  if (typeof val === 'string') {
    const trimmed = val.trim().toLowerCase();
    return trimmed === '' || trimmed === 'na' || trimmed === 'n/a' || trimmed === 'null' || trimmed === 'none' || trimmed === 'nan' || trimmed === '-';
  }
  if (typeof val === 'number' && (isNaN(val) || !isFinite(val))) return true;
  return false;
}

export function isNumericValue(val: any): boolean {
  if (isMissing(val)) return false;
  if (typeof val === 'number') return !isNaN(val) && isFinite(val);
  if (typeof val === 'string') {
    // Strip common currency and thousand separators
    const cleaned = val.trim().replace(/^[$€£¥]/, '').replace(/,/g, '').replace(/%$/, '');
    if (cleaned === '') return false;
    const num = Number(cleaned);
    return !isNaN(num) && isFinite(num);
  }
  return false;
}

export function parseNumericValue(val: any): number {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const cleaned = val.trim().replace(/^[$€£¥]/, '').replace(/,/g, '').replace(/%$/, '');
    return Number(cleaned);
  }
  return 0;
}

export function isDateValue(val: any): boolean {
  if (isMissing(val)) return false;
  if (typeof val !== 'string') return false;
  const str = val.trim();
  // Avoid treating plain numbers as timestamps
  if (!isNaN(Number(str))) return false;
  // Common date formats: YYYY-MM-DD, MM/DD/YYYY, DD-MM-YYYY, ISO strings
  const dateRegex = /^\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}(?:[T\s]\d{1,2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)?$/;
  if (!dateRegex.test(str)) return false;
  const timestamp = Date.parse(str);
  return !isNaN(timestamp);
}

export function analyzeDataset(
  rawRows: Record<string, any>[],
  headers: string[]
): {
  typedRows: Record<string, any>[];
  columns: ColumnMetadata[];
  statistics: DatasetStatistics;
} {
  // Deduplicate and sanitize headers
  const uniqueHeaders: string[] = [];
  const seenHeaderSet = new Set<string>();
  headers.forEach((h, idx) => {
    let name = (h || `Column_${idx + 1}`).trim();
    if (seenHeaderSet.has(name)) {
      let count = 1;
      while (seenHeaderSet.has(`${name}_${count}`)) {
        count++;
      }
      name = `${name}_${count}`;
    }
    seenHeaderSet.add(name);
    uniqueHeaders.push(name);
  });

  const rowCount = rawRows.length;
  const columnCount = uniqueHeaders.length;

  if (rowCount === 0) {
    return {
      typedRows: [],
      columns: uniqueHeaders.map(h => ({
        name: h,
        type: 'Text',
        nonEmptyCount: 0,
        missingCount: 0,
        uniqueCount: 0,
      })),
      statistics: {
        rowCount: 0,
        columnCount,
        missingValuesCount: 0,
        duplicateRowsCount: 0,
        numericColumnsCount: 0,
        categoricalColumnsCount: 0,
        dateColumnsCount: 0,
        emptyColumnsCount: columnCount,
      }
    };
  }

  // 1. Detect duplicate rows
  const rowSignatures = new Set<string>();
  let duplicateRowsCount = 0;
  for (let i = 0; i < rowCount; i++) {
    const row = rawRows[i];
    // Hash key from column values
    const signature = uniqueHeaders.map(h => String(row[h] ?? '')).join('|');
    if (rowSignatures.has(signature)) {
      duplicateRowsCount++;
    } else {
      rowSignatures.add(signature);
    }
  }

  // 2. Analyze each column
  let totalMissingCount = 0;
  let emptyColumnsCount = 0;
  let numericColumnsCount = 0;
  let categoricalColumnsCount = 0;
  let dateColumnsCount = 0;

  const columnAnalysis: ColumnMetadata[] = [];
  const columnTypes: Record<string, ColumnDataType> = {};

  uniqueHeaders.forEach((header) => {
    let missingInCol = 0;
    let numericCandidates = 0;
    let dateCandidates = 0;
    const uniqueValuesSet = new Set<string>();
    const numericValues: number[] = [];
    const dateValues: number[] = [];

    for (let i = 0; i < rowCount; i++) {
      const val = rawRows[i][header];
      if (isMissing(val)) {
        missingInCol++;
      } else {
        uniqueValuesSet.add(String(val).trim());

        if (isNumericValue(val)) {
          numericCandidates++;
          numericValues.push(parseNumericValue(val));
        }

        if (isDateValue(val)) {
          dateCandidates++;
          dateValues.push(Date.parse(String(val)));
        }
      }
    }

    totalMissingCount += missingInCol;
    const nonEmptyInCol = rowCount - missingInCol;

    if (nonEmptyInCol === 0) {
      emptyColumnsCount++;
    }

    // Determine type
    let colType: ColumnDataType = 'Text';
    if (nonEmptyInCol > 0) {
      const numRatio = numericCandidates / nonEmptyInCol;
      const dateRatio = dateCandidates / nonEmptyInCol;

      if (numRatio >= 0.85) {
        colType = 'Number';
        numericColumnsCount++;
      } else if (dateRatio >= 0.85) {
        colType = 'Date';
        dateColumnsCount++;
      } else if (uniqueValuesSet.size <= 40 || (uniqueValuesSet.size / nonEmptyInCol <= 0.25 && uniqueValuesSet.size <= 100)) {
        colType = 'Category';
        categoricalColumnsCount++;
      } else {
        colType = 'Text';
      }
    } else {
      colType = 'Text';
    }

    columnTypes[header] = colType;

    // Compute min, max, mean for numbers
    let min: number | undefined;
    let max: number | undefined;
    let mean: number | undefined;
    if (colType === 'Number' && numericValues.length > 0) {
      min = Math.min(...numericValues);
      max = Math.max(...numericValues);
      const sum = numericValues.reduce((a, b) => a + b, 0);
      mean = Number((sum / numericValues.length).toFixed(2));
    }

    // Compute min, max for dates
    let minDate: string | undefined;
    let maxDate: string | undefined;
    if (colType === 'Date' && dateValues.length > 0) {
      minDate = new Date(Math.min(...dateValues)).toISOString().split('T')[0];
      maxDate = new Date(Math.max(...dateValues)).toISOString().split('T')[0];
    }

    columnAnalysis.push({
      name: header,
      type: colType,
      nonEmptyCount: nonEmptyInCol,
      missingCount: missingInCol,
      uniqueCount: uniqueValuesSet.size,
      uniqueValues: colType === 'Category' ? Array.from(uniqueValuesSet).slice(0, 50).sort() : undefined,
      min,
      max,
      mean,
      minDate,
      maxDate,
    });
  });

  // 3. Transform typed rows so numeric fields are numbers, etc.
  const typedRows: Record<string, any>[] = rawRows.map((row, idx) => {
    const typedRow: Record<string, any> = { __rowIndex: idx + 1 };
    headers.forEach((h) => {
      const val = row[h];
      const type = columnTypes[h];

      if (isMissing(val)) {
        typedRow[h] = null;
      } else if (type === 'Number') {
        typedRow[h] = parseNumericValue(val);
      } else {
        typedRow[h] = typeof val === 'string' ? val.trim() : val;
      }
    });
    return typedRow;
  });

  return {
    typedRows,
    columns: columnAnalysis,
    statistics: {
      rowCount,
      columnCount,
      missingValuesCount: totalMissingCount,
      duplicateRowsCount,
      numericColumnsCount,
      categoricalColumnsCount,
      dateColumnsCount,
      emptyColumnsCount,
    }
  };
}
