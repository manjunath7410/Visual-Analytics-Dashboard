import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileSpreadsheet, 
  ArrowRight, 
  Table2, 
  LineChart, 
  Sparkles
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { PageContainer } from '../components/common/PageContainer';
import { FileUpload } from '../components/data/FileUpload';
import { DatasetSummary } from '../components/data/DatasetSummary';
import { ColumnMetadataTable } from '../components/data/ColumnMetadataTable';

export const DataUploadPage: React.FC = () => {
  const { dataset, setDataset, clearDataset, loadSampleDataset } = useData();
  const navigate = useNavigate();

  return (
    <PageContainer
      title="Data Upload"
      subtitle="Import your business dataset and begin exploring your data."
      breadcrumbs={[
        { label: 'Data', onClick: () => navigate('/upload') },
        { label: 'Data Upload' }
      ]}
      metadata={
        <>
          <span className="font-semibold text-slate-700 dark:text-slate-300">Parser: RFC 4180 Streaming PapaParse</span>
          <span>·</span>
          <span>In-Memory Analytical Storage</span>
        </>
      }
      actions={
        dataset ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/explorer')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition-colors"
            >
              <Table2 className="h-3.5 w-3.5" />
              <span>Open Data Explorer</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={loadSampleDataset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 shadow-2xs transition-colors cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            <span>Load Sample Dataset</span>
          </button>
        )
      }
    >
      {/* File Upload Component */}
      <FileUpload
        currentDataset={dataset}
        onDatasetLoaded={(newDs) => setDataset(newDs)}
        onClearDataset={clearDataset}
      />

      {/* Dataset Summary & Metadata Breakdown (Shows when dataset is active) */}
      {dataset && (
        <div className="mt-8 space-y-8">
          <DatasetSummary
            statistics={dataset.statistics}
            datasetName={dataset.name}
            isSample={dataset.isSample}
          />

          <ColumnMetadataTable
            columns={dataset.columns}
            rowCount={dataset.statistics.rowCount}
            rows={dataset.rows}
          />

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/50 p-5 dark:border-indigo-950/60 dark:bg-indigo-950/20 gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Ready for Multi-Dimensional Data Exploration
              </h4>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                Your dataset is staged in active memory with full column filters, global search, and sorting.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => navigate('/cleaning')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition-colors cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>Go to Data Cleaning</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={() => navigate('/explorer')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Table2 className="h-4 w-4" />
                <span>Explore Records</span>
              </button>

              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
              >
                <LineChart className="h-4 w-4 text-indigo-500" />
                <span>View Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
