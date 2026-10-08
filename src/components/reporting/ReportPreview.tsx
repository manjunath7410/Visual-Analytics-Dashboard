import React from 'react';
import { FileText, Calendar, User, Building, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ReportConfig, ReportFilterContext, ReportDataQualitySummary } from '../../types/reporting';
import { 
  ExecutiveKPI, 
  RegionalPerformanceItem, 
  CategoryPerformanceItem, 
  ProductRankingItem, 
  CustomerSegmentItem,
  TrendAnalysisItem,
  DetectedAnomaly 
} from '../../types/businessIntelligence';
import { StarSchema, OLAPResult } from '../../types/dataWarehouse';
import { AIExecutiveSummary, AIKeyFinding, AIBusinessRecommendation } from '../../types/gemini';
import { ReportFilterBanner } from './ReportFilterBanner';
import { ReportKPISection } from './ReportKPISection';
import { ReportChartSection } from './ReportChartSection';
import { ReportTableSection } from './ReportTableSection';
import { ReportAnomalySection } from './ReportAnomalySection';
import { ReportDataQualitySection } from './ReportDataQualitySection';
import { ReportWarehouseSection } from './ReportWarehouseSection';
import { ReportOLAPSection } from './ReportOLAPSection';
import { ReportAISection } from './ReportAISection';

interface ReportPreviewProps {
  config: ReportConfig;
  filterContext: ReportFilterContext;
  kpis: ExecutiveKPI[];
  trends: TrendAnalysisItem[];
  regions: RegionalPerformanceItem[];
  categories: CategoryPerformanceItem[];
  topProducts: ProductRankingItem[];
  bottomProducts: ProductRankingItem[];
  segments: CustomerSegmentItem[];
  anomalies: DetectedAnomaly[];
  qualitySummary: ReportDataQualitySummary;
  starSchema: StarSchema | null;
  olapResult: OLAPResult | null;
  aiSummary: AIExecutiveSummary | null;
  aiFindings: AIKeyFinding[];
  aiRecommendations: AIBusinessRecommendation[];
  isAIConfigured: boolean;
  className?: string;
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({
  config,
  filterContext,
  kpis,
  trends,
  regions,
  categories,
  topProducts,
  bottomProducts,
  segments,
  anomalies,
  qualitySummary,
  starSchema,
  olapResult,
  aiSummary,
  aiFindings,
  aiRecommendations,
  isAIConfigured,
  className = ''
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 print:border-none print:shadow-none print:p-0 ${className}`}>
      {/* 1. REPORT HEADER & FORMAL COVER BLOCK (Requirement 14 & 20) */}
      <header className="border-b-2 border-slate-900 pb-6 dark:border-slate-100">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              {config.organization} · Formal BI Report
            </span>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              {config.title}
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">
              {config.subtitle}
            </p>
          </div>

          <div className="text-right text-xs font-mono text-slate-500 space-y-1">
            <div className="flex items-center justify-end gap-1.5 font-bold text-slate-900 dark:text-slate-100">
              <Calendar className="h-3.5 w-3.5 text-indigo-500" />
              <span>{currentDate}</span>
            </div>
            <div>Author: {config.author}</div>
            <div>Template: {config.template.toUpperCase()}</div>
          </div>
        </div>
      </header>

      <div className="mt-6 space-y-8">
        {/* 2. ACTIVE FILTER CONTEXT (Requirement 4) */}
        <section aria-label="Filter Scope">
          <ReportFilterBanner filterContext={filterContext} />
        </section>

        {/* 3. AI BUSINESS INSIGHTS (Requirement 13) */}
        {config.includeAIInsights && (
          <section aria-label="AI Executive Summary">
            <ReportAISection
              summary={aiSummary}
              findings={aiFindings}
              recommendations={aiRecommendations}
              isConfigured={isAIConfigured}
            />
          </section>
        )}

        {/* 4. KPI SUMMARY (Requirement 5) */}
        {kpis.length > 0 && (
          <section aria-label="KPI Overview">
            <ReportKPISection kpis={kpis} />
          </section>
        )}

        {/* 5. VISUAL CHARTS (Requirement 6) */}
        {(config.template === 'executive' || config.template === 'bi_analysis') && (
          <section aria-label="Performance Charts">
            <ReportChartSection
              trends={trends}
              regions={regions}
              categories={categories}
              segments={segments}
            />
          </section>
        )}

        {/* 6. MULTI-DIMENSIONAL TABLES (Requirement 7 & 8) */}
        {(config.template === 'executive' || config.template === 'bi_analysis') && (
          <section aria-label="Performance Tables">
            <ReportTableSection
              regions={regions}
              categories={categories}
              topProducts={topProducts}
              bottomProducts={bottomProducts}
              segments={segments}
              topN={config.topN}
            />
          </section>
        )}

        {/* 7. ANOMALIES SECTION (Requirement 9) */}
        {config.includeAnomalies && anomalies.length > 0 && (
          <section aria-label="Statistical Anomalies">
            <ReportAnomalySection anomalies={anomalies} />
          </section>
        )}

        {/* 8. DATA QUALITY & GOVERNANCE (Requirement 10) */}
        {config.includeDataQuality && (
          <section aria-label="Data Quality and Governance">
            <ReportDataQualitySection summary={qualitySummary} />
          </section>
        )}

        {/* 9. DATA WAREHOUSE & STAR SCHEMA (Requirement 11) */}
        {config.includeWarehouse && starSchema && (
          <section aria-label="Data Warehouse Architecture">
            <ReportWarehouseSection schema={starSchema} />
          </section>
        )}

        {/* 10. OLAP ANALYSIS SECTION (Requirement 12) */}
        {config.includeOLAP && olapResult && (
          <section aria-label="OLAP Analysis">
            <ReportOLAPSection result={olapResult} />
          </section>
        )}

        {/* 11. FORMAL REPORT FOOTER */}
        <footer className="border-t-2 border-slate-200 pt-4 text-[11px] text-slate-500 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div>
            <strong>Interactive Visual Analytics Dashboard</strong> · Business Intelligence & Data Warehouse Engine
          </div>
          <div className="font-mono">
            Document ID: {config.id} · Page 1 of 1 (Consolidated Summary)
          </div>
        </footer>
      </div>
    </div>
  );
};
