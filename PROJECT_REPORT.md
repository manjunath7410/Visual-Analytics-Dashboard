# PROJECT REPORT: Acuity BI — Enterprise Visual Analytics & Data Intelligence Platform

**Document Version:** 1.2.0  
**Project Classification:** Executive Technical Report & Architectural Specification  
**Status:** Production Ready  
**Date:** October 2026  

---

## 1. Executive Summary

Modern enterprise organizations generate vast volumes of transactional and operational data across distributed channels. Despite this abundance, business decision-makers often struggle to extract actionable insights due to clunky software, fractured data pipelines, slow loading speeds, and complex ETL barriers.

**Acuity BI** was conceived and engineered to bridge this gap. It is a full-stack, client-first Business Intelligence (BI) and Visual Analytics platform built on **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Node.js/Express**. Acuity BI delivers a continuous, four-stage workspace data pipeline:
1. **Data Ingestion & In-Memory Parsing**: Delimited CSV/JSON intake with automatic schema discovery.
2. **Exploration & Profiling**: High-density spreadsheet grid with column cardinality statistics.
3. **Data Cleaning & ETL Engine**: One-click deduplication, outlier filtering, and null imputation.
4. **Executive Dashboard & Visual Analytics**: Interactive KPIs, multi-perspective charts, interactive Market Share Donut/Pie charts, and in-browser SQL querying.

In addition to traditional analytics, Acuity BI integrates a secure server-side **Google Gemini AI (Gemini 3.8 Flash)** proxy to generate natural-language executive summaries, root-cause anomaly diagnostics, and interactive question-answering over custom datasets.

---

## 2. Problem Statement & Project Objectives

### 2.1 The Problem
- **Data Ingestion Bottlenecks**: Many BI tools require database administrators to write schemas before any file can be inspected.
- **Data Hygiene Friction**: Data analysts spend up to 70% of their time cleaning dirty data before building visual charts.
- **Fragmented Workflows**: Moving between ingestion, profiling, cleaning, analysis, and report generation requires toggling between multiple disparate applications.
- **Lack of Natural Language Explanations**: Business stakeholders often need plain-English narratives to interpret complex charts.

### 2.2 Core Objectives
- Provide a coherent **sequential workspace**: Data Upload → Data Explorer → Data Cleaning → Executive Dashboard.
- Provide a **Visual Analytics Studio** featuring chronological trend charts, rank tables, and interactive **Market Share Pie/Donut charts**.
- Implement an accessible, **tri-mode theme architecture** (Light, Dark, and System mode) satisfying WCAG 2.1 AA legibility standards.
- Maintain strict **zero-leakage security** by isolating Google GenAI API credentials to server-side Express routes with response caching.
- Build a lightweight, sub-second responsive Single Page Application (SPA) capable of processing 10,000+ records in real time in the browser.

---

## 3. System Architecture & Technical Stack

### 3.1 Architectural Overview
Acuity BI uses a decoupled full-stack model where heavy compute (parsing, filtering, charting, OLAP aggregation) occurs on the client device for zero-latency interactions, while sensitive AI operations are handled through an Express backend proxy.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION TIER                             │
│  React 19 SPA · React Router v7 · Tailwind CSS v4 · Recharts 3.10      │
│  Plus Jakarta Sans (Typography) · JetBrains Mono (Financial Numbers)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        DATA & APPLICATION TIER                         │
│  DataContext (State Container, Undo/Redo Filter Stack, Active Schema)  │
│  AnalyticsEngine (OLAP Slicing, GroupBy Aggregators, KPI Synthesizer)  │
│  ETL Engine (Null Imputation, Outlier IQR Bounds, Deduplication)       │
│  PapaParse (Streaming In-Memory Worker Parser)                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼ (HTTP / JSON via /api/*)
┌────────────────────────────────────────────────────────────────────────┐
│                          SERVER & AI SERVICES                          │
│  Express 4.21 Gateway · tsx Server Process · Node.js 22 Runtime        │
│  10-Minute Response Cache Layer · Model Fallback Chain                 │
│  Google GenAI SDK (@google/genai) · Gemini 3.8 Flash Engine            │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Technology Justifications

| Technology | Role | Justification |
|---|---|---|
| **React 19** | Core UI Library | Concurrent rendering, fine-grained state hooks, and zero-overhead component trees. |
| **TypeScript 7.0** | Strict Type System | Guarantees compile-time safety across complex tabular data structures, column schemas, and filter states. |
| **Tailwind CSS v4** | Styling Architecture | High-performance CSS engine using modern CSS features, `@custom-variant dark`, and streamlined bundle output. |
| **Vite 8.3** | Bundler & Dev Middleware | Near-instant Cold Start, optimized tree-shaking, and zero-bundle dev mode. |
| **Recharts 3.10** | Data Visualizations | Declarative SVG-based rendering for responsive, accessible time-series, area, and bar charts. |
| **Custom SVG Pie Engine** | Market Share Charting | Handcrafted interactive pie and donut chart calculations with arc geometry, hover zoom, and dynamic center metric. |
| **PapaParse 5.7** | Delimited Data Parsing | Robust client-side CSV/TSV parser supporting malformed inputs, quoted fields, and high throughput. |
| **Express 4.21** | Server & Proxy | Lightweight Node.js server that securely manages environment variables and proxies Gemini API requests. |
| **@google/genai** | AI Business Intelligence | Official Google GenAI SDK utilizing structured JSON schemas for reliable, hallucination-resistant analytical briefings. |

---

## 4. Module Specifications & Functional Breakdown

### 4.1 Workspace Pipeline

#### Module 1: Data Upload (`/upload`)
- **File Acceptance**: Drag-and-drop or file browser picker for `.csv`, `.tsv`, `.txt`, and `.json`.
- **Automatic Type Inference**: Classifies columns into `string`, `number`, `date`, or `boolean` using heuristic regex and value profiling.
- **Benchmark Generator**: One-click button to load 10,000 synthetic enterprise commercial sales transactions with realistic seasonality, margin variance, and geographic distribution.

#### Module 2: Data Explorer (`/explorer`)
- **Virtualized High-Density Grid**: Renders thousands of records with minimal DOM overhead.
- **Multi-Column Filtering & Search**: Instant global substring search and per-column exact match or range filtering.
- **Column Profiler**: Visual header badges indicating missing percentage, unique values, min/max numbers, and mean averages.

#### Module 3: Data Cleaning & ETL Pipeline (`/cleaning`)
- **Data Health Scorecard**: Algorithmic health score (0–100%) factoring in missingness, duplicate keys, negative sales outliers, and type inconsistencies.
- **Automated Data Quality Audit**:
  - Null value detection with options to impute (mean, median, mode, forward-fill) or drop.
  - Duplicate row detection with deduplication preview.
  - Outlier identification using the Interquartile Range (IQR = Q3 - Q1) rule.
  - Standardization tools: whitespace trimming, title casing, and currency symbol stripping.
- **Undo / Rollback**: Transactional history allowing users to step backward through ETL operations.

#### Module 4: Executive Dashboard (`/` & `/dashboard`)
- **KPI Summary Grid**: Revenue, Profit Margin %, Sales Volume, and Average Order Value with period-over-period delta badges.
- **Trend Charts**: Revenue trajectory with monthly moving averages.
- **Regional Geography Breakdown**: Regional bar and pie distribution cards.
- **Top Performers**: Ranked table of top products by gross margin contribution.

### 4.2 Visual Analytics Studio & Market Share Pie Chart (`/analytics`)
- **Responsive 3-Column Layout**:
  1. **Chronological Time-Series Trends**: Dual-line chart comparing historical revenue to target projections.
  2. **Market Share & Proportion Analysis (Pie / Donut)**:
     - Interactive switcher for categorical dimensions: Category, Region, Segment, Payment Method, Priority.
     - Metric switcher: Sum of Sales, Gross Profit, Unit Quantity, Transaction Count.
     - **Donut / Solid Pie Toggle**: Switch between a solid circular layout and a modern donut ring featuring live center KPI readouts.
     - **Interactive Slice Hover**: Dynamic slice expansion on hover with matching tooltips and synchronized legend highlighting.
     - **Footer Insight**: Automatically computes and highlights the leading segment and its percentage dominance.
  3. **Contribution & Quartile Rankings**: Horizontal relative-share ranking bars for quick identification of the top 5 and bottom 5 contributors.
- **Ad-Hoc Query Builder**: Select arbitrary dimensions, metrics, aggregation functions (`SUM`, `AVG`, `COUNT`, `MIN`, `MAX`), and visual chart types.

### 4.3 AI Business Intelligence & Narrative Engine (`/insights`)
- **Server-Side Security**: All Gemini calls run through `/api/gemini/*` proxy routes in `server.ts`. Client code never handles API keys.
- **Executive Summaries**: Synthesizes high-level quarterly briefs detailing revenue peaks and margin drivers.
- **Key Findings**: Structured categorization into Positive Catalysts, Risk Flags, and Growth Opportunities.
- **Ask Your Data**: Conversational natural-language interface allowing users to query their datasets directly.

### 4.4 Data Warehouse & Star Schema (`/warehouse`)
- Automated dimensional modeling that breaks down flat CSV rows into a normalized star schema:
  - Central **Fact Table**: Transaction metrics (Sales, Profit, Quantity, Discount).
  - Four **Dimension Tables**: `Dim_Customer`, `Dim_Product`, `Dim_Geography`, `Dim_Date`.
- OLAP slicing tool for multidimensional analysis.

### 4.5 SQL & OLAP Studio (`/sql`)
- Embedded in-browser SQL query execution engine.
- Supports `SELECT`, `WHERE`, `GROUP BY`, `ORDER BY`, and aggregate functions over the active in-memory dataset.
- Instant tabular output with export functionality.

### 4.6 Automated Reports & Printing (`/reports`)
- One-click executive dossier generation summarizing dataset metadata, KPI health, and quality audits.
- Dedicated `@media print` CSS rules in `src/index.css` ensuring clean, multi-page PDF generation without sidebar or navigation artifacts.

### 4.7 Tri-Mode Theme Architecture (Light / Dark / System)
- Engineered to resolve Tailwind CSS v4’s default media query behavior by adding `@custom-variant dark (&:where(.dark, .dark *));`.
- **Modes**:
  - **Light Mode**: Clean daylight palette with `#ffffff` and `#f8fafc` canvas, dark slate text, and crisp borders.
  - **Dark Mode**: Low-glare executive slate palette with `#020617` and `#0f172a` surfaces.
  - **System Mode**: Dynamically synchronizes with the user’s operating system using `window.matchMedia('(prefers-color-scheme: dark)')` event listeners.
- Theme controls available across the Header dropdown, Settings page, and Command Palette (`⌘K`).

---

## 5. Security, Reliability & Performance Engineering

### 5.1 API Key Security & Isolation
- **No Client Exposure**: The application contains zero hardcoded API keys. The browser communicates solely with the local `/api/*` endpoints.
- **Env Variable Configuration**: Key managed via `process.env.GEMINI_API_KEY` loaded server-side through `dotenv`.
- **Safe Fallback**: If the Gemini API key is not supplied, all BI, ETL, charting, SQL, and warehousing features remain 100% operational, with clear status indicators in the AI panel.

### 5.2 Performance & In-Memory Efficiency
- **Sub-Second Processing**: All dataset filtering, slicing, and aggregations run locally using memoized JavaScript arrays (`useMemo`), eliminating network latency during interactive dashboard usage.
- **Server-Side Response Caching**: Responses from Gemini are cached in an in-memory Map with a 10-minute TTL to reduce token consumption and latency.

### 5.3 Accessibility (a11y) & WCAG Compliance
- All text-to-background combinations strictly meet **WCAG 2.1 AA** contrast ratios (minimum 4.5:1 for normal text and 3:1 for large text).
- Focus outlines (`:focus-visible`) styled with high-visibility indigo rings.
- Tabular figures use `font-variant-numeric: tabular-nums` to ensure exact column alignment for numbers and financial balances.
- Full keyboard navigation support via the Command Palette (`⌘K` or `Ctrl+K`) and dedicated navigational key combinations.

---

## 6. Verification, Testing & Quality Assurance

The codebase was validated using automated build verification and type audits:
1. **TypeScript Static Analysis**:
   - `npm run lint` (`tsc --noEmit`) passes with **0 errors and 0 warnings**.
2. **Vite Production Bundler**:
   - `npm run build` compiles all frontend components into optimized static bundles without compilation errors.
3. **Full-Stack Dev Server**:
   - Node.js Express server starts on port 3000 and returns HTTP `200 OK` on health probe requests (`curl -I http://localhost:3000`).

---

## 7. Step-by-Step GitHub Setup & Push Guide

Follow these steps to push this project to your GitHub account:

### Step 1: Open Terminal in the Project Root
```bash
cd /workspace
```

### Step 2: Initialize Git (if not already initialized)
```bash
git init
```

### Step 3: Stage All Project Files
```bash
git add .
```

### Step 4: Verify Staged Changes
```bash
git status
```
*Ensure that `node_modules/` and local `.env` files are ignored as specified in `.gitignore`.*

### Step 5: Commit the Changes
```bash
git commit -m "feat: complete visual analytics dashboard with workspace pipeline, pie chart, and tri-mode theme"
```

### Step 6: Rename Default Branch to `main`
```bash
git branch -M main
```

### Step 7: Create a New Repository on GitHub
1. Log into your GitHub account: [https://github.com/new](https://github.com/new)
2. Enter a repository name (e.g. `acuity-bi-visual-analytics`).
3. Choose **Public** or **Private**.
4. Do **not** initialize with README, `.gitignore`, or License (these are already present in the project).
5. Click **Create repository**.

### Step 8: Link Remote and Push
```bash
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

---

## 8. Conclusion & Future Roadmap

**Acuity BI** provides a complete, modern visual analytics solution for enterprise teams. By combining a sequential workspace workflow, high-performance in-browser data processing, interactive market share charting, and server-side generative AI summaries, it delivers an intuitive and powerful business intelligence experience.

### Recommended Next Phase Additions:
1. **Persistent Cloud Database Connectors**: Direct integration with PostgreSQL / Cloud SQL for live database queries.
2. **Real-Time WebSockets**: Live telemetry streaming for operational sensor and IoT data.
3. **Multi-User Collaboration & RBAC**: Team workspaces with granular role-based permissions (Admin, Analyst, Viewer).
4. **Scheduled Automated Email Reports**: Headless background cron jobs sending executive PDF briefings to leadership teams.
