import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  LayoutDashboard, 
  UploadCloud, 
  Table2, 
  LineChart, 
  Sparkles, 
  Database, 
  FileText, 
  Settings, 
  RotateCcw, 
  Sun, 
  Moon, 
  Monitor,
  X,
  ChevronRight,
  Command,
  PlusCircle
} from 'lucide-react';
import { useData } from '../../context/DataContext';

interface CommandItem {
  id: string;
  category: 'Navigation' | 'Actions' | 'View';
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  shortcut?: string;
  perform: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { 
    clearFilters, 
    activeFilterCount, 
    loadSampleDataset, 
    toggleTheme, 
    theme, 
    effectiveTheme,
    setTheme,
    refreshData 
  } = useData();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Define commands linking directly to real application functionality
  const commands: CommandItem[] = useMemo(() => [
    // Navigation
    {
      id: 'nav-upload',
      category: 'Navigation',
      title: 'Data Upload & Ingestion',
      subtitle: 'Upload custom CSV files and inspect schema headers',
      icon: <UploadCloud className="h-4 w-4 text-indigo-500" />,
      shortcut: 'G U',
      perform: () => { navigate('/upload'); onClose(); }
    },
    {
      id: 'nav-explorer',
      category: 'Navigation',
      title: 'Data Explorer',
      subtitle: 'High-density multi-column spreadsheet view and search',
      icon: <Table2 className="h-4 w-4 text-indigo-500" />,
      shortcut: 'G E',
      perform: () => { navigate('/explorer'); onClose(); }
    },
    {
      id: 'nav-cleaning',
      category: 'Navigation',
      title: 'Data Cleaning & ETL Pipeline',
      subtitle: 'Audit missing values, duplicates, outliers and transforms',
      icon: <Sparkles className="h-4 w-4 text-indigo-500" />,
      shortcut: 'G C',
      perform: () => { navigate('/cleaning'); onClose(); }
    },
    {
      id: 'nav-dashboard',
      category: 'Navigation',
      title: 'Executive Dashboard',
      subtitle: 'Overview KPIs, sales trajectory & regional performance',
      icon: <LayoutDashboard className="h-4 w-4 text-indigo-500" />,
      shortcut: 'G D',
      perform: () => { navigate('/'); onClose(); }
    },
    {
      id: 'nav-analytics',
      category: 'Navigation',
      title: 'Visual Analytics',
      subtitle: 'Interactive multi-dimensional charts, trends and pivots',
      icon: <LineChart className="h-4 w-4 text-indigo-500" />,
      shortcut: 'G A',
      perform: () => { navigate('/analytics'); onClose(); }
    },
    {
      id: 'nav-insights',
      category: 'Navigation',
      title: 'AI Business Intelligence',
      subtitle: 'Gemini narrative summaries, key findings & natural language QA',
      icon: <Sparkles className="h-4 w-4 text-indigo-500" />,
      shortcut: 'G I',
      perform: () => { navigate('/insights'); onClose(); }
    },
    {
      id: 'nav-warehouse',
      category: 'Navigation',
      title: 'Data Warehouse & Star Schema',
      subtitle: 'Fact tables, dimension schemas, surrogate keys & OLAP slices',
      icon: <Database className="h-4 w-4 text-indigo-500" />,
      shortcut: 'G W',
      perform: () => { navigate('/warehouse'); onClose(); }
    },
    {
      id: 'nav-reports',
      category: 'Navigation',
      title: 'Automated Reports & Export',
      subtitle: 'Executive dossiers, quality audits, JSON & CSV exports',
      icon: <FileText className="h-4 w-4 text-indigo-500" />,
      shortcut: 'G R',
      perform: () => { navigate('/reports'); onClose(); }
    },
    {
      id: 'nav-settings',
      category: 'Navigation',
      title: 'Settings',
      subtitle: 'System parameters, Gemini status & variance alert thresholds',
      icon: <Settings className="h-4 w-4 text-indigo-500" />,
      shortcut: 'G S',
      perform: () => { navigate('/settings'); onClose(); }
    },
    // Real Actions
    {
      id: 'act-sample-data',
      category: 'Actions',
      title: 'Load Benchmark Sales Dataset',
      subtitle: 'Restore 10,000 synthetic enterprise sales records',
      icon: <PlusCircle className="h-4 w-4 text-emerald-500" />,
      perform: () => { loadSampleDataset(); onClose(); }
    },
    {
      id: 'act-clear-filters',
      category: 'Actions',
      title: `Clear All Active Filters (${activeFilterCount})`,
      subtitle: 'Reset categorical, numeric, date and search filters',
      icon: <RotateCcw className="h-4 w-4 text-amber-500" />,
      perform: () => { clearFilters(); onClose(); }
    },
    {
      id: 'act-refresh',
      category: 'Actions',
      title: 'Synchronize Data Pipeline',
      subtitle: 'Re-evaluate active metrics and trigger chart re-render',
      icon: <RotateCcw className="h-4 w-4 text-indigo-500" />,
      perform: () => { refreshData(); onClose(); }
    },
    {
      id: 'theme-light',
      category: 'View',
      title: 'Switch to Light Mode',
      subtitle: 'Daylight high-contrast crisp white background',
      icon: <Sun className="h-4 w-4 text-amber-500" />,
      perform: () => { setTheme('light'); onClose(); }
    },
    {
      id: 'theme-dark',
      category: 'View',
      title: 'Switch to Dark Mode',
      subtitle: 'Executive low-glare dark slate background',
      icon: <Moon className="h-4 w-4 text-indigo-400" />,
      perform: () => { setTheme('dark'); onClose(); }
    },
    {
      id: 'theme-system',
      category: 'View',
      title: 'Switch to System Mode',
      subtitle: `Automatically match OS display theme (currently ${effectiveTheme})`,
      icon: <Monitor className="h-4 w-4 text-sky-500" />,
      perform: () => { setTheme('system'); onClose(); }
    }
  ], [navigate, onClose, clearFilters, activeFilterCount, loadSampleDataset, toggleTheme, theme, effectiveTheme, setTheme, refreshData]);

  // Filter commands based on user query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(c => 
      c.title.toLowerCase().includes(q) || 
      (c.subtitle && c.subtitle.toLowerCase().includes(q)) ||
      c.category.toLowerCase().includes(q)
    );
  }, [commands, query]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard navigation inside command palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].perform();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Command Palette Card */}
      <div
        className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all duration-150 dark:border-slate-800 dark:bg-slate-900 overflow-hidden flex flex-col"
        onKeyDown={handleKeyDown}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5 dark:border-slate-800">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, search pages, or trigger actions..."
            className="flex-1 bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden dark:text-slate-100"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <span className="hidden sm:inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            ESC
          </span>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-50 dark:divide-slate-800/40">
          {filteredCommands.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400 dark:text-slate-500">
              No matching commands or pages found.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={cmd.perform}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`
                    flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 cursor-pointer text-xs transition-colors select-none
                    ${isSelected 
                      ? 'bg-indigo-50 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-200' 
                      : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0">{cmd.icon}</div>
                    <div className="flex flex-col min-w-0">
                      <span className={`font-semibold truncate ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-900 dark:text-slate-100'}`}>
                        {cmd.title}
                      </span>
                      {cmd.subtitle && (
                        <span className="text-[11px] text-slate-400 truncate">
                          {cmd.subtitle}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      {cmd.category}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Tips */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-4 py-2 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              Use <strong className="font-mono text-slate-700 dark:text-slate-300">↑</strong> <strong className="font-mono text-slate-700 dark:text-slate-300">↓</strong> to navigate
            </span>
            <span>
              <strong className="font-mono text-slate-700 dark:text-slate-300">↵</strong> to execute
            </span>
          </div>
          <span className="font-mono text-[10px]">
            {filteredCommands.length} commands
          </span>
        </div>
      </div>
    </div>
  );
};
