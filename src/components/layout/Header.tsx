import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  RotateCw, 
  Sun, 
  Moon, 
  Monitor,
  Search, 
  Command, 
  Database,
  Check,
  X,
  SlidersHorizontal,
  Clock
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { TimeRange } from '../../types/dashboard';
import { Breadcrumbs } from './Breadcrumbs';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  onOpenCommandPalette: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  onOpenCommandPalette,
}) => {
  const { 
    datasets, 
    currentDataset, 
    setCurrentDatasetId, 
    timeRange, 
    setTimeRange, 
    isRefreshing, 
    refreshData,
    searchQuery,
    setSearchQuery,
    theme,
    effectiveTheme,
    setTheme,
    toggleTheme
  } = useData();

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setThemeMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setThemeMenuOpen(false);
      }
    };
    if (themeMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [themeMenuOpen]);

  const timeRanges: { id: TimeRange; label: string }[] = [
    { id: '7d', label: '7D' },
    { id: '30d', label: '30D' },
    { id: '90d', label: '90D' },
    { id: 'ytd', label: 'YTD' },
    { id: 'all', label: 'ALL' }
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-3 sm:px-6 backdrop-blur-md transition-colors dark:border-slate-800/80 dark:bg-slate-950/95 min-w-0 gap-2 sm:gap-4">
      {/* Zone 1: Mobile menu toggle + Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-0 max-w-[40%] sm:max-w-none">
        <button
          onClick={onToggleMobileMenu}
          className="flex h-9 w-9 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 lg:hidden dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-850 transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5 sm:h-4 sm:w-4" />
        </button>

        <div className="min-w-0 truncate">
          <Breadcrumbs />
        </div>
      </div>

      {/* Mobile Search Overlay when opened */}
      {mobileSearchOpen && (
        <div className="absolute inset-0 z-40 flex items-center bg-white px-3 sm:px-4 dark:bg-slate-950 md:hidden animate-in fade-in duration-100">
          <div className="relative flex-1 flex items-center min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none shrink-0" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search records, reps, or products..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-14 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer px-1 py-0.5"
              >
                Clear
              </button>
            )}
          </div>
          <button
            onClick={() => setMobileSearchOpen(false)}
            className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer"
            aria-label="Close search"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Zone 2: Middle controls (Desktop Search + Active Dataset Selector) */}
      <div className="hidden md:flex items-center gap-2.5 flex-1 max-w-md mx-2 lg:mx-6 min-w-0">
        {/* Quick Search */}
        <div className="relative flex-1 min-w-0 flex items-center">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search records, reps, or products..."
            className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50/70 pl-9 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:bg-slate-900 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-4 w-4 items-center justify-center text-[10px] font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              title="Clear Search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Dataset Selector Dropdown */}
        <div className="relative shrink-0 flex items-center">
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
            <Database className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            <select
              value={currentDataset.id}
              onChange={(e) => setCurrentDatasetId(e.target.value)}
              className="bg-transparent font-medium focus:outline-hidden cursor-pointer max-w-[130px] truncate text-xs"
              title="Switch Active Dataset"
            >
              {datasets.map(d => (
                <option key={d.id} value={d.id} className="dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Zone 3: Actions (Mobile Search trigger, Time range, Refresh, Theme, Palette) */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Mobile Search Icon Trigger */}
        <button
          onClick={() => setMobileSearchOpen(true)}
          className="flex h-9 w-9 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 md:hidden dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-850 cursor-pointer shrink-0"
          aria-label="Open search input"
        >
          <Search className="h-4 w-4 shrink-0" />
        </button>

        {/* Mobile Dataset Selector Dropdown */}
        <div className="md:hidden relative shrink-0">
          <select
            value={currentDataset.id}
            onChange={(e) => setCurrentDatasetId(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 max-w-[100px] truncate cursor-pointer"
            title="Switch Active Dataset"
          >
            {datasets.map(d => (
              <option key={d.id} value={d.id} className="dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Command Palette Trigger Button (Desktop/Tablet) */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-850 transition-colors shadow-2xs cursor-pointer min-h-[32px] shrink-0"
          title="Open Command Palette (⌘K)"
        >
          <Command className="h-3 w-3 text-slate-400 shrink-0" />
          <span className="text-[11px] hidden lg:inline">Command</span>
          <kbd className="rounded bg-slate-200/80 px-1 py-0.2 font-mono text-[9px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            ⌘K
          </kbd>
        </button>

        {/* Time Range Selector (Hidden on mobile phones, visible sm+) */}
        <div className="hidden lg:flex items-center rounded-lg border border-slate-200 bg-slate-100/80 p-0.5 dark:border-slate-800 dark:bg-slate-900 shrink-0">
          {timeRanges.map((tr) => (
            <button
              key={tr.id}
              onClick={() => setTimeRange(tr.id)}
              className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                timeRange === tr.id
                  ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-slate-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {tr.label}
            </button>
          ))}
        </div>

        {/* Refresh Button */}
        <button
          onClick={refreshData}
          disabled={isRefreshing}
          className="flex h-9 w-9 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 focus-visible:outline-hidden dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-850 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0"
          title="Synchronize Data Pipelines"
          aria-label="Refresh Data Streams"
        >
          <RotateCw className={`h-4 w-4 sm:h-3.5 sm:w-3.5 ${isRefreshing ? 'animate-spin text-indigo-500' : ''}`} />
        </button>

        {/* Theme Selector Dropdown */}
        <div className="relative shrink-0" ref={themeMenuRef}>
          <button
            onClick={() => setThemeMenuOpen(prev => !prev)}
            className="flex h-9 w-9 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 focus-visible:outline-hidden dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-850 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0"
            title={`Current theme: ${theme} (${effectiveTheme}). Click to switch Light, Dark, or System mode`}
            aria-label="Select Color Theme"
            aria-expanded={themeMenuOpen}
            aria-haspopup="true"
          >
            {theme === 'dark' ? (
              <Moon className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-indigo-500 dark:text-indigo-400" />
            ) : theme === 'light' ? (
              <Sun className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-amber-500" />
            ) : (
              <Monitor className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-sky-500" />
            )}
          </button>

          {themeMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Appearance
              </div>
              
              <button
                type="button"
                onClick={() => { setTheme('light'); setThemeMenuOpen(false); }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                  theme === 'light'
                    ? 'bg-amber-50 text-amber-900 font-semibold dark:bg-amber-950/40 dark:text-amber-300'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-amber-500" />
                  <span>Light Mode</span>
                </div>
                {theme === 'light' && <Check className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />}
              </button>

              <button
                type="button"
                onClick={() => { setTheme('dark'); setThemeMenuOpen(false); }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-indigo-50 text-indigo-900 font-semibold dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                  <span>Dark Mode</span>
                </div>
                {theme === 'dark' && <Check className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />}
              </button>

              <button
                type="button"
                onClick={() => { setTheme('system'); setThemeMenuOpen(false); }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                  theme === 'system'
                    ? 'bg-sky-50 text-sky-900 font-semibold dark:bg-sky-950/40 dark:text-sky-300'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-sky-500" />
                  <div className="flex flex-col text-left">
                    <span>System Mode</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                      Auto ({effectiveTheme})
                    </span>
                  </div>
                </div>
                {theme === 'system' && <Check className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />}
              </button>
            </div>
          )}
        </div>
        {/* User Identity Avatar */}
        <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800 shrink-0">
          <div
            className="flex h-8 w-8 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-indigo-600 font-mono text-xs font-semibold text-white shadow-2xs select-none"
            title="Jordan Drake · Head of BI & Analytics"
          >
            JD
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none">
              Jordan Drake
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-none mt-0.5">
              Head of Analytics
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
