import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createTradierProvider: vi.fn(),
}));

vi.mock("@/server/market-data/providers/tradier-provider", () => ({
  createTradierProvider: mocks.createTradierProvider,
}));

import { getMarketDataProvider, getQuoteFreshnessSeconds } from "@/server/market-data/provider-registry";

describe("provider-registry", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("returns null when provider is not configured", () => {
    vi.stubEnv("MARKET_DATA_PROVIDER", "none");
    vi.stubEnv("TRADIER_API_TOKEN", "token");

    expect(getMarketDataProvider()).toBeNull();
    expect(mocks.createTradierProvider).not.toHaveBeenCalled();
  });

  it("returns null when tradier is configured without token", () => {
    vi.stubEnv("MARKET_DATA_PROVIDER", "tradier");
    vi.stubEnv("TRADIER_API_TOKEN", "");

    expect(getMarketDataProvider()).toBeNull();
    expect(mocks.createTradierProvider).not.toHaveBeenCalled();
  });

  it("creates tradier provider when configured", () => {
    vi.stubEnv("MARKET_DATA_PROVIDER", "Tradier");
    vi.stubEnv("TRADIER_API_TOKEN", "abc123");
    vi.stubEnv("TRADIER_BASE_URL", "https://example.test/v1");

    const provider = { name: "tradier", fetchQuotes: vi.fn() };
    mocks.createTradierProvider.mockReturnValue(provider);

    expect(getMarketDataProvider()).toBe(provider);
    expect(mocks.createTradierProvider).toHaveBeenCalledWith("abc123", "https://example.test/v1");
  });

  it("uses sane quote freshness defaults and clamps values", () => {
    vi.stubEnv("MARKET_DATA_MAX_QUOTE_AGE_SECONDS", "not-a-number");
    expect(getQuoteFreshnessSeconds()).toBe(60);

    vi.stubEnv("MARKET_DATA_MAX_QUOTE_AGE_SECONDS", "-1");
    expect(getQuoteFreshnessSeconds()).toBe(60);

    vi.stubEnv("MARKET_DATA_MAX_QUOTE_AGE_SECONDS", "310");
    expect(getQuoteFreshnessSeconds()).toBe(300);

    vi.stubEnv("MARKET_DATA_MAX_QUOTE_AGE_SECONDS", "59.9");
    expect(getQuoteFreshnessSeconds()).toBe(59);
  });
});
