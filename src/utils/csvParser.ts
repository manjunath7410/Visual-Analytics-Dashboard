import Papa from 'papaparse';

export interface ParseResult {
  success: boolean;
  rows: Record<string, any>[];
  headers: string[];
  errors: string[];
  warnings: string[];
  rowCount: number;
}

export function parseCSVFile(
  file: File,
  onComplete: (result: ParseResult) => void,
  onError: (error: string) => void
): void {
  // Check file size (e.g., max 50MB)
  const MAX_SIZE = 50 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    onError(`File size exceeds 50MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB). Please upload a smaller dataset.`);
    return;
  }

  if (file.size === 0) {
    onError('The uploaded file is empty. Please provide a valid CSV file with data.');
    return;
  }

  Papa.parse(file, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (header: string, index: number) => {
      const trimmed = header.trim();
      return trimmed || `Column_${index + 1}`;
    },
    complete: (results) => {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Collect parse errors from PapaParse
      if (results.errors && results.errors.length > 0) {
        results.errors.forEach((err) => {
          if (err.type === 'FieldMismatch') {
            warnings.push(`Row ${err.row ?? 'unknown'}: Expected ${err.code} fields, parsed with variation.`);
          } else {
            errors.push(`Row ${err.row ?? 'header'}: ${err.message}`);
          }
        });
      }

      const headers = results.meta.fields || [];

      if (headers.length === 0) {
        onError('CSV contains no detected column headers. Please verify the file format.');
        return;
      }

      // Check for duplicate column names and deduplicate
      const seenHeaders = new Set<string>();
      const sanitizedHeaders: string[] = [];
      headers.forEach((h, idx) => {
        let name = h;
        if (seenHeaders.has(name)) {
          let count = 1;
          while (seenHeaders.has(`${name}_${count}`)) {
            count++;
          }
          name = `${name}_${count}`;
          warnings.push(`Duplicate column "${h}" was renamed to "${name}".`);
        }
        seenHeaders.add(name);
        sanitizedHeaders.push(name);
      });

      const rawRows = results.data as Record<string, any>[];

      if (rawRows.length === 0) {
        onError('CSV file contains headers but no data rows.');
        return;
      }

      onComplete({
        success: errors.length === 0,
        rows: rawRows,
        headers: sanitizedHeaders,
        errors,
        warnings,
        rowCount: rawRows.length
      });
    },
    error: (error) => {
      onError(`Failed to read CSV: ${error.message}`);
    }
  });
}
