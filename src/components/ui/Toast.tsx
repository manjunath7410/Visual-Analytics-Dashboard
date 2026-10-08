import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../../types/toast';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <aside
      aria-label="Notification Center"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2 pointer-events-none"
    >
      <AnimatePresence mode="sync">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
        ))}
      </AnimatePresence>
    </aside>
  );
};

interface ToastItemProps {
  toast: ToastMessage;
  onDismiss: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const shouldReduceMotion = useReducedMotion();

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-rose-500 shrink-0" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-indigo-500 shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-emerald-200 dark:border-emerald-800/60';
      case 'warning':
        return 'border-amber-200 dark:border-amber-800/60';
      case 'error':
        return 'border-rose-200 dark:border-rose-800/60';
      case 'info':
      default:
        return 'border-indigo-200 dark:border-indigo-800/60';
    }
  };

  return (
    <motion.div
      layout
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      role="status"
      className={`pointer-events-auto flex items-start gap-3 rounded-xl border bg-white p-3.5 shadow-lg backdrop-blur-md dark:bg-slate-900 ${getBorderColor()}`}
    >
      <div className="pt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
          {toast.title}
        </p>
        {toast.description && (
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {toast.description}
          </p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 cursor-pointer"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="rounded-md p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
        aria-label="Dismiss notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
};
