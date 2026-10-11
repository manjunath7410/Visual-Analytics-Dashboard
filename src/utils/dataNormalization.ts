import { Dataset, ColumnMetadata } from '../types/dataset';
import { ColumnMappingResult } from './intelligentColumnMapping';

export interface FactSalesRecord {
  fact_id: number;
  customer_key: number;
  product_key: number;
  geo_key: number;
  date_key: number;
  sales_amount: number;
  quantity: number;
  discount_rate: number;
  gross_profit: number;
  profit_margin: number;
  average_selling_value: number;
  [key: string]: any;
}

export interface DimCustomerRecord {
  customer_key: number;
  customer_id: string;
  customer_name: string;
  segment: string;
}

export interface DimProductRecord {
  product_key: number;
  product_id: string;
  product_name: string;
  category: string;
  sub_category?: string;
}

export interface DimGeographyRecord {
  geo_key: number;
  country: string;
  state: string;
  city: string;
  region: string;
}

export interface DimDateRecord {
  date_key: number;
  date: string;
  year: number;
  quarter: string;
  month: number;
  month_name: string;
}

export interface NormalizedAnalyticalModel {
  fact_sales: FactSalesRecord[];
  dim_customer: DimCustomerRecord[];
  dim_product: DimProductRecord[];
  dim_geography: DimGeographyRecord[];
  dim_date: DimDateRecord[];
  derivedFields: string[];
  missingFields: string[];
  fieldAvailability: {
    hasSales: boolean;
    hasProfit: boolean;
    hasQuantity: boolean;
    hasDiscount: boolean;
    hasCustomer: boolean;
    hasProduct: boolean;
    hasCategory: boolean;
    hasGeography: boolean;
    hasDate: boolean;
  };
}

/**
 * Normalizes any uploaded raw/typed dataset into the internal analytical schema:
 * Fact_Sales, Dim_Customer, Dim_Product, Dim_Geography, Dim_Date
 */
export function normalizeDatasetToModel(
  rows: Record<string, any>[],
  columns: ColumnMetadata[],
  mappings: ColumnMappingResult[]
): {
  normalizedRows: Record<string, any>[];
  model: NormalizedAnalyticalModel;
} {
  const mappingMap = new Map<string, string | null>();
  mappings.forEach(m => {
    mappingMap.set(m.conceptId, m.mappedColumn);
  });

  const salesCol = mappingMap.get('revenue');
  const profitCol = mappingMap.get('profit');
  const qtyCol = mappingMap.get('quantity');
  const discountCol = mappingMap.get('discount');
  const customerCol = mappingMap.get('customer');
  const productCol = mappingMap.get('product');
  const categoryCol = mappingMap.get('category');
  const geoCol = mappingMap.get('geography');
  const dateCol = mappingMap.get('date');

  const derivedFields: string[] = [];
  const missingFields: string[] = [];

  const hasSales = Boolean(salesCol);
  const hasProfit = Boolean(profitCol);
  const hasQuantity = Boolean(qtyCol);
  const hasDiscount = Boolean(discountCol);
  const hasCustomer = Boolean(customerCol);
  const hasProduct = Boolean(productCol);
  const hasCategory = Boolean(categoryCol);
  const hasGeography = Boolean(geoCol);
  const hasDate = Boolean(dateCol);

  if (!hasSales) missingFields.push('Revenue / Sales');
  if (!hasProfit) missingFields.push('Gross Profit');
  if (!hasQuantity) missingFields.push('Quantity Sold');
  if (!hasDiscount) missingFields.push('Discount Rate');
  if (!hasCustomer) missingFields.push('Customer Entity');
  if (!hasProduct) missingFields.push('Product / Item');
  if (!hasCategory) missingFields.push('Category / Segment');
  if (!hasGeography) missingFields.push('Geography / Region');
  if (!hasDate) missingFields.push('Transaction Date');

  if (hasSales && hasProfit) derivedFields.push('Profit Margin (%) = (Profit / Sales) * 100');
  if (hasSales && hasQuantity) derivedFields.push('Average Selling Value = Sales / Quantity');
  if (hasDate) derivedFields.push('Date Dimensions (Year, Quarter, Month, Month Name)');

  // Dimension building caches
  const customerMap = new Map<string, DimCustomerRecord>();
  const productMap = new Map<string, DimProductRecord>();
  const geoMap = new Map<string, DimGeographyRecord>();
  const dateMap = new Map<string, DimDateRecord>();

  let custCounter = 1;
  let prodCounter = 1;
  let geoCounter = 1;
  let dateCounter = 1;

  const factSalesList: FactSalesRecord[] = [];
  const normalizedRows: Record<string, any>[] = [];

  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  rows.forEach((row, idx) => {
    // 1. Customer Dim
    let custKey = 0;
    if (hasCustomer && customerCol && row[customerCol] !== null && row[customerCol] !== undefined) {
      const custVal = String(row[customerCol]).trim();
      if (!customerMap.has(custVal)) {
        customerMap.set(custVal, {
          customer_key: custCounter,
          customer_id: custVal,
          customer_name: custVal,
          segment: hasCategory && categoryCol && row[categoryCol] ? String(row[categoryCol]).trim() : 'Standard'
        });
        custCounter++;
      }
      custKey = customerMap.get(custVal)!.customer_key;
    }

    // 2. Product Dim
    let prodKey = 0;
    if (hasProduct && productCol && row[productCol] !== null && row[productCol] !== undefined) {
      const prodVal = String(row[productCol]).trim();
      if (!productMap.has(prodVal)) {
        productMap.set(prodVal, {
          product_key: prodCounter,
          product_id: prodVal,
          product_name: prodVal,
          category: hasCategory && categoryCol && row[categoryCol] ? String(row[categoryCol]).trim() : 'General',
        });
        prodCounter++;
      }
      prodKey = productMap.get(prodVal)!.product_key;
    }

    // 3. Geography Dim
    let geoKey = 0;
    if (hasGeography && geoCol && row[geoCol] !== null && row[geoCol] !== undefined) {
      const geoVal = String(row[geoCol]).trim();
      if (!geoMap.has(geoVal)) {
        geoMap.set(geoVal, {
          geo_key: geoCounter,
          country: geoVal,
          state: geoVal,
          city: geoVal,
          region: geoVal
        });
        geoCounter++;
      }
      geoKey = geoMap.get(geoVal)!.geo_key;
    }

    // 4. Date Dim
    let dateKey = 0;
    let dYear = 2026;
    let dQuarter = 'Q1';
    let dMonth = 1;
    let dMonthName = 'January';
    let cleanDateStr = '2026-01-01';

    if (hasDate && dateCol && row[dateCol]) {
      const rawD = String(row[dateCol]).trim();
      const parsedDate = new Date(rawD);
      if (!isNaN(parsedDate.getTime())) {
        cleanDateStr = parsedDate.toISOString().split('T')[0];
        dYear = parsedDate.getFullYear();
        dMonth = parsedDate.getMonth() + 1;
        dMonthName = MONTH_NAMES[parsedDate.getMonth()] || 'January';
        dQuarter = `Q${Math.floor(parsedDate.getMonth() / 3) + 1}`;

        if (!dateMap.has(cleanDateStr)) {
          const formattedKey = Number(`${dYear}${String(dMonth).padStart(2, '0')}${String(parsedDate.getDate()).padStart(2, '0')}`);
          dateMap.set(cleanDateStr, {
            date_key: formattedKey,
            date: cleanDateStr,
            year: dYear,
            quarter: dQuarter,
            month: dMonth,
            month_name: dMonthName
          });
        }
        dateKey = dateMap.get(cleanDateStr)!.date_key;
      }
    }

    // Metrics & derivations
    const rawSales = hasSales && salesCol ? Number(row[salesCol]) : 0;
    const sales_amount = !isNaN(rawSales) && isFinite(rawSales) ? rawSales : 0;

    const rawProfit = hasProfit && profitCol ? Number(row[profitCol]) : 0;
    const gross_profit = !isNaN(rawProfit) && isFinite(rawProfit) ? rawProfit : 0;

    const rawQty = hasQuantity && qtyCol ? Number(row[qtyCol]) : 1;
    const quantity = !isNaN(rawQty) && isFinite(rawQty) ? Math.max(1, Math.round(rawQty)) : 1;

    const rawDisc = hasDiscount && discountCol ? Number(row[discountCol]) : 0;
    const discount_rate = !isNaN(rawDisc) && isFinite(rawDisc) ? rawDisc : 0;

    // Derived fields
    const profit_margin = sales_amount !== 0 ? Number(((gross_profit / sales_amount) * 100).toFixed(2)) : 0;
    const average_selling_value = quantity > 0 ? Number((sales_amount / quantity).toFixed(2)) : sales_amount;

    const factRecord: FactSalesRecord = {
      fact_id: idx + 1,
      customer_key: custKey,
      product_key: prodKey,
      geo_key: geoKey,
      date_key: dateKey,
      sales_amount,
      quantity,
      discount_rate,
      gross_profit,
      profit_margin,
      average_selling_value
    };

    factSalesList.push(factRecord);

    // Merge normalized and derived fields onto row for downstream transparency
    const normalizedRow: Record<string, any> = {
      ...row,
      __rowIndex: idx + 1,
      _normalized_sales: sales_amount,
      _normalized_profit: gross_profit,
      _normalized_margin: profit_margin,
      _normalized_quantity: quantity,
      _derived_aov: average_selling_value,
      _derived_year: hasDate ? dYear : undefined,
      _derived_quarter: hasDate ? dQuarter : undefined,
      _derived_month: hasDate ? dMonthName : undefined,
    };

    // If the original dataset didn't have explicit standardized column names, alias them
    if (hasSales && salesCol && !row['Sales']) normalizedRow['Sales'] = sales_amount;
    if (hasProfit && profitCol && !row['Profit']) normalizedRow['Profit'] = gross_profit;
    if (hasQuantity && qtyCol && !row['Quantity']) normalizedRow['Quantity'] = quantity;
    if (hasCustomer && customerCol && !row['Customer']) normalizedRow['Customer'] = row[customerCol];
    if (hasProduct && productCol && !row['Product']) normalizedRow['Product'] = row[productCol];
    if (hasCategory && categoryCol && !row['Category']) normalizedRow['Category'] = row[categoryCol];
    if (hasGeography && geoCol && !row['Region']) normalizedRow['Region'] = row[geoCol];
    if (hasDate && dateCol && !row['Order Date']) normalizedRow['Order Date'] = cleanDateStr;

    normalizedRows.push(normalizedRow);
  });

  return {
    normalizedRows,
    model: {
      fact_sales: factSalesList,
      dim_customer: Array.from(customerMap.values()),
      dim_product: Array.from(productMap.values()),
      dim_geography: Array.from(geoMap.values()),
      dim_date: Array.from(dateMap.values()),
      derivedFields,
      missingFields,
      fieldAvailability: {
        hasSales,
        hasProfit,
        hasQuantity,
        hasDiscount,
        hasCustomer,
        hasProduct,
        hasCategory,
        hasGeography,
        hasDate
      }
    }
  };
}
