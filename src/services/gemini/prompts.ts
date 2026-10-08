import { StructuredAnalyticsContext } from '../../types/gemini';

export const GEMINI_SYSTEM_INSTRUCTION = `You are an executive business intelligence analyst.
Use only the analytical context provided by the application.
Do not invent numbers, categories, dates, rankings, trends, or business facts.
Treat application-calculated metrics as the absolute source of truth.
Clearly distinguish observed facts from possible explanations.
When the supplied data is insufficient, explicitly state that the available data is insufficient.
Provide concise, actionable, and executive-ready business analysis.`;

export function buildExecutiveSummaryPrompt(context: StructuredAnalyticsContext): string {
  return `You are generating an Executive Business Summary.
Use only the supplied analytical values below. Do not create or estimate numerical values that are not present in the supplied context.

SUPPLIED ANALYTICS CONTEXT:
${JSON.stringify(context, null, 2)}

Provide a structured JSON response with the following format:
{
  "overallPerformance": "A concise executive statement of overall performance based strictly on revenue, profit, margin, and order metrics.",
  "strongestArea": "The top-performing category, region, or product supported by the data with exact numbers.",
  "weakestArea": "The lowest-performing or margin-strained area with supporting metrics.",
  "importantTrend": "The most significant observed chronological trend, stating direction and percentage change.",
  "importantAnomaly": "The most critical detected anomaly or 'None detected' if list is empty.",
  "recommendedAction": "A single highest-priority strategic action directly derived from the observed data."
}`;
}

export function buildKeyFindingsPrompt(context: StructuredAnalyticsContext): string {
  return `You are identifying Key Business Intelligence Findings.
Use only the supplied analytical values below. Do not create or estimate numerical values that are not present in the supplied context.

SUPPLIED ANALYTICS CONTEXT:
${JSON.stringify(context, null, 2)}

Identify between 3 to 5 critical findings. Provide a structured JSON response:
{
  "findings": [
    {
      "title": "Short title of the finding",
      "finding": "Clear statement of the analytical insight",
      "evidence": "Exact metric value and baseline from the data (e.g., Sales = $425,000, +14% YoY)",
      "importance": "high" // or "medium", "low"
    }
  ]
}`;
}

export function buildTrendExplanationPrompt(context: StructuredAnalyticsContext): string {
  return `You are explaining chronological business performance trends.
Use only the supplied analytical values below. Do not create or estimate numerical values that are not present in the supplied context.
IMPORTANT: You MUST clearly distinguish between observed facts and possible explanations. Do not assert causes unless evidence exists.

SUPPLIED ANALYTICS CONTEXT:
${JSON.stringify({
  trends: context.trends,
  kpis: context.kpis,
  activeFilters: context.activeFilters
}, null, 2)}

Provide a structured JSON response:
{
  "directionSummary": "Summary of overall trajectory (e.g., increasing, decreasing, or stable)",
  "significantChanges": [
    "List specific period-over-period delta shifts recorded in the data"
  ],
  "observedFacts": [
    "Direct facts directly observed in the time series"
  ],
  "possibleExplanations": [
    "Plausible business hypotheses (explicitly framed as possible explanations, not absolute facts)"
  ]
}`;
}

export function buildAnomalyExplanationPrompt(context: StructuredAnalyticsContext): string {
  return `You are explaining statistical anomalies detected via Tukey's IQR distribution rules.
Use only the supplied analytical values below. Do not create or estimate numerical values that are not present in the supplied context.
IMPORTANT: Clarify that an anomaly represents a legitimate out-of-band business event rather than a corrupted data error.

SUPPLIED ANOMALIES CONTEXT:
${JSON.stringify({
  anomalies: context.anomalies,
  kpis: context.kpis,
  activeFilters: context.activeFilters
}, null, 2)}

Provide a structured JSON response:
{
  "anomalyCount": ${context.anomalies.length},
  "summary": "Overall evaluation of statistical outliers in the dataset",
  "interpretations": [
    {
      "entity": "Period or Entity flagged",
      "observation": "Recorded value vs expected range and deviation percentage",
      "interpretation": "Contextual business meaning of the anomaly",
      "recommendedInvestigation": "Specific operational audit step for the user"
    }
  ]
}`;
}

export function buildRecommendationsPrompt(context: StructuredAnalyticsContext): string {
  return `You are formulating strategic business recommendations.
Use only the supplied analytical values below. Do not create or estimate numerical values that are not present in the supplied context.
Every recommendation must be actionable, tied to a specific analytical observation, and separate observations from proposals.

SUPPLIED ANALYTICS CONTEXT:
${JSON.stringify(context, null, 2)}

Provide a structured JSON response with 3 to 4 recommendations:
{
  "recommendations": [
    {
      "id": "rec-1",
      "title": "Concise recommendation title",
      "observation": "Specific data observation that prompted this action",
      "recommendation": "Concrete tactical or strategic initiative",
      "expectedImpact": "Anticipated financial or operational benefit",
      "priority": "high" // or "medium", "low"
    }
  ]
}`;
}

export function buildAskDataPrompt(question: string, context: StructuredAnalyticsContext): string {
  return `The user is asking a question about their business data.
User Question: "${question}"

RULES:
1. Answer strictly using the supplied analytical context below.
2. If the data does not contain the answer, state that the available data is insufficient.
3. Do not execute or propose any code, SQL queries, or destructive operations.
4. Keep the answer direct, executive-ready, and objective.

SUPPLIED ANALYTICS CONTEXT:
${JSON.stringify(context, null, 2)}

Provide a structured JSON response:
{
  "question": "${question.replace(/"/g, '\\"')}",
  "answer": "Clear, concise direct answer to the user's question with specific numbers.",
  "keyTakeaway": "One-sentence primary takeaway.",
  "supportingEvidence": [
    "Bullet points with specific numbers from the dataset"
  ],
  "suggestedFollowUps": [
    "Relevant follow-up question 1",
    "Relevant follow-up question 2"
  ]
}`;
}
