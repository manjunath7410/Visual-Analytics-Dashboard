# Acuity BI — Executive Business Intelligence & Visual Analytics Platform

[![React 19](https://img.shields.io/badge/React-19.0.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.3.3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini API](https://img.shields.io/badge/Google_GenAI-Gemini_2.4-8E75C4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Express](https://img.shields.io/badge/Express-4.21.2-000000?logo=express&logoColor=white)](https://expressjs.com/)

A modern, high-performance, full-stack Business Intelligence (BI) and Visual Analytics suite built with React 19, TypeScript, Tailwind CSS v4, and Node.js/Express. Acuity BI provides an end-to-end data pipeline: from raw file ingestion and automated ETL data cleaning to multi-dimensional visual analytics, in-browser SQL query execution, and server-side Google Gemini-powered executive intelligence.

---

## 📑 Table of Contents

- [Overview & Key Features](#-overview--key-features)
- [Workflow & Architecture](#-workflow--architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start & Installation](#-quick-start--installation)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Backend API Endpoints](#-backend-api-endpoints)
- [Keyboard Shortcuts](#-keyboard-shortcuts)
- [Deploying to GitHub](#-deploying-to-github)
- [License](#-license)

---

## 🚀 Overview & Key Features

### 1. Sequential Workspace Workflow
1. **Data Upload (`/upload`)**:
   - Universal ingestion supporting delimited CSV, TSV, and JSON formats.
   - Client-side streaming parser (PapaParse) with automatic header detection and type inference.
   - Built-in benchmark loader supplying 10,000 synthetic enterprise commercial sales transactions.
2. **Data Explorer (`/explorer`)**:
   - High-density virtualized tabular grid with multi-column sorting, searching, and schema inspection.
   - Column-level statistical profiling (min, max, mean, null counts, distinct cardinality).
3. **Data Cleaning & ETL Pipeline (`/cleaning`)**:
   - Automated data health audit score (0–100%).
   - Missing value imputation (mean, median, mode, forward fill, or drop).
   - Deduplication, type coercion, text trimming, and outlier detection with one-click transformations.
4. **Executive Dashboard (`/`)**:
   - Real-time KPI summary cards (Total Revenue, Gross Profit Margin, Sales Volume, Average Order Value).
   - Time-series revenue trajectories, regional performance maps, category revenue bars, and top-performing products.
   - Global interactive time range selectors (7D, 30D, 90D, 1Y, All) with persistent filter histories.

### 2. Visual Analytics & Market Share Studio (`/analytics`)
- **Multi-Perspective Visual Layout**:
  - **Chronological Trend Analysis**: Time-series charts comparing revenue trajectory against target baselines.
  - **Market Share & Proportion Breakdown**: Interactive **Pie / Donut Chart** engine featuring:
    - Real-time dimension switching (Category, Region, Segment, Payment Method, Priority).
    - Metric aggregator selection (Sum of Sales, Total Profit, Unit Volume, Transaction Count).
    - Toggle between Donut chart (with dynamic center metric display) and solid Pie view.
    - Interactive slice hover highlights, custom tooltips, percentage indicators, and leading contributor badges.
  - **Rankings & Contribution**: Top and bottom quartile distribution rankings with relative share progress bars.
- Custom query builder allowing custom dimensions, metrics, aggregations (`SUM`, `AVG`, `MIN`, `MAX`, `COUNT`), and chart types (Bar, Line, Area, Scatter, Pie).

### 3. Server-Side AI Business Intelligence (`/insights`)
- Powered by the `@google/genai` TypeScript SDK running securely on Express.
- **Executive Summaries**: AI-generated strategic overviews highlighting revenue drivers and performance bottlenecks.
- **Key Findings & Variance Analysis**: Automatic detection of statistical anomalies and revenue leakage.
- **Ask Your Data (Natural Language QA)**: Query datasets in plain English (e.g. *"Which region generated the highest margin in Q3?"*) and receive contextual answers backed by structured data citations.
- Server-side caching (10-minute TTL) and automatic model fallback (`gemini-3.8-flash` → `gemini-3.1-flash-lite` → `gemini-flash-latest`).

### 4. Data Warehouse & Star Schema Studio (`/warehouse`)
- Automated generation of dimensional models from flat datasets.
- Normalized star schema visualization displaying **Fact Tables** and surrounding **Dimension Tables** (Customer, Product, Geography, Temporal).
- Multi-dimensional OLAP slicing and surrogate key generation.

### 5. In-Browser SQL & OLAP Engine (`/sql`)
- SQL editor supporting relational data queries (`SELECT`, `WHERE`, `GROUP BY`, `ORDER BY`, `LIMIT`).
- Query validation, syntax highlighting, execution timing, and exportable result sets.

### 6. Automated Reports & Export Engine (`/reports`)
- Instant generation of printable executive dossiers and data quality scorecards.
- CSV and structured JSON dataset export.
- Optimized `@media print` stylesheets for clean, page-break-aware PDF rendering.

### 7. Global Theme Architecture (Light / Dark / System)
- Tailwind CSS v4 class-based variant implementation (`@custom-variant dark (&:where(.dark, .dark *))`).
- Tri-mode theme system:
  - **Light Mode**: High-contrast daylight canvas for office environments.
  - **Dark Mode**: Low-glare executive slate palette for low-light settings.
  - **System Mode**: Dynamically follows your operating system’s `prefers-color-scheme`.
- Theme selectors in Header dropdown, Settings page (`/settings`), and Command Palette (`⌘K`).

---

## 🏗️ Workflow & Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Browser                        │
│  React 19 SPA · React Router 7 · Recharts · Lucide Icons    │
│  DataContext (State, Filters, Datasets, Dynamic Schema)     │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌───────────────────────────────┐   ┌─────────────────────────┐
│     Client Data Engine        │   │    Express Server       │
│  · PapaParse (CSV/JSON)       │   │  · Vite dev middleware  │
│  · Analytics Engine (OLAP)    │   │  · Cache layer (10m)    │
│  · ETL Cleaning Pipeline      │   │  · /api/gemini/* proxy  │
│  · LocalStorage Persistence   │   └────────────┬────────────┘
└───────────────────────────────┘                │
                                                 ▼
                                    ┌─────────────────────────┐
                                    │    Google GenAI SDK     │
                                    │  · Gemini 3.8 Flash     │
                                    │  · Structured JSON      │
                                    └─────────────────────────┘
```

---

## 💻 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19 (`react`, `react-dom`), React Router v7 (`react-router-dom`) |
| **Language & Tooling** | TypeScript 7.0, Vite 8.3, tsx 4.21 |
| **Styling & Design** | Tailwind CSS v4.3, Plus Jakarta Sans, JetBrains Mono, Lucide React |
| **Data Visualization** | Recharts 3.10, Custom SVG Pie/Donut Chart Engine |
| **Data Parsing & ETL** | PapaParse 5.7, In-browser Statistical & OLAP Engine |
| **Server & Proxy** | Express 4.21, dotenv 17.2 |
| **Artificial Intelligence** | `@google/genai` (Gemini 3.8 Flash, 3.1 Flash Lite) |

---

## 📁 Project Structure

```
.
├── .env.example              # Sample environment variables
├── .gitignore                # Git ignore rules
├── index.html                # HTML entry point with typography & meta tags
├── metadata.json             # Applet capabilities & metadata
├── package.json              # Project dependencies & build scripts
├── server.ts                 # Full-stack Express server & Gemini API proxy
├── tsconfig.json             # TypeScript compiler configuration
├── vite.config.ts            # Vite bundler configuration
└── src/
    ├── main.tsx              # Application React root bootstrap
    ├── App.tsx               # Routes & application layout tree
    ├── index.css             # Tailwind CSS v4 imports, dark variant & print rules
    ├── types/                # Core TypeScript definitions (dataset, analytics, etl, etc.)
    ├── context/              # DataContext & Theme state management
    ├── components/
    │   ├── layout/           # Sidebar, Header, Breadcrumbs, CommandPalette, AppLayout
    │   ├── common/           # BottomNav, MetricCard, Tooltip, StatusBadge
    │   ├── dashboard/        # KPI cards, Trend charts, Regional breakdown
    │   ├── analytics/        # ChartRenderer, QueryBuilder, PieBreakdownCard
    │   └── cleaning/         # AuditSummary, TransformationRules, DuplicateModal
    ├── pages/                # Route view components
    │   ├── DashboardPage.tsx
    │   ├── DataUploadPage.tsx
    │   ├── DataExplorerPage.tsx
    │   ├── DataCleaningPage.tsx
    │   ├── AnalyticsPage.tsx
    │   ├── BusinessInsightsPage.tsx
    │   ├── DataWarehousePage.tsx
    │   ├── SQLAnalyticsPage.tsx
    │   ├── ReportsPage.tsx
    │   └── SettingsPage.tsx
    ├── services/             # Gemini prompt builders & client API layer
    └── utils/                # Statistical math, analytics aggregation, sample data generator
```

---

## ⚡ Quick Start & Installation

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 (or **pnpm** / **yarn** / **bun**)
- Optional: A [Google Gemini API Key](https://aistudio.google.com/) for AI Business Intelligence features.

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/acuity-bi-visual-analytics.git
cd acuity-bi-visual-analytics
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```
Add your Gemini API key (optional, app works fully with mock/benchmark data if absent):
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Runs the full-stack dev server using `tsx server.ts` with Vite HMR middleware on port 3000 |
| `npm run build` | Compiles frontend assets into production bundles in `/dist` |
| `npm run start` | Runs the production server from compiled assets |
| `npm run lint` | Runs TypeScript compiler type-check (`tsc --noEmit`) without emitting code |
| `npm run clean` | Deletes build output artifacts (`dist/`) |

---

## 🔌 Backend API Endpoints

The Express server (`server.ts`) exposes proxy routes to ensure Gemini API keys remain secure server-side:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/gemini/status` | Returns whether Gemini API is active, the active model, and environment status |
| `POST` | `/api/gemini/executive-summary` | Generates high-level executive strategic briefs from dataset statistics |
| `POST` | `/api/gemini/key-findings` | Identifies positive catalysts, risk factors, and variance highlights |
| `POST` | `/api/gemini/trend-explanation` | Analyzes seasonal trajectories and spikes in time-series data |
| `POST` | `/api/gemini/anomaly-explanation`| Diagnoses outliers, data skew, and margin variances |
| `POST` | `/api/gemini/recommendations` | Produces actionable next steps prioritized by financial impact |
| `POST` | `/api/gemini/ask-data` | Answers user questions with structured data citations and recommendations |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `⌘K` / `Ctrl+K` | Open global Command Palette |
| `G D` | Navigate to Executive Dashboard |
| `G A` | Navigate to Visual Analytics Studio |
| `G E` | Navigate to Data Explorer |
| `G C` | Navigate to Data Cleaning & ETL |
| `G W` | Navigate to Data Warehouse & Star Schema |
| `G R` | Navigate to Automated Reports |
| `G S` | Navigate to Settings |

---

## 🚢 Deploying to GitHub

To push this codebase to your own GitHub repository:

```bash
# 1. Initialize git if not already initialized
git init

# 2. Add all files to staging
git add .

# 3. Create your initial commit
git commit -m "feat: complete visual analytics dashboard with workspace pipeline, pie chart, and tri-mode theme"

# 4. Set branch to main
git branch -M main

# 5. Link to your GitHub repository
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# 6. Push code to GitHub
git push -u origin main
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
Feel free to use, adapt, and build upon this platform for your enterprise intelligence needs.
