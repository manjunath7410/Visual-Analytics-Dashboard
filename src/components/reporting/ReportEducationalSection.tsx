import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, FileText, Printer, FileSpreadsheet, Layers, Filter } from 'lucide-react';

export const ReportEducationalSection: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const topics = [
    {
      title: 'What is an Enterprise BI Report?',
      icon: FileText,
      desc: 'A formalized document synthesizing quantitative KPIs, multi-dimensional trends, and analytical insights into an executive-ready format for operational and strategic decisions.'
    },
    {
      title: 'How Global Filters Affect Reports',
      icon: Filter,
      desc: 'Reports strictly evaluate the filtered data scope (e.g. specific regions, categories, or date windows). The Analytics Engine guarantees numerical reconciliation between dashboard views and generated reports.'
    },
    {
      title: 'Why PDF & Print Optimization Matters',
      icon: Printer,
      desc: 'Print-optimized stylesheets ensure charts, KPI grids, and anomaly tables preserve high visual contrast and avoid awkward pagination splits when printed or archived to PDF.'
    },
    {
      title: 'CSV vs JSON Data Lineage',
      icon: FileSpreadsheet,
      desc: 'CSV export provides immediate tabular compatibility for spreadsheet modeling (Excel, Sheets), while JSON export preserves complete hierarchical analytics schemas for software integration.'
    },
    {
      title: 'Connecting Reporting to the Data Warehouse',
      icon: Layers,
      desc: 'Reports bridge transactional fact measurements with descriptive dimension tables (Star Schema) and OLAP multi-dimensional cube rollups, ensuring transparent auditability.'
    }
  ];

  return (
    <div className={`rounded-xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/50 p-4 shadow-2xs dark:border-indigo-900/60 dark:from-indigo-950/40 dark:via-slate-900/80 dark:to-slate-900/40 print:hidden ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
            Educational Reference: Enterprise BI Reporting & Export Architecture
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
          <span>{isOpen ? 'Hide Concepts' : 'Show Concepts'}</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 border-t border-indigo-100 dark:border-indigo-900/60">
          {topics.map((t, idx) => {
            const Icon = t.icon;
            return (
              <div
                key={idx}
                className="rounded-lg bg-white/90 p-3 text-xs dark:bg-slate-850/80 border border-slate-200/70 dark:border-slate-800"
              >
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
                  <Icon className="h-3.5 w-3.5 text-indigo-500" />
                  <span>{t.title}</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t.desc}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
