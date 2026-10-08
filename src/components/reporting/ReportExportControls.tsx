import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  FileSpreadsheet, 
  FileCode, 
  Save, 
  FolderOpen, 
  Check, 
  ChevronDown,
  Sparkles,
  Layers,
  FileText
} from 'lucide-react';
import { exportToCSV, exportToJSON } from '../../utils/reporting/exportUtils';
import { ReportConfig } from '../../types/reporting';
import { useToast } from '../../context/ToastContext';

interface ReportExportControlsProps {
  config: ReportConfig;
  filteredRows: Record<string, any>[];
  cleanedRows: Record<string, any>[];
  kpiData: Record<string, any>[];
  regionalData: Record<string, any>[];
  categoryData: Record<string, any>[];
  productData: Record<string, any>[];
  anomalyData: Record<string, any>[];
  factRows?: Record<string, any>[];
  onSaveConfig: () => void;
  onOpenSavedModal: () => void;
  className?: string;
}

export const ReportExportControls: React.FC<ReportExportControlsProps> = ({
  config,
  filteredRows,
  cleanedRows,
  kpiData,
  regionalData,
  categoryData,
  productData,
  anomalyData,
  factRows,
  onSaveConfig,
  onOpenSavedModal,
  className = ''
}) => {
  const [showCSVMenu, setShowCSVMenu] = useState(false);
  const [showJSONMenu, setShowJSONMenu] = useState(false);
  const { success } = useToast();

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = (type: string) => {
    setShowCSVMenu(false);
    switch (type) {
      case 'filtered':
        exportToCSV(filteredRows, `${config.name}_filtered_dataset`);
        success('Export Ready', `Exported filtered dataset (${filteredRows.length.toLocaleString()} rows) to CSV`);
        break;
      case 'cleaned':
        exportToCSV(cleanedRows.length > 0 ? cleanedRows : filteredRows, `${config.name}_cleaned_dataset`);
        success('Export Ready', 'Exported cleaned dataset to CSV');
        break;
      case 'kpis':
        exportToCSV(kpiData, `${config.name}_kpis_summary`);
        success('Export Ready', 'Exported KPI summary metrics to CSV');
        break;
      case 'regional':
        exportToCSV(regionalData, `${config.name}_regional_analysis`);
        success('Export Ready', 'Exported regional breakdown to CSV');
        break;
      case 'category':
        exportToCSV(categoryData, `${config.name}_category_analysis`);
        success('Export Ready', 'Exported category breakdown to CSV');
        break;
      case 'products':
        exportToCSV(productData, `${config.name}_product_rankings`);
        success('Export Ready', 'Exported product rankings to CSV');
        break;
      case 'anomalies':
        exportToCSV(anomalyData, `${config.name}_anomalies`);
        success('Export Ready', 'Exported anomaly detections to CSV');
        break;
      case 'fact':
        if (factRows && factRows.length > 0) {
          exportToCSV(factRows, `${config.name}_fact_sales`);
          success('Export Ready', 'Exported Star Schema Fact Table to CSV');
        }
        break;
    }
  };

  const handleExportJSON = (type: string) => {
    setShowJSONMenu(false);
    switch (type) {
      case 'report_config':
        exportToJSON(config, `${config.name}_config`);
        success('Export Ready', 'Exported Report Configuration JSON');
        break;
      case 'filtered_dataset':
        exportToJSON(filteredRows, `${config.name}_filtered_dataset`);
        success('Export Ready', 'Exported Filtered Dataset JSON');
        break;
      case 'analytics_payload':
        exportToJSON({
          config,
          kpis: kpiData,
          regional: regionalData,
          categories: categoryData,
          products: productData,
          anomalies: anomalyData
        }, `${config.name}_analytics_bundle`);
        success('Export Ready', 'Exported Complete Analytics Payload JSON');
        break;
    }
  };

  return (
    <div className={`relative flex flex-wrap items-center gap-2 print:hidden ${className}`}>
      {/* Saved Reports Library Button */}
      <button
        onClick={onOpenSavedModal}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-2xs transition-colors cursor-pointer"
      >
        <FolderOpen className="h-3.5 w-3.5 text-indigo-500" />
        <span>Saved Reports</span>
      </button>

      {/* CSV Export Dropdown */}
      <div className="relative">
        <button
          onClick={() => { setShowCSVMenu(!showCSVMenu); setShowJSONMenu(false); }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-2xs transition-colors cursor-pointer"
        >
          <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Export CSV</span>
          <ChevronDown className="h-3 w-3 text-slate-400" />
        </button>

        {showCSVMenu && (
          <div className="absolute right-0 mt-1 w-60 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50 dark:border-slate-800 dark:bg-slate-900 text-xs">
            <button
              onClick={() => handleExportCSV('filtered')}
              className="w-full text-left rounded-lg px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
            >
              Filtered Dataset ({filteredRows.length.toLocaleString()} rows)
            </button>
            <button
              onClick={() => handleExportCSV('kpis')}
              className="w-full text-left rounded-lg px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
            >
              Executive KPI Summary
            </button>
            <button
              onClick={() => handleExportCSV('regional')}
              className="w-full text-left rounded-lg px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
            >
              Regional Performance Table
            </button>
            <button
              onClick={() => handleExportCSV('category')}
              className="w-full text-left rounded-lg px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
            >
              Category Analysis Table
            </button>
            <button
              onClick={() => handleExportCSV('products')}
              className="w-full text-left rounded-lg px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
            >
              Product Rankings (Top-N)
            </button>
            <button
              onClick={() => handleExportCSV('anomalies')}
              className="w-full text-left rounded-lg px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
            >
              Detected Statistical Anomalies
            </button>
            {factRows && factRows.length > 0 && (
              <button
                onClick={() => handleExportCSV('fact')}
                className="w-full text-left rounded-lg px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-medium cursor-pointer"
              >
                Warehouse Fact Table CSV
              </button>
            )}
          </div>
        )}
      </div>

      {/* JSON Export Dropdown */}
      <div className="relative">
        <button
          onClick={() => { setShowJSONMenu(!showJSONMenu); setShowCSVMenu(false); }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-2xs transition-colors cursor-pointer"
        >
          <FileCode className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
          <span>Export JSON</span>
          <ChevronDown className="h-3 w-3 text-slate-400" />
        </button>

        {showJSONMenu && (
          <div className="absolute right-0 mt-1 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50 dark:border-slate-800 dark:bg-slate-900 text-xs">
            <button
              onClick={() => handleExportJSON('analytics_payload')}
              className="w-full text-left rounded-lg px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
            >
              Complete Analytics Bundle JSON
            </button>
            <button
              onClick={() => handleExportJSON('report_config')}
              className="w-full text-left rounded-lg px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
            >
              Report Specification JSON
            </button>
            <button
              onClick={() => handleExportJSON('filtered_dataset')}
              className="w-full text-left rounded-lg px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
            >
              Filtered Dataset JSON
            </button>
          </div>
        )}
      </div>

      {/* Print / Save as PDF Button */}
      <button
        onClick={handlePrint}
        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition-colors cursor-pointer"
      >
        <Printer className="h-3.5 w-3.5" />
        <span>Print / Save PDF</span>
      </button>
    </div>
  );
};
