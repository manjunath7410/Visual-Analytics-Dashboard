import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UploadCloud, 
  Table2, 
  LineChart, 
  Sparkles, 
  Database, 
  FileText, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  X,
  Activity,
  Layers
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Tooltip } from '../ui/Tooltip';

interface NavItem {
  name: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile
}) => {
  const { dataset, currentDataset, filteredRows } = useData();
  const activeDatasetName = dataset ? dataset.name : currentDataset.name;
  const activeSource = dataset ? (dataset.isSample ? 'Benchmark Data' : 'Custom CSV') : currentDataset.source;

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) {
        onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, onCloseMobile]);

  // Grouped Navigation structure
  const navigationGroups: NavGroup[] = [
    {
      groupName: 'WORKSPACE',
      items: [
        { name: 'Data Upload', to: '/upload', icon: UploadCloud },
        { name: 'Data Explorer', to: '/explorer', icon: Table2 },
        { name: 'Data Cleaning', to: '/cleaning', icon: Sparkles },
        { name: 'Dashboard', to: '/', icon: LayoutDashboard },
      ]
    },
    {
      groupName: 'ANALYTICS',
      items: [
        { name: 'Visual Analytics', to: '/analytics', icon: LineChart },
        { name: 'AI Business Insights', to: '/insights', icon: Sparkles },
        { name: 'SQL Analytics', to: '/sql', icon: Database },
      ]
    },
    {
      groupName: 'DATA PLATFORM',
      items: [
        { name: 'Data Warehouse', to: '/warehouse', icon: Database },
      ]
    },
    {
      groupName: 'REPORTING',
      items: [
        { name: 'Reports & Export', to: '/reports', icon: FileText },
      ]
    },
    {
      groupName: 'SYSTEM',
      items: [
        { name: 'Settings', to: '/settings', icon: Settings },
      ]
    }
  ];

  const renderNavGroup = (group: NavGroup) => (
    <div key={group.groupName} className="mb-4">
      {!collapsed && (
        <div className="px-3 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none">
          {group.groupName}
        </div>
      )}
      <div className="space-y-0.5">
        {group.items.map((item) => {
          const Icon = item.icon;

          const navLink = (
            <NavLink
              key={item.name}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) => `
                group relative flex items-center gap-3 rounded-lg px-3 py-2.5 sm:py-2 min-h-[44px] sm:min-h-[36px] text-xs font-medium transition-all duration-150 select-none
                ${isActive
                  ? 'bg-indigo-50/90 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-850 dark:hover:text-slate-200'
                }
                ${collapsed ? 'justify-center px-2' : ''}
              `}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-transform duration-150 ${
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400 stroke-[2.2]'
                        : 'text-slate-400 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300'
                    }`}
                  />
                  {!collapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                  {isActive && (
                    <div
                      aria-hidden="true"
                      className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-indigo-600 dark:bg-indigo-400"
                    />
                  )}
                </>
              )}
            </NavLink>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.name} content={item.name} position="right">
                {navLink}
              </Tooltip>
            );
          }

          return navLink;
        })}
      </div>
    </div>
  );

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between overflow-hidden">
      {/* Top Identity Header */}
      <div>
        <div className="flex h-16 items-center justify-between border-b border-slate-200/80 px-4 dark:border-slate-800/80">
          <NavLink 
            to="/" 
            className="flex items-center gap-2.5 overflow-hidden text-slate-900 dark:text-slate-50 transition-transform active:scale-95"
            onClick={onCloseMobile}
            title="Acuity BI Workspace"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-2xs">
              <Activity className="h-4 w-4" />
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                  Acuity BI
                </span>
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 leading-tight">
                  Enterprise Analytics
                </span>
              </div>
            )}
          </NavLink>

          {/* Desktop collapse button */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label="Toggle Sidebar Navigation"
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="flex lg:hidden h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close mobile menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Navigation Groups */}
        <nav
          aria-label="Primary Navigation"
          className="overflow-y-auto max-h-[calc(100vh-140px)] p-3"
        >
          {navigationGroups.map(renderNavGroup)}
        </nav>
      </div>

      {/* Sidebar Footer Metadata */}
      <div className="border-t border-slate-200/80 p-3 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/40">
        {!collapsed ? (
          <div className="rounded-lg bg-white p-2.5 shadow-2xs border border-slate-200/60 dark:bg-slate-900/60 dark:border-slate-800/60">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
              <span className="truncate">{activeDatasetName}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
              <span className="font-mono tabular-nums">{filteredRows.length.toLocaleString()} rows</span>
              <span className="font-mono">v1.2.0</span>
            </div>
          </div>
        ) : (
          <Tooltip content={`${activeDatasetName} (${filteredRows.length.toLocaleString()} rows)`} position="right">
            <div className="flex justify-center p-1">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </div>
          </Tooltip>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar with smooth transition */}
      <aside
        className={`hidden lg:block shrink-0 border-r border-slate-200/80 bg-white transition-all duration-200 ease-in-out dark:border-slate-800/80 dark:bg-slate-950 ${
          collapsed ? 'w-[68px]' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity duration-200"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl transition-transform duration-200 ease-in-out lg:hidden dark:bg-slate-950 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
