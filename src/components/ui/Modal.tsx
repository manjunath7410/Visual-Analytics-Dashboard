import React, { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';
import { modalBackdropVariants, modalContentVariants } from '../../design-system/motion';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Handle ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6"
        >
          {/* Backdrop with blur */}
          <motion.div
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal Dialog Card */}
          <motion.div
            variants={shouldReduceMotion ? undefined : modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`
              relative w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl
              dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] flex flex-col z-10
              ${sizeStyles[size]} ${className}
            `}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800/80">
              <div>
                <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {title}
                </h2>
                {description && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {description}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto py-4 min-h-0">{children}</div>

            {/* Footer Actions */}
            {footer && (
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800/80">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
