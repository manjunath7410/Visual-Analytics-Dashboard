import { ReportConfig, SavedReportItem } from '../../types/reporting';

const REPORT_CONFIGS_KEY = 'bi_dashboard_report_configs';
const REPORT_HISTORY_KEY = 'bi_dashboard_report_history';

/**
 * Robust CSV Exporter with UTF-8 BOM and proper escaping (Requirement 16)
 */
export function exportToCSV(data: Record<string, any>[], filename: string): void {
  if (!data || data.length === 0) {
    console.warn('No data available to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvRows: string[] = [];

  // Header row
  csvRows.push(headers.map(h => escapeCSVValue(h)).join(','));

  // Data rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      return escapeCSVValue(val);
    });
    csvRows.push(values.join(','));
  }

  // Prepend UTF-8 Byte Order Mark (BOM) for Excel compatibility
  const csvString = '\uFEFF' + csvRows.join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${sanitizeFilename(filename)}.csv`);
}

/**
 * JSON Exporter (Requirement 17)
 */
export function exportToJSON(data: any, filename: string): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  downloadBlob(blob, `${sanitizeFilename(filename)}.json`);
}

function escapeCSVValue(val: any): string {
  if (val === null || val === undefined) {
    return '""';
  }
  if (typeof val === 'number' || typeof val === 'boolean') {
    return String(val);
  }
  const str = String(val);
  // If string contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ==========================================
// LocalStorage Persistence Helpers (Requirement 18 & 19)
// ==========================================

export function loadSavedReportConfigs(): ReportConfig[] {
  try {
    const stored = localStorage.getItem(REPORT_CONFIGS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveReportConfigToStorage(config: ReportConfig): void {
  try {
    const configs = loadSavedReportConfigs();
    const existingIndex = configs.findIndex(c => c.id === config.id);
    if (existingIndex >= 0) {
      configs[existingIndex] = { ...config, updatedAt: new Date().toISOString() };
    } else {
      configs.unshift(config);
    }
    localStorage.setItem(REPORT_CONFIGS_KEY, JSON.stringify(configs.slice(0, 30)));
  } catch (err) {
    console.error('Failed to save report config to storage', err);
  }
}

export function deleteReportConfigFromStorage(id: string): void {
  try {
    const configs = loadSavedReportConfigs().filter(c => c.id !== id);
    localStorage.setItem(REPORT_CONFIGS_KEY, JSON.stringify(configs));
  } catch (err) {
    console.error('Failed to delete report config', err);
  }
}

export function loadReportHistoryFromStorage(): SavedReportItem[] {
  try {
    const stored = localStorage.getItem(REPORT_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function recordReportHistory(item: SavedReportItem): void {
  try {
    const history = loadReportHistoryFromStorage();
    const updated = [item, ...history.filter(h => h.id !== item.id)].slice(0, 20);
    localStorage.setItem(REPORT_HISTORY_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to record report history', err);
  }
}

export function deleteReportHistoryItem(id: string): void {
  try {
    const history = loadReportHistoryFromStorage().filter(h => h.id !== id);
    localStorage.setItem(REPORT_HISTORY_KEY, JSON.stringify(history));
  } catch (err) {
    console.error('Failed to delete report history', err);
  }
}
