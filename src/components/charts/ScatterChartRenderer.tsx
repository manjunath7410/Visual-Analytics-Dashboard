import React from 'react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ZAxis
} from 'recharts';
import { AlertCircle } from 'lucide-react';

export interface ScatterPoint {
  x: number;
  y: number;
  label: string;
  category?: string;
  raw?: any;
}

interface ScatterChartRendererProps {
  data: ScatterPoint[];
  xMetric: string;
  yMetric: string;
  height?: number;
  showGrid?: boolean;
  totalPoints?: number;
  currencyPrefix?: string;
}

export const ScatterChartRenderer: React.FC<ScatterChartRendererProps> = ({
  data,
  xMetric,
  yMetric,
  height = 280,
  showGrid = true,
  totalPoints,
  currencyPrefix = '$'
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full min-h-[220px] flex-col items-center justify-center p-6 text-center text-xs text-slate-400">
        <AlertCircle className="h-8 w-8 text-slate-500 mb-2" />
        <p className="font-semibold text-slate-300">Insufficient Data for Scatter Plot</p>
        <p className="mt-1 text-slate-500 max-w-sm">
          Scatter plots require at least two numerical metrics to map correlation. Select valid X and Y numeric fields.
        </p>
      </div>
    );
  }

  const formatTick = (val: number) => {
    if (Math.abs(val) >= 1000000) return `${currencyPrefix}${(val / 1000000).toFixed(1)}M`;
    if (Math.abs(val) >= 1000) return `${currencyPrefix}${(val / 1000).toFixed(0)}k`;
    return `${currencyPrefix}${val}`;
  };

  const isLimited = totalPoints !== undefined && totalPoints > data.length;

  return (
    <div className="w-full h-full flex flex-col justify-between">
      {/* Sampling note if points were capped for SVG performance */}
      {isLimited && (
        <div className="mb-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Displaying sampled {data.length} of {totalPoints.toLocaleString()} points for optimal render performance</span>
          <span className="text-indigo-400">r correlation matrix active</span>
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 15, right: 20, left: -10, bottom: 15 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />}
          <XAxis 
            type="number" 
            dataKey="x" 
            name={xMetric} 
            stroke="#94a3b8" 
            fontSize={11} 
            tickLine={false}
            tickFormatter={formatTick}
            label={{ value: xMetric, position: 'bottom', offset: 0, fill: '#94a3b8', fontSize: 11 }}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name={yMetric} 
            stroke="#94a3b8" 
            fontSize={11} 
            tickLine={false}
            tickFormatter={formatTick}
            label={{ value: yMetric, angle: -90, position: 'insideLeft', offset: 15, fill: '#94a3b8', fontSize: 11 }}
          />
          <ZAxis range={[35, 60]} />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null;
              const point = payload[0].payload as ScatterPoint;
              return (
                <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-3 text-xs text-white shadow-xl backdrop-blur-xs">
                  <p className="font-semibold text-slate-200">{point.label}</p>
                  {point.category && (
                    <span className="text-[10px] text-slate-400">{point.category}</span>
                  )}
                  <div className="mt-1 space-y-0.5 font-mono tabular-nums">
                    <div className="text-indigo-400">
                      {xMetric}: {currencyPrefix}{point.x.toLocaleString()}
                    </div>
                    <div className="text-emerald-400">
                      {yMetric}: {currencyPrefix}{point.y.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            }}
          />
          <Scatter 
            name={`${xMetric} vs ${yMetric}`} 
            data={data} 
            fill="#6366f1" 
            stroke="#4f46e5"
            strokeWidth={1}
            opacity={0.8}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
