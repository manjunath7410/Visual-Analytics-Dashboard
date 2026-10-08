import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  Check, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Maximize2, 
  Columns2, 
  Columns3, 
  Layers, 
  Sparkles, 
  X,
  Plus,
  HelpCircle,
  LayoutGrid
} from 'lucide-react';
import { 
  DashboardWidgetConfig, 
  DashboardLayoutPreset, 
  PRESET_CONFIGS, 
  WidgetSize 
} from '../../types/dashboardLayout';

interface DashboardCustomizerToolbarProps {
  isCustomizing: boolean;
  onToggleCustomizing: () => void;
  widgets: DashboardWidgetConfig[];
  onApplyPreset: (preset: DashboardLayoutPreset) => void;
  onReset: () => void;
  onToggleVisibility: (id: string) => void;
  onResize: (id: string, size: WidgetSize) => void;
  className?: string;
}

export const DashboardCustomizerToolbar: React.FC<DashboardCustomizerToolbarProps> = ({
  isCustomizing,
  onToggleCustomizing,
  widgets,
  onApplyPreset,
  onReset,
  onToggleVisibility,
  onResize,
  className = ''
}) => {
  const [showManageModal, setShowManageModal] = useState(false);
  const [showPresetMenu, setShowPresetMenu] = useState(false);

  const visibleCount = widgets.filter(w => w.visible).length;
  const hiddenCount = widgets.length - visibleCount;

  if (!isCustomizing) {
    return null;
  }

  return (
    <>
      {/* Sticky Top Customization Banner & Controls */}
      <div className="sticky top-20 z-20 mb-6 rounded-2xl border-2 border-indigo-500/80 bg-slate-900/95 p-3.5 text-white shadow-2xl backdrop-blur-md animate-in slide-in-from-top-2 duration-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left info & Drag hint */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white shadow-xs">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-100">
                  Dashboard Personalization Mode
                </h4>
                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 font-mono text-[10px] font-semibold text-indigo-300 border border-indigo-500/30">
                  {visibleCount} Active Widgets
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Drag handles to reorder, resize spans (50% / 100%), or click "Manage Widgets" to show/hide.
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Presets Menu */}
            <div className="relative">
              <button
                onClick={() => setShowPresetMenu(!showPresetMenu)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <LayoutGrid className="h-3.5 w-3.5 text-indigo-400" />
                <span>Layout Presets</span>
              </button>

              {showPresetMenu && (
                <div className="absolute right-0 top-full mt-1.5 z-50 w-72 rounded-2xl border border-slate-700 bg-slate-900 p-2 shadow-2xl text-xs space-y-1">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    Analytical View Presets
                  </div>
                  {(Object.keys(PRESET_CONFIGS) as DashboardLayoutPreset[]).map((pKey) => {
                    const preset = PRESET_CONFIGS[pKey];
                    return (
                      <button
                        key={pKey}
                        onClick={() => {
                          onApplyPreset(pKey);
                          setShowPresetMenu(false);
                        }}
                        className="w-full text-left rounded-xl p-2 hover:bg-slate-800 transition-colors"
                      >
                        <div className="font-semibold text-slate-100">{preset.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                          {preset.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Manage Widgets Modal Button */}
            <button
              onClick={() => setShowManageModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Layers className="h-3.5 w-3.5 text-sky-400" />
              <span>Manage Widgets ({visibleCount}/{widgets.length})</span>
            </button>

            {/* Reset Layout */}
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
              title="Reset to default balanced BI layout"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Default</span>
            </button>

            {/* Save & Finish Customizing */}
            <button
              onClick={onToggleCustomizing}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition-colors cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Save & Done</span>
            </button>
          </div>
        </div>
      </div>

      {/* Manage Widgets Modal */}
      {showManageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Manage Executive Dashboard Widgets
                </h3>
              </div>
              <button
                onClick={() => setShowManageModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-850 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Toggle visibility and default width for all analytic sections on the dashboard. Changes are saved automatically.
            </p>

            {/* Widget List */}
            <div className="mt-4 max-h-96 overflow-y-auto space-y-2 pr-1">
              {widgets.map((w) => (
                <div
                  key={w.id}
                  className={`flex items-center justify-between rounded-xl border p-3 transition-colors ${
                    w.visible
                      ? 'border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-850/60'
                      : 'border-slate-100 bg-white opacity-60 dark:border-slate-850 dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onToggleVisibility(w.id)}
                      className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold transition-colors cursor-pointer ${
                        w.visible
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'border border-slate-300 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-800'
                      }`}
                    >
                      {w.visible ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-xs ${w.visible ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500'}`}>
                          {w.title}
                        </span>
                        <span className="rounded bg-slate-200/80 px-1.5 py-0.2 font-mono text-[9px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {w.category}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-400 line-clamp-1">
                        {w.description}
                      </p>
                    </div>
                  </div>

                  {/* Size selector */}
                  {w.visible && (
                    <div className="flex items-center gap-1">
                      <select
                        value={w.size}
                        onChange={(e) => onResize(w.id, e.target.value as WidgetSize)}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                      >
                        <option value="full">Full (100%)</option>
                        <option value="half">Half (50%)</option>
                        <option value="two-thirds">2/3 (66%)</option>
                        <option value="third">1/3 (33%)</option>
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
              <span className="text-[11px] text-slate-500">
                {visibleCount} of {widgets.length} sections displayed
              </span>
              <button
                onClick={() => setShowManageModal(false)}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-500 cursor-pointer"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
