// @vitest-environment jsdom
import React from "react";
import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  emitMarketQuotesUpdated: vi.fn(),
}));

vi.mock("@/features/watchlist/live/watchlist-live-events", () => ({
  emitMarketQuotesUpdated: mocks.emitMarketQuotesUpdated,
}));

import { useWatchlistRealtimeMock } from "@/features/watchlist/hooks/useWatchlistRealtimeMock";

describe("useWatchlistRealtimeMock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("emits quote updates on an interval when enabled", () => {
    renderHook(() => useWatchlistRealtimeMock({ symbols: ["AAPL", "MSFT"], enabled: true, intervalMs: 50 }));

    vi.advanceTimersByTime(60);
    expect(mocks.emitMarketQuotesUpdated).toHaveBeenCalledTimes(1);
  });

  it("does not emit when disabled", () => {
    renderHook(() => useWatchlistRealtimeMock({ symbols: ["AAPL"], enabled: false, intervalMs: 50 }));

    vi.advanceTimersByTime(120);
    expect(mocks.emitMarketQuotesUpdated).not.toHaveBeenCalled();
  });
});
