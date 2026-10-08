import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  Sparkles, 
  Trash2, 
  RotateCcw, 
  Download,
  Table2,
  FileSpreadsheet
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { PageContainer } from '../components/common/PageContainer';
import { EmptyState } from '../components/common/EmptyState';
import { GlobalFilterBar } from '../components/common/GlobalFilterBar';
import { DatasetSummary } from '../components/data/DatasetSummary';
import { DatasetHealthCard } from '../components/data/DatasetHealthCard';
import { ColumnMetadataTable } from '../components/data/ColumnMetadataTable';
import { DatasetFilters } from '../components/data/DatasetFilters';
import { DataPreviewTable } from '../components/data/DataPreviewTable';

export const DataExplorerPage: React.FC = () => {
  const { 
    dataset, 
    filteredRows, 
    filters, 
    setFilter, 
    clearFilters, 
    activeFilterCount,
    searchQuery, 
    setSearchQuery,
    clearDataset,
    loadSampleDataset
  } = useData();

  const navigate = useNavigate();

  // Export filtered rows as CSV
  const handleExportCSV = () => {
    if (!filteredRows || filteredRows.length === 0 || !dataset) return;
    const headers = dataset.rawHeaders;
    const rowsText = filteredRows.map(r => {
      return headers.map(h => {
        const val = r[h];
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
    link.download = `${dataset.name.toLowerCase().replace(/\s+/g, '_')}_filtered_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // If no dataset is loaded, show empty state
  if (!dataset) {
    return (
      <PageContainer
        title="Data Explorer"
        subtitle="Inspect your dataset, understand its structure, and explore individual records."
        breadcrumbs={[
          { label: 'Data', onClick: () => navigate('/upload') },
          { label: 'Data Explorer' }
        ]}
      >
        <EmptyState
          title="No Dataset Available"
          description="Upload a CSV file or load the benchmark commercial sales data to start inspecting column schemas, filtering records, and exploring data."
          actionText="Upload Dataset"
          onAction={() => navigate('/upload')}
          secondaryActionText="Load Sample Dataset"
          onSecondaryAction={loadSampleDataset}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Data Explorer"
      subtitle="Inspect your dataset, understand its structure, and explore individual records."
      fullWidth={true}
      breadcrumbs={[
        { label: 'Data', onClick: () => navigate('/upload') },
        { label: 'Data Explorer' }
      ]}
      metadata={
        <>
          <span className="font-semibold text-slate-700 dark:text-slate-300">Dataset: {dataset.name}</span>
          <span>·</span>
          <span>{dataset.isSample ? 'Demonstration Benchmark' : 'User Upload'}</span>
          <span>·</span>
          <span>Filtered: {filteredRows.length.toLocaleString()} of {dataset.statistics.rowCount.toLocaleString()} rows</span>
        </>
      }
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750 transition-colors shadow-2xs cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Filters ({activeFilterCount})</span>
            </button>
          )}

          <button
            onClick={() => navigate('/cleaning')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 transition-colors shadow-2xs cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            <span>Clean Dataset</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Filtered CSV</span>
          </button>

          <button
            onClick={clearDataset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 transition-colors shadow-2xs cursor-pointer"
            title="Remove dataset and return to clean empty state"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Dataset</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* 1. Dataset Architecture Summary Cards */}
        <section aria-label="Dataset Architecture Summary">
          <DatasetSummary
            statistics={dataset.statistics}
            datasetName={dataset.name}
            isSample={dataset.isSample}
          />
        </section>

        {/* 2. Dataset Health Summary Card */}
        <section aria-label="Dataset Health Summary">
          <DatasetHealthCard dataset={dataset} />
        </section>

        {/* 3. Column Profile & Schema Inspection */}
        <section aria-label="Column Properties">
          <ColumnMetadataTable
            columns={dataset.columns}
            rowCount={dataset.statistics.rowCount}
            rows={dataset.rows}
          />
        </section>

        {/* 4. Global BI Filter Bar */}
        <GlobalFilterBar />

        {/* 5. Granular Multi-Attribute Column Filtering */}
        <section aria-label="Dataset Filters">
          <DatasetFilters
            columns={dataset.columns}
            filters={filters}
            onFilterChange={setFilter}
            onResetFilters={clearFilters}
            activeFilterCount={activeFilterCount}
          />
        </section>

        {/* 6. Interactive Data Preview Ledger */}
        <section aria-label="Data Preview Table">
          <DataPreviewTable
            rows={filteredRows}
            columns={dataset.columns}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onExportFiltered={handleExportCSV}
          />
        </section>
      </div>
    </PageContainer>
  );
};
