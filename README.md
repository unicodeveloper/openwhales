# OpenWhale

AI-powered financial analysis platform that tracks SEC filings to reveal what smart money — institutional investors, activist funds, and insiders — thinks about publicly traded stocks.

## What It Does

OpenWhale fetches real-time SEC filing data (13F institutional holdings, 13D/G activist disclosures, Form 4 insider trades) via the Valyu API, then uses AI to synthesize that data into actionable narratives for any given ticker.

### Key Features

- **SEC Filing Analysis** — Pulls current 13F, 13D/G, and Form 4 data for any of 177 supported tickers
- **AI-Generated Narratives** — Streams markdown analysis covering institutional ownership, activist shareholders, insider activity, and an overall smart money signal
- **Trending Dashboard** — Surfaces stocks with notable smart money activity (cached with a 6-hour TTL)
- **Data Visualizations** — Donut charts for insider buy/sell splits, bar charts for value breakdowns, and timeline components for transaction history
- **Autocomplete Search** — Client-side ticker search with keyboard navigation
- **MacBook Terminal Demo** — Interactive scroll animation showcasing a Bloomberg-style terminal with institutional holdings and insider activity data
- **Ticker Data Caching** — In-memory cache with 6-hour TTL for institutional holders and insider transactions, reducing API costs on repeat visits

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| AI / LLM | Vercel AI SDK + OpenAI (gpt-5.4) |
| SEC Data | Valyu API (`@valyu/ai-sdk`) |
| Validation | Zod 4 |
| Markdown | remark-gfm + streamdown |
| UI | Lucide icons, Motion, Aceternity MacBook Scroll |
| Fonts | Inter, Space Grotesk, Playfair Display, JetBrains Mono |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── ticker-data/route.ts   # Fetch institutional holders + insider transactions (cached 6h)
│   │   ├── narrative/route.ts     # Stream AI-generated analysis
│   │   ├── chat/route.ts          # Deep dive chat endpoint
│   │   └── trending/route.ts      # Trending tickers (NDJSON, cached)
│   ├── ticker/[symbol]/page.tsx   # Ticker detail page
│   ├── page.tsx                   # Home (hero + MacBook demo + trending grid)
│   └── layout.tsx                 # Root layout with nav + footer
├── components/
│   ├── search-bar.tsx             # Ticker autocomplete
│   ├── trending-grid.tsx          # Trending tickers grid
│   ├── holdings-table.tsx         # 13F institutional holders table
│   ├── buy-sell-chart.tsx         # Insider buy/sell donut + bar chart
│   ├── insider-timeline.tsx       # Form 4 transaction timeline
│   ├── narrative-stream.tsx       # Streaming markdown narrative
│   ├── macbook-demo.tsx           # MacBook scroll showcase
│   ├── terminal-screen.tsx        # Bloomberg-style terminal UI
│   ├── rotating-words.tsx         # Animated rotating headline words
│   ├── nav-bar.tsx                # Transparent (home) / solid (ticker) navbar
│   ├── footer.tsx                 # Site footer
│   ├── logo.tsx                   # OpenWhale whale tail icon
│   └── ui/                        # Reusable UI primitives
├── hooks/
│   ├── use-ticker-data.ts         # Fetch ticker data
│   ├── use-narrative-stream.ts    # Stream narrative
│   └── use-trending-data.ts       # Fetch trending with NDJSON parsing
├── lib/
│   ├── valyu.ts                   # Valyu integration + AI utilities
│   ├── schemas.ts                 # Zod validation schemas
│   ├── constants.ts               # App constants
│   ├── tickers.ts                 # 177 supported ticker symbols
│   └── utils.ts                   # Utility functions
└── types/
    └── index.ts                   # TypeScript interfaces
```

## How It Works

### Ticker Detail Page

1. User searches for a ticker (e.g. AAPL) via the autocomplete search bar
2. `/api/ticker-data` checks the in-memory cache first — if a fresh result exists (< 6 hours old), it returns instantly with no API calls
3. On cache miss, it uses OpenAI with the Valyu `secSearch` tool to extract structured data — top 10 institutional holders, up to 15 insider transactions, buy/sell counts and totals
4. The UI renders holdings tables, buy/sell charts, and an insider timeline
5. `/api/narrative` streams an AI-written analysis as markdown, citing filing dates for every claim (not cached — always fresh)

### Trending Page

1. `/api/trending` fetches summaries for 8 major tickers (AAPL, NVDA, TSLA, MSFT, META, GOOGL, AMZN, PLTR)
2. Results are streamed as NDJSON on cache miss, served as JSON on cache hit
3. Each card shows top holders and net insider activity direction

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Environment Variables

Create a `.env.local` file:

```bash
OPENAI_API_KEY=sk-proj-...       # OpenAI API key
VALYU_API_KEY=val_...            # Valyu API key for SEC filing search
ANTHROPIC_API_KEY=sk-ant-...     # Anthropic API key
```

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Data Types

The app works with these core data structures:

- **InstitutionalHolder** — Name, shares, value, activity (increased/decreased/new/closed/unchanged), change percent, report date
- **InsiderTx** — Name, title, type (buy/sell/gift/exercise/award), shares, value, price per share, date
- **TickerData** — Aggregated holders + insider transactions with buy/sell counts and totals
- **TrendingTicker** — Symbol, top holders, and net insider activity direction

## Deploy

Deploy on [Railway](https://railway.app) — connect your GitHub repo, set the three environment variables (`OPENAI_API_KEY`, `VALYU_API_KEY`, `ANTHROPIC_API_KEY`), and Railway will auto-detect the Next.js framework and handle the rest.
