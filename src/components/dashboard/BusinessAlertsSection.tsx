import React from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  Info, 
  ArrowRight, 
  ShieldAlert, 
  TrendingDown,
  Percent,
  CheckCircle2
} from 'lucide-react';
import { 
  ExecutiveKPI, 
  CategoryPerformanceItem, 
  ProductRankingItem, 
  DetectedAnomaly 
} from '../../types/businessIntelligence';

interface BusinessAlertItem {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  metric?: string;
  recommendation?: string;
}

interface BusinessAlertsSectionProps {
  kpis: ExecutiveKPI[];
  categories: CategoryPerformanceItem[];
  underperformingProducts: ProductRankingItem[];
  anomalies: DetectedAnomaly[];
  className?: string;
  onViewDeepDive?: () => void;
}

export const BusinessAlertsSection: React.FC<BusinessAlertsSectionProps> = ({
  kpis,
  categories,
  underperformingProducts,
  anomalies,
  className = '',
  onViewDeepDive,
}) => {
  // Generate deterministic real analytical alerts based on active dataset findings
  const alerts: BusinessAlertItem[] = React.useMemo(() => {
    const list: BusinessAlertItem[] = [];

    // 1. Profit Margin Compression Alert
    const profitKPI = kpis.find(k => k.id === 'profit');
    const marginKPI = kpis.find(k => k.id === 'profit_margin');
    if (profitKPI && profitKPI.percentageChange !== null && profitKPI.percentageChange < -5) {
      list.push({
        id: 'alert-profit-drop',
        severity: 'critical',
        title: 'Operating Profit Contraction Detected',
        description: `Gross profit contracted ${Math.abs(profitKPI.percentageChange)}% compared with the previous chronological period.`,
        metric: `Variance: -${Math.abs(profitKPI.percentageChange)}%`,
        recommendation: 'Audit promotional discount allowances and unit cost realization on high-volume transactions.'
      });
    }

    // 2. Low Margin Category Alert
    const lowMarginCat = [...categories].sort((a, b) => a.profitMargin - b.profitMargin)[0];
    if (lowMarginCat && lowMarginCat.profitMargin < 15) {
      list.push({
        id: `alert-cat-${lowMarginCat.category}`,
        severity: 'warning',
        title: `Margin Compression in "${lowMarginCat.category}"`,
        description: `"${lowMarginCat.category}" generated substantial volume but compressed blended margins to ${lowMarginCat.profitMargin}%.`,
        metric: `Margin: ${lowMarginCat.profitMargin}%`,
        recommendation: 'Review minimum threshold tier pricing and freight surcharge offsets.'
      });
    }

    // 3. Statistical Anomalies Flagged
    if (anomalies.length > 0) {
      const topAnomaly = anomalies[0];
      list.push({
        id: 'alert-anomaly',
        severity: 'info',
        title: `${anomalies.length} Statistical Outlier Observation${anomalies.length > 1 ? 's' : ''}`,
        description: `${topAnomaly.periodOrEntity} recorded unexpected variance (+${topAnomaly.deviationPercent}% outside historical bounds).`,
        metric: `Dev: +${topAnomaly.deviationPercent}%`,
        recommendation: 'Conduct transaction audit to verify invoice payment milestones.'
      });
    }

    // 4. Underperforming Product Line
    if (underperformingProducts.length > 0) {
      const under = underperformingProducts[0];
      list.push({
        id: `alert-prod-${under.product}`,
        severity: 'warning',
        title: `Margin Review: "${under.product}"`,
        description: `Trailing profitability rank indicates lower gross margin contributions relative to sales volume.`,
        metric: `Rank #${under.rank}`,
        recommendation: 'Assess product packaging options and bulk discount constraints.'
      });
    }

    // Default nominal state if all metrics are healthy
    if (list.length === 0) {
      list.push({
        id: 'alert-nominal',
        severity: 'info',
        title: 'All Core Performance Metrics Nominal',
        description: 'Operating margins, regional attainment, and volume metrics tracking comfortably within target thresholds.',
        metric: 'Status: Optimal',
        recommendation: 'Continue maintaining active promotional pricing guidelines.'
      });
    }

    return list.slice(0, 3);
  }, [kpis, categories, underperformingProducts, anomalies]);

  const getSeverityBadge = (severity: BusinessAlertItem['severity']) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-700 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300">
            <AlertOctagon className="h-3 w-3 stroke-[2.5]" />
            <span>High Priority</span>
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
            <AlertTriangle className="h-3 w-3 stroke-[2.5]" />
            <span>Warning</span>
          </span>
        );
      case 'info':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300">
            <Info className="h-3 w-3 stroke-[2.5]" />
            <span>Operational Notice</span>
          </span>
        );
    }
  };

  return (
    <div
      className={`rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 ${className}`}
    >
      <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Risk & Optimization
            </span>
          </div>
          <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Needs Executive Attention
          </h3>
        </div>

        {onViewDeepDive && (
          <button
            onClick={onViewDeepDive}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 cursor-pointer"
          >
            <span>View Full Analysis</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex flex-col justify-between rounded-lg border border-slate-200/70 bg-slate-50/50 p-3.5 dark:border-slate-800/70 dark:bg-slate-950/40"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                {getSeverityBadge(alert.severity)}
                {alert.metric && (
                  <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                    {alert.metric}
                  </span>
                )}
              </div>

              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                {alert.title}
              </h4>

              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {alert.description}
              </p>
            </div>

            {alert.recommendation && (
              <div className="mt-2.5 border-t border-slate-200/60 pt-2 text-[10px] text-slate-600 dark:border-slate-800/60 dark:text-slate-400">
                <strong className="font-semibold text-slate-800 dark:text-slate-200">Action:</strong>{' '}
                {alert.recommendation}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
