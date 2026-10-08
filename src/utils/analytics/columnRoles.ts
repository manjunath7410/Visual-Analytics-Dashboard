import { ColumnMetadata, ColumnDataType } from '../../types/dataset';
import { ColumnRole, ColumnClassification } from '../../types/analytics';

/**
 * Classifies columns into functional business intelligence roles:
 * - Metric (Numeric, Currency, Percentage)
 * - Dimension (Categorical, Text, Boolean)
 * - Date
 * - Identifier
 */
export function classifyColumns(
  columns: ColumnMetadata[],
  sampleRows: Record<string, any>[]
): ColumnClassification[] {
  return columns.map((col) => {
    const nameLower = col.name.toLowerCase();
    let role: ColumnRole = 'Text';

    // 1. Check Date
    if (col.type === 'Date' || nameLower.includes('date') || nameLower.includes('timestamp') || nameLower.includes('year') || nameLower.includes('month') || nameLower.includes('quarter')) {
      if (col.type === 'Date' || nameLower.includes('date')) {
        role = 'Date';
      }
    }

    // 2. Check Identifier (e.g. ID, Key, Code, SKU, UUID)
    if (nameLower.endsWith('id') || nameLower === 'id' || nameLower.includes('key') || nameLower.includes('code') || nameLower.includes('uuid')) {
      role = 'Identifier';
    }

    // 3. Check Numeric Metrics (Sales, Profit, Revenue, Cost, Quantity, Discount, Price)
    if (col.type === 'Number' && role !== 'Identifier') {
      if (nameLower.includes('percent') || nameLower.includes('margin') || nameLower.includes('rate') || nameLower.includes('ratio') || nameLower.includes('discount')) {
        role = 'Percentage';
      } else if (nameLower.includes('sales') || nameLower.includes('revenue') || nameLower.includes('profit') || nameLower.includes('price') || nameLower.includes('cost') || nameLower.includes('amount') || nameLower.includes('fee')) {
        role = 'Currency';
      } else {
        role = 'Numeric Metric';
      }
    }

    // 4. Check Categorical Dimensions
    if (col.type === 'Category' && role !== 'Identifier' && role !== 'Date') {
      role = 'Categorical Dimension';
    }

    // 5. Check Boolean
    if (col.type === 'Boolean') {
      role = 'Boolean';
    }

    // If still text and low cardinality, treat as categorical dimension
    if (role === 'Text' && col.uniqueCount <= 30) {
      role = 'Categorical Dimension';
    }

    const isNumeric = role === 'Numeric Metric' || role === 'Currency' || role === 'Percentage';
    const isDate = role === 'Date';
    const isDimension = role === 'Categorical Dimension' || role === 'Text' || role === 'Identifier' || role === 'Boolean';

    return {
      name: col.name,
      role,
      isNumeric,
      isDate,
      isDimension
    };
  });
}

/**
 * Finds the primary revenue / sales metric column in a dataset
 */
export function findPrimarySalesColumn(classifications: ColumnClassification[]): string | undefined {
  const candidates = classifications.filter(c => c.isNumeric);
  // Match priority names
  const preferred = ['sales', 'revenue', 'gross_revenue', 'total_revenue', 'amount', 'turnover'];
  for (const p of preferred) {
    const match = candidates.find(c => c.name.toLowerCase() === p || c.name.toLowerCase().includes(p));
    if (match) return match.name;
  }
  return candidates[0]?.name;
}

/**
 * Finds the primary profit metric column
 */
export function findPrimaryProfitColumn(classifications: ColumnClassification[]): string | undefined {
  const candidates = classifications.filter(c => c.isNumeric);
  const preferred = ['profit', 'gross_profit', 'net_profit', 'margin_amount', 'earnings'];
  for (const p of preferred) {
    const match = candidates.find(c => c.name.toLowerCase() === p || c.name.toLowerCase().includes(p));
    if (match) return match.name;
  }
  return undefined;
}

/**
 * Finds the primary date column
 */
export function findPrimaryDateColumn(classifications: ColumnClassification[]): string | undefined {
  const candidates = classifications.filter(c => c.isDate);
  const preferred = ['order date', 'order_date', 'transaction date', 'date', 'invoice date', 'timestamp'];
  for (const p of preferred) {
    const match = candidates.find(c => c.name.toLowerCase() === p || c.name.toLowerCase().includes(p));
    if (match) return match.name;
  }
  return candidates[0]?.name;
}

/**
 * Finds the primary categorical dimensions for regional or category analysis
 */
export function findPrimaryDimensions(classifications: ColumnClassification[]): {
  regionColumn?: string;
  categoryColumn?: string;
  productColumn?: string;
  segmentColumn?: string;
  customerColumn?: string;
} {
  const dims = classifications.filter(c => c.isDimension && c.role !== 'Identifier');

  const regionMatch = dims.find(c => c.name.toLowerCase().includes('region') || c.name.toLowerCase().includes('geography') || c.name.toLowerCase().includes('country') || c.name.toLowerCase().includes('theater'));
  const categoryMatch = dims.find(c => c.name.toLowerCase().includes('category') || c.name.toLowerCase().includes('department') || c.name.toLowerCase().includes('line') || c.name.toLowerCase().includes('family'));
  const productMatch = dims.find(c => c.name.toLowerCase().includes('product') || c.name.toLowerCase().includes('item') || c.name.toLowerCase().includes('sku') || c.name.toLowerCase().includes('service'));
  const segmentMatch = dims.find(c => c.name.toLowerCase().includes('segment') || c.name.toLowerCase().includes('tier') || c.name.toLowerCase().includes('cohort') || c.name.toLowerCase().includes('customer type'));
  const customerMatch = dims.find(c => c.name.toLowerCase().includes('customer') || c.name.toLowerCase().includes('client') || c.name.toLowerCase().includes('account') || c.name.toLowerCase().includes('buyer'));

  return {
    regionColumn: regionMatch?.name,
    categoryColumn: categoryMatch?.name,
    productColumn: productMatch?.name,
    segmentColumn: segmentMatch?.name,
    customerColumn: customerMatch?.name
  };
}
