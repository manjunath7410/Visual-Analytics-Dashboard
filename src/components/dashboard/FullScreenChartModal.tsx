import React from 'react';
import { Modal } from '../ui/Modal';
import { ChartConfig } from '../../types/visualization';
import { ChartRenderer } from '../charts/ChartRenderer';
import { Filter } from 'lucide-react';

interface FullScreenChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ChartConfig | null;
  activeFilterSummary?: string;
}

export const FullScreenChartModal: React.FC<FullScreenChartModalProps> = ({
  isOpen,
  onClose,
  config,
  activeFilterSummary,
}) => {
  if (!config) return null;

  // Clone config with expanded height
  const expandedConfig: ChartConfig = {
    ...config,
    height: 480,
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={config.title}
      description={config.description || 'Full-screen analytical inspection'}
      size="xl"
    >
      <div className="space-y-4">
        {activeFilterSummary && (
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
            <Filter className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Filter Scope:</span>
            <span>{activeFilterSummary}</span>
          </div>
        )}

        <div className="p-2 bg-white dark:bg-slate-900 rounded-xl">
          <ChartRenderer config={expandedConfig} />
        </div>
      </div>
    </Modal>
  );
};
