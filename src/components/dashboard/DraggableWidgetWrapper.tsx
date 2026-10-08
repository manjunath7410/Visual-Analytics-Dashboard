import React, { useState } from 'react';
import { 
  GripVertical, 
  ArrowUp, 
  ArrowDown, 
  EyeOff, 
  Maximize2, 
  Minimize2, 
  Columns2, 
  Columns3, 
  Move,
  Check,
  Sliders
} from 'lucide-react';
import { DashboardWidgetConfig, WidgetSize } from '../../types/dashboardLayout';

interface DraggableWidgetWrapperProps {
  widget: DashboardWidgetConfig;
  index: number;
  totalVisible: number;
  isCustomizing: boolean;
  onMove: (fromIndex: number, toIndex: number) => void;
  onResize: (id: string, size: WidgetSize) => void;
  onToggleVisibility: (id: string) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  isDraggingCurrent?: boolean;
  isDragOverCurrent?: boolean;
  children: React.ReactNode;
}

export const DraggableWidgetWrapper: React.FC<DraggableWidgetWrapperProps> = ({
  widget,
  index,
  totalVisible,
  isCustomizing,
  onMove,
  onResize,
  onToggleVisibility,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  isDraggingCurrent = false,
  isDragOverCurrent = false,
  children
}) => {
  const [showSizeMenu, setShowSizeMenu] = useState(false);

  // Compute CSS grid column span based on widget.size
  const getColSpanClass = (size: WidgetSize) => {
    switch (size) {
      case 'half':
        return 'col-span-12 lg:col-span-6';
      case 'third':
        return 'col-span-12 md:col-span-6 lg:col-span-4';
      case 'two-thirds':
        return 'col-span-12 lg:col-span-8';
      case 'full':
      default:
        return 'col-span-12';
    }
  };

  const sizeLabels: Record<WidgetSize, { label: string; icon: React.ReactNode }> = {
    full: { label: 'Full Width (100%)', icon: <Maximize2 className="h-3 w-3" /> },
    half: { label: 'Half Width (50%)', icon: <Columns2 className="h-3 w-3" /> },
    'two-thirds': { label: 'Two Thirds (66%)', icon: <Columns2 className="h-3 w-3" /> },
    third: { label: 'One Third (33%)', icon: <Columns3 className="h-3 w-3" /> },
  };

  return (
    <div
      draggable={isCustomizing}
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      onDrop={(e) => onDrop(e, index)}
      className={`relative min-w-0 w-full transition-all duration-200 ${getColSpanClass(widget.size)} ${
        isCustomizing
          ? 'rounded-2xl border-2 border-dashed p-1.5 ' +
            (isDraggingCurrent
              ? 'border-indigo-500 opacity-40 scale-[0.99]'
              : isDragOverCurrent
              ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 scale-[1.01] shadow-lg ring-2 ring-indigo-500/30'
              : 'border-slate-300 hover:border-indigo-400 dark:border-slate-700 dark:hover:border-indigo-600')
          : ''
      }`}
    >
      {/* Customization Control Overlay / Top Handle Bar */}
      {isCustomizing && (
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-900/90 px-3 py-2 text-white shadow-md backdrop-blur-md dark:bg-slate-800/95 text-xs select-none">
          {/* Left: Drag Handle & Widget Title */}
          <div className="flex items-center gap-2 min-w-0">
            <div 
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600/80 hover:bg-indigo-500 cursor-grab active:cursor-grabbing text-white transition-colors shrink-0"
              title="Drag to reorder position in dashboard grid"
            >
              <GripVertical className="h-4 w-4" />
            </div>

            <div className="flex items-center gap-1.5 truncate min-w-0">
              <span className="font-semibold text-xs text-slate-100 truncate">
                {widget.title}
              </span>
              <span className="rounded bg-slate-800 px-1.5 py-0.2 font-mono text-[9px] uppercase tracking-wider text-slate-400 border border-slate-700 hidden sm:inline shrink-0">
                {widget.category}
              </span>
            </div>
          </div>

          {/* Right: Quick Move, Resize, & Hide Controls */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Move Up */}
            <button
              onClick={() => index > 0 && onMove(index, index - 1)}
              disabled={index === 0}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Move Up / Before"
              aria-label="Move widget earlier"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>

            {/* Move Down */}
            <button
              onClick={() => index < totalVisible - 1 && onMove(index, index + 1)}
              disabled={index >= totalVisible - 1}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Move Down / After"
              aria-label="Move widget later"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>

            <div className="h-4 w-px bg-slate-700 mx-0.5" />

            {/* Resize Menu Button */}
            <div className="relative">
              <button
                onClick={() => setShowSizeMenu(!showSizeMenu)}
                className="flex items-center gap-1 rounded-lg bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
                title="Change widget width span"
              >
                {sizeLabels[widget.size].icon}
                <span className="hidden sm:inline capitalize">{widget.size}</span>
              </button>

              {showSizeMenu && (
                <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-xl border border-slate-700 bg-slate-900 p-1.5 shadow-2xl text-xs space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    Widget Width
                  </div>
                  {(['full', 'half', 'two-thirds', 'third'] as WidgetSize[]).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => {
                        onResize(widget.id, sz);
                        setShowSizeMenu(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                        widget.size === sz
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {sizeLabels[sz].icon}
                        <span>{sizeLabels[sz].label}</span>
                      </div>
                      {widget.size === sz && <Check className="h-3.5 w-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Hide Widget */}
            <button
              onClick={() => onToggleVisibility(widget.id)}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-rose-300 hover:bg-rose-950 hover:text-rose-200 transition-colors cursor-pointer"
              title="Hide this widget from dashboard"
              aria-label="Hide widget"
            >
              <EyeOff className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Actual Widget Rendered Content */}
      <div className={`w-full min-w-0 ${isCustomizing ? 'pointer-events-none' : ''}`}>
        {children}
      </div>
    </div>
  );
};
