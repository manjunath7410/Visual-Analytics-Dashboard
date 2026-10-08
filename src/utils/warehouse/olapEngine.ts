import { StarSchema, OLAPQuery, OLAPResult, OLAPPivotMatrix } from '../../types/dataWarehouse';
import { BIEngine } from '../analytics/biEngine';

export class OLAPEngine {
  /**
   * Execute OLAP operation on Star Schema
   */
  public static executeQuery(schema: StarSchema, query: OLAPQuery): OLAPResult {
    switch (query.operation) {
      case 'rollup':
        return this.executeRollUp(schema, query);
      case 'drilldown':
        return this.executeDrillDown(schema, query);
      case 'slice':
        return this.executeSlice(schema, query);
      case 'dice':
        return this.executeDice(schema, query);
      case 'pivot':
        return this.executePivot(schema, query);
      default:
        return this.executeRollUp(schema, query);
    }
  }

  /**
   * 1. ROLL-UP: Aggregate from granular level to higher hierarchical level
   */
  private static executeRollUp(schema: StarSchema, query: OLAPQuery): OLAPResult {
    const timeLevel = query.timeLevel || 'quarter';
    const dateDim = schema.dimensions.find(d => d.name === 'Dim_Date');

    if (query.dimension === 'Time' && dateDim) {
      // Roll-up time hierarchy: Day -> Month -> Quarter -> Year
      const groupField = timeLevel === 'year' ? 'Year' : (timeLevel === 'quarter' ? 'Quarter' : 'Month_Name');
      const dateMap = new Map<number, any>();
      dateDim.rows.forEach(r => dateMap.set(r.Date_Key, r));

      const groups = new Map<string, number[]>();
      schema.factTable.rows.forEach(fact => {
        const dateObj = dateMap.get(fact.Date_Key);
        const key = dateObj ? String(dateObj[groupField]) : 'Unknown';
        const val = Number(fact[query.metric]) || 0;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(val);
      });

      const rows: Record<string, any>[] = [];
      let totalAgg = 0;
      groups.forEach((vals, groupVal) => {
        const aggVal = this.aggregateValues(vals, query.aggregation);
        totalAgg += aggVal;
        rows.push({
          [groupField]: groupVal,
          RecordCount: vals.length,
          [`${query.aggregation}_${query.metric}`]: Number(aggVal.toFixed(2)),
          FormattedValue: query.metric.toLowerCase().includes('profit') || query.metric.toLowerCase().includes('sales')
            ? BIEngine.formatCurrency(aggVal)
            : BIEngine.formatNumber(aggVal)
        });
      });

      return {
        title: `Roll-Up: Time Aggregation by ${groupField} (${query.aggregation} of ${query.metric})`,
        operation: 'rollup',
        headers: [groupField, 'RecordCount', `${query.aggregation}_${query.metric}`, 'FormattedValue'],
        rows,
        summaryMetrics: {
          totalRecords: schema.factTable.rowCount,
          aggregatedTotal: totalAgg,
          formattedTotal: BIEngine.formatCurrency(totalAgg)
        }
      };
    }

    // Default Roll-Up: Product -> Category
    const catDim = schema.dimensions.find(d => d.name === 'Dim_Category');
    const catMap = new Map<number, string>();
    if (catDim) {
      catDim.rows.forEach(r => catMap.set(r.Category_Key, r.Category_Name));
    }

    const groups = new Map<string, number[]>();
    schema.factTable.rows.forEach(fact => {
      const catName = catMap.get(fact.Category_Key) || 'General Portfolio';
      const val = Number(fact[query.metric]) || 0;
      if (!groups.has(catName)) groups.set(catName, []);
      groups.get(catName)!.push(val);
    });

    const rows: Record<string, any>[] = [];
    let totalAgg = 0;
    groups.forEach((vals, category) => {
      const aggVal = this.aggregateValues(vals, query.aggregation);
      totalAgg += aggVal;
      rows.push({
        Category: category,
        TransactionCount: vals.length,
        [`${query.aggregation}_${query.metric}`]: Number(aggVal.toFixed(2)),
        FormattedValue: BIEngine.formatCurrency(aggVal)
      });
    });

    return {
      title: `Roll-Up: Product Level to Category Level (${query.aggregation} of ${query.metric})`,
      operation: 'rollup',
      headers: ['Category', 'TransactionCount', `${query.aggregation}_${query.metric}`, 'FormattedValue'],
      rows,
      summaryMetrics: {
        totalRecords: schema.factTable.rowCount,
        aggregatedTotal: totalAgg,
        formattedTotal: BIEngine.formatCurrency(totalAgg)
      }
    };
  }

  /**
   * 2. DRILL-DOWN: De-aggregate to more granular level
   */
  private static executeDrillDown(schema: StarSchema, query: OLAPQuery): OLAPResult {
    const prodDim = schema.dimensions.find(d => d.name === 'Dim_Product');
    const catDim = schema.dimensions.find(d => d.name === 'Dim_Category');

    const prodMap = new Map<number, any>();
    if (prodDim) {
      prodDim.rows.forEach(r => prodMap.set(r.Product_Key, r));
    }

    const catMap = new Map<number, string>();
    if (catDim) {
      catDim.rows.forEach(r => catMap.set(r.Category_Key, r.Category_Name));
    }

    // Group by Category AND Product
    const groups = new Map<string, { category: string; product: string; vals: number[] }>();
    schema.factTable.rows.forEach(fact => {
      const prodObj = prodMap.get(fact.Product_Key);
      const catName = catMap.get(fact.Category_Key) || prodObj?.Category || 'General';
      const prodName = prodObj?.Product_Name || `Product #${fact.Product_Key}`;
      const compositeKey = `${catName}__${prodName}`;

      const val = Number(fact[query.metric]) || 0;
      if (!groups.has(compositeKey)) {
        groups.set(compositeKey, { category: catName, product: prodName, vals: [] });
      }
      groups.get(compositeKey)!.vals.push(val);
    });

    const rows: Record<string, any>[] = [];
    let totalAgg = 0;
    groups.forEach(g => {
      const aggVal = this.aggregateValues(g.vals, query.aggregation);
      totalAgg += aggVal;
      rows.push({
        Category: g.category,
        Product: g.product,
        TransactionCount: g.vals.length,
        [`${query.aggregation}_${query.metric}`]: Number(aggVal.toFixed(2)),
        FormattedValue: BIEngine.formatCurrency(aggVal)
      });
    });

    rows.sort((a, b) => b[`${query.aggregation}_${query.metric}`] - a[`${query.aggregation}_${query.metric}`]);

    return {
      title: `Drill-Down: Category Level to Product Level (${query.aggregation} of ${query.metric})`,
      operation: 'drilldown',
      headers: ['Category', 'Product', 'TransactionCount', `${query.aggregation}_${query.metric}`, 'FormattedValue'],
      rows: rows.slice(0, 50), // top 50 items for responsive view
      summaryMetrics: {
        totalRecords: schema.factTable.rowCount,
        aggregatedTotal: totalAgg,
        formattedTotal: BIEngine.formatCurrency(totalAgg)
      }
    };
  }

  /**
   * 3. SLICE: Filter by one single dimension value
   */
  private static executeSlice(schema: StarSchema, query: OLAPQuery): OLAPResult {
    const slice = query.sliceCondition || { dimension: 'Region', value: 'North America' };
    const regDim = schema.dimensions.find(d => d.name === 'Dim_Region');
    let targetKey: number | null = null;

    if (regDim && slice.dimension === 'Region') {
      const match = regDim.rows.find(r => String(r.Region_Name).toLowerCase() === slice.value.toLowerCase());
      if (match) targetKey = match.Region_Key;
    }

    // Filter facts
    const filteredFacts = schema.factTable.rows.filter(f => {
      if (targetKey !== null) return f.Region_Key === targetKey;
      return true;
    });

    // Group by category to show the slice view
    const catDim = schema.dimensions.find(d => d.name === 'Dim_Category');
    const catMap = new Map<number, string>();
    if (catDim) catDim.rows.forEach(r => catMap.set(r.Category_Key, r.Category_Name));

    const groups = new Map<string, number[]>();
    filteredFacts.forEach(fact => {
      const cat = catMap.get(fact.Category_Key) || 'General';
      const val = Number(fact[query.metric]) || 0;
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat)!.push(val);
    });

    const rows: Record<string, any>[] = [];
    let totalAgg = 0;
    groups.forEach((vals, cat) => {
      const aggVal = this.aggregateValues(vals, query.aggregation);
      totalAgg += aggVal;
      rows.push({
        SliceCondition: `${slice.dimension} = ${slice.value}`,
        Category: cat,
        FactRecords: vals.length,
        [`${query.aggregation}_${query.metric}`]: Number(aggVal.toFixed(2)),
        FormattedValue: BIEngine.formatCurrency(aggVal)
      });
    });

    return {
      title: `Slice: Single Dimension Cut (${slice.dimension} = "${slice.value}")`,
      operation: 'slice',
      headers: ['SliceCondition', 'Category', 'FactRecords', `${query.aggregation}_${query.metric}`, 'FormattedValue'],
      rows,
      summaryMetrics: {
        totalRecords: filteredFacts.length,
        aggregatedTotal: totalAgg,
        formattedTotal: BIEngine.formatCurrency(totalAgg)
      }
    };
  }

  /**
   * 4. DICE: Multi-dimensional sub-cube filtering
   */
  private static executeDice(schema: StarSchema, query: OLAPQuery): OLAPResult {
    const diceConditions = query.diceConditions || [
      { dimension: 'Region', value: 'North America' },
      { dimension: 'Category', value: 'Technology' }
    ];

    const regDim = schema.dimensions.find(d => d.name === 'Dim_Region');
    const catDim = schema.dimensions.find(d => d.name === 'Dim_Category');
    const prodDim = schema.dimensions.find(d => d.name === 'Dim_Product');

    const regCond = diceConditions.find(c => c.dimension === 'Region');
    const catCond = diceConditions.find(c => c.dimension === 'Category');

    let regKey: number | null = null;
    let catKey: number | null = null;

    if (regDim && regCond) {
      const m = regDim.rows.find(r => String(r.Region_Name).toLowerCase() === regCond.value.toLowerCase());
      if (m) regKey = m.Region_Key;
    }

    if (catDim && catCond) {
      const m = catDim.rows.find(r => String(r.Category_Name).toLowerCase() === catCond.value.toLowerCase());
      if (m) catKey = m.Category_Key;
    }

    const prodMap = new Map<number, string>();
    if (prodDim) prodDim.rows.forEach(r => prodMap.set(r.Product_Key, r.Product_Name));

    const dicedFacts = schema.factTable.rows.filter(f => {
      let pass = true;
      if (regKey !== null && f.Region_Key !== regKey) pass = false;
      if (catKey !== null && f.Category_Key !== catKey) pass = false;
      return pass;
    });

    // Group by product within diced sub-cube
    const groups = new Map<string, number[]>();
    dicedFacts.forEach(fact => {
      const prod = prodMap.get(fact.Product_Key) || `Product #${fact.Product_Key}`;
      const val = Number(fact[query.metric]) || 0;
      if (!groups.has(prod)) groups.set(prod, []);
      groups.get(prod)!.push(val);
    });

    const rows: Record<string, any>[] = [];
    let totalAgg = 0;
    const condLabel = diceConditions.map(c => `${c.dimension}=${c.value}`).join(' AND ');

    groups.forEach((vals, prod) => {
      const aggVal = this.aggregateValues(vals, query.aggregation);
      totalAgg += aggVal;
      rows.push({
        DiceFilter: condLabel,
        Product: prod,
        Transactions: vals.length,
        [`${query.aggregation}_${query.metric}`]: Number(aggVal.toFixed(2)),
        FormattedValue: BIEngine.formatCurrency(aggVal)
      });
    });

    rows.sort((a, b) => b[`${query.aggregation}_${query.metric}`] - a[`${query.aggregation}_${query.metric}`]);

    return {
      title: `Dice: Multi-Dimensional Sub-Cube (${condLabel})`,
      operation: 'dice',
      headers: ['DiceFilter', 'Product', 'Transactions', `${query.aggregation}_${query.metric}`, 'FormattedValue'],
      rows: rows.slice(0, 50),
      summaryMetrics: {
        totalRecords: dicedFacts.length,
        aggregatedTotal: totalAgg,
        formattedTotal: BIEngine.formatCurrency(totalAgg)
      }
    };
  }

  /**
   * 5. PIVOT: 2D Cross-Tabulation Analytical Matrix
   */
  private static executePivot(schema: StarSchema, query: OLAPQuery): OLAPResult {
    const rowDimName = query.dimension || 'Region';
    const colDimName = query.secondaryDimension || 'Category';

    const regDim = schema.dimensions.find(d => d.name === 'Dim_Region');
    const catDim = schema.dimensions.find(d => d.name === 'Dim_Category');

    const regMap = new Map<number, string>();
    if (regDim) regDim.rows.forEach(r => regMap.set(r.Region_Key, r.Region_Name));

    const catMap = new Map<number, string>();
    if (catDim) catDim.rows.forEach(r => catMap.set(r.Category_Key, r.Category_Name));

    const uniqueCols = new Set<string>();
    const pivotData = new Map<string, Map<string, number[]>>();

    schema.factTable.rows.forEach(fact => {
      const rowVal = regMap.get(fact.Region_Key) || 'Other Region';
      const colVal = catMap.get(fact.Category_Key) || 'Other Category';
      const val = Number(fact[query.metric]) || 0;

      uniqueCols.add(colVal);

      if (!pivotData.has(rowVal)) pivotData.set(rowVal, new Map());
      const rowSub = pivotData.get(rowVal)!;
      if (!rowSub.has(colVal)) rowSub.set(colVal, []);
      rowSub.get(colVal)!.push(val);
    });

    const colHeaders = Array.from(uniqueCols).sort();
    const matrix: Array<{ rowValue: string; cols: Record<string, number>; rowTotal: number }> = [];
    const flatRows: Record<string, any>[] = [];
    let grandTotal = 0;

    pivotData.forEach((rowSub, rowVal) => {
      const colMap: Record<string, number> = {};
      let rowTotal = 0;

      const flatRow: Record<string, any> = { [rowDimName]: rowVal };

      colHeaders.forEach(colHeader => {
        const vals = rowSub.get(colHeader) || [];
        const agg = vals.length > 0 ? this.aggregateValues(vals, query.aggregation) : 0;
        colMap[colHeader] = Number(agg.toFixed(2));
        rowTotal += agg;
        flatRow[colHeader] = BIEngine.formatCurrency(agg);
      });

      grandTotal += rowTotal;
      matrix.push({
        rowValue: rowVal,
        cols: colMap,
        rowTotal: Number(rowTotal.toFixed(2))
      });

      flatRow['Row_Total'] = BIEngine.formatCurrency(rowTotal);
      flatRows.push(flatRow);
    });

    const pivotMatrix: OLAPPivotMatrix = {
      rowDimension: rowDimName,
      colDimension: colDimName,
      colHeaders,
      matrix,
      grandTotal: Number(grandTotal.toFixed(2))
    };

    return {
      title: `Pivot: 2D Cross-Tabulation Matrix (${rowDimName} × ${colDimName} for ${query.aggregation} of ${query.metric})`,
      operation: 'pivot',
      headers: [rowDimName, ...colHeaders, 'Row_Total'],
      rows: flatRows,
      pivotData: pivotMatrix,
      summaryMetrics: {
        totalRecords: schema.factTable.rowCount,
        aggregatedTotal: grandTotal,
        formattedTotal: BIEngine.formatCurrency(grandTotal)
      }
    };
  }

  private static aggregateValues(vals: number[], agg: 'SUM' | 'COUNT' | 'AVG' | 'MIN' | 'MAX'): number {
    if (vals.length === 0) return 0;
    if (agg === 'COUNT') return vals.length;
    if (agg === 'MIN') return Math.min(...vals);
    if (agg === 'MAX') return Math.max(...vals);
    const sum = vals.reduce((a, b) => a + b, 0);
    if (agg === 'AVG') return sum / vals.length;
    return sum;
  }
}
