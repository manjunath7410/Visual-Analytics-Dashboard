import React from 'react';
import { PageHeader, BreadcrumbItem } from '../ui/PageHeader';
import { PageTransition } from '../ui/Motion';

interface PageContainerProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  metadata?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  subtitle,
  breadcrumbs,
  metadata,
  actions,
  children,
  fullWidth = false,
  className = '',
}) => {
  return (
    <PageTransition className={`w-full pb-12 ${className}`}>
      {/* Reusable Standardized Page Header */}
      <PageHeader
        title={title}
        subtitle={subtitle}
        breadcrumbs={breadcrumbs}
        metadata={metadata}
        actions={actions}
      />

      {/* Page Content Viewport */}
      <div className={fullWidth ? 'w-full' : 'max-w-7xl mx-auto'}>
        {children}
      </div>
    </PageTransition>
  );
};
