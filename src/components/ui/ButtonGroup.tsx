import React from 'react';

export interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'md';
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  className = '',
}) => {
  return (
    <div
      role="group"
      className={`inline-flex rounded-lg border border-slate-200 bg-slate-100/80 p-0.5 dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      {children}
    </div>
  );
};
