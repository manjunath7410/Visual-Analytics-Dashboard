import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface RouteMeta {
  section: string;
  title: string;
}

const ROUTE_MAP: Record<string, RouteMeta> = {
  '/upload': { section: 'Workspace', title: 'Data Upload' },
  '/explorer': { section: 'Workspace', title: 'Data Explorer' },
  '/cleaning': { section: 'Workspace', title: 'Data Cleaning & ETL' },
  '/': { section: 'Workspace', title: 'Executive Dashboard' },
  '/dashboard': { section: 'Workspace', title: 'Executive Dashboard' },
  '/analytics': { section: 'Analytics', title: 'Visual Analytics' },
  '/insights': { section: 'Analytics', title: 'AI Business Intelligence' },
  '/sql': { section: 'Analytics', title: 'SQL Analytics' },
  '/warehouse': { section: 'Data Platform', title: 'Data Warehouse' },
  '/reports': { section: 'Reporting', title: 'Automated Reports' },
  '/settings': { section: 'System', title: 'Settings' },
};

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const current = ROUTE_MAP[location.pathname] || { section: 'Analytics', title: 'Overview' };

  return (
    <nav aria-label="Breadcrumb Navigation" className="flex items-center gap-1.5 text-xs">
      <Link
        to="/"
        className="flex items-center gap-1 font-semibold text-slate-900 dark:text-[#F8FAFC] hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        title="Go to Dashboard"
      >
        <span className="hidden sm:inline">Acuity BI</span>
        <Home className="h-3.5 w-3.5 sm:hidden text-indigo-500" />
      </Link>

      <span className="text-slate-400 dark:text-[#64748B]" aria-hidden="true">/</span>

      <span className="text-slate-500 dark:text-[#94A3B8] hidden sm:inline">
        {current.section}
      </span>

      <span className="text-slate-400 dark:text-[#64748B] hidden sm:inline" aria-hidden="true">/</span>

      <span className="font-semibold text-slate-800 dark:text-[#F8FAFC] truncate max-w-[160px] sm:max-w-none">
        {current.title}
      </span>
    </nav>
  );
};
