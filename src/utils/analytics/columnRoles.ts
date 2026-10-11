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
  // Match priority names based on common business variations
  const preferred = [
    'sales', 'sales_amount', 'revenue', 'total_sales', 'net_sales', 'amount',
    'gross_revenue', 'total_revenue', 'gross_sales', 'turnover', 'line_total',
    'total_amount', 'transaction_amount', 'invoice_amount', 'order_value', 'value', 'price'
  ];
  for (const p of preferred) {
    const match = candidates.find(c => {
      const lower = c.name.toLowerCase().replace(/[\s\-_.]+/g, '_');
      return lower === p || lower.includes(p);
    });
    if (match) return match.name;
  }
  return candidates[0]?.name;
}

/**
 * Finds the primary profit metric column
 */
export function findPrimaryProfitColumn(classifications: ColumnClassification[]): string | undefined {
  const candidates = classifications.filter(c => c.isNumeric);
  const preferred = [
    'profit', 'gross_profit', 'net_profit', 'profit_amount', 'margin_amount',
    'operating_profit', 'earnings', 'net_income', 'gain'
  ];
  for (const p of preferred) {
    const match = candidates.find(c => {
      const lower = c.name.toLowerCase().replace(/[\s\-_.]+/g, '_');
      return lower === p || lower.includes(p);
    });
    if (match) return match.name;
  }
  return undefined;
}

/**
 * Finds the primary date column
 */
export function findPrimaryDateColumn(classifications: ColumnClassification[]): string | undefined {
  const candidates = classifications.filter(c => c.isDate);
  const preferred = [
    'order_date', 'transaction_date', 'sales_date', 'invoice_date', 'date',
    'event_date', 'timestamp', 'created_at', 'purchase_date', 'period_date', 'ship_date'
  ];
  for (const p of preferred) {
    const match = candidates.find(c => {
      const lower = c.name.toLowerCase().replace(/[\s\-_.]+/g, '_');
      return lower === p || lower.includes(p);
    });
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

  const regionMatch = dims.find(c => {
    const l = c.name.toLowerCase();
    return l.includes('country') || l.includes('state') || l.includes('city') || l.includes('region') || l.includes('territory') || l.includes('location') || l.includes('geography') || l.includes('theater');
  });

  const categoryMatch = dims.find(c => {
    const l = c.name.toLowerCase();
    return l.includes('category') || l.includes('product_category') || l.includes('segment') || l.includes('department') || l.includes('line') || l.includes('family');
  });

  const productMatch = dims.find(c => {
    const l = c.name.toLowerCase();
    return l.includes('product') || l.includes('product_id') || l.includes('product_name') || l.includes('item') || l.includes('item_name') || l.includes('sku') || l.includes('service');
  });

  const segmentMatch = dims.find(c => {
    const l = c.name.toLowerCase();
    return l.includes('segment') || l.includes('tier') || l.includes('cohort') || l.includes('customer_type') || l.includes('account_tier');
  });

  const customerMatch = dims.find(c => {
    const l = c.name.toLowerCase();
    return l.includes('customer') || l.includes('customer_id') || l.includes('customer_name') || l.includes('client') || l.includes('client_id') || l.includes('account') || l.includes('buyer');
  });

  return {
    regionColumn: regionMatch?.name,
    categoryColumn: categoryMatch?.name,
    productColumn: productMatch?.name,
    segmentColumn: segmentMatch?.name,
    customerColumn: customerMatch?.name
  };
}
