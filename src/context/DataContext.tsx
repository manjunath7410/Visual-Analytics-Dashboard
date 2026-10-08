import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { 
  DatasetMeta, 
  DataRow, 
  ColumnSchema, 
  KPIMetric, 
  TimeRange 
} from '../types/dashboard';
import { 
  Dataset, 
  ColumnMetadata, 
  FilterState, 
  FilterValue, 
  DatasetStatistics,
  ColumnDataType,
  AdvancedFilterState,
  DateFilterRange,
  NumericFilterRange
} from '../types/dataset';
import { 
  CleaningOperation, 
  DataQualityReport, 
  DatasetSnapshot, 
  ETLStage 
} from '../types/etl';
import { 
  INITIAL_DATASETS, 
  DATA_COLUMNS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_KPIS 
} from '../data/mockData';
import { SAMPLE_DATASET_RAW, SAMPLE_DATASET_HEADERS } from '../data/sampleDataset';
import { analyzeDataset } from '../utils/dataAnalysis';
import { calculateDataQuality } from '../utils/dataCleaning';
import { AnalyticsEngine } from '../utils/analytics/analyticsEngine';
import { FilterEngine, EMPTY_FILTER_STATE } from '../utils/filterEngine';

interface DataContextType {
  // Phase 3 & 4 Dataset State
  dataset: Dataset | null;
  rawDataset: Dataset | null;
  cleanedDataset: Dataset | null;
  activeDatasetMode: 'clean' | 'raw';
  setActiveDatasetMode: (mode: 'clean' | 'raw') => void;
  setDataset: (dataset: Dataset | null) => void;
  loadSampleDataset: () => void;
  clearDataset: () => void;
  filters: FilterState;
  setFilter: (colName: string, filter: FilterValue | null) => void;
  clearFilters: () => void;
  activeFilterCount: number;

  // Phase 7: Advanced Filtering System
  advancedFilters: AdvancedFilterState;
  setAdvancedFilters: (filters: AdvancedFilterState | ((prev: AdvancedFilterState) => AdvancedFilterState)) => void;
  setCategoricalFilter: (column: string, selectedValues: string[]) => void;
  setNumericFilter: (column: string, range: NumericFilterRange | null) => void;
  setDateRangeFilter: (range: DateFilterRange | null) => void;
  removeFilterChip: (type: 'date' | 'category' | 'numeric' | 'search', column?: string, value?: string) => void;
  canUndoFilter: boolean;
  undoLastFilter: () => void;
  filteredPercentage: number;
  totalRowCount: number;

  // Phase 4: ETL and Data Cleaning
  cleaningHistory: CleaningOperation[];
  canUndo: boolean;
  undoLastOperation: () => void;
  resetCleaning: () => void;
  qualityReport: DataQualityReport;
  etlStages: ETLStage[];
  applyCleaningOperation: (
    op: Omit<CleaningOperation, 'id' | 'timestamp' | 'timeFormatted' | 'status'>,
    updatedRows: Record<string, any>[],
    updatedHeaders?: string[]
  ) => void;
  overrideColumnType: (colName: string, newType: ColumnDataType) => void;
  removeColumn: (colName: string) => void;
  renameColumn: (oldName: string, newName: string) => boolean;
  exportDatasetAsCSV: (type: 'clean' | 'raw') => void;

  // Multi-page shared states
  datasets: DatasetMeta[];
  currentDataset: DatasetMeta;
  setCurrentDatasetId: (id: string) => void;
  rows: DataRow[];
  columns: ColumnSchema[];
  filteredRows: any[];
  kpis: KPIMetric[];
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  selectedSegment: string;
  setSelectedSegment: (segment: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isRefreshing: boolean;
  refreshData: () => void;
  uploadDataset: (meta: Partial<DatasetMeta>, parsedRows: any[], parsedColumns?: ColumnSchema[]) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Helper to create initial sample dataset
  const createInitialSampleDataset = (): Dataset => {
    const { typedRows, columns, statistics } = analyzeDataset(
      SAMPLE_DATASET_RAW,
      SAMPLE_DATASET_HEADERS
    );
    return {
      id: 'ds-sample-enterprise-sales',
      name: 'Enterprise Commercial Sales (Sample)',
      fileName: 'enterprise_sales_sample.csv',
      fileSize: 48200,
      uploadDate: '2026-10-01',
      isSample: true,
      rows: typedRows,
      columns,
      statistics,
      rawHeaders: SAMPLE_DATASET_HEADERS,
    };
  };

  // Phase 4: Maintain raw and cleaned dataset instances
  const [rawDataset, setRawDataset] = useState<Dataset | null>(() => {
    try {
      return createInitialSampleDataset();
    } catch {
      return null;
    }
  });

  const [cleanedDataset, setCleanedDataset] = useState<Dataset | null>(() => {
    try {
      return createInitialSampleDataset();
    } catch {
      return null;
    }
  });

  const [activeDatasetMode, setActiveDatasetMode] = useState<'clean' | 'raw'>('clean');
  const [cleaningHistory, setCleaningHistory] = useState<CleaningOperation[]>([]);
  const [snapshots, setSnapshots] = useState<DatasetSnapshot[]>([]);

  // The active dataset consumed by all downstream pages
  const dataset = useMemo(() => {
    if (activeDatasetMode === 'raw') return rawDataset;
    return cleanedDataset;
  }, [activeDatasetMode, rawDataset, cleanedDataset]);

  // Phase 4: Dynamic Data Quality Score & Report
  const qualityReport = useMemo<DataQualityReport>(() => {
    if (!dataset) {
      return {
        score: 100,
        rating: 'Excellent',
        factors: [],
        totalIssues: 0
      };
    }
    return calculateDataQuality(dataset.rows, dataset.columns, dataset.statistics);
  }, [dataset]);

  // Phase 4: Visual ETL Pipeline Stages
  const etlStages = useMemo<ETLStage[]>(() => {
    const hasData = dataset !== null && dataset.rows.length > 0;
    const hasTransformations = cleaningHistory.some(op => op.status === 'applied');
    const isQualityGood = qualityReport.score >= 75;

    return [
      {
        id: 'extract',
        name: 'Data Extraction',
        label: 'Extract',
        status: hasData ? 'completed' : 'pending',
        detail: hasData ? `Loaded ${dataset?.statistics.rowCount.toLocaleString()} records from ${dataset?.fileName || 'source'}` : 'Awaiting data ingestion'
      },
      {
        id: 'transform',
        name: 'Data Transformation & Cleaning',
        label: 'Transform',
        status: hasTransformations ? 'completed' : (hasData ? 'ready' : 'pending'),
        detail: hasTransformations ? `${cleaningHistory.filter(h => h.status === 'applied').length} cleaning operations executed` : 'Standard typing applied'
      },
      {
        id: 'validate',
        name: 'Schema & Quality Validation',
        label: 'Validate',
        status: hasData ? 'completed' : 'pending',
        detail: hasData ? `Quality Score: ${qualityReport.score}/100 (${qualityReport.rating})` : 'Pending validation'
      },
      {
        id: 'load',
        name: 'Analytical Mart Ingestion',
        label: 'Load',
        status: hasData ? 'completed' : 'pending',
        detail: hasData ? 'Staged in-memory for Dashboard & Analytics' : 'Not loaded'
      }
    ];
  }, [dataset, cleaningHistory, qualityReport]);

  const [filters, setFilters] = useState<FilterState>({});
  const [datasets, setDatasets] = useState<DatasetMeta[]>(INITIAL_DATASETS);
  const [currentDatasetId, setCurrentDatasetId] = useState<string>(INITIAL_DATASETS[0].id);
  const [rows, setRows] = useState<DataRow[]>(INITIAL_TRANSACTIONS);
  const [columns, setColumns] = useState<ColumnSchema[]>(DATA_COLUMNS);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Phase 7: Centralized Advanced Filter State & History Stack
  const [advancedFilters, setAdvancedFiltersState] = useState<AdvancedFilterState>(EMPTY_FILTER_STATE);
  const [filterHistory, setFilterHistory] = useState<AdvancedFilterState[]>([]);

  // Push state to history for Undo support
  const pushFilterHistory = (stateToSave: AdvancedFilterState) => {
    setFilterHistory(prev => [stateToSave, ...prev.slice(0, 14)]);
  };

  const setAdvancedFilters = (updater: AdvancedFilterState | ((prev: AdvancedFilterState) => AdvancedFilterState)) => {
    pushFilterHistory(advancedFilters);
    setAdvancedFiltersState(updater);
  };

  const setCategoricalFilter = (column: string, selectedValues: string[]) => {
    pushFilterHistory(advancedFilters);
    setAdvancedFiltersState(prev => {
      const nextCats = { ...prev.categoricalFilters };
      if (!selectedValues || selectedValues.length === 0) {
        delete nextCats[column];
      } else {
        nextCats[column] = selectedValues;
      }
      return { ...prev, categoricalFilters: nextCats };
    });
  };

  const setNumericFilter = (column: string, range: NumericFilterRange | null) => {
    pushFilterHistory(advancedFilters);
    setAdvancedFiltersState(prev => {
      const nextNums = { ...prev.numericFilters };
      if (!range || (range.min === null && range.max === null)) {
        delete nextNums[column];
      } else {
        nextNums[column] = range;
      }
      return { ...prev, numericFilters: nextNums };
    });
  };

  const setDateRangeFilter = (range: DateFilterRange | null) => {
    pushFilterHistory(advancedFilters);
    setAdvancedFiltersState(prev => ({ ...prev, dateRange: range }));
  };

  const removeFilterChip = (type: 'date' | 'category' | 'numeric' | 'search', column?: string, value?: string) => {
    pushFilterHistory(advancedFilters);
    if (type === 'date') {
      setAdvancedFiltersState(prev => ({ ...prev, dateRange: null }));
    } else if (type === 'search') {
      setAdvancedFiltersState(prev => ({ ...prev, searchTerm: '' }));
      setSearchQuery('');
    } else if (type === 'category' && column) {
      if (value) {
        setAdvancedFiltersState(prev => {
          const currentVals = prev.categoricalFilters[column] || [];
          const nextVals = currentVals.filter(v => v !== value);
          const nextCats = { ...prev.categoricalFilters };
          if (nextVals.length === 0) {
            delete nextCats[column];
          } else {
            nextCats[column] = nextVals;
          }
          return { ...prev, categoricalFilters: nextCats };
        });
        if (column.toLowerCase() === 'region' && value === selectedRegion) {
          setSelectedRegion('all');
        }
        if (column.toLowerCase().includes('segment') && value === selectedSegment) {
          setSelectedSegment('all');
        }
      } else {
        setAdvancedFiltersState(prev => {
          const nextCats = { ...prev.categoricalFilters };
          delete nextCats[column];
          return { ...prev, categoricalFilters: nextCats };
        });
        if (column.toLowerCase() === 'region') setSelectedRegion('all');
        if (column.toLowerCase().includes('segment')) setSelectedSegment('all');
      }
    } else if (type === 'numeric' && column) {
      setAdvancedFiltersState(prev => {
        const nextNums = { ...prev.numericFilters };
        delete nextNums[column];
        return { ...prev, numericFilters: nextNums };
      });
    }
  };

  const canUndoFilter = filterHistory.length > 0;
  const undoLastFilter = () => {
    if (filterHistory.length === 0) return;
    const [lastState, ...remaining] = filterHistory;
    setFilterHistory(remaining);
    setAdvancedFiltersState(lastState);
    if (lastState.searchTerm !== undefined) {
      setSearchQuery(lastState.searchTerm);
    }
  };

  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('acuity_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('acuity_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Set individual column filter (backward-compatible)
  const setFilter = (colName: string, filterVal: FilterValue | null) => {
    if (!filterVal) {
      setCategoricalFilter(colName, []);
    } else if (filterVal.type === 'category') {
      setCategoricalFilter(colName, filterVal.selectedCategories || []);
    } else if (filterVal.type === 'number') {
      setNumericFilter(colName, { min: filterVal.minNumber ?? null, max: filterVal.maxNumber ?? null });
    } else if (filterVal.type === 'date') {
      setDateRangeFilter({ column: colName, start: filterVal.minDate ?? null, end: filterVal.maxDate ?? null });
    }

    setFilters(prev => {
      const next = { ...prev };
      if (!filterVal) {
        delete next[colName];
      } else {
        next[colName] = filterVal;
      }
      return next;
    });
  };

  const clearFilters = () => {
    if (FilterEngine.countActiveFilters(advancedFilters) > 0 || selectedRegion !== 'all' || selectedSegment !== 'all' || searchQuery !== '') {
      pushFilterHistory(advancedFilters);
    }
    setAdvancedFiltersState(EMPTY_FILTER_STATE);
    setFilters({});
    setSelectedRegion('all');
    setSelectedSegment('all');
    setSearchQuery('');
  };

  const activeFilterCount = useMemo(() => {
    let count = FilterEngine.countActiveFilters(advancedFilters);
    if (selectedRegion !== 'all' && !advancedFilters.categoricalFilters['Region']) count++;
    if (selectedSegment !== 'all' && !advancedFilters.categoricalFilters['Customer Segment']) count++;
    if (searchQuery.trim() !== '' && !advancedFilters.searchTerm) count++;
    return count;
  }, [advancedFilters, selectedRegion, selectedSegment, searchQuery]);

  // Requirement 10 & 13: Clear Dataset
  const clearDataset = () => {
    setRawDataset(null);
    setCleanedDataset(null);
    setCleaningHistory([]);
    setSnapshots([]);
    setAdvancedFiltersState(EMPTY_FILTER_STATE);
    setFilterHistory([]);
    setFilters({});
    setSearchQuery('');
    setSelectedRegion('all');
    setSelectedSegment('all');
  };

  // Requirement 9: Load Sample Dataset
  const loadSampleDataset = () => {
    const sample = createInitialSampleDataset();
    setRawDataset(sample);
    setCleanedDataset(sample);
    setCleaningHistory([]);
    setSnapshots([]);
    setAdvancedFiltersState(EMPTY_FILTER_STATE);
    setFilterHistory([]);
    setActiveDatasetMode('clean');
    clearFilters();
  };

  const setDataset = (newDataset: Dataset | null) => {
    setRawDataset(newDataset);
    setCleanedDataset(newDataset);
    setCleaningHistory([]);
    setSnapshots([]);
    setAdvancedFiltersState(EMPTY_FILTER_STATE);
    setFilterHistory([]);
    setActiveDatasetMode('clean');
    clearFilters();
  };

  // Phase 4: Apply a Cleaning Operation
  const applyCleaningOperation = (
    op: Omit<CleaningOperation, 'id' | 'timestamp' | 'timeFormatted' | 'status'>,
    updatedRows: Record<string, any>[],
    updatedHeaders?: string[]
  ) => {
    if (!cleanedDataset) return;

    // Save snapshot for Undo
    const snapshot: DatasetSnapshot = {
      id: `snap-${Date.now()}`,
      timestamp: Date.now(),
      operationDescription: op.description,
      rows: cleanedDataset.rows,
      headers: cleanedDataset.rawHeaders
    };
    setSnapshots(prev => [snapshot, ...prev]);

    // Recalculate dataset metadata & statistics dynamically
    const headers = updatedHeaders || cleanedDataset.rawHeaders;
    const { typedRows, columns: newCols, statistics: newStats } = analyzeDataset(updatedRows, headers);

    const updatedDataset: Dataset = {
      ...cleanedDataset,
      rows: typedRows,
      columns: newCols,
      statistics: newStats,
      rawHeaders: headers,
    };

    setCleanedDataset(updatedDataset);

    // Record in history
    const now = new Date();
    const newOperation: CleaningOperation = {
      ...op,
      id: `op-${Date.now()}`,
      timestamp: now.toISOString(),
      timeFormatted: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: 'applied'
    };

    setCleaningHistory(prev => [newOperation, ...prev]);
  };

  // Phase 4: Undo Last Operation
  const canUndo = snapshots.length > 0;
  const undoLastOperation = () => {
    if (snapshots.length === 0 || !cleanedDataset) return;

    const [lastSnapshot, ...remainingSnapshots] = snapshots;
    setSnapshots(remainingSnapshots);

    // Reconstruct dataset from snapshot
    const { typedRows, columns: newCols, statistics: newStats } = analyzeDataset(
      lastSnapshot.rows,
      lastSnapshot.headers
    );

    const revertedDataset: Dataset = {
      ...cleanedDataset,
      rows: typedRows,
      columns: newCols,
      statistics: newStats,
      rawHeaders: lastSnapshot.headers
    };

    setCleanedDataset(revertedDataset);

    // Mark last history item as reverted
    setCleaningHistory(prev => {
      const [lastOp, ...rest] = prev;
      if (lastOp) {
        return [{ ...lastOp, status: 'reverted' }, ...rest];
      }
      return prev;
    });
  };

  // Phase 4: Reset Cleaning to Raw Dataset
  const resetCleaning = () => {
    if (!rawDataset) return;
    setCleanedDataset(rawDataset);
    setSnapshots([]);
    const now = new Date();
    setCleaningHistory(prev => [
      {
        id: `op-${Date.now()}`,
        timestamp: now.toISOString(),
        timeFormatted: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: 'reset',
        description: 'Restored cleaned dataset to original uploaded state',
        affectedRows: rawDataset.statistics.rowCount,
        status: 'applied'
      },
      ...prev
    ]);
  };

  // Phase 4: Manual Column Type Override
  const overrideColumnType = (colName: string, newType: ColumnDataType) => {
    if (!cleanedDataset) return;

    const updatedCols = cleanedDataset.columns.map(c => 
      c.name === colName ? { ...c, type: newType } : c
    );

    // Recompute statistics
    let numCount = 0;
    let catCount = 0;
    let dateCount = 0;
    updatedCols.forEach(c => {
      if (c.type === 'Number') numCount++;
      else if (c.type === 'Date') dateCount++;
      else if (c.type === 'Category') catCount++;
    });

    const updatedDataset: Dataset = {
      ...cleanedDataset,
      columns: updatedCols,
      statistics: {
        ...cleanedDataset.statistics,
        numericColumnsCount: numCount,
        categoricalColumnsCount: catCount,
        dateColumnsCount: dateCount
      }
    };

    setCleanedDataset(updatedDataset);
    applyCleaningOperation(
      {
        type: 'override_type',
        columnName: colName,
        description: `Manually changed column "${colName}" type to ${newType}`,
        affectedRows: cleanedDataset.statistics.rowCount
      },
      cleanedDataset.rows,
      cleanedDataset.rawHeaders
    );
  };

  // Phase 4: Remove Column
  const removeColumn = (colName: string) => {
    if (!cleanedDataset) return;

    const updatedHeaders = cleanedDataset.rawHeaders.filter(h => h !== colName);
    const updatedRows = cleanedDataset.rows.map(row => {
      const next = { ...row };
      delete next[colName];
      return next;
    });

    applyCleaningOperation(
      {
        type: 'remove_column',
        columnName: colName,
        description: `Removed column "${colName}" from dataset`,
        affectedRows: cleanedDataset.statistics.rowCount,
        affectedColumns: 1
      },
      updatedRows,
      updatedHeaders
    );
  };

  // Phase 4: Rename Column
  const renameColumn = (oldName: string, newName: string): boolean => {
    if (!cleanedDataset || !newName.trim()) return false;
    const trimmed = newName.trim();
    if (trimmed === oldName) return true;
    if (cleanedDataset.rawHeaders.includes(trimmed)) return false; // Duplicate name protection

    const updatedHeaders = cleanedDataset.rawHeaders.map(h => (h === oldName ? trimmed : h));
    const updatedRows = cleanedDataset.rows.map(row => {
      const next = { ...row };
      next[trimmed] = next[oldName];
      delete next[oldName];
      return next;
    });

    applyCleaningOperation(
      {
        type: 'rename_column',
        columnName: oldName,
        description: `Renamed column "${oldName}" to "${trimmed}"`,
        affectedRows: cleanedDataset.statistics.rowCount
      },
      updatedRows,
      updatedHeaders
    );
    return true;
  };

  // Phase 4: Export CSV (Cleaned or Raw)
  const exportDatasetAsCSV = (type: 'clean' | 'raw') => {
    const target = type === 'clean' ? cleanedDataset : rawDataset;
    if (!target || target.rows.length === 0) return;

    const headers = target.rawHeaders;
    const rowsText = target.rows.map(row => {
      return headers.map(h => {
        const val = row[h];
        if (val === null || val === undefined) return '';
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',');
    }).join('\n');

    const csvContent = `${headers.join(',')}\n${rowsText}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${target.name.toLowerCase().replace(/\s+/g, '_')}_${type}_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const currentDataset = useMemo(() => {
    return datasets.find(d => d.id === currentDatasetId) || datasets[0];
  }, [datasets, currentDatasetId]);

  // Compute filtered rows dynamically across active dataset using FilterEngine
  const filteredRows = useMemo(() => {
    // If we have an active uploaded/cleaned/sample dataset
    if (dataset && dataset.rows.length > 0) {
      let combinedFilters = { ...advancedFilters };

      // Incorporate selectedRegion if not already in categoricalFilters
      if (selectedRegion !== 'all') {
        const regionCol = Object.keys(dataset.rows[0]).find(k => k.toLowerCase() === 'region') || 'Region';
        if (!combinedFilters.categoricalFilters[regionCol]) {
          combinedFilters = {
            ...combinedFilters,
            categoricalFilters: {
              ...combinedFilters.categoricalFilters,
              [regionCol]: [selectedRegion]
            }
          };
        }
      }

      // Incorporate selectedSegment if not already in categoricalFilters
      if (selectedSegment !== 'all') {
        const segCol = Object.keys(dataset.rows[0]).find(k => k.toLowerCase().includes('segment')) || 'Customer Segment';
        if (!combinedFilters.categoricalFilters[segCol]) {
          combinedFilters = {
            ...combinedFilters,
            categoricalFilters: {
              ...combinedFilters.categoricalFilters,
              [segCol]: [selectedSegment]
            }
          };
        }
      }

      // Incorporate searchQuery
      if (searchQuery.trim() !== '') {
        combinedFilters = {
          ...combinedFilters,
          searchTerm: searchQuery
        };
      }

      return FilterEngine.applyFilters(dataset.rows, combinedFilters);
    }

    // If dataset was explicitly cleared (dataset === null), return empty array
    if (dataset === null) {
      return [];
    }

    // Fallback to legacy mock transactions
    return rows.filter((row) => {
      if (selectedRegion !== 'all' && row.region !== selectedRegion) return false;
      if (selectedSegment !== 'all' && row.segment !== selectedSegment) return false;
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const match = 
          (row.id && String(row.id).toLowerCase().includes(query)) ||
          (row.salesRep && String(row.salesRep).toLowerCase().includes(query)) ||
          (row.product && String(row.product).toLowerCase().includes(query)) ||
          (row.region && String(row.region).toLowerCase().includes(query)) ||
          (row.segment && String(row.segment).toLowerCase().includes(query));
        if (!match) return false;
      }
      return true;
    });
  }, [dataset, rows, advancedFilters, selectedRegion, selectedSegment, searchQuery]);

  const totalRowCount = dataset ? dataset.statistics.rowCount : 0;
  const filteredPercentage = totalRowCount > 0 ? Number(((filteredRows.length / totalRowCount) * 100).toFixed(1)) : 100;

  // Dynamically compute executive KPIs using the centralized AnalyticsEngine
  const kpis = useMemo<KPIMetric[]>(() => {
    return AnalyticsEngine.calculateExecutiveKPIs(filteredRows, dataset) as KPIMetric[];
  }, [filteredRows, dataset]);

  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 450);
  };

  const uploadDataset = (
    meta: Partial<DatasetMeta>, 
    parsedRows: any[], 
    parsedColumns?: ColumnSchema[]
  ) => {
    const newId = `ds-upload-${Date.now()}`;
    const newDataset: DatasetMeta = {
      id: newId,
      name: meta.name || 'Uploaded Dataset',
      description: meta.description || `Custom uploaded dataset with ${parsedRows.length} rows.`,
      rowCount: parsedRows.length,
      columnCount: parsedColumns ? parsedColumns.length : (parsedRows[0] ? Object.keys(parsedRows[0]).length : 0),
      uploadDate: new Date().toISOString().split('T')[0],
      sizeBytes: meta.sizeBytes || parsedRows.length * 128,
      source: 'Custom Upload',
      status: 'ready'
    };

    setDatasets(prev => [newDataset, ...prev]);
    setCurrentDatasetId(newId);
    setRows(parsedRows);
    if (parsedColumns && parsedColumns.length > 0) {
      setColumns(parsedColumns);
    }
  };

  return (
    <DataContext.Provider
      value={{
        dataset,
        rawDataset,
        cleanedDataset,
        activeDatasetMode,
        setActiveDatasetMode,
        setDataset,
        loadSampleDataset,
        clearDataset,
        filters,
        setFilter,
        clearFilters,
        activeFilterCount,
        advancedFilters,
        setAdvancedFilters,
        setCategoricalFilter,
        setNumericFilter,
        setDateRangeFilter,
        removeFilterChip,
        canUndoFilter,
        undoLastFilter,
        filteredPercentage,
        totalRowCount,
        cleaningHistory,
        canUndo,
        undoLastOperation,
        resetCleaning,
        qualityReport,
        etlStages,
        applyCleaningOperation,
        overrideColumnType,
        removeColumn,
        renameColumn,
        exportDatasetAsCSV,
        datasets,
        currentDataset,
        setCurrentDatasetId,
        rows,
        columns,
        filteredRows,
        kpis,
        timeRange,
        setTimeRange,
        selectedRegion,
        setSelectedRegion,
        selectedSegment,
        setSelectedSegment,
        searchQuery,
        setSearchQuery,
        isRefreshing,
        refreshData,
        uploadDataset,
        theme,
        toggleTheme
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
