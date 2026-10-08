import React from 'react';
import { Award, LineChart, ShieldCheck, Database, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { ReportTemplateType } from '../../types/reporting';
import { REPORT_TEMPLATES } from '../../utils/reporting/reportTemplates';

interface ReportTemplateSelectorProps {
  selectedTemplate: ReportTemplateType;
  onSelectTemplate: (template: ReportTemplateType) => void;
  className?: string;
}

export const ReportTemplateSelector: React.FC<ReportTemplateSelectorProps> = ({
  selectedTemplate,
  onSelectTemplate,
  className = ''
}) => {
  const getTemplateDetails = (id: ReportTemplateType) => {
    switch (id) {
      case 'executive':
        return {
          icon: Award,
          bestUse: 'Management & Decision Makers',
          includes: ['Executive KPIs', 'Revenue Trends', 'Regional Share', 'AI Briefing', 'Strategic Action Plan'],
          color: 'indigo'
        };
      case 'bi_analysis':
        return {
          icon: LineChart,
          bestUse: 'Business & Financial Analysts',
          includes: ['Multi-Dimensional Tables', 'Category Pareto', 'Product Rankings', 'Customer RFM', 'Anomalies'],
          color: 'sky'
        };
      case 'data_quality':
        return {
          icon: ShieldCheck,
          bestUse: 'Data Stewards & Governance',
          includes: ['Data Hygiene Score', 'Missing Imputations', 'Cleaning Ledger', 'Duplicate Auditing'],
          color: 'emerald'
        };
      case 'data_warehouse':
        return {
          icon: Database,
          bestUse: 'Data Engineers & Architects',
          includes: ['Star Schema Fact & Dims', 'Surrogate Key Lineage', 'OLAP 2D Matrix', 'Reconciliation Audit'],
          color: 'purple'
        };
      default:
        return {
          icon: Award,
          bestUse: 'General Stakeholders',
          includes: ['Executive Summary', 'Analytics'],
          color: 'indigo'
        };
    }
  };

  return (
    <div className={`rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Report Template Selection
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Select a tailored layout pre-configured for executives, financial analysts, data stewards, or platform architects
          </p>
        </div>

        <span className="font-mono text-xs text-slate-400">
          4 Standard Architectures Available
        </span>
      </div>

      {/* 4 Template Cards Grid */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {REPORT_TEMPLATES.map((tmpl) => {
          const isSelected = selectedTemplate === tmpl.id;
          const details = getTemplateDetails(tmpl.id);
          const Icon = details.icon;

          return (
            <div
              key={tmpl.id}
              onClick={() => onSelectTemplate(tmpl.id)}
              className={`flex flex-col justify-between cursor-pointer rounded-xl border p-4 transition-all relative ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-2 ring-indigo-500/20 dark:border-indigo-500 dark:bg-indigo-950/40'
                  : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-850/60 dark:hover:border-slate-700'
              }`}
            >
              <div>
                {/* Badge and Icon */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-750 dark:text-slate-200'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>

                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                      <CheckCircle2 className="h-3 w-3" />
                      Active Template
                    </span>
                  ) : (
                    <span className="rounded bg-slate-200/70 px-1.5 py-0.5 font-mono text-[9px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400 uppercase">
                      {tmpl.badge}
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {tmpl.title}
                </h4>

                <div className="mt-1 text-[10px] text-indigo-700 dark:text-indigo-300 font-semibold">
                  Best for: {details.bestUse}
                </div>

                <p className="mt-1.5 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {tmpl.description}
                </p>
              </div>

              {/* Module Inclusion List */}
              <div className="mt-3.5 border-t border-slate-200/80 pt-2.5 dark:border-slate-800/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Included Modules:
                </span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {details.includes.map((inc, i) => (
                    <span key={i} className="rounded bg-white px-1.5 py-0.5 text-[9px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                      {inc}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
