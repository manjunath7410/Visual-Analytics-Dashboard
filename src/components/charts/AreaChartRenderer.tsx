import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { InteractiveDataPoint } from '../../types/visualization';

interface AreaChartRendererProps {
  data: InteractiveDataPoint[];
  metricName: string;
  secondaryMetricName?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  selectedLabel?: string;
  onSelectPoint?: (point: InteractiveDataPoint) => void;
  currencyPrefix?: string;
}

export const AreaChartRenderer: React.FC<AreaChartRendererProps> = ({
  data,
  metricName,
  secondaryMetricName,
  height = 280,
  showGrid = true,
  showLegend = true,
  selectedLabel,
  onSelectPoint,
  currencyPrefix = '$'
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full min-h-[220px] items-center justify-center text-xs text-slate-400">
        No analytical trend data available.
      </div>
    );
  }

  const formatTick = (val: number) => {
    if (Math.abs(val) >= 1000000) return `${currencyPrefix}${(val / 1000000).toFixed(1)}M`;
    if (Math.abs(val) >= 1000) return `${currencyPrefix}${(val / 1000).toFixed(0)}k`;
    return `${currencyPrefix}${val}`;
  };

  const hasSecondary = secondaryMetricName && data.some(d => d.secondaryValue !== undefined);

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
          onClick={(e: any) => {
            if (e && e.activePayload && e.activePayload.length && onSelectPoint) {
              onSelectPoint(e.activePayload[0].payload as InteractiveDataPoint);
            }
          }}
        >
          <defs>
            <linearGradient id="areaGradientPrimary" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="areaGradientSecondary" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />}
          <XAxis 
            dataKey="label" 
            stroke="#94a3b8" 
            fontSize={11} 
            tickLine={false} 
            interval="preserveStartEnd"
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={11} 
            tickLine={false}
            tickFormatter={formatTick}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null;
              const point = payload[0].payload as InteractiveDataPoint;
              return (
                <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-3 text-xs text-white shadow-xl backdrop-blur-xs">
                  <p className="font-semibold text-slate-200">{point.label}</p>
                  <div className="mt-1 flex items-center justify-between gap-4 font-mono">
                    <span className="text-indigo-400">{metricName}:</span>
                    <span className="font-bold tabular-nums">{currencyPrefix}{point.value.toLocaleString()}</span>
                  </div>
                  {point.secondaryValue !== undefined && secondaryMetricName && (
                    <div className="mt-0.5 flex items-center justify-between gap-4 font-mono">
                      <span className="text-emerald-400">{secondaryMetricName}:</span>
                      <span className="font-bold tabular-nums">{currencyPrefix}{point.secondaryValue.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              );
            }}
          />
          {showLegend && (
            <Legend 
              verticalAlign="top" 
              height={30}
              formatter={(val) => <span className="text-xs text-slate-600 dark:text-slate-300">{val}</span>}
            />
          )}

          <Area 
            type="monotone" 
            dataKey="value" 
            name={metricName}
            stroke="#6366f1" 
            strokeWidth={2.5}
            fill="url(#areaGradientPrimary)"
          />

          {hasSecondary && (
            <Area 
              type="monotone" 
              dataKey="secondaryValue" 
              name={secondaryMetricName}
              stroke="#10b981" 
              strokeWidth={2}
              fill="url(#areaGradientSecondary)"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
