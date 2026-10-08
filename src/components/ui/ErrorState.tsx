import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to Load Data',
  description = 'An unexpected issue occurred while processing this analytical module. You can try refreshing or resetting your filters.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50/50 p-8 text-center dark:border-rose-900/60 dark:bg-rose-950/20 ${className}`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400">
        <AlertCircle className="h-5 w-5" />
      </div>

      <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h3>

      <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        {description}
      </p>

      {onRetry && (
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
          >
            Retry
          </Button>
        </div>
      )}
    </div>
  );
};

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('UI Error Caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <ErrorState
          title="Component Render Issue"
          description="A view component encountered a display issue. Click retry to recover."
          onRetry={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}
