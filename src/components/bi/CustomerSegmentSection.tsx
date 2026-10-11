import React from 'react';
import { Building2, ArrowUpRight, ChevronRight, UserCheck } from 'lucide-react';
import { CustomerSegmentItem } from '../../types/businessIntelligence';
import { BIEngine } from '../../utils/analytics/biEngine';

interface CustomerSegmentSectionProps {
  segments: CustomerSegmentItem[];
  selectedSegment?: string;
  onSelectSegment?: (segment: string) => void;
  className?: string;
}

export const CustomerSegmentSection: React.FC<CustomerSegmentSectionProps> = ({
  segments,
  selectedSegment,
  onSelectSegment,
  className = ''
}) => {
  if (!segments || segments.length === 0) {
    return (
      <div className={`rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 ${className}`}>
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
          <Building2 className="h-4 w-4 text-purple-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Customer Segment Portfolio & Realization
          </h3>
        </div>
        <div className="py-8 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Customer segment analysis unavailable because this dataset does not contain customer or segment attributes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-purple-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Customer Segment Portfolio & Realization
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Account tier contribution, transaction counts, and average order values
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {segments.map((seg, idx) => {
          const isSelected = selectedSegment && selectedSegment.toLowerCase() === seg.segment.toLowerCase();

          return (
            <div
              key={`seg-${seg.segment || 'item'}-${idx}`}
              onClick={() => onSelectSegment?.(seg.segment)}
              className={`group flex flex-col justify-between rounded-xl border p-4 transition-all shadow-2xs ${
                isSelected 
                  ? 'border-purple-400 bg-purple-50/50 dark:border-purple-700 dark:bg-purple-950/40' 
                  : 'border-slate-200/80 bg-slate-50/40 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-850/40 dark:hover:border-slate-700'
              } ${onSelectSegment ? 'cursor-pointer' : ''}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                    {seg.segment}
                  </span>
                  <span className="rounded-md bg-white px-2 py-0.5 font-mono text-[11px] font-bold text-purple-700 dark:bg-slate-800 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800 shadow-2xs">
                    {seg.share}% share
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden dark:bg-slate-700">
                  <div 
                    className="h-full bg-purple-500 rounded-full" 
                    style={{ width: `${Math.min(100, Math.max(5, seg.share))}%` }} 
                  />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-[10px] uppercase font-sans text-slate-400 dark:text-slate-500">Sales</span>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {BIEngine.formatCurrency(seg.sales)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-sans text-slate-400 dark:text-slate-500">Gross Margin</span>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {seg.margin}%
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-sans text-slate-400 dark:text-slate-500">Transactions</span>
                    <p className="font-medium text-slate-700 dark:text-slate-300">
                      {seg.orders.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-sans text-slate-400 dark:text-slate-500">Avg Basket</span>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {BIEngine.formatCurrency(seg.aov)}
                    </p>
                  </div>
                </div>
              </div>

              {onSelectSegment && (
                <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2 text-[11px] text-purple-600 dark:text-purple-400 dark:border-slate-800">
                  <span>Filter by segment</span>
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
