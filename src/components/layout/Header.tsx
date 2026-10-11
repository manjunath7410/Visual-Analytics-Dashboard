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
  Bell,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck
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
    setTheme
  } = useData();

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click & escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setThemeMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setThemeMenuOpen(false);
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const timeRanges: { id: TimeRange; label: string }[] = [
    { id: '7d', label: '7D' },
    { id: '30d', label: '30D' },
    { id: '90d', label: '90D' },
    { id: 'ytd', label: 'YTD' },
    { id: 'all', label: 'ALL' }
  ];

  // Enterprise telemetry events for notifications panel
  const notificationsList = [
    {
      id: '1',
      title: 'Data Mart Synchronized',
      desc: 'Fact_Sales and dimensional marts refreshed with 1,420 rows.',
      time: '2m ago',
      type: 'success'
    },
    {
      id: '2',
      title: 'Executive KPI Threshold',
      desc: 'Gross Profit Margin exceeded quarterly target at 42.4%.',
      time: '18m ago',
      type: 'info'
    },
    {
      id: '3',
      title: 'Automated Anomaly Scan',
      desc: 'Completed isolation tree scan across revenue distributions. 0 critical alerts.',
      time: '1h ago',
      type: 'audit'
    }
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#263247] bg-[#0B1020]/95 px-3 sm:px-6 backdrop-blur-md transition-colors min-w-0 gap-2 sm:gap-4 text-[#F8FAFC]">
      {/* Zone 1: Mobile menu toggle + Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-0 max-w-[42%] sm:max-w-none">
        <button
          onClick={onToggleMobileMenu}
          className="flex h-9 w-9 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg border border-[#263247] bg-[#151D2F] text-[#94A3B8] hover:bg-[#1B263B] hover:text-[#F8FAFC] lg:hidden transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="min-w-0 truncate">
          <Breadcrumbs />
        </div>
      </div>

      {/* Mobile Search Overlay when opened */}
      {mobileSearchOpen && (
        <div className="absolute inset-0 z-40 flex items-center bg-[#0B1020] px-3 sm:px-4 md:hidden animate-in fade-in duration-100 border-b border-[#263247]">
          <div className="relative flex-1 flex items-center min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B] pointer-events-none shrink-0" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search data, reports, or insights..."
              className="h-10 w-full rounded-lg border border-[#263247] bg-[#151D2F] pl-10 pr-14 text-xs text-[#F8FAFC] placeholder:text-[#64748B] focus:border-indigo-500 focus:outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer px-1 py-0.5"
              >
                Clear
              </button>
            )}
          </div>
          <button
            onClick={() => setMobileSearchOpen(false)}
            className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#151D2F] cursor-pointer"
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
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B] pointer-events-none shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search data, reports, or insights..."
            className="h-8 w-full rounded-lg border border-[#263247] bg-[#151D2F] pl-9 pr-8 text-xs text-[#F8FAFC] placeholder:text-[#64748B] focus:border-indigo-500 focus:bg-[#1B263B] focus:outline-hidden transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-4 w-4 items-center justify-center text-[10px] font-medium text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer"
              title="Clear Search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Dataset Selector Dropdown */}
        <div className="relative shrink-0 flex items-center">
          <div className="flex items-center gap-1.5 rounded-lg border border-[#263247] bg-[#151D2F] px-2.5 py-1 text-xs text-[#F8FAFC]">
            <span className="h-2 w-2 rounded-full bg-[#10B981] shrink-0" />
            <select
              value={currentDataset.id}
              onChange={(e) => setCurrentDatasetId(e.target.value)}
              className="bg-transparent font-medium focus:outline-hidden cursor-pointer max-w-[130px] truncate text-xs text-[#F8FAFC]"
              title="Switch Active Dataset"
            >
              {datasets.map(d => (
                <option key={d.id} value={d.id} className="bg-[#151D2F] text-[#F8FAFC]">
                  {d.name.includes('Enterprise Global') ? 'Enterprise Global' : d.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Zone 3: Actions (Search, Palette, Time range, Refresh, Notifications, Theme, Profile) */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Mobile Search Icon Trigger */}
        <button
          onClick={() => setMobileSearchOpen(true)}
          className="flex h-9 w-9 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-[#263247] bg-[#151D2F] text-[#94A3B8] hover:bg-[#1B263B] md:hidden cursor-pointer shrink-0"
          aria-label="Open search input"
        >
          <Search className="h-4 w-4 shrink-0" />
        </button>

        {/* Mobile Dataset Selector Dropdown */}
        <div className="md:hidden relative shrink-0">
          <select
            value={currentDataset.id}
            onChange={(e) => setCurrentDatasetId(e.target.value)}
            className="h-9 rounded-lg border border-[#263247] bg-[#151D2F] px-2 text-xs font-semibold text-[#F8FAFC] max-w-[100px] truncate cursor-pointer"
            title="Switch Active Dataset"
          >
            {datasets.map(d => (
              <option key={d.id} value={d.id} className="bg-[#151D2F] text-[#F8FAFC]">
                {d.name.includes('Enterprise Global') ? 'Enterprise Global' : d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Command Palette Trigger Button (Desktop/Tablet) */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-[#263247] bg-[#151D2F] px-2.5 py-1 text-xs font-medium text-[#94A3B8] hover:bg-[#1B263B] hover:text-[#F8FAFC] transition-colors shadow-2xs cursor-pointer min-h-[32px] shrink-0"
          title="Open Command Palette (⌘K)"
        >
          <Command className="h-3 w-3 text-[#64748B] shrink-0" />
          <span className="text-[11px] hidden lg:inline">Command</span>
          <kbd className="rounded bg-[#0B1020] border border-[#263247] px-1 py-0.2 font-mono text-[9px] font-semibold text-[#94A3B8]">
            ⌘K
          </kbd>
        </button>

        {/* Time Range Selector */}
        <div className="hidden lg:flex items-center rounded-lg border border-[#263247] bg-[#111827] p-0.5 shrink-0">
          {timeRanges.map((tr) => (
            <button
              key={tr.id}
              onClick={() => setTimeRange(tr.id)}
              className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                timeRange === tr.id
                  ? 'bg-indigo-600 text-[#F8FAFC] shadow-2xs font-semibold'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
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
          className="flex h-9 w-9 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-[#263247] bg-[#151D2F] text-[#94A3B8] hover:bg-[#1B263B] hover:text-[#F8FAFC] transition-colors cursor-pointer shrink-0"
          title="Synchronize Data Pipelines"
          aria-label="Refresh Data Streams"
        >
          <RotateCw className={`h-4 w-4 sm:h-3.5 sm:w-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
        </button>

        {/* Notifications Popover */}
        <div className="relative shrink-0" ref={notificationsRef}>
          <button
            onClick={() => setNotificationsOpen(prev => !prev)}
            className="relative flex h-9 w-9 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-[#263247] bg-[#151D2F] text-[#94A3B8] hover:bg-[#1B263B] hover:text-[#F8FAFC] transition-colors cursor-pointer shrink-0"
            title="Enterprise Notifications"
            aria-label="Open Notifications"
            aria-expanded={notificationsOpen}
          >
            <Bell className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#06B6D4]" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-80 rounded-xl border border-[#263247] bg-[#151D2F] p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-[#F8FAFC]">
              <div className="flex items-center justify-between pb-2 border-b border-[#263247]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F8FAFC]">
                  <Bell className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Pipeline Notifications</span>
                </div>
                <span className="text-[10px] font-mono text-[#06B6D4] bg-[#06B6D4]/10 px-1.5 py-0.5 rounded">
                  Live Feed
                </span>
              </div>

              <div className="mt-2 space-y-2">
                {notificationsList.map(item => (
                  <div key={item.id} className="rounded-lg p-2 bg-[#0B1020]/60 border border-[#263247]/80 hover:border-slate-600 transition-colors">
                    <div className="flex items-center justify-between text-xs font-medium text-[#F8FAFC]">
                      <span className="flex items-center gap-1.5">
                        {item.type === 'success' && <CheckCircle2 className="h-3 w-3 text-[#10B981]" />}
                        {item.type === 'info' && <Info className="h-3 w-3 text-[#06B6D4]" />}
                        {item.type === 'audit' && <ShieldCheck className="h-3 w-3 text-indigo-400" />}
                        {item.title}
                      </span>
                      <span className="text-[10px] text-[#64748B]">{item.time}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-[#94A3B8] leading-tight">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-2.5 pt-2 border-t border-[#263247] flex justify-between items-center text-[11px]">
                <span className="text-[#64748B]">All pipelines operational</span>
                <button 
                  onClick={() => setNotificationsOpen(false)}
                  className="text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Mark read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Selector Dropdown */}
        <div className="relative shrink-0" ref={themeMenuRef}>
          <button
            onClick={() => setThemeMenuOpen(prev => !prev)}
            className="flex h-9 w-9 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-[#263247] bg-[#151D2F] text-[#94A3B8] hover:bg-[#1B263B] hover:text-[#F8FAFC] transition-colors cursor-pointer shrink-0"
            title={`Current theme: ${theme} (${effectiveTheme})`}
            aria-label="Select Color Theme"
            aria-expanded={themeMenuOpen}
          >
            {theme === 'dark' ? (
              <Moon className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-indigo-400" />
            ) : theme === 'light' ? (
              <Sun className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-amber-500" />
            ) : (
              <Monitor className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-[#06B6D4]" />
            )}
          </button>

          {themeMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl border border-[#263247] bg-[#151D2F] p-1.5 shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                Appearance
              </div>
              
              <button
                type="button"
                onClick={() => { setTheme('dark'); setThemeMenuOpen(false); }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                    : 'text-[#94A3B8] hover:bg-[#1B263B] hover:text-[#F8FAFC]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-indigo-400" />
                  <span>Dark Mode</span>
                </div>
                {theme === 'dark' && <Check className="h-3.5 w-3.5 text-indigo-400" />}
              </button>

              <button
                type="button"
                onClick={() => { setTheme('light'); setThemeMenuOpen(false); }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                  theme === 'light'
                    ? 'bg-amber-500/20 text-amber-300 font-semibold'
                    : 'text-[#94A3B8] hover:bg-[#1B263B] hover:text-[#F8FAFC]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-amber-400" />
                  <span>Light Mode</span>
                </div>
                {theme === 'light' && <Check className="h-3.5 w-3.5 text-amber-400" />}
              </button>

              <button
                type="button"
                onClick={() => { setTheme('system'); setThemeMenuOpen(false); }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                  theme === 'system'
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                    : 'text-[#94A3B8] hover:bg-[#1B263B] hover:text-[#F8FAFC]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-[#06B6D4]" />
                  <span>System Mode</span>
                </div>
                {theme === 'system' && <Check className="h-3.5 w-3.5 text-[#06B6D4]" />}
              </button>
            </div>
          )}
        </div>

        {/* User Identity Avatar & Organization Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#263247] shrink-0">
          <div className="relative">
            <div
              className="flex h-8 w-8 sm:h-7.5 sm:w-7.5 items-center justify-center rounded-lg bg-indigo-600 font-mono text-xs font-semibold text-white shadow-2xs select-none border border-indigo-400/40"
              title="Jordan Drake · Head of BI & Analytics"
            >
              JD
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#10B981] ring-2 ring-[#0B1020]" />
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-semibold text-[#F8FAFC] leading-none">
              Jordan Drake
            </span>
            <span className="text-[10px] font-medium text-[#06B6D4] leading-none mt-0.5">
              Enterprise Analytics
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
