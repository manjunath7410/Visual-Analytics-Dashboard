import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Trash2, 
  Download, 
  ArrowRight, 
  Table2, 
  CheckCircle2, 
  RotateCcw,
  Layers,
  Database,
  FileSpreadsheet,
  FileCheck,
  LineChart
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { PageContainer } from '../components/common/PageContainer';
import { EmptyState } from '../components/common/EmptyState';
import { DataQualityCard } from '../components/cleaning/DataQualityCard';
import { ETLPipelineStatus } from '../components/cleaning/ETLPipelineStatus';
import { MissingValuesSection } from '../components/cleaning/MissingValuesSection';
import { DuplicatesSection } from '../components/cleaning/DuplicatesSection';
import { DataTypesSection } from '../components/cleaning/DataTypesSection';
import { OutlierSection } from '../components/cleaning/OutlierSection';
import { TextAndColumnCleaning } from '../components/cleaning/TextAndColumnCleaning';
import { CleaningHistorySection } from '../components/cleaning/CleaningHistorySection';
import { CleaningPreviewModal } from '../components/cleaning/CleaningPreviewModal';
import { DataPreviewTable } from '../components/data/DataPreviewTable';
import { 
  executeRemoveDuplicates, 
  executeFillMissing, 
  executeRemoveMissingRows, 
  executeCleanNumeric, 
  executeCleanDates, 
  executeTextTransform,
  executeRemoveOutliers 
} from '../utils/dataCleaning';

export const DataCleaningPage: React.FC = () => {
  const { 
    dataset, 
    rawDataset, 
    cleanedDataset,
    activeDatasetMode,
    setActiveDatasetMode,
    loadSampleDataset,
    qualityReport,
    etlStages,
    cleaningHistory,
    canUndo,
    undoLastOperation,
    resetCleaning,
    applyCleaningOperation,
    overrideColumnType,
    removeColumn,
    renameColumn,
    exportDatasetAsCSV
  } = useData();

  const navigate = useNavigate();

  // Preview Modal State
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    affectedRowCount: number;
    previewColumn?: string;
    beforeSample: any[];
    afterSample: any[];
    confirmAction: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    affectedRowCount: 0,
    beforeSample: [],
    afterSample: [],
    confirmAction: () => {}
  });

  const [previewSearch, setPreviewSearch] = useState<string>('');

  if (!dataset || !rawDataset || !cleanedDataset) {
    return (
      <PageContainer
        title="Data Cleaning & ETL"
        subtitle="Prepare, validate, and transform your dataset before analysis."
        breadcrumbs={[
          { label: 'Data', onClick: () => navigate('/upload') },
          { label: 'Data Cleaning' }
        ]}
      >
        <EmptyState
          title="No Dataset Available for Cleaning"
          description="Upload a CSV dataset or load the demonstration commercial sales data to access the automated data cleaning and transformation pipeline."
          actionText="Upload Dataset"
          onAction={() => navigate('/upload')}
          secondaryActionText="Load Sample Dataset"
          onSecondaryAction={loadSampleDataset}
        />
      </PageContainer>
    );
  }

  // --- Handlers for Cleaning Operations ---

  // 1. Remove Duplicates
  const handleRemoveDuplicates = () => {
    const { cleanedRows, removedCount } = executeRemoveDuplicates(
      cleanedDataset.rows,
      cleanedDataset.rawHeaders
    );

    applyCleaningOperation(
      {
        type: 'remove_duplicates',
        description: `Removed ${removedCount.toLocaleString()} duplicate records`,
        affectedRows: removedCount
      },
      cleanedRows
    );
  };

  // 2. Fill Missing
  const handleFillMissing = (columnName: string, strategy: any, customVal?: any) => {
    const { cleanedRows, affectedCount } = executeFillMissing(
      cleanedDataset.rows,
      columnName,
      strategy,
      customVal
    );

    applyCleaningOperation(
      {
        type: 'fill_missing',
        columnName,
        description: `Imputed ${affectedCount} missing cells in "${columnName}" using ${strategy}`,
        affectedRows: affectedCount
      },
      cleanedRows
    );
  };

  // 3. Drop Missing Rows
  const handleDropMissingRows = (columnName: string) => {
    const { cleanedRows, removedCount } = executeRemoveMissingRows(
      cleanedDataset.rows,
      columnName
    );

    applyCleaningOperation(
      {
        type: 'remove_missing_rows',
        columnName,
        description: `Removed ${removedCount} rows with missing "${columnName}"`,
        affectedRows: removedCount
      },
      cleanedRows
    );
  };

  // 4. Numeric Cleaning
  const handleCleanNumeric = (columnName: string, strategy: 'to_missing' | 'replace_zero' | 'remove_rows') => {
    const { cleanedRows, affectedCount } = executeCleanNumeric(
      cleanedDataset.rows,
      columnName,
      strategy
    );

    applyCleaningOperation(
      {
        type: 'clean_numeric',
        columnName,
        description: `Sanitized numeric column "${columnName}" using ${strategy} (${affectedCount} rows adjusted)`,
        affectedRows: affectedCount
      },
      cleanedRows
    );
  };

  // 5. Date Cleaning
  const handleCleanDates = (columnName: string, strategy: 'remove_invalid' | 'to_missing') => {
    const { cleanedRows, affectedCount } = executeCleanDates(
      cleanedDataset.rows,
      columnName,
      strategy
    );

    applyCleaningOperation(
      {
        type: 'clean_dates',
        columnName,
        description: `Sanitized temporal dates in "${columnName}" using ${strategy} (${affectedCount} rows adjusted)`,
        affectedRows: affectedCount
      },
      cleanedRows
    );
  };

  // 6. Text Transform
  const handleTextTransform = (
    columnName: string,
    transformType: 'trim' | 'lowercase' | 'uppercase' | 'titlecase' | 'collapse_spaces'
  ) => {
    const { cleanedRows, affectedCount } = executeTextTransform(
      cleanedDataset.rows,
      columnName,
      transformType
    );

    applyCleaningOperation(
      {
        type: 'text_transform',
        columnName,
        description: `Normalized text in "${columnName}" with ${transformType} (${affectedCount} rows updated)`,
        affectedRows: affectedCount
      },
      cleanedRows
    );
  };

  // 7. Remove Outliers
  const handleRemoveOutliers = (columnName: string, lowerBound: number, upperBound: number) => {
    const { cleanedRows, removedCount } = executeRemoveOutliers(
      cleanedDataset.rows,
      columnName,
      lowerBound,
      upperBound
    );

    applyCleaningOperation(
      {
        type: 'remove_outliers',
        columnName,
        description: `Filtered out ${removedCount} IQR outliers in "${columnName}" beyond [${lowerBound}, ${upperBound}]`,
        affectedRows: removedCount
      },
      cleanedRows
    );
  };

  return (
    <PageContainer
      title="Data Cleaning & ETL"
      subtitle="Prepare, validate, and transform your dataset before analysis."
      fullWidth={true}
      breadcrumbs={[
        { label: 'Data Preparation', onClick: () => navigate('/cleaning') },
        { label: 'Data Cleaning & ETL' }
      ]}
      metadata={
        <>
          <span>Active View: <strong>{activeDatasetMode === 'clean' ? 'Cleaned Dataset' : 'Original Raw Dataset'}</strong></span>
          <span>·</span>
          <span>Quality: <strong>{qualityReport.score}/100 ({qualityReport.rating})</strong></span>
          <span>·</span>
          <span>Transformations Applied: {cleaningHistory.filter(h => h.status === 'applied').length}</span>
        </>
      }
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {cleaningHistory.length > 0 && (
            <button
              onClick={resetCleaning}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
              title="Reset all transformations back to the raw source data"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Changes</span>
            </button>
          )}

          {/* Download Raw CSV */}
          <button
            onClick={() => exportDatasetAsCSV('raw')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
            title="Download the unmodified original raw CSV file"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Raw CSV</span>
          </button>

          {/* Download Cleaned CSV */}
          <button
            onClick={() => exportDatasetAsCSV('clean')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition-colors cursor-pointer"
            title="Download the sanitized and cleaned CSV dataset"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Cleaned CSV</span>
          </button>

          {/* Go to Explorer */}
          <button
            onClick={() => navigate('/explorer')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
          >
            <Table2 className="h-3.5 w-3.5" />
            <span>Open Explorer</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* OVERVIEW STATS RIBBON (Requirement 1 & 3) */}
        <section aria-label="Dataset Overview">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Original Rows</span>
              <div className="mt-1 font-mono text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {rawDataset.statistics.rowCount.toLocaleString()}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Cleaned Rows</span>
              <div className="mt-1 font-mono text-xl font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                {cleanedDataset.statistics.rowCount.toLocaleString()}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Columns</span>
              <div className="mt-1 font-mono text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {cleanedDataset.statistics.columnCount}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Missing Values</span>
              <div className="mt-1 font-mono text-xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                {cleanedDataset.statistics.missingValuesCount.toLocaleString()}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Duplicates Remaining</span>
              <div className="mt-1 font-mono text-xl font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                {cleanedDataset.statistics.duplicateRowsCount.toLocaleString()}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Pipeline Status</span>
              <div className="mt-1 flex items-center gap-1 font-semibold text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>{cleaningHistory.length > 0 ? 'Transformed' : 'Synchronized'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* 1. VISUAL ETL PIPELINE STATUS */}
        <section aria-label="ETL Pipeline">
          <ETLPipelineStatus stages={etlStages} />
        </section>

        {/* 2. DATA QUALITY SCORE (Requirement 2 & 4 & 5) */}
        <section aria-label="Data Quality">
          <DataQualityCard report={qualityReport} />
        </section>

        {/* 3. MISSING VALUES ANALYSIS & HANDLING (Requirement 8 & 9) */}
        <section aria-label="Missing Values">
          <MissingValuesSection
            rows={cleanedDataset.rows}
            columns={cleanedDataset.columns}
            onApplyFill={handleFillMissing}
            onApplyDropRows={handleDropMissingRows}
            onShowPreview={(cfg) => setPreviewModal({ ...cfg, isOpen: true })}
          />
        </section>

        {/* 4. DUPLICATE DETECTION & REMOVAL (Requirement 10) */}
        <section aria-label="Duplicates">
          <DuplicatesSection
            duplicateCount={cleanedDataset.statistics.duplicateRowsCount}
            totalRows={cleanedDataset.statistics.rowCount}
            onRemoveDuplicates={handleRemoveDuplicates}
            onShowPreview={(cfg) => setPreviewModal({ ...cfg, isOpen: true })}
          />
        </section>

        {/* 5. DATA TYPE OVERRIDES & INCONSISTENCY SANITIZATION (Requirement 11 & 14) */}
        <section aria-label="Data Types">
          <DataTypesSection
            columns={cleanedDataset.columns}
            onOverrideType={overrideColumnType}
            onCleanNumeric={handleCleanNumeric}
            onCleanDates={handleCleanDates}
          />
        </section>

        {/* 6. OUTLIER DETECTION (IQR METHOD) (Requirement 13) */}
        <section aria-label="Outliers">
          <OutlierSection
            rows={cleanedDataset.rows}
            columns={cleanedDataset.columns}
            onRemoveOutliers={handleRemoveOutliers}
            onShowPreview={(cfg) => setPreviewModal({ ...cfg, isOpen: true })}
          />
        </section>

        {/* 7. TEXT NORMALIZATION & COLUMN CLEANING (Requirement 12) */}
        <section aria-label="Text & Column Cleaning">
          <TextAndColumnCleaning
            columns={cleanedDataset.columns}
            onTextTransform={handleTextTransform}
            onRemoveColumn={removeColumn}
            onRenameColumn={renameColumn}
            onShowPreview={(cfg) => setPreviewModal({ ...cfg, isOpen: true })}
            rowCount={cleanedDataset.statistics.rowCount}
          />
        </section>

        {/* 8. AUDIT LOG & CLEANING HISTORY (Requirement 15 & 16) */}
        <section aria-label="Cleaning History">
          <CleaningHistorySection
            history={cleaningHistory}
            canUndo={canUndo}
            onUndo={undoLastOperation}
            onResetCleaning={resetCleaning}
            activeMode={activeDatasetMode}
            onToggleMode={setActiveDatasetMode}
          />
        </section>

        {/* 9. DATASET READY CTA CARD (Requirement 18 & 19) */}
        <section aria-label="Cleaned Dataset Status">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl border border-indigo-100 bg-indigo-50/60 p-5 dark:border-indigo-950/70 dark:bg-indigo-950/30 gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Cleaned Dataset Ready for Business Intelligence
                </h4>
                <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                  {cleanedDataset.statistics.rowCount.toLocaleString()} sanitized records · Quality: {qualityReport.score}/100 ({qualityReport.rating})
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => navigate('/analytics')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition-colors cursor-pointer"
              >
                <LineChart className="h-4 w-4" />
                <span>Continue to Analytics</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
              >
                <span>View Dashboard</span>
              </button>
            </div>
          </div>
        </section>

        {/* 10. INTERACTIVE PREVIEW OF CURRENT CLEANED/RAW DATASET */}
        <section aria-label="Dataset Preview">
          <DataPreviewTable
            title={`${activeDatasetMode === 'clean' ? 'Cleaned Dataset' : 'Original Raw Dataset'} Ledger`}
            rows={dataset.rows}
            columns={dataset.columns}
            searchQuery={previewSearch}
            onSearchChange={setPreviewSearch}
            onExportFiltered={() => exportDatasetAsCSV(activeDatasetMode)}
          />
        </section>
      </div>

      {/* Confirmation & Transformation Preview Modal */}
      <CleaningPreviewModal
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={previewModal.confirmAction}
        title={previewModal.title}
        description={previewModal.description}
        affectedRowCount={previewModal.affectedRowCount}
        previewColumn={previewModal.previewColumn}
        beforeSample={previewModal.beforeSample}
        afterSample={previewModal.afterSample}
      />
    </PageContainer>
  );
};
