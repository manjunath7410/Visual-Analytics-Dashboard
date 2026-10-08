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
  X
} from 'lucide-react';
import { parseCSVFile, ParseResult } from '../../utils/csvParser';
import { analyzeDataset } from '../../utils/dataAnalysis';
import { calculateDataQuality } from '../../utils/dataCleaning';
import { Dataset } from '../../types/dataset';
import { SAMPLE_DATASET_RAW, SAMPLE_DATASET_HEADERS } from '../../data/sampleDataset';

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

  const handleFile = (file: File) => {
    setErrorMessage(null);
    setUploadSuccessInfo(null);
    setSelectedFileMeta({ name: file.name, size: file.size });

    // Validate format
    if (!file.name.toLowerCase().endsWith('.csv') && !file.name.toLowerCase().endsWith('.txt')) {
      setErrorMessage('Unsupported file type. Please select a valid comma-separated (.csv) file.');
      return;
    }

    // Validate size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage('File too large. Maximum supported dataset size is 50 MB.');
      return;
    }

    setIsUploading(true);

    parseCSVFile(
      file,
      (result: ParseResult) => {
        try {
          if (!result.rows || result.rows.length === 0) {
            setIsUploading(false);
            setErrorMessage('No data rows found in the uploaded file. Ensure your CSV contains data rows below the header.');
            return;
          }

          const { typedRows, columns, statistics } = analyzeDataset(result.rows, result.headers);

          const newDataset: Dataset = {
            id: `ds-${Date.now()}`,
            name: file.name.replace(/\.csv$/i, ''),
            fileName: file.name,
            fileSize: file.size,
            uploadDate: new Date().toISOString().split('T')[0],
            isSample: false,
            rows: typedRows,
            columns,
            statistics,
            rawHeaders: result.headers,
          };

          onDatasetLoaded(newDataset);
          setIsUploading(false);
          setUploadSuccessInfo({
            name: file.name,
            rows: statistics.rowCount,
            columns: statistics.columnCount
          });
        } catch (err: any) {
          setIsUploading(false);
          setErrorMessage(`Invalid CSV structure: ${err.message || 'Unable to parse tabular columns.'}`);
        }
      },
      (error: string) => {
        setIsUploading(false);
        setErrorMessage(error || 'Unable to process and parse this CSV file.');
      }
    );
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
      e.target.value = '';
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

      const sampleDataset: Dataset = {
        id: 'ds-sample-enterprise-sales',
        name: 'Enterprise Commercial Sales (Sample)',
        fileName: 'enterprise_sales_sample.csv',
        fileSize: 48200,
        uploadDate: new Date().toISOString().split('T')[0],
        isSample: true,
        rows: typedRows,
        columns,
        statistics,
        rawHeaders: SAMPLE_DATASET_HEADERS,
      };

      onDatasetLoaded(sampleDataset);
      setIsUploading(false);
      setUploadSuccessInfo({
        name: 'enterprise_sales_sample.csv',
        rows: statistics.rowCount,
        columns: statistics.columnCount
      });
    }, 250);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".csv,text/csv,text/plain"
        className="hidden"
        aria-label="Upload CSV File"
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
                  {selectedFileMeta?.name} ({selectedFileMeta?.size ? `${(selectedFileMeta.size / 1024).toFixed(1)} KB` : 'Streaming'})
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
                  {isDragging ? 'Drop file to upload' : 'Drop your dataset here'}
                </h3>

                <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                  Drag & drop your CSV file or browse from your computer
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition-colors"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>Browse Files</span>
                  </button>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
                  <span>Supported format: <strong className="font-semibold text-slate-600 dark:text-slate-300">CSV</strong></span>
                  <span>·</span>
                  <span>Maximum size: <strong className="font-semibold text-slate-600 dark:text-slate-300">50 MB</strong></span>
                  <span>·</span>
                  <span>Client-side in-memory parsing</span>
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
                    Dataset loaded successfully
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-emerald-800 dark:text-emerald-300">
                    <span className="font-mono font-medium">{uploadSuccessInfo.rows.toLocaleString()} records</span>
                    <span>·</span>
                    <span className="font-mono font-medium">{uploadSuccessInfo.columns} columns</span>
                    <span>·</span>
                    <span className="truncate max-w-[180px]">{uploadSuccessInfo.name}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/explorer')}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow-2xs"
                >
                  <Table2 className="h-3.5 w-3.5" />
                  <span>Explore Dataset</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Replace</span>
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
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 transition-colors self-start sm:self-auto shrink-0 shadow-2xs"
              >
                <span>Try Again</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Sample Dataset Option & Help / Guidelines */}
        <div className="lg:col-span-4 space-y-4">
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

          {/* Quick Best-Practice Upload Guidance */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800/80 dark:bg-slate-900/40 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-indigo-500" />
              <span>For Best Results</span>
            </h4>
            <ul className="mt-2 space-y-1.5 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              <li className="flex items-start gap-1.5">
                <Check className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                <span>Use the first row for clean column headers</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                <span>Keep column names distinct and descriptive</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                <span>Avoid completely empty rows and columns</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                <span>Use standard date formats (e.g. YYYY-MM-DD)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                <span>Keep numeric values free from irregular symbols</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Current Dataset Card (Requirement 13 & 14) */}
      {currentDataset && (
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <FileCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {currentDataset.name}
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Ready</span>
                  </span>
                  {currentDataset.isSample && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                      Sample Data
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Uploaded file: <span className="font-mono">{currentDataset.fileName}</span>
                </p>
              </div>
            </div>

            {/* Actions: Explore, Clean Data, Replace, Clear */}
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => navigate('/explorer')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition-colors"
              >
                <Table2 className="h-3.5 w-3.5" />
                <span>Explore Records</span>
              </button>

              <button
                onClick={() => navigate('/cleaning')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 transition-colors shadow-2xs"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                <span>Clean Data</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 transition-colors shadow-2xs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Replace</span>
              </button>

              <button
                onClick={onClearDataset}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60 transition-colors shadow-2xs"
                title="Remove dataset and return to clean initial state"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Row */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 font-mono text-xs">
            <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-2.5 dark:border-slate-800/60 dark:bg-slate-850/40">
              <span className="font-sans text-[11px] text-slate-500 dark:text-slate-400">Total Records</span>
              <div className="mt-0.5 text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {currentDataset.statistics.rowCount.toLocaleString()}
              </div>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-2.5 dark:border-slate-800/60 dark:bg-slate-850/40">
              <span className="font-sans text-[11px] text-slate-500 dark:text-slate-400">Columns</span>
              <div className="mt-0.5 text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {currentDataset.statistics.columnCount}
              </div>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-2.5 dark:border-slate-800/60 dark:bg-slate-850/40">
              <span className="font-sans text-[11px] text-slate-500 dark:text-slate-400">Health Score</span>
              <div className="mt-0.5 text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {qualityScore !== null ? `${qualityScore} / 100` : '100 / 100'}
              </div>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-2.5 dark:border-slate-800/60 dark:bg-slate-850/40">
              <span className="font-sans text-[11px] text-slate-500 dark:text-slate-400">Date Range</span>
              <div className="mt-0.5 text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {dateRange || 'All Time'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Dataset Schema & Guidance (Requirement 11) */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Recommended Dataset Schema
            </h4>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Dynamic schema ingestion automatically maps arbitrary CSV column types into dimensions and measures.
            </p>
          </div>
          <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300 self-start sm:self-auto">
            RFC 4180 CSV Standard
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 dark:bg-slate-950 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-300">
              <tr>
                <th className="py-2 px-3">Order ID</th>
                <th className="py-2 px-3">Order Date</th>
                <th className="py-2 px-3">Customer</th>
                <th className="py-2 px-3">Region</th>
                <th className="py-2 px-3">Category</th>
                <th className="py-2 px-3">Product</th>
                <th className="py-2 px-3 text-right">Quantity</th>
                <th className="py-2 px-3 text-right">Sales</th>
                <th className="py-2 px-3 text-right">Profit</th>
                <th className="py-2 px-3 text-right">Discount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-700 dark:divide-slate-800/60 dark:text-slate-300 bg-white dark:bg-slate-900">
              <tr>
                <td className="py-2 px-3 text-slate-500">SO-101</td>
                <td className="py-2 px-3 text-blue-600 dark:text-blue-400">2026-10-01</td>
                <td className="py-2 px-3 font-sans">Acme Global, Inc.</td>
                <td className="py-2 px-3">North America</td>
                <td className="py-2 px-3">Cloud Infrastructure</td>
                <td className="py-2 px-3 font-sans">Kubernetes Engine Pro</td>
                <td className="py-2 px-3 text-right">12</td>
                <td className="py-2 px-3 text-right text-slate-900 dark:text-slate-100">$64,500</td>
                <td className="py-2 px-3 text-right text-emerald-600 dark:text-emerald-400">$46,200</td>
                <td className="py-2 px-3 text-right">0.05</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-slate-500">SO-102</td>
                <td className="py-2 px-3 text-blue-600 dark:text-blue-400">2026-10-02</td>
                <td className="py-2 px-3 font-sans">Vertex Dynamics</td>
                <td className="py-2 px-3">EMEA</td>
                <td className="py-2 px-3">Cyber Security</td>
                <td className="py-2 px-3 font-sans">Zero Trust Security Suite</td>
                <td className="py-2 px-3 text-right">8</td>
                <td className="py-2 px-3 text-right text-slate-900 dark:text-slate-100">$42,000</td>
                <td className="py-2 px-3 text-right text-emerald-600 dark:text-emerald-400">$30,600</td>
                <td className="py-2 px-3 text-right">0.10</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
