// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/shared", () => ({
  AppSidebar: () => <div>sidebar</div>,
  AppTopbar: () => <div>topbar</div>,
  SearchResultsSkeleton: () => <div>search-results-skeleton</div>,
  StockDetailsSkeleton: () => <div>stock-details-skeleton</div>,
  TopStocksSkeleton: () => <div>top-stocks-skeleton</div>,
  appLayoutClasses: { page: "p", shell: "s", content: "c", panel: "panel" },
  appTypographyClasses: {
    eyebrow: "eyebrow",
    pageSubtitle: "pageSubtitle",
    sectionTitle: "sectionTitle",
    pageTitle: "pageTitle",
  },
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => "/top-stocks",
  useSearchParams: () => new URLSearchParams("range=1M"),
}));

const mocks = vi.hoisted(() => ({
  useSearchResults: vi.fn(),
  useTopStocksPage: vi.fn(),
  useStockDetails: vi.fn(),
  useStockWatchlistStatus: vi.fn(),
  useStockWatchlistActions: vi.fn(),
  useTopStocksRowActions: vi.fn(),
}));
vi.mock("@/features/stocks/hooks/useSearchResults", () => ({ useSearchResults: mocks.useSearchResults }));
vi.mock("@/features/stocks/hooks/useTopStocksPage", () => ({ useTopStocksPage: mocks.useTopStocksPage }));
vi.mock("@/features/stocks/hooks/useStockDetails", () => ({ useStockDetails: mocks.useStockDetails }));
vi.mock("@/features/stocks/hooks/useStockWatchlistStatus", () => ({ useStockWatchlistStatus: mocks.useStockWatchlistStatus }));
vi.mock("@/features/stocks/hooks/useStockWatchlistActions", () => ({ useStockWatchlistActions: mocks.useStockWatchlistActions }));
vi.mock("@/features/stocks/hooks/useTopStocksRowActions", () => ({ useTopStocksRowActions: mocks.useTopStocksRowActions }));

import { ScoreBreakdown } from "@/features/stocks/components/ScoreBreakdown";
import { SearchResultsPage } from "@/features/stocks/components/SearchResultsPage";
import { StockDetailsPage } from "@/features/stocks/components/StockDetailsPage";
import { TopStockTable } from "@/features/stocks/components/TopStockTable";
import { TopStocksView } from "@/features/stocks/components/TopStocksView";

describe("stock components", () => {
  beforeEach(() => {
    mocks.useSearchResults.mockReturnValue({
      data: {
        query: "",
        total: 0,
        sortedBy: "Relevance",
        categories: [],
        trendingSector: { name: "Tech", changeToday: "+1%", note: "n" },
        results: [],
      },
      isLoading: false,
      isFetching: false,
      isError: false,
    });
    mocks.useTopStocksPage.mockReturnValue({
      data: {
        summary: {
          title: "Top Stocks",
          subtitle: "sub",
          asOfDate: "2026-03-28",
          generatedAt: "2026-03-28T12:00:00.000Z",
          totalUniverseCount: 500,
          filteredCount: 1,
        },
        filterMetadata: {
          sectors: ["all", "Technology"],
          valuationStyles: ["growth", "value", "income"],
          scoreRange: { min: 0, max: 100 },
        },
        algorithmNote: "note",
        featured: {
          rank: 1,
          ticker: "NVDA",
          companyName: "Nvidia Corp.",
          sector: "Technology",
          industry: "Semiconductors",
          score: 98,
          recommendation: "STRONG BUY",
          price: 100,
          changePercent: 1,
          whyItRanks: "why",
          factors: { fundamentals: 1, momentum: 2, sentiment: 3, valueScore: 4 },
        },
        rows: [
          {
            rank: 2,
            ticker: "MSFT",
            companyName: "Microsoft Corp.",
            sector: "Technology",
            industry: "Software",
            score: 94,
            recommendation: "BUY",
            price: 50,
            changePercent: 0.5,
            isFavorite: false,
          },
        ],
        page: { limit: 50, offset: 0, nextOffset: null, hasMore: false },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    mocks.useStockDetails.mockImplementation(() => ({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    }));
    mocks.useStockWatchlistStatus.mockReturnValue({
      data: { isInWatchlist: false, watchlistCount: 0 },
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    mocks.useStockWatchlistActions.mockReturnValue({
      addToWatchlist: vi.fn(),
      removeFromWatchlist: vi.fn(),
      isAdding: false,
      isRemoving: false,
      addError: null,
      removeError: null,
    });
    mocks.useTopStocksRowActions.mockReturnValue({
      getRowFavorite: (row: { isFavorite: boolean }) => row.isFavorite,
      isPending: () => false,
      toggleFavorite: vi.fn(),
      activeMenuTicker: null,
      toggleRowMenu: vi.fn(),
      closeRowMenu: vi.fn(),
      copyTicker: vi.fn(),
      feedbackMessage: null,
      clearFeedback: vi.fn(),
    });
  });

  it("renders score breakdown", () => {
    render(
      <ScoreBreakdown
        scores={{ valuation: 1, profitability: 2, growth: 3, financialHealth: 4, momentum: 5, sentiment: 6 }}
      />,
    );
    expect(screen.getByText("Score breakdown")).toBeInTheDocument();
  });

  it("renders search results page for empty and populated query", () => {
    mocks.useSearchResults
      .mockReturnValueOnce({
        data: {
          query: "",
          total: 0,
          sortedBy: "Relevance",
          categories: [{ key: "all", label: "All", count: 0 }],
          trendingSector: { name: "Tech", changeToday: "+1%", note: "n" },
          results: [],
        },
        isLoading: false,
        isFetching: false,
        isError: false,
      })
      .mockReturnValueOnce({
        data: {
          query: "abc",
          total: 4,
          sortedBy: "Relevance",
          categories: [
            { key: "all", label: "All", count: 4 },
            { key: "stocks", label: "Stocks", count: 3 },
          ],
          trendingSector: { name: "Tech", changeToday: "+1%", note: "n" },
          results: [
            { ticker: "AAA", name: "A", sector: "Tech", industry: "i", exchange: "x", assetType: "stock", marketCapLabel: "$1", score: 90, sentiment: "BULLISH" },
            { ticker: "BBB", name: "B", sector: "Tech", industry: "i", exchange: "x", assetType: "stock", marketCapLabel: "$1", score: 70, sentiment: "STRONG" },
            { ticker: "CCC", name: "C", sector: "Tech", industry: "i", exchange: "x", assetType: "stock", marketCapLabel: "$1", score: 50, sentiment: "NEUTRAL" },
            { ticker: "DDD", name: "D", sector: "Tech", industry: "i", exchange: "x", assetType: "stock", marketCapLabel: "$1", score: 20, sentiment: "BEARISH" },
          ],
        },
        isLoading: false,
        isFetching: false,
        isError: false,
      });
    render(<SearchResultsPage initialQuery="" />);
    expect(screen.getByText(/Search Market Instruments/)).toBeInTheDocument();

    render(<SearchResultsPage initialQuery="abc" />);
    expect(screen.getByText(/Results for/)).toBeInTheDocument();
    expect(screen.getAllByRole("article").length).toBeGreaterThan(0);
  });

  it("renders top stocks and stock details variants", () => {
    const queryClient = new QueryClient();
    render(<TopStockTable />);
    expect(screen.getByText(/Great stocks to buy/)).toBeInTheDocument();

    render(<TopStocksView />);
    expect(screen.getByText("Top Stocks")).toBeInTheDocument();

    render(
      <QueryClientProvider client={queryClient}>
        <StockDetailsPage ticker="AAPL" />
      </QueryClientProvider>,
    );
    expect(screen.getAllByText(/Apple Inc\./).length).toBeGreaterThan(0);

    render(
      <QueryClientProvider client={queryClient}>
        <StockDetailsPage ticker="UNKNOWN" />
      </QueryClientProvider>,
    );
    expect(screen.getByText(/UNKNOWN Corp\./)).toBeInTheDocument();
  });
});
