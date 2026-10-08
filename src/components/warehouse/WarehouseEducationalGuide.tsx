import React, { useState } from 'react';
import { 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Database, 
  Table, 
  Layers, 
  Sliders, 
  Key,
  GitBranch,
  Target
} from 'lucide-react';

export const WarehouseEducationalGuide: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const concepts = [
    {
      title: 'Fact Table',
      icon: Database,
      desc: 'Stores quantitative business measurements (measures like Sales, Profit, Units) along with foreign keys connecting to surrounding dimension tables.'
    },
    {
      title: 'Dimension Table',
      icon: Table,
      desc: 'Stores descriptive attributes (such as Region, Category, Customer, Date) used to contextualize, filter, slice, and dice numerical facts.'
    },
    {
      title: 'Star Schema',
      icon: Layers,
      desc: 'A relational database schema design where a centralized Fact table connects directly to de-normalized Dimension tables, optimizing query performance for analytical processing.'
    },
    {
      title: 'Surrogate Key',
      icon: Key,
      desc: 'An artificially generated unique integer (e.g. Region_Key = 1, Date_Key = 20260115) assigned during ETL to uniquely identify dimension records independently of business source keys.'
    },
    {
      title: 'Roll-Up (OLAP)',
      icon: Sliders,
      desc: 'Aggregates granular data to a higher conceptual level along a dimension hierarchy (e.g., Daily Sales &rarr; Quarterly Sales, or Product &rarr; Category).'
    },
    {
      title: 'Drill-Down (OLAP)',
      icon: Sliders,
      desc: 'Navigates from summary-level metrics down into granular, lower-level detail (e.g., Annual Total &rarr; Monthly Breakdown, or Category &rarr; Product SKUs).'
    },
    {
      title: 'Slice (OLAP)',
      icon: Sliders,
      desc: 'Filters the multi-dimensional data cube by fixing exactly one dimension value (e.g., Region = "North America") to produce a 2D sub-view.'
    },
    {
      title: 'Dice (OLAP)',
      icon: Sliders,
      desc: 'Filters the data cube across multiple dimensions simultaneously (e.g., Region = "North America" AND Category = "Technology" AND Year = 2026).'
    },
    {
      title: 'Pivot (OLAP)',
      icon: Sliders,
      desc: 'Reorients dimensional axes in a cross-tabulation matrix, placing one dimension along rows and another along columns with aggregated intersection cells.'
    }
  ];

  return (
    <div className={`rounded-xl border border-indigo-200/90 bg-indigo-50/40 p-4 shadow-2xs dark:border-indigo-900/60 dark:bg-indigo-950/20 ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
            Enterprise Reference Guide: Data Warehousing & OLAP Architecture
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
          <span>{isOpen ? 'Collapse Guide' : 'Expand Concepts Guide'}</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3.5 border-t border-indigo-100 dark:border-indigo-900/60">
          {concepts.map((c, idx) => {
            const Icon = c.icon;
            return (
              <div
                key={idx}
                className="rounded-lg bg-white p-3 text-xs dark:bg-slate-850 border border-slate-200/70 dark:border-slate-800"
              >
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
                  <Icon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>{c.title}</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {c.desc}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
