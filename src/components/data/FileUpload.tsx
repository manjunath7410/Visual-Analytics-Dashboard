import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  RefreshCw, 
  Sparkles, 
  ArrowRight, 
  Info, 
  FileCheck,
  Table2,
  Calendar,
  Check,
  ShieldCheck,
  Loader2,
  X,
  FileCode,
  FileText,
  FileJson
} from 'lucide-react';
import { parseDatasetFile, ParsedDatasetFile, detectFileFormat } from '../../utils/universalParser';
import { analyzeDataset } from '../../utils/dataAnalysis';
import { calculateDataQuality } from '../../utils/dataCleaning';
import { calculateSemanticColumnMappings, ColumnMappingResult } from '../../utils/intelligentColumnMapping';
import { normalizeDatasetToModel } from '../../utils/dataNormalization';
import { Dataset } from '../../types/dataset';
import { SAMPLE_DATASET_RAW, SAMPLE_DATASET_HEADERS } from '../../data/sampleDataset';
import { DatasetPreview } from './DatasetPreview';

interface FileUploadProps {
  currentDataset: Dataset | null;
  onDatasetLoaded: (dataset: Dataset) => void;
  onClearDataset: () => void;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  currentDataset,
  onDatasetLoaded,
  onClearDataset,
  className = ''
}) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [selectedFileMeta, setSelectedFileMeta] = useState<{ name: string; size: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadSuccessInfo, setUploadSuccessInfo] = useState<{ name: string; rows: number; columns: number } | null>(null);

  // Staged Preview Dataset State
  const [parsedFileInfo, setParsedFileInfo] = useState<ParsedDatasetFile | null>(null);
  const [analyzedDatasetState, setAnalyzedDatasetState] = useState<Dataset | null>(null);
  const [columnMappings, setColumnMappings] = useState<ColumnMappingResult[]>([]);

  // Quality score for current dataset
  const qualityScore = React.useMemo(() => {
    if (!currentDataset) return null;
    const report = calculateDataQuality(currentDataset.rows, currentDataset.columns, currentDataset.statistics);
    return report.score;
  }, [currentDataset]);

  // Date range for current dataset
  const dateRange = React.useMemo(() => {
    if (!currentDataset) return null;
    const dateCol = currentDataset.columns.find(c => c.type === 'Date');
    if (dateCol && dateCol.minDate && dateCol.maxDate) {
      return `${dateCol.minDate} to ${dateCol.maxDate}`;
    }
    return null;
  }, [currentDataset]);

  const processLoadedFile = (parsed: ParsedDatasetFile, file: File | { name: string; size: number }) => {
    try {
      if (!parsed.rows || parsed.rows.length === 0) {
        setIsUploading(false);
        setErrorMessage('Dataset contains no usable rows.');
        return;
      }

      const { typedRows, columns, statistics } = analyzeDataset(parsed.rows, parsed.headers);

      if (columns.length === 0) {
        setIsUploading(false);
        setErrorMessage('Unable to identify suitable analytical columns.');
        return;
      }

      // Calculate semantic column mappings
      const mappings = calculateSemanticColumnMappings(columns, typedRows);
      setColumnMappings(mappings);

      // Normalize into analytical star schema model
      const { normalizedRows, model } = normalizeDatasetToModel(typedRows, columns, mappings);

      const newDataset: Dataset = {
        id: `ds-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        fileName: file.name,
        fileSize: file.size,
        fileType: parsed.fileType,
        sheetNames: parsed.sheetNames,
        activeSheet: parsed.activeSheet,
        uploadDate: new Date().toISOString().split('T')[0],
        isSample: false,
        rows: normalizedRows,
        columns,
        statistics,
        rawHeaders: parsed.headers,
        normalizedModel: model
      };

      setParsedFileInfo(parsed);
      setAnalyzedDatasetState(newDataset);

      // Auto-load into active context
      onDatasetLoaded(newDataset);
      setIsUploading(false);
      setUploadSuccessInfo({
        name: file.name,
        rows: statistics.rowCount,
        columns: statistics.columnCount
      });
    } catch (err: any) {
      setIsUploading(false);
      setErrorMessage(err.message || 'Unable to parse this file. Please verify that it contains structured tabular data.');
    }
  };

  const handleFile = async (file: File) => {
    setErrorMessage(null);
    setUploadSuccessInfo(null);
    setSelectedFileMeta({ name: file.name, size: file.size });

    // Validate format
    const detected = detectFileFormat(file);
    if (!detected) {
      setErrorMessage('Unsupported file format. Please upload CSV, XLSX, XLS, JSON, or TSV.');
      return;
    }

    // Validate size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage('Dataset is larger than the supported 50 MB limit.');
      return;
    }

    setIsUploading(true);

    try {
      const parsed = await parseDatasetFile(file);
      processLoadedFile(parsed, file);
    } catch (err: any) {
      setIsUploading(false);
      setErrorMessage(err.message || 'Unable to parse this file. Please verify that it contains structured tabular data.');
    }
  };

  const handleSelectExcelSheet = async (sheetName: string) => {
    if (!fileInputRef.current?.files?.[0]) return;
    const file = fileInputRef.current.files[0];
    setIsUploading(true);
    try {
      const parsed = await parseDatasetFile(file, { sheetName });
      processLoadedFile(parsed, file);
    } catch (err: any) {
      setIsUploading(false);
      setErrorMessage(err.message || 'Unable to switch sheet.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleLoadSample = () => {
    setIsUploading(true);
    setErrorMessage(null);
    setUploadSuccessInfo(null);
    setSelectedFileMeta({ name: 'enterprise_sales_sample.csv', size: 48200 });

    setTimeout(() => {
      const { typedRows, columns, statistics } = analyzeDataset(
        SAMPLE_DATASET_RAW,
        SAMPLE_DATASET_HEADERS
      );

      const mappings = calculateSemanticColumnMappings(columns, typedRows);
      setColumnMappings(mappings);

      const { normalizedRows, model } = normalizeDatasetToModel(typedRows, columns, mappings);

      const sampleDataset: Dataset = {
        id: 'ds-sample-enterprise-sales',
        name: 'Enterprise Commercial Sales (Sample)',
        fileName: 'enterprise_sales_sample.csv',
        fileSize: 48200,
        fileType: 'csv',
        uploadDate: new Date().toISOString().split('T')[0],
        isSample: true,
        rows: normalizedRows,
        columns,
        statistics,
        rawHeaders: SAMPLE_DATASET_HEADERS,
        normalizedModel: model
      };

      setParsedFileInfo({
        fileName: 'enterprise_sales_sample.csv',
        fileType: 'csv',
        fileSize: 48200,
        rows: SAMPLE_DATASET_RAW,
        headers: SAMPLE_DATASET_HEADERS,
        warnings: []
      });
      setAnalyzedDatasetState(sampleDataset);

      onDatasetLoaded(sampleDataset);
      setIsUploading(false);
      setUploadSuccessInfo({
        name: 'enterprise_sales_sample.csv',
        rows: statistics.rowCount,
        columns: statistics.columnCount
      });
    }, 200);
  };

  const handleConfirmMappings = (updatedMappings: ColumnMappingResult[]) => {
    setColumnMappings(updatedMappings);
    if (analyzedDatasetState) {
      const { normalizedRows, model } = normalizeDatasetToModel(
        analyzedDatasetState.rows,
        analyzedDatasetState.columns,
        updatedMappings
      );
      const remapped: Dataset = {
        ...analyzedDatasetState,
        rows: normalizedRows,
        normalizedModel: model
      };
      setAnalyzedDatasetState(remapped);
      onDatasetLoaded(remapped);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".csv,.xlsx,.xls,.json,.tsv,.txt"
        className="hidden"
        aria-label="Upload Dataset File"
      />

      {/* Grid: Main Upload Zone (Left/Top) & Current Dataset / Sample (Right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left / Main Column: Upload Dropzone & Success / Error states */}
        <div className="lg:col-span-8 space-y-4">
          {/* Main Drag-and-Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 sm:p-10 text-center transition-all ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/60 dark:border-indigo-400 dark:bg-indigo-950/30 ring-4 ring-indigo-500/10'
                : isUploading
                ? 'border-indigo-300 bg-slate-50 dark:border-indigo-900/60 dark:bg-slate-900/60 cursor-wait'
                : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-slate-700'
            }`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center py-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400 shadow-xs animate-pulse">
                  <Loader2 className="h-7 w-7 animate-spin" />
                </div>
                <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-slate-100">
                  Parsing & Ingesting Dataset...
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {selectedFileMeta?.name} ({selectedFileMeta?.size ? `${(selectedFileMeta.size / 1024).toFixed(1)} KB` : 'Processing'})
                </p>
                <div className="mt-4 h-1.5 w-48 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full w-full bg-indigo-600 rounded-full animate-indeterminate" />
                </div>
              </div>
            ) : (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-transform duration-200 group-hover:scale-105 dark:bg-indigo-950/70 dark:text-indigo-400 shadow-2xs">
                  <Upload className="h-7 w-7" />
                </div>

                <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-slate-100">
                  {isDragging ? 'Drop file to upload' : 'Upload Your Business Dataset'}
                </h3>

                <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                  Drag and drop your dataset file or browse from your computer
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>Browse Files</span>
                  </button>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
                  <span>Supported formats: <strong className="font-semibold text-slate-700 dark:text-slate-300">CSV, XLSX, XLS, JSON, TSV</strong></span>
                  <span>&middot;</span>
                  <span>Maximum file size: <strong className="font-semibold text-slate-700 dark:text-slate-300">50 MB</strong></span>
                  <span>&middot;</span>
                  <span>Secure client-side parsing</span>
                </div>
              </>
            )}
          </div>

          {/* Success State Card */}
          {uploadSuccessInfo && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/40 gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/80 dark:text-emerald-300">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    ✓ Dataset loaded successfully
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-emerald-800 dark:text-emerald-300">
                    <span className="font-mono font-medium">Dataset: {uploadSuccessInfo.name}</span>
                    <span>&middot;</span>
                    <span className="font-mono font-medium">Rows: {uploadSuccessInfo.rows.toLocaleString()}</span>
                    <span>&middot;</span>
                    <span className="font-mono font-medium">Columns: {uploadSuccessInfo.columns}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/explorer')}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow-2xs cursor-pointer"
                >
                  <Table2 className="h-3.5 w-3.5" />
                  <span>Preview Dataset</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 cursor-pointer"
                >
                  <span>Analyze Dataset</span>
                </button>
              </div>
            </div>
          )}

          {/* Error State Card */}
          {errorMessage && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl border border-rose-200 bg-rose-50/90 p-4 dark:border-rose-900/60 dark:bg-rose-950/40 gap-3 animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
                    Unable to load this dataset
                  </span>
                  <p className="mt-0.5 text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
                    {errorMessage}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setErrorMessage(null);
                  fileInputRef.current?.click();
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 transition-colors self-start sm:self-auto shrink-0 shadow-2xs cursor-pointer"
              >
                <span>Try Again</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Supported Formats Section & Sample Dataset Option */}
        <div className="lg:col-span-4 space-y-4">
          {/* Small Supported Formats Section */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-4.5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Supported Formats
            </h4>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/60 p-2 dark:border-slate-800 dark:bg-slate-850/60">
                <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px]">CSV</span>
                  <span className="text-[10px] text-slate-400">Comma-separated</span>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/60 p-2 dark:border-slate-800 dark:bg-slate-850/60">
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px]">Excel</span>
                  <span className="text-[10px] text-slate-400">.xlsx, .xls</span>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/60 p-2 dark:border-slate-800 dark:bg-slate-850/60">
                <FileJson className="h-4 w-4 text-amber-500" />
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px]">JSON</span>
                  <span className="text-[10px] text-slate-400">Array / nested</span>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/60 p-2 dark:border-slate-800 dark:bg-slate-850/60">
                <FileText className="h-4 w-4 text-sky-500" />
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px]">TSV / TXT</span>
                  <span className="text-[10px] text-slate-400">Tab / delimited</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sample Dataset Option Card */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-4.5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Don't have a dataset?
              </h4>
            </div>

            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Test the full Business Intelligence workspace with our pre-loaded enterprise commercial sales benchmark dataset.
            </p>

            <button
              onClick={handleLoadSample}
              disabled={isUploading}
              className="mt-3.5 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 transition-colors cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              <span>Use Sample Dataset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dataset Preview Section (Requirement 5) */}
      {(analyzedDatasetState || currentDataset) && (
        <DatasetPreview
          fileName={analyzedDatasetState?.fileName || currentDataset?.fileName || 'dataset.csv'}
          fileType={analyzedDatasetState?.fileType || currentDataset?.fileType || 'csv'}
          fileSize={analyzedDatasetState?.fileSize || currentDataset?.fileSize || 48200}
          statistics={analyzedDatasetState?.statistics || currentDataset!.statistics}
          columns={analyzedDatasetState?.columns || currentDataset!.columns}
          previewRows={analyzedDatasetState?.rows || currentDataset!.rows}
          mappings={columnMappings.length > 0 ? columnMappings : calculateSemanticColumnMappings(
            analyzedDatasetState?.columns || currentDataset!.columns,
            analyzedDatasetState?.rows || currentDataset!.rows
          )}
          onConfirmMappings={handleConfirmMappings}
          onProceedToDashboard={() => navigate('/')}
          onOpenExplorer={() => navigate('/explorer')}
          sheetNames={analyzedDatasetState?.sheetNames || currentDataset?.sheetNames}
          activeSheet={analyzedDatasetState?.activeSheet || currentDataset?.activeSheet}
          onSelectSheet={handleSelectExcelSheet}
        />
      )}
    </div>
  );
};
