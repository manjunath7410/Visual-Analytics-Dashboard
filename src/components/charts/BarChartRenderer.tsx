import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Legend 
} from 'recharts';
import { InteractiveDataPoint } from '../../types/visualization';

interface BarChartRendererProps {
  data: InteractiveDataPoint[];
  metricName: string;
  horizontal?: boolean;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  selectedLabel?: string;
  onSelectPoint?: (point: InteractiveDataPoint) => void;
  onDrillDown?: (point: InteractiveDataPoint) => void;
  canDrillDown?: boolean;
  currencyPrefix?: string;
}

export const BarChartRenderer: React.FC<BarChartRendererProps> = ({
  data,
  metricName,
  horizontal = false,
  height = 280,
  showGrid = true,
  showLegend = false,
  selectedLabel,
  onSelectPoint,
  onDrillDown,
  canDrillDown = false,
  currencyPrefix = '$'
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full min-h-[220px] items-center justify-center text-xs text-slate-400">
        No analytical data available for this dimension and metric.
      </div>
    );
  }

  const defaultBarColor = '#6366f1';
  const selectedBarColor = '#4f46e5';
  const dimmedBarColor = '#94a3b8';

  const formatTick = (val: number) => {
    if (Math.abs(val) >= 1000000) return `${currencyPrefix}${(val / 1000000).toFixed(1)}M`;
    if (Math.abs(val) >= 1000) return `${currencyPrefix}${(val / 1000).toFixed(0)}k`;
    return `${currencyPrefix}${val}`;
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={height}>
        {horizontal ? (
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />}
            <XAxis 
              type="number" 
              stroke="#94a3b8" 
              fontSize={11} 
              tickLine={false}
              tickFormatter={formatTick}
            />
            <YAxis 
              type="category" 
              dataKey="label" 
              stroke="#94a3b8" 
              fontSize={11} 
              tickLine={false}
              width={90}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const point = payload[0].payload as InteractiveDataPoint;
                return (
                  <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-3 text-xs text-white shadow-xl backdrop-blur-xs">
                    <p className="font-semibold text-slate-200">{point.label}</p>
                    <div className="mt-1 font-mono text-indigo-400 font-bold tabular-nums">
                      {metricName}: {currencyPrefix}{point.value.toLocaleString()}
                    </div>
                    {point.percentageShare !== undefined && (
                      <div className="text-[11px] text-slate-400">
                        Share: {point.percentageShare}% of total
                      </div>
                    )}
                    {point.recordCount !== undefined && (
                      <div className="text-[11px] text-slate-400">
                        Volume: {point.recordCount.toLocaleString()} records
                      </div>
                    )}
                    {canDrillDown && (
                      <div className="mt-1.5 border-t border-slate-800 pt-1 text-[10px] text-indigo-300 font-semibold">
                        Click to drill down into details
                      </div>
                    )}
                  </div>
                );
              }}
            />
            <Bar 
              dataKey="value" 
              name={metricName}
              radius={[0, 4, 4, 0]}
              onClick={(entry: any) => {
                const pt = entry as InteractiveDataPoint;
                if (canDrillDown && onDrillDown) {
                  onDrillDown(pt);
                } else if (onSelectPoint) {
                  onSelectPoint(pt);
                }
              }}
              cursor={canDrillDown || onSelectPoint ? 'pointer' : 'default'}
            >
              {data.map((entry) => {
                const isSelected = selectedLabel === entry.label;
                const fill = selectedLabel 
                  ? (isSelected ? selectedBarColor : dimmedBarColor)
                  : (entry.color || defaultBarColor);
                return (
                  <Cell 
                    key={`cell-${entry.label}`} 
                    fill={fill} 
                    opacity={selectedLabel && !isSelected ? 0.35 : 1}
                  />
                );
              })}
            </Bar>
          </BarChart>
        ) : (
          <BarChart
            data={data}
            margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />}
            <XAxis 
              dataKey="label" 
              stroke="#94a3b8" 
              fontSize={11} 
              tickLine={false}
              interval={0}
              angle={data.length > 6 ? -25 : 0}
              textAnchor={data.length > 6 ? 'end' : 'middle'}
              height={data.length > 6 ? 45 : 30}
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
                    <div className="mt-1 font-mono text-indigo-400 font-bold tabular-nums">
                      {metricName}: {currencyPrefix}{point.value.toLocaleString()}
                    </div>
                    {point.percentageShare !== undefined && (
                      <div className="text-[11px] text-slate-400">
                        Share: {point.percentageShare}% of total
                      </div>
                    )}
                    {point.recordCount !== undefined && (
                      <div className="text-[11px] text-slate-400">
                        Volume: {point.recordCount.toLocaleString()} records
                      </div>
                    )}
                    {canDrillDown && (
                      <div className="mt-1.5 border-t border-slate-800 pt-1 text-[10px] text-indigo-300 font-semibold">
                        Click to drill down into details
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
            <Bar 
              dataKey="value" 
              name={metricName}
              radius={[4, 4, 0, 0]}
              onClick={(entry: any) => {
                const pt = entry as InteractiveDataPoint;
                if (canDrillDown && onDrillDown) {
                  onDrillDown(pt);
                } else if (onSelectPoint) {
                  onSelectPoint(pt);
                }
              }}
              cursor={canDrillDown || onSelectPoint ? 'pointer' : 'default'}
            >
              {data.map((entry) => {
                const isSelected = selectedLabel === entry.label;
                const fill = selectedLabel 
                  ? (isSelected ? selectedBarColor : dimmedBarColor)
                  : (entry.color || defaultBarColor);
                return (
                  <Cell 
                    key={`cell-${entry.label}`} 
                    fill={fill}
                    opacity={selectedLabel && !isSelected ? 0.35 : 1}
                  />
                );
              })}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
