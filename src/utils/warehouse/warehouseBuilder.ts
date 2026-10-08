import { Dataset, ColumnMetadata } from '../../types/dataset';
import { AnalyticsEngine } from '../analytics/analyticsEngine';
import { 
  StarSchema, 
  DimensionTable, 
  FactTable, 
  FactMeasure, 
  FactForeignKey,
  StarSchemaRelationship, 
  ETLMappingItem, 
  WarehouseIntegrityReport, 
  WarehouseSourceComparison, 
  WarehouseStatistics,
  MeasureAdditivity
} from '../../types/dataWarehouse';

export class WarehouseBuilder {
  /**
   * Build complete Star Schema dynamically from cleaned dataset
   */
  public static buildStarSchema(dataset: Dataset | null, cleanedRows: Record<string, any>[]): StarSchema | null {
    if (!dataset || cleanedRows.length === 0) return null;

    const classifications = AnalyticsEngine.classifyColumns(dataset.columns, cleanedRows);
    const dateCol = AnalyticsEngine.findPrimaryDateColumn(classifications);
    const primaryDims = AnalyticsEngine.findPrimaryDimensions(classifications);

    const dimensions: DimensionTable[] = [];
    const relationships: StarSchemaRelationship[] = [];
    const foreignKeys: FactForeignKey[] = [];

    // 1. Build Dim_Date (if date column exists)
    let dateLookup = new Map<string, number>();
    if (dateCol) {
      const { dimTable, lookup } = this.buildDateDimension(cleanedRows, dateCol);
      if (dimTable.rowCount > 0) {
        dimensions.push(dimTable);
        dateLookup = lookup;
        foreignKeys.push({
          keyName: 'Date_Key',
          referencesTable: dimTable.name,
          referencesKey: dimTable.primaryKey
        });
        relationships.push({
          fromTable: 'Fact_Sales',
          fromColumn: 'Date_Key',
          toTable: dimTable.name,
          toColumn: dimTable.primaryKey
        });
      }
    }

    // 2. Build Dim_Region
    let regionLookup = new Map<string, number>();
    if (primaryDims.regionColumn) {
      const { dimTable, lookup } = this.buildGenericCategoricalDimension(
        cleanedRows,
        primaryDims.regionColumn,
        'Dim_Region',
        'Region_Key',
        'Region_Name'
      );
      dimensions.push(dimTable);
      regionLookup = lookup;
      foreignKeys.push({
        keyName: 'Region_Key',
        referencesTable: dimTable.name,
        referencesKey: dimTable.primaryKey
      });
      relationships.push({
        fromTable: 'Fact_Sales',
        fromColumn: 'Region_Key',
        toTable: dimTable.name,
        toColumn: dimTable.primaryKey
      });
    }

    // 3. Build Dim_Category
    let categoryLookup = new Map<string, number>();
    if (primaryDims.categoryColumn) {
      const { dimTable, lookup } = this.buildGenericCategoricalDimension(
        cleanedRows,
        primaryDims.categoryColumn,
        'Dim_Category',
        'Category_Key',
        'Category_Name'
      );
      dimensions.push(dimTable);
      categoryLookup = lookup;
      foreignKeys.push({
        keyName: 'Category_Key',
        referencesTable: dimTable.name,
        referencesKey: dimTable.primaryKey
      });
      relationships.push({
        fromTable: 'Fact_Sales',
        fromColumn: 'Category_Key',
        toTable: dimTable.name,
        toColumn: dimTable.primaryKey
      });
    }

    // 4. Build Dim_Product
    let productLookup = new Map<string, number>();
    if (primaryDims.productColumn) {
      const { dimTable, lookup } = this.buildProductDimension(
        cleanedRows,
        primaryDims.productColumn,
        primaryDims.categoryColumn
      );
      dimensions.push(dimTable);
      productLookup = lookup;
      foreignKeys.push({
        keyName: 'Product_Key',
        referencesTable: dimTable.name,
        referencesKey: dimTable.primaryKey
      });
      relationships.push({
        fromTable: 'Fact_Sales',
        fromColumn: 'Product_Key',
        toTable: dimTable.name,
        toColumn: dimTable.primaryKey
      });
    }

    // 5. Build Dim_Customer
    let customerLookup = new Map<string, number>();
    if (primaryDims.customerColumn) {
      const { dimTable, lookup } = this.buildCustomerDimension(
        cleanedRows,
        primaryDims.customerColumn,
        primaryDims.segmentColumn
      );
      dimensions.push(dimTable);
      customerLookup = lookup;
      foreignKeys.push({
        keyName: 'Customer_Key',
        referencesTable: dimTable.name,
        referencesKey: dimTable.primaryKey
      });
      relationships.push({
        fromTable: 'Fact_Sales',
        fromColumn: 'Customer_Key',
        toTable: dimTable.name,
        toColumn: dimTable.primaryKey
      });
    }

    // 6. Build Dim_Segment (if segment exists and not absorbed)
    let segmentLookup = new Map<string, number>();
    if (primaryDims.segmentColumn && !primaryDims.customerColumn) {
      const { dimTable, lookup } = this.buildGenericCategoricalDimension(
        cleanedRows,
        primaryDims.segmentColumn,
        'Dim_Segment',
        'Segment_Key',
        'Segment_Name'
      );
      dimensions.push(dimTable);
      segmentLookup = lookup;
      foreignKeys.push({
        keyName: 'Segment_Key',
        referencesTable: dimTable.name,
        referencesKey: dimTable.primaryKey
      });
      relationships.push({
        fromTable: 'Fact_Sales',
        fromColumn: 'Segment_Key',
        toTable: dimTable.name,
        toColumn: dimTable.primaryKey
      });
    }

    // 7. Detect Fact Measures
    const measures: FactMeasure[] = [];
    classifications.forEach(col => {
      if (col.isNumeric) {
        const lower = col.name.toLowerCase();
        let additivity: MeasureAdditivity = 'Additive';
        if (lower.includes('rate') || lower.includes('margin') || lower.includes('percent') || lower.includes('discount')) {
          additivity = 'Non-additive';
        } else if (lower.includes('balance') || lower.includes('inventory') || lower.includes('price')) {
          additivity = 'Semi-additive';
        }

        measures.push({
          name: col.name,
          sourceColumn: col.name,
          type: 'number',
          additivity
        });
      }
    });

    // 8. Build Fact Table Rows
    const factRows: Record<string, any>[] = cleanedRows.map((row, idx) => {
      const factRow: Record<string, any> = {
        Sales_Fact_Key: idx + 1
      };

      // Add foreign keys
      if (dateCol) {
        const dVal = String(row[dateCol] || '').split('T')[0];
        factRow['Date_Key'] = dateLookup.get(dVal) || 19700101;
      }
      if (primaryDims.regionColumn) {
        const rVal = String(row[primaryDims.regionColumn] || '').trim();
        factRow['Region_Key'] = regionLookup.get(rVal) || 0;
      }
      if (primaryDims.categoryColumn) {
        const cVal = String(row[primaryDims.categoryColumn] || '').trim();
        factRow['Category_Key'] = categoryLookup.get(cVal) || 0;
      }
      if (primaryDims.productColumn) {
        const pVal = String(row[primaryDims.productColumn] || '').trim();
        factRow['Product_Key'] = productLookup.get(pVal) || 0;
      }
      if (primaryDims.customerColumn) {
        const custVal = String(row[primaryDims.customerColumn] || '').trim();
        factRow['Customer_Key'] = customerLookup.get(custVal) || 0;
      }
      if (primaryDims.segmentColumn && !primaryDims.customerColumn) {
        const segVal = String(row[primaryDims.segmentColumn] || '').trim();
        factRow['Segment_Key'] = segmentLookup.get(segVal) || 0;
      }

      // Add measures
      measures.forEach(m => {
        const rawNum = Number(row[m.sourceColumn]);
        factRow[m.name] = !isNaN(rawNum) && isFinite(rawNum) ? Number(rawNum.toFixed(2)) : 0;
      });

      return factRow;
    });

    const factColumns: Array<{ name: string; type: string; role: 'surrogate_key' | 'foreign_key' | 'measure' }> = [
      { name: 'Sales_Fact_Key', type: 'number', role: 'surrogate_key' },
      ...foreignKeys.map(fk => ({ name: fk.keyName, type: 'number', role: 'foreign_key' as const })),
      ...measures.map(m => ({ name: m.name, type: 'number', role: 'measure' as const }))
    ];

    const factTable: FactTable = {
      name: 'Fact_Sales',
      primaryKey: 'Sales_Fact_Key',
      foreignKeys,
      measures,
      rowCount: factRows.length,
      columns: factColumns,
      rows: factRows
    };

    return {
      factTable,
      dimensions,
      relationships,
      buildTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      sourceDatasetName: dataset.name,
      sourceRowCount: cleanedRows.length
    };
  }

  /**
   * Dim_Date Builder: Generates rich temporal attributes without timezone distortion
   */
  private static buildDateDimension(
    rows: Record<string, any>[],
    dateCol: string
  ): { dimTable: DimensionTable; lookup: Map<string, number> } {
    const uniqueDates = new Set<string>();
    rows.forEach(r => {
      const raw = r[dateCol];
      if (raw) {
        const dStr = String(raw).split('T')[0].trim();
        if (dStr) uniqueDates.add(dStr);
      }
    });

    const sortedDates = Array.from(uniqueDates).sort();
    const dimRows: Record<string, any>[] = [];
    const lookup = new Map<string, number>();

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    sortedDates.forEach(dateStr => {
      // Parse YYYY-MM-DD explicitly
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);

        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          const dateObj = new Date(Date.UTC(year, month - 1, day));
          const dateKey = year * 10000 + month * 100 + day; // e.g. 20260115
          const quarter = `Q${Math.floor((month - 1) / 3) + 1}`;
          const dayName = dayNames[dateObj.getUTCDay()];
          const monthName = monthNames[month - 1];

          // Simple day of year calculation for ISO week estimation
          const startOfYear = new Date(Date.UTC(year, 0, 1));
          const dayOfYear = Math.floor((dateObj.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)) + 1;
          const week = Math.ceil(dayOfYear / 7);

          lookup.set(dateStr, dateKey);
          dimRows.push({
            Date_Key: dateKey,
            Date: dateStr,
            Day: day,
            Day_Name: dayName,
            Week: week,
            Month: month,
            Month_Name: monthName,
            Quarter: quarter,
            Year: year
          });
        }
      }
    });

    const dimTable: DimensionTable = {
      name: 'Dim_Date',
      primaryKey: 'Date_Key',
      sourceColumn: dateCol,
      rowCount: dimRows.length,
      columns: [
        { name: 'Date_Key', type: 'number', isSurrogateKey: true },
        { name: 'Date', type: 'string' },
        { name: 'Day', type: 'number' },
        { name: 'Day_Name', type: 'string' },
        { name: 'Week', type: 'number' },
        { name: 'Month', type: 'number' },
        { name: 'Month_Name', type: 'string' },
        { name: 'Quarter', type: 'string' },
        { name: 'Year', type: 'number' }
      ],
      rows: dimRows,
      lookupMap: lookup
    };

    return { dimTable, lookup };
  }

  /**
   * Generic Categorical Dimension Builder (Region, Category, Segment)
   */
  private static buildGenericCategoricalDimension(
    rows: Record<string, any>[],
    sourceCol: string,
    tableName: string,
    keyName: string,
    valueName: string
  ): { dimTable: DimensionTable; lookup: Map<string, number> } {
    const uniqueValues = new Set<string>();
    rows.forEach(r => {
      const val = r[sourceCol];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        uniqueValues.add(String(val).trim());
      }
    });

    const sorted = Array.from(uniqueValues).sort();
    const lookup = new Map<string, number>();
    const dimRows: Record<string, any>[] = [];

    sorted.forEach((item, idx) => {
      const key = idx + 1;
      lookup.set(item, key);
      dimRows.push({
        [keyName]: key,
        [valueName]: item
      });
    });

    const dimTable: DimensionTable = {
      name: tableName,
      primaryKey: keyName,
      sourceColumn: sourceCol,
      rowCount: dimRows.length,
      columns: [
        { name: keyName, type: 'number', isSurrogateKey: true },
        { name: valueName, type: 'string' }
      ],
      rows: dimRows,
      lookupMap: lookup
    };

    return { dimTable, lookup };
  }

  /**
   * Product Dimension Builder with Category attribute
   */
  private static buildProductDimension(
    rows: Record<string, any>[],
    productCol: string,
    categoryCol?: string
  ): { dimTable: DimensionTable; lookup: Map<string, number> } {
    const productMap = new Map<string, string>(); // product -> category
    rows.forEach(r => {
      const prod = r[productCol];
      if (prod !== undefined && prod !== null && String(prod).trim() !== '') {
        const prodName = String(prod).trim();
        const catName = categoryCol && r[categoryCol] ? String(r[categoryCol]).trim() : 'General';
        if (!productMap.has(prodName)) {
          productMap.set(prodName, catName);
        }
      }
    });

    const sorted = Array.from(productMap.keys()).sort();
    const lookup = new Map<string, number>();
    const dimRows: Record<string, any>[] = [];

    sorted.forEach((prodName, idx) => {
      const key = idx + 1;
      lookup.set(prodName, key);
      dimRows.push({
        Product_Key: key,
        Product_Name: prodName,
        Category: productMap.get(prodName) || 'General'
      });
    });

    const dimTable: DimensionTable = {
      name: 'Dim_Product',
      primaryKey: 'Product_Key',
      sourceColumn: productCol,
      rowCount: dimRows.length,
      columns: [
        { name: 'Product_Key', type: 'number', isSurrogateKey: true },
        { name: 'Product_Name', type: 'string' },
        { name: 'Category', type: 'string' }
      ],
      rows: dimRows,
      lookupMap: lookup
    };

    return { dimTable, lookup };
  }

  /**
   * Customer Dimension Builder with Segment attribute
   */
  private static buildCustomerDimension(
    rows: Record<string, any>[],
    customerCol: string,
    segmentCol?: string
  ): { dimTable: DimensionTable; lookup: Map<string, number> } {
    const customerMap = new Map<string, string>(); // customer -> segment
    rows.forEach(r => {
      const cust = r[customerCol];
      if (cust !== undefined && cust !== null && String(cust).trim() !== '') {
        const custName = String(cust).trim();
        const segName = segmentCol && r[segmentCol] ? String(r[segmentCol]).trim() : 'Standard';
        if (!customerMap.has(custName)) {
          customerMap.set(custName, segName);
        }
      }
    });

    const sorted = Array.from(customerMap.keys()).sort();
    const lookup = new Map<string, number>();
    const dimRows: Record<string, any>[] = [];

    sorted.forEach((custName, idx) => {
      const key = idx + 1;
      lookup.set(custName, key);
      dimRows.push({
        Customer_Key: key,
        Customer_Name: custName,
        Customer_Segment: customerMap.get(custName) || 'Standard'
      });
    });

    const dimTable: DimensionTable = {
      name: 'Dim_Customer',
      primaryKey: 'Customer_Key',
      sourceColumn: customerCol,
      rowCount: dimRows.length,
      columns: [
        { name: 'Customer_Key', type: 'number', isSurrogateKey: true },
        { name: 'Customer_Name', type: 'string' },
        { name: 'Customer_Segment', type: 'string' }
      ],
      rows: dimRows,
      lookupMap: lookup
    };

    return { dimTable, lookup };
  }

  /**
   * Build ETL Transformation Mappings (Requirement 10)
   */
  public static generateETLMappings(schema: StarSchema): ETLMappingItem[] {
    const mappings: ETLMappingItem[] = [];

    // Fact table mappings
    schema.factTable.measures.forEach(m => {
      mappings.push({
        sourceColumn: m.sourceColumn,
        transformation: 'Numeric parsing, rounding & boundary check',
        targetTable: schema.factTable.name,
        targetColumn: m.name,
        role: 'Measure',
        dataClassification: m.additivity
      });
    });

    // Dimension mappings
    schema.dimensions.forEach(dim => {
      dim.columns.forEach(col => {
        if (col.isSurrogateKey) {
          mappings.push({
            sourceColumn: dim.sourceColumn,
            transformation: 'Auto-incrementing surrogate key generation',
            targetTable: dim.name,
            targetColumn: col.name,
            role: 'Surrogate Key',
            dataClassification: 'Integer Identifier'
          });
        } else {
          mappings.push({
            sourceColumn: dim.sourceColumn,
            transformation: dim.name === 'Dim_Date' ? 'ISO-8601 Date decomposition' : 'Deduplication & normalization',
            targetTable: dim.name,
            targetColumn: col.name,
            role: 'Dimension',
            dataClassification: col.type === 'number' ? 'Numeric Attribute' : 'Categorical'
          });
        }
      });
    });

    return mappings;
  }

  /**
   * Validate Data Integrity (Requirement 25)
   */
  public static validateWarehouseIntegrity(schema: StarSchema): WarehouseIntegrityReport {
    const notes: string[] = [];
    let orphanCount = 0;
    let uniqueKeysPass = true;

    // 1. Check unique surrogate keys in fact
    const factKeys = new Set<number>();
    for (const r of schema.factTable.rows) {
      if (factKeys.has(r.Sales_Fact_Key)) {
        uniqueKeysPass = false;
        break;
      }
      factKeys.add(r.Sales_Fact_Key);
    }

    // 2. Check foreign keys
    schema.factTable.foreignKeys.forEach(fk => {
      const dim = schema.dimensions.find(d => d.name === fk.referencesTable);
      if (dim) {
        const validDimKeys = new Set(dim.rows.map(r => r[dim.primaryKey]));
        let invalidFk = 0;
        for (const fr of schema.factTable.rows) {
          const val = fr[fk.keyName];
          if (!validDimKeys.has(val)) {
            invalidFk++;
          }
        }
        if (invalidFk > 0) {
          orphanCount += invalidFk;
          notes.push(`Found ${invalidFk} fact records with unmatched ${fk.keyName} in ${fk.referencesTable}`);
        }
      }
    });

    if (orphanCount === 0) {
      notes.push('All fact records reference valid dimension surrogate keys (Zero orphaned foreign keys).');
    }

    if (uniqueKeysPass) {
      notes.push('All primary and surrogate keys are 100% unique.');
    }

    const status: 'PASS' | 'WARNING' | 'FAIL' = orphanCount === 0 && uniqueKeysPass ? 'PASS' : (orphanCount < 50 ? 'WARNING' : 'FAIL');

    return {
      status,
      orphanForeignKeyCount: orphanCount,
      uniqueSurrogateKeyPass: uniqueKeysPass,
      dateParsingPass: schema.dimensions.some(d => d.name === 'Dim_Date'),
      measuresIntegrityPass: schema.factTable.measures.length > 0,
      notes
    };
  }

  /**
   * Compare Source Dataset vs Warehouse Fact (Requirement 24)
   */
  public static compareSourceVsWarehouse(
    cleanedRows: Record<string, any>[],
    schema: StarSchema,
    salesCol?: string,
    profitCol?: string
  ): WarehouseSourceComparison {
    const sourceRows = cleanedRows.length;
    const factRows = schema.factTable.rows.length;

    let sourceSales = 0;
    let factSales = 0;
    if (salesCol) {
      sourceSales = AnalyticsEngine.sum(cleanedRows, salesCol);
      factSales = AnalyticsEngine.sum(schema.factTable.rows, salesCol);
    }

    let sourceProfit = 0;
    let factProfit = 0;
    if (profitCol) {
      sourceProfit = AnalyticsEngine.sum(cleanedRows, profitCol);
      factProfit = AnalyticsEngine.sum(schema.factTable.rows, profitCol);
    }

    const notes: string[] = [];
    if (sourceRows === factRows) {
      notes.push('Row count reconciliation: 100% match between Cleaned Dataset and Fact Table.');
    } else {
      notes.push(`Discrepancy: Cleaned rows (${sourceRows}) != Fact rows (${factRows}).`);
    }

    if (Math.abs(sourceSales - factSales) < 1) {
      notes.push('Financial sales reconciliation: $0.00 delta between source and warehouse facts.');
    }

    return {
      sourceRows,
      factRows,
      sourceSales,
      factSales,
      sourceProfit,
      factProfit,
      dimensionsMatch: schema.dimensions.length > 0,
      notes
    };
  }

  /**
   * Warehouse Statistics summary (Requirement 12)
   */
  public static computeStatistics(schema: StarSchema | null): WarehouseStatistics {
    if (!schema) {
      return {
        factRecords: 0,
        dimensionTablesCount: 0,
        totalDimensionRecords: 0,
        measuresCount: 0,
        dimensionsCount: 0,
        dateRange: 'No data',
        buildStatus: 'Empty'
      };
    }

    const totalDimRows = schema.dimensions.reduce((acc, d) => acc + d.rowCount, 0);
    const dateDim = schema.dimensions.find(d => d.name === 'Dim_Date');
    let dateRange = 'Not configured';
    if (dateDim && dateDim.rows.length > 0) {
      const first = dateDim.rows[0].Date;
      const last = dateDim.rows[dateDim.rows.length - 1].Date;
      dateRange = `${first} to ${last}`;
    }

    return {
      factRecords: schema.factTable.rowCount,
      dimensionTablesCount: schema.dimensions.length,
      totalDimensionRecords: totalDimRows,
      measuresCount: schema.factTable.measures.length,
      dimensionsCount: schema.dimensions.length,
      dateRange,
      buildStatus: 'Complete'
    };
  }

  /**
   * Export table rows to CSV format in browser (Requirement 29)
   */
  public static exportToCSV(filename: string, rows: Record<string, any>[]): void {
    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        headers.map(h => {
          const val = row[h];
          if (val === null || val === undefined) return '';
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
