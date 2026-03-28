// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/home", () => ({ HomeDashboard: () => <div>home-dashboard</div> }));
vi.mock("@/features/stocks", () => ({
  SearchResultsPage: ({ initialQuery }: { initialQuery: string }) => <div>search:{initialQuery}</div>,
  StockDetailsPage: ({ ticker }: { ticker: string }) => <div>stock:{ticker}</div>,
  TopStocksView: () => <div>top-stocks</div>,
}));
vi.mock("@/features/watchlist", () => ({ WatchlistPage: () => <div>watchlist-page</div> }));
vi.mock("@/features/settings", () => ({ SettingsPage: () => <div>settings-page</div> }));

import HomePage from "@/app/page";
import DashboardPage from "@/app/dashboard/page";
import SearchPage from "@/app/search/page";
import StockTickerPage from "@/app/stocks/[ticker]/page";
import TopStocksPage from "@/app/top-stocks/page";
import WatchlistRoutePage from "@/app/watchlist/page";
import SettingsRoutePage from "@/app/settings/page";
import RootLayout from "@/app/layout";
import { Providers } from "@/app/Providers";

describe("app pages", () => {
  it("renders simple route pages", async () => {
    render(<HomePage />);
    render(<DashboardPage />);
    render(<TopStocksPage />);
    const watchlist = await WatchlistRoutePage({});
    render(watchlist);
    render(<SettingsRoutePage />);
    expect(screen.getAllByText(/home-dashboard|top-stocks|watchlist-page|settings-page/).length).toBeGreaterThan(0);
  });

  it("search page decodes query and handles malformed query", async () => {
    const decoded = await SearchPage({ searchParams: Promise.resolve({ q: "AAPL%20INC" }) });
    render(decoded);
    expect(screen.getByText("search:AAPL INC")).toBeInTheDocument();

    const malformed = await SearchPage({ searchParams: Promise.resolve({ q: "%" }) });
    render(malformed);
    expect(screen.getByText("search:%")).toBeInTheDocument();

    const missing = await SearchPage({ searchParams: Promise.resolve({}) });
    render(missing);
    expect(screen.getByText("search:")).toBeInTheDocument();
  });

  it("stock page normalizes ticker and handles malformed encoding", async () => {
    const decoded = await StockTickerPage({ params: Promise.resolve({ ticker: "brk.b" }) });
    render(decoded);
    expect(screen.getByText("stock:BRK.B")).toBeInTheDocument();

    const malformed = await StockTickerPage({ params: Promise.resolve({ ticker: "%" }) });
    render(malformed);
    expect(screen.getByText("stock:%")).toBeInTheDocument();
  });

  it("renders layout + providers", () => {
    const tree = RootLayout({ children: <div>child</div> });
    render(tree as React.ReactElement);
    expect(screen.getByText("child")).toBeInTheDocument();

    render(<Providers><div>inside-provider</div></Providers>);
    expect(screen.getByText("inside-provider")).toBeInTheDocument();
  });
});
