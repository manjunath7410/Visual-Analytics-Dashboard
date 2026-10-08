import React, { useState } from 'react';
import { 
  Download, 
  Table as TableIcon, 
  BarChart3, 
  Maximize2, 
  Minimize2, 
  ArrowLeft, 
  Filter, 
  X,
  Layers
} from 'lucide-react';
import { InteractiveDataPoint } from '../../types/visualization';

interface EnhancedChartContainerProps {
  title: string;
  subtitle?: string;
  drillDownInfo?: {
    canGoBack: boolean;
    onBack: () => void;
    currentLevelLabel: string;
  };
  selectedPoint?: InteractiveDataPoint | null;
  onClearSelection?: () => void;
  onApplyCrossFilter?: (dimension: string, value: string) => void;
  activeFilterDimension?: string;
  onExportCSV?: () => void;
  tableData?: { headers: string[]; rows: (string | number)[][] };
  actionsSlot?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  height?: number;
  footerText?: string;
}

export const EnhancedChartContainer: React.FC<EnhancedChartContainerProps> = ({
  title,
  subtitle,
  drillDownInfo,
  selectedPoint,
  onClearSelection,
  onApplyCrossFilter,
  activeFilterDimension,
  onExportCSV,
  tableData,
  actionsSlot,
  children,
  className = '',
  height = 290,
  footerText
}) => {
  const [showTable, setShowTable] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  const containerClasses = isFullscreen
    ? 'fixed inset-4 z-50 flex flex-col rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl overflow-y-auto'
    : `flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all dark:border-slate-800/80 dark:bg-slate-900/80 ${className}`;

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {drillDownInfo?.canGoBack && (
            <button
              onClick={drillDownInfo.onBack}
              className="mb-1.5 inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900 transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back to Previous Level</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              {title}
            </h3>
            {drillDownInfo?.currentLevelLabel && (
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                {drillDownInfo.currentLevelLabel}
              </span>
            )}
          </div>

          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          {actionsSlot}

          {/* Table Data View Toggle */}
          {tableData && (
            <button
              onClick={() => setShowTable(!showTable)}
              className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors shadow-2xs ${
                showTable
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
              title={showTable ? 'Switch to Chart View' : 'Inspect Aggregated Table Data'}
            >
              {showTable ? <BarChart3 className="h-3.5 w-3.5" /> : <TableIcon className="h-3.5 w-3.5" />}
              <span>{showTable ? 'Chart' : 'Data'}</span>
            </button>
          )}

          {/* Export CSV */}
          {onExportCSV && (
            <button
              onClick={onExportCSV}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors shadow-2xs"
              title="Export visualization data as CSV"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-1 text-xs text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors shadow-2xs"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand to Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Selected Data Point Detail Banner (Requirement 12 & 14) */}
      {selectedPoint && (
        <div className="mb-3 flex flex-wrap items-center justify-between rounded-lg border border-indigo-200 bg-indigo-50/80 px-3 py-2 text-xs dark:border-indigo-900/60 dark:bg-indigo-950/40">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-400">
                Selected Item
              </span>
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                {selectedPoint.label}
              </div>
            </div>
            <div className="h-6 w-px bg-indigo-200 dark:bg-indigo-900 hidden sm:block" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                Value
              </span>
              <div className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {selectedPoint.value.toLocaleString()}
              </div>
            </div>
            {selectedPoint.percentageShare !== undefined && (
              <>
                <div className="h-6 w-px bg-indigo-200 dark:bg-indigo-900 hidden sm:block" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                    Share
                  </span>
                  <div className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {selectedPoint.percentageShare}%
                  </div>
                </div>
              </>
            )}
            {selectedPoint.recordCount !== undefined && (
              <>
                <div className="h-6 w-px bg-indigo-200 dark:bg-indigo-900 hidden sm:block" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                    Records
                  </span>
                  <div className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {selectedPoint.recordCount.toLocaleString()}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            {onApplyCrossFilter && activeFilterDimension && (
              <button
                onClick={() => onApplyCrossFilter(activeFilterDimension, selectedPoint.label)}
                className="inline-flex items-center gap-1 rounded bg-indigo-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-indigo-700 transition-colors shadow-2xs"
              >
                <Filter className="h-3 w-3" />
                <span>Apply as Global Filter</span>
              </button>
            )}
            {onClearSelection && (
              <button
                onClick={onClearSelection}
                className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Clear Selection"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Canvas / Table View */}
      <div 
        className="relative w-full flex-1"
        style={{ minHeight: `${height}px` }}
      >
        {showTable && tableData ? (
          <div className="h-full overflow-auto max-h-[380px] rounded-lg border border-slate-100 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-100 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <tr>
                  {tableData.headers.map((h, i) => (
                    <th key={i} className="px-3 py-2">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono tabular-nums">
                {tableData.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3 py-1.5 text-slate-700 dark:text-slate-300">
                        {typeof cell === 'number' ? cell.toLocaleString() : String(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          children
        )}
      </div>

      {/* Optional Metadata Footer */}
      {footerText && (
        <div className="mt-3 border-t border-slate-100 pt-2.5 text-xs text-slate-400 dark:border-slate-800/60 dark:text-slate-500">
          {footerText}
        </div>
      )}
    </div>
  );
};
