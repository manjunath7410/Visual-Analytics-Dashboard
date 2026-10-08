import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastMessage, ToastContextValue } from '../types/toast';
import { ToastContainer } from '../components/ui/Toast';

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastMessage = {
      ...toast,
      id,
      duration: toast.duration ?? 4000,
    };

    setToasts((prev) => [...prev.slice(-4), newToast]); // Keep max 5 visible

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, [removeToast]);

  const success = useCallback((title: string, description?: string) => {
    return showToast({ type: 'success', title, description });
  }, [showToast]);

  const error = useCallback((title: string, description?: string) => {
    return showToast({ type: 'error', title, description });
  }, [showToast]);

  const warning = useCallback((title: string, description?: string) => {
    return showToast({ type: 'warning', title, description });
  }, [showToast]);

  const info = useCallback((title: string, description?: string) => {
    return showToast({ type: 'info', title, description });
  }, [showToast]);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        removeToast,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
