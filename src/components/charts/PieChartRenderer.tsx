import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { AlertCircle, BarChart2 } from 'lucide-react';
import { InteractiveDataPoint } from '../../types/visualization';

interface PieChartRendererProps {
  data: InteractiveDataPoint[];
  metricName: string;
  isDonut?: boolean;
  height?: number;
  showLegend?: boolean;
  selectedLabel?: string;
  onSelectPoint?: (point: InteractiveDataPoint) => void;
  onDrillDown?: (point: InteractiveDataPoint) => void;
  canDrillDown?: boolean;
  onSwitchToBar?: () => void;
  currencyPrefix?: string;
}

const PALETTE = [
  '#6366f1', // Indigo
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#3b82f6', // Blue
  '#e11d48'  // Rose
];

export const PieChartRenderer: React.FC<PieChartRendererProps> = ({
  data,
  metricName,
  isDonut = false,
  height = 280,
  showLegend = true,
  selectedLabel,
  onSelectPoint,
  onDrillDown,
  canDrillDown = false,
  onSwitchToBar,
  currencyPrefix = '$'
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full min-h-[220px] items-center justify-center text-xs text-slate-400">
        No composition data available.
      </div>
    );
  }

  // Check if cardinality is too high for a clean pie chart
  const isHighCardinality = data.length > 7;

  return (
    <div className="w-full h-full flex flex-col justify-between">
      {/* High Cardinality Warning & Recommendation (Requirement 7) */}
      {isHighCardinality && onSwitchToBar && (
        <div className="mb-2 flex items-center justify-between rounded-md border border-amber-200/80 bg-amber-50/70 px-2.5 py-1 text-[11px] text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>High cardinality ({data.length} categories). Bar chart recommended for accurate perception.</span>
          </div>
          <button
            onClick={onSwitchToBar}
            className="inline-flex items-center gap-1 font-semibold underline hover:no-underline ml-2"
          >
            <BarChart2 className="h-3 w-3" />
            <span>Switch to Bar</span>
          </button>
        </div>
      )}

      <ResponsiveContainer width="100%" height={height - (isHighCardinality && onSwitchToBar ? 30 : 0)}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={isDonut ? 50 : 0}
            outerRadius={75}
            paddingAngle={isDonut ? 2 : 0}
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
            {data.map((entry, index) => {
              const isSelected = selectedLabel === entry.label;
              const fill = entry.color || PALETTE[index % PALETTE.length];
              return (
                <Cell 
                  key={`slice-${entry.label}`} 
                  fill={fill}
                  stroke={isSelected ? '#ffffff' : 'transparent'}
                  strokeWidth={isSelected ? 2 : 0}
                  opacity={selectedLabel && !isSelected ? 0.4 : 1}
                />
              );
            })}
          </Pie>
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
                    <div className="text-[11px] text-slate-400 font-mono">
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
                      Click to drill down into subcategories
                    </div>
                  )}
                </div>
              );
            }}
          />
          {showLegend && (
            <Legend 
              verticalAlign="bottom" 
              height={40}
              iconType="circle"
              formatter={(value, entry: any) => {
                const pt = data.find(d => d.label === value);
                return (
                  <span className="text-xs text-slate-600 dark:text-slate-300">
                    {value} {pt?.percentageShare ? `(${pt.percentageShare}%)` : ''}
                  </span>
                );
              }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
