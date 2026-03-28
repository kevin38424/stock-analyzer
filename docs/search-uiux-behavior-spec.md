# Search UI/UX Behavior Spec

## Scope
This spec defines expected behavior for the Search experience without changing the established visual design.

Primary surfaces:
- Sidebar + top navbar search
- Search results list
- Trending sector panel
- Category panel
- Score legend

## 1) Navigation and Query State
- Sidebar `Search` navigates to `/search`.
- Navbar search submit always navigates to `/search`.
- Query is URL-driven via `q`.
- Search state supports URL params:
  - `category` (`all|stocks|etfs|options`)
  - `limit` (`1..100`)
  - `includeTrending` (`true|false`)
- Submitting a new query from the topbar preserves current search-state params.

## 2) Search Execution Behavior
- Empty query:
  - Show instructional empty-state message.
  - No results rendered.
- Non-empty query:
  - Trigger search data fetch through `useSearchResults`.
  - Show loading row while in-flight.
  - Show error banner if request fails.
  - Show explicit no-results row when request succeeds with no matches.

## 3) Result Ranking and Data Semantics
- Sorting label is `Relevance`.
- Relevance prioritizes:
  1. exact ticker match
  2. ticker prefix
  3. name prefix
  4. ticker/name contains
  5. industry/sector contains
  6. score tie-break

## 4) Category Panel Behavior
- Category counts are **global for the query** (independent of selected filter).
- Selecting a category filters visible results only.
- Header total reflects current visible result set after category filter.
- Active category is reflected via URL and visual highlight.

## 5) Trending Sector Panel
- When `includeTrending=true`, show latest sector snapshot from daily data.
- When disabled, show neutral placeholder.
- Trending panel does not alter list ranking/filter logic.

## 6) Accessibility + Interaction
- Category items are links (keyboard and screen-reader accessible).
- Result rows remain link-first for discoverability:
  - company/ticker links to stock details
- Loading/error states use semantic text and preserve page layout stability.

## 7) Data Architecture Alignment
- Route remains a thin adapter:
  - `src/app/api/search/route.ts`
- Server live data logic:
  - `src/server/search/get-search-results-live.ts`
  - Falls back to mock search when DB/env is unavailable.
- Search read model:
  - `v_search_cards_latest` in `supabase/schema.sql`

## 8) Test Coverage Expectations
- Route tests for parse/fallback/success.
- Service tests for:
  - fallback path
  - live row mapping
  - global category counts + selected filter interaction
- Hook tests for query key and param forwarding.
