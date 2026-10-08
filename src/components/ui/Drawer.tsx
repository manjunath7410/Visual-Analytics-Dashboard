import React, { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';
import { modalBackdropVariants } from '../../design-system/motion';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  position?: 'right' | 'left';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  position = 'right',
  size = 'md',
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();

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
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-xl',
  };

  const isRight = position === 'right';

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex overflow-hidden"
        >
          {/* Backdrop */}
          <motion.div
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { x: isRight ? '100%' : '-100%' }}
            animate={{ x: 0, opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { x: isRight ? '100%' : '-100%' }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`
              fixed inset-y-0 ${isRight ? 'right-0' : 'left-0'} flex max-w-full z-10
            `}
          >
            <div
              className={`
                flex h-full w-screen flex-col border-slate-200 bg-white shadow-2xl
                dark:border-slate-800 dark:bg-slate-900 ${isRight ? 'border-l' : 'border-r'}
                ${sizeStyles[size]} ${className}
              `}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
                <div>
                  <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    {title}
                  </h2>
                  {description && (
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
                  aria-label="Close drawer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4">{children}</div>

              {/* Footer */}
              {footer && (
                <div className="border-t border-slate-100 p-4 dark:border-slate-800">
                  {footer}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
