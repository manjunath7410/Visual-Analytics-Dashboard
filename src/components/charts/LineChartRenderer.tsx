import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { InteractiveDataPoint } from '../../types/visualization';

interface LineChartRendererProps {
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

export const LineChartRenderer: React.FC<LineChartRendererProps> = ({
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
  const [showPrimary, setShowPrimary] = useState(true);
  const [showSecondary, setShowSecondary] = useState(true);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-full min-h-[220px] items-center justify-center text-xs text-slate-400">
        No chronological data points available.
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
      {hasSecondary && (
        <div className="mb-2 flex items-center justify-end gap-3 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-300">
            <input 
              type="checkbox" 
              checked={showPrimary} 
              onChange={() => setShowPrimary(!showPrimary)} 
              className="rounded text-indigo-600"
            />
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-indigo-600" />
              {metricName}
            </span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-300">
            <input 
              type="checkbox" 
              checked={showSecondary} 
              onChange={() => setShowSecondary(!showSecondary)} 
              className="rounded text-emerald-600"
            />
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {secondaryMetricName}
            </span>
          </label>
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
          onClick={(e: any) => {
            if (e && e.activePayload && e.activePayload.length && onSelectPoint) {
              onSelectPoint(e.activePayload[0].payload as InteractiveDataPoint);
            }
          }}
        >
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
                  {point.raw?.growthPercent !== undefined && point.raw?.growthPercent !== null && (
                    <div className="mt-1 text-[11px] text-emerald-400 font-mono">
                      Growth: {point.raw.growthPercent > 0 ? '+' : ''}{point.raw.growthPercent}% vs prior
                    </div>
                  )}
                </div>
              );
            }}
          />
          {showLegend && !hasSecondary && (
            <Legend 
              verticalAlign="top" 
              height={30}
              formatter={(val) => <span className="text-xs text-slate-600 dark:text-slate-300">{val}</span>}
            />
          )}

          {showPrimary && (
            <Line 
              type="monotone" 
              dataKey="value" 
              name={metricName}
              stroke="#6366f1" 
              strokeWidth={2.5}
              activeDot={{ r: 6, fill: '#4f46e5' }}
              dot={{ r: 3, fill: '#6366f1' }}
            />
          )}

          {hasSecondary && showSecondary && (
            <Line 
              type="monotone" 
              dataKey="secondaryValue" 
              name={secondaryMetricName}
              stroke="#10b981" 
              strokeWidth={2}
              strokeDasharray="4 4"
              activeDot={{ r: 5, fill: '#059669' }}
              dot={{ r: 3, fill: '#10b981' }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
