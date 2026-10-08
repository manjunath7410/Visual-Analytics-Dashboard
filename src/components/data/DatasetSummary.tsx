import React from 'react';
import { 
  Rows3, 
  Columns3, 
  AlertOctagon, 
  Copy, 
  Binary, 
  Tag, 
  Calendar, 
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';
import { DatasetStatistics } from '../../types/dataset';

interface DatasetSummaryProps {
  statistics: DatasetStatistics;
  className?: string;
  datasetName?: string;
  isSample?: boolean;
}

export const DatasetSummary: React.FC<DatasetSummaryProps> = ({
  statistics,
  className = '',
  datasetName,
  isSample
}) => {
  const cards = [
    {
      title: 'Total Rows',
      value: statistics.rowCount.toLocaleString(),
      icon: Rows3,
      desc: 'Dataset record count',
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/50',
    },
    {
      title: 'Total Columns',
      value: statistics.columnCount.toString(),
      icon: Columns3,
      desc: 'Attributes / dimensions',
      color: 'text-sky-600 dark:text-sky-400',
      bgColor: 'bg-sky-50 dark:bg-sky-950/50',
    },
    {
      title: 'Numeric Columns',
      value: statistics.numericColumnsCount.toString(),
      icon: Binary,
      desc: 'Quantitative measures',
      color: 'text-violet-600 dark:text-violet-400',
      bgColor: 'bg-violet-50 dark:bg-violet-950/50',
    },
    {
      title: 'Categorical Columns',
      value: statistics.categoricalColumnsCount.toString(),
      icon: Tag,
      desc: 'Discrete categories',
      color: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-50 dark:bg-teal-950/50',
    },
    {
      title: 'Date Columns',
      value: statistics.dateColumnsCount.toString(),
      icon: Calendar,
      desc: 'Temporal dimensions',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/50',
    },
    {
      title: 'Missing Values',
      value: statistics.missingValuesCount.toLocaleString(),
      icon: AlertOctagon,
      desc: statistics.missingValuesCount === 0 ? 'Zero null cells' : 'Total null/empty cells',
      color: statistics.missingValuesCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400',
      bgColor: statistics.missingValuesCount > 0 ? 'bg-amber-50 dark:bg-amber-950/50' : 'bg-emerald-50 dark:bg-emerald-950/50',
    },
    {
      title: 'Duplicate Rows',
      value: statistics.duplicateRowsCount.toLocaleString(),
      icon: Copy,
      desc: statistics.duplicateRowsCount === 0 ? 'Zero identical rows' : 'Redundant records',
      color: statistics.duplicateRowsCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400',
      bgColor: statistics.duplicateRowsCount > 0 ? 'bg-rose-50 dark:bg-rose-950/50' : 'bg-emerald-50 dark:bg-emerald-950/50',
    },
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      {datasetName && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-indigo-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Dataset Architecture Summary
            </h3>
            {isSample && (
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                Sample Data
              </span>
            )}
          </div>
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
            {datasetName}
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs transition-all hover:border-slate-300 dark:border-slate-800/90 dark:bg-slate-900/90 dark:hover:border-slate-700"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                  {card.title}
                </span>
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${card.bgColor} ${card.color}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>

              <div className="mt-2 font-mono text-xl font-bold tracking-tight text-slate-900 tabular-nums dark:text-slate-50">
                {card.value}
              </div>

              <div className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 truncate">
                {card.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
