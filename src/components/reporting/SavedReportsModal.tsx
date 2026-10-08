import React, { useState, useEffect, useMemo } from 'react';
import { X, FileText, Trash2, Copy, Check, Clock, FolderOpen, RotateCcw, Search, ExternalLink } from 'lucide-react';
import { ReportConfig, SavedReportItem } from '../../types/reporting';
import { 
  loadSavedReportConfigs, 
  deleteReportConfigFromStorage, 
  saveReportConfigToStorage,
  loadReportHistoryFromStorage,
  deleteReportHistoryItem
} from '../../utils/reporting/exportUtils';
import { useToast } from '../../context/ToastContext';

interface SavedReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadConfig: (config: ReportConfig) => void;
  className?: string;
}

export const SavedReportsModal: React.FC<SavedReportsModalProps> = ({
  isOpen,
  onClose,
  onLoadConfig,
  className = ''
}) => {
  const [configs, setConfigs] = useState<ReportConfig[]>([]);
  const [history, setHistory] = useState<SavedReportItem[]>([]);
  const [activeTab, setActiveTab] = useState<'configs' | 'history'>('configs');
  const [searchTerm, setSearchTerm] = useState('');
  const { success, info } = useToast();

  const refreshList = () => {
    setConfigs(loadSavedReportConfigs());
    setHistory(loadReportHistoryFromStorage());
  };

  useEffect(() => {
    if (isOpen) {
      refreshList();
    }
  }, [isOpen]);

  // Filter lists
  const filteredConfigs = useMemo(() => {
    if (!searchTerm.trim()) return configs;
    const term = searchTerm.toLowerCase();
    return configs.filter(c => 
      c.name.toLowerCase().includes(term) || 
      c.title.toLowerCase().includes(term) || 
      c.template.toLowerCase().includes(term)
    );
  }, [configs, searchTerm]);

  const filteredHistory = useMemo(() => {
    if (!searchTerm.trim()) return history;
    const term = searchTerm.toLowerCase();
    return history.filter(h => 
      h.config.title.toLowerCase().includes(term) || 
      h.datasetName.toLowerCase().includes(term) ||
      h.config.template.toLowerCase().includes(term)
    );
  }, [history, searchTerm]);

  if (!isOpen) return null;

  const handleDeleteConfig = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteReportConfigFromStorage(id);
    refreshList();
    info('Deleted', 'Report specification removed from local storage');
  };

  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteReportHistoryItem(id);
    refreshList();
    info('Deleted', 'Report history entry removed');
  };

  const handleDuplicate = (config: ReportConfig, e: React.MouseEvent) => {
    e.stopPropagation();
    const duplicated: ReportConfig = {
      ...config,
      id: `rep-config-${Date.now()}`,
      name: `${config.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveReportConfigToStorage(duplicated);
    refreshList();
    success('Duplicated', `Created duplicate "${duplicated.name}"`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Saved Report Specifications & Generation History
            </h3>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab & Search Bar */}
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('configs')}
              className={`rounded-md px-3 py-1 font-semibold transition-colors cursor-pointer ${
                activeTab === 'configs'
                  ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Saved Templates ({configs.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`rounded-md px-3 py-1 font-semibold transition-colors cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Generation History ({history.length})
            </button>
          </div>

          <div className="relative flex items-center">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reports..."
              className="rounded-lg border border-slate-200 bg-slate-50 pl-8.5 pr-8 py-1 text-xs text-slate-900 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 w-48 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-4 w-4 items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title="Clear Search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* List Content */}
        <div className="mt-3 max-h-80 overflow-y-auto space-y-2 pr-1">
          {activeTab === 'configs' && (
            filteredConfigs.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <FileText className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-700 mb-2" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  {searchTerm ? `No templates matching "${searchTerm}"` : 'No saved report templates yet'}
                </p>
                <p className="text-[11px] mt-1 text-slate-500">
                  Customize your report specifications and click "Save Configuration" in the action toolbar.
                </p>
              </div>
            ) : (
              filteredConfigs.map((cfg) => (
                <div
                  key={cfg.id}
                  onClick={() => { 
                    onLoadConfig(cfg); 
                    onClose(); 
                    success('Loaded Template', `Applied "${cfg.name}" specifications`);
                  }}
                  className="flex items-center justify-between rounded-xl border border-slate-200/90 bg-slate-50/60 p-3 hover:border-indigo-500 hover:bg-indigo-50/40 cursor-pointer dark:border-slate-800 dark:bg-slate-850/50 transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100">{cfg.name}</h4>
                      <span className="rounded bg-indigo-100 px-1.5 py-0.2 font-mono text-[9px] font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 uppercase">
                        {cfg.template}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">{cfg.title} · Top {cfg.topN} Rankings</p>
                    <span className="font-mono text-[10px] text-slate-400">Modified: {new Date(cfg.updatedAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleDuplicate(cfg, e)}
                      title="Duplicate Configuration"
                      className="rounded p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteConfig(cfg.id, e)}
                      title="Delete"
                      className="rounded p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )
          )}

          {activeTab === 'history' && (
            filteredHistory.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Clock className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-700 mb-2" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  {searchTerm ? `No history matching "${searchTerm}"` : 'No report generation history yet'}
                </p>
                <p className="text-[11px] mt-1 text-slate-500">
                  Reports generated and exported during your analytical sessions will be archived here.
                </p>
              </div>
            ) : (
              filteredHistory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => { 
                    onLoadConfig(item.config); 
                    onClose(); 
                    success('Loaded Report', `Loaded historic spec from ${item.timestamp}`);
                  }}
                  className="flex items-center justify-between rounded-xl border border-slate-200/90 bg-slate-50/60 p-3 hover:border-indigo-500 hover:bg-indigo-50/40 cursor-pointer dark:border-slate-800 dark:bg-slate-850/50 transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100">{item.config.title}</h4>
                      <span className="font-mono text-[9px] text-slate-400">{item.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                      Dataset: {item.datasetName} · {item.recordCount.toLocaleString()} rows · Filter: {item.filterSummary}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleDeleteHistory(item.id, e)}
                      title="Delete History Entry"
                      className="rounded p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 flex justify-end border-t border-slate-100 pt-3 dark:border-slate-800">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-4 py-1.5 font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
