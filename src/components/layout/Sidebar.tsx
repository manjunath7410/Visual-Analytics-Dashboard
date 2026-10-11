import React, { useEffect, useState } from 'react';
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
  Layers,
  ChevronDown,
  Clock,
  CheckCircle2,
  HardDrive
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

/**
 * Refined Acuity BI Logo with abstract analytics waveform / intelligence symbol
 */
const AcuityLogoSymbol: React.FC<{ className?: string }> = ({ className = 'h-8 w-8' }) => (
  <div className={`relative flex items-center justify-center rounded-lg bg-[#151D2F] border border-indigo-500/40 shadow-xs overflow-hidden shrink-0 ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-cyan-500/20" />
    <svg className="h-5 w-5 relative z-10" viewBox="0 0 24 24" fill="none">
      {/* Waveform Bars */}
      <rect x="3.5" y="11" width="2.2" height="7" rx="1.1" fill="#6366F1" fillOpacity="0.8" />
      <rect x="8" y="6" width="2.2" height="12" rx="1.1" fill="#6366F1" />
      <rect x="12.5" y="9" width="2.2" height="9" rx="1.1" fill="#06B6D4" />
      <rect x="17" y="4" width="2.2" height="14" rx="1.1" fill="#6366F1" />
      {/* Intelligence Trajectory & Spark */}
      <path d="M4.5 13.5L9 8.5L13.5 11.5L18 5" stroke="#F8FAFC" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="18" cy="5" r="1.6" fill="#06B6D4" />
    </svg>
  </div>
);

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile
}) => {
  const { dataset, currentDataset, datasets, setCurrentDatasetId, filteredRows } = useData();
  const activeDatasetName = dataset ? dataset.name : currentDataset.name;

  // Toggle for recent datasets collapsible under REPORTING
  const [showRecentDatasets, setShowRecentDatasets] = useState(true);

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

  // Refined Grouped Navigation sections based on Enterprise Architecture
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
        { name: 'Data Warehouse', to: '/warehouse', icon: HardDrive },
      ]
    },
    {
      groupName: 'REPORTING',
      items: [
        { name: 'Reports & Export', to: '/reports', icon: FileText },
      ]
    }
  ];

  const renderNavGroup = (group: NavGroup) => (
    <div key={group.groupName} className="mb-3">
      {!collapsed && (
        <div className="px-3 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-wider text-[#64748B] select-none">
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
                group relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 min-h-[34px] text-xs font-medium transition-all duration-150 select-none
                ${isActive
                  ? 'bg-indigo-600/15 text-indigo-300 font-semibold shadow-2xs'
                  : 'text-[#94A3B8] hover:bg-[#151D2F] hover:text-[#F8FAFC]'
                }
                ${collapsed ? 'justify-center px-1.5' : ''}
              `}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`h-4 w-4 shrink-0 stroke-[1.8] transition-colors duration-150 ${
                      isActive
                        ? 'text-indigo-400'
                        : 'text-[#64748B] group-hover:text-[#94A3B8]'
                    }`}
                  />
                  {!collapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                  {isActive && (
                    <div
                      aria-hidden="true"
                      className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"
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

        {/* Collapsible Recent Datasets under REPORTING section */}
        {group.groupName === 'REPORTING' && !collapsed && (
          <div className="pt-1.5 pl-2">
            <button
              onClick={() => setShowRecentDatasets(!showRecentDatasets)}
              className="flex w-full items-center justify-between px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#64748B] hover:text-[#94A3B8] transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                Recent Datasets
              </span>
              <ChevronDown className={`h-3 w-3 transition-transform ${showRecentDatasets ? 'rotate-0' : '-rotate-90'}`} />
            </button>
            
            {showRecentDatasets && (
              <div className="mt-1 space-y-0.5 pl-1 border-l border-[#263247]">
                {datasets.slice(0, 3).map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      setCurrentDatasetId(d.id);
                      onCloseMobile();
                    }}
                    className={`flex w-full items-center justify-between rounded px-2 py-1 text-[11px] transition-colors text-left truncate ${
                      currentDataset.id === d.id
                        ? 'text-indigo-400 font-medium bg-indigo-500/10'
                        : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151D2F]'
                    }`}
                    title={d.name}
                  >
                    <span className="truncate max-w-[150px]">{d.name}</span>
                    {currentDataset.id === d.id && (
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between overflow-hidden bg-[#0B1020] text-[#F8FAFC]">
      {/* Top Identity Header */}
      <div>
        <div className="flex h-16 items-center justify-between border-b border-[#263247] px-3.5">
          <NavLink 
            to="/" 
            className="flex items-center gap-2.5 overflow-hidden text-[#F8FAFC] transition-transform active:scale-95"
            onClick={onCloseMobile}
            title="Acuity BI Enterprise Analytics"
          >
            <AcuityLogoSymbol />
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="text-sm font-bold tracking-tight text-[#F8FAFC] leading-tight">
                  Acuity BI
                </span>
                <span className="text-[10px] font-medium text-[#94A3B8] leading-tight">
                  Enterprise Analytics
                </span>
              </div>
            )}
          </NavLink>

          {/* Desktop collapse button */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md border border-[#263247] bg-[#151D2F] text-[#94A3B8] hover:bg-[#1B263B] hover:text-[#F8FAFC] hover:border-slate-600 transition-colors cursor-pointer"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label="Toggle Sidebar Navigation"
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="flex lg:hidden h-9 w-9 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#151D2F] transition-colors cursor-pointer"
            aria-label="Close mobile menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Navigation Groups */}
        <nav
          aria-label="Primary Navigation"
          className="overflow-y-auto max-h-[calc(100vh-140px)] p-2.5"
        >
          {navigationGroups.map(renderNavGroup)}
        </nav>
      </div>

      {/* Sidebar Footer Metadata */}
      <div className="border-t border-[#263247] p-2.5 bg-[#0B1020]">
        {!collapsed ? (
          <div className="rounded-lg bg-[#151D2F] p-2.5 border border-[#263247] shadow-xs">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#F8FAFC] truncate">
              <span className="h-2 w-2 rounded-full bg-[#10B981] shrink-0 animate-pulse" />
              <span className="truncate">{activeDatasetName}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-[#94A3B8]">
              <span className="font-mono tabular-nums">{filteredRows.length.toLocaleString()} rows</span>
              <span className="font-mono text-[#64748B]">Active Hub</span>
            </div>
          </div>
        ) : (
          <Tooltip content={`${activeDatasetName} (${filteredRows.length.toLocaleString()} rows)`} position="right">
            <div className="flex justify-center p-1">
              <div className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
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
        className={`hidden lg:block shrink-0 border-r border-[#263247] bg-[#0B1020] transition-all duration-200 ease-in-out ${
          collapsed ? 'w-[64px]' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#0B1020]/80 backdrop-blur-xs lg:hidden transition-opacity duration-200"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-[#0B1020] border-r border-[#263247] shadow-2xl transition-transform duration-200 ease-in-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
