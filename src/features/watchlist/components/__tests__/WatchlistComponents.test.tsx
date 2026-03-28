// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/shared", () => ({
  AppSidebar: () => <div>sidebar</div>,
  AppTopbar: () => <div>topbar</div>,
  WatchlistTableSkeleton: () => <div>watchlist-table-skeleton</div>,
  appLayoutClasses: { page: "p", shell: "s", content: "c" },
  appTypographyClasses: {
    eyebrow: "eyebrow",
    pageSubtitle: "pageSubtitle",
    sectionTitle: "sectionTitle",
    pageTitle: "pageTitle",
  },
}));
vi.mock("@/features/watchlist/hooks/useWatchlistPage", () => ({
  useWatchlistPage: () => ({
    data: {
      summary: { title: "My Watchlist", subtitle: "s", generatedAt: "now" },
      kpis: {
        averageScore: { label: "AVG SCORE", value: "80.0", detail: undefined },
        topPick: { label: "TOP PICK", value: "AAA", detail: "99" },
        bigUpgrade: { label: "BIG UPGRADE", value: "BBB", detail: "+3" },
        atRisk: { label: "AT RISK", value: "CCC", detail: "55" },
      },
      filters: {
        segments: [
          { id: "all_holdings", label: "All Holdings" },
          { id: "tech_growth", label: "Tech Growth" },
        ],
        selectedSegment: "all_holdings",
        sortBy: "score_desc",
      },
      rows: [
        {
          ticker: "AAA",
          companyName: "AAA Co",
          sector: "Tech",
          segment: "all_holdings",
          score: 80,
          deltaScore: 2,
          price: 10,
          changePercent: 1,
          recommendation: "WATCH",
          thesis: "t",
        },
        {
          ticker: "BBB",
          companyName: "BBB Co",
          sector: "Tech",
          segment: "all_holdings",
          score: 70,
          deltaScore: -1,
          price: 8,
          changePercent: -1,
          recommendation: "HOLD",
          thesis: "t",
        },
        {
          ticker: "CCC",
          companyName: "CCC Co",
          sector: "Tech",
          segment: "all_holdings",
          score: 50,
          deltaScore: 0,
          price: 5,
          changePercent: 0,
          recommendation: "STRONG BUY",
          thesis: "t",
        },
        {
          ticker: "DDD",
          companyName: "DDD Co",
          sector: "Tech",
          segment: "all_holdings",
          score: 65,
          deltaScore: 1,
          price: 12,
          changePercent: 3,
          recommendation: "BUY",
          thesis: "t",
        },
        {
          ticker: "EEE",
          companyName: "EEE Co",
          sector: "Tech",
          segment: "all_holdings",
          score: 30,
          deltaScore: -5,
          price: 2,
          changePercent: -4,
          recommendation: "AVOID",
          thesis: "t",
        },
      ],
      totalTracked: 5,
    },
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}));
vi.mock("@/features/watchlist/hooks/useFavoriteList", () => ({
  useFavoriteList: () => ({
    favorites: [
      { ticker: "GOOGL", score: 80.22 },
      { ticker: "MSFT", score: 72.34 },
    ],
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => "/watchlist",
}));

import { FavoriteList } from "@/features/watchlist/components/FavoriteList";
import { WatchlistPage } from "@/features/watchlist/components/WatchlistPage";

describe("watchlist components", () => {
  it("renders favorites list", () => {
    render(<FavoriteList />);
    expect(screen.getByText("Favorites")).toBeInTheDocument();
    expect(screen.getByText(/GOOGL/)).toBeInTheDocument();
  });

  it("renders watchlist dashboard", () => {
    render(<WatchlistPage />);
    expect(screen.getByText(/My Watchlist/)).toBeInTheDocument();
    expect(screen.getByText(/SORT BY/i)).toBeInTheDocument();
    expect(screen.getByText("BUY")).toBeInTheDocument();
    expect(screen.getByText("HOLD")).toBeInTheDocument();
  });
});
