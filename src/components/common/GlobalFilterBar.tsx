import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Calendar, 
  ChevronDown, 
  Search, 
  Filter, 
  X, 
  RotateCcw, 
  SlidersHorizontal, 
  Check, 
  Layers,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { AnalyticsEngine } from '../../utils/analytics/analyticsEngine';
import { FilterEngine, FacetedOption } from '../../utils/filterEngine';

interface GlobalFilterBarProps {
  className?: string;
  showSummary?: boolean;
}

export const GlobalFilterBar: React.FC<GlobalFilterBarProps> = ({
  className = '',
  showSummary = true
}) => {
  const { 
    dataset, 
    filteredRows, 
    advancedFilters, 
    setCategoricalFilter, 
    setNumericFilter, 
    setDateRangeFilter, 
    removeFilterChip, 
    clearFilters, 
    activeFilterCount, 
    canUndoFilter, 
    undoLastFilter, 
    totalRowCount, 
    filteredPercentage,
    searchQuery,
    setSearchQuery
  } = useData();

  // Active open dropdown tracker
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search within categorical dropdown
  const [dropdownSearch, setDropdownSearch] = useState<string>('');

  // "More Filters" modal toggle
  const [showMoreModal, setShowMoreModal] = useState<boolean>(false);

  // Mobile Filters full-width sheet toggle (Requirement 25)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
        setDropdownSearch('');
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Classify dataset columns dynamically using AnalyticsEngine
  const classifications = useMemo(() => {
    if (!dataset) return [];
    return AnalyticsEngine.classifyColumns(dataset.columns, dataset.rows);
  }, [dataset]);

  const dateColumn = useMemo(() => {
    return AnalyticsEngine.findPrimaryDateColumn(classifications);
  }, [classifications]);

  const categoricalColumns = useMemo(() => {
    const rawCols = classifications
      .filter(c => c.isDimension && c.role !== 'Identifier' && c.name !== dateColumn)
      .map(c => c.name);
    return Array.from(new Set(rawCols));
  }, [classifications, dateColumn]);

  const numericColumns = useMemo(() => {
    const rawCols = classifications
      .filter(c => c.isNumeric)
      .map(c => c.name);
    return Array.from(new Set(rawCols));
  }, [classifications]);

  // Primary top 3 categorical columns shown directly in the bar (deduplicated)
  const primaryDims = useMemo(() => {
    const found = AnalyticsEngine.findPrimaryDimensions(classifications);
    const set = new Set<string>();
    [found.regionColumn, found.categoryColumn, found.segmentColumn].forEach(col => {
      if (col && typeof col === 'string') set.add(col);
    });
    // Fill up to 3 columns from available categoricalColumns
    for (const c of categoricalColumns) {
      if (set.size >= 3) break;
      set.add(c);
    }
    return Array.from(set);
  }, [classifications, categoricalColumns]);

  // Secondary categorical columns accessed through "More Filters" (strictly distinct from primary)
  const secondaryDims = useMemo(() => {
    const primarySet = new Set(primaryDims);
    return categoricalColumns.filter(c => !primarySet.has(c));
  }, [categoricalColumns, primaryDims]);

  // Date boundaries
  const dateBounds = useMemo(() => {
    if (!dataset || !dateColumn) return { minDate: '', maxDate: '' };
    return FilterEngine.getDateBoundaries(dataset.rows, dateColumn);
  }, [dataset, dateColumn]);

  // Quick Date Presets
  const datePresets = [
    { id: 'today', label: 'Today' },
    { id: 'this_week', label: 'This Week' },
    { id: 'this_month', label: 'This Month' },
    { id: 'last_month', label: 'Last Month' },
    { id: 'this_quarter', label: 'This Quarter' },
    { id: 'last_quarter', label: 'Last Quarter' },
    { id: 'this_year', label: 'This Year' },
    { id: 'last_year', label: 'Last Year' },
    { id: 'all', label: 'All Time (Reset)' }
  ];

  const handleSelectDatePreset = (presetId: string) => {
    if (!dateColumn) return;
    if (presetId === 'all') {
      setDateRangeFilter(null);
      setOpenDropdown(null);
      return;
    }
    const range = FilterEngine.calculateDatePresetRange(presetId, dateBounds.minDate, dateBounds.maxDate);
    setDateRangeFilter({
      column: dateColumn,
      start: range.start,
      end: range.end,
      preset: presetId
    });
    setOpenDropdown(null);
  };

  const handleCustomDateChange = (start: string | null, end: string | null) => {
    if (!dateColumn) return;
    setDateRangeFilter({
      column: dateColumn,
      start,
      end,
      preset: 'custom'
    });
  };

  // Toggle categorical selection
  const handleToggleCategory = (col: string, val: string) => {
    const current = advancedFilters.categoricalFilters[col] || [];
    const next = current.includes(val) 
      ? current.filter(v => v !== val)
      : [...current, val];
    setCategoricalFilter(col, next);
  };

  // Select all options for a categorical column
  const handleSelectAllCategory = (col: string, options: FacetedOption[]) => {
    setCategoricalFilter(col, options.map(o => o.value));
  };

  const handleClearCategory = (col: string) => {
    setCategoricalFilter(col, []);
  };

  // Numeric range state for "More Filters" modal
  const [numRangeInputs, setNumRangeInputs] = useState<Record<string, { min: string; max: string }>>({});

  const handleApplyNumericFilter = (col: string) => {
    const inputs = numRangeInputs[col];
    if (!inputs) return;
    const minVal = inputs.min !== '' ? Number(inputs.min) : null;
    const maxVal = inputs.max !== '' ? Number(inputs.max) : null;
    setNumericFilter(col, { min: minVal, max: maxVal });
  };

  if (!dataset || dataset.rows.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2.5 ${className}`} ref={dropdownRef}>
      {/* 1. TOP GLOBAL FILTER TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs dark:border-slate-800/80 dark:bg-slate-900/80">
        <div className="flex flex-wrap items-center gap-2">
          {/* Global Search Input */}
          <div className="relative flex items-center min-w-[160px] sm:min-w-[220px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none shrink-0" />
            <input
              type="text"
              placeholder="Search all columns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-1.5 pl-9 pr-8 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200 dark:focus:bg-slate-900 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-4 w-4 items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title="Clear Search"
                aria-label="Clear Search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Mobile Filter Sheet Trigger Button (Requirement 25) */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="sm:hidden inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 shadow-2xs transition-colors cursor-pointer"
          >
            <Filter className="h-3.5 w-3.5 text-indigo-500" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-indigo-600 px-1.5 py-0.2 font-mono text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          {/* Desktop & Tablet Inline Filters */}
          <div className="hidden sm:flex flex-wrap items-center gap-2">
            {/* Date Range Picker Dropdown (Requirement 2) */}
            {dateColumn && (
              <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'date' ? null : 'date')}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors shadow-2xs ${
                  advancedFilters.dateRange
                    ? 'border-indigo-300 bg-indigo-50/80 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  {advancedFilters.dateRange 
                    ? `${advancedFilters.dateRange.start || dateBounds.minDate} → ${advancedFilters.dateRange.end || dateBounds.maxDate}`
                    : 'Date Range'}
                </span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>

              {/* Date Dropdown Popover */}
              {openDropdown === 'date' && (
                <div className="absolute left-0 top-full z-40 mt-1.5 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      Date Range Filter ({dateColumn})
                    </span>
                    <button
                      onClick={() => setOpenDropdown(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Quick presets */}
                  <div className="mt-2.5 grid grid-cols-3 gap-1">
                    {datePresets.map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => handleSelectDatePreset(preset.id)}
                        className={`rounded px-1.5 py-1 text-[11px] font-medium transition-colors ${
                          advancedFilters.dateRange?.preset === preset.id
                            ? 'bg-indigo-600 text-white font-semibold'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom Start & End */}
                  <div className="mt-3 space-y-2 border-t border-slate-100 pt-2.5 dark:border-slate-800">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 uppercase">Start Date</label>
                      <input
                        type="date"
                        min={dateBounds.minDate}
                        max={dateBounds.maxDate}
                        value={advancedFilters.dateRange?.start || ''}
                        onChange={(e) => handleCustomDateChange(e.target.value || null, advancedFilters.dateRange?.end || null)}
                        className="w-full mt-0.5 rounded border border-slate-200 bg-white p-1 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 uppercase">End Date</label>
                      <input
                        type="date"
                        min={dateBounds.minDate}
                        max={dateBounds.maxDate}
                        value={advancedFilters.dateRange?.end || ''}
                        onChange={(e) => handleCustomDateChange(advancedFilters.dateRange?.start || null, e.target.value || null)}
                        className="w-full mt-0.5 rounded border border-slate-200 bg-white p-1 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                      />
                    </div>
                  </div>

                  {advancedFilters.dateRange && (
                    <div className="mt-2.5 border-t border-slate-100 pt-2 text-right dark:border-slate-800">
                      <button
                        onClick={() => {
                          setDateRangeFilter(null);
                          setOpenDropdown(null);
                        }}
                        className="text-xs font-semibold text-rose-600 hover:underline"
                      >
                        Reset Date Filter
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Primary Categorical Dropdowns (Requirements 3 & 4) */}
          {primaryDims.map(col => {
            const selected = advancedFilters.categoricalFilters[col] || [];
            const isOpen = openDropdown === col;
            const facetedOptions = FilterEngine.getFacetedOptions(dataset.rows, col, advancedFilters);
            const filteredOptions = dropdownSearch.trim() === ''
              ? facetedOptions
              : facetedOptions.filter(o => o.value.toLowerCase().includes(dropdownSearch.toLowerCase()));

            return (
              <div key={col} className="relative">
                <button
                  onClick={() => {
                    setOpenDropdown(isOpen ? null : col);
                    setDropdownSearch('');
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors shadow-2xs ${
                    selected.length > 0
                      ? 'border-indigo-300 bg-indigo-50/80 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{col}</span>
                  {selected.length > 0 && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white tabular-nums">
                      {selected.length}
                    </span>
                  )}
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </button>

                {/* Categorical Multi-Select Popover */}
                {isOpen && (
                  <div className="absolute left-0 top-full z-40 mt-1.5 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {col} ({selected.length} selected)
                      </span>
                      <button
                        onClick={() => setOpenDropdown(null)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Search inside dropdown if > 5 items */}
                    {facetedOptions.length > 5 && (
                      <div className="mt-2 relative flex items-center">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none shrink-0" />
                        <input
                          type="text"
                          placeholder={`Search ${col}...`}
                          value={dropdownSearch}
                          onChange={(e) => setDropdownSearch(e.target.value)}
                          className="w-full rounded border border-slate-200 bg-slate-50 py-1 pl-7.5 pr-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 focus:outline-hidden"
                        />
                      </div>
                    )}

                    {/* Multi-Select Action Links */}
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <button
                        onClick={() => handleSelectAllCategory(col, facetedOptions)}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                      >
                        Select All
                      </button>
                      <button
                        onClick={() => handleClearCategory(col)}
                        className="hover:underline"
                      >
                        Clear
                      </button>
                    </div>

                    {/* Option Checkbox List with Cascading Counts */}
                    <div className="mt-2 max-h-48 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/50">
                      {filteredOptions.length === 0 ? (
                        <div className="py-3 text-center text-xs text-slate-400">
                          No matching options
                        </div>
                      ) : (
                        filteredOptions.map(opt => {
                          const isChecked = selected.includes(opt.value);
                          return (
                            <label
                              key={opt.value}
                              className="flex items-center justify-between py-1.5 px-1 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded cursor-pointer text-xs"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleCategory(col, opt.value)}
                                  className="rounded border-slate-300 text-indigo-600 focus:ring-0"
                                />
                                <span className={`truncate ${isChecked ? 'font-semibold text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                  {opt.value}
                                </span>
                              </div>
                              <span className="font-mono text-[10px] text-slate-400 tabular-nums ml-2 shrink-0">
                                {opt.count.toLocaleString()}
                              </span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* "More Filters" Button for secondary dimensions and numeric ranges (Requirement 28) */}
          {(secondaryDims.length > 0 || numericColumns.length > 0) && (
            <button
              onClick={() => setShowMoreModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors shadow-2xs"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
              <span>More Filters</span>
            </button>
          )}
          </div>
        </div>

        {/* Right side controls: Record summary count, Undo, Clear All */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {showSummary && (
            <div className="hidden lg:flex items-center gap-1.5 font-mono text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
              <span>Showing:</span>
              <strong className="text-slate-800 dark:text-slate-200">{filteredRows.length.toLocaleString()}</strong>
              <span>/</span>
              <span>{totalRowCount.toLocaleString()}</span>
              <span className="rounded bg-slate-100 px-1 py-0.2 text-[10px] font-semibold dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {filteredPercentage}%
              </span>
            </div>
          )}

          {/* Undo Last Filter (Requirement 16) */}
          {canUndoFilter && (
            <button
              onClick={undoLastFilter}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 shadow-2xs transition-colors"
              title="Undo last filter modification"
            >
              <RotateCcw className="h-3 w-3" />
              <span className="hidden sm:inline">Undo</span>
            </button>
          )}

          {/* Clear All Filters Button (Requirement 17) */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 shadow-2xs transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              <span>Clear All ({activeFilterCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. ACTIVE FILTER CHIPS ROW (Requirement 6) */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="h-3 w-3" />
            <span>Active:</span>
          </span>

          {/* Search Term Chip */}
          {advancedFilters.searchTerm && (
            <span className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300">
              <span>Search: "{advancedFilters.searchTerm}"</span>
              <button
                onClick={() => removeFilterChip('search')}
                className="hover:text-rose-600 ml-0.5"
                title="Remove Search Filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {/* Date Range Chip */}
          {advancedFilters.dateRange && (
            <span className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300">
              <Calendar className="h-3 w-3" />
              <span>Date: {advancedFilters.dateRange.start || 'Start'} → {advancedFilters.dateRange.end || 'End'}</span>
              <button
                onClick={() => removeFilterChip('date')}
                className="hover:text-rose-600 ml-0.5"
                title="Remove Date Filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {/* Categorical Chips */}
          {Object.entries(advancedFilters.categoricalFilters).map(([col, values]) => {
            return values.map(val => (
              <span
                key={`${col}-${val}`}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 shadow-2xs"
              >
                <span className="font-semibold text-slate-500">{col}:</span>
                <span>{val}</span>
                <button
                  onClick={() => removeFilterChip('category', col, val)}
                  className="hover:text-rose-600 ml-0.5"
                  title={`Remove ${col}: ${val}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ));
          })}

          {/* Numeric Range Chips */}
          {Object.entries(advancedFilters.numericFilters).map(([col, range]) => {
            if (!range || (range.min === null && range.max === null)) return null;
            return (
              <span
                key={`num-${col}`}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 shadow-2xs font-mono tabular-nums"
              >
                <span className="font-semibold text-slate-500">{col}:</span>
                <span>[{range.min !== null ? range.min : 'min'} → {range.max !== null ? range.max : 'max'}]</span>
                <button
                  onClick={() => removeFilterChip('numeric', col)}
                  className="hover:text-rose-600 ml-0.5"
                  title={`Remove ${col} Range Filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}

          <button
            onClick={clearFilters}
            className="text-[11px] font-semibold text-indigo-600 hover:underline dark:text-indigo-400 ml-1"
          >
            Clear All
          </button>
        </div>
      )}

      {/* 3. "MORE FILTERS" MODAL (Requirements 5 & 28) */}
      {showMoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-indigo-500" />
                <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                  Advanced Filters & Numeric Ranges
                </h3>
              </div>
              <button
                onClick={() => setShowMoreModal(false)}
                className="rounded-md p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-5">
              {/* Secondary Categorical Dimensions */}
              {secondaryDims.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Secondary Categorical Dimensions
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {secondaryDims.map(col => {
                      const selected = advancedFilters.categoricalFilters[col] || [];
                      const faceted = FilterEngine.getFacetedOptions(dataset.rows, col, advancedFilters);
                      return (
                        <div key={col} className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-800 dark:bg-slate-950/40">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{col}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{selected.length} selected</span>
                          </div>
                          <div className="max-h-28 overflow-y-auto space-y-1 text-xs">
                            {faceted.map(opt => (
                              <label key={opt.value} className="flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 p-1 rounded">
                                <div className="flex items-center gap-1.5 truncate">
                                  <input
                                    type="checkbox"
                                    checked={selected.includes(opt.value)}
                                    onChange={() => handleToggleCategory(col, opt.value)}
                                    className="rounded text-indigo-600"
                                  />
                                  <span className="truncate">{opt.value}</span>
                                </div>
                                <span className="font-mono text-[10px] text-slate-400 ml-2">{opt.count}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Numeric Ranges (Requirement 5) */}
              {numericColumns.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Numeric Range Boundaries
                  </h4>
                  <div className="space-y-3">
                    {numericColumns.map(col => {
                      const bounds = FilterEngine.getNumericBoundaries(dataset.rows, col);
                      const currentFilter = advancedFilters.numericFilters[col];
                      const inputs = numRangeInputs[col] || { 
                        min: currentFilter?.min !== null && currentFilter?.min !== undefined ? String(currentFilter.min) : '', 
                        max: currentFilter?.max !== null && currentFilter?.max !== undefined ? String(currentFilter.max) : '' 
                      };
                      const hasError = inputs.min !== '' && inputs.max !== '' && Number(inputs.min) > Number(inputs.max);

                      return (
                        <div key={col} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{col}</span>
                            <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                              Bounds: [{bounds.min.toLocaleString()} → {bounds.max.toLocaleString()}]
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <input
                                type="number"
                                placeholder={`Min (${bounds.min})`}
                                value={inputs.min}
                                onChange={(e) => setNumRangeInputs(prev => ({
                                  ...prev,
                                  [col]: { ...inputs, min: e.target.value }
                                }))}
                                className="w-full rounded border border-slate-200 bg-white p-1.5 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 font-mono"
                              />
                            </div>
                            <span className="text-slate-400">→</span>
                            <div className="flex-1">
                              <input
                                type="number"
                                placeholder={`Max (${bounds.max})`}
                                value={inputs.max}
                                onChange={(e) => setNumRangeInputs(prev => ({
                                  ...prev,
                                  [col]: { ...inputs, max: e.target.value }
                                }))}
                                className="w-full rounded border border-slate-200 bg-white p-1.5 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 font-mono"
                              />
                            </div>
                            <button
                              onClick={() => handleApplyNumericFilter(col)}
                              disabled={hasError}
                              className="rounded bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                            >
                              Apply
                            </button>
                            {currentFilter && (
                              <button
                                onClick={() => {
                                  setNumericFilter(col, null);
                                  setNumRangeInputs(prev => ({ ...prev, [col]: { min: '', max: '' } }));
                                }}
                                className="rounded p-1 text-slate-400 hover:text-rose-600"
                                title="Clear numeric range"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          {hasError && (
                            <p className="mt-1 flex items-center gap-1 text-[11px] text-rose-600">
                              <AlertCircle className="h-3 w-3" />
                              <span>Minimum value cannot exceed Maximum value</span>
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-rose-600 hover:underline"
              >
                Reset All Filters
              </button>
              <button
                onClick={() => setShowMoreModal(false)}
                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE FULL-WIDTH FILTER SHEET (Requirement 25) */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/60 backdrop-blur-xs sm:hidden">
          <div 
            className="fixed inset-0"
            onClick={() => setMobileFiltersOpen(false)}
            aria-hidden="true"
          />

          <div className="relative z-10 flex max-h-[90vh] w-full flex-col rounded-t-2xl border-t border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in slide-in-from-bottom duration-250">
            {/* Mobile Sheet Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Dataset Filters
                </h3>
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 font-mono text-[11px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {activeFilterCount} active
                  </span>
                )}
              </div>

              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
                aria-label="Close filters sheet"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Sheet Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Active Filter Chips with Quick Remove */}
              {activeFilterCount > 0 && (
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 dark:border-indigo-950/80 dark:bg-indigo-950/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                      Active Filters ({activeFilterCount})
                    </span>
                    <button
                      onClick={clearFilters}
                      className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {advancedFilters.dateRange && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-semibold text-indigo-800 dark:bg-slate-800 dark:text-indigo-300 shadow-2xs">
                        <span>Date: {advancedFilters.dateRange.start || 'Start'} → {advancedFilters.dateRange.end || 'End'}</span>
                        <button onClick={() => removeFilterChip('date')} className="hover:text-rose-600 ml-1">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    )}

                    {Object.entries(advancedFilters.categoricalFilters).map(([col, values]) => (
                      values.map(val => (
                        <span key={`${col}-${val}`} className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-200 shadow-2xs">
                          <span>{col}: <strong>{val}</strong></span>
                          <button onClick={() => handleToggleCategory(col, val)} className="hover:text-rose-600 ml-1">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ))
                    ))}
                  </div>
                </div>
              )}

              {/* Date Range Picker */}
              {dateColumn && (
                <div className="rounded-xl border border-slate-200 p-3.5 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                      Date Range ({dateColumn})
                    </span>
                    {advancedFilters.dateRange && (
                      <button
                        onClick={() => setDateRangeFilter(null)}
                        className="text-xs text-rose-600 hover:underline font-semibold"
                      >
                        Reset Date
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {datePresets.map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => handleSelectDatePreset(preset.id)}
                        className={`rounded-lg py-2 px-1 text-xs font-semibold transition-colors cursor-pointer text-center min-h-[38px] ${
                          advancedFilters.dateRange?.preset === preset.id
                            ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Start Date</label>
                      <input
                        type="date"
                        min={dateBounds.minDate}
                        max={dateBounds.maxDate}
                        value={advancedFilters.dateRange?.start || ''}
                        onChange={(e) => handleCustomDateChange(e.target.value || null, advancedFilters.dateRange?.end || null)}
                        className="w-full mt-1 rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-850 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">End Date</label>
                      <input
                        type="date"
                        min={dateBounds.minDate}
                        max={dateBounds.maxDate}
                        value={advancedFilters.dateRange?.end || ''}
                        onChange={(e) => handleCustomDateChange(advancedFilters.dateRange?.start || null, e.target.value || null)}
                        className="w-full mt-1 rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-850 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Categorical Dimension Selectors */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                  Categorical Dimensions
                </span>

                {categoricalColumns.map((col) => {
                  const faceted = FilterEngine.getFacetedOptions(dataset.rows, col, advancedFilters);
                  const selected = advancedFilters.categoricalFilters[col] || [];

                  return (
                    <div key={col} className="rounded-xl border border-slate-200 p-3.5 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {col}
                        </span>
                        {selected.length > 0 && (
                          <button
                            onClick={() => handleClearCategory(col)}
                            className="text-xs text-rose-600 hover:underline font-semibold"
                          >
                            Clear ({selected.length})
                          </button>
                        )}
                      </div>

                      <div className="mt-2.5 max-h-40 overflow-y-auto space-y-1">
                        {faceted.slice(0, 15).map((opt: FacetedOption) => {
                          const isChecked = selected.includes(opt.value);
                          return (
                            <label
                              key={opt.value}
                              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850 text-xs cursor-pointer min-h-[38px]"
                            >
                              <div className="flex items-center gap-2.5 truncate">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleCategory(col, opt.value)}
                                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-0"
                                />
                                <span className={`truncate ${isChecked ? 'font-bold text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                  {opt.value}
                                </span>
                              </div>
                              <span className="font-mono text-[10px] text-slate-400 tabular-nums">
                                {opt.count.toLocaleString()}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Sheet Sticky Footer */}
            <div className="border-t border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900 flex items-center gap-2">
              <button
                onClick={clearFilters}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 min-h-[44px] cursor-pointer"
              >
                Reset All
              </button>

              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-xs hover:bg-indigo-500 min-h-[44px] cursor-pointer"
              >
                Apply & View ({filteredRows.length.toLocaleString()})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
