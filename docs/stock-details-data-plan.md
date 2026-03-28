# Stock Details Data Plan (API + DB Integration)

## Objective
Define exactly what data the stock details page needs, where each value comes from, how often it should refresh, and how to shape our API/database so frontend integration is straightforward.

## What The Page Displays

### 1) Company header
- Fields: `companyName`, `ticker`, `exchange`, `sector`, `industry`, `headquarters`, `logoUrl`
- Sources:
  - Static profile provider (company metadata)
  - Internal `companies` + `company_profiles`
- Refresh cadence:
  - Daily or weekly (metadata changes slowly)

### 2) Price summary strip
- Fields: `lastPrice`, `change`, `changePercent`, `asOf`
- Sources:
  - Market quote provider (real-time or delayed)
  - Internal `stock_quotes_latest`
- Refresh cadence:
  - Intraday (every 1-5 min while market is open), daily after close for EOD fallback

### 3) ScoreEngine rating card
- Fields: `score`, `label` (Strong Buy/Buy/Watch/Avoid)
- Sources:
  - Internal scoring job output
  - `stock_scores_daily` or `stock_scores`
- Refresh cadence:
  - Daily batch + optional intraday recompute for major events

### 4) Price performance chart
- Fields: series of `{date, price, sma200}` by range (`1D/1W/1M/1Y/ALL`)
- Sources:
  - Price bars provider + computed technicals
  - `stock_price_history_daily`, `stock_technicals_daily`
- Refresh cadence:
  - Daily for EOD chart; intraday optional for 1D

### 5) Score breakdown bars
- Fields: category score + weight:
  - Valuation (30), Profitability (20), Growth (20), Health (15), Momentum (10)
- Sources:
  - Scoring engine output
  - `stock_scores_daily`
- Refresh cadence:
  - Same as scoring job (daily)

### 6) Why attractive / risks cards
- Fields: 3-5 bullish points, 3-5 risk points
- Sources:
  - Rule engine derived from metrics and news, optionally LLM summarizer
  - `stock_highlights_daily`
- Refresh cadence:
  - Daily after score refresh, with optional intraday rerun

### 7) Financial metrics tiles
- Fields:
  - Valuation: P/E, EV/EBITDA, Price/Sales
  - Profitability: Gross Margin, Net Margin, ROE
  - Growth(3Y): Revenue Growth, EPS Growth, FCF Growth
- Sources:
  - Fundamentals provider
  - `financial_metric_snapshots`
- Refresh cadence:
  - Quarterly filings + TTM recompute when new reports arrive

### 8) Peer comparison table
- Fields: peer ticker, score, P/E, market cap, rating
- Sources:
  - Internal ranking + market cap snapshot
  - `stock_scores_daily`, `stock_quotes_latest`, `companies`
- Refresh cadence:
  - Daily

### 9) Analyst consensus donut/targets
- Fields: recommendation bucket, analyst count, high/median/low target
- Sources:
  - Analyst estimate provider
  - `analyst_consensus_snapshots`
- Refresh cadence:
  - Daily (or when provider publishes updates)

### 10) Latest insights/news
- Fields: news kind, published time, title, summary, image/url
- Sources:
  - News provider and optional in-house summarizer
  - `company_news`
- Refresh cadence:
  - Intraday polling (e.g., every 10-15 min)

### 11) Insider activity panel
- Fields: insider name/role/date/action/value + 3M net buy/sell
- Sources:
  - SEC Form 4 / insider provider
  - `insider_transactions`
- Refresh cadence:
  - Daily (or near-real-time if provider supports)

## API Contract For Frontend

Use a single endpoint for the page:
- `GET /api/stocks/:ticker/details?range=1M`

Response shape:
- `ticker`, `companyName`, `exchange`, `sector`, `industry`, `headquarters`
- `priceSummary`
- `rating`
- `pricePerformance`
- `scoreBreakdown`
- `highlights`
- `financialMetrics`
- `peerComparison`
- `analystConsensus`
- `news`
- `insiderActivity`
- `meta`

Why single endpoint:
- Minimizes waterfall requests
- Keeps UI rendering deterministic
- Enables a cache policy per full page payload

## Database Adjustments Implemented

Added/extended schema in `supabase/schema.sql` for:
- `companies` enrichment (`exchange`, `country`, `headquarters`, `cik`, `logo_url`)
- `company_profiles`
- `stock_price_history_daily`
- `stock_technicals_daily`
- `stock_scores_daily`
- `financial_metric_snapshots`
- `analyst_consensus_snapshots`
- `insider_transactions`
- `company_news`
- `stock_highlights_daily`

These tables map 1:1 to page sections and support range queries and latest-snapshot queries.

## Backend Adjustments Implemented

Added a new details endpoint:
- `app/api/stocks/[ticker]/details/route.ts`

Added typed payload definitions:
- `types/stock-details.ts`

Added mock adapter for immediate UI integration:
- `lib/mock-stock-details.ts`

This lets frontend integrate now against a stable response contract, then swap provider-backed repository logic without changing page component props.

## Integration Strategy (Recommended)

1. Keep frontend bound to `StockDetailsResponse` only.
2. Add repository layer behind route:
   - `details-from-db`
   - `details-from-provider`
   - `details-hydrator` (fills gaps and normalizes units)
3. Add scheduled jobs:
   - Intraday: quotes + news
   - Daily: scores + peers + highlights + insider rollup
   - Earnings-triggered: fundamentals refresh
4. Add staleness metadata in response:
   - e.g., `meta.sourceCoverage`, `meta.generatedAt`, optional per-block freshness

## Clarifications Needed Before Live Integration

- Which market data vendors are preferred for:
  - Quotes/ohlcv
  - Fundamentals
  - Analyst consensus
  - News
  - Insider transactions
- Should chart be EOD-only or true intraday for `1D`?
- Do we want highlights generated purely by rules first, or allow LLM summarization in v1?
- Required SLA for stale data tolerance (e.g., quote < 5 minutes, news < 15 minutes).
