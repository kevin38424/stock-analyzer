// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/shared", () => ({
  AppSidebar: () => <div>sidebar</div>,
  AppTopbar: () => <div>topbar</div>,
  appLayoutClasses: { page: "p", shell: "s", content: "c" },
  appTypographyClasses: {
    eyebrow: "eyebrow",
    pageSubtitle: "pageSubtitle",
    sectionTitle: "sectionTitle",
    pageTitle: "pageTitle",
  },
}));

const mocks = vi.hoisted(() => ({
  useHomeDashboard: vi.fn(),
}));

vi.mock("@/features/home/hooks/useHomeDashboard", () => ({
  useHomeDashboard: mocks.useHomeDashboard,
}));

import { HomeDashboard } from "@/features/home/components/HomeDashboard";

const baseHookValue = {
  data: {
    generatedAt: "2026-03-28T00:00:00.000Z",
    kpis: {
      stocksAnalyzed: 8492,
      stocksAnalyzedDelta: 12,
      strongBuys: 142,
      strongBuysPercent: 1.6,
      averageScore: 64.8,
      mostImprovedTicker: "NVDA",
      mostImprovedDeltaScore: 14,
      watchlistAlerts: 3,
    },
    topStocks: [
      {
        rank: 1,
        ticker: "AAPL",
        companyName: "Apple Inc.",
        sector: "Technology",
        score: 98,
        recommendation: "Strong Buy",
        price: 189.44,
        changePercent: 0.84,
      },
    ],
    watchlistPreview: [
      {
        ticker: "TSLA",
        companyName: "Tesla, Inc.",
        score: 82,
        signal: "Watch",
        price: 168.3,
        changePercent: -1.84,
      },
    ],
    sectorPerformance: [{ sector: "Technology", changePercent: 2.4 }],
    scoreDistribution: [{ binStart: 0, binEnd: 9, count: 4 }],
    insight: { title: "PRO INSIGHT", message: "Insight text" },
  },
  isLoading: false,
  isFetching: false,
  isError: false,
  error: null,
};

describe("HomeDashboard", () => {
  function renderWithQueryClient(ui: React.ReactNode) {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useHomeDashboard.mockReturnValue(baseHookValue);
  });

  afterEach(() => {
    cleanup();
  });

  it("renders API-backed dashboard sections", () => {
    renderWithQueryClient(<HomeDashboard />);
    expect(screen.getByText(/MARKET INTELLIGENCE/)).toBeInTheDocument();
    expect(screen.getByText(/Top Stocks to Buy/)).toBeInTheDocument();
    expect(screen.getByText(/Watchlist Preview/)).toBeInTheDocument();
    expect(screen.getByText("8,492")).toBeInTheDocument();
    expect(screen.getByText("Apple Inc.")).toBeInTheDocument();
    expect(screen.getByText("Tesla, Inc.")).toBeInTheDocument();
  });

  it("renders loading skeletons when api data is unavailable", () => {
    mocks.useHomeDashboard.mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      isFetching: true,
      isError: false,
      error: null,
    });

    renderWithQueryClient(<HomeDashboard />);
    expect(screen.getByText("Stocks analyzed")).toBeInTheDocument();
    expect(screen.getByText("Top Stocks to Buy")).toBeInTheDocument();
    expect(screen.getByText("Watchlist Preview")).toBeInTheDocument();
  });

  it("opens and closes add watchlist modal from watchlist plus button", () => {
    renderWithQueryClient(<HomeDashboard />);

    fireEvent.click(screen.getByRole("button", { name: "Add stock to watchlist" }));
    expect(screen.getByText("Add Stock To Watchlist")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close add stock modal" }));
    expect(screen.queryByText("Add Stock To Watchlist")).not.toBeInTheDocument();
  });
});
