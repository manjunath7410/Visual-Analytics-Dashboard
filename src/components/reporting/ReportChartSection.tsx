import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  RegionalPerformanceItem, 
  CategoryPerformanceItem, 
  ProductRankingItem, 
  CustomerSegmentItem,
  TrendAnalysisItem 
} from '../../types/businessIntelligence';
import { BIEngine } from '../../utils/analytics/biEngine';

interface ReportChartSectionProps {
  trends: TrendAnalysisItem[];
  regions: RegionalPerformanceItem[];
  categories: CategoryPerformanceItem[];
  segments: CustomerSegmentItem[];
  className?: string;
}

export const ReportChartSection: React.FC<ReportChartSectionProps> = ({
  trends,
  regions,
  categories,
  segments,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="border-b border-slate-200/80 pb-2 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
          Visual Analytics & Trajectory Charts
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Reconciled multi-dimensional visual graphics for performance distribution
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Chart 1: Revenue & Profit Chronological Trajectory */}
        {trends.length > 0 && (
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 break-inside-avoid">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
              Performance Trajectory & Volume (Time-Series)
            </h4>
            <p className="text-[11px] text-slate-500 mb-3">Chronological sales volume across evaluated intervals</p>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="repSalesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="period" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <Tooltip formatter={(v: any) => [BIEngine.formatCurrency(Number(v)), 'Sales']} />
                  <Area type="monotone" dataKey="currentValue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#repSalesGrad)" name="Sales" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Chart 2: Regional Sales & Operating Profit */}
        {regions.length > 0 && (
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 break-inside-avoid">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
              Regional Commercial Attainment
            </h4>
            <p className="text-[11px] text-slate-500 mb-3">Recognized gross sales and operating profit by territory</p>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regions} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="region" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <Tooltip formatter={(v: any, name: any) => [BIEngine.formatCurrency(Number(v)), name]} />
                  <Bar dataKey="sales" fill="#6366f1" name="Sales" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" fill="#10b981" name="Profit" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Chart 3: Category Profitability & Margin Contribution */}
        {categories.length > 0 && (
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 break-inside-avoid">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
              Category Sales & Blended Margin %
            </h4>
            <p className="text-[11px] text-slate-500 mb-3">Product category volume and margin realization</p>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categories} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="category" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <Tooltip formatter={(v: any, name: any) => [BIEngine.formatCurrency(Number(v)), name]} />
                  <Bar dataKey="sales" fill="#0ea5e9" name="Sales" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" fill="#8b5cf6" name="Profit" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Chart 4: Customer Cohort / Segment Distribution */}
        {segments.length > 0 && (
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 break-inside-avoid">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
              Customer Segment Volume Distribution
            </h4>
            <p className="text-[11px] text-slate-500 mb-3">Commercial attainment across customer segments</p>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={segments} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis type="category" dataKey="segment" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <Tooltip formatter={(v: any) => [BIEngine.formatCurrency(Number(v)), 'Sales']} />
                  <Bar dataKey="sales" fill="#f59e0b" name="Sales" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
