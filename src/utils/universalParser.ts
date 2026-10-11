import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ParsedDatasetFile {
  fileName: string;
  fileType: 'csv' | 'xlsx' | 'xls' | 'json' | 'tsv';
  fileSize: number;
  sheetNames?: string[];
  activeSheet?: string;
  rows: Record<string, any>[];
  headers: string[];
  warnings: string[];
  delimiter?: string;
}

export interface ParseOptions {
  sheetName?: string;
}

/**
 * Detects the file format from filename extension and MIME type
 */
export function detectFileFormat(file: File): 'csv' | 'xlsx' | 'xls' | 'json' | 'tsv' | null {
  const name = file.name.toLowerCase();
  if (name.endsWith('.csv')) return 'csv';
  if (name.endsWith('.xlsx')) return 'xlsx';
  if (name.endsWith('.xls')) return 'xls';
  if (name.endsWith('.json')) return 'json';
  if (name.endsWith('.tsv')) return 'tsv';
  if (name.endsWith('.txt')) {
    // Delimited text format (auto-detect TSV / CSV / pipe)
    return 'tsv';
  }

  // Fallback to MIME type
  const type = file.type.toLowerCase();
  if (type.includes('spreadsheet') || type.includes('excel')) return 'xlsx';
  if (type.includes('json')) return 'json';
  if (type.includes('csv')) return 'csv';
  if (type.includes('tab-separated-values')) return 'tsv';

  return null;
}

/**
 * Clean & sanitize row keys and values
 */
function sanitizeRowsAndHeaders(rawRows: Record<string, any>[]): { rows: Record<string, any>[]; headers: string[]; warnings: string[] } {
  const warnings: string[] = [];
  if (!rawRows || rawRows.length === 0) {
    return { rows: [], headers: [], warnings };
  }

  // Extract all unique headers across all rows
  const rawHeaderSet = new Set<string>();
  rawRows.forEach(r => {
    if (r && typeof r === 'object') {
      Object.keys(r).forEach(k => {
        const trimmed = String(k).trim();
        if (trimmed && !trimmed.startsWith('__EMPTY')) {
          rawHeaderSet.add(trimmed);
        }
      });
    }
  });

  const rawHeaders = Array.from(rawHeaderSet);
  if (rawHeaders.length === 0) {
    return { rows: [], headers: [], warnings };
  }

  // Deduplicate headers
  const seen = new Set<string>();
  const sanitizedHeaders: string[] = [];
  const headerMap = new Map<string, string>(); // original -> sanitized

  rawHeaders.forEach((h, idx) => {
    let name = h || `Column_${idx + 1}`;
    if (seen.has(name)) {
      let counter = 1;
      while (seen.has(`${name}_${counter}`)) {
        counter++;
      }
      const uniqueName = `${name}_${counter}`;
      warnings.push(`Duplicate column "${h}" was renamed to "${uniqueName}".`);
      name = uniqueName;
    }
    seen.add(name);
    sanitizedHeaders.push(name);
    headerMap.set(h, name);
  });

  // Sanitize rows
  const sanitizedRows: Record<string, any>[] = [];
  for (let i = 0; i < rawRows.length; i++) {
    const r = rawRows[i];
    if (!r || typeof r !== 'object') continue;

    const cleanRow: Record<string, any> = {};
    let hasAtLeastOneValue = false;

    sanitizedHeaders.forEach(h => {
      // Find matching key from r
      let val: any = undefined;
      for (const [origKey, cleanKey] of headerMap.entries()) {
        if (cleanKey === h && r[origKey] !== undefined) {
          val = r[origKey];
          break;
        }
      }
      if (val === undefined) {
        val = r[h];
      }

      if (val !== null && val !== undefined && String(val).trim() !== '') {
        hasAtLeastOneValue = true;
      }
      cleanRow[h] = val !== undefined ? val : null;
    });

    if (hasAtLeastOneValue) {
      sanitizedRows.push(cleanRow);
    }
  }

  return { rows: sanitizedRows, headers: sanitizedHeaders, warnings };
}

/**
 * Universal Dataset Parser supporting CSV, XLSX, XLS, JSON, TSV/TXT
 */
export async function parseDatasetFile(
  file: File,
  options: ParseOptions = {}
): Promise<ParsedDatasetFile> {
  const MAX_SIZE = 50 * 1024 * 1024; // 50MB
  if (file.size > MAX_SIZE) {
    throw new Error('Dataset is larger than the supported 50 MB limit.');
  }

  if (file.size === 0) {
    throw new Error('The uploaded file is empty. Please select a valid business dataset.');
  }

  const format = detectFileFormat(file);
  if (!format) {
    throw new Error('Unsupported file format. Please upload CSV, XLSX, XLS, JSON, or TSV.');
  }

  switch (format) {
    case 'csv':
    case 'tsv':
      return parseDelimitedFile(file, format);
    case 'xlsx':
    case 'xls':
      return parseExcelFile(file, format, options.sheetName);
    case 'json':
      return parseJsonFile(file);
    default:
      throw new Error('Unsupported file format. Please upload CSV, XLSX, XLS, JSON, or TSV.');
  }
}

/**
 * Parses Delimited Text (CSV, TSV, TXT with auto delimiter detection)
 */
async function parseDelimitedFile(
  file: File,
  format: 'csv' | 'tsv'
): Promise<ParsedDatasetFile> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
      // If format is tsv or txt, let PapaParse auto-detect delimiters or use tab
      delimiter: format === 'tsv' && file.name.endsWith('.tsv') ? '\t' : '', // '' triggers auto-detect
      delimitersToGuess: [',', '\t', '|', ';'],
      transformHeader: (header: string, index: number) => {
        const trimmed = header.trim();
        return trimmed || `Column_${index + 1}`;
      },
      complete: (results) => {
        try {
          const warnings: string[] = [];
          if (results.errors && results.errors.length > 0) {
            results.errors.forEach(err => {
              if (err.type === 'FieldMismatch') {
                warnings.push(`Row ${err.row ?? 'unknown'}: Expected fields count variation.`);
              }
            });
          }

          const rawData = results.data as Record<string, any>[];
          if (!rawData || rawData.length === 0) {
            return reject(new Error('Dataset contains no usable rows.'));
          }

          const { rows, headers, warnings: sanitizeWarns } = sanitizeRowsAndHeaders(rawData);
          if (rows.length === 0) {
            return reject(new Error('Dataset contains no usable rows.'));
          }

          if (headers.length === 0) {
            return reject(new Error('Unable to identify suitable analytical columns.'));
          }

          const detectedDelimiter = results.meta.delimiter || (format === 'tsv' ? '\t' : ',');

          resolve({
            fileName: file.name,
            fileType: format,
            fileSize: file.size,
            rows,
            headers,
            warnings: [...warnings, ...sanitizeWarns],
            delimiter: detectedDelimiter
          });
        } catch (err: any) {
          reject(new Error(err.message || 'Unable to parse this file. Please verify that it contains structured tabular data.'));
        }
      },
      error: (err) => {
        reject(new Error(`Failed to read delimited file: ${err.message}`));
      }
    });
  });
}

/**
 * Parses Excel Files (XLSX, XLS) with multi-sheet inspection
 */
async function parseExcelFile(
  file: File,
  format: 'xlsx' | 'xls',
  requestedSheet?: string
): Promise<ParsedDatasetFile> {
  const arrayBuffer = await file.arrayBuffer();
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
  } catch (err: any) {
    throw new Error('Unable to parse this Excel file. Please verify that it is a valid .xlsx or .xls document.');
  }

  const sheetNames = workbook.SheetNames;
  if (!sheetNames || sheetNames.length === 0) {
    throw new Error('Excel workbook contains no sheets.');
  }

  const activeSheet = requestedSheet && sheetNames.includes(requestedSheet) ? requestedSheet : sheetNames[0];
  const worksheet = workbook.Sheets[activeSheet];
  if (!worksheet) {
    throw new Error(`Worksheet "${activeSheet}" could not be loaded.`);
  }

  // Convert to JSON objects
  const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
    defval: null,
    raw: false, // get formatted text representations for dates & currency
    dateNF: 'yyyy-mm-dd'
  });

  if (!rawRows || rawRows.length === 0) {
    throw new Error(`Worksheet "${activeSheet}" contains no data rows.`);
  }

  const { rows, headers, warnings } = sanitizeRowsAndHeaders(rawRows);
  if (rows.length === 0) {
    throw new Error('Dataset contains no usable rows.');
  }
  if (headers.length === 0) {
    throw new Error('Unable to identify suitable analytical columns in sheet.');
  }

  return {
    fileName: file.name,
    fileType: format,
    fileSize: file.size,
    sheetNames,
    activeSheet,
    rows,
    headers,
    warnings
  };
}

/**
 * Parses JSON Files (array of objects, or nested tabular data)
 */
async function parseJsonFile(file: File): Promise<ParsedDatasetFile> {
  const text = await file.text();
  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch (err: any) {
    throw new Error('Malformed JSON. Please ensure the file contains valid JSON.');
  }

  // Find candidate array of objects
  let targetArray: Record<string, any>[] | null = null;

  if (Array.isArray(parsed)) {
    if (parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null) {
      targetArray = parsed;
    }
  } else if (parsed && typeof parsed === 'object') {
    // Inspect common wrapper keys: data, items, rows, results, records, transactions, payload, sales
    const candidateKeys = ['data', 'items', 'rows', 'results', 'records', 'transactions', 'payload', 'sales', 'orders', 'values'];
    for (const key of candidateKeys) {
      if (Array.isArray(parsed[key]) && parsed[key].length > 0 && typeof parsed[key][0] === 'object') {
        targetArray = parsed[key];
        break;
      }
    }

    // If still not found, search any first-level property that is an array of objects
    if (!targetArray) {
      for (const key of Object.keys(parsed)) {
        if (Array.isArray(parsed[key]) && parsed[key].length > 0 && typeof parsed[key][0] === 'object') {
          targetArray = parsed[key];
          break;
        }
      }
    }
  }

  if (!targetArray || targetArray.length === 0) {
    throw new Error('Unable to parse this JSON file. Please verify that it contains an array of structured objects.');
  }

  // Flatten nested objects by 1 level if needed
  const flattenedRows: Record<string, any>[] = targetArray.map(item => {
    if (!item || typeof item !== 'object') return {};
    const flat: Record<string, any> = {};
    for (const [k, v] of Object.entries(item)) {
      if (v !== null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)) {
        // Nested object: e.g. customer.id -> customer_id
        for (const [subK, subV] of Object.entries(v)) {
          flat[`${k}_${subK}`] = subV;
        }
      } else {
        flat[k] = v;
      }
    }
    return flat;
  });

  const { rows, headers, warnings } = sanitizeRowsAndHeaders(flattenedRows);
  if (rows.length === 0) {
    throw new Error('Dataset contains no usable rows.');
  }
  if (headers.length === 0) {
    throw new Error('Unable to identify suitable analytical columns.');
  }

  return {
    fileName: file.name,
    fileType: 'json',
    fileSize: file.size,
    rows,
    headers,
    warnings
  };
}
