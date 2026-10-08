export interface SampleOrderRow {
  'Order ID': string;
  'Order Date': string;
  'Customer': string;
  'Customer Segment': 'Enterprise' | 'Mid-Market' | 'Small Business' | 'Consumer';
  'Region': 'North America' | 'EMEA' | 'APAC' | 'LATAM';
  'Category': 'Cloud Infrastructure' | 'Cyber Security' | 'Developer Tools' | 'Business Analytics';
  'Product': string;
  'Quantity': number;
  'Sales': number;
  'Profit': number;
  'Discount': number; // percentage
}

export const SAMPLE_DATASET_RAW: SampleOrderRow[] = [
  { 'Order ID': 'SO-2026-101', 'Order Date': '2026-10-01', 'Customer': 'Acme Global Cloud', 'Customer Segment': 'Enterprise', 'Region': 'North America', 'Category': 'Cloud Infrastructure', 'Product': 'Cloud Warehouse Cluster', 'Quantity': 8, 'Sales': 64500, 'Profit': 46200, 'Discount': 0.05 },
  { 'Order ID': 'SO-2026-102', 'Order Date': '2026-10-01', 'Customer': 'Vertex Dynamics UK', 'Customer Segment': 'Enterprise', 'Region': 'EMEA', 'Category': 'Cyber Security', 'Product': 'Zero-Trust Shield', 'Quantity': 12, 'Sales': 42000, 'Profit': 30600, 'Discount': 0.10 },
  { 'Order ID': 'SO-2026-103', 'Order Date': '2026-10-02', 'Customer': 'Nexus FinTech Tokyo', 'Customer Segment': 'Mid-Market', 'Region': 'APAC', 'Category': 'Business Analytics', 'Product': 'Visual BI Mart Pro', 'Quantity': 5, 'Sales': 18500, 'Profit': 14300, 'Discount': 0.00 },
  { 'Order ID': 'SO-2026-104', 'Order Date': '2026-10-02', 'Customer': 'Helios Data Systems', 'Customer Segment': 'Mid-Market', 'Region': 'North America', 'Category': 'Developer Tools', 'Product': 'Enterprise API Gateway', 'Quantity': 6, 'Sales': 29000, 'Profit': 21200, 'Discount': 0.08 },
  { 'Order ID': 'SO-2026-105', 'Order Date': '2026-10-02', 'Customer': 'Starlight Media SA', 'Customer Segment': 'Small Business', 'Region': 'LATAM', 'Category': 'Business Analytics', 'Product': 'Visual BI Mart Pro', 'Quantity': 2, 'Sales': 8400, 'Profit': 6100, 'Discount': 0.00 },
  { 'Order ID': 'SO-2026-106', 'Order Date': '2026-10-03', 'Customer': 'Apex Industrial Corp', 'Customer Segment': 'Enterprise', 'Region': 'North America', 'Category': 'Cyber Security', 'Product': 'Zero-Trust Shield', 'Quantity': 15, 'Sales': 78000, 'Profit': 57000, 'Discount': 0.12 },
  { 'Order ID': 'SO-2026-107', 'Order Date': '2026-10-03', 'Customer': 'Nordic Logistics AB', 'Customer Segment': 'Mid-Market', 'Region': 'EMEA', 'Category': 'Cloud Infrastructure', 'Product': 'Cloud Warehouse Cluster', 'Quantity': 7, 'Sales': 34500, 'Profit': 24700, 'Discount': 0.05 },
  { 'Order ID': 'SO-2026-108', 'Order Date': '2026-10-03', 'Customer': 'SingaTech Solutions', 'Customer Segment': 'Enterprise', 'Region': 'APAC', 'Category': 'Cloud Infrastructure', 'Product': 'Cloud Warehouse Cluster', 'Quantity': 18, 'Sales': 92000, 'Profit': 66000, 'Discount': 0.15 },
  { 'Order ID': 'SO-2026-109', 'Order Date': '2026-10-04', 'Customer': 'BluePeak Analytics', 'Customer Segment': 'Small Business', 'Region': 'North America', 'Category': 'Business Analytics', 'Product': 'Visual BI Mart Pro', 'Quantity': 3, 'Sales': 12200, 'Profit': 9100, 'Discount': 0.00 },
  { 'Order ID': 'SO-2026-110', 'Order Date': '2026-10-04', 'Customer': 'Aura Telemetry Paris', 'Customer Segment': 'Enterprise', 'Region': 'EMEA', 'Category': 'Developer Tools', 'Product': 'Enterprise API Gateway', 'Quantity': 10, 'Sales': 54000, 'Profit': 39800, 'Discount': 0.10 },
  { 'Order ID': 'SO-2026-111', 'Order Date': '2026-10-04', 'Customer': 'Horizon Tech Sydney', 'Customer Segment': 'Mid-Market', 'Region': 'APAC', 'Category': 'Cyber Security', 'Product': 'Zero-Trust Shield', 'Quantity': 4, 'Sales': 26500, 'Profit': 19400, 'Discount': 0.05 },
  { 'Order ID': 'SO-2026-112', 'Order Date': '2026-10-04', 'Customer': 'OmniData Labs NY', 'Customer Segment': 'Enterprise', 'Region': 'North America', 'Category': 'Business Analytics', 'Product': 'Visual BI Mart Pro', 'Quantity': 14, 'Sales': 86000, 'Profit': 66200, 'Discount': 0.10 },
  { 'Order ID': 'SO-2026-113', 'Order Date': '2026-10-05', 'Customer': 'Andes Biotech Santiago', 'Customer Segment': 'Mid-Market', 'Region': 'LATAM', 'Category': 'Developer Tools', 'Product': 'Enterprise API Gateway', 'Quantity': 4, 'Sales': 21500, 'Profit': 15700, 'Discount': 0.00 },
  { 'Order ID': 'SO-2026-114', 'Order Date': '2026-10-05', 'Customer': 'Bavaria Motor Software', 'Customer Segment': 'Small Business', 'Region': 'EMEA', 'Category': 'Business Analytics', 'Product': 'Visual BI Mart Pro', 'Quantity': 2, 'Sales': 9800, 'Profit': 7400, 'Discount': 0.00 },
  { 'Order ID': 'SO-2026-115', 'Order Date': '2026-10-05', 'Customer': 'Cascade Robotics Seattle', 'Customer Segment': 'Mid-Market', 'Region': 'North America', 'Category': 'Cloud Infrastructure', 'Product': 'Cloud Warehouse Cluster', 'Quantity': 6, 'Sales': 38200, 'Profit': 27800, 'Discount': 0.05 },
  { 'Order ID': 'SO-2026-116', 'Order Date': '2026-10-05', 'Customer': 'Pacific Cyber Hong Kong', 'Customer Segment': 'Enterprise', 'Region': 'APAC', 'Category': 'Cyber Security', 'Product': 'Zero-Trust Shield', 'Quantity': 20, 'Sales': 115000, 'Profit': 84000, 'Discount': 0.15 },
  { 'Order ID': 'SO-2026-117', 'Order Date': '2026-10-06', 'Customer': 'Vanguard Financial NY', 'Customer Segment': 'Enterprise', 'Region': 'North America', 'Category': 'Developer Tools', 'Product': 'Enterprise API Gateway', 'Quantity': 9, 'Sales': 47500, 'Profit': 35000, 'Discount': 0.10 },
  { 'Order ID': 'SO-2026-118', 'Order Date': '2026-10-06', 'Customer': 'Berlin Logistics Hub', 'Customer Segment': 'Enterprise', 'Region': 'EMEA', 'Category': 'Cloud Infrastructure', 'Product': 'Cloud Warehouse Cluster', 'Quantity': 11, 'Sales': 68000, 'Profit': 49500, 'Discount': 0.10 },
  { 'Order ID': 'SO-2026-119', 'Order Date': '2026-10-06', 'Customer': 'Sao Paulo Retail AI', 'Customer Segment': 'Enterprise', 'Region': 'LATAM', 'Category': 'Cyber Security', 'Product': 'Zero-Trust Shield', 'Quantity': 8, 'Sales': 52000, 'Profit': 37700, 'Discount': 0.08 },
  { 'Order ID': 'SO-2026-120', 'Order Date': '2026-10-07', 'Customer': 'Silicon Valley AI Co', 'Customer Segment': 'Small Business', 'Region': 'North America', 'Category': 'Business Analytics', 'Product': 'Visual BI Mart Pro', 'Quantity': 3, 'Sales': 14200, 'Profit': 10600, 'Discount': 0.00 },
  { 'Order ID': 'SO-2026-121', 'Order Date': '2026-10-07', 'Customer': 'Kobe Robotics Corp', 'Customer Segment': 'Mid-Market', 'Region': 'APAC', 'Category': 'Cloud Infrastructure', 'Product': 'Cloud Warehouse Cluster', 'Quantity': 5, 'Sales': 31000, 'Profit': 22400, 'Discount': 0.05 },
  { 'Order ID': 'SO-2026-122', 'Order Date': '2026-10-07', 'Customer': 'Delta Aviation Texas', 'Customer Segment': 'Enterprise', 'Region': 'North America', 'Category': 'Developer Tools', 'Product': 'Enterprise API Gateway', 'Quantity': 12, 'Sales': 62000, 'Profit': 45000, 'Discount': 0.10 },
  { 'Order ID': 'SO-2026-123', 'Order Date': '2026-10-08', 'Customer': 'Geneva Private Bank', 'Customer Segment': 'Enterprise', 'Region': 'EMEA', 'Category': 'Cyber Security', 'Product': 'Zero-Trust Shield', 'Quantity': 16, 'Sales': 88000, 'Profit': 64000, 'Discount': 0.12 },
  { 'Order ID': 'SO-2026-124', 'Order Date': '2026-10-08', 'Customer': 'Seoul SemiTech', 'Customer Segment': 'Enterprise', 'Region': 'APAC', 'Category': 'Cloud Infrastructure', 'Product': 'Cloud Warehouse Cluster', 'Quantity': 14, 'Sales': 74000, 'Profit': 53200, 'Discount': 0.10 },
  { 'Order ID': 'SO-2026-125', 'Order Date': '2026-10-08', 'Customer': 'Rio Energy Digital', 'Customer Segment': 'Small Business', 'Region': 'LATAM', 'Category': 'Business Analytics', 'Product': 'Visual BI Mart Pro', 'Quantity': 2, 'Sales': 11400, 'Profit': 8200, 'Discount': 0.00 }
];

export const SAMPLE_DATASET_HEADERS = [
  'Order ID',
  'Order Date',
  'Customer',
  'Customer Segment',
  'Region',
  'Category',
  'Product',
  'Quantity',
  'Sales',
  'Profit',
  'Discount'
];
