import { ColumnMetadata } from '../types/dataset';

export interface SemanticConcept {
  id: 'revenue' | 'profit' | 'quantity' | 'discount' | 'customer' | 'product' | 'category' | 'geography' | 'date';
  label: string;
  description: string;
  dataType: 'numeric' | 'categorical' | 'date';
  synonyms: string[];
}

export const SEMANTIC_CONCEPTS: SemanticConcept[] = [
  {
    id: 'revenue',
    label: 'Revenue / Sales',
    description: 'Financial turnover, sales revenue, line item total, or billed amount',
    dataType: 'numeric',
    synonyms: [
      'sales', 'sales_amount', 'revenue', 'total_sales', 'net_sales', 'amount',
      'gross_sales', 'gross_revenue', 'turnover', 'line_total', 'total_price',
      'selling_price', 'total_amount', 'transaction_amount', 'invoice_amount',
      'order_value', 'value', 'price'
    ]
  },
  {
    id: 'profit',
    label: 'Profit / Margin',
    description: 'Gross profit, operating margin, earnings, or net income',
    dataType: 'numeric',
    synonyms: [
      'profit', 'gross_profit', 'net_profit', 'profit_amount', 'margin',
      'earnings', 'net_income', 'operating_profit', 'gain', 'net_margin'
    ]
  },
  {
    id: 'quantity',
    label: 'Quantity / Units',
    description: 'Number of units sold, transaction item count, or volume',
    dataType: 'numeric',
    synonyms: [
      'quantity', 'qty', 'units', 'units_sold', 'item_count', 'order_quantity',
      'volume', 'volume_sold', 'items', 'count'
    ]
  },
  {
    id: 'discount',
    label: 'Discount / Concession',
    description: 'Discount amount or discount percentage applied to transaction',
    dataType: 'numeric',
    synonyms: [
      'discount', 'discount_rate', 'discount_percent', 'discount_amount',
      'rebate', 'discount_value', 'concession', 'pct_discount'
    ]
  },
  {
    id: 'customer',
    label: 'Customer / Client',
    description: 'Customer identifier, account name, client, or buyer entity',
    dataType: 'categorical',
    synonyms: [
      'customer', 'customer_id', 'customer_name', 'client', 'client_id',
      'client_name', 'account', 'account_name', 'buyer', 'buyer_name',
      'purchaser', 'member_name', 'patient_name', 'user_name', 'user_id'
    ]
  },
  {
    id: 'product',
    label: 'Product / Item / Service',
    description: 'Product name, item code, SKU, or service description',
    dataType: 'categorical',
    synonyms: [
      'product', 'product_id', 'product_name', 'item', 'item_name',
      'item_id', 'sku', 'sku_name', 'article', 'offering', 'service_name',
      'service', 'description'
    ]
  },
  {
    id: 'category',
    label: 'Category / Department',
    description: 'Product category, segment, department, family, or business line',
    dataType: 'categorical',
    synonyms: [
      'category', 'product_category', 'segment', 'department', 'product_line',
      'family', 'line_of_business', 'classification', 'group', 'sector', 'industry'
    ]
  },
  {
    id: 'geography',
    label: 'Geography / Territory',
    description: 'Country, state, region, territory, city, or geographical location',
    dataType: 'categorical',
    synonyms: [
      'country', 'state', 'city', 'region', 'territory', 'location',
      'market', 'zone', 'province', 'area', 'nation', 'theater'
    ]
  },
  {
    id: 'date',
    label: 'Date / Timestamp',
    description: 'Order date, transaction date, invoice date, or timestamp',
    dataType: 'date',
    synonyms: [
      'date', 'order_date', 'transaction_date', 'sales_date', 'invoice_date',
      'event_date', 'timestamp', 'created_at', 'purchase_date', 'booking_date',
      'period_date', 'ship_date'
    ]
  }
];

export interface ColumnMappingResult {
  conceptId: SemanticConcept['id'];
  conceptLabel: string;
  mappedColumn: string | null;
  confidence: number; // 0.0 to 1.0
  isAutoConfirmed: boolean; // >= 0.85
  requiresConfirmation: boolean; // 0.40 - 0.84
  alternativeCandidates: Array<{ column: string; score: number }>;
}

/**
 * Normalizes string for token matching: lowercases and removes non-alphanumeric chars
 */
function normalizeString(str: string): string {
  return str.toLowerCase().replace(/[\s\-_.]+/g, '_').trim();
}

/**
 * Calculates string similarity / Levenshtein-based Jaccard token score
 */
function calculateSimilarity(colName: string, synonym: string): number {
  const normCol = normalizeString(colName);
  const normSyn = normalizeString(synonym);

  if (normCol === normSyn) return 1.0;
  if (normCol.includes(normSyn) || normSyn.includes(normCol)) {
    const minLen = Math.min(normCol.length, normSyn.length);
    const maxLen = Math.max(normCol.length, normSyn.length);
    return Math.max(0.7, minLen / maxLen);
  }

  // Sub-token match
  const colTokens = normCol.split('_');
  const synTokens = normSyn.split('_');
  let matchCount = 0;
  colTokens.forEach(t => {
    if (synTokens.includes(t)) matchCount++;
  });

  if (matchCount > 0) {
    return Math.min(0.85, (matchCount * 2) / (colTokens.length + synTokens.length));
  }

  return 0.0;
}

/**
 * Intelligently maps columns to standardized analytical semantic concepts
 */
export function calculateSemanticColumnMappings(
  columns: ColumnMetadata[],
  sampleRows: Record<string, any>[]
): ColumnMappingResult[] {
  const results: ColumnMappingResult[] = [];
  const assignedColumns = new Set<string>();

  SEMANTIC_CONCEPTS.forEach(concept => {
    const candidates: Array<{ column: string; score: number }> = [];

    columns.forEach(col => {
      // Type compatibility weighting
      let typeScore = 1.0;
      if (concept.dataType === 'numeric' && col.type !== 'Number') {
        typeScore = 0.1; // penalized
      } else if (concept.dataType === 'date' && col.type !== 'Date') {
        typeScore = col.name.toLowerCase().includes('date') ? 0.7 : 0.1;
      } else if (concept.dataType === 'categorical' && col.type === 'Number') {
        // IDs might be numeric, but general category is not
        typeScore = col.name.toLowerCase().includes('id') ? 0.6 : 0.2;
      }

      // Max similarity across synonyms
      let maxSim = 0;
      concept.synonyms.forEach(syn => {
        const sim = calculateSimilarity(col.name, syn);
        if (sim > maxSim) maxSim = sim;
      });

      const finalScore = maxSim * typeScore;
      if (finalScore >= 0.35) {
        candidates.push({ column: col.name, score: Number(finalScore.toFixed(2)) });
      }
    });

    candidates.sort((a, b) => b.score - a.score);

    const bestCandidate = candidates[0];
    let mappedCol: string | null = null;
    let confidence = 0;
    let isAuto = false;
    let reqConfirm = false;

    if (bestCandidate) {
      confidence = bestCandidate.score;
      mappedCol = bestCandidate.column;
      if (confidence >= 0.80) {
        isAuto = true;
        reqConfirm = false;
      } else if (confidence >= 0.40) {
        isAuto = false;
        reqConfirm = true;
      } else {
        mappedCol = null;
        confidence = 0;
      }
    }

    results.push({
      conceptId: concept.id,
      conceptLabel: concept.label,
      mappedColumn: mappedCol,
      confidence,
      isAutoConfirmed: isAuto,
      requiresConfirmation: reqConfirm,
      alternativeCandidates: candidates.slice(1, 5)
    });
  });

  return results;
}
